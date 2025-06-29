pause() {
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