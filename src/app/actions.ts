"use server";

import { predictQueue, QueuePredictionInput } from "@/ai/flows/queue-prediction";
import { optimizeSlots, OptimizeSlotsInput } from "@/ai/flows/slot-optimization-engine";
import { smartTriage, SmartTriageInput } from "@/ai/flows/smart-triage-engine";
import { sendSms } from "@/lib/sms";

export async function runSmartTriage(input: SmartTriageInput) {
  return await smartTriage(input);
}

export async function runSlotOptimization(input: OptimizeSlotsInput) {
  return await optimizeSlots(input);
}

export async function runQueuePrediction(input: QueuePredictionInput) {
    // In a real app, you might add more logic here, like fetching clinic data.
    // For now, we directly call the Genkit flow.
    return await predictQueue(input);
}

export async function runSendSms(to: string, body: string) {
    return await sendSms(to, body);
}
