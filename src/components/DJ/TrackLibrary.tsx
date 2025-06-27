
import React from 'react';
import { motion } from 'framer-motion';
import { Music, Download } from 'lucide-react';

const TrackLibrary = () => {
  const tracks = [
    { id: 1, title: "Astral Bounce", genre: "House", bpm: 126, key: "Am" },
    { id: 2, title: "Night Voltage", genre: "DnB", bpm: 174, key: "Dm" },
    { id: 3, title: "Neon Dreams", genre: "Synthwave", bpm: 110, key: "Em" },
    { id: 4, title: "Bass Drop City", genre: "Dubstep", bpm: 140, key: "Gm" },
    { id: 5, title: "Midnight Groove", genre: "Tech House", bpm: 128, key: "F#m" },
    { id: 6, title: "Crystal Waters", genre: "Ambient", bpm: 85, key: "Cm" },
    { id: 7, title: "Electric Pulse", genre: "Electro", bpm: 132, key: "Bm" },
    { id: 8, title: "Solar Flare", genre: "Trance", bpm: 138, key: "Am" },
  ];

  const handleLoadTrack = (track: typeof tracks[0], deck: 'A' | 'B') => {
    console.log(`Loading "${track.title}" to Deck ${deck}`);
    // This will be wired up to actual audio loading later
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-purple-500/30">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-purple-400 flex items-center justify-center gap-2">
          <Music className="w-5 h-5" />
          Track Library
        </h3>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {tracks.map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-black rounded-lg p-4 border border-purple-500/20 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {track.title}
                  </h4>
                  <span className="text-xs px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full">
                    {track.genre}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{track.bpm} BPM</span>
                  <span>Key: {track.key}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <motion.button
                onClick={() => handleLoadTrack(track, 'A')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-600/30 transition-all text-sm font-medium"
              >
                Load to A
              </motion.button>
              <motion.button
                onClick={() => handleLoadTrack(track, 'B')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-3 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-600/30 transition-all text-sm font-medium"
              >
                Load to B
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrackLibrary;
