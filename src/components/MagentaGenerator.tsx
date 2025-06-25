
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, Stop, Settings, Zap } from 'lucide-react';

// Import Magenta.js when available
let mm: any = null;
if (typeof window !== 'undefined') {
  import('@magenta/music').then((magenta) => {
    mm = magenta;
  }).catch(console.error);
}

interface MagentaGeneratorProps {
  onMelodyGenerated?: (melody: any) => void;
}

const MagentaGenerator: React.FC<MagentaGeneratorProps> = ({ onMelodyGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [temperature, setTemperature] = useState(0.8);
  const [stepsPerQuarter, setStepsPerQuarter] = useState(4);
  const playerRef = useRef<any>(null);
  const [generatedSequence, setGeneratedSequence] = useState<any>(null);

  useEffect(() => {
    // Initialize Magenta player when component mounts
    const initializePlayer = async () => {
      if (mm && !playerRef.current) {
        try {
          playerRef.current = new mm.SoundFontPlayer(
            'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus'
          );
          await playerRef.current.loadSamples({
            notes: [60, 64, 67, 72] // C, E, G, C octave
          });
        } catch (error) {
          console.error('Failed to initialize Magenta player:', error);
        }
      }
    };

    initializePlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.stop();
      }
    };
  }, []);

  const generateMelody = async () => {
    if (!mm) {
      console.error('Magenta.js not loaded');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create a simple seed sequence
      const seedSequence = {
        notes: [
          { pitch: 60, quantizedStartStep: 0, quantizedEndStep: 1 },
          { pitch: 64, quantizedStartStep: 1, quantizedEndStep: 2 },
        ],
        quantizationInfo: { stepsPerQuarter },
        totalQuantizedSteps: 32,
      };

      // For demo purposes, create a simple generated melody
      // In a real implementation, you would use a trained model
      const generatedMelody = {
        notes: [],
        quantizationInfo: { stepsPerQuarter },
        totalQuantizedSteps: 32,
      };

      // Generate a simple pattern
      const notes = [60, 62, 64, 65, 67, 69, 71, 72]; // C major scale
      for (let i = 0; i < 16; i++) {
        const pitch = notes[Math.floor(Math.random() * notes.length)];
        generatedMelody.notes.push({
          pitch,
          quantizedStartStep: i,
          quantizedEndStep: i + 1,
          velocity: Math.floor(Math.random() * 50) + 60,
        });
      }

      setGeneratedSequence(generatedMelody);
      onMelodyGenerated?.(generatedMelody);
      
    } catch (error) {
      console.error('Error generating melody:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playMelody = async () => {
    if (!playerRef.current || !generatedSequence) return;

    if (isPlaying) {
      playerRef.current.stop();
      setIsPlaying(false);
    } else {
      try {
        await playerRef.current.start(generatedSequence);
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing melody:', error);
      }
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
      </div>

      <div className="space-y-4">
        {/* Temperature Control */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Creativity (Temperature): {temperature}
          </label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Steps Per Quarter Control */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Resolution: {stepsPerQuarter} steps/quarter
          </label>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={stepsPerQuarter}
            onChange={(e) => setStepsPerQuarter(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          <motion.button
            onClick={generateMelody}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-black border border-purple-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-500/10 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
            onClick={playMelody}
            disabled={!generatedSequence}
            className="flex items-center justify-center gap-2 bg-black border border-purple-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-500/10 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isPlaying ? <Stop className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Generated Melody Info */}
        {generatedSequence && (
          <div className="mt-4 p-3 bg-purple-500/10 rounded-lg">
            <p className="text-sm text-purple-300">
              Generated melody with {generatedSequence.notes?.length || 0} notes
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MagentaGenerator;
