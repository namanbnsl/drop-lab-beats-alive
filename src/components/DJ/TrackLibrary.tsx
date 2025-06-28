
import React from 'react';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';
import { useDJStore } from '../../stores/djStore';

const TrackLibrary = () => {
  const { loadTrack } = useDJStore();
  
  // Sample tracks with placeholder URLs (you can replace with real audio files)
  const tracks = [
    { 
      id: 1, 
      name: "Astral Bounce", 
      genre: "House", 
      bpm: 126, 
      key: "Am",
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" // Placeholder
    },
    { 
      id: 2, 
      name: "Night Voltage", 
      genre: "DnB", 
      bpm: 174, 
      key: "Dm",
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" // Placeholder
    },
    { 
      id: 3, 
      name: "Neon Dreams", 
      genre: "Synthwave", 
      bpm: 110, 
      key: "Em",
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" // Placeholder
    },
    { 
      id: 4, 
      name: "Bass Drop City", 
      genre: "Dubstep", 
      bpm: 140, 
      key: "Gm",
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" // Placeholder
    },
    { 
      id: 5, 
      name: "Midnight Groove", 
      genre: "Tech House", 
      bpm: 128, 
      key: "F#m",
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" // Placeholder
    },
    { 
      id: 6, 
      name: "Crystal Waters", 
      genre: "Ambient", 
      bpm: 85, 
      key: "Cm",
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" // Placeholder
    },
    { 
      id: 7, 
      name: "Electric Pulse", 
      genre: "Electro", 
      bpm: 132, 
      key: "Bm",
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" // Placeholder
    },
    { 
      id: 8, 
      name: "Solar Flare", 
      genre: "Trance", 
      bpm: 138, 
      key: "Am",
      url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" // Placeholder
    },
  ];

  const handleLoadTrack = async (track: typeof tracks[0], deck: 'A' | 'B') => {
    console.log(`Loading "${track.name}" to Deck ${deck}`);
    await loadTrack(deck, {
      name: track.name,
      bpm: track.bpm,
      key: track.key,
      url: track.url,
    });
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
                    {track.name}
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
