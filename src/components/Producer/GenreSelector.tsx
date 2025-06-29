import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import * as Tone from 'tone';

interface Genre {
  id: string;
  name: string;
  color: string;
  isActive?: boolean;
  isPlaying?: boolean;
}

interface GenreSelectorProps {
  onGenreSelect: (genre: Genre) => void;
  onPlayGenre: (genre: Genre) => void;
  selectedGenre: string | null;
  playingGenre: string | null;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({
  onGenreSelect,
  onPlayGenre,
  selectedGenre,
  playingGenre
}) => {
  const genres: Genre[] = [
    { id: 'bossa-nova', name: 'Bossa Nova', color: 'bg-gray-400' },
    { id: 'chillwave', name: 'Chillwave', color: 'bg-gray-400' },
    { id: 'drum-and-bass', name: 'Drum and Bass', color: 'bg-gray-400' },
    { id: 'post-punk', name: 'Post Punk', color: 'bg-gray-400' },
    { id: 'shoegaze', name: 'Shoegaze', color: 'bg-yellow-400' },
    { id: 'funk', name: 'Funk', color: 'bg-gray-400' },
    { id: 'chiptune', name: 'Chiptune', color: 'bg-blue-500' },
    { id: 'lush-strings', name: 'Lush Strings', color: 'bg-gray-400' },
    { id: 'sparkling-arpeggios', name: 'Sparkling Arpegg...', color: 'bg-gray-400' },
    { id: 'staccato-rhythms', name: 'Staccato Rhythms', color: 'bg-gray-400' },
    { id: 'punchy-kick', name: 'Punchy Kick', color: 'bg-yellow-400' },
    { id: 'dubstep', name: 'Dubstep', color: 'bg-gray-400' },
    { id: 'k-pop', name: 'K Pop', color: 'bg-gray-400' },
    { id: 'neo-soul', name: 'Neo Soul', color: 'bg-gray-400' },
    { id: 'trip-hop', name: 'Trip Hop', color: 'bg-blue-500' },
    { id: 'thrash', name: 'Thrash', color: 'bg-gray-400' }
  ];

  const handleGenreClick = (genre: Genre) => {
    onGenreSelect(genre);
  };

  const handlePlayClick = (e: React.MouseEvent, genre: Genre) => {
    e.stopPropagation();
    onPlayGenre(genre);
  };

  return (
    <div className="grid grid-cols-4 gap-6 max-w-4xl mx-auto">
      {genres.map((genre, index) => (
        <motion.div
          key={genre.id}
          className="relative flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          {/* Genre Knob */}
          <motion.div
            className={`relative w-20 h-20 rounded-full cursor-pointer transition-all duration-300 ${selectedGenre === genre.id
                ? `${genre.color} shadow-lg shadow-current/50 scale-110`
                : 'bg-gray-600 hover:bg-gray-500'
              }`}
            onClick={() => handleGenreClick(genre)}
            whileHover={{ scale: selectedGenre === genre.id ? 1.15 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Outer Ring */}
            <div className="absolute inset-2 bg-gray-300 rounded-full shadow-inner">
              {/* Inner Circle */}
              <div className="absolute inset-3 bg-white rounded-full shadow-md flex items-center justify-center">
                {/* Center Dot */}
                <div className="w-2 h-2 bg-black rounded-full"></div>
              </div>
            </div>

            {/* Play Button Overlay */}
            {selectedGenre === genre.id && (
              <motion.button
                className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full"
                onClick={(e) => handlePlayClick(e, genre)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
              >
                {playingGenre === genre.id ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-1" />
                )}
              </motion.button>
            )}

            {/* Active Indicator */}
            {playingGenre === genre.id && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-white"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(255,255,255,0.7)',
                    '0 0 0 10px rgba(255,255,255,0)',
                    '0 0 0 0 rgba(255,255,255,0)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>

          {/* Genre Label */}
          <div className="mt-3 text-center">
            <span className="text-sm font-medium text-white bg-black/70 px-2 py-1 rounded">
              {genre.name}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default GenreSelector;