import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CDJDeck from '../components/DJ/CDJDeck';
import MixerPanel from '../components/DJ/MixerPanel';
import TrackLibrary from '../components/DJ/TrackLibrary';
import FirstTimeOverlay from '../components/DJ/FirstTimeOverlay';
import { Disc3, ArrowLeft, Zap, AlertCircle } from 'lucide-react';
import { useDJStore } from '../stores/djStore';

const DJ = () => {
  const navigate = useNavigate();
  const [showLibrary, setShowLibrary] = useState(true);
  const [showFirstTime, setShowFirstTime] = useState(false);

  const { cleanup, audioUnlocked, audioError } = useDJStore();

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
    <div className="min-h-screen bg-black text-white font-['Poppins'] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-900/30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Home</span>
          </button>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          DropLab DJ
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${showLibrary
                ? 'bg-blue-600 border-blue-400 text-white'
                : 'border-blue-500/30 hover:border-blue-500 text-blue-400'
              }`}
          >
            Library
          </button>
        </div>
      </div>

      {/* Audio Status Indicators */}
      {!audioUnlocked && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 animate-slide-in-up">
          <div className="card-fun-dark p-4 border-2 border-yellow-400/50 max-w-sm">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-yellow-400 animate-pulse-glow" />
              <p className="text-yellow-200 font-display font-semibold">DJ Audio Ready</p>
            </div>
            <p className="text-yellow-200/90 text-sm font-playful">
              🎵 Click anywhere or press any key to unlock the DJ magic!
            </p>
          </div>
        </div>
      )}

      {audioError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 animate-slide-in-up">
          <div className="card-fun-dark p-4 border-2 border-red-400/50 max-w-md">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-200 font-display font-semibold">DJ Audio Error</p>
            </div>
            <p className="text-red-200/90 text-sm font-playful mb-3">{audioError}</p>
          </div>
        </div>
      )}

      {/* Main DJ Layout */}
      <div className="flex-1 p-4">
        {/* Decks and Mixer Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <CDJDeck side="A" />
          <MixerPanel />
          <CDJDeck side="B" />
        </div>

        {/* Track Library */}
        <AnimatePresence>
          {showLibrary && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
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