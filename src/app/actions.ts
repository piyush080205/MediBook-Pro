"use server";

import { predictQueue, QueuePredictionInput } from "@/ai/flows/queue-prediction";
import { optimizeSlots, OptimizeSlotsInput } from "@/ai/flows/slot-optimization-engine";
import { smartTriage, SmartTriageInput } from "@/ai/flows/smart-triage-engine";
import { getClinicStats, ClinicStatsInput } from "@/ai/flows/clinic-stats-engine";
import { runDocumentInterpreter as runDocumentInterpreterFlow, DocumentInterpreterInput } from "@/ai/flows/document-interpreter-flow";
import { textToSpeech as textToSpeechFlow } from "@/ai/flows/text-to-speech-flow";
import { transcribeAudio, transcribeBase64Audio, transcribeAudioFile, TranscriptionResult } from "@/lib/deepgram-asr";
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

export async function runGetClinicStats(input: ClinicStatsInput) {
  return await getClinicStats(input);
}

export async function runSendSms(to: string, body: string) {
    return await sendSms(to, body);
}

export async function runDocumentInterpreter(input: DocumentInterpreterInput) {
    return await runDocumentInterpreterFlow(input);
}

export async function runTextToSpeech(text: string, provider: 'elevenlabs' | 'google' = 'elevenlabs') {
    return await textToSpeechFlow({ text, provider });
}

/**
 * Transcribes audio data using Deepgram's ASR API
 * @param audioData Audio data as ArrayBuffer or Blob
 * @param contentType MIME type of the audio data (e.g., 'audio/wav', 'audio/mp3')
 * @returns Promise that resolves to the transcription result
 */
export async function runSpeechToText(
  audioData: ArrayBuffer | Blob,
  contentType: string = 'audio/wav'
): Promise<TranscriptionResult> {
  return transcribeAudio(audioData, contentType);
}

/**
 * Transcribes base64 encoded audio data using Deepgram's ASR API
 * @param base64Audio Base64 encoded audio data (with or without data URL prefix)
 * @param contentType MIME type of the audio data (e.g., 'audio/wav', 'audio/mp3')
 * @returns Promise that resolves to the transcription result
 */
export async function runSpeechToTextFromBase64(
  base64Audio: string,
  contentType: string = 'audio/wav'
): Promise<TranscriptionResult> {
  return transcribeBase64Audio(base64Audio, contentType);
}

/**
 * Transcribes an audio file using Deepgram's ASR API
 * @param filePath Path to the audio file
 * @returns Promise that resolves to the transcription result
 */
export async function runSpeechToTextFromFile(
  filePath: string
): Promise<TranscriptionResult> {
  return transcribeAudioFile(filePath);
}
