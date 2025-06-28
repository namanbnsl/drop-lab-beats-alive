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
          if (onError) onError(error);
        },
        onclose: () => {
          if (onClose) onClose();
        },
      },
    });
    this.isReady = true;
  }

  async setWeightedPrompts(weightedPrompts: { text: string; weight: number }[]) {
    if (!this.session) throw new Error('Session not initialized');
    await this.session.setWeightedPrompts({ weightedPrompts });
  }

  async setMusicGenerationConfig(config: { bpm?: number; temperature?: number;[key: string]: any }) {
    if (!this.session) throw new Error('Session not initialized');
    await this.session.setMusicGenerationConfig({ musicGenerationConfig: config });
  }

  async play() {
    if (!this.session) throw new Error('Session not initialized');
    await this.session.play();
  }

  async stop() {
    if (!this.session) throw new Error('Session not initialized');
    await this.session.stop();
  }

  async close() {
    if (this.session) {
      await this.session.close();
      this.session = null;
      this.isReady = false;
    }
  }

  get ready() {
    return this.isReady;
  }
}

// LyriaSession streams audio chunks as base64-encoded PCM, as per the official API and /useful_resources usage.