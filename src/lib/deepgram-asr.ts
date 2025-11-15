'use server';

/**
 * Deepgram Automatic Speech Recognition (ASR) Service
 * 
 * This module provides speech-to-text functionality using the Deepgram API.
 */

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || '8a5696a07fc9d81ff0498208ca52d68d4a43481a';
const DEEPGRAM_API_URL = 'https://api.deepgram.com/v1/listen?model=nova-2';

export interface TranscriptionResult {
  text: string;
  isFinal: boolean;
  confidence: number;
  words?: {
    word: string;
    start: number;
    end: number;
    confidence: number;
    punctuated_word: string;
  }[];
}

/**
 * Transcribes audio data using Deepgram's ASR API
 * @param audioData Audio data in a format supported by Deepgram (e.g., WAV, MP3, etc.)
 * @param contentType MIME type of the audio data (e.g., 'audio/wav', 'audio/mp3')
 * @returns Promise that resolves to the transcription result
 */
export async function transcribeAudio(
  audioData: ArrayBuffer | Blob,
  contentType: string = 'audio/wav'
): Promise<TranscriptionResult> {
  if (!DEEPGRAM_API_KEY) {
    throw new Error('DEEPGRAM_API_KEY is not set in environment variables');
  }

  try {
    const response = await fetch(DEEPGRAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
      },
      body: audioData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Deepgram API error: ${error}`);
    }

    const data = await response.json();
    
    // Extract the most relevant transcription result
    const result = data.results?.channels?.[0]?.alternatives?.[0];
    if (!result) {
      throw new Error('No transcription results found in the response');
    }

    return {
      text: result.transcript || '',
      isFinal: result.is_final || false,
      confidence: result.confidence || 0,
      words: result.words,
    };
  } catch (error) {
    console.error('Error in Deepgram ASR:', error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Transcribes audio from a base64 encoded string
 * @param base64Audio Base64 encoded audio data
 * @param contentType MIME type of the audio data (e.g., 'audio/wav', 'audio/mp3')
 * @returns Promise that resolves to the transcription result
 */
export async function transcribeBase64Audio(
  base64Audio: string,
  contentType: string = 'audio/wav'
): Promise<TranscriptionResult> {
  // Remove data URL prefix if present
  const base64Data = base64Audio.includes('base64,') 
    ? base64Audio.split('base64,')[1] 
    : base64Audio;
  
  const audioBuffer = Buffer.from(base64Data, 'base64');
  return transcribeAudio(audioBuffer, contentType);
}

/**
 * Transcribes audio from a file
 * @param filePath Path to the audio file
 * @returns Promise that resolves to the transcription result
 */
export async function transcribeAudioFile(filePath: string): Promise<TranscriptionResult> {
  const fs = require('fs').promises;
  const audioData = await fs.readFile(filePath);
  const contentType = getContentTypeFromFilePath(filePath);
  return transcribeAudio(audioData, contentType);
}

/**
 * Helper function to determine content type from file extension
 */
function getContentTypeFromFilePath(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'wav':
      return 'audio/wav';
    case 'mp3':
      return 'audio/mp3';
    case 'ogg':
      return 'audio/ogg';
    case 'webm':
      return 'audio/webm';
    case 'm4a':
      return 'audio/m4a';
    default:
      return 'application/octet-stream';
  }
}
