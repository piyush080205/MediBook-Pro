'use server';
/**
 * @fileOverview Predicts clinic queue length and wait time.
 *
 * - predictQueue - Predicts the queue length and wait time for a given clinic.
 * - QueuePredictionInput - The input type for the predictQueue function.
 * - QueuePredictionOutput - The return type for the predictQueue function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QueuePredictionInputSchema = z.object({
  clinicId: z.string().describe('The ID of the clinic to predict queue for.'),
  time: z.string().describe('The time to predict the queue for in ISO format.'),
});
export type QueuePredictionInput = z.infer<typeof QueuePredictionInputSchema>;

const QueuePredictionOutputSchema = z.object({
  patientsAhead: z.number().describe('The predicted number of patients ahead in the queue.'),
  estimatedWaitMinutes: z
    .number()
    .describe('The estimated wait time in minutes.'),
  confidence: z.number().describe('The confidence level of the prediction (0-1).'),
});
export type QueuePredictionOutput = z.infer<typeof QueuePredictionOutputSchema>;

export async function predictQueue(input: QueuePredictionInput): Promise<QueuePredictionOutput> {
  return predictQueueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'queuePredictionPrompt',
  input: {schema: QueuePredictionInputSchema},
  output: {schema: QueuePredictionOutputSchema},
  prompt: `You are an expert at predicting queue lengths and wait times for medical clinics.

  Given the clinic ID: {{{clinicId}}} and the time: {{{time}}},
  predict the number of patients ahead, the estimated wait time in minutes, and the confidence level of your prediction.

  Return your prediction in JSON format.`,
});

const predictQueueFlow = ai.defineFlow(
  {
    name: 'predictQueueFlow',
    inputSchema: QueuePredictionInputSchema,
    outputSchema: QueuePredictionOutputSchema,
  },
  async (input, streamingCallback) => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (error: any) {
        attempt++;
        if (error.message.includes('503') && attempt < maxRetries) {
          if (streamingCallback) {
             await streamingCallback({
              custom: `Model is overloaded, retrying... (Attempt ${attempt}/${maxRetries})`,
            });
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Wait longer each time
        } else {
          // If it's not a 503 error or we've run out of retries, throw the error
          throw error;
        }
      }
    }
    // This part should not be reachable if the loop is correct, but satisfies TypeScript
    throw new Error('Failed to get a response from the model after multiple retries.');
  }
);
