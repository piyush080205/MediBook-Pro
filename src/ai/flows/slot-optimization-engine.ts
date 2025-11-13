'use server';

/**
 * @fileOverview An AI agent to optimize appointment slots for doctors.
 *
 * - optimizeSlots - A function that handles the slot optimization process.
 * - OptimizeSlotsInput - The input type for the optimizeSlots function.
 * - OptimizeSlotsOutput - The return type for the optimizeSlots function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeSlotsInputSchema = z.object({
  doctorId: z.string().describe('The ID of the doctor to optimize slots for.'),
  dateRange: z
    .object({
      from: z.string().datetime().describe('The start date of the date range.'),
      to: z.string().datetime().describe('The end date of the date range.'),
    })
    .describe('The date range to optimize slots for.'),
  patientPreferences: z
    .object({
      earliestTime: z.string().optional().describe('The earliest time the patient is available.'),
      latestTime: z.string().optional().describe('The latest time the patient is available.'),
    })
    .optional()
    .describe('The patient preferences for the appointment time.'),
  existingAppointments: z
    .array(
      z.object({
        start: z.string().datetime(),
        end: z.string().datetime(),
      })
    )
    .optional()
    .describe('List of existing appointments to consider during optimization.'),
  noShowProbability: z.number().optional().describe('Mocked no-show probability from past data.'),
});
export type OptimizeSlotsInput = z.infer<typeof OptimizeSlotsInputSchema>;

const BestSlotSchema = z.object({
  start: z.string().datetime().describe('The start time of the slot.'),
  end: z.string().datetime().describe('The end time of the slot.'),
  score: z.number().describe('The score of the slot, higher is better.'),
  reason: z.string().describe('The reason for the score.'),
});

const OptimizeSlotsOutputSchema = z.object({
  bestSlots: z.array(BestSlotSchema).describe('The best available appointment slots.'),
});
export type OptimizeSlotsOutput = z.infer<typeof OptimizeSlotsOutputSchema>;

export async function optimizeSlots(input: OptimizeSlotsInput): Promise<OptimizeSlotsOutput> {
  return optimizeSlotsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeSlotsPrompt',
  input: {schema: OptimizeSlotsInputSchema},
  output: {schema: OptimizeSlotsOutputSchema},
  prompt: `You are an AI assistant that optimizes appointment slots for doctors.

  Given the doctor's ID: {{{doctorId}}},
  the date range from: {{{dateRange.from}}} to {{{dateRange.to}}},
  patient preferences such as earliest time: {{{patientPreferences.earliestTime}}} and latest time: {{{patientPreferences.latestTime}}},
  existing appointments: {{{existingAppointments}}},
  and the no-show probability: {{{noShowProbability}}},

  suggest the best available appointment slots, minimizing fragmentation and maximizing contiguous appointments.

  Return the best slots in the following format:
  {
    "bestSlots": [
      {
        "start": "ISO Datetime",
        "end": "ISO Datetime",
        "score": "number",
        "reason": "string"
      }
    ]
  }`,
});

const optimizeSlotsFlow = ai.defineFlow(
  {
    name: 'optimizeSlotsFlow',
    inputSchema: OptimizeSlotsInputSchema,
    outputSchema: OptimizeSlotsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
