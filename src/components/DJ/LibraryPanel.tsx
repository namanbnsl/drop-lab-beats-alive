
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Music, X } from 'lucide-react';
import { useDJStore } from '../../stores/djStore';

interface Track {
  id: string;
  name: string;
  url: string;
  duration?: number;
}

const LibraryPanel = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { loadTrack } = useDJStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const newTrack: Track = {
      id: Date.now().toString(),
      name: file.name.replace(/\.[^/.]+$/, ""),
      url: url,
    };

    setTracks(prev => [...prev, newTrack]);
  };

  const handleLoadTrack = async (track: Track, deck: 'A' | 'B') => {
    await loadTrack(deck, {
      name: track.name,
      bpm: 128,
      key: 'Am',
      url: track.url,
    });
  };

  const removeTrack = (id: string) => {
    setTracks(prev => prev.filter(track => track.id !== id));
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed top-4 right-4 z-50 p-3 rounded-full transition-all ${
          isOpen 
            ? 'bg-purple-600 text-white' 
            : 'bg-gray-800 text-purple-400 hover:bg-gray-700'
        }`}
      >
        <Music className="w-6 h-6" />
      </motion.button>

      {/* Library Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-purple-500/30 z-40 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-purple-400">Music Library</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Section */}
        <div className="mb-6">
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-500/30 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
            <Upload className="w-8 h-8 text-purple-400 mb-2" />
            <span className="text-sm text-gray-400">Upload MP3/WAV</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Track List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {tracks.map((track) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black rounded-lg p-4 border border-purple-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white truncate">{track.name}</h4>
                <button
                  onClick={() => removeTrack(track.id)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleLoadTrack(track, 'A')}
                  className="flex-1 px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded text-purple-400 hover:bg-purple-600/30 transition-all text-sm"
                >
                  Load to A
                </button>
                <button
                  onClick={() => handleLoadTrack(track, 'B')}
                  className="flex-1 px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded text-purple-400 hover:bg-purple-600/30 transition-all text-sm"
                >
                  Load to B
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30"
        />
      )}
    </>
  );
};

export default LibraryPanel;
