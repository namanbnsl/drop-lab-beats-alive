import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw, Volume2 } from 'lucide-react';
import { LyriaGenerationResponse } from '../../lib/lyria';

interface MelodySectionProps {
  onGenerateMelody: (key: string, style: string, length: number) => Promise<LyriaGenerationResponse | null>;
  onPlayMelody: () => void;
  melodySequence: LyriaGenerationResponse | null;
  modelsLoaded: boolean;
}

const MelodySection: React.FC<MelodySectionProps> = ({
  onGenerateMelody,
  onPlayMelody,
  melodySequence,
  modelsLoaded
}) => {
  const [key, setKey] = useState('C');
  const [style, setStyle] = useState('Simple');
  const [length, setLength] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const styles = ['Simple', 'Complex', 'Ambient', 'Energetic'];
  const lengths = [4, 8, 16];

  const handleGenerateMelody = async () => {
    if (!modelsLoaded) return;
    
    setIsGenerating(true);
    try {
      // Lyria: Generate Melody using Google's AI
      await onGenerateMelody(key, style, length);
    } finally {
      setIsGenerating(false);
    }
  };

  // Convert Lyria response to visual representation
  const renderMelodyVisualization = () => {
    if (!melodySequence || !melodySequence.midiData) {
      return (
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
          <p className="text-sm">Your Lyria-generated melody will appear here</p>
        </div>
      );
    }

    try {
      // Parse the Lyria MIDI data
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(melodySequence.midiData);
      const midiData = JSON.parse(jsonString);
      const notes = midiData.notes.slice(0, 16); // Show first 16 notes

      return (
        <div className="space-y-2">
          <div className="flex items-end gap-1 h-16">
            {notes.map((note: any, index: number) => {
              const height = ((note.pitch || 60) - 48) * 2; // Scale pitch to height
              return (
                <div
                  key={index}
                  className="w-3 bg-purple-500 rounded-t animate-pulse"
                  style={{ height: `${Math.max(8, Math.min(height, 64))}px` }}
                />
              );
            })}
          </div>
          <p className="text-sm text-purple-400">
            Generated with Lyria AI: {notes.length} notes in {key} ({style})
          </p>
          {melodySequence.metadata && (
            <p className="text-xs text-gray-400">
              Duration: {melodySequence.metadata.duration}s | Tempo: {melodySequence.metadata.tempo} BPM
            </p>
          )}
        </div>
      );
    } catch (error) {
      return (
        <div className="text-gray-500">
          <p className="text-sm">Generated melody data available</p>
        </div>
      );
    }
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
        
        <p className="text-xl text-gray-300 mb-4">
          Let Google's Lyria AI compose the perfect melody for your track
        </p>
        
        <p className="text-sm text-purple-400 mb-12">
          Powered by Google's advanced music generation technology
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
        <div className="flex gap-4 justify-center mb-12">
          <motion.button
            onClick={handleGenerateMelody}
            disabled={isGenerating || !modelsLoaded}
            className="group relative px-8 py-4 bg-purple-600 rounded-full font-semibold text-lg text-white transition-all duration-300 hover:bg-purple-500 hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center gap-2 justify-center">
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Lyria is composing...
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
          {melodySequence && (
            <motion.button
              onClick={onPlayMelody}
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
              🤖 Connecting to Lyria AI... Please wait for melody generation to become available.
            </p>
          </div>
        )}

        {/* Melody Preview */}
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
                <span>Lyria AI is composing your melody...</span>
              </div>
            ) : (
              renderMelodyVisualization()
            )}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default MelodySection;