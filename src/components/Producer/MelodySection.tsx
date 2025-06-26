import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw } from 'lucide-react';

const MelodySection = () => {
  const [key, setKey] = useState('C');
  const [style, setStyle] = useState('Simple');
  const [length, setLength] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const styles = ['Simple', 'Complex', 'Interpolated'];
  const lengths = [4, 8, 16];

  const handleGenerateMelody = () => {
    setIsGenerating(true);
    // TODO: Integrate Magenta's MelodyRNN or MusicVAE here
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <section id="melody" className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          🎼 Find Your Sound
        </h2>
        
        <p className="text-xl text-gray-300 mb-12">
          Let AI compose the perfect melody for your track
        </p>

        {/* Controls */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Key Selector */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-purple-500/30">
            <label className="block text-sm font-medium text-gray-300 mb-3">Key</label>
            <select
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-black border border-purple-500/50 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
            >
              {keys.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* Style Selector */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-purple-500/30">
            <label className="block text-sm font-medium text-gray-300 mb-3">Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-black border border-purple-500/50 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
            >
              {styles.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Length Selector */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-purple-500/30">
            <label className="block text-sm font-medium text-gray-300 mb-3">Length</label>
            <select
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full bg-black border border-purple-500/50 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
            >
              {lengths.map((l) => (
                <option key={l} value={l}>{l} bars</option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <motion.button
          onClick={handleGenerateMelody}
          disabled={isGenerating}
          className="group relative px-8 py-4 bg-purple-600 rounded-full font-semibold text-lg text-white transition-all duration-300 hover:bg-purple-500 hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed mb-12"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex items-center gap-2 justify-center">
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Generate Melody
              </>
            )}
          </span>
        </motion.button>

        {/* Melody Preview Placeholder */}
        <motion.div
          className="bg-gray-900/50 rounded-xl p-8 border border-purple-500/30"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Melody Preview</h3>
          <div className="h-32 bg-black rounded-lg border border-purple-500/20 flex items-center justify-center">
            {isGenerating ? (
              <div className="flex items-center gap-2 text-purple-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span>AI is composing your melody...</span>
              </div>
            ) : (
              <div className="text-gray-500">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-8 bg-purple-500/30 rounded"></div>
                  <div className="w-2 h-12 bg-purple-500/50 rounded"></div>
                  <div className="w-2 h-6 bg-purple-500/30 rounded"></div>
                  <div className="w-2 h-16 bg-purple-500/70 rounded"></div>
                  <div className="w-2 h-10 bg-purple-500/40 rounded"></div>
                  <div className="w-2 h-14 bg-purple-500/60 rounded"></div>
                  <div className="w-2 h-8 bg-purple-500/30 rounded"></div>
                  <div className="w-2 h-12 bg-purple-500/50 rounded"></div>
                </div>
                <p className="text-sm">Your generated melody will appear here</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default MelodySection;