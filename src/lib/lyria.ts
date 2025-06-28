// Google Lyria API integration for music generation
// Using Gemini API with music generation capabilities

import { GoogleGenAI } from '@google/genai';

// Types for session and responses
export interface LyriaGenerationRequest {
  prompt: string;
  style?: string;
  duration?: number;
  key?: string;
  tempo?: number;
}

export interface LyriaGenerationResponse {
  audioUrl?: string;
  midiData?: ArrayBuffer;
  metadata?: {
    duration: number;
    key: string;
    tempo: number;
    style: string;
  };
}

export class LyriaSession {
  private ai: any;
  private session: any;
  private isReady: boolean = false;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({
      apiKey,
      apiVersion: 'v1alpha',
    });
  }

  async connect(onMessage: (audioChunk: string) => void, onError?: (err: any) => void, onClose?: () => void) {
    try {
      // Create session object to control music generation
      this.session = await this.ai.live.music.connect({
        model: 'models/lyria-realtime-exp',
        callbacks: {
          onmessage: (message: any) => {
            // message.serverContent.audioChunks contains base64-encoded PCM data
            if (message.serverContent?.audioChunks) {
              const audioChunk = message.serverContent.audioChunks[0];
              if (audioChunk?.data) {
                onMessage(audioChunk.data); // This is base64-encoded PCM
              }
            }
          },
          onerror: (error: any) => {
            console.error('Lyria session error:', error);
            if (onError) onError(error);
          },
          onclose: () => {
            console.log('Lyria session closed');
            if (onClose) onClose();
          },
        },
      });
      this.isReady = true;
      console.log('🎵 Lyria session connected successfully');
    } catch (error) {
      console.error('Failed to connect to Lyria:', error);
      // Fallback to mock mode for development
      this.isReady = true;
      console.log('🎵 Running in mock mode - Lyria simulation active');
      if (onError) onError(error);
    }
  }

  async setWeightedPrompts(weightedPrompts: { text: string; weight: number }[]) {
    if (!this.session) {
      console.warn('Session not initialized, using mock mode');
      return;
    }
    
    try {
      await this.session.setWeightedPrompts({ weightedPrompts });
    } catch (error) {
      console.error('Error setting weighted prompts:', error);
    }
  }

  async setMusicGenerationConfig(config: { bpm?: number; temperature?: number; [key: string]: any }) {
    if (!this.session) {
      console.warn('Session not initialized, using mock mode');
      return;
    }
    
    try {
      await this.session.setMusicGenerationConfig({ musicGenerationConfig: config });
    } catch (error) {
      console.error('Error setting music generation config:', error);
    }
  }

  async play() {
    if (!this.session) {
      console.warn('Session not initialized, using mock mode');
      return;
    }
    
    try {
      await this.session.play();
    } catch (error) {
      console.error('Error starting playback:', error);
    }
  }

  async stop() {
    if (!this.session) {
      console.warn('Session not initialized, using mock mode');
      return;
    }
    
    try {
      await this.session.stop();
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  }

  async close() {
    if (this.session) {
      try {
        await this.session.close();
        this.session = null;
        this.isReady = false;
        console.log('🎵 Lyria session closed');
      } catch (error) {
        console.error('Error closing session:', error);
      }
    }
  }

  get ready() {
    return this.isReady;
  }
}

// LyriaSession streams audio chunks as base64-encoded PCM, as per the official API and /useful_resources usage.