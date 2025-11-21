'use server';
/**
 * @fileOverview A flow that acts as a command-line interpreter for the application.
 * It uses tools to perform actions based on user commands.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generateSecurityReport } from './generate-security-report';
import { recentAlerts } from '@/lib/data';
import { runFlow } from '@genkit-ai/next/client';
import type { GenerateSecurityReportOutput } from './generate-security-report';

// Tool to list recent security alerts
const listAlertsTool = ai.defineTool(
  {
    name: 'listAlerts',
    description: 'Lists recent security alerts. Can filter by severity.',
    inputSchema: z.object({
      severity: z.enum(['Critical', 'High', 'Medium', 'Low']).optional().describe('Filter alerts by severity level.'),
    }),
    outputSchema: z.string().describe('A formatted string of the alerts, suitable for terminal display.'),
  },
  async ({ severity }) => {
    let alerts = recentAlerts;
    if (severity) {
      alerts = alerts.filter(a => a.severity === severity);
    }
    
    if (alerts.length === 0) {
        return "No alerts found with the specified criteria.";
    }

    // Format as a simple table
    const header = "Severity\tStatus  \tDescription\n" + "-".repeat(80);
    const rows = alerts.map(a => `${a.severity.padEnd(10)}\t${a.status.padEnd(8)}\t${a.description}`).join('\n');
    return `${header}\n${rows}`;
  }
);

// Tool to generate a security report
const generateReportTool = ai.defineTool(
  {
    name: 'generateReport',
    description: 'Generates a security report based on provided parameters.',
    inputSchema: z.object({
      title: z.string().describe('The title for the new report.'),
      range: z.enum(['24h', '7d', '30d', '90d']).optional().describe('The date range for the report (e.g., 24h, 7d). Defaults to 7d.'),
    }),
    outputSchema: z.string().describe('The generated security report in Markdown format.'),
  },
  async ({ title, range }) => {
    const dateRangeMap = {
      '24h': 'Last 24 hours',
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 90 days',
    };
    const dateRange = range ? dateRangeMap[range] : 'Last 7 days';

    const report = await runFlow<GenerateSecurityReportOutput>('generateSecurityReportFlow', {
      reportTitle: title,
      dateRange: dateRange,
      selectedParameters: ['Number of alerts', 'Types of threats detected', 'System vulnerabilities'],
    });

    return `Report generated successfully:\n\n---\n${report.reportContent}`;
  }
);

// New Tool to simulate network commands
const runNetworkCommandTool = ai.defineTool(
  {
    name: 'runNetworkCommand',
    description: 'Simulates running a basic network diagnostic command like ping or traceroute and provides a realistic output.',
    inputSchema: z.object({
      command: z.string().describe('The full network command to simulate, e.g., "ping 8.8.8.8" or "traceroute google.com".'),
    }),
    outputSchema: z.string().describe('A realistic, formatted output of the simulated command execution.'),
  },
  async ({ command }) => {
    const { text } = await ai.generate({
      prompt: `You are a network analysis tool acting as a terminal. The user has run the command: "${command}".
Provide a realistic but simulated output for this command.
Do NOT provide any explanation, any introduction, or any summary.
Only generate the raw output as if it were a real terminal executing the command.`,
    });
    return text;
  }
);


const AppCliInputSchema = z.object({
  command: z.string().describe('The command typed by the user in the terminal.'),
});
export type AppCliInput = z.infer<typeof AppCliInputSchema>;

const AppCliOutputSchema = z.object({
  response: z.string().describe('The output from the command execution, formatted for the terminal.'),
});
export type AppCliOutput = z.infer<typeof AppCliOutputSchema>;

// This is just a wrapper, the actual flow is defined below
export async function appCli(input: AppCliInput): Promise<AppCliOutput> {
  const flow = ai.getFlow('appCliFlow');
  if (!flow) throw new Error('appCliFlow not found');
  const result = await flow(input);
  return result;
}

ai.defineFlow(
  {
    name: 'appCliFlow',
    inputSchema: AppCliInputSchema,
    outputSchema: AppCliOutputSchema,
  },
  async ({ command }) => {
    const llmResponse = await ai.generate({
      prompt: `You are a command-line interface for a security application. Execute the user's command using the available tools. If the command is a common network command like 'ping' or 'traceroute', use the runNetworkCommand tool. Command: ${command}`,
      tools: [listAlertsTool, generateReportTool, runNetworkCommandTool],
    });

    const toolResponse = llmResponse.toolRequest?.tool?.output;
    if (toolResponse) {
       return { response: String(toolResponse) };
    }

    return { response: llmResponse.text };
  }
);
