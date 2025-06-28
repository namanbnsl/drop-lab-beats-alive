
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Music, X, Link } from 'lucide-react';
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
  const [googleDriveLink, setGoogleDriveLink] = useState('');
  const { loadTrack } = useDJStore();

  // Pre-loaded Google Drive demo tracks
  const demoTracks = [
    {
      id: 'demo1',
      name: 'House Track 1',
      url: 'https://drive.google.com/uc?export=download&id=1YourFileId1'
    },
    {
      id: 'demo2',
      name: 'Tech House Mix',
      url: 'https://drive.google.com/uc?export=download&id=1YourFileId2'
    },
    {
      id: 'demo3',
      name: 'Deep House Vibe',
      url: 'https://drive.google.com/uc?export=download&id=1YourFileId3'
    }
  ];

  useEffect(() => {
    // Initialize with demo tracks
    setTracks(demoTracks);
  }, []);

  const convertGoogleDriveLink = (driveLink: string) => {
    const match = driveLink.match(/\/d\/(.*?)\//);
    if (!match) return null;
    const fileId = match[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  };

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

  const handleGoogleDriveAdd = () => {
    if (!googleDriveLink.trim()) return;

    const directUrl = convertGoogleDriveLink(googleDriveLink);
    if (!directUrl) {
      alert('Invalid Google Drive link format');
      return;
    }

    const trackName = `Google Drive Track ${tracks.length + 1}`;
    const newTrack: Track = {
      id: Date.now().toString(),
      name: trackName,
      url: directUrl,
    };

    setTracks(prev => [...prev, newTrack]);
    setGoogleDriveLink('');
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
        className={`fixed top-4 right-4 z-50 p-3 rounded-full transition-all ${isOpen
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
        className="fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-purple-500/30 z-40 p-6 overflow-y-auto"
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

        {/* Google Drive Section */}
        <div className="mb-6 space-y-3">
          <div className="text-sm text-purple-400 font-semibold">Google Drive Link</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={googleDriveLink}
              onChange={(e) => setGoogleDriveLink(e.target.value)}
              placeholder="Paste Google Drive share link..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-purple-500/30 rounded text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={handleGoogleDriveAdd}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
            >
              <Link className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-gray-400">
            Demo tracks are pre-loaded from the DropLab collection
          </div>
        </div>

        {/* Track List */}
        <div className="space-y-3">
          {tracks.map((track) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black rounded-lg p-4 border border-purple-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white truncate">{track.name}</h4>
                {!track.id.startsWith('demo') && (
                  <button
                    onClick={() => removeTrack(track.id)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
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
