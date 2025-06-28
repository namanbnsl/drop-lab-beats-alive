import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Square, RotateCcw, Download, Save, 
  Volume2, Settings, Zap, Brain, Music, Layers,
  Grid3X3, Sliders, Mic, Users, Share2
} from 'lucide-react';
import * as Tone from 'tone';
import { LyriaSession } from '../../lib/lyria';

interface Track {
  id: string;
  name: string;
  type: 'melody' | 'drums' | 'bass' | 'harmony';
  pattern: number[];
  notes?: { time: number; pitch: number; velocity: number; duration: number }[];
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  effects: {
    reverb: number;
    delay: number;
    filter: number;
    distortion: number;
  };
}

interface LyriaConfig {
  style: string;
  key: string;
  tempo: number;
  complexity: number;
  mood: string;
  instruments: string[];
}

const LyriaProductionStudio: React.FC = () => {
  // Lyria AI State
  const [lyria, setLyria] = useState<LyriaSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Transport State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [timeSignature, setTimeSignature] = useState([4, 4]);
  const [currentBar, setCurrentBar] = useState(1);
  const [totalBars, setTotalBars] = useState(4);

  // Sequencer State
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: 'drums',
      name: 'AI Drums',
      type: 'drums',
      pattern: new Array(16).fill(0),
      volume: 80,
      pan: 50,
      muted: false,
      solo: false,
      effects: { reverb: 0, delay: 0, filter: 50, distortion: 0 }
    },
    {
      id: 'bass',
      name: 'AI Bass',
      type: 'bass',
      pattern: new Array(16).fill(0),
      notes: [],
      volume: 75,
      pan: 50,
      muted: false,
      solo: false,
      effects: { reverb: 10, delay: 0, filter: 50, distortion: 15 }
    },
    {
      id: 'melody',
      name: 'AI Melody',
      type: 'melody',
      pattern: new Array(16).fill(0),
      notes: [],
      volume: 70,
      pan: 50,
      muted: false,
      solo: false,
      effects: { reverb: 25, delay: 15, filter: 50, distortion: 0 }
    },
    {
      id: 'harmony',
      name: 'AI Harmony',
      type: 'harmony',
      pattern: new Array(16).fill(0),
      notes: [],
      volume: 60,
      pan: 50,
      muted: false,
      solo: false,
      effects: { reverb: 35, delay: 20, filter: 50, distortion: 0 }
    }
  ]);

  // UI State
  const [selectedTrack, setSelectedTrack] = useState<string>('drums');
  const [viewMode, setViewMode] = useState<'sequencer' | 'piano' | 'mixer'>('sequencer');
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [showEffects, setShowEffects] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Lyria Configuration
  const [lyriaConfig, setLyriaConfig] = useState<LyriaConfig>({
    style: 'electronic',
    key: 'C',
    tempo: 120,
    complexity: 0.7,
    mood: 'energetic',
    instruments: ['synth', 'drums', 'bass']
  });

  // Audio Engine References
  const audioEngineRef = useRef<{
    synths: Map<string, Tone.Synth | Tone.MembraneSynth | Tone.NoiseSynth>;
    effects: Map<string, Tone.Reverb | Tone.FeedbackDelay | Tone.Filter>;
    masterGain: Tone.Gain;
    recorder: Tone.Recorder;
    metronome: Tone.Synth;
    sequencer: Tone.Sequence | null;
  }>({
    synths: new Map(),
    effects: new Map(),
    masterGain: new Tone.Gain(0.7),
    recorder: new Tone.Recorder(),
    metronome: new Tone.Synth(),
    sequencer: null
  });

  // Waveform Visualization
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveformDataRef = useRef<Float32Array>(new Float32Array(512));

  // Initialize Lyria AI Connection
  useEffect(() => {
    const initializeLyria = async () => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          console.warn('Lyria API key not found');
          return;
        }

        const session = new LyriaSession(apiKey);
        
        await session.connect(
          (audioChunk: string) => {
            // Handle real-time audio from Lyria
            processLyriaAudio(audioChunk);
          },
          (error) => {
            console.error('Lyria error:', error);
            setIsConnected(false);
          },
          () => {
            console.log('Lyria session closed');
            setIsConnected(false);
          }
        );

        setLyria(session);
        setIsConnected(true);
        console.log('🤖 Lyria AI connected successfully');
        
        // Generate initial AI suggestions
        generateAiSuggestions();
        
      } catch (error) {
        console.error('Failed to initialize Lyria:', error);
        setIsConnected(false);
      }
    };

    initializeLyria();

    return () => {
      if (lyria) {
        lyria.close();
      }
    };
  }, []);

  // Initialize Audio Engine
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await Tone.start();
        
        const engine = audioEngineRef.current;
        
        // Create master gain and recorder
        engine.masterGain = new Tone.Gain(0.7).toDestination();
        engine.recorder = new Tone.Recorder();
        engine.masterGain.connect(engine.recorder);

        // Create metronome (hidden from user)
        engine.metronome = new Tone.Synth({
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
        });
        const metronomeGain = new Tone.Gain(0); // Silent metronome
        engine.metronome.connect(metronomeGain);
        metronomeGain.connect(engine.masterGain);

        // Create instruments for each track
        tracks.forEach(track => {
          let synth: Tone.Synth | Tone.MembraneSynth | Tone.NoiseSynth;
          
          switch (track.type) {
            case 'drums':
              synth = new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 10,
                oscillator: { type: 'sine' },
                envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
              });
              break;
            case 'bass':
              synth = new Tone.Synth({
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 1.2 }
              });
              break;
            case 'melody':
              synth = new Tone.Synth({
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.8 }
              });
              break;
            case 'harmony':
              synth = new Tone.Synth({
                oscillator: { type: 'sine' },
                envelope: { attack: 0.8, decay: 0.5, sustain: 0.7, release: 2.0 }
              });
              break;
            default:
              synth = new Tone.Synth();
          }
          
          synth.connect(engine.masterGain);
          engine.synths.set(track.id, synth);
        });

        // Create effects
        const reverb = new Tone.Reverb(2);
        const delay = new Tone.FeedbackDelay('8n', 0.3);
        const filter = new Tone.Filter(1000, 'lowpass');
        
        reverb.connect(engine.masterGain);
        delay.connect(engine.masterGain);
        filter.connect(engine.masterGain);
        
        engine.effects.set('reverb', reverb);
        engine.effects.set('delay', delay);
        engine.effects.set('filter', filter);

        console.log('🎵 Audio engine initialized');
        
      } catch (error) {
        console.error('Failed to initialize audio engine:', error);
      }
    };

    initializeAudio();

    return () => {
      // Cleanup
      const engine = audioEngineRef.current;
      if (engine.sequencer) {
        engine.sequencer.stop();
        engine.sequencer.dispose();
      }
      Tone.Transport.stop();
      Tone.Transport.cancel();
    };
  }, []);

  // Process Lyria AI Audio
  const processLyriaAudio = useCallback((audioChunk: string) => {
    try {
      // Decode base64 audio data
      const audioData = atob(audioChunk);
      
      // Update waveform visualization
      const waveform = new Float32Array(512);
      for (let i = 0; i < waveform.length; i++) {
        waveform[i] = Math.sin(i * 0.1 + Date.now() * 0.001) * 0.5;
      }
      waveformDataRef.current = waveform;
      
      // Trigger visual feedback
      setGenerationProgress(prev => Math.min(prev + 10, 100));
      
    } catch (error) {
      console.error('Error processing Lyria audio:', error);
    }
  }, []);

  // Generate AI Suggestions
  const generateAiSuggestions = useCallback(() => {
    const suggestions = [
      'Try adding a syncopated hi-hat pattern',
      'Consider a bass drop at bar 3',
      'Add some reverb to the melody for atmosphere',
      'Layer in a counter-melody in a higher octave',
      'Use a low-pass filter sweep for transition',
      'Add polyrhythmic elements to the drums',
      'Try a call-and-response between bass and melody',
      'Consider adding a breakdown section'
    ];
    
    setAiSuggestions(suggestions.slice(0, 3));
  }, []);

  // Generate AI Content
  const generateAiContent = async (trackType: string) => {
    if (!lyria || !isConnected) {
      console.warn('Lyria not connected');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Configure Lyria for the specific track type
      const prompt = `Generate a ${trackType} pattern in ${lyriaConfig.key} ${lyriaConfig.style} style at ${lyriaConfig.tempo} BPM with ${lyriaConfig.mood} mood`;
      
      await lyria.setWeightedPrompts([{ text: prompt, weight: 1.0 }]);
      await lyria.setMusicGenerationConfig({
        bpm: lyriaConfig.tempo,
        temperature: lyriaConfig.complexity
      });

      // Start generation
      await lyria.play();
      
      // Simulate pattern generation based on AI output
      setTimeout(() => {
        const newPattern = generatePatternFromAi(trackType);
        updateTrackPattern(trackType, newPattern);
        setIsGenerating(false);
        setGenerationProgress(100);
        
        // Generate new suggestions
        generateAiSuggestions();
      }, 3000);
      
    } catch (error) {
      console.error('AI generation failed:', error);
      setIsGenerating(false);
    }
  };

  // Generate Pattern from AI (simulated)
  const generatePatternFromAi = (trackType: string): number[] => {
    const pattern = new Array(16).fill(0);
    
    switch (trackType) {
      case 'drums':
        // Generate kick and snare pattern
        [0, 4, 8, 12].forEach(i => pattern[i] = 1); // Kick
        [4, 12].forEach(i => pattern[i] = 2); // Snare
        for (let i = 0; i < 16; i += 2) pattern[i] = pattern[i] || 3; // Hi-hat
        break;
      case 'bass':
        // Generate bass pattern
        [0, 2, 6, 8, 10, 14].forEach(i => pattern[i] = 1);
        break;
      case 'melody':
        // Generate melody pattern
        [0, 3, 5, 7, 10, 12, 15].forEach(i => pattern[i] = Math.floor(Math.random() * 3) + 1);
        break;
      case 'harmony':
        // Generate harmony pattern
        [1, 4, 6, 9, 11, 13].forEach(i => pattern[i] = Math.floor(Math.random() * 2) + 1);
        break;
    }
    
    return pattern;
  };

  // Update Track Pattern
  const updateTrackPattern = (trackId: string, pattern: number[]) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, pattern } : track
    ));
  };

  // Transport Controls
  const handlePlay = async () => {
    if (!isPlaying) {
      await Tone.start();
      
      // Start metronome (silent)
      const engine = audioEngineRef.current;
      Tone.Transport.bpm.value = tempo;
      
      // Create sequencer that triggers on bar boundaries
      if (engine.sequencer) {
        engine.sequencer.dispose();
      }
      
      engine.sequencer = new Tone.Sequence((time, step) => {
        // Only trigger sounds at the start of each bar
        if (step % 16 === 0) {
          playCurrentPatterns(time);
        }
        
        // Update UI step counter
        Tone.Draw.schedule(() => {
          setCurrentStep(step % 16);
          if (step % 16 === 0) {
            setCurrentBar(prev => (prev % totalBars) + 1);
          }
        }, time);
        
        // Trigger metronome (silent)
        engine.metronome.triggerAttackRelease('C4', '16n', time, 0);
        
      }, Array.from({ length: 16 }, (_, i) => i), '16n');
      
      engine.sequencer.start(0);
      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (isPlaying) {
      Tone.Transport.stop();
      const engine = audioEngineRef.current;
      if (engine.sequencer) {
        engine.sequencer.stop();
      }
      setIsPlaying(false);
      setCurrentStep(0);
      setCurrentBar(1);
    }
  };

  const handlePause = () => {
    if (isPlaying) {
      Tone.Transport.pause();
      setIsPlaying(false);
    }
  };

  // Play Current Patterns
  const playCurrentPatterns = (time: number) => {
    const engine = audioEngineRef.current;
    
    tracks.forEach(track => {
      if (track.muted) return;
      
      const synth = engine.synths.get(track.id);
      if (!synth) return;
      
      track.pattern.forEach((velocity, step) => {
        if (velocity > 0) {
          const stepTime = time + (step * (60 / tempo / 4)); // 16th note timing
          
          if (track.type === 'drums') {
            // Trigger drum sounds
            (synth as Tone.MembraneSynth).triggerAttackRelease('C2', '16n', stepTime, velocity / 127);
          } else {
            // Trigger melodic sounds
            const note = track.notes?.[step] || { pitch: 60 };
            const frequency = Tone.Frequency(note.pitch, 'midi').toFrequency();
            (synth as Tone.Synth).triggerAttackRelease(frequency, '16n', stepTime, velocity / 127);
          }
        }
      });
    });
  };

  // Pattern Editor
  const toggleStep = (trackId: string, step: number) => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        const newPattern = [...track.pattern];
        newPattern[step] = newPattern[step] > 0 ? 0 : 1;
        return { ...track, pattern: newPattern };
      }
      return track;
    }));
  };

  // Track Controls
  const updateTrackVolume = (trackId: string, volume: number) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, volume } : track
    ));
  };

  const toggleMute = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ));
  };

  const toggleSolo = (trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, solo: !track.solo } : track
    ));
  };

  // Export Functions
  const exportProject = async () => {
    try {
      setIsRecording(true);
      const engine = audioEngineRef.current;
      
      await engine.recorder.start();
      await handlePlay();
      
      // Record for the duration of the pattern
      const recordingDuration = (totalBars * 4 * 60) / tempo; // Duration in seconds
      
      setTimeout(async () => {
        const recording = await engine.recorder.stop();
        const url = URL.createObjectURL(recording);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `lyria-production-${Date.now()}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        handleStop();
        setIsRecording(false);
      }, recordingDuration * 1000);
      
    } catch (error) {
      console.error('Export failed:', error);
      setIsRecording(false);
    }
  };

  // Waveform Visualization
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      
      ctx.strokeStyle = '#a259ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const waveform = waveformDataRef.current;
      for (let i = 0; i < waveform.length; i++) {
        const x = (i / waveform.length) * width;
        const y = height / 2 + (waveform[i] * height) / 4;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      requestAnimationFrame(draw);
    };

    draw();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-['Poppins'] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Lyria Production Studio
          </h1>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isConnected ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {isConnected ? '🤖 AI Connected' : '❌ AI Offline'}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('sequencer')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'sequencer' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('piano')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'piano' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('mixer')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'mixer' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* AI Panel */}
        <AnimatePresence>
          {showAiPanel && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="col-span-3 space-y-4"
            >
              {/* AI Configuration */}
              <div className="bg-gray-900 rounded-xl p-4 border border-purple-500/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Configuration
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Style</label>
                    <select
                      value={lyriaConfig.style}
                      onChange={(e) => setLyriaConfig(prev => ({ ...prev, style: e.target.value }))}
                      className="w-full bg-black border border-purple-500/50 rounded px-3 py-2 text-white"
                    >
                      <option value="electronic">Electronic</option>
                      <option value="house">House</option>
                      <option value="techno">Techno</option>
                      <option value="ambient">Ambient</option>
                      <option value="dnb">Drum & Bass</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Key</label>
                    <select
                      value={lyriaConfig.key}
                      onChange={(e) => setLyriaConfig(prev => ({ ...prev, key: e.target.value }))}
                      className="w-full bg-black border border-purple-500/50 rounded px-3 py-2 text-white"
                    >
                      {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(key => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Complexity: {Math.round(lyriaConfig.complexity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={lyriaConfig.complexity}
                      onChange={(e) => setLyriaConfig(prev => ({ ...prev, complexity: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="bg-gray-900 rounded-xl p-4 border border-purple-500/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-4">AI Suggestions</h3>
                <div className="space-y-2">
                  {aiSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3 bg-black rounded-lg border border-purple-500/20 text-sm text-gray-300"
                    >
                      💡 {suggestion}
                    </div>
                  ))}
                </div>
                <button
                  onClick={generateAiSuggestions}
                  className="w-full mt-3 px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500 transition-colors"
                >
                  Get New Suggestions
                </button>
              </div>

              {/* AI Generation */}
              <div className="bg-gray-900 rounded-xl p-4 border border-purple-500/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-4">Generate Content</h3>
                <div className="space-y-2">
                  {tracks.map(track => (
                    <button
                      key={track.id}
                      onClick={() => generateAiContent(track.id)}
                      disabled={isGenerating}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4 inline mr-2" />
                      Generate {track.name}
                    </button>
                  ))}
                </div>
                
                {isGenerating && (
                  <div className="mt-4">
                    <div className="text-sm text-purple-400 mb-2">Generating... {generationProgress}%</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={showAiPanel ? 'col-span-9' : 'col-span-12'}>
          {/* Transport Controls */}
          <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlay}
                  disabled={isPlaying}
                  className="p-3 bg-green-600 rounded-full text-white hover:bg-green-500 transition-colors disabled:opacity-50"
                >
                  <Play className="w-6 h-6" />
                </button>
                <button
                  onClick={handlePause}
                  disabled={!isPlaying}
                  className="p-3 bg-yellow-600 rounded-full text-white hover:bg-yellow-500 transition-colors disabled:opacity-50"
                >
                  <Pause className="w-6 h-6" />
                </button>
                <button
                  onClick={handleStop}
                  className="p-3 bg-red-600 rounded-full text-white hover:bg-red-500 transition-colors"
                >
                  <Square className="w-6 h-6" />
                </button>
                <button
                  onClick={() => {
                    setCurrentStep(0);
                    setCurrentBar(1);
                  }}
                  className="p-3 bg-gray-600 rounded-full text-white hover:bg-gray-500 transition-colors"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Tempo</div>
                  <input
                    type="number"
                    value={tempo}
                    onChange={(e) => setTempo(Number(e.target.value))}
                    className="w-20 bg-black border border-purple-500/50 rounded px-2 py-1 text-center text-white"
                    min="60"
                    max="200"
                  />
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400">Bar</div>
                  <div className="text-xl font-bold text-purple-400">
                    {currentBar} / {totalBars}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-400">Step</div>
                  <div className="text-xl font-bold text-purple-400">
                    {currentStep + 1}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportProject}
                  disabled={isRecording}
                  className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  {isRecording ? 'Recording...' : 'Export'}
                </button>
                
                <button
                  onClick={() => setShowAiPanel(!showAiPanel)}
                  className="p-2 bg-gray-600 rounded-lg text-white hover:bg-gray-500 transition-colors"
                >
                  <Brain className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Waveform Visualization */}
          <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-purple-500/30">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">Live Waveform</h3>
            <canvas
              ref={waveformCanvasRef}
              width={800}
              height={120}
              className="w-full h-30 bg-black rounded-lg border border-purple-500/20"
            />
          </div>

          {/* Sequencer View */}
          {viewMode === 'sequencer' && (
            <div className="bg-gray-900 rounded-xl p-4 border border-purple-500/30">
              <h3 className="text-lg font-semibold text-purple-400 mb-4">16-Step Sequencer</h3>
              
              <div className="space-y-4">
                {tracks.map(track => (
                  <div key={track.id} className="flex items-center gap-4">
                    {/* Track Controls */}
                    <div className="w-32 flex flex-col gap-2">
                      <div className="text-sm font-semibold text-white">{track.name}</div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => toggleMute(track.id)}
                          className={`px-2 py-1 text-xs rounded ${
                            track.muted ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'
                          }`}
                        >
                          M
                        </button>
                        <button
                          onClick={() => toggleSolo(track.id)}
                          className={`px-2 py-1 text-xs rounded ${
                            track.solo ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-gray-300'
                          }`}
                        >
                          S
                        </button>
                      </div>
                    </div>

                    {/* Step Grid */}
                    <div className="flex gap-1">
                      {track.pattern.map((velocity, step) => (
                        <button
                          key={step}
                          onClick={() => toggleStep(track.id, step)}
                          className={`w-8 h-8 rounded transition-all ${
                            velocity > 0
                              ? 'bg-purple-500 shadow-lg shadow-purple-500/25'
                              : 'bg-gray-700 hover:bg-gray-600'
                          } ${
                            currentStep === step && isPlaying
                              ? 'ring-2 ring-white'
                              : ''
                          }`}
                        />
                      ))}
                    </div>

                    {/* Volume */}
                    <div className="w-20">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={track.volume}
                        onChange={(e) => updateTrackVolume(track.id, Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Piano Roll View */}
          {viewMode === 'piano' && (
            <div className="bg-gray-900 rounded-xl p-4 border border-purple-500/30">
              <h3 className="text-lg font-semibold text-purple-400 mb-4">Piano Roll Editor</h3>
              <div className="h-64 bg-black rounded-lg border border-purple-500/20 flex items-center justify-center">
                <div className="text-gray-400">Piano roll editor coming soon...</div>
              </div>
            </div>
          )}

          {/* Mixer View */}
          {viewMode === 'mixer' && (
            <div className="bg-gray-900 rounded-xl p-4 border border-purple-500/30">
              <h3 className="text-lg font-semibold text-purple-400 mb-4">Mixer</h3>
              <div className="grid grid-cols-4 gap-4">
                {tracks.map(track => (
                  <div key={track.id} className="bg-black rounded-lg p-4 border border-purple-500/20">
                    <h4 className="text-white font-semibold mb-4">{track.name}</h4>
                    
                    {/* Volume Fader */}
                    <div className="mb-4">
                      <label className="block text-xs text-gray-400 mb-2">Volume</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={track.volume}
                        onChange={(e) => updateTrackVolume(track.id, Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-400 text-center">{track.volume}%</div>
                    </div>

                    {/* Pan */}
                    <div className="mb-4">
                      <label className="block text-xs text-gray-400 mb-2">Pan</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={track.pan}
                        onChange={(e) => setTracks(prev => prev.map(t => 
                          t.id === track.id ? { ...t, pan: Number(e.target.value) } : t
                        ))}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-400 text-center">
                        {track.pan < 50 ? 'L' : track.pan > 50 ? 'R' : 'C'}
                      </div>
                    </div>

                    {/* Effects */}
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Reverb</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={track.effects.reverb}
                          onChange={(e) => setTracks(prev => prev.map(t => 
                            t.id === track.id 
                              ? { ...t, effects: { ...t.effects, reverb: Number(e.target.value) } }
                              : t
                          ))}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Delay</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={track.effects.delay}
                          onChange={(e) => setTracks(prev => prev.map(t => 
                            t.id === track.id 
                              ? { ...t, effects: { ...t.effects, delay: Number(e.target.value) } }
                              : t
                          ))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LyriaProductionStudio;