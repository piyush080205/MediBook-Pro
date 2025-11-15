'use server';
/**
 * @fileOverview Converts text to speech using different TTS providers.
 *
 * - textToSpeech - A function that takes a string and returns a base64-encoded WAV audio file.
 * - Uses ElevenLabs as the primary TTS provider with fallback to Google TTS if needed.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { elevenLabsTTS } from '@/lib/elevenlabs-tts';

type TTSProvider = 'elevenlabs' | 'google';

const TextToSpeechInputSchema = z.object({
  text: z.string(),
  provider: z.enum(['elevenlabs', 'google']).optional().default('elevenlabs'),
});

const TextToSpeechOutputSchema = z.object({
  audio: z.string().describe('Base64-encoded WAV audio data URI.'),
  provider: z.string().describe('The TTS provider that was used.'),
});

export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(text: string, provider: TTSProvider = 'elevenlabs'): Promise<TextToSpeechOutput> {
  return textToSpeechFlow({ text, provider });
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
    const { WritableBuffer } = require('wav');
    const writer = new WritableBuffer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    writer.on('error', reject);
    writer.on('finish', () => {
      resolve(writer.getBuffer().toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

/**
 * Uses Google's TTS service to convert text to speech
 */
async function googleTTS(text: string): Promise<TextToSpeechOutput> {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
          },
        },
        prompt: text,
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
        provider: 'google',
      };
    } catch (error: any) {
      attempt++;
      if (error.message.includes('429') && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Failed to get a response from Google TTS after multiple retries.');
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text, provider = 'elevenlabs' }, streamingCallback) => {
    try {
      // Try the primary provider first
      if (provider === 'elevenlabs') {
        try {
          const result = await elevenLabsTTS(text);
          return { ...result, provider: 'elevenlabs' };
        } catch (elevenLabsError) {
          console.warn('ElevenLabs TTS failed, falling back to Google TTS:', elevenLabsError);
          if (streamingCallback) {
            await streamingCallback({
              custom: 'ElevenLabs TTS unavailable, using Google TTS...',
            });
          }
          // Fall back to Google TTS
          return googleTTS(text);
        }
      } else {
        // Use Google TTS directly if specified
        return googleTTS(text);
      }
    } catch (error: unknown) {
      console.error('Text-to-speech generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate speech: ${errorMessage}`);
    }
  }
);
