import { config } from 'dotenv';
config();

import './flows/generate-security-report';
import './flows/analyze-threat-feed';
import './flows/app-cli';
import './flows/run-log-analysis';
import './flows/parse-log-entries';
