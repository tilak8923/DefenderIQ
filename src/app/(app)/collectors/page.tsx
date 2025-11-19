
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
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getPythonCollectorScript } from '@/lib/collector-script';


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

    const fullScript = getPythonCollectorScript(userId, origin);

    const handleCopy = () => {
        if (!userId) {
            toast({
                variant: 'destructive',
                title: 'User ID Not Found',
                description: 'Please wait until your user information is loaded before copying.',
            });
            return;
        }
        navigator.clipboard.writeText(fullScript);
        toast({
            title: 'Copied to Clipboard',
            description: 'The Python collector script is ready to be used.',
        });
    };
    
    return (
        <div className="flex flex-col gap-4">
            <header>
                <h1 className="text-2xl font-bold tracking-wider">Log Collectors</h1>
                <p className="text-muted-foreground">
                    Deploy agents to stream log data from any system into your TSIEM dashboard.
                </p>
            </header>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Python Collector Agent</CardTitle>
                            <CardDescription>
                                Monitor a log file and securely stream new entries to the ingestion API.
                            </CardDescription>
                        </div>
                         <Button onClick={handleCopy} disabled={!userId}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Script
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">How to Use:</h3>
                        <ol className="list-decimal list-inside text-muted-foreground space-y-2 text-sm">
                            <li>
                                **Copy the Script:** Click the "Copy Script" button above. Your personal User ID and API endpoint are already included.
                            </li>
                            <li>
                                **Save the File:** Save the copied code as a Python file (e.g., `collector.py`) on the server or machine you wish to monitor.
                            </li>
                            <li>
                                **Update Log Path (if needed):** The script automatically tries to find a common system log file. If your logs are elsewhere, simply change the `LOG_FILE_PATH` variable inside the script.
                            </li>
                            <li>
                                **Run the Agent:** Execute the script from your terminal. You may need `sudo` for protected system logs.
                                <pre className="p-2 mt-2 bg-muted/50 rounded-md font-mono text-xs">sudo python collector.py</pre>
                            </li>
                            <li>
                                **View Your Data:** New log entries will now appear in real-time on the 'Logs' page.
                            </li>
                        </ol>
                    </div>

                     <div className="bg-muted/50 rounded-lg relative group">
                         <pre className="p-4 overflow-x-auto text-sm font-mono">
                            <code className={!userId ? 'blur-sm' : ''}>
                                {fullScript}
                            </code>
                        </pre>
                        {!userId && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-foreground font-semibold bg-background/80 px-4 py-2 rounded-md">Waiting for User ID...</p>
                            </div>
                        )}
                     </div>
                </CardContent>
            </Card>
        </div>
    );
}
