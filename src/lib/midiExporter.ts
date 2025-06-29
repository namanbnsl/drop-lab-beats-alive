/**
 * MIDI export utilities for exporting drum patterns and melodies as MIDI files
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

export class MIDIExporter {
  private static TICKS_PER_QUARTER = 480;
  
  /**
   * Export melody notes as MIDI file
   */
  static exportMelody(notes: MIDINote[], tempo: number = 120, filename: string = 'melody'): void {
    const midiData = this.createMIDIFile(notes, tempo, 'melody');
    this.downloadMIDI(midiData, `${filename}.mid`);
  }

  /**
   * Export drum pattern as MIDI file
   */
  static exportDrums(pattern: DrumPattern, tempo: number = 120, filename: string = 'drums'): void {
    const drumNotes = this.convertDrumPatternToNotes(pattern);
    const midiData = this.createMIDIFile(drumNotes, tempo, 'drums');
    this.downloadMIDI(midiData, `${filename}.mid`);
  }

  /**
   * Convert drum pattern to MIDI notes
   */
  private static convertDrumPatternToNotes(pattern: DrumPattern): MIDINote[] {
    const notes: MIDINote[] = [];
    const stepDuration = 0.25; // 16th notes

    // MIDI drum mapping (General MIDI standard)
    const drumMap = {
      kick: 36,   // C2 - Bass Drum 1
      snare: 38,  // D2 - Acoustic Snare
      hihat: 42,  // F#2 - Closed Hi-Hat
      crash: 49   // C#3 - Crash Cymbal 1
    };

    Object.entries(pattern).forEach(([drumType, steps]) => {
      steps.forEach((active, stepIndex) => {
        if (active) {
          notes.push({
            pitch: drumMap[drumType as keyof typeof drumMap],
            velocity: 0.8,
            startTime: stepIndex * stepDuration,
            duration: 0.1
          });
        }
      });
    });

    return notes;
  }

  /**
   * Create MIDI file data
   */
  private static createMIDIFile(notes: MIDINote[], tempo: number, trackName: string): Uint8Array {
    // MIDI file structure: Header + Track
    const header = this.createMIDIHeader();
    const track = this.createMIDITrack(notes, tempo, trackName);
    
    // Combine header and track
    const totalLength = header.length + track.length;
    const midiFile = new Uint8Array(totalLength);
    midiFile.set(header, 0);
    midiFile.set(track, header.length);
    
    return midiFile;
  }

  /**
   * Create MIDI header chunk
   */
  private static createMIDIHeader(): Uint8Array {
    const header = new Uint8Array(14);
    let offset = 0;

    // Header chunk identifier "MThd"
    header.set([0x4D, 0x54, 0x68, 0x64], offset);
    offset += 4;

    // Header length (6 bytes)
    header.set([0x00, 0x00, 0x00, 0x06], offset);
    offset += 4;

    // Format type (0 = single track)
    header.set([0x00, 0x00], offset);
    offset += 2;

    // Number of tracks (1)
    header.set([0x00, 0x01], offset);
    offset += 2;

    // Time division (ticks per quarter note)
    const ticksPerQuarter = this.TICKS_PER_QUARTER;
    header.set([
      (ticksPerQuarter >> 8) & 0xFF,
      ticksPerQuarter & 0xFF
    ], offset);

    return header;
  }

  /**
   * Create MIDI track chunk
   */
  private static createMIDITrack(notes: MIDINote[], tempo: number, trackName: string): Uint8Array {
    const events: number[] = [];
    
    // Track name event
    this.addMetaEvent(events, 0, 0x03, this.stringToBytes(trackName));
    
    // Tempo event (microseconds per quarter note)
    const microsecondsPerQuarter = Math.round(60000000 / tempo);
    this.addMetaEvent(events, 0, 0x51, [
      (microsecondsPerQuarter >> 16) & 0xFF,
      (microsecondsPerQuarter >> 8) & 0xFF,
      microsecondsPerQuarter & 0xFF
    ]);

    // Sort notes by start time
    const sortedNotes = [...notes].sort((a, b) => a.startTime - b.startTime);
    
    let currentTime = 0;

    // Process all note events
    const allEvents: Array<{time: number, type: 'on' | 'off', pitch: number, velocity: number}> = [];
    
    sortedNotes.forEach(note => {
      // FIXED: Convert seconds to MIDI ticks properly
      // startTime is in seconds, convert to beats, then to ticks
      const startBeats = note.startTime * (tempo / 60); // Convert seconds to beats
      const startTicks = Math.round(startBeats * this.TICKS_PER_QUARTER);
      
      const durationBeats = note.duration * (tempo / 60); // Convert duration seconds to beats
      const durationTicks = Math.round(durationBeats * this.TICKS_PER_QUARTER);
      const endTicks = startTicks + durationTicks;
      
      allEvents.push({
        time: startTicks,
        type: 'on',
        pitch: note.pitch,
        velocity: Math.round(note.velocity * 127)
      });
      
      allEvents.push({
        time: endTicks,
        type: 'off',
        pitch: note.pitch,
        velocity: 0
      });
    });

    // Sort all events by time
    allEvents.sort((a, b) => a.time - b.time);

    // Add MIDI events
    allEvents.forEach(event => {
      const deltaTime = event.time - currentTime;
      currentTime = event.time;

      if (event.type === 'on') {
        this.addNoteEvent(events, deltaTime, 0x90, event.pitch, event.velocity);
      } else {
        this.addNoteEvent(events, deltaTime, 0x80, event.pitch, event.velocity);
      }
    });

    // End of track
    this.addMetaEvent(events, 0, 0x2F, []);

    // Create track chunk
    const trackData = new Uint8Array(events);
    const track = new Uint8Array(8 + trackData.length);
    let offset = 0;

    // Track chunk identifier "MTrk"
    track.set([0x4D, 0x54, 0x72, 0x6B], offset);
    offset += 4;

    // Track length
    const length = trackData.length;
    track.set([
      (length >> 24) & 0xFF,
      (length >> 16) & 0xFF,
      (length >> 8) & 0xFF,
      length & 0xFF
    ], offset);
    offset += 4;

    // Track data
    track.set(trackData, offset);

    return track;
  }

  /**
   * Add meta event to MIDI events array
   */
  private static addMetaEvent(events: number[], deltaTime: number, type: number, data: number[]): void {
    // Delta time (variable length)
    events.push(...this.encodeVariableLength(deltaTime));
    
    // Meta event marker
    events.push(0xFF);
    
    // Meta event type
    events.push(type);
    
    // Data length
    events.push(...this.encodeVariableLength(data.length));
    
    // Data
    events.push(...data);
  }

  /**
   * Add note event to MIDI events array
   */
  private static addNoteEvent(events: number[], deltaTime: number, status: number, pitch: number, velocity: number): void {
    // Delta time (variable length)
    events.push(...this.encodeVariableLength(deltaTime));
    
    // Status byte (note on/off + channel 0)
    events.push(status);
    
    // Note number
    events.push(pitch);
    
    // Velocity
    events.push(velocity);
  }

  /**
   * Encode variable length quantity (MIDI standard)
   */
  private static encodeVariableLength(value: number): number[] {
    const bytes: number[] = [];
    
    if (value === 0) {
      return [0];
    }
    
    while (value > 0) {
      bytes.unshift(value & 0x7F);
      value >>= 7;
    }
    
    // Set continuation bit for all bytes except the last
    for (let i = 0; i < bytes.length - 1; i++) {
      bytes[i] |= 0x80;
    }
    
    return bytes;
  }

  /**
   * Convert string to byte array
   */
  private static stringToBytes(str: string): number[] {
    return Array.from(str).map(char => char.charCodeAt(0));
  }

  /**
   * Download MIDI file
   */
  private static downloadMIDI(data: Uint8Array, filename: string): void {
    const blob = new Blob([data], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log(`📁 MIDI file "${filename}" downloaded successfully`);
  }
}