import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CDJDeck from '../components/DJ/CDJDeck';
import MixerPanel from '../components/DJ/MixerPanel';
import TrackLibrary from '../components/DJ/TrackLibrary';
import FirstTimeOverlay from '../components/DJ/FirstTimeOverlay';
import { Disc3, Music2 } from 'lucide-react';
import { useDJStore } from '../stores/djStore';

const DJ = () => {
  const navigate = useNavigate();
  const [showLibrary, setShowLibrary] = useState(true);
  const [showFirstTime, setShowFirstTime] = useState(false);
  
  const { cleanup } = useDJStore();

  useEffect(() => {
    // Check if first time visiting DJ mode
    const hasVisited = localStorage.getItem('dj-visited');
    if (!hasVisited) {
      setShowFirstTime(true);
    }

    // Cleanup audio on unmount
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleFirstTimeClose = (dontShowAgain: boolean) => {
    setShowFirstTime(false);
    if (dontShowAgain) {
      localStorage.setItem('dj-visited', 'true');
    }
  };

  return (
    <div className="min-h-screen paper-bg text-gray-800 overflow-hidden paper-texture">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-gray-800" style={{ borderStyle: 'dashed' }}>
        <button
          onClick={() => navigate('/')}
          className="sketch-card px-3 py-2 flex items-center gap-2 handwritten-text font-semibold"
        >
          <Disc3 className="w-8 h-8" />
          <span className="text-xl">DropLab</span>
        </button>
        <h1 className="handwritten-title text-xl sm:text-2xl md:text-3xl font-bold sketch-underline">
          DJ Mode - Auto-Sync ★
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            className={`px-4 py-2 transition-all duration-200 min-touch-target handwritten-text ${
              showLibrary 
                ? 'btn-sketch-primary' 
                : 'btn-sketch'
            }`}
          >
            <Music2 className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline">Library</span>
          </button>
        </div>
      </div>

      {/* Main DJ Layout */}
      <div className="flex-1 p-4">
        {/* Decks and Mixer Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CDJDeck side="A" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <MixerPanel />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <CDJDeck side="B" />
          </motion.div>
        </div>

        {/* Track Library */}
        <AnimatePresence>
          {showLibrary && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              <TrackLibrary />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* First Time Overlay */}
      <FirstTimeOverlay 
        isOpen={showFirstTime} 
        onClose={handleFirstTimeClose}
      />
    </div>
  );
};

export default DJ;