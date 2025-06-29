import React from 'react';
import { motion } from 'framer-motion';

interface CuePadsProps {
  side: 'A' | 'B';
}

const CuePads = ({ side }: CuePadsProps) => {
  const pads = [1, 2, 3, 4];

  const handlePadPress = (padNumber: number) => {
    console.log(`Cue ${padNumber} pressed on Deck ${side}`);
    // Placeholder for cue functionality
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {pads.map((pad) => (
        <motion.button
          key={pad}
          onClick={() => handlePadPress(pad)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 bg-gray-800 rounded-full border-2 border-blue-500/30 hover:border-blue-500 transition-all flex items-center justify-center text-blue-400 hover:text-white hover:bg-blue-600/20"
        >
          <span className="text-xs font-semibold">{pad}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default CuePads;
