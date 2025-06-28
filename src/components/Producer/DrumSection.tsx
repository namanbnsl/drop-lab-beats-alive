import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw, Volume2, Save } from 'lucide-react';
import * as Tone from 'tone';

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

  // Audio synths
  const [synths, setSynths] = useState<{
    kick: Tone.MembraneSynth | null;
    snare: Tone.NoiseSynth | null;
    hihat: Tone.MetalSynth | null;
    crash: Tone.MetalSynth | null;
  }>({
    kick: null,
    snare: null,
    hihat: null,
    crash: null
  });

  useEffect(() => {
    // Initialize audio synths
    const kickSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 10,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
    }).toDestination();

    const snareSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.0, release: 0.4 }
    }).toDestination();

    const hihatSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.1, sustain: 0.0, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    }).toDestination();

    const crashSynth = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.0, release: 0.8 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    }).toDestination();

    setSynths({ kick: kickSynth, snare: snareSynth, hihat: hihatSynth, crash: crashSynth });

    return () => {
      kickSynth.dispose();
      snareSynth.dispose();
      hihatSynth.dispose();
      crashSynth.dispose();
    };
  }, []);

  // Play current step when it changes
  useEffect(() => {
    if (isPlaying && synths.kick) {
      const step = currentStep % 16;

      if (pattern.kick[step]) {
        synths.kick.triggerAttackRelease('C2', '16n');
      }
      if (pattern.snare[step]) {
        synths.snare.triggerAttackRelease('16n');
      }
      if (pattern.hihat[step]) {
        synths.hihat.triggerAttackRelease('C6', '16n');
      }
      if (pattern.crash[step]) {
        synths.crash.triggerAttackRelease('C5', '8n');
      }
    }
  }, [currentStep, isPlaying, pattern, synths]);

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
  };

  const randomizePattern = () => {
    const newPattern = {
      kick: Array.from({ length: 16 }, () => Math.random() > 0.7),
      snare: Array.from({ length: 16 }, () => Math.random() > 0.8),
      hihat: Array.from({ length: 16 }, () => Math.random() > 0.5),
      crash: Array.from({ length: 16 }, () => Math.random() > 0.9)
    };
    onPatternChange(newPattern);
  };

  const savePattern = () => {
    const patternData = JSON.stringify(pattern);
    localStorage.setItem('drumPattern', patternData);
  };

  const loadPattern = () => {
    const saved = localStorage.getItem('drumPattern');
    if (saved) {
      const loadedPattern = JSON.parse(saved);
      onPatternChange(loadedPattern);
    }
  };

  const renderDrumTrack = (drumType: keyof DrumPattern, label: string, color: string) => (
    <div className="flex items-center space-x-2 mb-4">
      <div className="w-16 text-sm text-gray-300">{label}</div>
      <div className="grid grid-cols-16 gap-1 flex-1">
        {pattern[drumType].map((active, i) => (
          <button
            key={`${drumType}-${i}`}
            onClick={() => toggleStep(drumType, i)}
            className={`w-8 h-8 rounded transition-all ${active
                ? `${color} shadow-lg`
                : 'bg-gray-700 hover:bg-gray-600'
              } ${currentStep % 16 === i && isPlaying ? 'ring-2 ring-yellow-400' : ''
              }`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <section id="drums" className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        className="max-w-6xl mx-auto text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          🥁 Drum Machine
        </h2>

        <p className="text-xl text-gray-300 mb-4">
          Create your own drum patterns with the step sequencer
        </p>

        <p className="text-sm text-purple-400 mb-12">
          Click on the grid to create your rhythm
        </p>

        {/* Controls */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Volume</label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-purple-400">{volume}%</span>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 border border-purple-500/30">
            <button
              onClick={() => onPlayDrums(pattern)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 border border-purple-500/30">
            <button
              onClick={clearPattern}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors mb-2"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Step Sequencer */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-purple-500/30 mb-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-4">Step Sequencer</h3>
            <div className="flex justify-center space-x-4 mb-4">
              <button
                onClick={randomizePattern}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🎲 Randomize
              </button>
              <button
                onClick={savePattern}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                💾 Save
              </button>
              <button
                onClick={loadPattern}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📂 Load
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {renderDrumTrack('kick', 'Kick', 'bg-red-500 shadow-red-500/50')}
            {renderDrumTrack('snare', 'Snare', 'bg-blue-500 shadow-blue-500/50')}
            {renderDrumTrack('hihat', 'Hi-hat', 'bg-green-500 shadow-green-500/50')}
            {renderDrumTrack('crash', 'Crash', 'bg-yellow-500 shadow-yellow-500/50')}
          </div>

          <div className="mt-4 text-sm text-gray-400">
            <p>Click on any step to toggle it on/off</p>
            <p>Current pattern: {pattern.kick.filter(Boolean).length + pattern.snare.filter(Boolean).length + pattern.hihat.filter(Boolean).length + pattern.crash.filter(Boolean).length} hits</p>
          </div>
        </div>

        {/* Pattern Info */}
        <div className="bg-gray-900/50 rounded-xl p-6 border border-purple-500/30">
          <h3 className="text-lg font-semibold text-white mb-4">Pattern Information</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-300">Kick hits: <span className="text-red-400">{pattern.kick.filter(Boolean).length}</span></p>
              <p className="text-gray-300">Snare hits: <span className="text-blue-400">{pattern.snare.filter(Boolean).length}</span></p>
            </div>
            <div>
              <p className="text-gray-300">Hi-hat hits: <span className="text-green-400">{pattern.hihat.filter(Boolean).length}</span></p>
              <p className="text-gray-300">Crash hits: <span className="text-yellow-400">{pattern.crash.filter(Boolean).length}</span></p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default DrumSection;