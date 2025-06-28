import * as Tone from 'tone';

export class DeckAudioEngine {
  private player: Tone.Player | null = null;
  private gain: Tone.Gain;
  private eq: { low: Tone.EQ3; mid: Tone.EQ3; high: Tone.EQ3 };
  private filter: Tone.Filter;
  private reverb: Tone.Reverb;
  private delay: Tone.FeedbackDelay;
  private pitchShift: Tone.PitchShift;
  private backspinPlayer: Tone.Player;
  public isLoaded: boolean = false;
  public isPlaying: boolean = false;
  private currentBPM: number = 120;
  private trackDuration: number = 0;
  private startTime: number = 0;
  private pausedAt: number = 0;
  private cuePoint: number = 0;

  constructor() {
    // Initialize audio chain
    this.gain = new Tone.Gain(0.75);
    this.eq = {
      low: new Tone.EQ3(),
      mid: new Tone.EQ3(),
      high: new Tone.EQ3()
    };
    this.filter = new Tone.Filter(20000, 'lowpass'); // Start with no filtering
    this.reverb = new Tone.Reverb(2);
    this.delay = new Tone.FeedbackDelay('8n', 0.3);
    this.pitchShift = new Tone.PitchShift();
    this.backspinPlayer = new Tone.Player('/backspin.mp3').toDestination();

    // Connect audio chain: EQ -> Filter -> FX -> Pitch -> Gain -> Output
    this.eq.low.chain(
      this.eq.mid, 
      this.eq.high, 
      this.filter, 
      this.reverb, 
      this.delay, 
      this.pitchShift, 
      this.gain
    );
    this.gain.toDestination();

    // Set initial FX wet values to 0
    this.reverb.wet.value = 0;
    this.delay.wet.value = 0;

    // Load backspin effect
    this.backspinPlayer.load('/backspin.mp3').catch(console.warn);
  }

  async loadTrack(url: string, bpm: number = 120): Promise<boolean> {
    try {
      if (this.player) {
        this.player.dispose();
      }

      this.player = new Tone.Player({
        url: url,
        loop: false,
        autostart: false
      });
      
      this.player.connect(this.eq.low);
      this.currentBPM = bpm;
      
      await this.player.load(url);
      this.isLoaded = true;
      this.trackDuration = this.player.buffer.duration;
      this.isPlaying = false;
      this.pausedAt = 0;
      this.cuePoint = 0; // Reset cue point on new track
      
      console.log(`✅ Track loaded: ${url} (${this.trackDuration.toFixed(2)}s, ${bpm} BPM)`);
      return true;
    } catch (error) {
      console.error('❌ Failed to load track:', error);
      this.isLoaded = false;
      return false;
    }
  }

  play(fromCue: boolean = false) {
    if (this.player && this.isLoaded && !this.isPlaying) {
      const startPosition = fromCue ? this.cuePoint : this.pausedAt;
      this.startTime = Tone.now() - startPosition;
      this.player.start(0, startPosition);
      this.isPlaying = true;
      console.log(`▶️ Track playing from ${startPosition.toFixed(2)}s`);
    }
  }

  pause() {
    if (this.player && this.isPlaying) {
      this.pausedAt = this.getCurrentTime();
      this.player.stop();
      this.isPlaying = false;
      console.log(`⏸️ Track paused at ${this.pausedAt.toFixed(2)}s`);
    }
  }

  seek(position: number) {
    if (this.player && this.isLoaded) {
      const wasPlaying = this.isPlaying;
      
      if (wasPlaying) {
        this.pause();
      }
      
      // Clamp position between 0 and track duration
      const clampedPosition = Math.max(0, Math.min(position, this.trackDuration));
      this.pausedAt = clampedPosition;
      
      if (wasPlaying) {
        this.play();
      }
      
      console.log(`🎯 Seeked to ${clampedPosition.toFixed(2)}s`);
    }
  }

