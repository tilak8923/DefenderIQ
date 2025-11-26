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
import { Loader2, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AnalysisInput {
    feedEntry: string;
    knownVulnerabilities: string[];
}

interface AnalysisOutput {
  isThreat: boolean;
  threatSeverity: string;
  reasoning: string;
}

// Simplified non-AI analysis
const analyzeLocalThreatFeed = async (input: AnalysisInput): Promise<AnalysisOutput> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing

    const feed = input.feedEntry.toLowerCase();
    const vulnerabilities = input.knownVulnerabilities.map(v => v.toLowerCase());

    for (const vuln of vulnerabilities) {
        if (feed.includes(vuln.split(' ')[0])) { // Check for CVE or keyword
            return {
                isThreat: true,
                threatSeverity: 'High',
                reasoning: `The feed entry contains a keyword matching the known vulnerability: "${vuln}".`,
            };
        }
    }

    return {
        isThreat: false,
        threatSeverity: 'None',
        reasoning: 'The feed entry does not appear to match any of the provided known vulnerabilities.',
    };
};

export default function ThreatIntelPage() {
    const [feedEntry, setFeedEntry] = useState('{"timestamp": "2023-10-27T10:00:00Z", "source_ip": "198.51.100.42", "event_type": "web_request", "details": "GET /wp-admin/install.php"}');
    const [knownVulnerabilities, setKnownVulnerabilities] = useState('CVE-2023-4512 - WordPress Core Vulnerability\nLog4Shell - Apache Log4j Vulnerability');
    
    const [output, setOutput] = useState<AnalysisOutput | null>(null);
    const [running, setRunning] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setRunning(true);
        setOutput(null);

        const vulnerabilitiesArray = knownVulnerabilities.split('\n').filter(v => v.trim() !== '');
        
        try {
            const result = await analyzeLocalThreatFeed({
                feedEntry,
                knownVulnerabilities: vulnerabilitiesArray,
            });
            setOutput(result);
        } catch (error) {
            console.error("Error analyzing threat feed:", error);
            toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: 'Could not analyze the threat feed entry. Please try again.',
            });
        } finally {
            setRunning(false);
        }
    };
    
    const getResultCard = () => {
        if (running) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p>Analyzing entry...</p>
                </div>
            );
        }

        if (!output) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <ShieldQuestion className="h-8 w-8 mb-4" />
                    <p>Analysis results will be displayed here.</p>
                </div>
            );
        }

        const isThreat = output.isThreat;
        const severity = output.threatSeverity?.toLowerCase();
        
        return (
            <div className="p-6">
                <div className="flex items-start gap-4">
                    {isThreat ? <ShieldAlert className="h-8 w-8 text-destructive" /> : <ShieldCheck className="h-8 w-8 text-primary" />}
                    <div>
                        <h3 className="text-xl font-bold">{isThreat ? "Potential Threat Detected" : "No Threat Detected"}</h3>
                        {isThreat && <Badge variant={severity === 'high' || severity === 'medium' ? 'destructive' : 'default'} className={cn(severity === 'medium' && 'bg-warning text-black')}>{output.threatSeverity}</Badge>}
                    </div>
                </div>
                <div className="mt-4">
                    <h4 className="font-bold">Reasoning:</h4>
                    <p className="text-muted-foreground mt-1 font-mono text-sm">{output.reasoning}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold tracking-wider">Threat Intelligence Analysis</h1>
                <Card>
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle>Analyze Feed Entry</CardTitle>
                            <CardDescription>
                                Input a log or event data to analyze it against known vulnerabilities.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="feed-entry">Threat Feed Entry (JSON)</Label>
                                <Textarea 
                                    id="feed-entry"
                                    value={feedEntry}
                                    onChange={e => setFeedEntry(e.target.value)}
                                    className="font-mono"
                                    rows={5}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vulnerabilities">Known Vulnerabilities (one per line)</Label>
                                <Textarea 
                                    id="vulnerabilities"
                                    value={knownVulnerabilities}
                                    onChange={e => setKnownVulnerabilities(e.target.value)}
                                    className="font-mono"
                                    rows={5}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={running} className="w-full">
                                {running && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Analyze
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
            <div>
                 <h2 className="text-xl font-bold tracking-wider">Analysis Result</h2>
                 <Card className="min-h-[300px]">
                    {getResultCard()}
                 </Card>
            </div>
        </div>
    );
}
