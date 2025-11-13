'use server';
/**
 * @fileOverview An AI engine to generate simulated operational statistics for a medical clinic.
 *
 * - getClinicStats - A function that returns key operational metrics.
 * - ClinicStatsInput - The input type for the getClinicStats function.
 * - ClinicStatsOutput - The return type for the getClinicStats function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClinicStatsInputSchema = z.object({
  clinicId: z.string().describe('The ID of the clinic for which to generate stats.'),
});
export type ClinicStatsInput = z.infer<typeof ClinicStatsInputSchema>;

const ClinicStatsOutputSchema = z.object({
  queueLength: z.number().describe('The current number of patients in the queue.'),
  predictedWaitMins: z.number().describe('The predicted average wait time in minutes.'),
  doctorAvailability: z.number().min(0).max(1).describe('The percentage of doctors currently available (0 to 1).'),
  peakForecast: z.array(z.object({
    time: z.string().describe('The hour of the day (e.g., "3 PM").'),
    load: z.number().min(0).max(1).describe('The predicted patient load (0 to 1).'),
  })).describe('A forecast of patient load for the next few hours.'),
  noShowProbability: z.number().min(0).max(1).describe('The average probability of a patient not showing up for their appointment.'),
});
export type ClinicStatsOutput = z.infer<typeof ClinicStatsOutputSchema>;

export async function getClinicStats(input: ClinicStatsInput): Promise<ClinicStatsOutput> {
  return getClinicStatsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'clinicStatsPrompt',
  input: {schema: ClinicStatsInputSchema},
  output: {schema: ClinicStatsOutputSchema},
  prompt: `You are an AI that generates realistic, simulated operational data for a medical clinic dashboard.
  
  For the given clinic ID: {{{clinicId}}}, generate a plausible set of current operational statistics.
  
  - The current time is approximately {{time}}.
  - Base your simulation on typical clinic patterns. Queues are longer mid-day. Doctor availability might fluctuate.
  - The peak forecast should show a believable trend over the next few hours.
  - Return the data in the specified JSON format.
  
  Example values:
  - queueLength: between 5 and 25
  - predictedWaitMins: between 15 and 90
  - doctorAvailability: between 0.5 and 1.0
  - noShowProbability: between 0.05 and 0.20`,
});


const getClinicStatsFlow = ai.defineFlow(
  {
    name: 'getClinicStatsFlow',
    inputSchema: ClinicStatsInputSchema,
    outputSchema: ClinicStatsOutputSchema,
  },
  async (input) => {
     const now = new Date();
    const {output} = await prompt({
        ...input,
        // Pass the current time to the prompt context for more realistic simulation
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });
    return output!;
  }
);
