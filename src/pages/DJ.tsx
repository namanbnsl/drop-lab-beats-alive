import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CDJDeck from '../components/DJ/CDJDeck';
import MixerPanel from '../components/DJ/MixerPanel';
import TrackLibrary from '../components/DJ/TrackLibrary';
import FirstTimeOverlay from '../components/DJ/FirstTimeOverlay';
import { Disc3, ArrowLeft, Zap, AlertCircle, Sparkles, X } from 'lucide-react';
import { useDJStore } from '../stores/djStore';

const DJ = () => {
  const navigate = useNavigate();
  const [showLibrary, setShowLibrary] = useState(false);
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
    <div className="min-h-screen bg-black text-white font-handwritten overflow-hidden relative grid-bg">
      {/* Scattered decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="scattered-icon top-10 left-10">🎵</div>
        <div className="scattered-icon top-20 right-20">🎶</div>
        <div className="scattered-icon bottom-20 left-20">🎸</div>
        <div className="scattered-icon bottom-10 right-10">🎹</div>
        <div className="scattered-icon top-1/2 left-5">🎤</div>
        <div className="scattered-icon top-1/3 right-5">🎧</div>
        <div className="scattered-icon top-3/4 left-1/4">💿</div>
        <div className="scattered-icon bottom-1/3 right-1/4">🎚️</div>
      </div>

      {/* Hand-drawn background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <svg className="absolute inset-0 w-full h-full">
          <g className="animate-pulse">
            <path
              d="M100,100 Q120,80 140,100 Q160,120 180,100"
              stroke="#10b981"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="200" cy="110" r="6" fill="#f59e0b" />
            <path
              d="M300,200 Q320,180 340,200 Q360,220 380,200"
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {/* Header */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate('/')}
          className="btn-fun-secondary flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white transition-all duration-300 animate-scale-in btn-glow btn-glow-blue"
        >
          <Disc3 className="w-6 h-6 animate-bounce-gentle" />
          <span className="font-display font-bold text-lg text-white">DropLab</span>
          <Sparkles className="w-4 h-4 animate-pulse-glow" />
        </button>
      </div>

      {/* Audio Status Notifications */}
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

      {/* Library Toggle Button */}
      <div className="absolute top-4 right-4 z-50 animate-slide-in-up">
        <button
          onClick={() => setShowLibrary(true)}
          className={`btn-fun-secondary px-4 py-3 rounded-xl font-display font-semibold transition-all duration-300 touch-manipulation btn-glow text-white shadow-lg scale-105 btn-glow-blue`}
        >
          <span className="mr-2 text-lg">📚</span>
          <span className="hidden sm:inline">Library</span>
        </button>
      </div>

      {/* Main DJ Layout */}
      <div className="pt-32 pb-8 px-4 min-h-0 flex flex-col justify-start">
        <div className="max-w-7xl mx-auto w-full">
          {/* Decks and Mixer Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 animate-scale-in">
            <CDJDeck side="A" />
            <MixerPanel />
            <CDJDeck side="B" />
          </div>
        </div>
      </div>

      {/* Track Library Popup Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowLibrary(false)} />
          {/* Modal Content */}
          <div className="relative z-10 max-w-3xl w-full mx-auto">
            <div className="absolute top-4 right-4">
              <button onClick={() => setShowLibrary(false)} className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <TrackLibrary />
          </div>
        </div>
      )}

      {/* First Time Overlay */}
      <FirstTimeOverlay
        isOpen={showFirstTime}
        onClose={handleFirstTimeClose}
      />
    </div>
  );
};

export default DJ;