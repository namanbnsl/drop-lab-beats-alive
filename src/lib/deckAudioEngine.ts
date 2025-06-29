import * as Tone from 'tone';

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

  constructor() {
    // Initialize the audio engine
  }

  async loadTrack(url: string): Promise<void> {
    try {
      if (this.player) {
        this.player.dispose();
      }
      
      this.player = new Tone.Player(url);
      await Tone.loaded();
      this.isLoaded = true;
      console.log('Track loaded successfully');
    } catch (error) {
      console.error('Failed to load track:', error);
      this.isLoaded = false;
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
      
      // FIXED: More reliable player stopping
      try {
        // Stop the player if it's currently playing
        if (this.player.state === 'started') {
          console.log(`⏸️ Stopping player - current state: ${this.player.state}`);
          this.player.stop();
        } else {
          console.log(`⏸️ Player already stopped - current state: ${this.player.state}`);
        }
      } catch (error) {
        console.log(`⏸️ Player stop error (continuing): ${error.message}`);
      }
      
      // Cancel any scheduled starts
      if (this.scheduledStartTime > 0) {
        console.log(`⏸️ Cancelling scheduled start at ${this.scheduledStartTime}`);
        try {
          Tone.Transport.cancel(this.scheduledStartTime);
        } catch (error) {
          console.log(`⏸️ Cancel scheduled start error (continuing): ${error.message}`);
        }
        this.scheduledStartTime = 0;
      }
      
      // Cancel any beat sync sequences
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
      
      // FIXED: Always set isPlaying to false regardless of player state
      this.isPlaying = false;
      this.isQueued = false;
      this.isGridAligned = false;
      this.isWaitingForBar = false;
      
      console.log(`⏸️ Track paused at ${this.pausedAt.toFixed(2)}s - isPlaying set to: ${this.isPlaying}`);
    } else {
      console.log(`⏸️ Cannot pause - Player: ${!!this.player}, isPlaying: ${this.isPlaying}, isLoaded: ${this.isLoaded}`);
      
      // FIXED: Even if we can't pause the player, ensure isPlaying is false
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
    // Return current playback position
    return this.pausedAt;
  }

  setVolume(volume: number): void {
    if (this.player) {
      this.player.volume.value = volume;
    }
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