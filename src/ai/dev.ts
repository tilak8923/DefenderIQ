import { config } from 'dotenv';
config();

import '@/ai/flows/generate-security-report.ts';
import '@/ai/flows/provide-command-line-assistance.ts';
import '@/ai/flows/analyze-threat-feed.ts';
import '@/ai/flows/app-cli.ts';
import '@/ai/flows/run-log-analysis.ts';
import '@/ai/flows/parse-log-entries.ts';
