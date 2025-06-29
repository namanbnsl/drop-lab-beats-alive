import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, Pause, Upload, X, File } from 'lucide-react';
import { useDJStore } from '../../stores/djStore';

interface Track {
  id: string;
  name: string;
  filename: string;
  bpm: number;
  key: string;
  duration?: string;
  url?: string;
  isUserUploaded?: boolean;
}

const TrackLibrary = () => {
  const { loadTrack } = useDJStore();
  const [previewTrack, setPreviewTrack] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [uploadedTracks, setUploadedTracks] = useState<Track[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Pre-loaded demo tracks with correct original BPMs for proper auto-sync
  const demoTracks: Track[] = [
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

  // Combine demo tracks with uploaded tracks
  const allTracks = [...demoTracks, ...uploadedTracks];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.includes('audio/')) {
          console.warn(`Skipping ${file.name}: Not an audio file`);
          continue;
        }

        // Create object URL for the file
        const url = URL.createObjectURL(file);

        // Get file duration using audio element
        const audio = new Audio(url);

        await new Promise((resolve, reject) => {
          audio.addEventListener('loadedmetadata', () => {
            const duration = audio.duration;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            const durationString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            // Create track object
            const newTrack: Track = {
              id: `uploaded-${Date.now()}-${i}`,
              name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
              filename: file.name,
              bpm: 128, // Default BPM - user can adjust if needed
              key: 'C', // Default key
              duration: durationString,
              url: url,
              isUserUploaded: true
            };

            setUploadedTracks(prev => [...prev, newTrack]);
            resolve(null);
          });

          audio.addEventListener('error', () => {
            console.error(`Failed to load ${file.name}`);
            URL.revokeObjectURL(url);
            reject(new Error(`Failed to load ${file.name}`));
          });
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  const handleLoadTrack = async (track: Track, deck: 'A' | 'B') => {
    console.log(`Loading "${track.name}" to Deck ${deck} - Original BPM: ${track.bpm}, Target: 128 BPM`);

    let trackUrl: string;

    if (track.isUserUploaded && track.url) {
      // Use the object URL for uploaded tracks
      trackUrl = track.url;
    } else {
      // Use the file path for demo tracks
      trackUrl = `/songs/${track.filename}`;
    }

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

      let audioUrl: string;
      if (track.isUserUploaded && track.url) {
        audioUrl = track.url;
      } else {
        audioUrl = `/songs/${track.filename}`;
      }

      const audio = new Audio(audioUrl);
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

  const handleRemoveTrack = (trackId: string) => {
    const track = uploadedTracks.find(t => t.id === trackId);
    if (track && track.url) {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(track.url);
    }

    setUploadedTracks(prev => prev.filter(t => t.id !== trackId));

    // Stop preview if this track is playing
    if (previewTrack === trackId) {
      if (previewAudio) {
        previewAudio.pause();
      }
      setPreviewTrack(null);
    }
  };

  useEffect(() => {
    return () => {
      if (previewAudio) {
        previewAudio.pause();
      }
      // Clean up object URLs when component unmounts
      uploadedTracks.forEach(track => {
        if (track.url) {
          URL.revokeObjectURL(track.url);
        }
      });
    };
  }, [previewAudio, uploadedTracks]);

  return (
    <div className="bg-black/90 backdrop-blur-md rounded-xl p-6 border border-blue-500/30">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
          <Music className="w-5 h-5" />
          Track Library - Auto-Sync to 128 BPM
        </h3>
        <p className="text-xs text-white mt-2">🎯 All tracks automatically sync to 128 BPM when loaded</p>
      </div>

      {/* Upload Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white">Upload Your Music</h4>
          {isUploading && (
            <div className="flex items-center gap-2 text-xs text-white">
              <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          )}
        </div>

        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-500/30 rounded-lg cursor-pointer hover:border-blue-500 transition-colors group">
          <Upload className="w-6 h-6 text-white mb-2 group-hover:text-white" />
          <span className="text-sm text-white group-hover:text-white">
            Drop MP3/WAV files here or click to browse
          </span>
          <span className="text-xs text-white mt-1">
            Supports multiple file upload
          </span>
          <input
            type="file"
            accept="audio/*,.mp3,.wav"
            onChange={handleFileUpload}
            className="hidden"
            multiple
            disabled={isUploading}
          />
        </label>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {/* Demo Tracks Section */}
        {demoTracks.length > 0 && (
          <>
            <div className="text-xs text-white font-semibold mb-2 flex items-center gap-2">
              <Music className="w-3 h-3" />
              Demo Tracks
            </div>
            {demoTracks.map((track, index) => {
              const playbackRate = (128 / track.bpm).toFixed(3);
              const isAtTargetBPM = track.bpm === 128;

              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-black/50 rounded-lg p-4 border border-blue-500/20 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white group-hover:text-white transition-colors">
                          {track.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 border border-blue-500/30 text-white rounded-full">
                            {track.duration}
                          </span>
                          <button
                            onClick={() => handlePreview(track)}
                            className="p-1 rounded-full bg-gray-700 hover:bg-blue-600 transition-colors"
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
                          <span className="text-white">{track.bpm} BPM</span>
                          <span className="text-white">→ 128 BPM</span>
                          {!isAtTargetBPM && (
                            <span className="text-xs text-white">({playbackRate}x rate)</span>
                          )}
                        </div>
                        <span className="text-white">Key: {track.key}</span>
                      </div>

                      {/* Auto-sync indicator */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-xs text-white">
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
                      className="flex-1 px-3 py-2 border border-blue-500/30 rounded-lg text-white hover:bg-blue-600/30 transition-all text-sm font-medium bg-transparent"
                    >
                      Load to A
                    </motion.button>
                    <motion.button
                      onClick={() => handleLoadTrack(track, 'B')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-3 py-2 border border-blue-500/30 rounded-lg text-white hover:bg-blue-600/30 transition-all text-sm font-medium bg-transparent"
                    >
                      Load to B
                    </motion.button>
                  </div>

                  {previewTrack === track.id && (
                    <div className="mt-2 text-xs text-white text-center animate-pulse">
                      🎵 Preview playing...
                    </div>
                  )}
                </motion.div>
              );
            })}
          </>
        )}

        {/* Uploaded Tracks Section */}
        {uploadedTracks.length > 0 && (
          <>
            <div className="text-xs text-white font-semibold mb-2 flex items-center gap-2 mt-4">
              <File className="w-3 h-3" />
              Your Uploads ({uploadedTracks.length})
            </div>
            {uploadedTracks.map((track, index) => {
              const playbackRate = (128 / track.bpm).toFixed(3);
              const isAtTargetBPM = track.bpm === 128;

              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-black/50 rounded-lg p-4 border border-blue-500/20 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white group-hover:text-white transition-colors">
                          {track.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 border border-blue-500/30 text-white rounded-full">
                            {track.duration}
                          </span>
                          <button
                            onClick={() => handlePreview(track)}
                            className="p-1 rounded-full bg-gray-700 hover:bg-blue-600 transition-colors"
                          >
                            {previewTrack === track.id ? (
                              <Pause className="w-3 h-3 text-white" />
                            ) : (
                              <Play className="w-3 h-3 text-white" />
                            )}
                          </button>
                          <button
                            onClick={() => handleRemoveTrack(track.id)}
                            className="p-1 rounded-full bg-gray-700 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-white">{track.bpm} BPM</span>
                          <span className="text-white">→ 128 BPM</span>
                          {!isAtTargetBPM && (
                            <span className="text-xs text-white">({playbackRate}x rate)</span>
                          )}
                        </div>
                        <span className="text-white">Key: {track.key}</span>
                      </div>

                      {/* Auto-sync indicator */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-xs text-white">
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
                      className="flex-1 px-3 py-2 border border-blue-500/30 rounded-lg text-white hover:bg-blue-600/30 transition-all text-sm font-medium bg-transparent"
                    >
                      Load to A
                    </motion.button>
                    <motion.button
                      onClick={() => handleLoadTrack(track, 'B')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-3 py-2 border border-blue-500/30 rounded-lg text-white hover:bg-blue-600/30 transition-all text-sm font-medium bg-transparent"
                    >
                      Load to B
                    </motion.button>
                  </div>

                  {previewTrack === track.id && (
                    <div className="mt-2 text-xs text-white text-center animate-pulse">
                      🎵 Preview playing...
                    </div>
                  )}
                </motion.div>
              );
            })}
          </>
        )}
      </div>

      <div className="mt-4 text-xs text-white text-center space-y-1">
        <div>{allTracks.length} tracks available • Click play icon to preview</div>
        <div className="text-white">🎯 All tracks auto-sync to 128 BPM for perfect mixing</div>
        {uploadedTracks.length > 0 && (
          <div className="text-white">📁 {uploadedTracks.length} uploaded tracks</div>
        )}
      </div>
    </div>
  );
};

export default TrackLibrary;