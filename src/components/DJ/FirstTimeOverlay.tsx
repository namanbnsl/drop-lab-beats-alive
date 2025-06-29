import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface FirstTimeOverlayProps {
  isOpen: boolean;
  onClose: (dontShowAgain: boolean) => void;
}

const FirstTimeOverlay: React.FC<FirstTimeOverlayProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [userName, setUserName] = useState('');

  const steps = [
    {
      title: "Welcome to DJ Mode! 🎧",
      content: "You're now in a professional DJ setup. Let's learn the basics in 4 quick steps.",
      highlight: null
    },
    {
      title: "Step 1: Load a Track",
      content: "Click 'Library' in the top-right, then choose a track and load it to Deck A.",
      highlight: "library"
    },
    {
      title: "Step 2: Hit Play",
      content: "Press the play button on Deck A. Watch the platter spin and the track start playing!",
      highlight: "deck-a"
    },
    {
      title: "Step 3: Mix with Crossfader",
      content: "Load another track to Deck B, then use the crossfader in the mixer to blend between them.",
      highlight: "mixer"
    },
    {
      title: "Step 4: Add Some FX",
      content: "Click 'FX' to open the effects panel. Try the filter, reverb, or delay to spice up your mix!",
      highlight: "fx"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose(dontShowAgain);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    onClose(dontShowAgain);
  };

  const handleComplete = () => {
    // Implementation of handleComplete function
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-transparent rounded-xl border border-blue-500/30 p-6 max-w-md w-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold text-white">
                    {steps[currentStep].title}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 text-white hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-white leading-relaxed">
                  {steps[currentStep].content}
                </p>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full flex-1 transition-colors ${index <= currentStep ? 'bg-blue-500' : 'bg-white/20'
                        }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-white text-center mt-2">
                  {currentStep + 1} of {steps.length}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-white hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="flex items-center gap-3">
                  {currentStep === steps.length - 1 && (
                    <label className="flex items-center gap-2 text-sm text-white">
                      <input
                        type="checkbox"
                        checked={dontShowAgain}
                        onChange={(e) => setDontShowAgain(e.target.checked)}
                        className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                      Don't show again
                    </label>
                  )}

                  <motion.button
                    onClick={handleNext}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                    {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>

              {/* Additional content */}
              <div className="mt-6">
                {/* Add any additional content here */}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FirstTimeOverlay;
