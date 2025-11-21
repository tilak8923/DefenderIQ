'use server';

/**
 * @fileOverview Provides command-line assistance with a hacker vibe.
 *
 * - provideCommandLineAssistanceFlow - A function that provides command-line assistance.
 * - ProvideCommandLineAssistanceInput - The input type for the provideCommandLineAssistance function.
 * - ProvideCommandLineAssistanceOutput - The return type for the provideCommandLineAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit/zod';

export const ProvideCommandLineAssistanceInputSchema = z.object({
  command: z.string().describe('The command to execute.'),
});
export type ProvideCommandLineAssistanceInput = z.infer<typeof ProvideCommandLineAssistanceInputSchema>;

export const ProvideCommandLineAssistanceOutputSchema = z.object({
  response: z.string().describe('The response from the command.'),
});
export type ProvideCommandLineAssistanceOutput = z.infer<typeof ProvideCommandLineAssistanceOutputSchema>;

const prompt = ai.definePrompt({
  name: 'provideCommandLineAssistancePrompt',
  input: {schema: ProvideCommandLineAssistanceInputSchema},
  output: {schema: ProvideCommandLineAssistanceOutputSchema},
  prompt: `You are a helpful AI assistant powering a command-line interface for a security information and event management (SIEM) app.

Your goal is to interpret the user's command and use the available tools to perform the requested action.

Format your response as a clear, readable string that can be displayed in a terminal. Use markdown for formatting if appropriate (e.g., for tables).

Command: {{{command}}}`,
});

export const provideCommandLineAssistanceFlow = ai.defineFlow(
  {
    name: 'provideCommandLineAssistanceFlow',
    inputSchema: ProvideCommandLineAssistanceInputSchema,
    outputSchema: ProvideCommandLineAssistanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
