
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, CircleStop, Settings, Zap } from 'lucide-react';

// Import Magenta.js when available
let mm: any = null;
if (typeof window !== 'undefined') {
  import('@magenta/music').then((magenta) => {
    mm = magenta;
    console.log('Magenta.js loaded successfully:', mm);
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
  const [isInitializing, setIsInitializing] = useState(true);
  const playerRef = useRef<any>(null);
  const modelRef = useRef<any>(null);
  const [generatedSequence, setGeneratedSequence] = useState<any>(null);

  useEffect(() => {
    // Initialize Magenta player and model when component mounts
    const initializeMagenta = async () => {
      if (mm && !playerRef.current) {
        try {
          console.log('Initializing Magenta player...');
          
          // Initialize SoundFont player
          playerRef.current = new mm.SoundFontPlayer(
            'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus'
          );
          
          await playerRef.current.loadSamples({
            notes: [60, 62, 64, 65, 67, 69, 71, 72] // C major scale
          });
          
          console.log('Magenta player initialized successfully');
          
          // Try to initialize a melody generation model
          try {
            console.log('Loading melody generation model...');
            const modelUrl = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn';
            modelRef.current = new mm.MusicRNN(modelUrl);
            await modelRef.current.initialize();
            console.log('Melody generation model loaded successfully');
          } catch (modelError) {
            console.warn('Could not load melody generation model, using fallback:', modelError);
            modelRef.current = null;
          }
          
        } catch (error) {
          console.error('Failed to initialize Magenta:', error);
        } finally {
          setIsInitializing(false);
        }
      } else if (!mm) {
        // If Magenta isn't loaded yet, try again in a moment
        setTimeout(initializeMagenta, 1000);
      }
    };

    initializeMagenta();

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
      console.log('Starting melody generation...');
      
      // Create a seed sequence for melody generation
      const seedSequence = {
        notes: [
          { pitch: 60, quantizedStartStep: 0, quantizedEndStep: 1, velocity: 80 },
          { pitch: 64, quantizedStartStep: 1, quantizedEndStep: 2, velocity: 80 },
        ],
        quantizationInfo: { stepsPerQuarter },
        totalQuantizedSteps: 32,
      };

      let generatedMelody;

      if (modelRef.current) {
        console.log('Using Magenta model for generation...');
        try {
          // Use the actual Magenta model if available
          generatedMelody = await modelRef.current.continueSequence(seedSequence, 16, temperature);
          console.log('Generated melody using Magenta model:', generatedMelody);
        } catch (modelError) {
          console.warn('Model generation failed, using fallback:', modelError);
          generatedMelody = createFallbackMelody();
        }
      } else {
        console.log('Using fallback melody generation...');
        generatedMelody = createFallbackMelody();
      }

      setGeneratedSequence(generatedMelody);
      onMelodyGenerated?.(generatedMelody);
      console.log('Melody generation completed successfully');
      
    } catch (error) {
      console.error('Error generating melody:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createFallbackMelody = () => {
    console.log('Creating fallback melody...');
    
    const generatedMelody = {
      notes: [],
      quantizationInfo: { stepsPerQuarter },
      totalQuantizedSteps: 32,
    };

    // Generate a more sophisticated pattern based on temperature
    const scales = {
      major: [60, 62, 64, 65, 67, 69, 71, 72], // C major
      minor: [60, 62, 63, 65, 67, 68, 70, 72], // C minor
      pentatonic: [60, 62, 64, 67, 69, 72], // C pentatonic
    };
    
    const selectedScale = Math.random() < 0.6 ? scales.major : 
                         Math.random() < 0.8 ? scales.minor : scales.pentatonic;
    
    // Use temperature to influence melody complexity
    const noteCount = Math.floor(12 + (temperature * 8)); // 12-20 notes based on temperature
    const rhythmVariation = temperature > 1.0 ? 0.5 : 0.2;
    
    for (let i = 0; i < noteCount; i++) {
      const pitch = selectedScale[Math.floor(Math.random() * selectedScale.length)];
      const duration = Math.random() < rhythmVariation ? 2 : 1; // Longer notes with higher temperature
      const velocity = Math.floor(Math.random() * 40) + 60 + (temperature * 10);
      
      generatedMelody.notes.push({
        pitch,
        quantizedStartStep: i,
        quantizedEndStep: i + duration,
        velocity: Math.min(127, velocity),
      });
    }

    return generatedMelody;
  };

  const playMelody = async () => {
    if (!playerRef.current || !generatedSequence) return;

    if (isPlaying) {
      playerRef.current.stop();
      setIsPlaying(false);
    } else {
      try {
        console.log('Playing melody...');
        await playerRef.current.start(generatedSequence);
        setIsPlaying(true);
        
        // Stop playing when sequence ends
        setTimeout(() => {
          setIsPlaying(false);
        }, (generatedSequence.totalQuantizedSteps / stepsPerQuarter) * 1000);
      } catch (error) {
        console.error('Error playing melody:', error);
        setIsPlaying(false);
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={generateMelody}
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
              onClick={playMelody}
              disabled={!generatedSequence || isLoading}
              className="flex items-center justify-center gap-2 bg-black border border-purple-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-500/10 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 disabled:opacity-50"
              whileHover={{ scale: (!generatedSequence || isLoading) ? 1 : 1.02 }}
              whileTap={{ scale: (!generatedSequence || isLoading) ? 1 : 0.98 }}
            >
              {isPlaying ? <CircleStop className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </motion.button>
          </div>

          {/* Generated Melody Info */}
          {generatedSequence && (
            <div className="mt-4 p-3 bg-purple-500/10 rounded-lg">
              <p className="text-sm text-purple-300">
                Generated melody with {generatedSequence.notes?.length || 0} notes
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {modelRef.current ? 'Generated using Magenta AI model' : 'Generated using algorithmic composition'}
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MagentaGenerator;
