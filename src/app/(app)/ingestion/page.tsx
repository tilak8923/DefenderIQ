
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUserId } from '@/hooks/use-user-id';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Loader2, Upload } from 'lucide-react';
import { parseLogEntries } from '@/ai/flows/parse-log-entries';


export default function IngestionPage() {
  const userId = useUserId();
  const firestore = useFirestore();
  const [logInput, setLogInput] = useState('');
  const [running, setRunning] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!userId || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User ID not found. Cannot import logs.',
      });
      return;
    }
    if (!logInput.trim()) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Input cannot be empty.',
        });
        return;
    }

    setRunning(true);
    try {
      const { parsedLogs } = await parseLogEntries({ logText: logInput });
      
      if (!parsedLogs || parsedLogs.length === 0) {
        throw new Error("AI could not parse any valid log entries from the provided text.");
      }

      // Use a batch write for efficiency
      const batch = writeBatch(firestore);
      const logsCollection = collection(firestore, 'users', userId, 'logs');
      
      parsedLogs.forEach(log => {
        const docRef = doc(logsCollection); // Create a new document reference with a unique ID
        batch.set(docRef, log);
      });
      
      await batch.commit();

      toast({
        title: 'Import Successful',
        description: `Successfully imported ${parsedLogs.length} log entries.`,
      });
      setLogInput('');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: error.message || 'The AI failed to parse the logs. Please check the format.',
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold tracking-wider">Log Ingestion</h1>
        <p className="text-muted-foreground">
          Manually import log files by pasting plain text content.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Import Logs</CardTitle>
          <CardDescription>
            Paste log entries from your files or scripts. The AI will parse them into a structured format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <Label htmlFor="log-input">Log Data (Plain Text)</Label>
            <Textarea
                id="log-input"
                className="font-mono min-h-[300px]"
                placeholder={`2025-08-31 07:29:12,991 - WARNING - Unusual high number of requests detected from IP 45.34.22.12.
2025-08-31 07:29:13,333 - INFO - User 'service_account' performed a database query.`}
                value={logInput}
                onChange={(e) => setLogInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
                Each line should be a separate log entry. The AI will attempt to extract the timestamp, severity, and message.
            </p>
        </CardContent>
        <CardFooter>
            <Button onClick={handleImport} disabled={running || !userId}>
                {running ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Upload className="mr-2 h-4 w-4" />
                )}
                {userId ? 'Parse and Import Logs' : 'Initializing...'}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
