
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';
import { useMagenta } from '../hooks/useMagenta';
import MagentaControls from './MagentaControls';
import MagentaButtons from './MagentaButtons';
import MagentaInfo from './MagentaInfo';

interface MagentaGeneratorProps {
  onMelodyGenerated?: (melody: any) => void;
}

const MagentaGenerator: React.FC<MagentaGeneratorProps> = ({ onMelodyGenerated }) => {
  const [temperature, setTemperature] = useState(0.8);
  const [stepsPerQuarter, setStepsPerQuarter] = useState(4);
  
  const {
    isInitializing,
    isLoading,
    isPlaying,
    generatedSequence,
    generateMelody,
    playMelody,
    hasModel
  } = useMagenta();

  const handleGenerate = async () => {
    const melody = await generateMelody(temperature, stepsPerQuarter);
    if (melody) {
      onMelodyGenerated?.(melody);
    }
  };

  return (
    <motion.div
      className="bg-black border border-purple-500/30 rounded-xl p-6 hover:border-purple-500 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-500/20 rounded-lg">
          <Music className="w-6 h-6 text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          AI Melody Generator
        </h3>
        {isInitializing && (
          <div className="ml-auto">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isInitializing ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-purple-300">Initializing AI Music Engine...</p>
          <p className="text-sm text-gray-400 mt-2">Loading Magenta.js components</p>
        </div>
      ) : (
        <div className="space-y-4">
          <MagentaControls
            temperature={temperature}
            stepsPerQuarter={stepsPerQuarter}
            onTemperatureChange={setTemperature}
            onStepsPerQuarterChange={setStepsPerQuarter}
            disabled={isLoading}
          />

          <MagentaButtons
            isLoading={isLoading}
            isPlaying={isPlaying}
            hasGeneratedSequence={!!generatedSequence}
            onGenerate={handleGenerate}
            onPlay={playMelody}
          />

          <MagentaInfo 
            generatedSequence={generatedSequence}
            hasModel={hasModel}
          />
        </div>
      )}
    </motion.div>
  );
};

export default MagentaGenerator;
