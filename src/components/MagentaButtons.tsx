
import React from 'react';
import { motion } from 'framer-motion';
import { Play, CircleStop, Zap } from 'lucide-react';

interface MagentaButtonsProps {
  isLoading: boolean;
  isPlaying: boolean;
  hasGeneratedSequence: boolean;
  onGenerate: () => void;
  onPlay: () => void;
}

const MagentaButtons: React.FC<MagentaButtonsProps> = ({
  isLoading,
  isPlaying,
  hasGeneratedSequence,
  onGenerate,
  onPlay
}) => {
  return (
    <div className="flex gap-3">
      <motion.button
        onClick={onGenerate}
        disabled={isLoading}
        className="flex-1 flex items-center justify-center gap-2 bg-black border border-purple-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-500/10 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 disabled:opacity-50"
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Generate
          </>
        )}
      </motion.button>

      <motion.button
        onClick={onPlay}
        disabled={!hasGeneratedSequence || isLoading}
        className="flex items-center justify-center gap-2 bg-black border border-purple-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-500/10 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 disabled:opacity-50"
        whileHover={{ scale: (!hasGeneratedSequence || isLoading) ? 1 : 1.02 }}
        whileTap={{ scale: (!hasGeneratedSequence || isLoading) ? 1 : 0.98 }}
      >
        {isPlaying ? <CircleStop className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </motion.button>
    </div>
  );
};

export default MagentaButtons;
