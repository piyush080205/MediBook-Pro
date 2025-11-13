import { config } from 'dotenv';
config();

import '@/ai/flows/queue-prediction.ts';
import '@/ai/flows/slot-optimization-engine.ts';
import '@/ai/flows/smart-triage-engine.ts';
import '@/ai/flows/clinic-stats-engine.ts';
import '@/ai/flows/document-interpreter-flow.ts';
import '@/ai/flows/text-to-speech-flow.ts';
