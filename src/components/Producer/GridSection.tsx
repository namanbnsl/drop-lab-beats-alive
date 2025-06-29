import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

const GridSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [swing, setSwing] = useState(0);
  const [scale, setScale] = useState('Major');
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

  const scales = ['Major', 'Minor', 'Dorian', 'Mixolydian', 'Pentatonic'];

  const toggleNote = (row: number, col: number) => {
    const noteId = `${row}-${col}`;
    const newActiveNotes = new Set(activeNotes);

    if (newActiveNotes.has(noteId)) {
      newActiveNotes.delete(noteId);
    } else {
      newActiveNotes.add(noteId);
    }

    setActiveNotes(newActiveNotes);
  };

  const clearGrid = () => {
    setActiveNotes(new Set());
  };

  return (
    <section id="grid" className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        className="max-w-6xl mx-auto text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          🧱 Shape the Rhythm
        </h2>

        <p className="text-xl text-gray-300 mb-8">
          Tap to place notes. Make your melody yours.
        </p>

        {/* Controls */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Tempo */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-blue-500/30">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Tempo: {tempo} BPM
            </label>
            <input
              type="range"
              min="60"
              max="180"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Swing */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-blue-500/30">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Swing: {swing}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={swing}
              onChange={(e) => setSwing(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Scale */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-blue-500/30">
            <label className="block text-sm font-medium text-gray-300 mb-3">Scale</label>
            <select
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              className="w-full bg-black border border-blue-500/50 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
            >
              {scales.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <motion.button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-full font-semibold text-white hover:bg-blue-500 transition-colors btn-glow btn-glow-blue"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isPlaying ? 'Stop' : 'Play'}
          </motion.button>

          <motion.button
            onClick={clearGrid}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 rounded-full font-semibold text-white hover:bg-gray-600 transition-colors btn-glow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-5 h-5" />
            Clear
          </motion.button>
        </div>

        {/* 16x16 Grid */}
        <motion.div
          className="bg-gray-900/50 rounded-xl p-6 border border-blue-500/30 max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-16 gap-1 mb-4">
            {Array.from({ length: 16 }, (_, row) =>
              Array.from({ length: 16 }, (_, col) => {
                const noteId = `${row}-${col}`;
                const isActive = activeNotes.has(noteId);

                return (
                  <motion.button
                    key={noteId}
                    onClick={() => toggleNote(row, col)}
                    className={`aspect-square rounded transition-all duration-200 ${isActive
                      ? 'bg-blue-500 shadow-lg shadow-blue-500/25'
                      : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={isActive ? {
                      boxShadow: ['0 0 0 rgba(162, 89, 255, 0)', '0 0 20px rgba(162, 89, 255, 0.5)', '0 0 0 rgba(162, 89, 255, 0)']
                    } : {}}
                    transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                  />
                );
              })
            )}
          </div>

          <p className="text-sm text-gray-400">
            Click cells to create your pattern • {activeNotes.size} notes active
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default GridSection;