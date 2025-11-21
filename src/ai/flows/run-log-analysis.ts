'use server';
/**
 * @fileOverview A flow for analyzing log entries against alert rules to generate security alerts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { initializeFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import type { LogEntry, AlertRule } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


// Define schemas for the flow
export const RunLogAnalysisInputSchema = z.object({
  userId: z.string().describe("The ID of the user whose logs should be analyzed."),
});
export type RunLogAnalysisInput = z.infer<typeof RunLogAnalysisInputSchema>;


export const RunLogAnalysisOutputSchema = z.object({
  logsScanned: z.number().describe('The total number of log entries scanned.'),
  rulesEvaluated: z.number().describe('The total number of enabled alert rules evaluated.'),
  alertsCreated: z.number().describe('The number of new alerts created.'),
});
export type RunLogAnalysisOutput = z.infer<typeof RunLogAnalysisOutputSchema>;


// Define the prompt for the AI model
const logAnalysisPrompt = ai.definePrompt({
  name: 'logAnalysisPrompt',
  input: {
    schema: z.object({
      log: z.string().describe('A single log entry.'),
      rule: z.string().describe('An alert rule definition.'),
    }),
  },
  output: {
    schema: z.object({
      isMatch: z.boolean().describe('Does the log entry trigger the alert rule?'),
      reasoning: z.string().describe('A brief explanation of why the rule was or was not triggered.'),
      alertDescription: z.string().optional().describe('If a match, a concise description for the alert.'),
    }),
  },
  prompt: `You are a security information and event management (SIEM) detection engine.
Your task is to determine if a given log entry triggers a specific security alert rule.

**Alert Rule:**
"{{rule}}"

**Log Entry:**
"{{log}}"

Analyze the log entry based *only* on the provided rule.
- If the log meets the rule's conditions, set isMatch to true and create a concise, human-readable alertDescription.
- If it does not meet the conditions, set isMatch to false.
- Provide a brief reasoning for your decision.
`,
});

// The main Genkit flow
export const runLogAnalysisFlow = ai.defineFlow(
  {
    name: 'runLogAnalysisFlow',
    inputSchema: RunLogAnalysisInputSchema,
    outputSchema: RunLogAnalysisOutputSchema,
  },
  async ({ userId }) => {
    const { firestore } = initializeFirebase();
    
    // 1. Fetch all enabled alert rules from Firestore
    const rulesQuery = query(collection(firestore, 'users', userId, 'alertRules'), where("enabled", "==", true));
    const rulesSnapshot = await getDocs(rulesQuery).catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: `users/${userId}/alertRules`,
          operation: 'list',
        })
      );
      throw error;
    });
    const rules: AlertRule[] = rulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AlertRule));
    
    // 2. Fetch all logs from Firestore
    const logsQuery = query(collection(firestore, 'users', userId, 'logs'));
    const logsSnapshot = await getDocs(logsQuery).catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: `users/${userId}/logs`,
          operation: 'list',
        })
      );
      throw error;
    });
    const logs: LogEntry[] = logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LogEntry));
    
    let alertsCreated = 0;
    const alertsCollection = collection(firestore, 'users', userId, 'alerts');

    // 3. For each log, evaluate it against each rule
    for (const log of logs) {
      for (const rule of rules) {
        const { output } = await logAnalysisPrompt({
          log: `${log.source}: ${log.message}`,
          rule: `${rule.name}: ${rule.condition}`,
        });

        if (output?.isMatch) {
          const newAlert = {
            severity: rule.severity,
            description: output.alertDescription || `Alert triggered by rule: ${rule.name}`,
            timestamp: new Date().toISOString(),
            status: 'Active',
            userId: userId,
          };
          // 4. If AI confirms a match, create a new alert using non-blocking function
          addDocumentNonBlocking(alertsCollection, newAlert);
          alertsCreated++;
        }
      }
    }
    
    return {
      logsScanned: logs.length,
      rulesEvaluated: rules.length,
      alertsCreated,
    };
  }
);
