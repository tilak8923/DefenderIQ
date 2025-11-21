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
import { Loader2, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useUserId } from '@/hooks/use-user-id';

// Simplified non-AI analysis output
interface AnalysisOutput {
  logsScanned: number;
  rulesEvaluated: number;
  alertsCreated: number;
}

// Simplified non-AI analysis function
const runLocalAnalysis = async (userId: string): Promise<AnalysisOutput> => {
    // Simulate fetching logs and rules
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a static result
    return {
        logsScanned: 150,
        rulesEvaluated: 4,
        alertsCreated: 2,
    };
};

export default function AnalysisPage() {
  const [output, setOutput] = useState<AnalysisOutput | null>(null);
  const [running, setRunning] = useState(false);
  const { toast } = useToast();
  const userId = useUserId();

  const handleRunAnalysis = async () => {
    if (!userId) {
        toast({
            variant: 'destructive',
            title: "Authentication Error",
            description: "Could not identify user. Please log in again.",
        });
        return;
    }
    setRunning(true);
    setOutput(null);

    try {
        const result = await runLocalAnalysis(userId);
        setOutput(result);
        if (result.alertsCreated > 0) {
          toast({
              title: "Analysis Complete",
              description: `${result.alertsCreated} new alert(s) have been generated. Check the dashboard.`,
          });
        } else {
           toast({
              title: "Analysis Complete",
              description: `No new threats detected this time.`,
          });
        }
    } catch (error) {
        console.error("Error running analysis:", error);
        toast({
            variant: 'destructive',
            title: "Analysis Failed",
            description: "An unexpected error occurred during the analysis.",
        });
    }

    setRunning(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-bold tracking-wider">Detection Engine</h1>
        <p className="text-muted-foreground">
          Manually trigger the log analysis and alert generation engine.
        </p>
      </header>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Run Log Analysis</CardTitle>
            <CardDescription>
              This process will scan all logs against the enabled alert rules. If any conditions are met, new alerts will be generated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              In a real-world scenario, this would run automatically in the background. For this demo, you can trigger it manually.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRunAnalysis} disabled={running || !userId}>
              {running ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Start Analysis
            </Button>
          </CardFooter>
        </Card>
        <Card className="min-h-[200px]">
           <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>The outcome of the analysis will be shown here.</CardDescription>
           </CardHeader>
           <CardContent>
                {running && (
                    <div className="flex items-center justify-center h-full">
                        <p>Analyzing logs...</p>
                    </div>
                )}
                {output && (
                    <Alert>
                        <AlertTitle>Analysis Complete</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li>Logs Scanned: {output.logsScanned}</li>
                                <li>Rules Evaluated: {output.rulesEvaluated}</li>
                                <li>
                                    <span className="font-bold">New Alerts Created: {output.alertsCreated}</span>
                                </li>
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}
                {!running && !output && (
                    <div className="flex flex-col gap-2 items-center justify-center h-full">
                        <Zap className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Ready to run analysis.</p>
                    </div>
                )}
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
