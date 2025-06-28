
import React from 'react';
import { motion } from 'framer-motion';

interface PerformancePadsProps {
  side: 'A' | 'B';
}

const PerformancePads = ({ side }: PerformancePadsProps) => {
  const pads = [1, 2, 3, 4, 5, 6];

  const handlePadPress = (padNumber: number) => {
    console.log(`Performance pad ${padNumber} pressed on Deck ${side}`);
    // Placeholder for cue/loop functionality
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {pads.map((pad) => (
        <motion.button
          key={pad}
          onClick={() => handlePadPress(pad)}
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(162, 89, 255, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 bg-gray-800 border-2 border-purple-500/30 hover:border-purple-500 hover:bg-purple-600/20 transition-all flex items-center justify-center text-purple-400 hover:text-white rounded-lg shadow-lg"
        >
          <span className="text-sm font-semibold">{pad}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default PerformancePads;
