import * as Tone from 'tone';
import { LyriaSession } from './lyria';

export interface AudioTrack {
  id: string;
  name: string;
  type: 'melody' | 'drums' | 'bass' | 'harmony';
  synth: Tone.Synth | Tone.MembraneSynth | Tone.NoiseSynth | Tone.PolySynth;
  effects: {
    reverb: Tone.Reverb;
    delay: Tone.FeedbackDelay;
    filter: Tone.Filter;
    distortion: Tone.Distortion;
  };
  gain: Tone.Gain;
  pattern: number[];
  notes: { time: number; pitch: number; velocity: number; duration: number }[];
  isPlaying: boolean;
  isMuted: boolean;
  isSolo: boolean;
}

export interface LyriaGenerationRequest {
  trackType: 'melody' | 'drums' | 'bass' | 'harmony';
  style: string;
  key: string;
  tempo: number;
  complexity: number;
  mood: string;
  length: number; // in bars
}

export class LyriaAudioEngine {
  private tracks: Map<string, AudioTrack> = new Map();
  private masterGain: Tone.Gain;
  private recorder: Tone.Recorder;
  private metronome: Tone.Synth;
  private sequencer: Tone.Sequence | null = null;
  private lyria: LyriaSession | null = null;
  private isInitialized = false;
  
  // Transport state
  private currentStep = 0;
  private currentBar = 1;
  private totalBars = 4;
  private tempo = 120;
  private isPlaying = false;

