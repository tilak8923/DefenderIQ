
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUserId } from '@/hooks/use-user-id';
import { Code, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';


const pythonScript = (userId: string | null, origin: string) => `
import requests
import time
import os
import platform

# --- Configuration ---
# Your unique User ID for the TSIEM application.
# This is automatically set for you when you are logged in.
USER_ID = "${userId || 'YOUR_USER_ID'}" 

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
        # Example: "C:\\Program Files\\MyApplication\\logs\\app.log"
        return "C:\\path\\to\\your\\application.log"
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
        headers = {"Content-Type": "application/json"}
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
    elif "path/to/your" in LOG_FILE_PATH:
         print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
         print("!!! ACTION NEEDED: Please update the LOG_FILE_PATH variable in this    !!!")
         print("!!!                  script to point to the correct log file.          !!!")
         print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    else:
        follow_log_file(LOG_FILE_PATH)
`;

export default function CollectorsPage() {
    const userId = useUserId();
    const { toast } = useToast();
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        // This ensures the origin is only read on the client-side
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    const fullScript = pythonScript(userId, origin);

    const handleCopy = () => {
        navigator.clipboard.writeText(fullScript);
        toast({
            title: 'Copied to Clipboard',
            description: 'The Python collector script has been copied.',
        });
    };
    
    return (
        <div className="flex flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-wider">Log Collectors</h1>
                <p className="text-muted-foreground">
                    Use the agent script below to send log data from any system to your TSIEM dashboard.
                </p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Python Collector Agent</CardTitle>
                    <CardDescription>
                        This script monitors a log file on your system and forwards new entries to the ingestion API.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-bold">Instructions:</h3>
                        <ol className="list-decimal list-inside text-muted-foreground space-y-1 mt-2 text-sm">
                            <li>Save the code below as a Python file (e.g., `collector.py`) on the system you wish to monitor.</li>
                            <li>Make sure you have the `requests` library installed (`pip install requests`).</li>
                            <li>The script will try to find a default log file. If it's not correct, update the `LOG_FILE_PATH` variable in the script.</li>
                            <li>Run the script from your terminal: `python collector.py`. You may need `sudo` for system logs (e.g. `sudo python collector.py`).</li>
                            <li>The script will now monitor the file and send new logs to your dashboard automatically.</li>
                        </ol>
                    </div>

                     <div className="bg-muted/50 rounded-lg relative group">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleCopy}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                         <pre className="p-4 overflow-x-auto text-sm font-mono">
                            <code>
                                {fullScript}
                            </code>
                        </pre>
                     </div>
                </CardContent>
            </Card>
        </div>
    );
}