  scrub(velocity: number) {
    if (this.player && this.isLoaded) {
      const currentTime = this.getCurrentTime();
      const scrubAmount = velocity * 0.1; // Scale velocity to time
      const newTime = Math.max(0, Math.min(currentTime + scrubAmount, this.trackDuration));
      
      // Update position without restarting playback
      this.pausedAt = newTime;
      
      if (!this.isPlaying) {
        // If not playing, just update the position
        this.seek(newTime);
      } else {
        // If playing, temporarily adjust the start time for smooth scrubbing
        this.startTime = Tone.now() - newTime;
      }
    }
  }

  setCuePoint(position?: number) {
    if (this.isLoaded) {
      this.cuePoint = position !== undefined ? position : this.getCurrentTime();
      console.log(`🎯 Cue point set at ${this.cuePoint.toFixed(2)}s`);
    }
  }

  jumpToCue() {
    if (this.isLoaded && this.cuePoint >= 0) {
      this.seek(this.cuePoint);
    }
  }

  getCurrentTime(): number {
    if (this.player && this.isLoaded) {
      if (this.isPlaying) {
        return Tone.now() - this.startTime;
      } else {
        return this.pausedAt;
      }
    }
    return 0;
  }

  getDuration(): number {
    return this.trackDuration;
  }

  getBPM(): number {
    return this.currentBPM;
  }

  setPitch(cents: number) {
    if (this.pitchShift) {
      // Convert percentage to cents (100 cents = 1 semitone)
      this.pitchShift.pitch = cents;
      
      // Also adjust playback rate for tempo changes
      if (this.player) {
        const pitchRatio = Math.pow(2, cents / 1200); // Convert cents to ratio
        this.player.playbackRate = pitchRatio;
      }
    }
  }

  setEQ(low: number, mid: number, high: number) {
    // Convert 0-100 range to dB (-15 to +15)
    const lowDb = ((low - 50) / 50) * 15;
    const midDb = ((mid - 50) / 50) * 15;
    const highDb = ((high - 50) / 50) * 15;

    this.eq.low.low.rampTo(lowDb, 0.1);
    this.eq.mid.mid.rampTo(midDb, 0.1);
    this.eq.high.high.rampTo(highDb, 0.1);
  }

  setGain(value: number) {
    if (this.gain) {
      this.gain.gain.rampTo(value / 100, 0.1);
    }
  }

  setFilter(value: number) {
    if (this.filter) {
      // Convert 0-100 to frequency range (20Hz to 20kHz)
      // 50 = no filtering (20kHz), lower values = more filtering
      const frequency = value <= 50 
        ? 20 + ((value / 50) * 19980)  // Low-pass: 20Hz to 20kHz
        : 20000; // No filtering above 50
      
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

  triggerBackspin() {
    if (this.isPlaying) {
      console.log('🌀 Triggering backspin effect');
      
      // Store current position
      const currentTime = this.getCurrentTime();
      
      // Pause main track
      this.pause();
      
      // Play backspin effect
      if (this.backspinPlayer.loaded) {
        this.backspinPlayer.start();
      }
      
      // Seek backward and resume after backspin effect
      setTimeout(() => {
        const newTime = Math.max(0, currentTime - 1.5); // Go back 1.5 seconds
        this.seek(newTime);
        this.play();
      }, 600); // Backspin effect duration
    } else {
      // If not playing, just play the backspin sound
      if (this.backspinPlayer.loaded) {
        this.backspinPlayer.start();
      }
    }
  }

  syncToTransport() {
    if (this.player && this.isLoaded) {
      // This will be called by the store's sync function
      // The actual scheduling is handled in the store
      console.log('🎯 Deck ready for sync');
    }
  }

  getWaveform(): Float32Array {
    // Generate a mock waveform for visualization
    const waveform = new Float32Array(128);
    const time = this.getCurrentTime();
    
    for (let i = 0; i < waveform.length; i++) {
      // Create a dynamic waveform based on current time and playing state
      const amplitude = this.isPlaying ? 0.5 : 0.1;
      waveform[i] = Math.sin((i + time * 10) * 0.1) * amplitude;
    }
    
    return waveform;
  }

  dispose() {
    if (this.player) {
      this.player.dispose();
    }
    this.backspinPlayer.dispose();
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