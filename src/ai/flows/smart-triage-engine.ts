'use server';
/**
 * @fileOverview An AI-powered triage engine that recommends the appropriate medical specialty,
 * urgency level, and suggested next steps based on patient input. It also provides a risk profile
 * and can answer basic home medical procedure questions.
 *
 * - smartTriage - A function that handles the triage process.
 * - SmartTriageInput - The input type for the smartTriage function.
 * - SmartTriageOutput - The return type for the smartTriage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTriageInputSchema = z.object({
  symptoms: z.array(z.string()).describe('A list of symptoms reported by the patient, or a question about a home medical procedure.'),
  age: z.number().optional().describe('The age of the patient.'),
  gender: z
    .enum(['M', 'F', 'O'])
    .optional()
    .describe('The gender of the patient (M, F, or O).'),
  chronicFlags: z.array(z.string()).optional().describe('A list of pre-existing chronic conditions.'),
});
export type SmartTriageInput = z.infer<typeof SmartTriageInputSchema>;

const SmartTriageOutputSchema = z.object({
  isQuery: z.boolean().describe('True if the input was a question, false if it was a list of symptoms for triage.'),
  recommendedSpecialty: z.string().optional().describe('The recommended medical specialty (for triage).'),
  urgency: z
    .enum(['low', 'medium', 'high'])
    .optional()
    .describe('The urgency level (low, medium, or high) (for triage).'),
  riskScore: z.number().min(0).max(100).optional().describe('A risk score from 0 to 100 (for triage).'),
  riskCategory: z.enum(['low', 'medium', 'high']).optional().describe('The calculated risk category (for triage).'),
  contributingFactors: z.array(z.string()).optional().describe('The top factors that contributed to the risk score (for triage).'),
  explanation: z.array(z.string()).optional().describe('A brief, clear explanation for the assessment and risk (for triage).'),
  suggestedNextSteps: z.array(z.string()).optional().describe('Suggested next steps for the patient (for triage).'),
  procedureExplanation: z.array(z.string()).optional().describe('Step-by-step explanation for a home medical procedure (for queries).'),
});
export type SmartTriageOutput = z.infer<typeof SmartTriageOutputSchema>;

export async function smartTriage(input: SmartTriageInput): Promise<SmartTriageOutput> {
  return smartTriageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartTriagePrompt',
  input: {schema: SmartTriageInputSchema},
  output: {schema: SmartTriageOutputSchema},
  prompt: `You are an AI-powered medical assistant. Your task is to determine if the user input is a request for triage or a question about a basic home medical procedure.

1.  **If the input appears to be a list of symptoms for triage** (e.g., "chest pain, headache"):
    *   Set \`isQuery\` to \`false\`.
    *   Provide a detailed risk assessment based on the patient's symptoms, age, gender, and chronic conditions.
    *   Use a rule-based weighted scoring model. Consider symptom severity, age bands (e.g., >65, <5), and the presence of chronic flags like 'diabetes', 'hypertension', or 'heart disease'.
    *   Fill out the triage-related fields: \`recommendedSpecialty\`, \`urgency\`, \`riskScore\`, \`riskCategory\`, \`contributingFactors\`, \`explanation\`, and \`suggestedNextSteps\`.
    *   Leave \`procedureExplanation\` empty.

2.  **If the input appears to be a question about a home medical activity** (e.g., "how to apply a bandage", "what to do for a minor burn"):
    *   Set \`isQuery\` to \`true\`.
    *   Provide a clear, step-by-step guide on how to perform the activity in the \`procedureExplanation\` field.
    *   Leave all the triage-related fields empty (e.g., \`recommendedSpecialty\`, \`riskScore\`, etc.).
    *   ALWAYS include a disclaimer to consult a professional for serious injuries.

Patient Input:
Input Text: {{symptoms}}
Age: {{age}}
Gender: {{gender}}
Chronic Conditions: {{chronicFlags}}

Provide your response in the specified JSON format.`,
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
