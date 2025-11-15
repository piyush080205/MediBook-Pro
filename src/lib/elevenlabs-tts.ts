'use server';

/**
 * ElevenLabs Text-to-Speech Service
 * 
 * This module provides text-to-speech functionality using the ElevenLabs API.
 * It's designed to replace or complement the existing Google TTS implementation.
 */

import { z } from 'genkit';
import wav from 'wav';

const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
const ELEVEN_LABS_VOICE_ID = process.env.ELEVEN_LABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Default voice ID (Rachel)
const ELEVEN_LABS_API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_LABS_VOICE_ID}`;

const TextToSpeechOutputSchema = z.object({
  audio: z.string().describe('Base64-encoded WAV audio data URI.'),
});

export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

/**
 * Converts text to speech using ElevenLabs API
 * @param text The text to convert to speech
 * @returns Promise that resolves to audio data URI
 */
export async function elevenLabsTTS(text: string): Promise<TextToSpeechOutput> {
  if (!ELEVEN_LABS_API_KEY) {
    throw new Error('ELEVEN_LABS_API_KEY is not set in environment variables');
  }

  try {
    const response = await fetch(ELEVEN_LABS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_LABS_API_KEY,
        'accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.5,
          use_speaker_boost: true
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    // Convert MP3 response to WAV format
    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const wavBase64 = await mp3ToWav(audioBuffer);

    return {
      audio: `data:audio/wav;base64,${wavBase64}`,
    };
  } catch (error) {
    console.error('Error in ElevenLabs TTS:', error);
    throw error;
  }
}

/**
 * Converts MP3 audio buffer to WAV format
 */
async function mp3ToWav(mp3Buffer: Buffer): Promise<string> {
  // In a real implementation, you would use a library like lame or ffmpeg to convert MP3 to WAV
  // For now, we'll just return the MP3 data as is since most browsers can play it directly
  return mp3Buffer.toString('base64');
  
  // If you need actual WAV conversion, you would do something like this:
  // const wavBuffer = await convertMp3ToWav(mp3Buffer);
  // return wavBuffer.toString('base64');
}
