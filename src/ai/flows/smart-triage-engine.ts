'use server';
/**
 * @fileOverview An AI-powered triage engine that recommends the appropriate medical specialty,
 * urgency level, and suggested next steps based on patient input. It also provides a risk profile.
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
  chronicFlags: z.array(z.string()).optional().describe('A list of pre-existing chronic conditions.'),
});
export type SmartTriageInput = z.infer<typeof SmartTriageInputSchema>;

const SmartTriageOutputSchema = z.object({
  recommendedSpecialty: z.string().describe('The recommended medical specialty.'),
  urgency: z
    .enum(['low', 'medium', 'high'])
    .describe('The urgency level (low, medium, or high).'),
  riskScore: z.number().min(0).max(100).describe('A risk score from 0 to 100.'),
  riskCategory: z.enum(['low', 'medium', 'high']).describe('The calculated risk category.'),
  contributingFactors: z.array(z.string()).describe('The top factors that contributed to the risk score.'),
  explanation: z.array(z.string()).describe('A brief, clear explanation for the assessment and risk.'),
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
  prompt: `You are an AI-powered medical triage assistant. Based on the patient's symptoms, age, gender, and chronic conditions, you will provide a detailed risk assessment.

Use a rule-based weighted scoring model. Consider symptom severity, age bands (e.g., >65, <5), and the presence of chronic flags like 'diabetes', 'hypertension', or 'heart disease'.

Patient Input:
Symptoms: {{symptoms}}
Age: {{age}}
Gender: {{gender}}
Chronic Conditions: {{chronicFlags}}

Please provide your assessment in the following JSON format:
{
  "recommendedSpecialty": "<recommended medical specialty>",
  "urgency": "<urgency level (low, medium, or high)>",
  "riskScore": <A score from 0-100 based on weighted factors>,
  "riskCategory": "<low, medium, or high based on the risk score>",
  "contributingFactors": ["<List of the most significant factors, e.g., 'Symptom: chest pain', 'Age > 65'>"],
  "explanation": ["<A brief explanation of why the risk level was assigned>"],
  "suggestedNextSteps": ["<List of suggested next steps for the patient>"]
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
