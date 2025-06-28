import * as Tone from 'tone';

export interface AudioPattern {
  notes: Array<{
    time: string;
    note: string;
    duration: string;
    velocity?: number;
  }>;
  drums: Array<{
    time: string;
    drum: string;
    velocity?: number;
  }>;
}

export class AudioEngine {
  private synths: Map<string, Tone.PolySynth> = new Map();
  private drums: Map<string, Tone.MembraneSynth | Tone.MetalSynth | Tone.NoiseSynth> = new Map();
  private effects: Map<string, Tone.Effect> = new Map();
  private masterGain: Tone.Gain;
  private isInitialized = false;

  constructor() {
    this.masterGain = new Tone.Gain(0.7).toDestination();
    this.initializeInstruments();
  }

  private async initializeInstruments() {
    if (this.isInitialized) return;

    // Initialize synthesizers for different genres
    this.synths.set('lead', new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.8 }
    }).connect(this.masterGain));

    this.synths.set('bass', new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 1.2 }
    }).connect(this.masterGain));

    this.synths.set('pad', new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.8, decay: 0.5, sustain: 0.7, release: 2.0 }
    }).connect(this.masterGain));

    this.synths.set('pluck', new Tone.PolySynth(Tone.PluckSynth).connect(this.masterGain));

    // Initialize drum machines
    this.drums.set('kick', new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 10,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
    }).connect(this.masterGain));

    this.drums.set('snare', new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.0 }
    }).connect(this.masterGain));

    this.drums.set('hihat', new Tone.MetalSynth({
      frequency: 200,
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    }).connect(this.masterGain));

    // Initialize effects
    this.effects.set('reverb', new Tone.Reverb(2).connect(this.masterGain));
    this.effects.set('delay', new Tone.FeedbackDelay('8n', 0.3).connect(this.masterGain));
    this.effects.set('filter', new Tone.Filter(1000, 'lowpass').connect(this.masterGain));
    this.effects.set('distortion', new Tone.Distortion(0.4).connect(this.masterGain));

    this.isInitialized = true;
  }

  async start() {
    await Tone.start();
    await this.initializeInstruments();
  }

  generatePattern(genreId: string): AudioPattern {
    const patterns = this.getGenrePatterns();
    return patterns[genreId] || patterns['default'];
  }

  private getGenrePatterns(): Record<string, AudioPattern> {
    return {
      'bossa-nova': {
        notes: [
          { time: '0:0:0', note: 'C4', duration: '4n' },
          { time: '0:1:0', note: 'E4', duration: '4n' },
          { time: '0:2:0', note: 'G4', duration: '4n' },
          { time: '0:3:0', note: 'B4', duration: '4n' }
        ],
        drums: [
          { time: '0:0:0', drum: 'kick' },
          { time: '0:2:0', drum: 'snare' },
          { time: '0:1:0', drum: 'hihat' },
          { time: '0:3:0', drum: 'hihat' }
        ]
      },
      'chillwave': {
        notes: [
          { time: '0:0:0', note: 'A3', duration: '2n' },
          { time: '0:2:0', note: 'C4', duration: '2n' },
          { time: '1:0:0', note: 'E4', duration: '2n' },
          { time: '1:2:0', note: 'G4', duration: '2n' }
        ],
        drums: [
          { time: '0:0:0', drum: 'kick' },
          { time: '0:2:0', drum: 'kick' },
          { time: '0:1:0', drum: 'hihat' },
          { time: '0:3:0', drum: 'hihat' }
        ]
      },
      'drum-and-bass': {
        notes: [
          { time: '0:0:0', note: 'D2', duration: '8n' },
          { time: '0:0:2', note: 'D2', duration: '8n' },
          { time: '0:1:0', note: 'F2', duration: '8n' },
          { time: '0:1:2', note: 'A2', duration: '8n' }
        ],
        drums: [
          { time: '0:0:0', drum: 'kick' },
          { time: '0:1:0', drum: 'snare' },
          { time: '0:0:2', drum: 'hihat' },
          { time: '0:1:2', drum: 'hihat' },
          { time: '0:2:2', drum: 'hihat' },
          { time: '0:3:2', drum: 'hihat' }
        ]
      },
      'shoegaze': {
        notes: [
          { time: '0:0:0', note: 'E3', duration: '1n' },
          { time: '0:0:0', note: 'G3', duration: '1n' },
          { time: '0:0:0', note: 'B3', duration: '1n' },
          { time: '1:0:0', note: 'D4', duration: '1n' },
          { time: '1:0:0', note: 'F#4', duration: '1n' },
          { time: '1:0:0', note: 'A4', duration: '1n' }
        ],
        drums: [
          { time: '0:0:0', drum: 'kick' },
          { time: '0:2:0', drum: 'snare' },
          { time: '0:1:0', drum: 'hihat' },
          { time: '0:3:0', drum: 'hihat' }
        ]
      },
      'chiptune': {
        notes: [
          { time: '0:0:0', note: 'C5', duration: '16n' },
          { time: '0:0:1', note: 'E5', duration: '16n' },
          { time: '0:0:2', note: 'G5', duration: '16n' },
          { time: '0:0:3', note: 'C6', duration: '16n' },
          { time: '0:1:0', note: 'G5', duration: '16n' },
          { time: '0:1:1', note: 'E5', duration: '16n' },
          { time: '0:1:2', note: 'C5', duration: '16n' },
          { time: '0:1:3', note: 'E5', duration: '16n' }
        ],
        drums: [
          { time: '0:0:0', drum: 'kick' },
          { time: '0:1:0', drum: 'kick' },
          { time: '0:2:0', drum: 'snare' },
          { time: '0:3:0', drum: 'kick' }
        ]
      },
      'trip-hop': {
        notes: [
          { time: '0:0:0', note: 'F#2', duration: '4n' },
          { time: '0:2:0', note: 'A2', duration: '4n' },
          { time: '1:0:0', note: 'C#3', duration: '4n' },
          { time: '1:2:0', note: 'E3', duration: '4n' }
        ],
        drums: [
          { time: '0:0:0', drum: 'kick' },
          { time: '0:2:2', drum: 'snare' },
          { time: '0:1:2', drum: 'hihat' },
          { time: '0:3:0', drum: 'hihat' }
        ]
      },
      'default': {
        notes: [
          { time: '0:0:0', note: 'C4', duration: '4n' },
          { time: '0:1:0', note: 'E4', duration: '4n' },
          { time: '0:2:0', note: 'G4', duration: '4n' },
          { time: '0:3:0', note: 'C5', duration: '4n' }
        ],
        drums: [
          { time: '0:0:0', drum: 'kick' },
          { time: '0:2:0', drum: 'snare' },
          { time: '0:1:0', drum: 'hihat' },
          { time: '0:3:0', drum: 'hihat' }
        ]
      }
    };
  }

  async playPattern(pattern: AudioPattern, genreId: string) {
    await this.start();

    // Stop any existing patterns
    Tone.Transport.stop();
    Tone.Transport.cancel();

    // Configure synth based on genre
    this.configureSynthForGenre(genreId);

    // Schedule notes
    const notePart = new Tone.Part((time, note) => {
      const synth = this.getSynthForGenre(genreId);
      synth?.triggerAttackRelease(note.note, note.duration, time, note.velocity || 0.7);
    }, pattern.notes);

    // Schedule drums
    const drumPart = new Tone.Part((time, drum) => {
      const drumSynth = this.drums.get(drum.drum);
      if (drumSynth) {
        if (drum.drum === 'kick' || drum.drum === 'snare') {
          (drumSynth as Tone.MembraneSynth | Tone.NoiseSynth).triggerAttackRelease('C2', '8n', time, drum.velocity || 0.8);
        } else {
          (drumSynth as Tone.MetalSynth).triggerAttackRelease('16n', time, drum.velocity || 0.6);
        }
      }
    }, pattern.drums);

    // Set loop points
    notePart.loop = true;
    notePart.loopEnd = '2m';
    drumPart.loop = true;
    drumPart.loopEnd = '2m';

    // Start parts
    notePart.start(0);
    drumPart.start(0);

    // Set tempo based on genre
    Tone.Transport.bpm.value = this.getBPMForGenre(genreId);
    Tone.Transport.start();

    return { notePart, drumPart };
  }

  private configureSynthForGenre(genreId: string) {
    const leadSynth = this.synths.get('lead');
    if (!leadSynth) return;

    switch (genreId) {
      case 'chiptune':
        leadSynth.set({
          oscillator: { type: 'square' },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.3 }
        });
        break;
      case 'shoegaze':
        leadSynth.set({
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.5, decay: 0.3, sustain: 0.8, release: 1.5 }
        });
        break;
      case 'drum-and-bass':
        leadSynth.set({
          oscillator: { type: 'square' },
          envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.5 }
        });
        break;
      default:
        leadSynth.set({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.8 }
        });
    }
  }

  private getSynthForGenre(genreId: string): Tone.PolySynth | undefined {
    switch (genreId) {
      case 'drum-and-bass':
      case 'trip-hop':
        return this.synths.get('bass');
      case 'shoegaze':
      case 'chillwave':
        return this.synths.get('pad');
      case 'bossa-nova':
        return this.synths.get('pluck');
      default:
        return this.synths.get('lead');
    }
  }

  private getBPMForGenre(genreId: string): number {
    const bpmMap: Record<string, number> = {
      'bossa-nova': 120,
      'chillwave': 85,
      'drum-and-bass': 174,
      'post-punk': 140,
      'shoegaze': 110,
      'funk': 115,
      'chiptune': 150,
      'trip-hop': 90,
      'dubstep': 140,
      'thrash': 180
    };
    return bpmMap[genreId] || 120;
  }

  stop() {
    Tone.Transport.stop();
    Tone.Transport.cancel();
  }

  setMasterVolume(volume: number) {
    this.masterGain.gain.rampTo(volume, 0.1);
  }

  dispose() {
    this.stop();
    this.synths.forEach(synth => synth.dispose());
    this.drums.forEach(drum => drum.dispose());
    this.effects.forEach(effect => effect.dispose());
    this.masterGain.dispose();
  }
}