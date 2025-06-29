import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CDJDeck from '../components/DJ/CDJDeck';
import MixerPanel from '../components/DJ/MixerPanel';
import TrackLibrary from '../components/DJ/TrackLibrary';
import FirstTimeOverlay from '../components/DJ/FirstTimeOverlay';
import { Disc3, Activity, Volume2 } from 'lucide-react';
import { useDJStore } from '../stores/djStore';

const DJ = () => {
  const navigate = useNavigate();
  const [showLibrary, setShowLibrary] = useState(true);
  const [showFirstTime, setShowFirstTime] = useState(false);
  
  const { 
    cleanup, 
    isTransportRunning, 
    masterGridPosition, 
    metronomeClickEnabled, 
    toggleMetronomeClick 
  } = useDJStore();

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
      <div className="flex items-center justify-between p-4 border-b border-purple-900/30">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <Disc3 className="w-8 h-8" />
          <span className="text-xl font-bold">DropLab</span>
        </button>
        
        {/* Enhanced Header with Backend Metronome Status */}
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            DJ Mode - Auto-Sync
          </h1>
          {isTransportRunning && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>Backend Metronome @ 128 BPM</span>
              </div>
              <div className="text-blue-400 text-sm font-mono">
                Bar {masterGridPosition.bar}, Beat {masterGridPosition.beat}
              </div>
              <button
                onClick={toggleMetronomeClick}
                className={`p-1 rounded transition-colors ${
                  metronomeClickEnabled 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                title={`${metronomeClickEnabled ? 'Disable' : 'Enable'} metronome click`}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            className={`px-4 py-2 rounded-lg border transition-all ${
              showLibrary 
                ? 'bg-purple-600 border-purple-400 text-white' 
                : 'border-purple-500/30 hover:border-purple-500 text-purple-400'
            }`}
          >
            Library
          </button>
        </div>
      </div>

      {/* Backend Metronome Status Bar */}
      {isTransportRunning && (
        <div className="bg-gray-900/50 border-b border-green-500/30 px-4 py-2">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400">Backend Metronome Active</span>
            </div>
            <div className="text-gray-400">|</div>
            <div className="text-blue-400 font-mono">
              128 BPM • Bar {masterGridPosition.bar} • Beat {masterGridPosition.beat}
            </div>
            <div className="text-gray-400">|</div>
            <div className="text-purple-400">
              All tracks auto-sync to this grid
            </div>
            <div className="text-gray-400">|</div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">Click:</span>
              <button
                onClick={toggleMetronomeClick}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  metronomeClickEnabled 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                {metronomeClickEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
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