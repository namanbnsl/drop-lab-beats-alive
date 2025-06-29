import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw, Volume2, Save, FolderOpen, Music, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { MIDIExporter } from '../../lib/midiExporter';
import { MIDIParser } from '../../lib/midiParser';
import * as Tone from 'tone';

interface Note {
  pitch: number;
  velocity: number;
  startTime: number;
  duration: number;
}

interface MelodySectionProps {
  onPlayMelody: (notes: Note[]) => void;
  isPlaying: boolean;
  notes: Note[];
  onNotesChange: (notes: Note[]) => void;
  currentStep: number;
  tempo: number;
  onTempoChange: (tempo: number) => void;
}

const MelodySection: React.FC<MelodySectionProps> = ({
  onPlayMelody,
  isPlaying,
  notes,
  onNotesChange,
  currentStep,
  tempo,
  onTempoChange
}) => {
  const [key, setKey] = useState('C');
  const [scale, setScale] = useState('major');
  const [octave, setOctave] = useState(4);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const scales = ['major', 'minor', 'pentatonic', 'blues'];
  const octaves = [2, 3, 4, 5, 6];

  const getScaleNotes = (rootKey: string, scaleType: string): number[] => {
    const noteToMidi = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 };
    const root = noteToMidi[rootKey as keyof typeof noteToMidi];

    const scalePatterns = {
      major: [0, 2, 4, 5, 7, 9, 11],
      minor: [0, 2, 3, 5, 7, 8, 10],
      pentatonic: [0, 2, 4, 7, 9],
      blues: [0, 3, 5, 6, 7, 10]
    };

    const pattern = scalePatterns[scaleType as keyof typeof scalePatterns] || scalePatterns.major;
    return pattern.map(interval => root + interval);
  };

  const toggleNote = (pitch: number, time: number) => {
    const notePitch = pitch + (octave * 12);
    const noteTime = time * 0.25;

    // Check if a note already exists at this position
    const existingNoteIndex = notes.findIndex(note =>
      Math.floor(note.startTime * 4) === time &&
      note.pitch === notePitch
    );

    if (existingNoteIndex !== -1) {
      // Remove the existing note
      onNotesChange(notes.filter((_, i) => i !== existingNoteIndex));
    } else {
      // Add a new note
      const newNote: Note = {
        pitch: notePitch,
        velocity: 0.8,
        startTime: noteTime,
        duration: 0.5
      };
      onNotesChange([...notes, newNote]);
    }
  };

  const clearMelody = () => {
    onNotesChange([]);
    toast.success("Melody cleared successfully!");
  };

  const randomizeMelody = () => {
    const scaleNotes = getScaleNotes(key, scale);
    const newNotes: Note[] = [];

    for (let i = 0; i < 8; i++) {
      if (Math.random() > 0.3) {
        const randomPitch = scaleNotes[Math.floor(Math.random() * scaleNotes.length)];
        newNotes.push({
          pitch: randomPitch + (octave * 12),
          velocity: 0.6 + Math.random() * 0.4,
          startTime: i * 0.5,
          duration: 0.25 + Math.random() * 0.5
        });
      }
    }

    onNotesChange(newNotes);
    toast.success(`Melody randomized! (${newNotes.length} notes in ${key} ${scale})`);
  };

  // Quantize and deduplicate helper
  const quantizeNotes = (notes) => {
    const quantize = (value, step = 0.25) => Math.round(value / step) * step;
    // Quantize
    let quantized = notes.map(note => ({
      ...note,
      startTime: quantize(note.startTime, 0.25),
      duration: quantize(note.duration, 0.25)
    }));
    // Deduplicate (by pitch and startTime)
    const seen = new Set();
    quantized = quantized.filter(note => {
      const key = `${note.pitch}:${note.startTime}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return quantized;
  };

  const handleFileLoad = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.mid') && !file.name.toLowerCase().endsWith('.midi')) {
      toast.error("Please select a MIDI file (.mid or .midi)");
      return;
    }

    try {
      toast.info("Loading MIDI file...");

      const { notes: loadedNotes, tempo: loadedTempo } = await MIDIParser.parseMelodyMIDI(file);

      if (loadedNotes.length === 0) {
        toast.error("No melody notes found in MIDI file!");
        return;
      }

      // Quantize and deduplicate loaded notes
      const quantizedNotes = quantizeNotes(loadedNotes);
      onNotesChange(quantizedNotes);
      onTempoChange(loadedTempo);

      toast.success(`Melody loaded from MIDI! (${quantizedNotes.length} notes at ${loadedTempo} BPM)`);
      console.log('✅ Melody loaded from MIDI:', { quantizedNotes, loadedTempo });
    } catch (error) {
      console.error('Failed to load melody:', error);
      toast.error("Failed to load MIDI file. Please ensure it's a valid melody MIDI file.");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveMelody = () => {
    try {
      if (notes.length === 0) {
        toast.error("Cannot save empty melody. Add some notes first!");
        return;
      }

      // Quantize and deduplicate before export
      const quantizedNotes = quantizeNotes(notes);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `droplab-melody-${timestamp}`;

      // Export as MIDI file
      MIDIExporter.exportMelody(quantizedNotes, tempo, filename);

      toast.success(`Melody saved as MIDI! (${quantizedNotes.length} notes in ${key} ${scale} at ${tempo} BPM)`);
      console.log('✅ Melody exported as MIDI:', { quantizedNotes, key, scale, octave, tempo, filename });
    } catch (error) {
      console.error('Failed to save melody:', error);
      toast.error("Failed to save melody. Please try again.");
    }
  };

  const loadMelody = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const playMelody = () => {
    if (notes.length > 0) {
      onPlayMelody(notes);
    }
  };

  // Fixed beat display calculation
  const getCurrentBeatDisplay = () => {
    const bar = Math.floor(currentStep / 16) + 1;
    const step = (currentStep % 16) + 1;
    return `${bar}.${step}`;
  };

  const renderPianoRoll = () => {
    const scaleNotes = getScaleNotes(key, scale);
    const gridSize = 16;

    return (
      <div className="rounded-lg p-2 sm:p-4 overflow-x-auto">
        {/* Beat Numbers */}
        <div className="flex items-center space-x-4 mb-2">
          <div className="w-16 flex-shrink-0"></div>
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-2 flex-1">
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs text-gray-400">
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {scaleNotes.map((pitch, pitchIndex) => (
            <motion.div
              key={pitch}
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: pitchIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-16 text-sm font-display font-semibold text-gray-300 flex-shrink-0">
                {Tone.Frequency(pitch + (octave * 12), "midi").toNote()}
              </div>
              <div className="grid grid-cols-8 sm:grid-cols-16 gap-2 flex-1 overflow-x-auto">
                {Array.from({ length: gridSize }, (_, time) => {
                  const noteAtPosition = notes.find(note =>
                    Math.floor(note.startTime * 4) === time &&
                    note.pitch === pitch + (octave * 12)
                  );

                  return (
                    <motion.button
                      key={`${time}-${pitch}`}
                      onClick={() => toggleNote(pitch, time)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-all duration-200 touch-manipulation ${noteAtPosition
                        ? 'bg-blue-500'
                        : 'bg-gray-700 hover:bg-gray-600'
                        } ${currentStep % 16 === time && isPlaying ? 'ring-2 ring-yellow-400' : ''
                        }`}
                      title={`${noteAtPosition ? 'Remove' : 'Add'} note ${Tone.Frequency(pitch + (octave * 12), "midi").toNote()} at beat ${time + 1}`}
                      aria-label={`Toggle note ${Tone.Frequency(pitch + (octave * 12), "midi").toNote()} at beat ${time + 1}`}
                    />
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section id="melody" className="px-4 pt-32 pb-8">
      <motion.div
        className="max-w-6xl mx-auto text-center w-full"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Section Title */}
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 text-white">
          🎼 Melody Composer
        </h2>

        <p className="text-lg sm:text-xl text-gray-300 mb-8">
          Create your own melodies with the piano roll interface
        </p>

        {/* Beat Display */}
        <div className="card-fun-dark mb-8 p-6 border-2 border-blue-400/30">
          <div className="text-2xl font-handwritten font-bold text-white mb-2">
            Beat: {getCurrentBeatDisplay()}
          </div>
          <div className="text-sm text-gray-300 font-playful">
            {isPlaying ? '🎵 Playing' : '⏸️ Stopped'} • {tempo} BPM
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <motion.div
            className="card-fun-dark p-4 border-2 border-blue-400/30"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-lg">🎼</span>
              <h3 className="font-display font-semibold text-white">Key</h3>
            </div>
            <select
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-black border border-blue-500/50 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none text-sm"
            >
              {keys.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </motion.div>

          <motion.div
            className="card-fun-dark p-4 border-2 border-green-400/30"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-lg">🎵</span>
              <h3 className="font-display font-semibold text-white">Scale</h3>
            </div>
            <select
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              className="w-full bg-black border border-blue-500/50 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none text-sm"
            >
              {scales.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </motion.div>

          <motion.div
            className="card-fun-dark p-4 border-2 border-yellow-400/30"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-lg">🎹</span>
              <h3 className="font-display font-semibold text-white">Octave</h3>
            </div>
            <select
              value={octave}
              onChange={(e) => setOctave(Number(e.target.value))}
              className="w-full bg-black border border-blue-500/50 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none text-sm"
            >
              {octaves.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </motion.div>

          <motion.div
            className="card-fun-dark p-4 border-2 border-red-400/30"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-lg">⚡</span>
              <h3 className="font-display font-semibold text-white">Tempo</h3>
            </div>
            <input
              type="range"
              min="60"
              max="200"
              value={tempo}
              onChange={(e) => onTempoChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-white">{tempo} BPM</span>
          </motion.div>

          <motion.button
            onClick={playMelody}
            disabled={notes.length === 0}
            className="card-fun-dark p-4 border-2 border-blue-400/30 hover:border-blue-400/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-lg">▶️</span>
              <h3 className="font-display font-semibold text-white">Play</h3>
            </div>
            <p className="text-sm text-gray-300 font-playful">
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </p>
          </motion.button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
          <motion.button
            onClick={randomizeMelody}
            className="btn-fun-secondary px-3 sm:px-4 py-2 font-display font-semibold"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            🎲 Randomize
          </motion.button>
          <motion.button
            onClick={clearMelody}
            className="btn-fun-secondary px-3 sm:px-4 py-2 font-display font-semibold"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            🗑️ Clear
          </motion.button>
          <motion.button
            onClick={saveMelody}
            className="btn-fun-secondary px-3 sm:px-4 py-2 font-display font-semibold"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Download className="w-4 h-4 mr-2" />
            Save MIDI
          </motion.button>
          <motion.button
            onClick={loadMelody}
            className="btn-fun-secondary px-3 sm:px-4 py-2 font-display font-semibold"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Load MIDI
          </motion.button>
        </div>

        {/* Piano Roll */}
        <div className="card-fun-dark p-6 border-2 border-blue-400/30 mb-8">
          <h3 className="text-xl font-display font-bold text-white mb-6">
            🎹 Piano Roll
          </h3>
          {renderPianoRoll()}
          <div className="mt-4 text-xs sm:text-sm text-gray-400">
            <p>Click on any cell to add a note. Blue cells indicate existing notes.</p>
            <p>Scale: {key} {scale} | Notes in scale: {getScaleNotes(key, scale).join(', ')}</p>
            <p className="mt-1">💾 Save exports as MIDI file • 📂 Load imports MIDI files</p>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".mid,.midi"
          onChange={handleFileLoad}
          className="hidden"
        />
      </motion.div>
    </section>
  );
};

export default MelodySection;