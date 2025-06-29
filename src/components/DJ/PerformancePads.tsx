import React from 'react';
import { motion } from 'framer-motion';

interface PerformancePadsProps {
  side: 'A' | 'B';
}

const PerformancePads = ({ side }: PerformancePadsProps) => {
  const pads = [1, 2, 3, 4, 5, 6];

  const handlePadPress = (padNumber: number) => {
    console.log(`Cue pad ${padNumber} pressed on Deck ${side}`);
    // Placeholder for cue/loop functionality
  };

  return (
    <div className="bg-gray-900/50 rounded-lg p-3 border border-blue-500/20">
      <div className="text-xs text-white font-semibold mb-3 text-center">CUE PADS</div>
      <div className="grid grid-cols-2 gap-2">
        {pads.map((pad) => (
          <motion.button
            key={pad}
            onClick={() => handlePadPress(pad)}
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(102, 126, 234, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 bg-gray-800 border-2 border-blue-500/30 hover:border-blue-500 hover:bg-blue-600/20 transition-all flex items-center justify-center text-white hover:text-white rounded-lg shadow-lg"
          >
            <span className="text-sm font-semibold">{pad}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default PerformancePads;