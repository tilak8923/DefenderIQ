
export const getPythonCollectorScript = (userId: string | null, origin: string) => `
import firebase_admin
from firebase_admin import credentials, firestore
import time
import os
import platform
import subprocess
from pathlib import Path
import xml.etree.ElementTree as ET
import json
from datetime import datetime

# ======================================================================================
# --- Configuration & Setup ---
# ======================================================================================

# --- ACTION REQUIRED: Service Account Key ---
# 1. Go to your Google Cloud Console: https://console.cloud.google.com/
# 2. Navigate to "IAM & Admin" > "Service Accounts".
# 3. Find or create a service account. When creating, assign it the "Cloud Datastore User" role.
# 4. Click the service account, go to the "Keys" tab, and "Add Key" > "Create new key".
# 5. Choose JSON and download the file.
# 6. IMPORTANT: Rename the downloaded file to 'service-account-key.json' and place it in the SAME DIRECTORY as this Python script.
#
# DO NOT RENAME OR EDIT THE CONTENT OF THE JSON FILE.
# ======================================================================================
SERVICE_ACCOUNT_KEY_PATH = "service-account-key.json"

# Your unique User ID for the TSIEM application.
# This is automatically set for you when you are logged in.
USER_ID = "${userId || 'YOUR_USER_ID'}" 

# How often to check for new logs (in seconds).
COLLECTION_INTERVAL = 10

# A file to store the timestamp of the last collected event (for Windows).
LAST_EVENT_TIMESTAMP_FILE = Path.home() / '.tsiem_last_event_time.txt'


# --- Firebase Initialization ---
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Successfully connected to Firestore.")
except FileNotFoundError:
    print(f"CRITICAL ERROR: The service account file was not found at '{SERVICE_ACCOUNT_KEY_PATH}'. Please ensure the file exists and is in the same directory as this script.")
    exit()
except Exception as e:
    print(f"CRITICAL ERROR: Failed to initialize Firebase. Please check your Service Account Key file and its permissions. Details: {e}")
    exit()


def write_logs_to_firestore(log_lines):
    """Writes a batch of log entries to Firestore under the current user's collection."""
    if not log_lines:
        return
        
    print(f"Writing {len(log_lines)} new log entries to Firestore for user {USER_ID}...")
    
    try:
        batch = db.batch()
        logs_collection_ref = db.collection('users', USER_ID, 'logs')
        
        for line in log_lines:
            # For simplicity, we're parsing basic info here. A more robust solution might use a cloud function.
            # This is a placeholder parser.
            parts = line.split()
            timestamp = parts[0] if parts else datetime.now().isoformat()
            source = parts[4] if len(parts) > 4 else 'Unknown'
            severity = 'INFO'
            if 'error' in line.lower() or 'critical' in line.lower():
                severity = 'CRITICAL'
            elif 'warn' in line.lower():
                severity = 'WARN'

            log_entry = {
                'timestamp': timestamp,
                'source': source,
                'message': line,
                'severity': severity,
                'userId': USER_ID # Denormalize for rule validation
            }
            new_log_ref = logs_collection_ref.document()
            batch.set(new_log_ref, log_entry)
            
        batch.commit()
        print(f"Successfully wrote {len(log_lines)} logs to Firestore.")
            
    except Exception as e:
        print(f"Error: Could not write logs to Firestore. Details: {e}")


def follow_linux_log_file(file_path):
    """Monitors a traditional log file for new lines on Linux."""
    print(f"Starting to monitor log file: {file_path}")
    try:
        Path(file_path).touch()
        with open(file_path, 'r') as file:
            file.seek(0, os.SEEK_END)
            while True:
                new_lines = file.readlines()
                if new_lines:
                    cleaned_lines = [line.strip() for line in new_lines if line.strip()]
                    write_logs_to_firestore(cleaned_lines)
                time.sleep(COLLECTION_INTERVAL)
    except FileNotFoundError:
        print(f"Error: The log file was not found at: {file_path}")
    except PermissionError:
        print(f"Error: Permission denied for {file_path}. Please run with 'sudo'.")

def stream_macos_logs():
    """Streams logs directly from macOS's Unified Logging System."""
    print("---")
    print("macOS DETECTED: Tapping into the real-time Unified Logging System.")
    print("This may require administrator privileges.")
    print("---")
    
    process = subprocess.Popen(
        ['log', 'stream', '--style', 'syslog'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    log_batch = []
    last_send_time = time.time()

    try:
        while True:
            line = process.stdout.readline()
            if not line:
                break
            
            cleaned_line = line.strip()
            if cleaned_line:
                log_batch.append(cleaned_line)
            
            current_time = time.time()
            if len(log_batch) >= 100 or (current_time - last_send_time >= COLLECTION_INTERVAL and log_batch):
                write_logs_to_firestore(log_batch)
                log_batch = []
                last_send_time = current_time
    
    except KeyboardInterrupt:
        print("Stopping log collection.")
    finally:
        if log_batch:
            write_logs_to_firestore(log_batch)
        process.terminate()

def stream_windows_logs():
    """Streams logs from the Windows Event Log without needing a file path."""
    print("---")
    print("Windows DETECTED: Tapping into the Windows Event Log.")
    print("This will collect 'Application' and 'System' event logs.")
    print("---")

    def get_last_event_time():
        try:
            return LAST_EVENT_TIMESTAMP_FILE.read_text().strip()
        except FileNotFoundError:
            return None

    def set_last_event_time(timestamp):
        LAST_EVENT_TIMESTAMP_FILE.write_text(timestamp)

    def parse_event_xml(xml_string):
        """Parses event XML and extracts key details."""
        try:
            # The XML from wevtutil is wrapped in <Event> tags but lacks a single root for the whole output
            xml_string = f"<root>{xml_string}</root>"
            root = ET.fromstring(xml_string)
            log_lines = []
            
            for event in root.findall('.//Event'):
                system_info = event.find('{*}System')
                event_data = event.find('{*}EventData')
                
                if system_info is not None:
                    provider = system_info.find('{*}Provider').get('Name', 'N/A')
                    level = system_info.find('{*}Level').text
                    time_created = system_info.find('{*}TimeCreated').get('SystemTime', 'N/A')
                    message = f"Level={level} Provider={provider}"

                    if event_data is not None:
                        data_text = ' '.join(f"{d.get('Name', '')}={d.text}" for d in event_data.findall('{*}Data') if d.text)
                        message += f" Data: {data_text}"
                    
                    full_log = f"{time_created} {message}"
                    log_lines.append(full_log)
            
            return log_lines, root.find('.//Event[last()]/{*}System/{*}TimeCreated').get('SystemTime')
        except Exception:
            # Fallback for non-XML messages
            return [xml_string.strip()], None

    while True:
        try:
            last_timestamp = get_last_event_time()
            query = f"*[System[TimeCreated[@SystemTime > '{last_timestamp}']]]" if last_timestamp else "*"
            
            all_new_logs = []
            latest_timestamp_in_batch = last_timestamp

            for log_name in ["Application", "System"]:
                command = ['wevtutil', 'qe', log_name, '/q:' + query, '/f:xml', '/e:root']
                
                process = subprocess.run(command, capture_output=True, text=True, shell=True)
                
                if process.returncode == 0 and process.stdout:
                    parsed_logs, new_latest_timestamp = parse_event_xml(process.stdout)
                    if parsed_logs:
                        all_new_logs.extend(parsed_logs)
                    if new_latest_timestamp:
                        if not latest_timestamp_in_batch or new_latest_timestamp > latest_timestamp_in_batch:
                            latest_timestamp_in_batch = new_latest_timestamp
                elif process.stderr:
                    print(f"Error querying '{log_name}' log: {process.stderr.strip()}")

            if all_new_logs:
                write_logs_to_firestore(all_new_logs)
            
            if latest_timestamp_in_batch and latest_timestamp_in_batch != last_timestamp:
                set_last_event_time(latest_timestamp_in_batch)

            time.sleep(COLLECTION_INTERVAL)

        except KeyboardInterrupt:
            print("Stopping log collection.")
            break
        except Exception as e:
            print(f"An unexpected error occurred in the Windows log stream: {e}")
            time.sleep(COLLECTION_INTERVAL)


def main():
    """Determines the OS and starts the appropriate log collection method."""
    system = platform.system()
    
    if system == "Linux":
        print("Linux detected. Monitoring /var/log/syslog.")
        print("This may require 'sudo' to access system logs.")
        log_path = "/var/log/syslog"
        follow_linux_log_file(log_path)
    elif system == "Darwin":
        stream_macos_logs()
    elif system == "Windows":
        stream_windows_logs()
    else:
        print(f"Unrecognized OS: {system}. This script supports Linux, macOS, and Windows.")
        print("For this OS, you will need to manually configure a log file path.")
        log_path = "/path/to/your/log/file.log" # Fallback for unsupported OS
        follow_linux_log_file(log_path)

if __name__ == "__main__":
    if not USER_ID or USER_ID == "YOUR_USER_ID":
        print("CRITICAL: User ID not found. Please log in to the web UI and copy the script again.")
    # The check for the key content is removed, as we now check for file existence at initialization.
    else:
        try:
            main()
        except KeyboardInterrupt:
            print("\\nStopping log collection.")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
`
