
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
    const [apiKey, setApiKey] = useState('YOUR_API_KEY'); // Default/loading state

    useEffect(() => {
        // This ensures the origin is only read on the client-side
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
        // In a real app, you might fetch this key, but here we'll just use a placeholder
        // that will be filled by getPythonCollectorScript. The actual key is in .env.
        setApiKey(process.env.NEXT_PUBLIC_LOG_INGESTION_API_KEY || 'a-super-secret-and-unique-key-for-ingestion');

    }, []);

    const fullScript = getPythonCollectorScript(userId, origin);

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
