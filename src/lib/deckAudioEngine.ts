import * as Tone from 'tone';
import { calculatePlaybackRate, getBPMInfo, BPMInfo } from './bpmDetector';

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
  private currentBPM: number = 128;
  private originalBPM: number = 128;
  private globalBPM: number = 128;
  private trackDuration: number = 0;
  private startTime: number = 0;
  private pausedAt: number = 0;
  private cuePoint: number = 0;
  private basePlaybackRate: number = 1;
  private tempoBendTimeout: NodeJS.Timeout | null = null;
  
  // Enhanced beat snapping properties
  private isQueued: boolean = false;
  private isGridAligned: boolean = false;
  private nextBeatTime: number = 0;
  private beatInterval: number = 0;
  private gridUpdateInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize audio chain
    this.gain = new Tone.Gain(0.75);
    this.eq = {
      low: new Tone.EQ3(),
      mid: new Tone.EQ3(),
      high: new Tone.EQ3()
    };
    this.filter = new Tone.Filter(20000, 'lowpass');
    this.reverb = new Tone.Reverb(2);
    this.delay = new Tone.FeedbackDelay('8n', 0.3);
    this.pitchShift = new Tone.PitchShift();
    this.backspinPlayer = new Tone.Player('/backspin.mp3').toDestination();

    // Connect audio chain
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

  async loadTrack(url: string, userDefinedBPM: number): Promise<boolean> {
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
      
      await this.player.load(url);
      this.trackDuration = this.player.buffer.duration;
      this.isLoaded = true;
      this.isPlaying = false;
      this.pausedAt = 0;
      this.cuePoint = 0;

      // Use user-defined BPM and auto-sync to 128 BPM
      this.originalBPM = userDefinedBPM;
      this.globalBPM = 128; // Always sync to 128 BPM
      this.currentBPM = this.globalBPM;
      this.beatInterval = 60 / this.globalBPM; // seconds per beat
      
      // Set initial playback rate for auto-sync
      this.updatePlaybackRate();
      
      // 🎯 ENHANCED BEAT SNAPPING: Immediate alignment
      await this.snapToNextBeat();
      
      console.log(`✅ Track loaded and beat-snapped: ${url} (${this.trackDuration.toFixed(2)}s, ${this.originalBPM} BPM → ${this.globalBPM} BPM)`);
      return true;
    } catch (error) {
      console.error('❌ Failed to load track:', error);
      this.isLoaded = false;
      return false;
    }
  }

  /**
   * 🎯 ENHANCED BEAT SNAPPING: Calculate and align to next beat
   */
  private async snapToNextBeat(): Promise<void> {
    if (!this.player || !this.isLoaded) return;

    try {
      // Ensure transport is running
      if (Tone.Transport.state !== 'started') {
        console.warn('Transport not running, starting it...');
        Tone.Transport.start();
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for transport to stabilize
      }

      // Get current transport time with high precision
      const currentTime = Tone.Transport.seconds;
      
      // Calculate next beat boundary (align to 4-beat bars)
      const beatsElapsed = currentTime / this.beatInterval;
      const nextBeat = Math.ceil(beatsElapsed / 4) * 4; // Snap to next bar (4 beats)
      this.nextBeatTime = nextBeat * this.beatInterval;
      
      // If next beat is too close (less than 0.5 seconds), move to next bar
      if (this.nextBeatTime - currentTime < 0.5) {
        this.nextBeatTime += this.beatInterval * 4; // Add one full bar
      }
      
      // Sync player to transport timeline
      this.player.sync();
      
      // Set up for queued playback
      this.isQueued = true;
      this.isGridAligned = true;
      
      // Start grid position monitoring
      this.startGridMonitoring();
      
      const waitTime = this.nextBeatTime - currentTime;
      console.log(`🎯 Track snapped to beat: ${this.nextBeatTime.toFixed(3)}s (wait: ${waitTime.toFixed(3)}s)`);
      
    } catch (error) {
      console.error('Failed to snap to beat:', error);
      this.isGridAligned = false;
      this.isQueued = false;
    }
  }

  /**
   * Start monitoring grid position for real-time updates
   */
  private startGridMonitoring(): void {
    if (this.gridUpdateInterval) {
      clearInterval(this.gridUpdateInterval);
    }
    
    this.gridUpdateInterval = setInterval(() => {
      if (this.isLoaded) {
        // Update grid alignment status
        const currentTime = Tone.Transport.seconds;
        const timeDiff = Math.abs(currentTime - this.nextBeatTime);
        
        // Consider aligned if within 50ms of target beat
        this.isGridAligned = timeDiff < 0.05 || this.isQueued;
      }
    }, 50); // Update every 50ms for smooth feedback
  }

  /**
   * Re-snap track to current grid position
   */
  async reSnapToGrid(): Promise<void> {
    if (!this.isLoaded) return;
    
    // Stop current playback if active
    if (this.isPlaying) {
      this.pause();
    }
    
    // Re-align to next beat
    await this.snapToNextBeat();
    console.log('🔄 Track re-snapped to next beat boundary');
  }

  /**
   * Get current grid position information
   */
  getGridPosition(): { bar: number; beat: number; isAligned: boolean; isQueued: boolean } {
    if (!this.isLoaded) {
      return { bar: 1, beat: 1, isAligned: false, isQueued: false };
    }

    const currentTime = Tone.Transport.seconds;
    const currentBeat = Math.floor(currentTime / this.beatInterval);
    const bar = Math.floor(currentBeat / 4) + 1;
    const beat = (currentBeat % 4) + 1;
    
    return { 
      bar, 
      beat, 
      isAligned: this.isGridAligned, 
      isQueued: this.isQueued 
    };
  }

  /**
   * Set global BPM sync - calculates playback rate to match global tempo
   */
  setGlobalBPMSync(globalBPM: number, originalBPM: number) {
    this.globalBPM = globalBPM;
    this.originalBPM = originalBPM;
    this.currentBPM = globalBPM;
    this.beatInterval = 60 / globalBPM;
    this.updatePlaybackRate();
    
    // Re-snap to grid with new BPM
    if (this.isLoaded) {
      this.snapToNextBeat();
    }
    
    console.log(`🎯 Global BPM Sync: ${originalBPM} → ${globalBPM} BPM (rate: ${this.basePlaybackRate.toFixed(3)}x)`);
  }

  /**
   * Update playback rate based on global BPM sync
   */
  private updatePlaybackRate() {
    if (this.player && this.originalBPM > 0) {
      this.basePlaybackRate = calculatePlaybackRate(this.originalBPM, this.globalBPM);
      this.player.playbackRate = this.basePlaybackRate;
      console.log(`🔄 Playback rate updated: ${this.basePlaybackRate.toFixed(3)}x (${this.originalBPM} → ${this.globalBPM} BPM)`);
    }
  }

  /**
   * Get BPM information
   */
  getBPMInfo(): BPMInfo {
    return getBPMInfo(this.originalBPM, this.globalBPM);
  }

  /**
   * ⚡ ENHANCED INSTANT PLAY: Start at precise beat time
   */
  play(fromCue: boolean = false) {
    if (this.player && this.isLoaded && !this.isPlaying) {
      // Ensure playback rate is correct before starting
      this.updatePlaybackRate();
      
      if (this.isQueued && this.isGridAligned && !fromCue) {
        // 🎯 PRECISE BEAT-SYNCED PLAY
        const currentTime = Tone.Transport.seconds;
        const timeToNextBeat = this.nextBeatTime - currentTime;
        
        if (timeToNextBeat > 0 && timeToNextBeat < 2) {
          // Start at the precise next beat time
          this.player.start(this.nextBeatTime);
          this.startTime = this.nextBeatTime;
          console.log(`⚡ Queued for beat-sync play in ${timeToNextBeat.toFixed(3)}s`);
        } else {
          // If beat time has passed or is too far, start immediately
          this.player.start();
          this.startTime = Tone.now();
          console.log(`▶️ Immediate play (beat time passed)`);
        }
        
        this.isQueued = false;
        this.isPlaying = true;
        
      } else {
        // Traditional play from current position
        const startPosition = fromCue ? this.cuePoint : this.pausedAt;
        this.startTime = Tone.now() - startPosition;
        this.player.start(0, startPosition);
        this.isPlaying = true;
        this.isGridAligned = false; // No longer grid-aligned after manual play
        
        console.log(`▶️ Manual play from ${startPosition.toFixed(2)}s`);
      }
      
      const bpmInfo = this.getBPMInfo();
      console.log(`🎵 Playing at ${this.currentBPM} BPM (${this.basePlaybackRate.toFixed(3)}x rate)`);
    }
  }

  pause() {
    if (this.player && this.isPlaying) {
      this.pausedAt = this.getCurrentTime();
      this.player.stop();
      this.isPlaying = false;
      this.isQueued = false;
      this.isGridAligned = false; // Lose grid alignment when paused manually
      console.log(`⏸️ Track paused at ${this.pausedAt.toFixed(2)}s`);
    }
  }

  seek(position: number) {
    if (this.player && this.isLoaded) {
      const wasPlaying = this.isPlaying;
      
      if (wasPlaying) {
        this.pause();
      }
      
      const clampedPosition = Math.max(0, Math.min(position, this.trackDuration));
      this.pausedAt = clampedPosition;
      this.isGridAligned = false; // Lose grid alignment when seeking
      this.isQueued = false;
      
      if (wasPlaying) {
        this.play();
      }
      
      console.log(`🎯 Seeked to ${clampedPosition.toFixed(2)}s (grid alignment lost)`);
    }
  }

  scrub(velocity: number) {
    if (this.player && this.isLoaded) {
      const currentTime = this.getCurrentTime();
      const scrubAmount = velocity * 0.1;
      const newTime = Math.max(0, Math.min(currentTime + scrubAmount, this.trackDuration));
      
      this.pausedAt = newTime;
      this.isGridAligned = false; // Lose grid alignment when scrubbing
      this.isQueued = false;
      
      if (!this.isPlaying) {
        this.seek(newTime);
      } else {
        this.startTime = Tone.now() - newTime;
      }
    }
  }

  bendTempo(rate: number) {
    if (this.player && this.isLoaded) {
      // Apply tempo bend on top of global BPM sync rate
      this.player.playbackRate = this.basePlaybackRate * rate;
      
      // Clear any existing timeout
      if (this.tempoBendTimeout) {
        clearTimeout(this.tempoBendTimeout);
      }
      
      // If rate is not 1.0, it's a temporary bend
      if (rate !== 1.0) {
        this.tempoBendTimeout = setTimeout(() => {
          if (this.player) {
            this.player.playbackRate = this.basePlaybackRate;
          }
        }, 500);
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
        return (Tone.now() - this.startTime) * this.basePlaybackRate;
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

  getOriginalBPM(): number {
    return this.originalBPM;
  }

  setPitch(cents: number) {
    if (this.pitchShift) {
      this.pitchShift.pitch = cents;
      
      if (this.player) {
        const pitchRatio = Math.pow(2, cents / 1200);
        // Apply pitch change on top of global BPM sync rate
        this.player.playbackRate = this.basePlaybackRate * pitchRatio;
      }
    }
  }

  setEQ(low: number, mid: number, high: number) {
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
      const frequency = value <= 50 
        ? 20 + ((value / 50) * 19980)
        : 20000;
      
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
      
      const currentTime = this.getCurrentTime();
      this.pause();
      
      if (this.backspinPlayer.loaded) {
        this.backspinPlayer.start();
      }
      
      setTimeout(() => {
        const newTime = Math.max(0, currentTime - 1.5);
        this.seek(newTime);
        this.play();
      }, 600);
    } else {
      if (this.backspinPlayer.loaded) {
        this.backspinPlayer.start();
      }
    }
  }

  syncToTransport() {
    if (this.player && this.isLoaded) {
      console.log('🎯 Deck ready for sync');
    }
  }

  getWaveform(): Float32Array {
    const waveform = new Float32Array(128);
    const time = this.getCurrentTime();
    
    for (let i = 0; i < waveform.length; i++) {
      const amplitude = this.isPlaying ? 0.5 : 0.1;
      waveform[i] = Math.sin((i + time * 10) * 0.1) * amplitude;
    }
    
    return waveform;
  }

  dispose() {
    if (this.tempoBendTimeout) {
      clearTimeout(this.tempoBendTimeout);
    }
    
    if (this.gridUpdateInterval) {
      clearInterval(this.gridUpdateInterval);
    }
    
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