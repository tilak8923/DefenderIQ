

export const getPythonCollectorScript = (userId: string | null, origin: string) => `
import requests
import time
import os
import platform

# --- Configuration ---
# Your unique User ID for the TSIEM application.
# This is automatically set for you when you are logged in.
USER_ID = "${userId || 'YOUR_USER_ID'}" 

# The secret API key for the ingestion endpoint.
# This is pre-filled for you. Keep it safe.
API_KEY = "a-super-secret-and-unique-key-for-ingestion"

# The URL of your TSIEM application's ingestion API.
API_ENDPOINT = "${origin}/api/ingest"

def get_default_log_path():
    """Returns a default log file path based on the operating system."""
    system = platform.system()
    if system == "Linux":
        # Common log file for Debian/Ubuntu based systems.
        # You might also use /var/log/auth.log or other specific logs.
        print("Detected Linux OS. Defaulting to /var/log/syslog")
        return "/var/log/syslog"
    elif system == "Darwin": # macOS
        print("Detected macOS. Defaulting to /var/log/system.log")
        return "/var/log/system.log"
    elif system == "Windows":
        print("Detected Windows OS. NOTE: Windows uses Event Viewer, not flat log files by default.")
        print("Please update LOG_FILE_PATH to your specific application's log file.")
        # Example: "C:\\\\Program Files\\\\MyApplication\\\\logs\\\\app.log"
        return "C:\\\\path\\\\to\\\\your\\\\application.log"
    else:
        print(f"Unrecognized OS: {system}. Please set LOG_FILE_PATH manually.")
        return "/path/to/your/log/file.log"

# The path to the log file you want to monitor.
# The script attempts to set a reasonable default based on your OS.
# !!! IMPORTANT !!! You may need to change this to the specific log file you want to monitor.
LOG_FILE_PATH = get_default_log_path()

# How often to check for new log entries (in seconds).
POLL_INTERVAL = 10 

def send_logs(log_lines):
    """Sends a batch of log lines to the ingestion API."""
    if not log_lines:
        return
        
    print(f"Sending {len(log_lines)} log entries for user {USER_ID}...")
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
    """Monitors a log file for new lines."""
    print(f"Starting to monitor log file: {file_path}")
    
    try:
        with open(file_path, 'r') as file:
            # Go to the end of the file
            file.seek(0, os.SEEK_END)
            
            while True:
                new_lines = file.readlines()
                if new_lines:
                    # Strip whitespace and filter out empty lines
                    cleaned_lines = [line.strip() for line in new_lines if line.strip()]
                    send_logs(cleaned_lines)
                
                time.sleep(POLL_INTERVAL)
                
    except FileNotFoundError:
        print(f"Error: The log file was not found at: {file_path}")
        print("Please verify the LOG_FILE_PATH variable in the script is correct.")
    except PermissionError:
        print(f"Error: Permission denied to read the file: {file_path}")
        print("Please run the script with sufficient privileges (e.g., using 'sudo').")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


if __name__ == "__main__":
    if not USER_ID or USER_ID == "YOUR_USER_ID":
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("!!! CRITICAL: Could not determine User ID. Please log in to the app and !!!")
        print("!!!           copy the script again.                                   !!!")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    elif not API_KEY or API_KEY == "YOUR_API_KEY":
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("!!! CRITICAL: API Key not found. Check your .env file in the project.  !!!")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    elif "path/to/your" in LOG_FILE_PATH:
         print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
         print("!!! ACTION NEEDED: Please update the LOG_FILE_PATH variable in this    !!!")
         print("!!!                  script to point to the correct log file.          !!!")
         print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    else:
        follow_log_file(LOG_FILE_PATH)
`;
