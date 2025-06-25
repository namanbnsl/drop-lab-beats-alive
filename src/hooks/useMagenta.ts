
import { useState, useEffect, useRef } from 'react';

// Import Magenta.js when available
let mm: any = null;
if (typeof window !== 'undefined') {
  import('@magenta/music').then((magenta) => {
    mm = magenta;
    console.log('Magenta.js loaded successfully:', mm);
  }).catch(console.error);
}

export const useMagenta = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedSequence, setGeneratedSequence] = useState<any>(null);
  const playerRef = useRef<any>(null);
  const modelRef = useRef<any>(null);

  useEffect(() => {
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

  const generateMelody = async (temperature: number, stepsPerQuarter: number) => {
    if (!mm) {
      console.error('Magenta.js not loaded');
      return null;
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
          generatedMelody = await modelRef.current.continueSequence(seedSequence, 16, temperature);
          console.log('Generated melody using Magenta model:', generatedMelody);
        } catch (modelError) {
          console.warn('Model generation failed, using fallback:', modelError);
          generatedMelody = createFallbackMelody(temperature, stepsPerQuarter);
        }
      } else {
        console.log('Using fallback melody generation...');
        generatedMelody = createFallbackMelody(temperature, stepsPerQuarter);
      }

      setGeneratedSequence(generatedMelody);
      console.log('Melody generation completed successfully');
      return generatedMelody;
      
    } catch (error) {
      console.error('Error generating melody:', error);
      return null;
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
        console.log('Playing melody...');
        await playerRef.current.start(generatedSequence);
        setIsPlaying(true);
        
        setTimeout(() => {
          setIsPlaying(false);
        }, (generatedSequence.totalQuantizedSteps / 4) * 1000);
      } catch (error) {
        console.error('Error playing melody:', error);
        setIsPlaying(false);
      }
    }
  };

  return {
    isInitializing,
    isLoading,
    isPlaying,
    generatedSequence,
    generateMelody,
    playMelody,
    hasModel: !!modelRef.current
  };
};

const createFallbackMelody = (temperature: number, stepsPerQuarter: number) => {
  console.log('Creating fallback melody...');
  
  const generatedMelody = {
    notes: [],
    quantizationInfo: { stepsPerQuarter },
    totalQuantizedSteps: 32,
  };

  const scales = {
    major: [60, 62, 64, 65, 67, 69, 71, 72],
    minor: [60, 62, 63, 65, 67, 68, 70, 72],
    pentatonic: [60, 62, 64, 67, 69, 72],
  };
  
  const selectedScale = Math.random() < 0.6 ? scales.major : 
                       Math.random() < 0.8 ? scales.minor : scales.pentatonic;
  
  const noteCount = Math.floor(12 + (temperature * 8));
  const rhythmVariation = temperature > 1.0 ? 0.5 : 0.2;
  
  for (let i = 0; i < noteCount; i++) {
    const pitch = selectedScale[Math.floor(Math.random() * selectedScale.length)];
    const duration = Math.random() < rhythmVariation ? 2 : 1;
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
