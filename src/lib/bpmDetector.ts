import MusicTempo from 'musictempo';

export interface BPMDetectionResult {
  bpm: number;
  confidence: number;
  peaks: number[];
}

/**
 * Detect BPM from an audio buffer using MusicTempo
 */
export async function detectBPM(audioBuffer: AudioBuffer): Promise<BPMDetectionResult> {
  try {
    // Convert AudioBuffer to the format expected by MusicTempo
    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const sampleRate = audioBuffer.sampleRate;
    
    // Create MusicTempo instance
    const musicTempo = new MusicTempo(channelData);
    
    // Get BPM and confidence
    const bpm = musicTempo.tempo || 120; // Default to 120 if detection fails
    const peaks = musicTempo.peaks || [];
    
    // Calculate confidence based on peak consistency
    const confidence = calculateConfidence(peaks, bpm);
    
    console.log(`🎵 BPM Detection: ${bpm.toFixed(1)} BPM (confidence: ${(confidence * 100).toFixed(1)}%)`);
    
    return {
      bpm: Math.round(bpm * 10) / 10, // Round to 1 decimal place
      confidence,
      peaks
    };
  } catch (error) {
    console.warn('⚠️ BPM detection failed, using default 120 BPM:', error);
    return {
      bpm: 120,
      confidence: 0,
      peaks: []
    };
  }
}

/**
 * Calculate confidence score based on peak consistency
 */
function calculateConfidence(peaks: number[], detectedBPM: number): number {
  if (!peaks || peaks.length < 2) return 0;
  
  const expectedInterval = 60 / detectedBPM; // Expected time between beats
  const intervals: number[] = [];
  
  // Calculate intervals between consecutive peaks
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1]);
  }
  
  if (intervals.length === 0) return 0;
  
  // Calculate how consistent the intervals are
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Lower standard deviation = higher confidence
  const normalizedStdDev = standardDeviation / avgInterval;
  const confidence = Math.max(0, 1 - normalizedStdDev * 2);
  
  return Math.min(1, confidence);
}

/**
 * Load audio file and convert to AudioBuffer for BPM detection
 */
export async function loadAudioForBPMDetection(url: string): Promise<AudioBuffer> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    return audioBuffer;
  } catch (error) {
    console.error('❌ Failed to load audio for BPM detection:', error);
    throw error;
  } finally {
    // Clean up audio context
    if (audioContext.state !== 'closed') {
      await audioContext.close();
    }
  }
}

/**
 * Calculate playback rate needed to match target BPM
 */
export function calculatePlaybackRate(originalBPM: number, targetBPM: number): number {
  if (originalBPM <= 0 || targetBPM <= 0) return 1;
  return targetBPM / originalBPM;
}

/**
 * Snap BPM to common values for better mixing
 */
export function snapBPMToCommon(bpm: number, tolerance: number = 2): number {
  const commonBPMs = [
    60, 70, 80, 90, 100, 110, 120, 125, 128, 130, 135, 140, 145, 150, 160, 170, 174, 180
  ];
  
  for (const commonBPM of commonBPMs) {
    if (Math.abs(bpm - commonBPM) <= tolerance) {
      return commonBPM;
    }
  }
  
  return Math.round(bpm);
}