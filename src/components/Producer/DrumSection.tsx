import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw, Volume2 } from 'lucide-react';
import { LyriaGenerationResponse } from '../../lib/lyria';

interface DrumSectionProps {
  onGenerateDrums: (style: string, complexity: string) => Promise<LyriaGenerationResponse | null>;
  onPlayDrums: () => void;
  drumSequence: LyriaGenerationResponse | null;
  modelsLoaded: boolean;
}

const DrumSection: React.FC<DrumSectionProps> = ({
  onGenerateDrums,
  onPlayDrums,
  drumSequence,
  modelsLoaded
}) => {
  const [style, setStyle] = useState('House');
  const [complexity, setComplexity] = useState('Simple');
  const [isGenerating, setIsGenerating] = useState(false);

  const styles = ['House', 'Trap', 'DnB', 'Techno'];
  const complexities = ['Simple', 'Swing', 'Polyrhythm', 'Complex'];

  const handleGenerateDrums = async () => {
    if (!modelsLoaded) return;
    
    setIsGenerating(true);
    try {
      // Lyria: Generate Drum Beat using Google's AI
      await onGenerateDrums(style, complexity);
    } finally {
      setIsGenerating(false);
    }
  };

  // Convert drum sequence to visual pattern
  const renderDrumPattern = () => {
    if (!drumSequence || !drumSequence.midiData) {
      return (
        <div className="text-gray-500">
          <div className="grid grid-cols-16 gap-1 mb-4">
            {/* Kick Pattern */}
            <div className="text-xs text-gray-400 col-span-16 mb-1">Kick</div>
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={`kick-${i}`}
                className={`w-3 h-3 rounded ${
                  [0, 4, 8, 12].includes(i) ? 'bg-purple-500' : 'bg-gray-700'
                }`}
              />
            ))}
            {/* Snare Pattern */}
            <div className="text-xs text-gray-400 col-span-16 mb-1 mt-2">Snare</div>
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={`snare-${i}`}
                className={`w-3 h-3 rounded ${
                  [4, 12].includes(i) ? 'bg-purple-400' : 'bg-gray-700'
                }`}
              />
            ))}
            {/* Hi-hat Pattern */}
            <div className="text-xs text-gray-400 col-span-16 mb-1 mt-2">Hi-hat</div>
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={`hihat-${i}`}
                className={`w-3 h-3 rounded ${
                  i % 2 === 0 ? 'bg-purple-300' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className="text-sm">Your Lyria-generated drum pattern will appear here</p>
        </div>
      );
    }

    try {
      // Parse the Lyria MIDI data
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(drumSequence.midiData);
      const midiData = JSON.parse(jsonString);
      const notes = midiData.notes;

      // Create drum pattern visualization from generated sequence
      const kickNotes = notes.filter((note: any) => note.pitch === 36); // Kick drum
      const snareNotes = notes.filter((note: any) => note.pitch === 38); // Snare
      const hihatNotes = notes.filter((note: any) => note.pitch === 42); // Hi-hat

      const createPattern = (drumNotes: any[], steps: number = 16) => {
        const pattern = new Array(steps).fill(false);
        drumNotes.forEach((note: any) => {
          const step = Math.floor((note.startTime || 0) * 4) % steps; // Convert time to step
          pattern[step] = true;
        });
        return pattern;
      };

      const kickPattern = createPattern(kickNotes);
      const snarePattern = createPattern(snareNotes);
      const hihatPattern = createPattern(hihatNotes);

      return (
        <div className="space-y-2">
          <div className="grid grid-cols-16 gap-1">
            {/* Kick Pattern */}
            <div className="text-xs text-gray-400 col-span-16 mb-1">Kick</div>
            {kickPattern.map((active, i) => (
              <div
                key={`kick-${i}`}
                className={`w-3 h-3 rounded transition-all ${
                  active ? 'bg-purple-500 shadow-lg shadow-purple-500/50' : 'bg-gray-700'
                }`}
              />
            ))}
            
            {/* Snare Pattern */}
            <div className="text-xs text-gray-400 col-span-16 mb-1 mt-2">Snare</div>
            {snarePattern.map((active, i) => (
              <div
                key={`snare-${i}`}
                className={`w-3 h-3 rounded transition-all ${
                  active ? 'bg-purple-400 shadow-lg shadow-purple-400/50' : 'bg-gray-700'
                }`}
              />
            ))}
            
            {/* Hi-hat Pattern */}
            <div className="text-xs text-gray-400 col-span-16 mb-1 mt-2">Hi-hat</div>
            {hihatPattern.map((active, i) => (
              <div
                key={`hihat-${i}`}
                className={`w-3 h-3 rounded transition-all ${
                  active ? 'bg-purple-300 shadow-lg shadow-purple-300/50' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-purple-400">
            Generated with Lyria AI: {style} pattern ({complexity}) with {notes.length} hits
          </p>
          {drumSequence.metadata && (
            <p className="text-xs text-gray-400">
              Duration: {drumSequence.metadata.duration}s | Tempo: {drumSequence.metadata.tempo} BPM
            </p>
          )}
        </div>
      );
    } catch (error) {
      return (
        <div className="text-gray-500">
          <p className="text-sm">Generated drum pattern data available</p>
        </div>
      );
    }
  };

  return (
    <section id="drums" className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          🥁 Lay Down the Groove
        </h2>
        
        <p className="text-xl text-gray-300 mb-4">
          Create the perfect rhythm foundation with Lyria AI-powered drum patterns
        </p>
        
        <p className="text-sm text-purple-400 mb-12">
          Powered by Google's advanced music generation technology
        </p>

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
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

          {/* Complexity Selector */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-purple-500/30">
            <label className="block text-sm font-medium text-gray-300 mb-3">Complexity</label>
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value)}
              className="w-full bg-black border border-purple-500/50 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
            >
              {complexities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex gap-4 justify-center mb-12">
          <motion.button
            onClick={handleGenerateDrums}
            disabled={isGenerating || !modelsLoaded}
            className="group relative px-8 py-4 bg-purple-600 rounded-full font-semibold text-lg text-white transition-all duration-300 hover:bg-purple-500 hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center gap-2 justify-center">
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Lyria is creating...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Generate with Lyria
                </>
              )}
            </span>
          </motion.button>

          {/* Play Button */}
          {drumSequence && (
            <motion.button
              onClick={onPlayDrums}
              className="group relative px-6 py-4 bg-gray-700 rounded-full font-semibold text-lg text-white transition-all duration-300 hover:bg-gray-600 hover:shadow-xl hover:shadow-gray-500/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="flex items-center gap-2 justify-center">
                <Volume2 className="w-5 h-5" />
                Play
              </span>
            </motion.button>
          )}
        </div>

        {/* API Status */}
        {!modelsLoaded && (
          <div className="mb-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              🤖 Connecting to Lyria AI... Please wait for drum generation to become available.
            </p>
          </div>
        )}

        {/* Drum Pattern Preview */}
        <motion.div
          className="bg-gray-900/50 rounded-xl p-8 border border-purple-500/30"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Drum Pattern Preview</h3>
          <div className="h-32 bg-black rounded-lg border border-purple-500/20 flex items-center justify-center">
            {isGenerating ? (
              <div className="flex items-center gap-2 text-purple-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span>Lyria AI is crafting your rhythm...</span>
              </div>
            ) : (
              renderDrumPattern()
            )}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default DrumSection;