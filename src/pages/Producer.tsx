import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Home, Volume2, Play, Pause, Download, Send } from 'lucide-react';
import * as Tone from 'tone';
import { LyriaSession } from '../lib/lyria';
import ProducerNavbar from '../components/Producer/ProducerNavbar';
import WelcomeSection from '../components/Producer/WelcomeSection';
import MusicGenerationSection from '../components/Producer/MusicGenerationSection';
import DrumSection from '../components/Producer/DrumSection';
import GridSection from '../components/Producer/GridSection';
import FXSection from '../components/Producer/FXSection';
import MixerSection from '../components/Producer/MixerSection';
import ExportSection from '../components/Producer/ExportSection';

const Producer = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('welcome');

  // Lyria session state
  const [lyria, setLyria] = useState<LyriaSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioChunks, setAudioChunks] = useState<ArrayBuffer[]>([]);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);

  // Prompt/config controls
  const [promptText, setPromptText] = useState('Minimal Techno');
  const [promptWeight, setPromptWeight] = useState(1.0);
  const [bpm, setBpm] = useState(120);
  const [temperature, setTemperature] = useState(1.0);

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
  const [isRecording, setIsRecording] = useState(false);

  // Drum pattern state
  const [drumStyle, setDrumStyle] = useState('house');

  // Connect to Lyria session on mount
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    const lyriaSession = new LyriaSession(apiKey);
    setLyria(lyriaSession);
    setIsLoading(true);

    // Audio playback setup (matching /useful_resources)
    const sampleRate = 48000;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
    const outputNode = audioContext.createGain();
    let nextStartTime = 0;
    const bufferTime = 2; // adds an audio buffer in case of network latency

    outputNode.connect(audioContext.destination);
    setAudioContext(audioContext);

    lyriaSession.connect(
      async (audioChunk: string) => {
        try {
          // Resume AudioContext if suspended (required for user gesture)
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }

          // Decode base64 PCM data using /useful_resources utilities
          const decodedData = atob(audioChunk); // audioChunk is base64 string
          const audioBuffer = await audioContext.decodeAudioData(
            new ArrayBuffer(decodedData.length)
          );

          // Create and schedule audio source
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(outputNode);

          // Handle timing and underrun protection (matching /useful_resources)
          if (nextStartTime === 0) {
            nextStartTime = audioContext.currentTime + bufferTime;
            setTimeout(() => {
              setIsPlaying(true);
            }, bufferTime * 1000);
          }

          if (nextStartTime < audioContext.currentTime) {
            console.log('Audio underrun detected');
            setIsPlaying(false);
            nextStartTime = 0;
            return;
          }

          source.start(nextStartTime);
          nextStartTime += audioBuffer.duration;

          setAudioSource(source);
          setAudioChunks((prev) => [...prev, audioChunk as any]);
        } catch (err) {
          console.error('Audio playback error:', err);
          setError('Audio playback error');
        }
      },
      (err) => {
        console.error('Lyria session error:', err);
        setError(err?.message || 'Lyria session error');
        setIsPlaying(false);
      },
      () => {
        console.log('Lyria session closed');
        setIsPlaying(false);
      }
    ).then(() => setIsLoading(false));

    return () => {
      lyriaSession.close();
      if (audioContext) audioContext.close();
    };
  }, []);

  // Handle prompt/config changes
  const handlePromptConfigChange = async () => {
    if (!lyria) return;
    setIsLoading(true);
    setError(null);
    try {
      await lyria.setWeightedPrompts([{ text: promptText, weight: promptWeight }]);
      await lyria.setMusicGenerationConfig({ bpm, temperature });
    } catch (err: any) {
      setError(err.message || 'Failed to update prompt/config');
    }
    setIsLoading(false);
  };

  // Start/stop music generation
  const handlePlay = async () => {
    if (!lyria) return;
    setIsLoading(true);
    setError(null);
    try {
      await handlePromptConfigChange();
      await lyria.play();
      setIsPlaying(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start playback');
    }
    setIsLoading(false);
  };

  const handleStop = async () => {
    if (!lyria) return;
    setIsLoading(true);
    setError(null);
    try {
      await lyria.stop();
      setIsPlaying(false);
    } catch (err: any) {
      setError(err.message || 'Failed to stop playback');
    }
    setIsLoading(false);
  };

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

          hihat: (() => {
            const synth = new Tone.MetalSynth({
              envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
              harmonicity: 5.1,
              modulationIndex: 32,
              resonance: 4000,
              octaves: 1.5
            }).connect(drumsGainRef.current);
            synth.frequency.value = 200;
            return synth;
          })(),

          openhat: (() => {
            const synth = new Tone.MetalSynth({
              envelope: { attack: 0.001, decay: 0.3, release: 0.1 },
              harmonicity: 3.1,
              modulationIndex: 16,
              resonance: 2000,
              octaves: 1
            }).connect(drumsGainRef.current);
            synth.frequency.value = 400;
            return synth;
          })(),
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
  const convertLyriaToToneEvents = (lyriaData: LyriaSession | null) => {
    // LyriaSession provides real-time audio streaming, not MIDI data
    return [];
  };

  // Export: Convert data to MIDI
  const exportToMidi = (data: LyriaSession | null, filename: string) => {
    // LyriaSession provides real-time audio streaming, not MIDI data
    console.warn('MIDI export not available for real-time Lyria sessions');
  };

  // Export: Record full track with FX
  const exportToAudio = async () => {
    if (!recorderRef.current || !lyria) {
      console.warn('⚠️ No content to record');
      return;
    }

    try {
      setIsRecording(true);
      console.log('🎙️ Starting audio recording...');

      await recorderRef.current.start();
      await handlePlay();

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

        handleStop();
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
      const sections = ['welcome', 'music-generation', 'drums', 'grid', 'fx', 'mixer', 'export'];
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
      {isLoading && (
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
      {lyria && !isLoading && (
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
        <DrumSection
          onGenerateDrums={async () => null}
          onPlayDrums={() => { }}
          drumSequence={null}
          modelsLoaded={!!lyria}
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
          onExportMelody={() => exportToMidi(lyria, 'droplab-melody')}
          onExportDrums={() => exportToMidi(lyria, 'droplab-drums')}
          onExportAudio={exportToAudio}
          onPlayTrack={handlePlay}
          hasGeneratedContent={!!lyria}
          isPlaying={isPlaying}
          isRecording={isRecording}
        />
        <section className="lyria-controls bg-gray-900/60 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">Prompt</label>
              <input
                type="text"
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                className="w-full bg-black border border-purple-500/50 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">Prompt Weight</label>
              <input
                type="range"
                min={0.01}
                max={1.0}
                step={0.01}
                value={promptWeight}
                onChange={e => setPromptWeight(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-purple-400 ml-2">{promptWeight.toFixed(2)}</span>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">BPM</label>
              <input
                type="number"
                min={60}
                max={180}
                value={bpm}
                onChange={e => setBpm(Number(e.target.value))}
                className="w-full bg-black border border-purple-500/50 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">Temperature</label>
              <input
                type="range"
                min={0.1}
                max={2.0}
                step={0.01}
                value={temperature}
                onChange={e => setTemperature(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-purple-400 ml-2">{temperature.toFixed(2)}</span>
            </div>
            <button
              onClick={isPlaying ? handleStop : handlePlay}
              className="px-6 py-3 bg-purple-600 rounded-lg text-white font-semibold hover:bg-purple-500 transition-all"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : isPlaying ? 'Stop' : 'Play'}
            </button>
          </div>
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </section>
        <section className="audio-status text-center mt-4">
          {isPlaying && <span className="text-green-400">Music is playing from Lyria!</span>}
          {!isPlaying && !isLoading && <span className="text-gray-400">Press Play to generate music.</span>}
        </section>
      </main>
    </div>
  );
};

export default Producer;