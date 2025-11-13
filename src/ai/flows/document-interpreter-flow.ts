'use server';
/**
 * @fileOverview An AI-powered medical document interpreter.
 * It extracts key information from uploaded medical documents like prescriptions or lab reports.
 *
 * - runDocumentInterpreter - A function that handles the document interpretation process.
 * - DocumentInterpreterInput - The input type for the flow.
 * - MedicalDocument - The structured output type for the interpreted document.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DocumentInterpreterInputSchema = z.object({
  documentImage: z
    .string()
    .describe(
      "An image of a medical document (e.g., prescription, lab report) as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type DocumentInterpreterInput = z.infer<typeof DocumentInterpreterInputSchema>;

const MedicalDocumentSchema = z.object({
  documentType: z.enum(['Prescription', 'Lab Report', 'Discharge Summary', 'Other']).describe('The type of medical document provided.'),
  summary: z.string().describe('A brief, one-sentence summary of the document\'s purpose or main finding.'),
  keyVitals: z.array(z.object({
    name: z.string().describe('Name of the vital (e.g., "Blood Pressure", "Glucose").'),
    value: z.string().describe('Value of the vital (e.g., "120/80", "98.6").'),
    unit: z.string().describe('Unit of measurement (e.g., "mmHg", "°F").'),
  })).optional().describe('Key vital signs mentioned in the document.'),
  abnormalReadings: z.array(z.object({
    name: z.string().describe('Name of the reading that is abnormal.'),
    value: z.string().describe('The abnormal value.'),
    unit: z.string().describe('The unit of measurement.'),
    interpretation: z.string().describe('A brief, neutral explanation of what this reading might indicate.'),
  })).optional().describe('List of readings that are outside the normal range.'),
  medications: z.array(z.object({
    name: z.string().describe('Name of the medication.'),
    dosage: z.string().describe('Dosage instructions (e.g., "500mg", "1 tablet").'),
    frequency: z.string().describe('How often to take the medication (e.g., "Twice a day", "As needed").'),
  })).optional().describe('Medications prescribed in the document.'),
  nextSteps: z.array(z.string()).optional().describe('A list of recommended next steps or follow-up actions.'),
});

export type MedicalDocument = z.infer<typeof MedicalDocumentSchema>;

export async function runDocumentInterpreter(input: DocumentInterpreterInput): Promise<MedicalDocument> {
  return documentInterpreterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'documentInterpreterPrompt',
  input: { schema: DocumentInterpreterInputSchema },
  output: { schema: MedicalDocumentSchema },
  prompt: `You are an expert AI medical document interpreter. Analyze the provided image of a medical document and extract the key information into the specified JSON format.

  - Identify the type of document.
  - Extract key vitals, any prescribed medications, and suggested next steps.
  - Specifically highlight any readings that are clearly marked as abnormal or outside the standard range. Provide a brief, neutral interpretation for these.
  - Do NOT provide a diagnosis or medical advice. Your role is to extract and structure the information present in the document.
  - If a section (e.g., medications) is not present in the document, return an empty array for that field.

  Document Image: {{media url=documentImage}}
  `,
});

const documentInterpreterFlow = ai.defineFlow(
  {
    name: 'documentInterpreterFlow',
    inputSchema: DocumentInterpreterInputSchema,
    outputSchema: MedicalDocumentSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
