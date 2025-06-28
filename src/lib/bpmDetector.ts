/**
 * Simple BPM utilities for manual BPM input and playback rate calculations
 */

export interface BPMInfo {
  original: number;
  current: number;
  target: number;
  playbackRate: number;
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

/**
 * Validate BPM range
 */
export function isValidBPM(bpm: number): boolean {
  return bpm >= 60 && bpm <= 200;
}

/**
 * Get BPM info for display
 */
export function getBPMInfo(originalBPM: number, targetBPM: number): BPMInfo {
  const playbackRate = calculatePlaybackRate(originalBPM, targetBPM);
  
  return {
    original: originalBPM,
    current: targetBPM,
    target: targetBPM,
    playbackRate
  };
}