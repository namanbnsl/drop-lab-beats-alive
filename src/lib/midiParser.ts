/**
 * MIDI file parser for loading drum patterns and melodies from MIDI files
 */

interface MIDINote {
  pitch: number;
  velocity: number;
  startTime: number;
  duration: number;
}

interface DrumPattern {
  kick: boolean[];
  snare: boolean[];
  hihat: boolean[];
  crash: boolean[];
}

export class MIDIParser {
  /**
   * Parse MIDI file and extract drum pattern
   */
  static async parseDrumMIDI(file: File): Promise<{ pattern: DrumPattern; tempo: number }> {
    const arrayBuffer = await file.arrayBuffer();
    const dataView = new DataView(arrayBuffer);
    
    // Basic MIDI parsing - this is a simplified version
    let tempo = 120; // Default tempo
    const notes: Array<{ pitch: number; time: number; velocity: number }> = [];
    
    try {
      // Parse MIDI header
      const headerChunk = this.readString(dataView, 0, 4);
      if (headerChunk !== 'MThd') {
        throw new Error('Invalid MIDI file format');
      }
      
      // Skip header and parse tracks
      let offset = 14; // Skip MIDI header
      
      while (offset < dataView.byteLength) {
        const chunkType = this.readString(dataView, offset, 4);
        const chunkLength = dataView.getUint32(offset + 4, false);
        
        if (chunkType === 'MTrk') {
          const trackData = this.parseTrack(dataView, offset + 8, chunkLength);
          notes.push(...trackData.notes);
          if (trackData.tempo) tempo = trackData.tempo;
        }
        
        offset += 8 + chunkLength;
      }
      
      // Convert MIDI notes to drum pattern
      const pattern = this.convertNotesToDrumPattern(notes);
      
      return { pattern, tempo };
    } catch (error) {
      console.error('MIDI parsing error:', error);
      throw new Error('Failed to parse MIDI file. Please ensure it\'s a valid MIDI file.');
    }
  }
  
  /**
   * Parse MIDI file and extract melody notes
   */
  static async parseMelodyMIDI(file: File): Promise<{ notes: MIDINote[]; tempo: number }> {
    const arrayBuffer = await file.arrayBuffer();
    const dataView = new DataView(arrayBuffer);
    
    let tempo = 120;
    const notes: MIDINote[] = [];
    
    try {
      const headerChunk = this.readString(dataView, 0, 4);
      if (headerChunk !== 'MThd') {
        throw new Error('Invalid MIDI file format');
      }
      
      let offset = 14;
      
      while (offset < dataView.byteLength) {
        const chunkType = this.readString(dataView, offset, 4);
        const chunkLength = dataView.getUint32(offset + 4, false);
        
        if (chunkType === 'MTrk') {
          const trackData = this.parseTrack(dataView, offset + 8, chunkLength);
          
          // Convert to melody notes with duration
          const melodyNotes = this.convertToMelodyNotes(trackData.notes, tempo);
          notes.push(...melodyNotes);
          
          if (trackData.tempo) tempo = trackData.tempo;
        }
        
        offset += 8 + chunkLength;
      }
      
      return { notes, tempo };
    } catch (error) {
      console.error('MIDI parsing error:', error);
      throw new Error('Failed to parse MIDI file. Please ensure it\'s a valid MIDI file.');
    }
  }
  
