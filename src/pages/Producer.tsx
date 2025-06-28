import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc3, Music, Settings, Play, Pause, Square, AlertCircle } from 'lucide-react';
import DrumSection from '../components/Producer/DrumSection';
import MelodySection from '../components/Producer/MelodySection';
import MixerSection from '../components/Producer/MixerSection';
import FXSection from '../components/Producer/FXSection';
import ExportSection from '../components/Producer/ExportSection';
import * as Tone from 'tone';

const Producer = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState('drums');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  // Mixer state
  const [melodyVolume, setMelodyVolume] = useState(70);
  const [drumsVolume, setDrumsVolume] = useState(80);
  const [fxVolume, setFxVolume] = useState(50);
  const [masterVolume, setMasterVolume] = useState(75);

  // FX state
  const [reverbAmount, setReverbAmount] = useState(0.3);
  const [delayAmount, setDelayAmount] = useState(0.2);

  // Export state
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);

  // Audio state
  const [drumPattern, setDrumPattern] = useState({
    kick: new Array(16).fill(false),
    snare: new Array(16).fill(false),
    hihat: new Array(16).fill(false),
    crash: new Array(16).fill(false)
  });
  const [melodyNotes, setMelodyNotes] = useState([]);

  // Centralized synth refs
  const kickSynthRef = useRef<Tone.MembraneSynth | null>(null);
  const snareSynthRef = useRef<Tone.NoiseSynth | null>(null);
  const hihatSynthRef = useRef<Tone.MetalSynth | null>(null);
  const crashSynthRef = useRef<Tone.MetalSynth | null>(null);
  const melodySynthRef = useRef<Tone.PolySynth | null>(null);

  // Sequencer refs
  const sequencerRef = useRef<Tone.Sequence | null>(null);
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAudioTimeRef = useRef<number>(0);

  const sections = [
    { id: 'drums', name: 'Drums', icon: '🥁' },
    { id: 'melody', name: 'Melody', icon: '🎼' },
    { id: 'mixer', name: 'Mixer', icon: '🎚️' },
    { id: 'fx', name: 'Effects', icon: '🎛️' },
    { id: 'export', name: 'Export', icon: '💾' }
  ];

  // Check if content has been generated
  useEffect(() => {
    const hasDrums = Object.values(drumPattern).some(pattern => pattern.some(step => step));
    const hasMelody = melodyNotes.length > 0;
    setHasGeneratedContent(hasDrums || hasMelody);
  }, [drumPattern, melodyNotes]);

  // Initialize all synths once
  useEffect(() => {
    const initializeSynths = () => {
      try {
        // Initialize drum synths
        kickSynthRef.current = new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 10,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
        }).toDestination();

        snareSynthRef.current = new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.005, decay: 0.1, sustain: 0.0, release: 0.4 }
        }).toDestination();

        hihatSynthRef.current = new Tone.MetalSynth({
          envelope: { attack: 0.001, decay: 0.1, sustain: 0.0, release: 0.01 },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5
        }).toDestination();

        crashSynthRef.current = new Tone.MetalSynth({
          envelope: { attack: 0.001, decay: 0.4, sustain: 0.0, release: 0.8 },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5
        }).toDestination();

        // Initialize melody synth
        melodySynthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.8 }
        }).toDestination();

        console.log('All synths initialized successfully');
      } catch (error) {
        console.error('Failed to initialize synths:', error);
        setAudioError('Failed to initialize audio synths');
      }
    };

    initializeSynths();

    return () => {
      // Cleanup synths on unmount
      if (kickSynthRef.current) kickSynthRef.current.dispose();
      if (snareSynthRef.current) snareSynthRef.current.dispose();
      if (hihatSynthRef.current) hihatSynthRef.current.dispose();
      if (crashSynthRef.current) crashSynthRef.current.dispose();
      if (melodySynthRef.current) melodySynthRef.current.dispose();
    };
  }, []);

  // Audio context unlocking function with better error handling
  const unlockAudioContext = async () => {
    if (audioUnlocked) return;

    try {
      setIsRecovering(true);
      setAudioError(null);

      // Check if context is suspended and resume if needed
      if (Tone.context.state === 'suspended') {
        await Tone.context.resume();
      }

      await Tone.start();
      console.log('Audio context unlocked successfully');
      setAudioUnlocked(true);
      setIsRecovering(false);
    } catch (error) {
      console.error('Failed to unlock audio context:', error);
      setAudioError('Failed to unlock audio. Please try clicking again.');
      setIsRecovering(false);
    }
  };

  // Audio health monitoring
  const checkAudioHealth = useCallback(() => {
    if (!isPlaying || !audioUnlocked) return;

    const currentTime = Tone.now();
    const timeSinceLastAudio = currentTime - lastAudioTimeRef.current;

    // If no audio has been triggered for more than 2 seconds while playing, there's an issue
    if (timeSinceLastAudio > 2 && isPlaying) {
      console.warn('Audio playback may have stopped unexpectedly');
      setAudioError('Audio playback interrupted. Attempting to recover...');
      handleAudioRecovery();
    }
  }, [isPlaying, audioUnlocked]);

  // Audio recovery function
  const handleAudioRecovery = async () => {
    try {
      setIsRecovering(true);

      // Stop current playback
      if (sequencerRef.current) {
        sequencerRef.current.stop();
        sequencerRef.current.dispose();
      }
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }

      // Resume audio context
      if (Tone.context.state === 'suspended') {
        await Tone.context.resume();
      }

      // Start transport first to establish valid timeline
      Tone.Transport.start();
      
      // Wait a small amount to ensure transport is running
      await new Promise(resolve => setTimeout(resolve, 10));

      // Create and start sequencer after transport is running
      const sequencer = createSequencer();
      sequencer.start(0);

      // Restart step counter with proper beat calculation
      const stepDuration = (60 / tempo) * 1000 / 4; // 16th note timing
      stepIntervalRef.current = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % 64);
      }, stepDuration);

      setAudioError(null);
      setIsRecovering(false);
      console.log('Audio recovered successfully');
    } catch (error) {
      console.error('Failed to recover audio:', error);
      setAudioError('Recovery failed. Please refresh the page.');
      setIsRecovering(false);
      setIsPlaying(false);
    }
  };

  // Initialize audio system with user gesture detection
  useEffect(() => {
    const initAudio = async () => {
      // Set up event listeners for user gestures
      const events = ['touchstart', 'touchend', 'mousedown', 'keydown', 'click'];

      const handleUserGesture = async () => {
        await unlockAudioContext();
        // Remove event listeners after first successful unlock
        events.forEach(event => {
          document.removeEventListener(event, handleUserGesture);
        });
      };

      events.forEach(event => {
        document.addEventListener(event, handleUserGesture, { once: true });
      });

      // Set initial tempo
      Tone.Transport.bpm.value = tempo;

      // Set up audio health monitoring
      audioCheckIntervalRef.current = setInterval(checkAudioHealth, 1000);
    };

    initAudio();

    return () => {
      if (audioCheckIntervalRef.current) {
        clearInterval(audioCheckIntervalRef.current);
      }
    };
  }, [checkAudioHealth]);

  // Update tempo
  useEffect(() => {
    if (audioUnlocked) {
      Tone.Transport.bpm.value = tempo;
    }
  }, [tempo, audioUnlocked]);

  // Create unified sequencer with centralized synth management
  const createSequencer = () => {
    // Clean up existing sequencer
    if (sequencerRef.current) {
      sequencerRef.current.stop();
      sequencerRef.current.dispose();
    }
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
    }

    // Create new sequencer with error handling and proper timing
    const sequencer = new Tone.Sequence((time, step) => {
      try {
        setCurrentStep(step);
        lastAudioTimeRef.current = Tone.now();

        const stepIndex = step % 16;

        // Play drums using centralized synths with proper timing
        if (drumPattern.kick[stepIndex] && kickSynthRef.current) {
          kickSynthRef.current.triggerAttackRelease('C2', '16n', time);
        }
        if (drumPattern.snare[stepIndex] && snareSynthRef.current) {
          snareSynthRef.current.triggerAttackRelease('16n', time);
        }
        if (drumPattern.hihat[stepIndex] && hihatSynthRef.current) {
          hihatSynthRef.current.triggerAttackRelease('C6', '16n', time);
        }
        if (drumPattern.crash[stepIndex] && crashSynthRef.current) {
          crashSynthRef.current.triggerAttackRelease('C5', '8n', time);
        }

        // Play melody notes using centralized synth with proper timing
        const notesToPlay = melodyNotes.filter(note =>
          Math.floor(note.startTime * 4) === stepIndex
        );

        notesToPlay.forEach(note => {
          if (melodySynthRef.current) {
            try {
              const noteName = Tone.Frequency(note.pitch, "midi").toNote();
              melodySynthRef.current.triggerAttackRelease(noteName, note.duration, time, note.velocity);
            } catch (error) {
              console.warn('Failed to play melody note:', error);
            }
          }
        });
      } catch (error) {
        console.error('Sequencer step error:', error);
        setAudioError('Audio playback error. Attempting to recover...');
        handleAudioRecovery();
      }
    }, Array.from({ length: 64 }, (_, i) => i), '16n');

    sequencerRef.current = sequencer;
    return sequencer;
  };

  // Master play/pause function with better error handling
  const handleMasterPlayPause = async () => {
    try {
      if (!audioUnlocked) {
        await unlockAudioContext();
        return;
      }

      if (isPlaying) {
        Tone.Transport.stop();
        setIsPlaying(false);
        setCurrentStep(0);
        if (stepIntervalRef.current) {
          clearInterval(stepIntervalRef.current);
        }
      } else {
        // Check audio context state before starting
        if (Tone.context.state === 'suspended') {
          await Tone.context.resume();
        }

        // Start transport first to establish valid timeline
        Tone.Transport.start();
        
        // Wait a small amount to ensure transport is running
        await new Promise(resolve => setTimeout(resolve, 10));

        // Create and start sequencer after transport is running
        const sequencer = createSequencer();
        sequencer.start(0);
        
        setIsPlaying(true);
        setAudioError(null);

        // Update step counter with proper timing
        const stepDuration = (60 / tempo) * 1000 / 4; // 16th note timing
        stepIntervalRef.current = setInterval(() => {
          setCurrentStep(prev => (prev + 1) % 64);
        }, stepDuration);
      }
    } catch (error) {
      console.error('Play/pause error:', error);
      setAudioError('Playback error. Please try again.');
      setIsPlaying(false);
    }
  };

  // Master stop function
  const handleMasterStop = () => {
    try {
      Tone.Transport.stop();
      Tone.Transport.position = 0;
      setIsPlaying(false);
      setCurrentStep(0);
      setAudioError(null);
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
      if (sequencerRef.current) {
        sequencerRef.current.stop();
        sequencerRef.current.dispose();
        sequencerRef.current = null;
      }
    } catch (error) {
      console.error('Stop error:', error);
    }
  };

  // Fixed beat display calculation
  const getCurrentBeatDisplay = () => {
    const bar = Math.floor(currentStep / 16) + 1;
    const beat = (currentStep % 16) + 1; // Beat starts at 1, not 0
    return `${bar}.${beat}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
      if (audioCheckIntervalRef.current) {
        clearInterval(audioCheckIntervalRef.current);
      }
      if (sequencerRef.current) {
        sequencerRef.current.dispose();
      }
    };
  }, []);

  const renderSection = () => {
    switch (currentSection) {
      case 'drums':
        return (
          <DrumSection
            onPlayDrums={() => { }}
            isPlaying={isPlaying}
            pattern={drumPattern}
            onPatternChange={setDrumPattern}
            currentStep={currentStep}
            tempo={tempo}
            onTempoChange={setTempo}
          />
        );
      case 'melody':
        return (
          <MelodySection
            onPlayMelody={() => { }}
            isPlaying={isPlaying}
            notes={melodyNotes}
            onNotesChange={setMelodyNotes}
            currentStep={currentStep}
            tempo={tempo}
            onTempoChange={setTempo}
          />
        );
      case 'mixer':
        return (
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
        );
      case 'fx':
        return (
          <FXSection
            reverbAmount={reverbAmount}
            delayAmount={delayAmount}
            onReverbChange={setReverbAmount}
            onDelayChange={setDelayAmount}
          />
        );
      case 'export':
        return (
          <ExportSection
            onExportMelody={() => { }}
            onExportDrums={() => { }}
            onExportAudio={() => { }}
            onPlayTrack={handleMasterPlayPause}
            hasGeneratedContent={hasGeneratedContent}
            isPlaying={isPlaying}
            isRecording={false}
            melodyNotes={melodyNotes}
            drumPattern={drumPattern}
            tempo={tempo}
          />
        );
      default:
        return (
          <DrumSection
            onPlayDrums={() => { }}
            isPlaying={isPlaying}
            pattern={drumPattern}
            onPatternChange={setDrumPattern}
            currentStep={currentStep}
            tempo={tempo}
            onTempoChange={setTempo}
          />
        );
    }
  };

  return (
    <div className="min-h-screen producer-bg text-gray-800 paper-texture">
      {/* Header */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate('/')}
          className="sketch-card px-4 py-2 touch-manipulation min-touch-target flex items-center gap-2 handwritten-text"
        >
          <Disc3 className="w-5 h-5" />
          <span className="font-semibold">DropLab</span>
        </button>
      </div>

      {/* Audio Status Notifications */}
      {!audioUnlocked && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 component-spacing">
          <div className="sketch-card p-4 max-w-sm highlight-yellow">
            <p className="handwritten-text text-gray-800 text-center">
              ✋ Click anywhere or press any key to unlock audio
            </p>
          </div>
        </div>
      )}

      {audioError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 component-spacing">
          <div className="sketch-card p-4 max-w-md highlight-pink">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="handwritten-text text-red-600 font-medium">Audio Error</p>
            </div>
            <p className="handwritten-small text-red-600">{audioError}</p>
            {isRecovering && (
              <p className="handwritten-small text-orange-600 mt-2">Recovering...</p>
            )}
          </div>
        </div>
      )}

      {/* Master Transport Controls */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 component-spacing">
        <div className="sketch-card p-3 flex flex-col sm:flex-row items-center gap-4 handwritten-text">
          <div className="flex items-center gap-2">
            <span className="text-gray-800">Tempo:</span>
            <input
              type="range"
              min="60"
              max="200"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="w-20 h-2 bg-gray-300 appearance-none cursor-pointer sketch-slider"
            />
            <span className="text-gray-800 w-16 handwritten-small">{tempo} BPM</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMasterPlayPause}
              disabled={!audioUnlocked || isRecovering}
              className={`p-2 transition-all duration-200 touch-manipulation min-touch-target ${audioUnlocked && !isRecovering
                ? 'btn-sketch-primary'
                : 'btn-sketch opacity-50 cursor-not-allowed'
                }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={handleMasterStop}
              disabled={!audioUnlocked || isRecovering}
              className={`p-2 transition-all duration-200 touch-manipulation min-touch-target ${audioUnlocked && !isRecovering
                ? 'btn-sketch'
                : 'btn-sketch opacity-50 cursor-not-allowed'
                }`}
            >
              <Square className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-800">Beat:</span>
            <span className="text-gray-800 font-mono w-12 handwritten-small marker-highlight">
              {getCurrentBeatDisplay()}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed top-4 right-4 z-50">
        <div className="sketch-card p-2">
          <div className="flex flex-col sm:flex-row gap-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setCurrentSection(section.id)}
                className={`px-3 py-2 handwritten-text font-medium transition-all duration-200 touch-manipulation min-touch-target ${currentSection === section.id
                  ? 'btn-sketch-primary'
                  : 'btn-sketch'
                  }`}
              >
                <span className="mr-2">{section.icon}</span>
                <span className="hidden sm:inline">{section.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24">
        {renderSection()}
      </div>
    </div>
  );
};

export default Producer;