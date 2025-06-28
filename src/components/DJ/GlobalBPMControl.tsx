import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Target, Zap, RotateCcw } from 'lucide-react';
import { useDJStore } from '../../stores/djStore';

const GlobalBPMControl: React.FC = () => {
  const {
    globalBPM,
    bpmSyncEnabled,
    deckAState,
    deckBState,
    setGlobalBPM,
    toggleBPMSync,
    syncDeckToGlobal,
    resetToOriginalBPMs
  } = useDJStore();

  const [tempBPM, setTempBPM] = useState(globalBPM);

  const handleBPMChange = (value: number) => {
    setTempBPM(value);
    setGlobalBPM(value);
  };

  const handleSyncDeckA = () => {
    if (deckAState.track?.originalBPM) {
      syncDeckToGlobal('A');
    }
  };

  const handleSyncDeckB = () => {
    if (deckBState.track?.originalBPM) {
      syncDeckToGlobal('B');
    }
  };

  const getPlaybackRate = (originalBPM: number) => {
    return globalBPM / originalBPM;
  };

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-purple-500/30">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-purple-400 flex items-center justify-center gap-2">
          <Target className="w-5 h-5" />
          Global BPM Control
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Master tempo for perfect beatmatching
        </p>
      </div>

      {/* Global BPM Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-300">Global BPM</label>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-purple-400">{globalBPM}</span>
            <Activity className={`w-4 h-4 ${bpmSyncEnabled ? 'text-green-400' : 'text-gray-400'}`} />
          </div>
        </div>
        
        <input
          type="range"
          min="110"
          max="140"
          value={tempBPM}
          onChange={(e) => handleBPMChange(Number(e.target.value))}
          className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #a259ff 0%, #a259ff ${((tempBPM - 110) / 30) * 100}%, #374151 ${((tempBPM - 110) / 30) * 100}%, #374151 100%)`
          }}
        />
        
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>110</span>
          <span>125</span>
          <span>140</span>
        </div>
      </div>

      {/* BPM Sync Toggle */}
      <div className="mb-6">
        <button
          onClick={toggleBPMSync}
          className={`w-full p-3 rounded-lg border font-semibold transition-all ${
            bpmSyncEnabled
              ? 'bg-green-600 border-green-400 text-white shadow-lg shadow-green-500/25'
              : 'border-gray-600 text-gray-300 hover:border-purple-500 hover:bg-purple-600/10'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-4 h-4" />
            {bpmSyncEnabled ? 'BPM SYNC ACTIVE' : 'ENABLE BPM SYNC'}
          </div>
        </button>
      </div>

      {/* Deck Status */}
      <div className="space-y-3 mb-6">
        {/* Deck A Status */}
        <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
          <div>
            <div className="text-sm font-semibold text-white">Deck A</div>
            <div className="text-xs text-gray-400">
              {deckAState.track ? (
                <>
                  Original: {deckAState.track.originalBPM} BPM
                  {bpmSyncEnabled && (
                    <span className="ml-2 text-purple-400">
                      → Rate: {getPlaybackRate(deckAState.track.originalBPM).toFixed(3)}x
                    </span>
                  )}
                </>
              ) : (
                'No track loaded'
              )}
            </div>
          </div>
          {deckAState.track && (
            <button
              onClick={handleSyncDeckA}
              disabled={!bpmSyncEnabled}
              className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded text-xs text-purple-400 hover:bg-purple-600/30 transition-all disabled:opacity-50"
            >
              SYNC
            </button>
          )}
        </div>

        {/* Deck B Status */}
        <div className="flex items-center justify-between p-3 bg-black/50 rounded-lg">
          <div>
            <div className="text-sm font-semibold text-white">Deck B</div>
            <div className="text-xs text-gray-400">
              {deckBState.track ? (
                <>
                  Original: {deckBState.track.originalBPM} BPM
                  {bpmSyncEnabled && (
                    <span className="ml-2 text-purple-400">
                      → Rate: {getPlaybackRate(deckBState.track.originalBPM).toFixed(3)}x
                    </span>
                  )}
                </>
              ) : (
                'No track loaded'
              )}
            </div>
          </div>
          {deckBState.track && (
            <button
              onClick={handleSyncDeckB}
              disabled={!bpmSyncEnabled}
              className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded text-xs text-purple-400 hover:bg-purple-600/30 transition-all disabled:opacity-50"
            >
              SYNC
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button
          onClick={resetToOriginalBPMs}
          className="flex-1 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          <div className="flex items-center justify-center gap-1">
            <RotateCcw className="w-3 h-3" />
            Reset
          </div>
        </button>
        
        <button
          onClick={() => handleBPMChange(128)}
          className="flex-1 px-3 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-all text-sm"
        >
          128 BPM
        </button>
      </div>

      {/* Status Indicator */}
      {bpmSyncEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-green-600/20 border border-green-500/30 rounded-lg text-center"
        >
          <div className="text-sm text-green-400 font-semibold">
            🎯 Perfect Sync Active
          </div>
          <div className="text-xs text-gray-400 mt-1">
            All tracks playing at {globalBPM} BPM
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GlobalBPMControl;