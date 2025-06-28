import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Disc3 } from 'lucide-react';
import LyriaProductionStudio from '../components/Producer/LyriaProductionStudio';

const Producer = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for the production studio
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/25"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Disc3 className="w-12 h-12 text-white" />
          </motion.div>
          <motion.p
            className="text-white text-lg font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Initializing Lyria AI Studio...
          </motion.p>
          <motion.p
            className="text-purple-400 text-sm mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Connecting to AI music generation engine
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
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
          Producer Mode
        </h1>
        <div className="w-32" /> {/* Spacer for centering */}
      </div>

      {/* Main Production Studio */}
      <LyriaProductionStudio />
    </div>
  );
};

export default Producer;