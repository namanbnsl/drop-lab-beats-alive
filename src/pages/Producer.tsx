import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Home, Volume2, Play, Pause, Download, Send } from 'lucide-react';
import * as Tone from 'tone';
import { LyriaAPI, type LyriaGenerationResponse } from '../lib/lyria';
import ProducerNavbar from '../components/Producer/ProducerNavbar';
import WelcomeSection from '../components/Producer/WelcomeSection';
import MusicGenerationSection from '../components/Producer/MusicGenerationSection';
import MelodySection from '../components/Producer/MelodySection';
import DrumSection from '../components/Producer/DrumSection';
import GridSection from '../components/Producer/GridSection';
import FXSection from '../components/Producer/FXSection';
import MixerSection from '../components/Producer/MixerSection';
import ExportSection from '../components/Producer/ExportSection';

const Producer = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('welcome');
  
  // Lyria API: Initialize with API key
  const lyriaAPI = useRef<LyriaAPI>();
  const [apiReady, setApiReady] = useState(false);
  const [isLoadingAPI, setIsLoadingAPI] = useState(true);
  
  // Generated sequences storage
  const [melodyData, setMelodyData] = useState<LyriaGenerationResponse | null>(null);
  const [drumData, setDrumData] = useState<LyriaGenerationResponse | null>(null);

  // Tone.js: Audio engine setup
  const melodyGainRef = useRef<Tone.Gain>();
  const drumsGainRef = useRef<Tone.Gain>();
  const fxSendRef = useRef<Tone.Gain>();
  const masterGainRef = useRef<Tone.Gain>();
  const reverbRef = useRef<Tone.Reverb>();
  const delayRef = useRef<Tone.FeedbackDelay>();
  const melodySynthRef = useRef<Tone.Synth>();
  const drumSamplerRef = useRef<Tone.Players>();
  const recorderRef = useRef<Tone.Recorder>();
  const drumPatternRef = useRef<Tone.Loop>();

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

  // Drum pattern state
  const [drumStyle, setDrumStyle] = useState('house');

  // Lyria API: Initialize on component mount
  useEffect(() => {
    const initializeLyria = async () => {
      try {
        console.log('🎵 Initializing Lyria API...');
        
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'demo-key';
        
        lyriaAPI.current = new LyriaAPI(apiKey);
        setApiReady(true);
        setIsLoadingAPI(false);
        console.log('✅ Lyria API ready for music generation!');
      } catch (error) {
        console.error('❌ Error initializing Lyria API:', error);
        setIsLoadingAPI(false);
      }
    };

    initializeLyria();
  }, []);

  // Tone.js: Initialize audio engine with FX chains
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        console.log('🔊 Initializing Tone.js audio engine...');

        // Create master gain and recorder
        masterGainRef.current = new Tone.Gain(masterVolume / 100).toDestination();
        recorderRef.current = new Tone.Recorder();
        masterGainRef.current.connect(recorderRef.current);
        
        // Create FX sends (parallel processing)
        reverbRef.current = new Tone.Reverb(2);
        delayRef.current = new Tone.FeedbackDelay("8n", 0.4);
        fxSendRef.current = new Tone.Gain(fxVolume / 100);
        
        // Set initial FX amounts
        reverbRef.current.wet.value = reverbAmount;
        delayRef.current.wet.value = delayAmount;

        // Connect FX in parallel to master
        fxSendRef.current.fan(reverbRef.current, delayRef.current);
        reverbRef.current.connect(masterGainRef.current);
        delayRef.current.connect(masterGainRef.current);

        // Create individual channel gains with FX sends
        melodyGainRef.current = new Tone.Gain(melodyVolume / 100);
        drumsGainRef.current = new Tone.Gain(drumsVolume / 100);

        // Connect channels to master and FX sends
        melodyGainRef.current.fan(masterGainRef.current, fxSendRef.current);
        drumsGainRef.current.fan(masterGainRef.current, fxSendRef.current);

        // Create instruments
        melodySynthRef.current = new Tone.Synth({
          oscillator: {
            type: "triangle"
          },
          envelope: {
            attack: 0.1,
            decay: 0.2,
            sustain: 0.3,
            release: 0.8
          }
        }).connect(melodyGainRef.current);

        // Create drum sampler with synthesized drums
        const drumSynths = {
          kick: new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 10,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
          }).connect(drumsGainRef.current),
          
          snare: new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.0 }
          }).connect(drumsGainRef.current),
          
          hihat: new Tone.MetalSynth({
            frequency: 200,
            envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5
          }).connect(drumsGainRef.current),
          
          openhat: new Tone.MetalSynth({
            frequency: 400,
            envelope: { attack: 0.001, decay: 0.3, release: 0.1 },
            harmonicity: 3.1,
            modulationIndex: 16,
            resonance: 2000,
            octaves: 1
          }).connect(drumsGainRef.current)
        };

        // Store drum synths for later use
        (window as any).drumSynths = drumSynths;

        console.log('✅ Tone.js audio engine initialized with synthesized drums');
      } catch (error) {
        console.error('❌ Error initializing audio:', error);
      }
    };

    initializeAudio();

    return () => {
      // Cleanup on unmount
      if (drumPatternRef.current) {
        drumPatternRef.current.stop();
        drumPatternRef.current.dispose();
      }
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, []);

  // Tone.js: Update volume controls in real time
  useEffect(() => {
    if (melodyGainRef.current) {
      melodyGainRef.current.gain.rampTo(melodyVolume / 100, 0.1);
    }
  }, [melodyVolume]);

  useEffect(() => {
    if (drumsGainRef.current) {
      drumsGainRef.current.gain.rampTo(drumsVolume / 100, 0.1);
    }
  }, [drumsVolume]);

  useEffect(() => {
    if (fxSendRef.current) {
      fxSendRef.current.gain.rampTo(fxVolume / 100, 0.1);
    }
  }, [fxVolume]);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.rampTo(masterVolume / 100, 0.1);
    }
  }, [masterVolume]);

  // FX: Update effects in real time
  useEffect(() => {
    if (reverbRef.current) {
      reverbRef.current.wet.rampTo(reverbAmount, 0.1);
    }
  }, [reverbAmount]);

  useEffect(() => {
    if (delayRef.current) {
      delayRef.current.wet.rampTo(delayAmount, 0.1);
    }
  }, [delayAmount]);

  // Drum Patterns: Different styles with synthesized drums
  const getDrumPattern = (style: string) => {
    const patterns = {
      house: [
        { time: "0:0:0", sample: "kick" },
        { time: "0:1:0", sample: "hihat" },
        { time: "0:2:0", sample: "kick" },
        { time: "0:3:0", sample: "hihat" },
        { time: "1:0:0", sample: "kick" },
        { time: "1:1:0", sample: "hihat" },
        { time: "1:2:0", sample: "snare" },
        { time: "1:3:0", sample: "hihat" }
      ],
      trap: [
        { time: "0:0:0", sample: "kick" },
        { time: "0:0:2", sample: "kick" },
        { time: "0:2:0", sample: "snare" },
        { time: "0:3:2", sample: "hihat" },
        { time: "1:0:0", sample: "kick" },
        { time: "1:1:2", sample: "hihat" },
        { time: "1:2:0", sample: "snare" },
        { time: "1:3:0", sample: "hihat" }
      ],
      dnb: [
        { time: "0:0:0", sample: "kick" },
        { time: "0:2:0", sample: "snare" },
        { time: "1:0:0", sample: "kick" },
        { time: "1:2:0", sample: "snare" },
        { time: "0:1:0", sample: "hihat" },
        { time: "0:3:0", sample: "hihat" },
        { time: "1:1:0", sample: "hihat" },
        { time: "1:3:0", sample: "hihat" }
      ]
    };
    return patterns[style as keyof typeof patterns] || patterns.house;
  };

  // Helper: Convert Lyria response to Tone.js events
  const convertLyriaToToneEvents = (lyriaData: LyriaGenerationResponse | null) => {
    if (!lyriaData || !lyriaData.midiData) return [];
    
    try {
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(lyriaData.midiData);
      const midiData = JSON.parse(jsonString);
      
      return midiData.notes.map((note: any) => ({
        time: note.startTime,
        note: Tone.Frequency(note.pitch, "midi").toNote(),
        duration: note.endTime - note.startTime,
        velocity: note.velocity
      }));
    } catch (error) {
      console.error('Error parsing Lyria data:', error);
      return [];
    }
  };

  // Lyria API: Generate melody using AI
  const generateMelody = async (key: string, style: string, length: number) => {
    if (!lyriaAPI.current || !apiReady) {
      console.warn('⚠️ Lyria API not ready yet');
      return null;
    }

    try {
      console.log(`🎼 Generating AI melody with Lyria in ${key} (${style}, ${length} bars)...`);
      
      const result = await lyriaAPI.current.generateMelody({ key, style, length });
      
      console.log('✅ Melody generated successfully with Lyria:', result);
      setMelodyData(result);
      
      return result;
    } catch (error) {
      console.error('❌ Error generating melody with Lyria:', error);
      return null;
    }
  };

  // Drums: Generate pattern using synthesized drums
  const generateDrums = async (style: string, complexity: string) => {
    try {
      console.log(`🥁 Generating drums with synthesized sounds (${style}, ${complexity})...`);
      
      // Create mock drum data for consistency with export system
      const pattern = getDrumPattern(style.toLowerCase());
      const mockDrumData = {
        midiData: new TextEncoder().encode(JSON.stringify({
          notes: pattern.map((hit, index) => ({
            pitch: hit.sample === 'kick' ? 36 : hit.sample === 'snare' ? 38 : 42,
            startTime: parseFloat(hit.time.replace(':', '.')),
            endTime: parseFloat(hit.time.replace(':', '.')) + 0.1,
            velocity: 0.8
          }))
        })),
        metadata: {
          duration: 8,
          key: 'C',
          tempo: 120,
          style: style
        }
      };
      
      setDrumData(mockDrumData);
      setDrumStyle(style.toLowerCase());
      
      console.log('✅ Drum pattern generated successfully');
      return mockDrumData;
    } catch (error) {
      console.error('❌ Error generating drums:', error);
      return null;
    }
  };

  // Unified Playback: Play full track with synthesized drums
  const playFullTrack = async () => {
    if (!melodyData && !drumData) {
      console.warn('⚠️ No sequences to play');
      return;
    }

    try {
      await Tone.start();
      
      // Stop any existing playback
      Tone.Transport.stop();
      Tone.Transport.cancel();
      if (drumPatternRef.current) {
        drumPatternRef.current.stop();
        drumPatternRef.current.dispose();
      }

      // Play melody if available
      if (melodyData && melodySynthRef.current) {
        const melodyEvents = convertLyriaToToneEvents(melodyData);
        if (melodyEvents.length > 0) {
          const melodyPart = new Tone.Part((time, note) => {
            melodySynthRef.current?.triggerAttackRelease(note.note, note.duration, time, note.velocity);
          }, melodyEvents).start(0);
        }
      }

      // Play drums if available using synthesized drums
      if (drumData) {
        const pattern = getDrumPattern(drumStyle);
        const drumSynths = (window as any).drumSynths;
        
        if (drumSynths) {
          drumPatternRef.current = new Tone.Loop((time) => {
            pattern.forEach((hit) => {
              const hitTime = Tone.Time(hit.time).toSeconds();
              const drumSynth = drumSynths[hit.sample];
              
              if (drumSynth) {
                if (hit.sample === 'kick') {
                  drumSynth.triggerAttackRelease('C2', '8n', time + hitTime, 0.8);
                } else if (hit.sample === 'snare') {
                  drumSynth.triggerAttackRelease('8n', time + hitTime, 0.7);
                } else if (hit.sample === 'hihat' || hit.sample === 'openhat') {
                  drumSynth.triggerAttackRelease('16n', time + hitTime, 0.6);
                }
              }
            });
          }, "2m").start(0);
        }
      }

      Tone.Transport.bpm.value = 120;
      Tone.Transport.start();
      setIsPlaying(true);

      console.log('▶️ Playing full track with Lyria melody + synthesized drums');
    } catch (error) {
      console.error('❌ Error playing track:', error);
    }
  };

  const stopPlayback = () => {
    Tone.Transport.stop();
    if (drumPatternRef.current) {
      drumPatternRef.current.stop();
    }
    setIsPlaying(false);
    console.log('⏹️ Playback stopped');
  };

  // Export: Convert data to MIDI
  const exportToMidi = (data: LyriaGenerationResponse | null, filename: string) => {
    if (!data || !data.midiData) {
      console.warn('⚠️ No data to export');
      return;
    }

    try {
      const blob = new Blob([data.midiData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`✅ Exported ${filename}.json`);
    } catch (error) {
      console.error('❌ Error exporting data:', error);
    }
  };

  // Export: Record full track with FX
  const exportToAudio = async () => {
    if (!recorderRef.current || (!melodyData && !drumData)) {
      console.warn('⚠️ No content to record');
      return;
    }

    try {
      setIsRecording(true);
      console.log('🎙️ Starting audio recording...');

      await recorderRef.current.start();
      await playFullTrack();

      // Record for 8 seconds (2 bar loop * 4 repetitions)
      setTimeout(async () => {
        const recording = await recorderRef.current!.stop();
        const url = URL.createObjectURL(recording);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'droplab-generated-track.wav';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        stopPlayback();
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
      const sections = ['welcome', 'music-generation', 'melody', 'drums', 'grid', 'fx', 'mixer', 'export'];
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

      {/* Lyria API Loading Indicator */}
      {isLoadingAPI && (
        <motion.div
          className="fixed top-4 right-4 z-50 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Connecting to Lyria...</span>
          </div>
        </motion.div>
      )}

      {/* API Ready Indicator */}
      {apiReady && !isLoadingAPI && (
        <motion.div
          className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white rounded-full"></div>
            <span className="text-sm">Audio Engine Ready</span>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="relative z-10">
        <WelcomeSection />
        <MusicGenerationSection />
        <MelodySection 
          onGenerateMelody={generateMelody}
          onPlayMelody={() => playFullTrack()}
          melodySequence={melodyData}
          modelsLoaded={apiReady}
        />
        <DrumSection 
          onGenerateDrums={generateDrums}
          onPlayDrums={() => playFullTrack()}
          drumSequence={drumData}
          modelsLoaded={true}
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
          onExportMelody={() => exportToMidi(melodyData, 'droplab-melody')}
          onExportDrums={() => exportToMidi(drumData, 'droplab-drums')}
          onExportAudio={exportToAudio}
          onPlayTrack={isPlaying ? stopPlayback : playFullTrack}
          hasGeneratedContent={!!(melodyData || drumData)}
          isPlaying={isPlaying}
          isRecording={isRecording}
        />
      </main>
    </div>
  );
};

export default Producer;