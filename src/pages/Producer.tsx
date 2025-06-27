import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Home, Volume2, Play, Pause, Download, Send } from 'lucide-react';
import * as mm from '@magenta/music';
import * as Tone from 'tone';
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
  
  // MusicVAE: Model references for AI music generation
  const melodyVAERef = useRef<mm.MusicVAE>();
  const drumVAERef = useRef<mm.MusicVAE>();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  
  // Generated sequences storage
  const [melodySequence, setMelodySequence] = useState<mm.INoteSequence | null>(null);
  const [drumSequence, setDrumSequence] = useState<mm.INoteSequence | null>(null);

  // Tone.js: Audio engine setup
  const melodyGainRef = useRef<Tone.Gain>();
  const drumsGainRef = useRef<Tone.Gain>();
  const fxGainRef = useRef<Tone.Gain>();
  const masterGainRef = useRef<Tone.Gain>();
  const reverbRef = useRef<Tone.Reverb>();
  const delayRef = useRef<Tone.FeedbackDelay>();
  const melodySynthRef = useRef<Tone.Synth>();
  const drumSamplerRef = useRef<Tone.Sampler>();
  const recorderRef = useRef<Tone.Recorder>();

  // Balance knob states
  const [melodyVolume, setMelodyVolume] = useState(100);
  const [drumsVolume, setDrumsVolume] = useState(100);
  const [fxVolume, setFxVolume] = useState(100);
  const [masterVolume, setMasterVolume] = useState(100);

  // FX control states
  const [reverbAmount, setReverbAmount] = useState(0.3);
  const [delayAmount, setDelayAmount] = useState(0.2);

  // Playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // MusicVAE: Initialize AI models on component mount
  useEffect(() => {
    const initializeModels = async () => {
      try {
        console.log('🎵 Initializing MusicVAE models...');
        
        // MusicVAE: Initialize melody model
        melodyVAERef.current = new mm.MusicVAE(
          'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_2bar_small'
        );
        await melodyVAERef.current.initialize();
        console.log('✅ MelodyVAE loaded successfully');

        // MusicVAE: Initialize drum model
        drumVAERef.current = new mm.MusicVAE(
          'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/drums_2bar_hikl_small'
        );
        await drumVAERef.current.initialize();
        console.log('✅ DrumVAE loaded successfully');

        setModelsLoaded(true);
        setIsLoadingModels(false);
        console.log('🚀 All MusicVAE models ready for generation!');
      } catch (error) {
        console.error('❌ Error loading MusicVAE models:', error);
        setIsLoadingModels(false);
      }
    };

    initializeModels();
  }, []);

  // Tone.js: Initialize audio engine
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        console.log('🔊 Initializing Tone.js audio engine...');

        // Tone.js: Create master gain chain
        masterGainRef.current = new Tone.Gain(masterVolume / 100).toDestination();
        
        // Tone.js: Create individual channel gains
        melodyGainRef.current = new Tone.Gain(melodyVolume / 100).connect(masterGainRef.current);
        drumsGainRef.current = new Tone.Gain(drumsVolume / 100).connect(masterGainRef.current);
        fxGainRef.current = new Tone.Gain(fxVolume / 100);

        // FX: Create reverb and delay sends
        reverbRef.current = new Tone.Reverb(2).toDestination();
        delayRef.current = new Tone.FeedbackDelay("8n", 0.4).toDestination();
        
        // Set initial FX amounts
        reverbRef.current.wet.value = reverbAmount;
        delayRef.current.wet.value = delayAmount;

        // Tone.js: Route FX send to parallel processing
        fxGainRef.current.fan(reverbRef.current, delayRef.current, masterGainRef.current);

        // Tone.js: Create instruments
        melodySynthRef.current = new Tone.Synth().connect(melodyGainRef.current);
        drumSamplerRef.current = new Tone.Sampler({
          urls: {
            "C1": "kick.wav",
            "D1": "snare.wav", 
            "F#1": "hihat.wav",
            "A1": "openhat.wav"
          },
          baseUrl: "https://tonejs.github.io/audio/drum-samples/CR78/"
        }).connect(drumsGainRef.current);

        // Recorder setup for audio export
        recorderRef.current = new Tone.Recorder();
        masterGainRef.current.connect(recorderRef.current);

        console.log('✅ Tone.js audio engine initialized');
      } catch (error) {
        console.error('❌ Error initializing audio:', error);
      }
    };

    initializeAudio();

    return () => {
      // Cleanup on unmount
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, []);

  // Tone.js: Update melody volume in real time
  useEffect(() => {
    if (melodyGainRef.current) {
      melodyGainRef.current.gain.rampTo(melodyVolume / 100, 0.1);
    }
  }, [melodyVolume]);

  // Tone.js: Update drums volume in real time
  useEffect(() => {
    if (drumsGainRef.current) {
      drumsGainRef.current.gain.rampTo(drumsVolume / 100, 0.1);
    }
  }, [drumsVolume]);

  // Tone.js: Update FX volume in real time
  useEffect(() => {
    if (fxGainRef.current) {
      fxGainRef.current.gain.rampTo(fxVolume / 100, 0.1);
    }
  }, [fxVolume]);

  // Tone.js: Update master volume in real time
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.rampTo(masterVolume / 100, 0.1);
    }
  }, [masterVolume]);

  // FX: Update reverb amount in real time
  useEffect(() => {
    if (reverbRef.current) {
      reverbRef.current.wet.rampTo(reverbAmount, 0.1);
    }
  }, [reverbAmount]);

  // FX: Update delay amount in real time
  useEffect(() => {
    if (delayRef.current) {
      delayRef.current.wet.rampTo(delayAmount, 0.1);
    }
  }, [delayAmount]);

  // Helper: Convert NoteSequence to Tone.js events
  const convertNoteSequenceToToneEvents = (sequence: mm.INoteSequence | null) => {
    if (!sequence || !sequence.notes) return [];
    
    return sequence.notes.map(note => ({
      time: note.startTime || 0,
      note: Tone.Frequency(note.pitch || 60, "midi").toNote(),
      duration: (note.endTime || 0) - (note.startTime || 0),
      velocity: note.velocity || 0.8
    }));
  };

  // MusicVAE: Generate melody using AI
  const generateMelody = async (key: string, style: string, length: number) => {
    if (!melodyVAERef.current || !modelsLoaded) {
      console.warn('⚠️ MelodyVAE not ready yet');
      return null;
    }

    try {
      console.log(`🎼 Generating AI melody in ${key} (${style}, ${length} bars)...`);
      
      // MusicVAE: Generate melody sequence
      const result = await melodyVAERef.current.sample(1);
      const sequence = result[0];
      
      console.log('✅ Melody generated successfully:', sequence);
      setMelodySequence(sequence);
      
      return sequence;
    } catch (error) {
      console.error('❌ Error generating melody:', error);
      return null;
    }
  };

  // MusicVAE: Generate drums using AI
  const generateDrums = async (style: string, complexity: string) => {
    if (!drumVAERef.current || !modelsLoaded) {
      console.warn('⚠️ DrumVAE not ready yet');
      return null;
    }

    try {
      console.log(`🥁 Generating AI drums (${style}, ${complexity})...`);
      
      // MusicVAE: Generate drum sequence
      const result = await drumVAERef.current.sample(1);
      const sequence = result[0];
      
      console.log('✅ Drum pattern generated successfully:', sequence);
      setDrumSequence(sequence);
      
      return sequence;
    } catch (error) {
      console.error('❌ Error generating drums:', error);
      return null;
    }
  };

  // Tone.js: Play full track with quantization
  const playFullTrack = async () => {
    if (!melodySequence && !drumSequence) {
      console.warn('⚠️ No sequences to play');
      return;
    }

    try {
      await Tone.start();
      
      Tone.Transport.stop();
      Tone.Transport.cancel();

      // Play melody if available
      if (melodySequence && melodySynthRef.current) {
        const melodyEvents = convertNoteSequenceToToneEvents(melodySequence);
        const melodyPart = new Tone.Part((time, note) => {
          melodySynthRef.current?.triggerAttackRelease(note.note, note.duration, time, note.velocity);
        }, melodyEvents).start(0);
      }

      // Play drums if available
      if (drumSequence && drumSamplerRef.current) {
        const drumEvents = convertNoteSequenceToToneEvents(drumSequence);
        const drumPart = new Tone.Part((time, note) => {
          drumSamplerRef.current?.triggerAttack(note.note, time, note.velocity);
        }, drumEvents).start(0);
      }

      Tone.Transport.bpm.value = 120;
      Tone.Transport.start();
      setIsPlaying(true);

      console.log('▶️ Playing full track with AI-generated content');
    } catch (error) {
      console.error('❌ Error playing track:', error);
    }
  };

  const stopPlayback = () => {
    Tone.Transport.stop();
    setIsPlaying(false);
    console.log('⏹️ Playback stopped');
  };

  // Export: Convert NoteSequence to MIDI
  const exportToMidi = (sequence: mm.INoteSequence | null, filename: string) => {
    if (!sequence) {
      console.warn('⚠️ No sequence to export');
      return;
    }

    try {
      // Export: Convert NoteSequence to MIDI
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

  // Export: Record audio with Tone.js
  const exportToAudio = async () => {
    if (!recorderRef.current || (!melodySequence && !drumSequence)) {
      console.warn('⚠️ No content to record');
      return;
    }

    try {
      setIsRecording(true);
      console.log('🎙️ Starting audio recording...');

      await recorderRef.current.start();
      await playFullTrack();

      // Record for 8 seconds (adjust based on sequence length)
      setTimeout(async () => {
        const recording = await recorderRef.current!.stop();
        const url = URL.createObjectURL(recording);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'droplab-track.wav';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setIsRecording(false);
        console.log('✅ Audio export completed');
      }, 8000);
    } catch (error) {
      console.error('❌ Error recording audio:', error);
      setIsRecording(false);
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
          onPlayMelody={() => playFullTrack()}
          melodySequence={melodySequence}
          modelsLoaded={modelsLoaded}
        />
        <DrumSection 
          onGenerateDrums={generateDrums}
          onPlayDrums={() => playFullTrack()}
          drumSequence={drumSequence}
          modelsLoaded={modelsLoaded}
        />
        <GridSection />
        <FXSection 
          reverbAmount={reverbAmount}
          delayAmount={delayAmount}
          onReverbChange={setReverbAmount}
          onDelayChange={setDelayAmount}
        />
        <MixerSection 
          melodyVolume={melodyVolume}
          drumsVolume={drumsVolume}
          fxVolume={fxVolume}
          masterVolume={masterVolume}
          onMelodyVolumeChange={setMelodyVolume}
          onDrumsVolumeChange={setDrumsVolume}
          onFxVolumeChange={setFxVolume}
          onMasterVolumeChange={setMasterVolume}
        />
        <ExportSection 
          onExportMelody={() => exportToMidi(melodySequence, 'droplab-melody')}
          onExportDrums={() => exportToMidi(drumSequence, 'droplab-drums')}
          onExportAudio={exportToAudio}
          onPlayTrack={isPlaying ? stopPlayback : playFullTrack}
          hasGeneratedContent={!!(melodySequence || drumSequence)}
          isPlaying={isPlaying}
          isRecording={isRecording}
        />
      </main>
    </div>
  );
};

export default Producer;
