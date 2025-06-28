/**
 * Audio utility functions for decoding and processing audio data
 */

/**
 * Decode base64 encoded audio data
 * @param base64Data - Base64 encoded audio data
 * @returns ArrayBuffer containing the decoded audio data
 */
export function decode(base64Data: string): ArrayBuffer {
  // Remove data URL prefix if present
  const cleanBase64 = base64Data.replace(/^data:audio\/[^;]+;base64,/, '');
  
  // Decode base64 to binary string
  const binaryString = atob(cleanBase64);
  
  // Convert binary string to ArrayBuffer
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes.buffer;
}

/**
 * Decode audio data into an AudioBuffer
 * @param arrayBuffer - Raw audio data as ArrayBuffer
 * @param audioContext - Web Audio API AudioContext
 * @param sampleRate - Sample rate of the audio
 * @param channels - Number of audio channels
 * @returns Promise<AudioBuffer>
 */
export async function decodeAudioData(
  arrayBuffer: ArrayBuffer,
  audioContext: AudioContext,
  sampleRate: number,
  channels: number
): Promise<AudioBuffer> {
  try {
    // Try to decode using the built-in decodeAudioData method first
    return await audioContext.decodeAudioData(arrayBuffer);
  } catch (error) {
    // If that fails, assume it's raw PCM data and create AudioBuffer manually
    const audioBuffer = audioContext.createBuffer(channels, arrayBuffer.byteLength / (channels * 4), sampleRate);
    
    // Convert ArrayBuffer to Float32Array (assuming 32-bit float PCM)
    const float32Array = new Float32Array(arrayBuffer);
    
    // Fill each channel with the appropriate data
    for (let channel = 0; channel < channels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        // Interleaved stereo: left channel at even indices, right at odd
        channelData[i] = float32Array[i * channels + channel];
      }
    }
    
    return audioBuffer;
  }
}