/**
 * Audio recording utilities for capturing and exporting audio from the producer
 */

import * as Tone from 'tone';

export class AudioRecorder {
  private recorder: Tone.Recorder | null = null;
  private isRecording: boolean = false;

  constructor() {
    this.recorder = new Tone.Recorder();
  }

  /**
   * Start recording audio from the master output
   */
  async startRecording(): Promise<void> {
    if (this.isRecording || !this.recorder) return;

    try {
      // Connect the recorder to the master output
      Tone.getDestination().connect(this.recorder);
      
      // Start recording
      this.recorder.start();
      this.isRecording = true;
      
      console.log('🔴 Audio recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Failed to start audio recording');
    }
  }

  /**
   * Stop recording and return the recorded audio blob
   */
  async stopRecording(): Promise<Blob> {
    if (!this.isRecording || !this.recorder) {
      throw new Error('No active recording to stop');
    }

    try {
      // Stop recording and get the blob
      const recording = await this.recorder.stop();
      this.isRecording = false;
      
      console.log('⏹️ Audio recording stopped');
      return recording;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw new Error('Failed to stop audio recording');
    }
  }

  /**
   * Record audio for a specific duration
   */
  async recordForDuration(durationSeconds: number): Promise<Blob> {
    await this.startRecording();
    
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const blob = await this.stopRecording();
          resolve(blob);
        } catch (error) {
          reject(error);
        }
      }, durationSeconds * 1000);
    });
  }

  /**
   * Download recorded audio as WAV file
   */
  static downloadAudio(blob: Blob, filename: string = 'recording'): void {
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.wav`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log(`📁 Audio file "${filename}.wav" downloaded successfully`);
  }

  /**
   * Get recording status
   */
  getRecordingStatus(): boolean {
    return this.isRecording;
  }

  /**
   * Dispose of the recorder
   */
  dispose(): void {
    if (this.recorder) {
      if (this.isRecording) {
        this.recorder.stop();
      }
      this.recorder.dispose();
      this.recorder = null;
    }
  }
}