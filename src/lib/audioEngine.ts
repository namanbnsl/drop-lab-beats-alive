
import * as Tone from 'tone';

export class DeckAudioEngine {
  public player: Tone.Player;
  public eq: Tone.EQ3;
  public filter: Tone.Filter;
  public reverb: Tone.Reverb;
  public delay: Tone.FeedbackDelay;
  public gain: Tone.Gain;
  public analyser: Tone.Analyser;
  public isLoaded: boolean = false;
  public duration: number = 0;

  constructor() {
    // Initialize audio chain
    this.player = new Tone.Player();
    this.eq = new Tone.EQ3();
    this.filter = new Tone.Filter(20000, 'lowpass');
    this.reverb = new Tone.Reverb(1);
    this.delay = new Tone.FeedbackDelay('8n', 0);
    this.gain = new Tone.Gain(0.8);
    this.analyser = new Tone.Analyser('waveform', 1024);

    // Connect audio chain
    this.player.chain(
      this.eq,
      this.filter,
      this.reverb,
      this.delay,
      this.gain,
      this.analyser,
      Tone.Destination
    );

    // Setup player events
    this.player.onstop = () => {
      console.log('Player stopped');
    };
  }

  async loadTrack(url: string) {
    try {
      await this.player.load(url);
      this.isLoaded = true;
      this.duration = this.player.buffer.duration;
      return true;
    } catch (error) {
      console.error('Error loading track:', error);
      return false;
    }
  }

  play() {
    if (this.isLoaded && Tone.context.state === 'running') {
      this.player.start();
    }
  }

  pause() {
    this.player.stop();
  }

  scrub(position: number) {
    if (this.isLoaded) {
      const time = position * this.duration;
      this.player.seek(time);
    }
  }

  setEQ(low: number, mid: number, high: number) {
    // Convert 0-100 range to -12 to +12 dB
    this.eq.low.value = (low - 50) * 0.24;
    this.eq.mid.value = (mid - 50) * 0.24;
    this.eq.high.value = (high - 50) * 0.24;
  }

  setFilter(value: number) {
    // Convert 0-100 to frequency sweep
    if (value < 50) {
      // Low-pass filter (50 to 0 = 20000Hz to 200Hz)
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 200 + (50 - value) * 396;
    } else {
      // High-pass filter (50 to 100 = 20Hz to 2000Hz)
      this.filter.type = 'highpass';
      this.filter.frequency.value = 20 + (value - 50) * 39.6;
    }
  }

  setReverb(wet: number) {
    this.reverb.wet.value = wet / 100;
  }

  setDelay(wet: number) {
    this.delay.wet.value = wet / 100;
  }

  setGain(value: number) {
    this.gain.gain.value = value / 100;
  }

  setPitch(value: number) {
    // Convert -25 to +25 to playback rate
    this.player.playbackRate = 1 + (value / 100);
  }

  getWaveform(): Float32Array {
    return this.analyser.getValue() as Float32Array;
  }

  getCurrentTime(): number {
    return this.player.immediate();
  }

  dispose() {
    this.player.dispose();
    this.eq.dispose();
    this.filter.dispose();
    this.reverb.dispose();
    this.delay.dispose();
    this.gain.dispose();
    this.analyser.dispose();
  }
}
