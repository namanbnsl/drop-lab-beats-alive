import * as Tone from 'tone';

export interface BPMInfo {
  originalBPM: number;
  currentBPM: number;
  pitchAdjustment: number;
  syncedBPM: number;
}

export interface GridPosition {
  bar: number;
  beat: number;
  isAligned: boolean;
  isQueued: boolean;
}

export class DeckAudioEngine {
  private player: Tone.Player | null = null;
  private isPlaying: boolean = false;
  private isLoaded: boolean = false;
  private isQueued: boolean = false;
  private isGridAligned: boolean = false;
  private isWaitingForBar: boolean = false;
  private pausedAt: number = 0;
  private scheduledStartTime: number = 0;
  private beatSyncSequence: Tone.Sequence | null = null;
  
  // Audio processing chain
  private pitchShift: Tone.PitchShift | null = null;
  private eq3: Tone.EQ3 | null = null;
  private filter: Tone.Filter | null = null;
  private reverb: Tone.Reverb | null = null;
  private delay: Tone.FeedbackDelay | null = null;
  private panner: Tone.Panner | null = null;
  private gain: Tone.Gain | null = null;
  
  // Track and BPM info
  private originalBPM: number = 128;
  private currentPitch: number = 0;
  private syncedBPM: number = 128;
  private trackDuration: number = 0;
  
  // Grid tracking
  private gridPosition: GridPosition = {
    bar: 1,
    beat: 1,
    isAligned: false,
    isQueued: false
  };

  constructor() {
    this.initializeAudioChain();
  }

  private initializeAudioChain(): void {
    try {
      // Create audio processing chain with better settings to prevent distortion
      this.pitchShift = new Tone.PitchShift(0);
      this.eq3 = new Tone.EQ3();
      this.filter = new Tone.Filter(20000, "lowpass");
      this.reverb = new Tone.Reverb({
        roomSize: 0.7,
        dampening: 3000,
        wet: 0 // Start with no reverb
      });
      this.delay = new Tone.FeedbackDelay("8n", 0.2);
      this.panner = new Tone.Panner(0);
      this.gain = new Tone.Gain(0.6); // Reduced from 0.75 to prevent distortion
      
      // Connect the chain: Player -> PitchShift -> EQ -> Filter -> Reverb -> Delay -> Panner -> Gain -> Destination
      this.pitchShift.chain(this.eq3, this.filter, this.reverb, this.delay, this.panner, this.gain, Tone.Destination);
    } catch (error) {
      console.error('Failed to initialize audio chain:', error);
    }
  }

  async loadTrack(url: string, originalBPM?: number): Promise<boolean> {
    try {
      if (this.player) {
        this.player.dispose();
      }
      
      this.player = new Tone.Player(url);
      
      // Connect player to audio chain
      if (this.pitchShift) {
        this.player.connect(this.pitchShift);
      }
      
      await Tone.loaded();
      
      this.isLoaded = true;
      this.originalBPM = originalBPM || 128;
      this.trackDuration = this.player.buffer.duration;
      
      console.log('Track loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load track:', error);
      this.isLoaded = false;
      return false;
    }
  }

  play(): void {
    if (this.player && this.isLoaded && !this.isPlaying) {
      try {
        this.player.start();
        this.isPlaying = true;
        console.log('Track started playing');
      } catch (error) {
        console.error('Failed to play track:', error);
      }
    }
  }

  pause(): void {
    console.log(`⏸️ Pause called - Player: ${!!this.player}, isPlaying: ${this.isPlaying}, isLoaded: ${this.isLoaded}`);
    
    if (this.player && this.isPlaying) {
      this.pausedAt = this.getCurrentTime();
      
      try {
        if (this.player.state === 'started') {
          console.log(`⏸️ Stopping player - current state: ${this.player.state}`);
          this.player.stop();
        } else {
          console.log(`⏸️ Player already stopped - current state: ${this.player.state}`);
        }
      } catch (error) {
        console.log(`⏸️ Player stop error (continuing): ${error.message}`);
      }
      
      if (this.scheduledStartTime > 0) {
        console.log(`⏸️ Cancelling scheduled start at ${this.scheduledStartTime}`);
        try {
          Tone.Transport.cancel(this.scheduledStartTime);
        } catch (error) {
          console.log(`⏸️ Cancel scheduled start error (continuing): ${error.message}`);
        }
        this.scheduledStartTime = 0;
      }
      
      if (this.beatSyncSequence) {
        console.log(`⏸️ Stopping beat sync sequence`);
        try {
          this.beatSyncSequence.stop();
          this.beatSyncSequence.dispose();
          this.beatSyncSequence = null;
        } catch (error) {
          console.log(`⏸️ Beat sync sequence cleanup error (continuing): ${error.message}`);
        }
      }
      
      this.isPlaying = false;
      this.isQueued = false;
      this.isGridAligned = false;
      this.isWaitingForBar = false;
      
      console.log(`⏸️ Track paused at ${this.pausedAt.toFixed(2)}s - isPlaying set to: ${this.isPlaying}`);
    } else {
      console.log(`⏸️ Cannot pause - Player: ${!!this.player}, isPlaying: ${this.isPlaying}, isLoaded: ${this.isLoaded}`);
      
      if (this.isPlaying) {
        this.isPlaying = false;
        this.isQueued = false;
        this.isGridAligned = false;
        this.isWaitingForBar = false;
        console.log(`⏸️ Force set isPlaying to false`);
      }
    }
  }

