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

  const addNote = (pitch: number, time: number) => {
    const newNote: Note = {
      pitch: pitch + (octave * 12),
      velocity: 0.8,
      startTime: time,
      duration: 0.5
    };
    onNotesChange([...notes, newNote]);
  };

  const removeNote = (index: number) => {
    onNotesChange(notes.filter((_, i) => i !== index));
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

  const saveMelody = () => {
    try {
      if (notes.length === 0) {
        toast.error("Cannot save empty melody. Add some notes first!");
        return;
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `droplab-melody-${timestamp}`;
      
      // Export as MIDI file
      MIDIExporter.exportMelody(notes, tempo, filename);
      
      toast.success(`Melody saved as MIDI! (${notes.length} notes in ${key} ${scale} at ${tempo} BPM)`);
      console.log('✅ Melody exported as MIDI:', { notes, key, scale, octave, tempo, filename });
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

      onNotesChange(loadedNotes);
      onTempoChange(loadedTempo);
      
      toast.success(`Melody loaded from MIDI! (${loadedNotes.length} notes at ${loadedTempo} BPM)`);
      console.log('✅ Melody loaded from MIDI:', { loadedNotes, loadedTempo });
    } catch (error) {
      console.error('Failed to load melody:', error);
      toast.error("Failed to load MIDI file. Please ensure it's a valid melody MIDI file.");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    const beat = (currentStep % 16) + 1; // Beat starts at 1, not 0
    return `${bar}.${beat}`;
  };

  const renderPianoRoll = () => {
    const scaleNotes = getScaleNotes(key, scale);
    const gridSize = 16;

    return (
      <div className="bg-gray-800 rounded-lg p-2 sm:p-4 overflow-x-auto">
        {/* Beat Numbers */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="w-12 sm:w-16 flex-shrink-0"></div>
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 flex-1">
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} className="w-6 h-4 sm:w-8 sm:h-6 flex items-center justify-center text-xs text-gray-400">
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1">
          {scaleNotes.map((pitch, pitchIndex) => (
            <div key={pitch} className="flex items-center space-x-1">
              <div className="w-12 sm:w-16 text-xs text-gray-300 flex-shrink-0">
                {Tone.Frequency(pitch + (octave * 12), "midi").toNote()}
              </div>
              <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 flex-1">
                {Array.from({ length: gridSize }, (_, time) => {
                  const noteAtPosition = notes.find(note =>
                    Math.floor(note.startTime * 4) === time &&
                    note.pitch === pitch + (octave * 12)
                  );

                  return (
                    <button
                      key={`${time}-${pitch}`}
                      onClick={() => addNote(pitch, time * 0.25)}
                      className={`w-6 h-4 sm:w-8 sm:h-6 border border-gray-600 rounded transition-all touch-manipulation ${
                        noteAtPosition
                          ? 'bg-purple-500 hover:bg-purple-600'
                          : 'bg-gray-700 hover:bg-gray-600'
                      } ${
                        currentStep % 16 === time ? 'ring-1 ring-yellow-400' : ''
                      }`}
                      title={`Add note ${pitch} at beat ${time + 1}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNotesList = () => (
    <div className="bg-gray-800 rounded-lg p-4 max-h-40 overflow-y-auto">
      <h4 className="text-white font-semibold mb-2">Notes ({notes.length})</h4>
      {notes.length === 0 ? (
        <p className="text-gray-400 text-sm">No notes added yet. Click on the piano roll to add notes.</p>
      ) : (
        <div className="space-y-1">
          {notes.map((note, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-700 rounded p-2">
              <span className="text-white text-sm">
                Note {note.pitch} at beat {Math.floor(note.startTime * 4) + 1}
              </span>
              <button
                onClick={() => removeNote(index)}
                className="text-red-400 hover:text-red-300 text-sm touch-manipulation"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section id="melody" className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-20">
      <motion.div
        className="max-w-6xl mx-auto text-center w-full"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          🎼 Melody Composer
        </h2>

        <p className="text-lg sm:text-xl text-gray-300 mb-2 sm:mb-4">
          Create your own melodies with the piano roll interface
        </p>

        <p className="text-sm text-purple-400 mb-8 sm:mb-12">
          Click on the grid to add notes and build your melody
        </p>

        {/* Beat Display */}
        <div className="mb-6 p-4 bg-gray-900/50 rounded-xl border border-purple-500/30">
          <div className="text-lg sm:text-xl font-mono text-purple-400">
            Current Beat: {getCurrentBeatDisplay()}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {isPlaying ? 'Playing' : 'Stopped'} • {tempo} BPM
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 sm:mb-8">
          <div className="bg-gray-900/50 rounded-xl p-4 border border-purple-500/30">
            <label className="block text-sm font-medium text-gray-300 mb-2">Key</label>
            <select
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-black border border-purple-500/50 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none text-sm"
            >
              {keys.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 border border-purple-500/30">
            <label className="block text-sm font-medium text-gray-300 mb-2">Scale</label>
            <select
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              className="w-full bg-black border border-purple-500/50 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none text-sm"
            >
              {scales.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 border border-purple-500/30">
            <label className="block text-sm font-medium text-gray-300 mb-2">Octave</label>
            <select
              value={octave}
              onChange={(e) => setOctave(Number(e.target.value))}
              className="w-full bg-black border border-purple-500/50 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none text-sm"
            >
              {octaves.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 border border-purple-500/30">
            <label className="block text-sm font-medium text-gray-300 mb-2">Tempo</label>
            <input
              type="range"
              min="60"
              max="200"
              value={tempo}
              onChange={(e) => onTempoChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-purple-400">{tempo} BPM</span>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 border border-purple-500/30">
            <button
              onClick={playMelody}
              disabled={notes.length === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors text-sm touch-manipulation"
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={randomizeMelody}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm touch-manipulation flex items-center gap-2"
          >
            🎲 Randomize
          </button>
          <button
            onClick={clearMelody}
            className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm touch-manipulation"
          >
            🗑️ Clear
          </button>
          <button
            onClick={saveMelody}
            className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm touch-manipulation flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Save MIDI
          </button>
          <button
            onClick={loadMelody}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm touch-manipulation flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Load MIDI
          </button>
        </div>

        {/* Piano Roll */}
        <div className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-purple-500/30 mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Piano Roll</h3>
          {renderPianoRoll()}
          <div className="mt-4 text-xs sm:text-sm text-gray-400">
            <p>Click on any cell to add a note. Purple cells indicate existing notes.</p>
            <p>Scale: {key} {scale} | Notes in scale: {getScaleNotes(key, scale).join(', ')}</p>
            <p className="mt-1">💾 Save exports as MIDI file • 📂 Load imports MIDI files</p>
          </div>
        </div>

        {/* Notes List */}
        <div className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-purple-500/30">
          {renderNotesList()}
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