  constructor() {
    this.masterGain = new Tone.Gain(0.7).toDestination();
    this.recorder = new Tone.Recorder();
    this.masterGain.connect(this.recorder);
    
    // Create silent metronome for internal timing
    this.metronome = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
    });
    const metronomeGain = new Tone.Gain(0); // Silent
    this.metronome.connect(metronomeGain);
    metronomeGain.connect(this.masterGain);
  }

  async initialize(lyriaApiKey?: string): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Tone.start();
      
      // Initialize Lyria if API key provided
      if (lyriaApiKey) {
        this.lyria = new LyriaSession(lyriaApiKey);
        await this.lyria.connect(
          (audioChunk: string) => this.processLyriaAudio(audioChunk),
          (error) => console.error('Lyria error:', error),
          () => console.log('Lyria session closed')
        );
        console.log('🤖 Lyria AI connected');
      }

      // Create default tracks
      await this.createTrack('drums', 'AI Drums', 'drums');
      await this.createTrack('bass', 'AI Bass', 'bass');
      await this.createTrack('melody', 'AI Melody', 'melody');
      await this.createTrack('harmony', 'AI Harmony', 'harmony');

      this.isInitialized = true;
      console.log('🎵 Lyria Audio Engine initialized');
      
    } catch (error) {
      console.error('Failed to initialize Lyria Audio Engine:', error);
      throw error;
    }
  }

  private async createTrack(id: string, name: string, type: AudioTrack['type']): Promise<void> {
    let synth: AudioTrack['synth'];
    
    switch (type) {
      case 'drums':
        synth = new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 10,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
        });
        break;
      case 'bass':
        synth = new Tone.Synth({
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 1.2 }
        });
        break;
      case 'melody':
        synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.8 }
        });
        break;
      case 'harmony':
        synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.8, decay: 0.5, sustain: 0.7, release: 2.0 }
        });
        break;
      default:
        synth = new Tone.Synth();
    }

    // Create effects chain
    const reverb = new Tone.Reverb(2);
    const delay = new Tone.FeedbackDelay('8n', 0.3);
    const filter = new Tone.Filter(20000, 'lowpass');
    const distortion = new Tone.Distortion(0.4);
    const gain = new Tone.Gain(0.8);

    // Connect audio chain
    synth.chain(filter, distortion, reverb, delay, gain, this.masterGain);

    // Set initial effect values
    reverb.wet.value = 0;
    delay.wet.value = 0;
    distortion.wet.value = 0;

    const track: AudioTrack = {
      id,
      name,
      type,
      synth,
      effects: { reverb, delay, filter, distortion },
      gain,
      pattern: new Array(16).fill(0),
      notes: [],
      isPlaying: false,
      isMuted: false,
      isSolo: false
    };

    this.tracks.set(id, track);
  }

  async generateContent(request: LyriaGenerationRequest): Promise<boolean> {
    if (!this.lyria) {
      console.warn('Lyria not connected');
      return false;
    }

    try {
      // Configure Lyria for generation
      const prompt = `Generate a ${request.trackType} pattern in ${request.key} ${request.style} style at ${request.tempo} BPM with ${request.mood} mood, ${request.length} bars long`;
      
      await this.lyria.setWeightedPrompts([{ text: prompt, weight: 1.0 }]);
      await this.lyria.setMusicGenerationConfig({
        bpm: request.tempo,
        temperature: request.complexity
      });

      // Start generation
      await this.lyria.play();
      
      // Generate pattern based on AI output (simulated for now)
      setTimeout(() => {
        const pattern = this.generatePatternFromAI(request.trackType);
        const notes = this.generateNotesFromAI(request.trackType, request.key);
        this.updateTrackContent(request.trackType, pattern, notes);
      }, 2000);

      return true;
    } catch (error) {
      console.error('Content generation failed:', error);
      return false;
    }
  }

  private processLyriaAudio(audioChunk: string): void {
    try {
      // Process real-time audio from Lyria
      // This would integrate with the actual audio playback
      console.log('Processing Lyria audio chunk:', audioChunk.length);
    } catch (error) {
      console.error('Error processing Lyria audio:', error);
    }
  }

  private generatePatternFromAI(trackType: string): number[] {
    const pattern = new Array(16).fill(0);
    
    switch (trackType) {
      case 'drums':
        // Generate realistic drum pattern
        [0, 4, 8, 12].forEach(i => pattern[i] = 127); // Kick
        [4, 12].forEach(i => pattern[i] = 100); // Snare
        for (let i = 0; i < 16; i += 2) {
          if (pattern[i] === 0) pattern[i] = 60; // Hi-hat
        }
        break;
      case 'bass':
        // Generate bass pattern
        [0, 2, 6, 8, 10, 14].forEach(i => pattern[i] = 100 + Math.random() * 27);
        break;
      case 'melody':
        // Generate melody pattern
        [0, 3, 5, 7, 10, 12, 15].forEach(i => {
          if (Math.random() > 0.3) pattern[i] = 80 + Math.random() * 47;
        });
        break;
      case 'harmony':
        // Generate harmony pattern
        [1, 4, 6, 9, 11, 13].forEach(i => {
          if (Math.random() > 0.5) pattern[i] = 60 + Math.random() * 40;
        });
        break;
    }
    
    return pattern;
  }

  private generateNotesFromAI(trackType: string, key: string): { time: number; pitch: number; velocity: number; duration: number }[] {
    const notes: { time: number; pitch: number; velocity: number; duration: number }[] = [];
    const keyOffset = this.getKeyOffset(key);
    
    switch (trackType) {
      case 'bass':
        // Generate bass notes
        for (let i = 0; i < 16; i++) {
          if (Math.random() > 0.6) {
            notes.push({
              time: i / 4, // 16th note timing
              pitch: 36 + keyOffset + Math.floor(Math.random() * 12), // Bass range
              velocity: 0.8 + Math.random() * 0.2,
              duration: 0.25
            });
          }
        }
        break;
      case 'melody':
        // Generate melody notes
        for (let i = 0; i < 16; i++) {
          if (Math.random() > 0.4) {
            notes.push({
              time: i / 4,
              pitch: 60 + keyOffset + Math.floor(Math.random() * 24), // Melody range
              velocity: 0.6 + Math.random() * 0.4,
              duration: 0.25 + Math.random() * 0.5
            });
          }
        }
        break;
      case 'harmony':
        // Generate harmony notes (chords)
        for (let i = 0; i < 4; i++) {
          if (Math.random() > 0.3) {
            const rootPitch = 48 + keyOffset + Math.floor(Math.random() * 12);
            // Add chord tones
            [0, 4, 7].forEach(interval => {
              notes.push({
                time: i,
                pitch: rootPitch + interval,
                velocity: 0.5 + Math.random() * 0.3,
                duration: 1
              });
            });
          }
        }
        break;
    }
    
    return notes;
  }

  private getKeyOffset(key: string): number {
    const keyMap: { [key: string]: number } = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    return keyMap[key] || 0;
  }

  private updateTrackContent(trackType: string, pattern: number[], notes: { time: number; pitch: number; velocity: number; duration: number }[]): void {
    const track = this.tracks.get(trackType);
    if (track) {
      track.pattern = pattern;
      track.notes = notes;
      console.log(`✨ Generated ${trackType} content with ${notes.length} notes`);
    }
  }

  // Transport controls
  async play(): Promise<void> {
    if (this.isPlaying) return;

    await Tone.start();
    Tone.Transport.bpm.value = this.tempo;

    // Create sequencer that only triggers on bar boundaries
    if (this.sequencer) {
      this.sequencer.dispose();
    }

    this.sequencer = new Tone.Sequence((time, step) => {
      // Only play patterns at the start of each bar
      if (step % 16 === 0) {
        this.playCurrentPatterns(time);
      }

      // Update step counter
      this.currentStep = step % 16;
      if (step % 16 === 0) {
        this.currentBar = (this.currentBar % this.totalBars) + 1;
      }

      // Silent metronome tick
      this.metronome.triggerAttackRelease('C4', '16n', time, 0);

    }, Array.from({ length: 16 }, (_, i) => i), '16n');

    this.sequencer.start(0);
    Tone.Transport.start();
    this.isPlaying = true;
    console.log('▶️ Playback started');
  }

  pause(): void {
    if (this.isPlaying) {
      Tone.Transport.pause();
      this.isPlaying = false;
      console.log('⏸️ Playback paused');
    }
  }

  stop(): void {
    if (this.isPlaying) {
      Tone.Transport.stop();
      if (this.sequencer) {
        this.sequencer.stop();
      }
      this.isPlaying = false;
      this.currentStep = 0;
      this.currentBar = 1;
      console.log('⏹️ Playback stopped');
    }
  }

  private playCurrentPatterns(time: number): void {
    this.tracks.forEach(track => {
      if (track.isMuted || (!track.isPlaying && !this.hasAnyTrackSolo())) return;
      if (this.hasAnyTrackSolo() && !track.isSolo) return;

      track.pattern.forEach((velocity, step) => {
        if (velocity > 0) {
          const stepTime = time + (step * (60 / this.tempo / 4)); // 16th note timing

          if (track.type === 'drums') {
            // Trigger drum sounds
            (track.synth as Tone.MembraneSynth).triggerAttackRelease('C2', '16n', stepTime, velocity / 127);
          } else {
            // Trigger melodic sounds
            const note = track.notes.find(n => Math.floor(n.time * 4) === step);
            if (note) {
              const frequency = Tone.Frequency(note.pitch, 'midi').toFrequency();
              (track.synth as Tone.Synth | Tone.PolySynth).triggerAttackRelease(frequency, note.duration + 's', stepTime, note.velocity);
            }
          }
        }
      });
    });
  }

  private hasAnyTrackSolo(): boolean {
    return Array.from(this.tracks.values()).some(track => track.isSolo);
  }

  // Track management
  getTrack(id: string): AudioTrack | undefined {
    return this.tracks.get(id);
  }

  getAllTracks(): AudioTrack[] {
    return Array.from(this.tracks.values());
  }

  updateTrackPattern(trackId: string, pattern: number[]): void {
    const track = this.tracks.get(trackId);
    if (track) {
      track.pattern = pattern;
    }
  }

  setTrackVolume(trackId: string, volume: number): void {
    const track = this.tracks.get(trackId);
    if (track) {
      track.gain.gain.rampTo(volume / 100, 0.1);
    }
  }

  setTrackMute(trackId: string, muted: boolean): void {
    const track = this.tracks.get(trackId);
    if (track) {
      track.isMuted = muted;
    }
  }

  setTrackSolo(trackId: string, solo: boolean): void {
    const track = this.tracks.get(trackId);
    if (track) {
      track.isSolo = solo;
    }
  }

  setTrackEffect(trackId: string, effectType: keyof AudioTrack['effects'], value: number): void {
    const track = this.tracks.get(trackId);
    if (track) {
      const effect = track.effects[effectType];
      if (effect instanceof Tone.Reverb || effect instanceof Tone.FeedbackDelay) {
        effect.wet.rampTo(value / 100, 0.1);
      } else if (effect instanceof Tone.Filter) {
        const frequency = value <= 50 
          ? 20 + ((value / 50) * 19980)
          : 20000;
        effect.frequency.rampTo(frequency, 0.1);
      } else if (effect instanceof Tone.Distortion) {
        effect.wet.rampTo(value / 100, 0.1);
      }
    }
  }

  // Recording
  async startRecording(): Promise<void> {
    await this.recorder.start();
    console.log('🎙️ Recording started');
  }

  async stopRecording(): Promise<Blob> {
    const recording = await this.recorder.stop();
    console.log('🎙️ Recording stopped');
    return recording;
  }

  // Getters
  get currentStepNumber(): number { return this.currentStep; }
  get currentBarNumber(): number { return this.currentBar; }
  get isCurrentlyPlaying(): boolean { return this.isPlaying; }
  get currentTempo(): number { return this.tempo; }

  // Setters
  set currentTempo(bpm: number) {
    this.tempo = bpm;
    if (this.isPlaying) {
      Tone.Transport.bpm.rampTo(bpm, 0.1);
    }
  }

  // Cleanup
  dispose(): void {
    this.stop();
    this.tracks.forEach(track => {
      track.synth.dispose();
      Object.values(track.effects).forEach(effect => effect.dispose());
      track.gain.dispose();
    });
    this.tracks.clear();
    this.masterGain.dispose();
    this.recorder.dispose();
    this.metronome.dispose();
    
    if (this.lyria) {
      this.lyria.close();
    }
  }
}