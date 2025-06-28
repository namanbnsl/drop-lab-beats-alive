import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music, Check } from 'lucide-react';

interface BPMInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bpm: number) => void;
  trackName: string;
  deck: 'A' | 'B';
  suggestedBPM?: number;
}

const BPMInputModal: React.FC<BPMInputModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  trackName,
  deck,
  suggestedBPM = 128
}) => {
  const [selectedBPM, setSelectedBPM] = useState(suggestedBPM);
  const [customBPM, setCustomBPM] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  // Common BPM values for different genres
  const commonBPMs = [
    { bpm: 110, genre: 'Hip Hop' },
    { bpm: 120, genre: 'Pop' },
    { bpm: 124, genre: 'House' },
    { bpm: 126, genre: 'Tech House' },
    { bpm: 128, genre: 'House/Techno' },
    { bpm: 130, genre: 'Techno' },
    { bpm: 132, genre: 'Hard Techno' },
    { bpm: 140, genre: 'Trance' },
    { bpm: 174, genre: 'Drum & Bass' }
  ];

  const handleConfirm = () => {
    const finalBPM = useCustom ? parseInt(customBPM) : selectedBPM;
    if (finalBPM >= 60 && finalBPM <= 200) {
      onConfirm(finalBPM);
      onClose();
    }
  };

  const handleCustomBPMChange = (value: string) => {
    setCustomBPM(value);
    const numValue = parseInt(value);
    if (numValue >= 60 && numValue <= 200) {
      setSelectedBPM(numValue);
    }
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
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-900 rounded-xl border border-purple-500/30 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <Music className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Set Track BPM</h3>
                    <p className="text-sm text-gray-400">Deck {deck}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Track Info */}
              <div className="mb-6 p-4 bg-black/50 rounded-lg">
                <p className="text-white font-medium truncate">{trackName}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Select the original BPM of this track for perfect sync
                </p>
              </div>

              {/* BPM Selection */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-purple-400 mb-3">Common BPMs</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {commonBPMs.map(({ bpm, genre }) => (
                      <button
                        key={bpm}
                        onClick={() => {
                          setSelectedBPM(bpm);
                          setUseCustom(false);
                        }}
                        className={`p-3 rounded-lg border transition-all text-left ${
                          selectedBPM === bpm && !useCustom
                            ? 'bg-purple-600 border-purple-400 text-white'
                            : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-purple-500'
                        }`}
                      >
                        <div className="font-semibold">{bpm} BPM</div>
                        <div className="text-xs opacity-75">{genre}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom BPM Input */}
                <div>
                  <h4 className="text-sm font-semibold text-purple-400 mb-3">Custom BPM</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="60"
                      max="200"
                      value={customBPM}
                      onChange={(e) => {
                        handleCustomBPMChange(e.target.value);
                        setUseCustom(true);
                      }}
                      onFocus={() => setUseCustom(true)}
                      placeholder="Enter BPM (60-200)"
                      className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      onClick={() => setUseCustom(true)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        useCustom
                          ? 'bg-purple-600 border-purple-400 text-white'
                          : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-purple-500'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Selected BPM Display */}
                <div className="p-4 bg-purple-600/20 border border-purple-500/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {useCustom ? customBPM || '---' : selectedBPM} BPM
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Selected for Deck {deck}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={useCustom && (!customBPM || parseInt(customBPM) < 60 || parseInt(customBPM) > 200)}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm BPM
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BPMInputModal;