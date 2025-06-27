import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Home, Volume2, Play, Pause, Download, Send } from 'lucide-react';
import * as mm from '@magenta/music';
import ProducerNavbar from '../components/Producer/ProducerNavbar';
import WelcomeSection from '../components/Producer/WelcomeSection';
import MelodySection from '../components/Producer/MelodySection';
import DrumSection from '../components/Producer/DrumSection';
import GridSection from '../components/Producer/GridSection';
import FXSection from '../components/Producer/FXSection';
import MixerSection from '../components/Producer/MixerSection';
import ExportSection from '../components/Producer/ExportSection';

const Producer = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('welcome');
  
  // Magenta: Model references for AI music generation
  const melodyRNNRef = useRef<mm.MusicRNN>();
  const drumsRNNRef = useRef<mm.MusicRNN>();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  
  // Generated sequences storage
  const [melodySequence, setMelodySequence] = useState<mm.INoteSequence | null>(null);
  const [drumSequence, setDrumSequence] = useState<mm.INoteSequence | null>(null);

  // Magenta: Initialize AI models on component mount
  useEffect(() => {
    const initializeModels = async () => {
      try {
        console.log('🎵 Initializing Magenta AI models...');
        
        // Initialize MelodyRNN for melody generation
        melodyRNNRef.current = new mm.MusicRNN(
          'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn'
        );
        await melodyRNNRef.current.initialize();
        console.log('✅ MelodyRNN loaded successfully');

        // Initialize DrumsRNN for drum pattern generation
        drumsRNNRef.current = new mm.MusicRNN(
          'https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/drum_kit_rnn'
        );
        await drumsRNNRef.current.initialize();
        console.log('✅ DrumsRNN loaded successfully');

        setModelsLoaded(true);
        setIsLoadingModels(false);
        console.log('🚀 All Magenta models ready for music generation!');
      } catch (error) {
        console.error('❌ Error loading Magenta models:', error);
        setIsLoadingModels(false);
      }
    };

    initializeModels();
  }, []);

  // Magenta: Generate Melody using MelodyRNN
  const generateMelody = async (key: string, style: string, length: number) => {
    if (!melodyRNNRef.current || !modelsLoaded) {
      console.warn('⚠️ MelodyRNN not ready yet');
      return null;
    }

    try {
      console.log(`🎼 Generating melody in ${key} (${style}, ${length} bars)...`);
      
      // Create seed sequence for melody generation
      const seed: mm.INoteSequence = {
        notes: [],
        totalTime: 0,
        quantizationInfo: { stepsPerQuarter: 4 }
      };

      // Generate melody with specified parameters
      const steps = length * 16; // 16 steps per bar
      const temperature = style === 'Simple' ? 0.8 : style === 'Complex' ? 1.2 : 1.0;
      
      const result = await melodyRNNRef.current.continueSequence(seed, steps, temperature);
      
      console.log('✅ Melody generated successfully:', result);
      setMelodySequence(result);
      
      return result;
    } catch (error) {
      console.error('❌ Error generating melody:', error);
      return null;
    }
  };

  // Magenta: Generate Drum Beat using DrumsRNN
  const generateDrums = async (style: string, complexity: string) => {
    if (!drumsRNNRef.current || !modelsLoaded) {
      console.warn('⚠️ DrumsRNN not ready yet');
      return null;
    }

    try {
      console.log(`🥁 Generating ${style} drums (${complexity})...`);
      
      // Create seed sequence for drum generation
      const seed: mm.INoteSequence = {
        notes: [],
        totalTime: 0,
        quantizationInfo: { stepsPerQuarter: 4 }
      };

      // Generate drums with specified parameters
      const steps = 32; // 2 bars of drums
      const temperature = complexity === 'Simple' ? 0.9 : complexity === 'Swing' ? 1.1 : 1.3;
      
      const result = await drumsRNNRef.current.continueSequence(seed, steps, temperature);
      
      console.log('✅ Drum pattern generated successfully:', result);
      setDrumSequence(result);
      
      return result;
    } catch (error) {
      console.error('❌ Error generating drums:', error);
      return null;
    }
  };

  // Magenta: Play generated NoteSequence with mm.Player
  const playSequence = async (sequence: mm.INoteSequence | null) => {
    if (!sequence) {
      console.warn('⚠️ No sequence to play');
      return;
    }

    try {
      console.log('▶️ Playing generated sequence...');
      const player = new mm.Player();
      await player.start(sequence);
      console.log('✅ Playback started');
    } catch (error) {
      console.error('❌ Error playing sequence:', error);
    }
  };

  // Export sequences to MIDI
  const exportToMidi = (sequence: mm.INoteSequence | null, filename: string) => {
    if (!sequence) {
      console.warn('⚠️ No sequence to export');
      return;
    }

    try {
      // Magenta: Convert NoteSequence to MIDI
      const midi = mm.sequenceProtoToMidi(sequence);
      const blob = new Blob([midi], { type: 'audio/midi' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.mid`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`✅ Exported ${filename}.mid`);
    } catch (error) {
      console.error('❌ Error exporting MIDI:', error);
    }
  };

  // Scroll spy effect to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['welcome', 'melody', 'drums', 'grid', 'fx', 'mixer', 'export'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-['Poppins'] overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-purple-800/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(162,89,255,0.03)_0%,transparent_50%)]" />
      </div>

      {/* Navigation */}
      <ProducerNavbar activeSection={activeSection} onNavigateHome={() => navigate('/')} />

      {/* AI Models Loading Indicator */}
      {isLoadingModels && (
        <motion.div
          className="fixed top-4 right-4 z-50 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Loading AI models...</span>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="relative z-10">
        <WelcomeSection />
        <MelodySection 
          onGenerateMelody={generateMelody}
          onPlayMelody={() => playSequence(melodySequence)}
          melodySequence={melodySequence}
          modelsLoaded={modelsLoaded}
        />
        <DrumSection 
          onGenerateDrums={generateDrums}
          onPlayDrums={() => playSequence(drumSequence)}
          drumSequence={drumSequence}
          modelsLoaded={modelsLoaded}
        />
        <GridSection />
        <FXSection />
        <MixerSection />
        <ExportSection 
          onExportMelody={() => exportToMidi(melodySequence, 'droplab-melody')}
          onExportDrums={() => exportToMidi(drumSequence, 'droplab-drums')}
          hasGeneratedContent={!!(melodySequence || drumSequence)}
        />
      </main>
    </div>
  );
};

export default Producer;