'use server';
/**
 * @fileOverview An AI-powered triage engine that recommends the appropriate medical specialty,
 * urgency level, and suggested next steps based on patient input.
 *
 * - smartTriage - A function that handles the triage process.
 * - SmartTriageInput - The input type for the smartTriage function.
 * - SmartTriageOutput - The return type for the smartTriage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTriageInputSchema = z.object({
  symptoms: z.array(z.string()).describe('A list of symptoms reported by the patient.'),
  age: z.number().optional().describe('The age of the patient.'),
  gender: z
    .enum(['M', 'F', 'O'])
    .optional()
    .describe('The gender of the patient (M, F, or O).'),
});
export type SmartTriageInput = z.infer<typeof SmartTriageInputSchema>;

const SmartTriageOutputSchema = z.object({
  recommendedSpecialty: z.string().describe('The recommended medical specialty.'),
  urgency: z
    .enum(['low', 'medium', 'high'])
    .describe('The urgency level (low, medium, or high).'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('A confidence score between 0 and 1 indicating the reliability of the triage assessment.'),
  suggestedNextSteps: z.array(z.string()).describe('Suggested next steps for the patient.'),
});
export type SmartTriageOutput = z.infer<typeof SmartTriageOutputSchema>;

export async function smartTriage(input: SmartTriageInput): Promise<SmartTriageOutput> {
  return smartTriageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartTriagePrompt',
  input: {schema: SmartTriageInputSchema},
  output: {schema: SmartTriageOutputSchema},
  prompt: `You are an AI-powered medical triage assistant. Based on the patient's symptoms, age, and gender, you will recommend the appropriate medical specialty, urgency level, and suggested next steps.

Symptoms: {{symptoms}}
Age: {{age}}
Gender: {{gender}}

Please provide your assessment in the following format:
{
  "recommendedSpecialty": "<recommended medical specialty>",
  "urgency": "<urgency level (low, medium, or high)>",
  "confidence": <confidence score between 0 and 1>,
  "suggestedNextSteps": ["<list of suggested next steps>"]
}
`,
});

const smartTriageFlow = ai.defineFlow(
  {
    name: 'smartTriageFlow',
    inputSchema: SmartTriageInputSchema,
    outputSchema: SmartTriageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
