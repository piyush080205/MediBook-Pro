'use server';
/**
 * @fileOverview Converts text to speech using a Genkit flow.
 *
 * - textToSpeech - A function that takes a string and returns a base64-encoded WAV audio file.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';
import { googleAI } from '@genkit-ai/google-genai';

const TextToSpeechInputSchema = z.string();
const TextToSpeechOutputSchema = z.object({
  audio: z.string().describe('Base64-encoded WAV audio data URI.'),
});

export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(text: string): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(text);
}

/**
 * Converts raw PCM audio buffer to a base64-encoded WAV string.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (query, streamingCallback) => {
    const maxRetries = 3;
    let attempt = 0;
    
    while(attempt < maxRetries) {
      try {
        const { media } = await ai.generate({
          model: googleAI.model('gemini-2.5-flash-preview-tts'),
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A calm, clear voice
              },
            },
          },
          prompt: query,
        });

        if (!media) {
          throw new Error('No audio media was generated.');
        }

        const audioBuffer = Buffer.from(
          media.url.substring(media.url.indexOf(',') + 1),
          'base64'
        );
        const wavBase64 = await toWav(audioBuffer);

        return {
          audio: 'data:audio/wav;base64,' + wavBase64,
        };
      } catch (error: any) {
        attempt++;
        if (error.message.includes('429') && attempt < maxRetries) {
          if (streamingCallback) {
             await streamingCallback({
              custom: `Model is overloaded, retrying... (Attempt ${attempt}/${maxRetries})`,
            });
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        } else {
          throw error;
        }
      }
    }
    throw new Error('Failed to get a response from the TTS model after multiple retries.');
  }
);