  private static readString(dataView: DataView, offset: number, length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += String.fromCharCode(dataView.getUint8(offset + i));
    }
    return result;
  }
  
  private static parseTrack(dataView: DataView, offset: number, length: number) {
    const notes: Array<{ pitch: number; time: number; velocity: number; duration?: number }> = [];
    let tempo = 120;
    let currentTime = 0;
    const activeNotes = new Map<number, { time: number; velocity: number }>();
    
    const endOffset = offset + length;
    let pos = offset;
    
    while (pos < endOffset) {
      // Read delta time (variable length)
      const deltaTime = this.readVariableLength(dataView, pos);
      pos += deltaTime.bytesRead;
      currentTime += deltaTime.value;
      
      if (pos >= endOffset) break;
      
      const eventByte = dataView.getUint8(pos);
      pos++;
      
      if (eventByte === 0xFF) {
        // Meta event
        if (pos >= endOffset) break;
        const metaType = dataView.getUint8(pos);
        pos++;
        
        const metaLength = this.readVariableLength(dataView, pos);
        pos += metaLength.bytesRead;
        
        if (metaType === 0x51 && metaLength.value === 3) {
          // Tempo change
          const microsecondsPerQuarter = (dataView.getUint8(pos) << 16) | 
                                       (dataView.getUint8(pos + 1) << 8) | 
                                       dataView.getUint8(pos + 2);
          tempo = Math.round(60000000 / microsecondsPerQuarter);
        }
        
        pos += metaLength.value;
      } else if ((eventByte & 0xF0) === 0x90) {
        // Note on
        if (pos + 1 >= endOffset) break;
        const pitch = dataView.getUint8(pos);
        const velocity = dataView.getUint8(pos + 1);
        pos += 2;
        
        if (velocity > 0) {
          activeNotes.set(pitch, { time: currentTime, velocity });
        } else {
          // Velocity 0 = note off
          const noteStart = activeNotes.get(pitch);
          if (noteStart) {
            notes.push({
              pitch,
              time: noteStart.time,
              velocity: noteStart.velocity,
              duration: currentTime - noteStart.time
            });
            activeNotes.delete(pitch);
          }
        }
      } else if ((eventByte & 0xF0) === 0x80) {
        // Note off
        if (pos + 1 >= endOffset) break;
        const pitch = dataView.getUint8(pos);
        pos += 2; // Skip velocity
        
        const noteStart = activeNotes.get(pitch);
        if (noteStart) {
          notes.push({
            pitch,
            time: noteStart.time,
            velocity: noteStart.velocity,
            duration: currentTime - noteStart.time
          });
          activeNotes.delete(pitch);
        }
      } else {
        // Skip other events
        pos += 2;
      }
    }
    
    return { notes, tempo };
  }
  
  private static readVariableLength(dataView: DataView, offset: number) {
    let value = 0;
    let bytesRead = 0;
    let byte;
    
    do {
      if (offset + bytesRead >= dataView.byteLength) break;
      byte = dataView.getUint8(offset + bytesRead);
      value = (value << 7) | (byte & 0x7F);
      bytesRead++;
    } while ((byte & 0x80) && bytesRead < 4);
    
    return { value, bytesRead };
  }
  
  private static convertNotesToDrumPattern(notes: Array<{ pitch: number; time: number; velocity: number }>): DrumPattern {
    const pattern: DrumPattern = {
      kick: new Array(16).fill(false),
      snare: new Array(16).fill(false),
      hihat: new Array(16).fill(false),
      crash: new Array(16).fill(false)
    };
    
    // MIDI drum mapping (General MIDI standard)
    const drumMap: { [key: number]: keyof DrumPattern } = {
      36: 'kick',   // Bass Drum 1
      35: 'kick',   // Bass Drum 2
      38: 'snare',  // Acoustic Snare
      40: 'snare',  // Electric Snare
      42: 'hihat',  // Closed Hi-Hat
      44: 'hihat',  // Pedal Hi-Hat
      49: 'crash',  // Crash Cymbal 1
      57: 'crash'   // Crash Cymbal 2
    };
    
    notes.forEach(note => {
      const drumType = drumMap[note.pitch];
      if (drumType) {
        // Convert time to 16th note steps (assuming 4/4 time)
        const stepIndex = Math.floor((note.time / 480) * 4) % 16; // 480 ticks per quarter note
        if (stepIndex >= 0 && stepIndex < 16) {
          pattern[drumType][stepIndex] = true;
        }
      }
    });
    
    return pattern;
  }
  
  private static convertToMelodyNotes(notes: Array<{ pitch: number; time: number; velocity: number; duration?: number }>, tempo: number): MIDINote[] {
    return notes
      .filter(note => note.duration !== undefined)
      .map(note => {
        // FIXED: Convert MIDI ticks to seconds properly using the actual tempo
        const timeInBeats = note.time / 480; // 480 ticks per quarter note
        const startTimeInSeconds = timeInBeats * (60 / tempo); // Convert beats to seconds at current tempo
        
        const durationInBeats = note.duration! / 480;
        const durationInSeconds = Math.max(0.1, durationInBeats * (60 / tempo)); // Minimum duration
        
        return {
          pitch: note.pitch,
          velocity: note.velocity / 127, // Normalize to 0-1
          startTime: startTimeInSeconds,
          duration: durationInSeconds
        };
      });
  }
}