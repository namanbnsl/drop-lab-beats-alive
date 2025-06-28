import * as Tone from 'tone';

export class DeckAudioEngine {
  private player: Tone.Player | null = null;
  private gain: Tone.Gain;
  private eq: { low: Tone.EQ3; mid: Tone.EQ3; high: Tone.EQ3 };
  private filter: Tone.Filter;
  private reverb: Tone.Reverb;
  private delay: Tone.FeedbackDelay;
  private pitchShift: Tone.PitchShift;
  public isLoaded: boolean = false;

  constructor() {
    // Initialize audio chain
    this.gain = new Tone.Gain(0.75);
    this.eq = {
      low: new Tone.EQ3(),
      mid: new Tone.EQ3(),
      high: new Tone.EQ3()
    };
    this.filter = new Tone.Filter(1000, 'lowpass');
    this.reverb = new Tone.Reverb(2);
    this.delay = new Tone.FeedbackDelay('8n', 0.3);
    this.pitchShift = new Tone.PitchShift();

    // Connect audio chain
    this.eq.low.chain(this.eq.mid, this.eq.high, this.filter, this.reverb, this.delay, this.pitchShift, this.gain);
    this.gain.toDestination();
  }

  async loadTrack(url: string): Promise<boolean> {
    try {
      if (this.player) {
        this.player.dispose();
      }

      this.player = new Tone.Player(url);
      this.player.connect(this.eq.low);
      
      await new Promise((resolve, reject) => {
        this.player!.load(url).then(() => {
          this.isLoaded = true;
          resolve(true);
        }).catch(reject);
      });

      return true;
    } catch (error) {
      console.error('Failed to load track:', error);
      this.isLoaded = false;
      return false;
    }
  }

  play() {
    if (this.player && this.isLoaded) {
      this.player.start();
    }
  }

  pause() {
    if (this.player) {
      this.player.stop();
    }
  }

  setPitch(cents: number) {
    if (this.pitchShift) {
      this.pitchShift.pitch = cents;
    }
  }

  setEQ(low: number, mid: number, high: number) {
    // Convert 0-100 range to dB (-12 to +12)
    const lowDb = ((low - 50) / 50) * 12;
    const midDb = ((mid - 50) / 50) * 12;
    const highDb = ((high - 50) / 50) * 12;

    this.eq.low.low.value = lowDb;
    this.eq.mid.mid.value = midDb;
    this.eq.high.high.value = highDb;
  }

  setGain(value: number) {
    if (this.gain) {
      this.gain.gain.rampTo(value / 100, 0.1);
    }
  }

  setFilter(value: number) {
    if (this.filter) {
      // Convert 0-100 to frequency range (20Hz to 20kHz)
      const frequency = 20 + (value / 100) * 19980;
      this.filter.frequency.rampTo(frequency, 0.1);
    }
  }

  setReverb(value: number) {
    if (this.reverb) {
      this.reverb.wet.rampTo(value / 100, 0.1);
    }
  }

  setDelay(value: number) {
    if (this.delay) {
      this.delay.wet.rampTo(value / 100, 0.1);
    }
  }

  getWaveform(): Float32Array {
    // Return a mock waveform for visualization
    const waveform = new Float32Array(128);
    for (let i = 0; i < waveform.length; i++) {
      waveform[i] = Math.sin(i * 0.1) * 0.5;
    }
    return waveform;
  }

  dispose() {
    if (this.player) {
      this.player.dispose();
    }
    this.gain.dispose();
    this.eq.low.dispose();
    this.eq.mid.dispose();
    this.eq.high.dispose();
    this.filter.dispose();
    this.reverb.dispose();
    this.delay.dispose();
    this.pitchShift.dispose();
  }
}