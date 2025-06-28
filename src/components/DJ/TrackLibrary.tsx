import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, Pause } from 'lucide-react';
import { useDJStore } from '../../stores/djStore';

interface Track {
  id: string;
  name: string;
  filename: string;
  bpm: number;
  key: string;
  duration?: string;
}

const TrackLibrary = () => {
  const { loadTrack } = useDJStore();
  const [previewTrack, setPreviewTrack] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  
  // Updated track list with correct original BPMs for proper auto-sync
  const tracks: Track[] = [
    {
      id: '1',
      name: 'Shimmer',
      filename: 'THYKIER - Shimmer  Tech House  NCS - Copyright Free Music.mp3',
      bpm: 124, // Corrected original BPM - will auto-sync to 128
      key: 'Am',
      duration: '3:45'
    },
    {
      id: '2', 
      name: 'Inferior',
      filename: 'THYKIER - Inferior [NCS Remake].mp3',
      bpm: 120, // Corrected original BPM - will auto-sync to 128
      key: 'Dm',
      duration: '4:12'
    },
    {
      id: '3',
      name: 'Firefly',
      filename: 'Jim Yosef - Firefly  Progressive House  NCS - Copyright Free Music.mp3',
      bpm: 128, // Already at target BPM - no adjustment needed
      key: 'Gm',
      duration: '4:30'
    }
  ];

  const handleLoadTrack = async (track: Track, deck: 'A' | 'B') => {
    console.log(`Loading "${track.name}" to Deck ${deck} - Original BPM: ${track.bpm}, Target: 128 BPM`);
    const trackUrl = `/songs/${track.filename}`;
    
    // Load track with original BPM for auto-sync calculation
    await loadTrack(deck, {
      name: track.name,
      bpm: track.bpm, // This is the original BPM
      key: track.key,
      url: trackUrl,
    });
  };

  const handlePreview = (track: Track) => {
    if (previewTrack === track.id) {
      // Stop preview
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.currentTime = 0;
      }
      setPreviewTrack(null);
    } else {
      // Start new preview
      if (previewAudio) {
        previewAudio.pause();
      }
      
      const audio = new Audio(`/songs/${track.filename}`);
      audio.volume = 0.3;
      audio.currentTime = 30; // Start 30 seconds in
      audio.play();
      
      setPreviewAudio(audio);
      setPreviewTrack(track.id);
      
      // Auto-stop after 15 seconds
      setTimeout(() => {
        audio.pause();
        setPreviewTrack(null);
      }, 15000);
    }
  };

  useEffect(() => {
    return () => {
      if (previewAudio) {
        previewAudio.pause();
      }
    };
  }, [previewAudio]);

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-purple-500/30">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-purple-400 flex items-center justify-center gap-2">
          <Music className="w-5 h-5" />
          Track Library - Auto-Sync to 128 BPM
        </h3>
        <p className="text-xs text-green-400 mt-2">🎯 All tracks automatically sync to 128 BPM when loaded</p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {tracks.map((track, index) => {
          const playbackRate = (128 / track.bpm).toFixed(3);
          const isAtTargetBPM = track.bpm === 128;
          
          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-black rounded-lg p-4 border border-purple-500/20 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {track.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full">
                        {track.duration}
                      </span>
                      <button
                        onClick={() => handlePreview(track)}
                        className="p-1 rounded-full bg-gray-700 hover:bg-purple-600 transition-colors"
                      >
                        {previewTrack === track.id ? (
                          <Pause className="w-3 h-3 text-white" />
                        ) : (
                          <Play className="w-3 h-3 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{track.bpm} BPM</span>
                      <span className="text-green-400">→ 128 BPM</span>
                      {!isAtTargetBPM && (
                        <span className="text-xs text-blue-400">({playbackRate}x rate)</span>
                      )}
                    </div>
                    <span className="text-gray-400">Key: {track.key}</span>
                  </div>
                  
                  {/* Auto-sync indicator */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">
                      {isAtTargetBPM ? 'Already at 128 BPM' : `Auto-sync: ${track.bpm} → 128 BPM`}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
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

              {previewTrack === track.id && (
                <div className="mt-2 text-xs text-purple-400 text-center animate-pulse">
                  🎵 Preview playing...
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-400 text-center space-y-1">
        <div>{tracks.length} tracks available • Click play icon to preview</div>
        <div className="text-green-400">🎯 All tracks auto-sync to 128 BPM for perfect mixing</div>
      </div>
    </div>
  );
};

export default TrackLibrary;