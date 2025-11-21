'use server';
/**
 * @fileOverview A flow for parsing unstructured text-based log entries into a structured format.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the structure of a single log entry, matching lib/types.ts but without the ID.
const LogEntrySchema = z.object({
  timestamp: z.string().describe('The full timestamp of the log entry. It must be a valid ISO 8601 string.'),
  severity: z.enum(['CRITICAL', 'WARN', 'INFO', 'DEBUG', 'UNKNOWN']).describe('The severity level of the log.'),
  source: z.string().describe('The source of the log. If not present, infer from the message or use "Imported".'),
  message: z.string().describe('The main content of the log message.'),
});

const ParseLogEntriesInputSchema = z.object({
  logText: z.string().describe('A string containing one or more lines of unstructured log entries.'),
});
export type ParseLogEntriesInput = z.infer<typeof ParseLogEntriesInputSchema>;

const ParseLogEntriesOutputSchema = z.object({
  parsedLogs: z.array(LogEntrySchema).describe('An array of structured log objects.'),
});
export type ParseLogEntriesOutput = z.infer<typeof ParseLogEntriesOutputSchema>;

export async function parseLogEntries(input: ParseLogEntriesInput): Promise<ParseLogEntriesOutput> {
  
  const prompt = `You are an expert log parsing engine. Your task is to convert unstructured log text into a structured JSON array.
Each line in the input represents a single log entry.

Follow these rules for parsing:
1.  **Timestamp**: Extract the full date and time. Convert it to a valid ISO 8601 string format (e.g., "YYYY-MM-DDTHH:MM:SS.sssZ").
2.  **Severity**: Identify the severity level. Map it to one of the following values: 'CRITICAL', 'WARN', 'INFO', 'DEBUG'. If the severity is not explicitly one of these (e.g., WARNING), map it to the closest equivalent (e.g., 'WARN'). If no level can be determined, use 'UNKNOWN'.
3.  **Source**: Try to identify the source of the log from the message content. If no clear source is mentioned, default to "Imported".
4.  **Message**: The rest of the log line should be the message.

**Log Text to Parse:**
${input.logText}

Parse the text and return a JSON object with a single key "parsedLogs" containing an array of the structured log objects.
`;

    const { output } = await ai.generate({
        prompt: prompt,
        output: {
            schema: ParseLogEntriesOutputSchema,
            format: 'json'
        }
    });

    if (!output) {
      throw new Error("Failed to parse logs.");
    }
    
    return output;
}
