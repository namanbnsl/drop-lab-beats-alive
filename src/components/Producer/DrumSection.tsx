import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw, Volume2, Save } from 'lucide-react';

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

  // Fixed beat display calculation
  const getCurrentBeatDisplay = () => {
    const bar = Math.floor(currentStep / 16) + 1;
    const beat = (currentStep % 16) + 1; // Beat starts at 1, not 0
    return `${bar}.${beat}`;
  };

  const renderDrumTrack = (drumType: keyof DrumPattern, label: string, color: string) => (
    <div className="flex items-center space-x-2 mb-4">
      <div className="w-12 sm:w-16 text-xs sm:text-sm text-gray-300 flex-shrink-0">{label}</div>
      <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 flex-1 overflow-x-auto">
        {pattern[drumType].map((active, i) => (
          <button
            key={`${drumType}-${i}`}
            onClick={() => toggleStep(drumType, i)}
            className={`w-6 h-6 sm:w-8 sm:h-8 rounded transition-all touch-manipulation ${
              active
                ? `${color} shadow-lg`
                : 'bg-gray-700 hover:bg-gray-600'
            } ${
              currentStep % 16 === i && isPlaying ? 'ring-2 ring-yellow-400' : ''
            }`}
            aria-label={`Toggle ${label} step ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <section id="drums" className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-20">
      <motion.div
        className="max-w-6xl mx-auto text-center w-full"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          🥁 Drum Machine
        </h2>

        <p className="text-lg sm:text-xl text-gray-300 mb-2 sm:mb-4">
          Create your own drum patterns with the step sequencer
        </p>

        <p className="text-sm text-purple-400 mb-8 sm:mb-12">
          Click on the grid to create your rhythm
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Volume</label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-purple-400">{volume}%</span>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 border border-purple-500/30">
            <button
              onClick={() => onPlayDrums(pattern)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors text-sm sm:text-base touch-manipulation"
            >
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 border border-purple-500/30">
            <button
              onClick={clearPattern}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors text-sm sm:text-base touch-manipulation"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Step Sequencer */}
        <div className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-purple-500/30 mb-6 sm:mb-8">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-4">Step Sequencer</h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4">
              <button
                onClick={randomizePattern}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm touch-manipulation"
              >
                🎲 Randomize
              </button>
              <button
                onClick={savePattern}
                className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm touch-manipulation"
              >
                💾 Save
              </button>
              <button
                onClick={loadPattern}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm touch-manipulation"
              >
                📂 Load
              </button>
            </div>
          </div>

          {/* Beat Numbers */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-12 sm:w-16 flex-shrink-0"></div>
            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 flex-1 overflow-x-auto">
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} className="w-6 h-4 sm:w-8 sm:h-6 flex items-center justify-center text-xs text-gray-400">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {renderDrumTrack('kick', 'Kick', 'bg-red-500 shadow-red-500/50')}
            {renderDrumTrack('snare', 'Snare', 'bg-blue-500 shadow-blue-500/50')}
            {renderDrumTrack('hihat', 'Hi-hat', 'bg-green-500 shadow-green-500/50')}
            {renderDrumTrack('crash', 'Crash', 'bg-yellow-500 shadow-yellow-500/50')}
          </div>

          <div className="mt-4 text-xs sm:text-sm text-gray-400">
            <p>Click on any step to toggle it on/off</p>
            <p>Current pattern: {pattern.kick.filter(Boolean).length + pattern.snare.filter(Boolean).length + pattern.hihat.filter(Boolean).length + pattern.crash.filter(Boolean).length} hits</p>
          </div>
        </div>

        {/* Pattern Info */}
        <div className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-purple-500/30">
          <h3 className="text-lg font-semibold text-white mb-4">Pattern Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div>
              <p className="text-gray-300">Kick hits: <span className="text-red-400">{pattern.kick.filter(Boolean).length}</span></p>
            </div>
            <div>
              <p className="text-gray-300">Snare hits: <span className="text-blue-400">{pattern.snare.filter(Boolean).length}</span></p>
            </div>
            <div>
              <p className="text-gray-300">Hi-hat hits: <span className="text-green-400">{pattern.hihat.filter(Boolean).length}</span></p>
            </div>
            <div>
              <p className="text-gray-300">Crash hits: <span className="text-yellow-400">{pattern.crash.filter(Boolean).length}</span></p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default DrumSection;