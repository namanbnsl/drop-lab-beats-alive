import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CDJDeck from '../components/DJ/CDJDeck';
import MixerPanel from '../components/DJ/MixerPanel';
import TrackLibrary from '../components/DJ/TrackLibrary';
import FirstTimeOverlay from '../components/DJ/FirstTimeOverlay';
import { Disc3, Music2, Headphones } from 'lucide-react';
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
    <div className="min-h-screen dark-paper text-white handwritten overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-900/30">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors card-fun px-3 py-2 handwritten-bold"
        >
          <Disc3 className="w-8 h-8" />
          <span className="text-xl font-bold highlight-pink">DropLab</span>
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold handwritten-title">
          <span className="highlight-cyan">DJ Mode</span> - <span className="highlight-yellow">Auto-Sync</span>
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            className={`px-3 sm:px-4 py-2 rounded-lg border transition-all duration-300 handwritten-bold min-touch-target ${
              showLibrary 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400 text-white glow-purple' 
                : 'border-purple-500/30 hover:border-purple-500 text-purple-400 card-fun'
            }`}
          >
            <Music2 className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline">Library</span>
          </button>
        </div>
      </div>

      {/* Main DJ Layout */}
      <div className="flex-1 p-2 sm:p-4">
        {/* Decks and Mixer Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <motion.div
            initial={{ opacity: 0, x: -50, rotate: -2 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CDJDeck side="A" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <MixerPanel />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <CDJDeck side="B" />
          </motion.div>
        </div>

        {/* Track Library */}
        <AnimatePresence>
          {showLibrary && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
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

      {/* Fun floating elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 text-pink-400 opacity-20"
          animate={{ rotate: 360, y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        >
          <Headphones className="w-8 h-8" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-20 text-cyan-400 opacity-20"
          animate={{ rotate: -360, y: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <Music2 className="w-10 h-10" />
        </motion.div>
      </div>
    </div>
  );
};

export default DJ;