  stop(): void {
    if (this.player) {
      try {
        this.player.stop();
        this.isPlaying = false;
        this.pausedAt = 0;
        console.log('Track stopped');
      } catch (error) {
        console.error('Failed to stop track:', error);
      }
    }
  }

  getCurrentTime(): number {
    return this.pausedAt;
  }

  setVolume(volume: number): void {
    if (this.player) {
      this.player.volume.value = volume;
    }
  }

  setPitch(pitch: number): void {
    this.currentPitch = pitch;
    if (this.pitchShift) {
      // Convert pitch percentage to semitones (-12 to +12)
      const semitones = (pitch / 100) * 12;
      this.pitchShift.pitch = semitones;
    }
  }

  setEQ(low: number, mid: number, high: number): void {
    if (this.eq3) {
      // Convert 0-100 range to dB (-20 to +20)
      this.eq3.low.value = ((low - 50) / 50) * 20;
      this.eq3.mid.value = ((mid - 50) / 50) * 20;
      this.eq3.high.value = ((high - 50) / 50) * 20;
    }
  }

  setFilter(value: number): void {
    if (this.filter) {
      // Convert 0-100 to frequency range (20Hz to 20kHz)
      const frequency = 20 + (value / 100) * (20000 - 20);
      this.filter.frequency.value = frequency;
    }
  }

  setReverb(value: number): void {
    if (this.reverb) {
      // Convert 0-100 to wet signal (0 to 0.8) - more conservative to prevent distortion
      this.reverb.wet.value = (value / 100) * 0.8;
    }
  }

  setDelay(value: number): void {
    if (this.delay) {
      // Convert 0-100 to wet signal (0 to 0.6) - more conservative to prevent distortion
      this.delay.wet.value = (value / 100) * 0.6;
    }
  }

  setGain(value: number): void {
    if (this.gain) {
      // Convert 0-100 to gain (0 to 1)
      this.gain.gain.value = value / 100;
    }
  }

  setGlobalBPMSync(targetBPM: number, originalBPM: number): void {
    this.syncedBPM = targetBPM;
    this.originalBPM = originalBPM;
    
    // Calculate pitch adjustment needed for BPM sync
    const pitchAdjustment = ((targetBPM / originalBPM) - 1) * 100;
    this.setPitch(pitchAdjustment);
    
    console.log(`🎯 BPM Sync: ${originalBPM} → ${targetBPM} BPM (${pitchAdjustment.toFixed(1)}% pitch)`);
  }

  reSnapToGrid(): void {
    // Simulate grid re-snapping
    this.gridPosition.isQueued = true;
    this.gridPosition.isAligned = true;
    
    setTimeout(() => {
      this.gridPosition.isQueued = false;
    }, 500);
    
    console.log('🔄 Re-snapped to grid');
  }

  scrub(velocity: number): void {
    // Simulate scrubbing effect
    console.log(`🎛️ Scrubbing with velocity: ${velocity}`);
  }

  triggerBackspin(): void {
    // Simulate backspin effect
    console.log('🌀 Backspin triggered');
  }

  bendTempo(rate: number): void {
    // Simulate tempo bending
    if (this.player) {
      this.player.playbackRate = rate;
    }
    console.log(`⏩ Tempo bend: ${rate}x`);
  }

  getBPMInfo(): BPMInfo {
    const currentBPM = this.originalBPM * (1 + (this.currentPitch / 100));
    
    return {
      originalBPM: this.originalBPM,
      currentBPM: currentBPM,
      pitchAdjustment: this.currentPitch,
      syncedBPM: this.syncedBPM
    };
  }

  getGridPosition(): GridPosition {
    // Update grid position based on transport time
    try {
      const transportTime = Tone.Transport.seconds;
      const beatDuration = 60 / this.syncedBPM;
      const currentBeat = Math.floor(transportTime / beatDuration);
      const bar = Math.floor(currentBeat / 4) + 1;
      const beat = (currentBeat % 4) + 1;
      
      this.gridPosition = {
        bar,
        beat,
        isAligned: this.isGridAligned,
        isQueued: this.isQueued
      };
    } catch (error) {
      console.error('Error updating grid position:', error);
    }
    
    return this.gridPosition;
  }

  getWaveform(): Float32Array | null {
    // Return empty waveform data for now
    return new Float32Array(1024);
  }

  getDuration(): number {
    return this.trackDuration;
  }

  dispose(): void {
    if (this.player) {
      this.player.dispose();
      this.player = null;
    }
    if (this.beatSyncSequence) {
      this.beatSyncSequence.dispose();
      this.beatSyncSequence = null;
    }
    
    // Dispose audio processing chain
    this.pitchShift?.dispose();
    this.eq3?.dispose();
    this.filter?.dispose();
    this.reverb?.dispose();
    this.delay?.dispose();
    this.panner?.dispose();
    this.gain?.dispose();
    
    this.isLoaded = false;
    this.isPlaying = false;
  }

  // Getters for state
  get loaded(): boolean {
    return this.isLoaded;
  }

  get playing(): boolean {
    return this.isPlaying;
  }

  get queued(): boolean {
    return this.isQueued;
  }
}