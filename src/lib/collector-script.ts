

export const getPythonCollectorScript = (userId: string | null, origin: string) => `
import requests
import time
import os
import platform
import subprocess

# --- Configuration ---
# Your unique User ID for the TSIEM application.
# This is automatically set for you when you are logged in.
USER_ID = "${userId || 'YOUR_USER_ID'}" 

# The secret API key for the ingestion endpoint.
# This is pre-filled for you. Keep it safe.
API_KEY = "${process.env.NEXT_PUBLIC_LOG_INGESTION_API_KEY || 'a-super-secret-and-unique-key-for-ingestion'}"

# The URL of your TSIEM application's ingestion API.
API_ENDPOINT = "${origin}/api/ingest"

# How often to send batches of logs to the API (in seconds).
BATCH_INTERVAL = 5
# The maximum number of log lines to hold before sending.
BATCH_SIZE = 100

def send_logs(log_lines):
    """Sends a batch of log lines to the ingestion API."""
    if not log_lines:
        return
        
    print(f"Sending {len(log_lines)} new log entries for user {USER_ID}...")
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}"
        }
        payload = {
            "userId": USER_ID,
            "logs": "\\n".join(log_lines)
        }
        response = requests.post(API_ENDPOINT, json=payload, headers=headers)
        
        if response.status_code == 200:
            print(f"Successfully ingested {response.json().get('ingestedCount', 0)} logs.")
        else:
            print(f"Error: Failed to ingest logs. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Error: Could not connect to the API endpoint at {API_ENDPOINT}. {e}")

def follow_log_file(file_path):
    """Monitors a traditional log file for new lines (for Linux)."""
    print(f"Starting to monitor log file: {file_path}")
    try:
        with open(file_path, 'r') as file:
            file.seek(0, os.SEEK_END)
            while True:
                new_lines = file.readlines()
                if new_lines:
                    cleaned_lines = [line.strip() for line in new_lines if line.strip()]
                    send_logs(cleaned_lines)
                time.sleep(BATCH_INTERVAL)
    except FileNotFoundError:
        print(f"Error: The log file was not found at: {file_path}")
    except PermissionError:
        print(f"Error: Permission denied for {file_path}. Please run with 'sudo'.")

def stream_macos_logs():
    """Streams logs directly from macOS's Unified Logging System."""
    print("---")
    print("macOS DETECTED: Tapping into the real-time Unified Logging System.")
    print("This requires administrator privileges.")
    print("If you are not running with 'sudo', the script will likely fail.")
    print("---")
    
    # The 'log stream' command provides real-time logs.
    # '--style syslog' formats them like traditional log files, which is easier to parse.
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
            if len(log_batch) >= BATCH_SIZE or (current_time - last_send_time >= BATCH_INTERVAL and log_batch):
                send_logs(log_batch)
                log_batch = []
                last_send_time = current_time
    
    except KeyboardInterrupt:
        print("Stopping log collection.")
    finally:
        # Send any remaining logs before exiting
        if log_batch:
            send_logs(log_batch)
        process.terminate()

def main():
    """Determines the OS and starts the appropriate log collection method."""
    system = platform.system()
    
    if system == "Linux":
        print("Linux detected. Monitoring /var/log/syslog.")
        print("This requires 'sudo' to access system logs.")
        log_path = "/var/log/syslog"
        follow_log_file(log_path)
    elif system == "Darwin": # macOS
        stream_macos_logs()
    elif system == "Windows":
        print("Windows detected. File-based logging is required.")
        print("Please update the LOG_FILE_PATH variable in the script to point to your application's log file.")
        log_path = "C:\\\\path\\\\to\\\\your\\\\application.log"
        follow_log_file(log_path)
    else:
        print(f"Unrecognized OS: {system}. This script supports Linux and macOS for real-time streaming.")

if __name__ == "__main__":
    if not USER_ID or USER_ID == "YOUR_USER_ID":
        print("CRITICAL: User ID not found. Please log in and copy the script again.")
    elif not API_KEY or API_KEY == "YOUR_API_KEY":
        print("CRITICAL: API Key not found. This is a configuration issue.")
    else:
        try:
            main()
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
