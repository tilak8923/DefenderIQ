
'use client';

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

# --- Configuration ---
# Your unique User ID for the TSIEM application.
# IMPORTANT: Replace "YOUR_USER_ID" with your actual ID.
USER_ID = "${userId || 'YOUR_USER_ID'}" 

# The URL of your TSIEM application's ingestion API.
# This should be the URL where your app is deployed.
API_ENDPOINT = "${origin}/api/ingest"

# The path to the log file you want to monitor.
# Example for a Linux system: "/var/log/auth.log"
LOG_FILE_PATH = "/path/to/your/log/file.log" 

# How often to check for new log entries (in seconds).
POLL_INTERVAL = 10 

def send_logs(log_lines):
    """Sends a batch of log lines to the ingestion API."""
    if not log_lines:
        return
        
    print(f"Sending {len(log_lines)} log entries to the SIEM...")
    try:
        headers = {"Content-Type": "application/json"}
        payload = {
            "userId": USER_ID,
            "logs": "\\n".join(log_lines)
        }
        response = requests.post(API_ENDPOINT, json=payload, headers=headers)
        
        if response.status_code == 200:
            print("Successfully ingested logs.")
        else:
            print(f"Error: Failed to ingest logs. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Error: Could not connect to the API endpoint. {e}")


def follow_log_file(file_path):
    """Monitors a log file for new lines."""
    print(f"Starting to monitor log file: {file_path}")
    print(f"Sending data for User ID: {USER_ID}")
    
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
        print("Please update the LOG_FILE_PATH variable in the script.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


if __name__ == "__main__":
    if USER_ID == "YOUR_USER_ID":
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("!!! CRITICAL: Please set your USER_ID in the script. !!!")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    else:
        follow_log_file(LOG_FILE_PATH)
`;

export default function CollectorsPage() {
    const userId = useUserId();
    const { toast } = useToast();
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        // This ensures the origin is only read on the client-side
        setOrigin(window.location.origin);
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
                            <li>Update the `LOG_FILE_PATH` variable in the script to point to the log file you want to collect.</li>
                            <li>Run the script from your terminal: `python collector.py`.</li>
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
