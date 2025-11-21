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

export const AnalyzeThreatFeedInputSchema = z.object({
  feedEntry: z.string().describe('A single entry from a threat intelligence feed.'),
  knownVulnerabilities: z
    .array(z.string())
    .describe('A list of known vulnerabilities to compare against.'),
});
export type AnalyzeThreatFeedInput = z.infer<typeof AnalyzeThreatFeedInputSchema>;

export const AnalyzeThreatFeedOutputSchema = z.object({
  isThreat: z.boolean().describe('Whether the feed entry is indicative of a threat.'),
  threatSeverity: z.string().describe('The severity level of the potential threat (e.g., high, medium, low).'),
  reasoning: z.string().describe('The LLM reasoning behind the threat assessment.'),
});
export type AnalyzeThreatFeedOutput = z.infer<typeof AnalyzeThreatFeedOutputSchema>;


export async function analyzeThreatFeed(input: AnalyzeThreatFeedInput): Promise<AnalyzeThreatFeedOutput> {
  const prompt = `You are a cybersecurity threat analyst. Analyze the following threat feed entry and determine if it indicates a potential threat based on known vulnerabilities.

Threat Feed Entry:
${input.feedEntry}

Known Vulnerabilities:
${input.knownVulnerabilities.map(v => `- ${v}`).join('\n')}

Based on your analysis, determine:
1.  Whether the feed entry is indicative of a threat (isThreat: boolean).
2.  The severity level of the potential threat (threatSeverity: string - high, medium, or low).
3.  The reasoning behind your assessment (reasoning: string).

Ensure your output is valid JSON.`;
  
    const { output } = await ai.generate({
        prompt: prompt,
        output: {
            schema: AnalyzeThreatFeedOutputSchema,
            format: 'json'
        },
    });

    if (!output) {
      throw new Error("Failed to get a structured response from the AI model.");
    }
    
    return output;
}
