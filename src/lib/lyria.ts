// Google Lyria API integration for music generation
// Using Gemini API with music generation capabilities

interface LyriaGenerationRequest {
  prompt: string;
  style?: string;
  duration?: number;
  key?: string;
  tempo?: number;
}

interface LyriaGenerationResponse {
  audioUrl?: string;
  midiData?: ArrayBuffer;
  metadata?: {
    duration: number;
    key: string;
    tempo: number;
    style: string;
  };
}

class LyriaAPI {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateMelody(params: {
    key: string;
    style: string;
    length: number;
  }): Promise<LyriaGenerationResponse> {
    const prompt = `Generate a ${params.style.toLowerCase()} melody in the key of ${params.key} major, ${params.length} bars long. The melody should be suitable for electronic music production.`;

    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-pro:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Lyria API error: ${response.status}`);
      }

      const data = await response.json();
      
      // For now, return mock data since Lyria music generation is not yet publicly available
      // This will be replaced with actual audio/MIDI data when the API is released
      return this.createMockMelodyResponse(params);
    } catch (error) {
      console.error('Error calling Lyria API:', error);
      // Fallback to mock data
      return this.createMockMelodyResponse(params);
    }
  }

  async generateDrums(params: {
    style: string;
    complexity: string;
  }): Promise<LyriaGenerationResponse> {
    const prompt = `Generate a ${params.style.toLowerCase()} drum pattern with ${params.complexity.toLowerCase()} complexity. The pattern should be 2 bars long and suitable for electronic music production.`;

    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-pro:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Lyria API error: ${response.status}`);
      }

      const data = await response.json();
      
      // For now, return mock data since Lyria music generation is not yet publicly available
      return this.createMockDrumResponse(params);
    } catch (error) {
      console.error('Error calling Lyria API:', error);
      // Fallback to mock data
      return this.createMockDrumResponse(params);
    }
  }

  private createMockMelodyResponse(params: any): LyriaGenerationResponse {
    // Create a simple melody pattern based on the key
    const keyMap: { [key: string]: number[] } = {
      'C': [60, 62, 64, 65, 67, 69, 71, 72],
      'D': [62, 64, 66, 67, 69, 71, 73, 74],
      'E': [64, 66, 68, 69, 71, 73, 75, 76],
      'F': [65, 67, 69, 70, 72, 74, 76, 77],
      'G': [67, 69, 71, 72, 74, 76, 78, 79],
      'A': [69, 71, 73, 74, 76, 78, 80, 81],
      'B': [71, 73, 75, 76, 78, 80, 82, 83],
    };

    const scale = keyMap[params.key] || keyMap['C'];
    const notes = [];
    
    // Generate a simple melody pattern
    for (let i = 0; i < params.length * 4; i++) {
      const noteIndex = Math.floor(Math.random() * scale.length);
      const pitch = scale[noteIndex];
      const startTime = i * 0.5;
      const duration = 0.4;
      
      notes.push({
        pitch,
        startTime,
        endTime: startTime + duration,
        velocity: 0.7 + Math.random() * 0.3
      });
    }

    return {
      midiData: this.createMockMidiData(notes),
      metadata: {
        duration: params.length * 2,
        key: params.key,
        tempo: 120,
        style: params.style
      }
    };
  }

  private createMockDrumResponse(params: any): LyriaGenerationResponse {
    const notes = [];
    const duration = 4; // 2 bars at 120 BPM
    
    // Create drum patterns based on style
    const patterns = {
      'House': {
        kick: [0, 1, 2, 3], // Every beat
        snare: [1, 3], // Beats 2 and 4
        hihat: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] // Eighth notes
      },
      'Trap': {
        kick: [0, 0.75, 2, 2.75], // Syncopated kick
        snare: [1, 3], // Beats 2 and 4
        hihat: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75] // 16th notes
      },
      'DnB': {
        kick: [0, 2.5], // Amen break style
        snare: [1, 3.25], // Syncopated snare
        hihat: [0.5, 1.5, 2, 3] // Sparse hi-hats
      }
    };

    const pattern = patterns[params.style as keyof typeof patterns] || patterns['House'];
    
    // Add kick drum (MIDI note 36)
    pattern.kick.forEach(time => {
      notes.push({
        pitch: 36,
        startTime: time,
        endTime: time + 0.1,
        velocity: 0.9
      });
    });

    // Add snare drum (MIDI note 38)
    pattern.snare.forEach(time => {
      notes.push({
        pitch: 38,
        startTime: time,
        endTime: time + 0.1,
        velocity: 0.8
      });
    });

    // Add hi-hat (MIDI note 42)
    pattern.hihat.forEach(time => {
      notes.push({
        pitch: 42,
        startTime: time,
        endTime: time + 0.05,
        velocity: 0.6
      });
    });

    return {
      midiData: this.createMockMidiData(notes),
      metadata: {
        duration,
        key: 'C',
        tempo: 120,
        style: params.style
      }
    };
  }

  private createMockMidiData(notes: any[]): ArrayBuffer {
    // Create a simple mock MIDI data structure
    // In a real implementation, this would generate proper MIDI binary data
    const mockMidi = {
      notes,
      format: 'mock',
      ticksPerQuarter: 480
    };
    
    return new TextEncoder().encode(JSON.stringify(mockMidi)).buffer;
  }
}

export { LyriaAPI, type LyriaGenerationRequest, type LyriaGenerationResponse };