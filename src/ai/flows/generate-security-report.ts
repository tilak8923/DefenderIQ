'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating customized security reports based on specified parameters.
 *
 * The flow takes in parameters for report generation and outputs a comprehensive security report.
 * It includes:
 *   - generateSecurityReport - A function that generates the security report.
 *   - GenerateSecurityReportInput - The input type for the generateSecurityReport function.
 *   - GenerateSecurityReportOutput - The return type for the generateSecurityReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateSecurityReportInputSchema = z.object({
  reportTitle: z.string().describe('Title of the security report.'),
  dateRange: z.string().describe('Date range for the report (e.g., Last 7 days, Last 30 days).'),
  selectedParameters: z
    .array(z.string())
    .describe(
      'Parameters to include in the report (e.g., Number of alerts, Types of threats detected, System vulnerabilities, User activity).'
    ),
  additionalNotes: z.string().optional().describe('Any additional notes or context to include in the report.'),
});
export type GenerateSecurityReportInput = z.infer<typeof GenerateSecurityReportInputSchema>;

export const GenerateSecurityReportOutputSchema = z.object({
  reportContent: z.string().describe('The generated security report content in Markdown format.'),
});
export type GenerateSecurityReportOutput = z.infer<typeof GenerateSecurityReportOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateSecurityReportPrompt',
  input: {schema: GenerateSecurityReportInputSchema},
  output: {schema: GenerateSecurityReportOutputSchema},
  prompt: `You are a professional cybersecurity analyst tasked with creating a detailed security report.
Use Markdown for formatting. The report must be well-structured, clear, and comprehensive.

**Report Title:** {{{reportTitle}}}
**Date Range:** {{{dateRange}}}

---

### 1. Executive Summary
Provide a high-level overview of the security posture for the given date range. Summarize the most critical findings and the overall risk level. This section is for a non-technical audience.

### 2. Key Findings
List the most significant security events and observations as bullet points. Include metrics and specific examples where possible.
- **Alerts Overview:** Total alerts, breakdown by severity.
- **Threat Landscape:** Dominant threat types observed.
- **System Health:** Key vulnerabilities or system issues.
- **User Behavior:** Notable user activity patterns.

### 3. Detailed Analysis
Provide a thorough analysis for each of the selected parameters below. Use data and context to explain the significance of the findings.

{{#each selectedParameters}}
- **{{{this}}}:** [Provide a detailed breakdown and analysis for this parameter here]
{{/each}}

### 4. Risk Assessment
Evaluate the potential impact and likelihood of the identified threats and vulnerabilities. Assign a risk level (Critical, High, Medium, Low) to the key findings and justify your assessment.

### 5. Recommendations & Action Items
Suggest specific, actionable steps to mitigate the identified risks. Prioritize recommendations based on severity and urgency. For each recommendation, specify the suggested action, the responsible party (e.g., IT, DevOps), and a priority level.

{{#if additionalNotes}}
### 6. Additional Notes
{{{additionalNotes}}}
{{/if}}
`,
});

export const generateSecurityReportFlow = ai.defineFlow(
  {
    name: 'generateSecurityReportFlow',
    inputSchema: GenerateSecurityReportInputSchema,
    outputSchema: GenerateSecurityReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
