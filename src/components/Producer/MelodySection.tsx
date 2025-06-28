import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw, Volume2, Save, Music } from 'lucide-react';
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
  const [synth, setSynth] = useState<Tone.PolySynth | null>(null);

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const scales = ['major', 'minor', 'pentatonic', 'blues'];
  const octaves = [2, 3, 4, 5, 6];

  useEffect(() => {
    const polySynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.8 }
    }).toDestination();

    setSynth(polySynth);

    return () => {
      polySynth.dispose();
    };
  }, []);

  // Play notes at current step
  useEffect(() => {
    if (isPlaying && synth) {
      const step = currentStep % 16;
      const stepTime = step * 0.25; // 16th note timing

      // Find notes that should play at this step
      const notesToPlay = notes.filter(note =>
        Math.floor(note.startTime * 4) === step
      );

      notesToPlay.forEach(note => {
        const noteName = Tone.Frequency(note.pitch, "midi").toNote();
        synth.triggerAttackRelease(noteName, note.duration, undefined, note.velocity);
      });
    }
  }, [currentStep, isPlaying, notes, synth]);

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
  };

  const saveMelody = () => {
    const melodyData = JSON.stringify({ notes, key, scale, octave });
    localStorage.setItem('melodyData', melodyData);
  };

  const loadMelody = () => {
    const saved = localStorage.getItem('melodyData');
    if (saved) {
      const data = JSON.parse(saved);
      onNotesChange(data.notes || []);
      setKey(data.key || 'C');
      setScale(data.scale || 'major');
      setOctave(data.octave || 4);
    }
  };

  const playMelody = () => {
    if (synth && notes.length > 0) {
      onPlayMelody(notes);
    }
  };

  const renderPianoRoll = () => {
    const scaleNotes = getScaleNotes(key, scale);
    const gridSize = 16;

    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-16 gap-1">
          {Array.from({ length: gridSize }, (_, time) => (
            <div key={time} className="col-span-1">
              {scaleNotes.map((pitch, pitchIndex) => {
                const noteAtPosition = notes.find(note =>
                  Math.floor(note.startTime * 4) === time &&
                  note.pitch === pitch + (octave * 12)
                );

                return (
                  <button
                    key={`${time}-${pitch}`}
                    onClick={() => addNote(pitch, time * 0.25)}
                    className={`w-full h-6 border border-gray-600 rounded ${noteAtPosition
                        ? 'bg-purple-500 hover:bg-purple-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                      } transition-colors ${currentStep % 16 === time ? 'ring-1 ring-yellow-400' : ''
                      }`}
                    title={`Add note ${pitch} at time ${time * 0.25}s`}
                  />
                );
              })}
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
                Note {note.pitch} at {note.startTime.toFixed(1)}s
              </span>
              <button
                onClick={() => removeNote(index)}
                className="text-red-400 hover:text-red-300 text-sm"
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
    <section id="melody" className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        className="max-w-6xl mx-auto text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          🎼 Melody Composer
        </h2>

        <p className="text-xl text-gray-300 mb-4">
          Create your own melodies with the piano roll interface
        </p>

        <p className="text-sm text-purple-400 mb-12">
          Click on the grid to add notes and build your melody
        </p>

        {/* Controls */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-900/50 rounded-xl p-4 border border-purple-500/30">
            <label className="block text-sm font-medium text-gray-300 mb-2">Key</label>
            <select
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-black border border-purple-500/50 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
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
              className="w-full bg-black border border-purple-500/50 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
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
              className="w-full bg-black border border-purple-500/50 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
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
              className="w-full"
            />
            <span className="text-sm text-purple-400">{tempo} BPM</span>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 border border-purple-500/30">
            <button
              onClick={playMelody}
              disabled={notes.length === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={randomizeMelody}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🎲 Randomize
          </button>
          <button
            onClick={clearMelody}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🗑️ Clear
          </button>
          <button
            onClick={saveMelody}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            💾 Save
          </button>
          <button
            onClick={loadMelody}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            📂 Load
          </button>
        </div>

        {/* Piano Roll */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-purple-500/30 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Piano Roll</h3>
          {renderPianoRoll()}
          <div className="mt-4 text-sm text-gray-400">
            <p>Click on any cell to add a note. Purple cells indicate existing notes.</p>
            <p>Scale: {key} {scale} | Notes in scale: {getScaleNotes(key, scale).join(', ')}</p>
          </div>
        </div>

        {/* Notes List */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-purple-500/30">
          {renderNotesList()}
        </div>
      </motion.div>
    </section>
  );
};

export default MelodySection;