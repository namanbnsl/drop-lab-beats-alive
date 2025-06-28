import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Square, RotateCcw, Download, Save, 
  Volume2, VolumeX, Settings, Mic, Grid3X3, 
  Music, Layers, Sliders, RefreshCw
} from 'lucide-react';
import * as Tone from 'tone';
import { LyriaSession } from '../../lib/lyria';

interface GenreKnob {
  id: string;
  name: string;
  value: number;
  color: string;
  isActive: boolean;
}

interface TrackState {
  drums: { enabled: boolean; volume: number; pattern: number[] };
  piano: { enabled: boolean; volume: number; pattern: number[] };
  bass: { enabled: boolean; volume: number; pattern: number[] };
  melody: { enabled: boolean; volume: number; pattern: number[] };
}

interface CompositionState {
  tempo: number;
  isPlaying: boolean;
  isRecording: boolean;
  masterVolume: number;
  currentStep: number;
  tracks: TrackState;
  genreInfluences: GenreKnob[];
}

const AIStudioInterface: React.FC = () => {
  // Core state
  const [composition, setComposition] = useState<CompositionState>({
    tempo: 120,
    isPlaying: false,
    isRecording: false,
    masterVolume: 75,
    currentStep: 0,
    tracks: {
      drums: { enabled: true, volume: 80, pattern: new Array(16).fill(0) },
      piano: { enabled: true, volume: 70, pattern: new Array(16).fill(0) },
      bass: { enabled: true, volume: 75, pattern: new Array(16).fill(0) },
      melody: { enabled: true, volume: 65, pattern: new Array(16).fill(0) }
    },
    genreInfluences: [
      { id: 'bossa-nova', name: 'Bossa Nova', value: 0, color: 'bg-gray-400', isActive: false },
      { id: 'chillwave', name: 'Chillwave', value: 0.7, color: 'bg-blue-500', isActive: true },
      { id: 'drum-and-bass', name: 'Drum and Bass', value: 0, color: 'bg-gray-400', isActive: false },
      { id: 'post-punk', name: 'Post Punk', value: 0, color: 'bg-gray-400', isActive: false },
      { id: 'shoegaze', name: 'Shoegaze', value: 0, color: 'bg-gray-400', isActive: false },
      { id: 'funk', name: 'Funk', value: 0.8, color: 'bg-green-500', isActive: true },
      { id: 'chiptune', name: 'Chiptune', value: 0, color: 'bg-gray-400', isActive: false },
      { id: 'lush-strings', name: 'Lush Strings', value: 0, color: 'bg-gray-400', isActive: false },
      { id: 'sparkling-arpeggios', name: 'Sparkling Arpegg...', value: 0, color: 'bg-gray-400', isActive: false },
      { id: 'staccato-rhythms', name: 'Staccato Rhythms', value: 0, color: 'bg-gray-400', isActive: false },
      { id: 'punchy-kick', name: 'Punchy Kick', value: 0, color: 'bg-yellow-400', isActive: false },
      { id: 'dubstep', name: 'Dubstep', value: 0.9, color: 'bg-yellow-500', isActive: true },
      { id: 'k-pop', name: 'K Pop', value: 0, color: 'bg-gray-400', isActive: false },
      { id: 'neo-soul', name: 'Neo Soul', value: 0, color: 'bg-gray-400', isActive: false },
      { id: 'trip-hop', name: 'Trip Hop', value: 0, color: 'bg-gray-400', isActive: false },
      { id: 'thrash', name: 'Thrash', value: 0, color: 'bg-gray-400', isActive: false }
    ]
  });

  // AI and Audio state
  const [lyria, setLyria] = useState<LyriaSession | null>(null);
  const [isAIConnected, setIsAIConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentView, setCurrentView] = useState<'knobs' | 'sequencer' | 'mixer'>('knobs');

  // Audio engine refs
  const audioEngineRef = useRef<{
    synths: Map<string, Tone.PolySynth | Tone.MembraneSynth>;
    effects: Map<string, Tone.Reverb | Tone.FeedbackDelay>;
    masterGain: Tone.Gain;
    recorder: Tone.Recorder;
    sequencer: Tone.Sequence | null;
  }>({
    synths: new Map(),
    effects: new Map(),
    masterGain: new Tone.Gain(0.7),
    recorder: new Tone.Recorder(),
    sequencer: null
  });

  // Initialize AI and Audio
  useEffect(() => {
    const initializeAI = async () => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          console.warn('Lyria API key not found');
          return;
        }

        const session = new LyriaSession(apiKey);
        await session.connect(
          (audioChunk: string) => processAIAudio(audioChunk),
          (error) => console.error('Lyria error:', error),
          () => setIsAIConnected(false)
        );

        setLyria(session);
        setIsAIConnected(true);
        console.log('🤖 Lyria AI connected');
      } catch (error) {
        console.error('Failed to initialize Lyria:', error);
      }
    };

    const initializeAudio = async () => {
      try {
        await Tone.start();
        
        const engine = audioEngineRef.current;
        engine.masterGain = new Tone.Gain(0.7).toDestination();
        engine.recorder = new Tone.Recorder();
        engine.masterGain.connect(engine.recorder);

        // Create instruments
        engine.synths.set('drums', new Tone.MembraneSynth().connect(engine.masterGain));
        engine.synths.set('piano', new Tone.PolySynth().connect(engine.masterGain));
        engine.synths.set('bass', new Tone.PolySynth().connect(engine.masterGain));
        engine.synths.set('melody', new Tone.PolySynth().connect(engine.masterGain));

        // Create effects
        const reverb = new Tone.Reverb(2).connect(engine.masterGain);
        const delay = new Tone.FeedbackDelay('8n', 0.3).connect(engine.masterGain);
        engine.effects.set('reverb', reverb);
        engine.effects.set('delay', delay);

        console.log('🎵 Audio engine initialized');
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    initializeAI();
    initializeAudio();

    return () => {
      if (lyria) lyria.close();
      audioEngineRef.current.synths.forEach(synth => synth.dispose());
      audioEngineRef.current.effects.forEach(effect => effect.dispose());
    };
  }, []);

  const processAIAudio = useCallback((audioChunk: string) => {
    // Process real-time audio from Lyria
    console.log('Processing AI audio chunk:', audioChunk.length);
  }, []);

  const generateAIContent = async () => {
    if (!lyria || !isAIConnected) return;

    setIsGenerating(true);
    try {
      // Create prompt based on active genre influences
      const activeGenres = composition.genreInfluences
        .filter(genre => genre.isActive && genre.value > 0)
        .map(genre => `${genre.name} (${Math.round(genre.value * 100)}%)`)
        .join(', ');

      const prompt = `Generate music with influences from: ${activeGenres}. Tempo: ${composition.tempo} BPM. Include drums, bass, and melody elements.`;

      await lyria.setWeightedPrompts([{ text: prompt, weight: 1.0 }]);
      await lyria.setMusicGenerationConfig({
        bpm: composition.tempo,
        temperature: 0.7
      });

      await lyria.play();
      
      // Simulate pattern generation
      setTimeout(() => {
        generatePatternsFromAI();
        setIsGenerating(false);
      }, 3000);

    } catch (error) {
      console.error('AI generation failed:', error);
      setIsGenerating(false);
    }
  };

  const generatePatternsFromAI = () => {
    const newTracks = { ...composition.tracks };
    
    // Generate drum pattern
    newTracks.drums.pattern = new Array(16).fill(0).map((_, i) => {
      if (i % 4 === 0) return 127; // Kick
      if (i === 4 || i === 12) return 100; // Snare
      if (i % 2 === 1) return 60; // Hi-hat
      return 0;
    });

    // Generate bass pattern
    newTracks.bass.pattern = new Array(16).fill(0).map((_, i) => {
      return [0, 3, 7, 10, 14].includes(i) ? 80 + Math.random() * 40 : 0;
    });

    // Generate melody pattern
    newTracks.melody.pattern = new Array(16).fill(0).map((_, i) => {
      return Math.random() > 0.6 ? 60 + Math.random() * 60 : 0;
    });

    setComposition(prev => ({ ...prev, tracks: newTracks }));
  };

  const handleKnobChange = (genreId: string, value: number) => {
    setComposition(prev => ({
      ...prev,
      genreInfluences: prev.genreInfluences.map(genre => 
        genre.id === genreId 
          ? { 
              ...genre, 
              value, 
              isActive: value > 0.1,
              color: value > 0.1 ? getActiveColor(value) : 'bg-gray-400'
            }
          : genre
      )
    }));

    // Trigger real-time AI adjustment
    if (isAIConnected && composition.isPlaying) {
      adjustAIInfluence(genreId, value);
    }
  };

  const getActiveColor = (value: number): string => {
    if (value > 0.8) return 'bg-yellow-500';
    if (value > 0.6) return 'bg-green-500';
    if (value > 0.4) return 'bg-blue-500';
    return 'bg-purple-500';
  };

  const adjustAIInfluence = async (genreId: string, value: number) => {
    if (!lyria) return;
    
    try {
      const activeGenres = composition.genreInfluences
        .filter(g => g.isActive || g.id === genreId)
        .map(g => ({ text: g.name, weight: g.id === genreId ? value : g.value }));

      await lyria.setWeightedPrompts(activeGenres);
    } catch (error) {
      console.error('Failed to adjust AI influence:', error);
    }
  };

  const handlePlayPause = async () => {
    if (composition.isPlaying) {
      Tone.Transport.stop();
      if (audioEngineRef.current.sequencer) {
        audioEngineRef.current.sequencer.stop();
      }
      setComposition(prev => ({ ...prev, isPlaying: false, currentStep: 0 }));
    } else {
      await Tone.start();
      Tone.Transport.bpm.value = composition.tempo;
      
      // Create sequencer
      const sequencer = new Tone.Sequence((time, step) => {
        playStep(step, time);
        setComposition(prev => ({ ...prev, currentStep: step % 16 }));
      }, Array.from({ length: 16 }, (_, i) => i), '16n');

      sequencer.start(0);
      audioEngineRef.current.sequencer = sequencer;
      Tone.Transport.start();
      setComposition(prev => ({ ...prev, isPlaying: true }));

      // Start AI generation if connected
      if (isAIConnected) {
        generateAIContent();
      }
    }
  };

  const playStep = (step: number, time: number) => {
    const engine = audioEngineRef.current;
    
    Object.entries(composition.tracks).forEach(([trackName, track]) => {
      if (!track.enabled || track.pattern[step] === 0) return;
      
      const synth = engine.synths.get(trackName);
      if (!synth) return;

      const velocity = track.pattern[step] / 127;
      
      if (trackName === 'drums') {
        (synth as Tone.MembraneSynth).triggerAttackRelease('C2', '16n', time, velocity);
      } else {
        const notes = getNotesForTrack(trackName, step);
        notes.forEach(note => {
          (synth as Tone.PolySynth).triggerAttackRelease(note, '16n', time, velocity);
        });
      }
    });
  };

  const getNotesForTrack = (trackName: string, step: number): string[] => {
    const baseNotes = {
      piano: ['C4', 'E4', 'G4', 'B4'],
      bass: ['C2', 'E2', 'G2', 'B2'],
      melody: ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6']
    };
    
    const notes = baseNotes[trackName as keyof typeof baseNotes] || ['C4'];
    return [notes[step % notes.length]];
  };

  const toggleStep = (trackName: string, step: number) => {
    setComposition(prev => ({
      ...prev,
      tracks: {
        ...prev.tracks,
        [trackName]: {
          ...prev.tracks[trackName as keyof TrackState],
          pattern: prev.tracks[trackName as keyof TrackState].pattern.map((value, i) => 
            i === step ? (value > 0 ? 0 : 127) : value
          )
        }
      }
    }));
  };

  const exportComposition = async () => {
    try {
      setComposition(prev => ({ ...prev, isRecording: true }));
      
      const engine = audioEngineRef.current;
      await engine.recorder.start();
      
      // Play composition for export
      await handlePlayPause();
      
      // Record for 8 bars
      setTimeout(async () => {
        const recording = await engine.recorder.stop();
        const url = URL.createObjectURL(recording);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `droplab-composition-${Date.now()}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setComposition(prev => ({ ...prev, isRecording: false }));
        if (composition.isPlaying) handlePlayPause();
      }, (8 * 4 * 60 / composition.tempo) * 1000);
      
    } catch (error) {
      console.error('Export failed:', error);
      setComposition(prev => ({ ...prev, isRecording: false }));
    }
  };

  const GenreKnobComponent = ({ genre }: { genre: GenreKnob }) => {
    const [isDragging, setIsDragging] = useState(false);
    const rotation = (genre.value * 270) - 135;

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const handleMouseMove = (e: MouseEvent) => {
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const degrees = (angle * 180 / Math.PI + 90 + 360) % 360;
        const normalizedValue = Math.max(0, Math.min(1, degrees / 270));
        handleKnobChange(genre.id, normalizedValue);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    return (
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative mb-3">
          {/* Outer glow ring */}
          <div 
            className={`absolute inset-0 rounded-full transition-all duration-300 ${
              genre.isActive ? `${genre.color} opacity-30 scale-110` : 'bg-transparent'
            }`}
            style={{ 
              boxShadow: genre.isActive ? `0 0 20px ${genre.color.replace('bg-', '')}` : 'none'
            }}
          />
          
          {/* Main knob */}
          <div
            className={`relative w-20 h-20 rounded-full cursor-pointer transition-all duration-200 ${
              genre.isActive ? genre.color : 'bg-gray-600'
            } ${isDragging ? 'scale-105' : 'hover:scale-105'}`}
            onMouseDown={handleMouseDown}
          >
            {/* Inner circle */}
            <div className="absolute inset-2 bg-gray-200 rounded-full shadow-inner">
              {/* Indicator */}
              <div
                className="absolute top-1 left-1/2 w-1 h-6 bg-gray-800 rounded-full transform -translate-x-1/2 origin-bottom transition-transform duration-100"
                style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
              />
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
        
        {/* Label */}
        <div className="text-center">
          <div className="bg-black text-white px-2 py-1 rounded text-xs font-semibold">
            {genre.name}
          </div>
          {genre.isActive && (
            <div className="text-xs text-purple-400 mt-1">
              {Math.round(genre.value * 100)}%
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            AI Music Studio
          </h1>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isAIConnected ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {isAIConnected ? '🤖 Lyria Connected' : '❌ AI Offline'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('knobs')}
            className={`px-4 py-2 rounded-lg transition-all ${
              currentView === 'knobs' ? 'bg-white text-black' : 'bg-black/30 hover:bg-black/50'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentView('sequencer')}
            className={`px-4 py-2 rounded-lg transition-all ${
              currentView === 'sequencer' ? 'bg-white text-black' : 'bg-black/30 hover:bg-black/50'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentView('mixer')}
            className={`px-4 py-2 rounded-lg transition-all ${
              currentView === 'mixer' ? 'bg-white text-black' : 'bg-black/30 hover:bg-black/50'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {currentView === 'knobs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Genre Knobs Grid */}
            <div className="grid grid-cols-4 gap-8 max-w-4xl mx-auto">
              {composition.genreInfluences.map((genre) => (
                <GenreKnobComponent key={genre.id} genre={genre} />
              ))}
            </div>

            {/* Central Play Button */}
            <div className="flex justify-center">
              <motion.button
                onClick={handlePlayPause}
                disabled={isGenerating}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ${
                  composition.isPlaying 
                    ? 'bg-red-600 hover:bg-red-500' 
                    : 'bg-green-600 hover:bg-green-500'
                } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isGenerating ? (
                  <RefreshCw className="w-8 h-8 animate-spin" />
                ) : composition.isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {currentView === 'sequencer' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center">Step Sequencer</h2>
            
            {Object.entries(composition.tracks).map(([trackName, track]) => (
              <div key={trackName} className="bg-black/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold capitalize">{trackName}</h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setComposition(prev => ({
                        ...prev,
                        tracks: {
                          ...prev.tracks,
                          [trackName]: { ...track, enabled: !track.enabled }
                        }
                      }))}
                      className={`px-3 py-1 rounded ${
                        track.enabled ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                    >
                      {track.enabled ? 'ON' : 'OFF'}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={track.volume}
                      onChange={(e) => setComposition(prev => ({
                        ...prev,
                        tracks: {
                          ...prev.tracks,
                          [trackName]: { ...track, volume: Number(e.target.value) }
                        }
                      }))}
                      className="w-24"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-16 gap-1">
                  {track.pattern.map((velocity, step) => (
                    <button
                      key={step}
                      onClick={() => toggleStep(trackName, step)}
                      className={`aspect-square rounded transition-all ${
                        velocity > 0 
                          ? 'bg-purple-500 shadow-lg' 
                          : 'bg-gray-700 hover:bg-gray-600'
                      } ${
                        composition.currentStep === step && composition.isPlaying
                          ? 'ring-2 ring-white'
                          : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {currentView === 'mixer' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center">Mixer</h2>
            
            <div className="grid grid-cols-4 gap-6">
              {Object.entries(composition.tracks).map(([trackName, track]) => (
                <div key={trackName} className="bg-black/30 rounded-xl p-4">
                  <h3 className="text-lg font-semibold capitalize mb-4">{trackName}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">Volume</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={track.volume}
                        onChange={(e) => setComposition(prev => ({
                          ...prev,
                          tracks: {
                            ...prev.tracks,
                            [trackName]: { ...track, volume: Number(e.target.value) }
                          }
                        }))}
                        className="w-full"
                      />
                      <div className="text-xs text-center mt-1">{track.volume}%</div>
                    </div>
                    
                    <button
                      onClick={() => setComposition(prev => ({
                        ...prev,
                        tracks: {
                          ...prev.tracks,
                          [trackName]: { ...track, enabled: !track.enabled }
                        }
                      }))}
                      className={`w-full py-2 rounded ${
                        track.enabled ? 'bg-green-600' : 'bg-red-600'
                      }`}
                    >
                      {track.enabled ? 'ENABLED' : 'MUTED'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom Controls */}
        <div className="fixed bottom-6 left-6 right-6">
          <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm">Tempo:</label>
                  <input
                    type="range"
                    min="60"
                    max="180"
                    value={composition.tempo}
                    onChange={(e) => setComposition(prev => ({ ...prev, tempo: Number(e.target.value) }))}
                    className="w-24"
                  />
                  <span className="text-sm w-12">{composition.tempo}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={composition.masterVolume}
                    onChange={(e) => setComposition(prev => ({ ...prev, masterVolume: Number(e.target.value) }))}
                    className="w-24"
                  />
                  <span className="text-sm w-12">{composition.masterVolume}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportComposition}
                  disabled={composition.isRecording}
                  className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4 inline mr-2" />
                  {composition.isRecording ? 'Recording...' : 'Export'}
                </button>
                
                <button
                  onClick={generateAIContent}
                  disabled={!isAIConnected || isGenerating}
                  className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                  ) : (
                    <Music className="w-4 h-4 inline mr-2" />
                  )}
                  Generate AI
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStudioInterface;