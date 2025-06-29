import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Download, Volume2, VolumeX } from 'lucide-react';
import GenreSelector from './GenreSelector';
import { AudioEngine, AudioPattern } from '../../lib/audioEngine';

interface Genre {
  id: string;
  name: string;
  color: string;
}

const MusicGenerationSection = () => {
  const [selectedGenre, setSelectedGenre] = useState<string | null>('shoegaze');
  const [playingGenre, setPlayingGenre] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<AudioPattern | null>(null);

  const audioEngineRef = useRef<AudioEngine>();
  const currentPartsRef = useRef<any>(null);

  useEffect(() => {
    audioEngineRef.current = new AudioEngine();

    // Auto-select and highlight default genres
    setSelectedGenre('shoegaze');

    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setMasterVolume(isMuted ? 0 : volume / 100);
    }
  }, [volume, isMuted]);

  const handleGenreSelect = (genre: Genre) => {
    setSelectedGenre(genre.id);

    // Generate pattern for the selected genre
    if (audioEngineRef.current) {
      const pattern = audioEngineRef.current.generatePattern(genre.id);
      setCurrentPattern(pattern);
    }
  };

  const handlePlayGenre = async (genre: Genre) => {
    if (!audioEngineRef.current) return;

    if (playingGenre === genre.id && isPlaying) {
      // Stop current playback
      audioEngineRef.current.stop();
      setPlayingGenre(null);
      setIsPlaying(false);
      if (currentPartsRef.current) {
        currentPartsRef.current.notePart?.stop();
        currentPartsRef.current.drumPart?.stop();
        currentPartsRef.current.notePart?.dispose();
        currentPartsRef.current.drumPart?.dispose();
        currentPartsRef.current = null;
      }
    } else {
      // Stop any current playback first
      if (isPlaying) {
        audioEngineRef.current.stop();
        if (currentPartsRef.current) {
          currentPartsRef.current.notePart?.stop();
          currentPartsRef.current.drumPart?.stop();
          currentPartsRef.current.notePart?.dispose();
          currentPartsRef.current.drumPart?.dispose();
        }
      }

      // Generate and play new pattern
      const pattern = audioEngineRef.current.generatePattern(genre.id);
      setCurrentPattern(pattern);

      try {
        const parts = await audioEngineRef.current.playPattern(pattern, genre.id);
        currentPartsRef.current = parts;
        setPlayingGenre(genre.id);
        setIsPlaying(true);
        setSelectedGenre(genre.id);
      } catch (error) {
        console.error('Error playing pattern:', error);
      }
    }
  };

  const handleMasterPlayPause = async () => {
    if (!audioEngineRef.current || !selectedGenre) return;

    if (isPlaying) {
      audioEngineRef.current.stop();
      setIsPlaying(false);
      setPlayingGenre(null);
      if (currentPartsRef.current) {
        currentPartsRef.current.notePart?.stop();
        currentPartsRef.current.drumPart?.stop();
        currentPartsRef.current.notePart?.dispose();
        currentPartsRef.current.drumPart?.dispose();
        currentPartsRef.current = null;
      }
    } else {
      const pattern = audioEngineRef.current.generatePattern(selectedGenre);
      setCurrentPattern(pattern);

      try {
        const parts = await audioEngineRef.current.playPattern(pattern, selectedGenre);
        currentPartsRef.current = parts;
        setIsPlaying(true);
        setPlayingGenre(selectedGenre);
      } catch (error) {
        console.error('Error playing pattern:', error);
      }
    }
  };

  const handleExport = () => {
    if (!currentPattern || !selectedGenre) return;

    // Create a simple JSON export of the current pattern
    const exportData = {
      genre: selectedGenre,
      pattern: currentPattern,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `droplab-${selectedGenre}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="music-generation" className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        className="max-w-6xl mx-auto text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          🎵 Generate Your Sound
        </h2>

        <p className="text-xl text-gray-300 mb-4">
          Select a genre and create original music in real-time
        </p>

        <p className="text-sm text-blue-400 mb-12">
          Powered by advanced audio synthesis and pattern generation
        </p>

        {/* Genre Selector Grid */}
        <div className="mb-12">
          <GenreSelector
            onGenreSelect={handleGenreSelect}
            onPlayGenre={handlePlayGenre}
            selectedGenre={selectedGenre}
            playingGenre={playingGenre}
          />
        </div>

        {/* Master Controls */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {/* Master Play/Pause */}
          <motion.button
            onClick={handleMasterPlayPause}
            disabled={!selectedGenre}
            className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </motion.button>

          {/* Volume Control */}
          <div className="flex items-center gap-4 bg-gray-900/50 rounded-xl p-4 border border-blue-500/30">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />

            <span className="text-sm text-gray-300 w-12">{volume}%</span>
          </div>

          {/* Export Button */}
          <motion.button
            onClick={handleExport}
            disabled={!currentPattern}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 rounded-full font-semibold text-white hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-5 h-5" />
            Export
          </motion.button>
        </motion.div>

        {/* Pattern Info */}
        {selectedGenre && (
          <motion.div
            className="bg-gray-900/50 rounded-xl p-6 border border-blue-500/30 max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold text-blue-400 mb-4">
              Current Pattern: {selectedGenre.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h3>

            {currentPattern && (
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="text-white font-medium mb-2">Melody Notes</h4>
                  <div className="text-gray-400">
                    {currentPattern.notes.length} notes generated
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Drum Pattern</h4>
                  <div className="text-gray-400">
                    {currentPattern.drums.length} drum hits
                  </div>
                </div>
              </div>
            )}

            {isPlaying && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-400 text-sm">Playing...</span>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default MusicGenerationSection;