import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw, Volume2, Save, FolderOpen, AlertCircle, CheckCircle, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { MIDIExporter } from '../../lib/midiExporter';
import { MIDIParser } from '../../lib/midiParser';

interface DrumPattern {
  kick: boolean[];
  snare: boolean[];
  hihat: boolean[];
  crash: boolean[];
}

interface DrumSectionProps {
  onPlayDrums: (pattern: DrumPattern) => void;
  isPlaying: boolean;
  pattern: DrumPattern;
  onPatternChange: (pattern: DrumPattern) => void;
  currentStep: number;
  tempo: number;
  onTempoChange: (tempo: number) => void;
}

const DrumSection: React.FC<DrumSectionProps> = ({
  onPlayDrums,
  isPlaying,
  pattern,
  onPatternChange,
  currentStep,
  tempo,
  onTempoChange
}) => {
  const [volume, setVolume] = useState(80);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleStep = (drumType: keyof DrumPattern, step: number) => {
    const newPattern = {
      ...pattern,
      [drumType]: pattern[drumType].map((active, i) => i === step ? !active : active)
    };
    onPatternChange(newPattern);
  };

  const clearPattern = () => {
    const newPattern = {
      kick: new Array(16).fill(false),
      snare: new Array(16).fill(false),
      hihat: new Array(16).fill(false),
      crash: new Array(16).fill(false)
    };
    onPatternChange(newPattern);
    toast.success("Pattern cleared successfully!");
  };

  const randomizePattern = () => {
    const newPattern = {
      kick: Array.from({ length: 16 }, () => Math.random() > 0.7),
      snare: Array.from({ length: 16 }, () => Math.random() > 0.8),
      hihat: Array.from({ length: 16 }, () => Math.random() > 0.5),
      crash: Array.from({ length: 16 }, () => Math.random() > 0.9)
    };
    onPatternChange(newPattern);
    toast.success("Pattern randomized!");
  };

  const savePattern = () => {
    try {
      // Check if pattern has any active steps
      const hasActiveSteps = Object.values(pattern).some(drumTrack =>
        drumTrack.some(step => step)
      );

      if (!hasActiveSteps) {
        toast.error("Cannot save empty pattern. Add some drum hits first!");
        return;
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `droplab-drums-${timestamp}`;

      // Export as MIDI file
      MIDIExporter.exportDrums(pattern, tempo, filename);

      const totalHits = Object.values(pattern).reduce((total, drumTrack) =>
        total + drumTrack.filter(Boolean).length, 0
      );

      toast.success(`Drum pattern saved as MIDI! (${totalHits} hits at ${tempo} BPM)`);
      console.log('✅ Drum pattern exported as MIDI:', { pattern, tempo, filename });
    } catch (error) {
      console.error('Failed to save drum pattern:', error);
      toast.error("Failed to save pattern. Please try again.");
    }
  };

  const loadPattern = () => {
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

      const { pattern: loadedPattern, tempo: loadedTempo } = await MIDIParser.parseDrumMIDI(file);

      onPatternChange(loadedPattern);
      onTempoChange(loadedTempo);

      const totalHits = Object.values(loadedPattern).reduce((total: number, drumTrack: boolean[]) =>
        total + drumTrack.filter(Boolean).length, 0
      );

      toast.success(`Drum pattern loaded from MIDI! (${totalHits} hits at ${loadedTempo} BPM)`);
      console.log('✅ Drum pattern loaded from MIDI:', { loadedPattern, loadedTempo });
    } catch (error) {
      console.error('Failed to load drum pattern:', error);
      toast.error("Failed to load MIDI file. Please ensure it's a valid drum MIDI file.");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fixed beat display calculation
  const getCurrentBeatDisplay = () => {
    const bar = Math.floor(currentStep / 16) + 1;
    const beat = (currentStep % 16) + 1; // Beat starts at 1, not 0
    return `${bar}.${beat}`;
  };

  const renderDrumTrack = (drumType: keyof DrumPattern, label: string, color: string) => (
    <motion.div
      className="flex items-center space-x-4 mb-6"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="w-16 text-sm font-display font-semibold text-gray-300 flex-shrink-0">{label}</div>
      <div className="grid grid-cols-8 sm:grid-cols-16 gap-2 flex-1 overflow-x-auto">
        {pattern[drumType].map((active, i) => (
          <motion.button
            key={`${drumType}-${i}`}
            onClick={() => toggleStep(drumType, i)}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-all duration-200 touch-manipulation ${active
              ? `${color}`
              : 'bg-gray-700 hover:bg-gray-600'
              } ${currentStep % 16 === i && isPlaying ? 'ring-2 ring-yellow-400' : ''
              }`}
            aria-label={`Toggle ${label} step ${i + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );

  return (
    <section id="drums" className="px-4 pt-32 pb-8">
      <motion.div
        className="max-w-6xl mx-auto text-center w-full"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Section Title */}
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 text-white">
          🥁 Beat Creator
        </h2>

        <p className="text-lg sm:text-xl text-gray-300 mb-8">
          Create infectious rhythms that make heads nod and feet tap
        </p>

        {/* Beat Display */}
        <div className="card-fun-dark mb-8 p-6 border-2 border-blue-400/30">
          <div className="text-2xl font-mono-fun font-bold text-white mb-2">
            Beat: {getCurrentBeatDisplay()}
          </div>
          <div className="text-sm text-gray-300 font-playful">
            {isPlaying ? '🎵 Playing' : '⏸️ Stopped'} • {tempo} BPM
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            className="card-fun-dark p-4 border-2 border-blue-400/30"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Volume2 className="w-5 h-5 text-white" />
              <h3 className="font-display font-semibold text-white">Volume</h3>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="slider-fun w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-sm text-gray-300 mt-1 font-mono-fun">{volume}%</div>
          </motion.div>

          <motion.button
            onClick={clearPattern}
            className="card-fun-dark p-4 border-2 border-red-400/30 hover:border-red-400/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-white" />
              <h3 className="font-display font-semibold text-white">Clear</h3>
            </div>
            <p className="text-sm text-gray-300 font-playful">Reset pattern</p>
          </motion.button>

          <motion.button
            onClick={randomizePattern}
            className="card-fun-dark p-4 border-2 border-green-400/30 hover:border-green-400/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Play className="w-5 h-5 text-white" />
              <h3 className="font-display font-semibold text-white">Random</h3>
            </div>
            <p className="text-sm text-gray-300 font-playful">Generate pattern</p>
          </motion.button>

          <motion.button
            onClick={savePattern}
            className="card-fun-dark p-4 border-2 border-blue-400/30 hover:border-blue-400/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Save className="w-5 h-5 text-white" />
              <h3 className="font-display font-semibold text-white">Save</h3>
            </div>
            <p className="text-sm text-gray-300 font-playful">Export MIDI</p>
          </motion.button>
        </div>

        {/* Load Pattern Button */}
        <motion.button
          onClick={loadPattern}
          className="btn-fun-secondary mb-8 px-6 py-3 font-display font-semibold"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <FolderOpen className="w-5 h-5 mr-2" />
          Load MIDI Pattern
        </motion.button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".mid,.midi"
          onChange={handleFileLoad}
          className="hidden"
        />

        {/* Drum Grid */}
        <div className="card-fun-dark p-6 border-2 border-blue-400/30">
          <h3 className="text-xl font-display font-bold text-white mb-6">
            🎵 Step Sequencer
          </h3>

          {renderDrumTrack('kick', 'Kick', 'bg-red-500')}
          {renderDrumTrack('snare', 'Snare', 'bg-blue-500')}
          {renderDrumTrack('hihat', 'Hi-Hat', 'bg-yellow-500')}
          {renderDrumTrack('crash', 'Crash', 'bg-green-500')}
        </div>
      </motion.div>
    </section>
  );
};

export default DrumSection;