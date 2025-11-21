// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Integrates threat intelligence feeds and uses LLM reasoning to identify potential threats in real-time.
 *
 * - analyzeThreatFeed - A function that analyzes threat feed entries.
 * - AnalyzeThreatFeedInput - The input type for the analyzeThreatFeed function.
 * - AnalyzeThreatFeedOutput - The return type for the analyzeThreatFeed function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeThreatFeedInputSchema = z.object({
  feedEntry: z.string().describe('A single entry from a threat intelligence feed.'),
  knownVulnerabilities: z
    .array(z.string())
    .describe('A list of known vulnerabilities to compare against.'),
});
export type AnalyzeThreatFeedInput = z.infer<typeof AnalyzeThreatFeedInputSchema>;

const AnalyzeThreatFeedOutputSchema = z.object({
  isThreat: z.boolean().describe('Whether the feed entry is indicative of a threat.'),
  threatSeverity: z.string().describe('The severity level of the potential threat (e.g., high, medium, low).'),
  reasoning: z.string().describe('The LLM reasoning behind the threat assessment.'),
});
export type AnalyzeThreatFeedOutput = z.infer<typeof AnalyzeThreatFeedOutputSchema>;

// This is just a wrapper, the actual flow is defined below
export async function analyzeThreatFeed(input: AnalyzeThreatFeedInput): Promise<AnalyzeThreatFeedOutput> {
  const flow = ai.getFlow('analyzeThreatFeedFlow');
  if (!flow) throw new Error('analyzeThreatFeedFlow not found');
  const result = await flow(input);
  return result;
}

const prompt = ai.definePrompt({
  name: 'analyzeThreatFeedPrompt',
  input: {schema: AnalyzeThreatFeedInputSchema},
  output: {schema: AnalyzeThreatFeedOutputSchema},
  prompt: `You are a cybersecurity threat analyst. Analyze the following threat feed entry and determine if it indicates a potential threat based on known vulnerabilities.

Threat Feed Entry:
{{feedEntry}}

Known Vulnerabilities:
{{#each knownVulnerabilities}}- {{{this}}}\n{{/each}}

Based on your analysis, determine:
1.  Whether the feed entry is indicative of a threat (isThreat: boolean).
2.  The severity level of the potential threat (threatSeverity: string - high, medium, or low).
3.  The reasoning behind your assessment (reasoning: string).

Ensure your output is valid JSON.`,
});

ai.defineFlow(
  {
    name: 'analyzeThreatFeedFlow',
    inputSchema: AnalyzeThreatFeedInputSchema,
    outputSchema: AnalyzeThreatFeedOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
