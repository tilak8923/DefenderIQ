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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const reportParameters = [
    { id: 'num_alerts', label: 'Number of alerts' },
    { id: 'threat_types', label: 'Types of threats detected' },
    { id: 'vulnerabilities', label: 'System vulnerabilities' },
    { id: 'user_activity', label: 'User activity' },
];

interface ReportInput {
  reportTitle: string;
  dateRange: string;
  selectedParameters: string[];
  additionalNotes?: string;
}

// Simplified non-AI report generation
const generateLocalReport = async (input: ReportInput): Promise<{ reportContent: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time

  let content = `# ${input.reportTitle}\n\n`;
  content += `**Date Range:** ${input.dateRange}\n\n`;
  content += `--- \n\n`;
  content += `### Executive Summary\n`;
  content += `This report summarizes the security posture for the selected period. Key metrics and findings are detailed below.\n\n`;

  if (input.selectedParameters.length > 0) {
    content += `### Detailed Analysis\n`;
    input.selectedParameters.forEach(param => {
      content += `- **${param}:** Analysis for this parameter shows typical activity with no major anomalies to report.\n`;
    });
    content += `\n`;
  }

  if (input.additionalNotes) {
    content += `### Additional Notes\n`;
    content += `${input.additionalNotes}\n\n`;
  }
  
  content += `### Recommendations\n`;
  content += `- Continue routine monitoring.\n- Ensure all systems are up-to-date with the latest security patches.\n`;
  
  return { reportContent: content };
};


export default function ReportsPage() {
  const [reportTitle, setReportTitle] = useState('Weekly Security Summary');
  const [dateRange, setDateRange] = useState('Last 7 days');
  const [selectedParams, setSelectedParams] = useState<string[]>(['num_alerts', 'threat_types']);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [output, setOutput] = useState<{ reportContent: string } | null>(null);
  const [running, setRunning] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunning(true);
    setOutput(null);

    const selectedLabels = selectedParams.map(paramId => {
        return reportParameters.find(p => p.id === paramId)?.label || '';
    }).filter(Boolean);

    try {
        const result = await generateLocalReport({
            reportTitle,
            dateRange,
            selectedParameters: selectedLabels,
            additionalNotes,
        });
        setOutput(result);
    } catch (error) {
        console.error("Error generating report:", error);
        toast({
            variant: "destructive",
            title: "Report Generation Failed",
            description: "Could not generate the security report. Please try again.",
        });
    } finally {
        setRunning(false);
    }
  };

  const handleCheckboxChange = (paramId: string) => {
    setSelectedParams(prev => 
        prev.includes(paramId) ? prev.filter(p => p !== paramId) : [...prev, paramId]
    );
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <h1 className="text-2xl font-bold tracking-wider mb-4">Generate Report</h1>
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Report Parameters</CardTitle>
              <CardDescription>Customize the content of your security report.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-title">Report Title</Label>
                <Input id="report-title" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-range">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger id="date-range">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Last 24 hours">Last 24 hours</SelectItem>
                    <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                    <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                    <SelectItem value="Last 90 days">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Include in Report</Label>
                <div className="space-y-2">
                    {reportParameters.map(param => (
                        <div key={param.id} className="flex items-center space-x-2">
                            <Checkbox id={param.id} checked={selectedParams.includes(param.id)} onCheckedChange={() => handleCheckboxChange(param.id)} />
                            <label htmlFor={param.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {param.label}
                            </label>
                        </div>
                    ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additional-notes">Additional Notes</Label>
                <Textarea id="additional-notes" placeholder="Optional context or comments..." value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={running} className="w-full">
                {running && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <div className="md:col-span-2">
        <h2 className="text-xl font-bold tracking-wider mb-4">Generated Report</h2>
        <Card className="h-full min-h-[500px]">
          <CardContent className="p-6">
            {running && (
              <div className="flex items-center justify-center h-full">
                <p>Generating report...</p>
              </div>
            )}
            {output && (
                <div className="prose prose-invert max-w-none prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground whitespace-pre-wrap font-mono">
                    {output.reportContent}
                </div>
            )}
            {!running && !output && (
                <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Your generated report will appear here.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
