import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CDJDeck from '../components/DJ/CDJDeck';
import MixerPanel from '../components/DJ/MixerPanel';
import TrackLibrary from '../components/DJ/TrackLibrary';
import FirstTimeOverlay from '../components/DJ/FirstTimeOverlay';
import BPMInputModal from '../components/DJ/BPMInputModal';
import GlobalBPMControl from '../components/DJ/GlobalBPMControl';
import { Disc3, Target } from 'lucide-react';
import { useDJStore } from '../stores/djStore';

const DJ = () => {
  const navigate = useNavigate();
  const [showLibrary, setShowLibrary] = useState(true);
  const [showFirstTime, setShowFirstTime] = useState(false);
  const [showGlobalBPM, setShowGlobalBPM] = useState(true);
  
  const { 
    cleanup, 
    showBPMModal, 
    pendingTrack, 
    setShowBPMModal, 
    confirmTrackBPM 
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

  const handleBPMConfirm = (bpm: number) => {
    confirmTrackBPM(bpm);
  };

  const handleBPMModalClose = () => {
    setShowBPMModal(false);
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
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          DJ Mode - Global BPM Sync
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGlobalBPM(!showGlobalBPM)}
            className={`px-4 py-2 rounded-lg border transition-all ${
              showGlobalBPM 
                ? 'bg-green-600 border-green-400 text-white' 
                : 'border-purple-500/30 hover:border-purple-500 text-purple-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              BPM
            </div>
          </button>
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

      {/* Main DJ Layout */}
      <div className="flex-1 p-4">
        {/* Global BPM Control */}
        <AnimatePresence>
          {showGlobalBPM && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              className="mb-6 max-w-md mx-auto"
            >
              <GlobalBPMControl />
            </motion.div>
          )}
        </AnimatePresence>

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

      {/* BPM Input Modal */}
      <BPMInputModal
        isOpen={showBPMModal}
        onClose={handleBPMModalClose}
        onConfirm={handleBPMConfirm}
        trackName={pendingTrack?.track.name || ''}
        deck={pendingTrack?.deck || 'A'}
        suggestedBPM={pendingTrack?.track.bpm}
      />

      {/* First Time Overlay */}
      <FirstTimeOverlay 
        isOpen={showFirstTime} 
        onClose={handleFirstTimeClose}
      />
    </div>
  );
};

export default DJ;