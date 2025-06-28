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
  const [isRecording, setIsRecording] = useState(false);

  // Audio state
  const [drumPattern, setDrumPattern] = useState({
    kick: new Array(16).fill(false),
    snare: new Array(16).fill(false),
    hihat: new Array(16).fill(false),
    crash: new Array(16).fill(false)
  });
  const [melodyNotes, setMelodyNotes] = useState([]);

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

      // Restart sequencer
      const sequencer = createSequencer();
      sequencer.start(0);
      Tone.Transport.start();

      // Restart step counter
      stepIntervalRef.current = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % 64);
      }, (60 / tempo) * 1000 / 4);

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

  // Create unified sequencer with better error handling
  const createSequencer = () => {
    // Clean up existing sequencer
    if (sequencerRef.current) {
      sequencerRef.current.stop();
      sequencerRef.current.dispose();
    }
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
    }

    // Create new sequencer with error handling
    const sequencer = new Tone.Sequence((time, step) => {
      try {
        setCurrentStep(step);
        lastAudioTimeRef.current = Tone.now();

        // Play drums with error handling
        if (drumPattern.kick[step % 16]) {
          try {
            const kickSynth = new Tone.MembraneSynth().toDestination();
            kickSynth.triggerAttackRelease('C2', '16n', time);
          } catch (error) {
            console.warn('Failed to play kick:', error);
          }
        }
        if (drumPattern.snare[step % 16]) {
          try {
            const snareSynth = new Tone.NoiseSynth().toDestination();
            snareSynth.triggerAttackRelease('16n', time);
          } catch (error) {
            console.warn('Failed to play snare:', error);
          }
        }
        if (drumPattern.hihat[step % 16]) {
          try {
            const hihatSynth = new Tone.MetalSynth().toDestination();
            hihatSynth.triggerAttackRelease('C6', '16n', time);
          } catch (error) {
            console.warn('Failed to play hihat:', error);
          }
        }
        if (drumPattern.crash[step % 16]) {
          try {
            const crashSynth = new Tone.MetalSynth().toDestination();
            crashSynth.triggerAttackRelease('C5', '8n', time);
          } catch (error) {
            console.warn('Failed to play crash:', error);
          }
        }

        // Play melody notes with error handling
        const stepTime = step * 0.25; // 16th note timing
        const notesToPlay = melodyNotes.filter(note =>
          Math.floor(note.startTime * 4) === (step % 16)
        );

        notesToPlay.forEach(note => {
          try {
            const melodySynth = new Tone.Synth().toDestination();
            const noteName = Tone.Frequency(note.pitch, "midi").toNote();
            melodySynth.triggerAttackRelease(noteName, note.duration, time, note.velocity);
          } catch (error) {
            console.warn('Failed to play melody note:', error);
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

        const sequencer = createSequencer();
        sequencer.start(0);
        Tone.Transport.start();
        setIsPlaying(true);
        setAudioError(null);

        // Update step counter
        stepIntervalRef.current = setInterval(() => {
          setCurrentStep(prev => (prev + 1) % 64);
        }, (60 / tempo) * 1000 / 4); // 16th note timing
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
            isRecording={isRecording}
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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-md rounded-lg px-4 py-2"
        >
          <Disc3 className="w-6 h-6" />
          <span className="font-bold">DropLab</span>
        </button>
      </div>

      {/* Audio Status Notifications */}
      {!audioUnlocked && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-yellow-900/90 backdrop-blur-md rounded-lg p-4 border border-yellow-500/50">
            <p className="text-yellow-200 text-sm text-center">
              🔊 Click anywhere or press any key to unlock audio
            </p>
          </div>
        </div>
      )}

      {audioError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-900/90 backdrop-blur-md rounded-lg p-4 border border-red-500/50 max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-300" />
              <p className="text-red-200 text-sm font-medium">Audio Error</p>
            </div>
            <p className="text-red-200 text-sm">{audioError}</p>
            {isRecovering && (
              <p className="text-yellow-200 text-xs mt-2">Recovering...</p>
            )}
          </div>
        </div>
      )}

      {/* Master Transport Controls */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black/30 backdrop-blur-md rounded-lg p-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">Tempo:</span>
            <input
              type="range"
              min="60"
              max="200"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-white text-sm w-12">{tempo} BPM</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMasterPlayPause}
              disabled={!audioUnlocked || isRecovering}
              className={`p-2 rounded-lg transition-colors ${audioUnlocked && !isRecovering
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={handleMasterStop}
              disabled={!audioUnlocked || isRecovering}
              className={`p-2 rounded-lg transition-colors ${audioUnlocked && !isRecovering
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
            >
              <Square className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white text-sm">Step:</span>
            <span className="text-purple-400 text-sm font-mono w-8">
              {Math.floor(currentStep / 16) + 1}.{(currentStep % 16) + 1}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-black/30 backdrop-blur-md rounded-lg p-2">
          <div className="flex gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setCurrentSection(section.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentSection === section.id
                  ? 'bg-purple-600 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.name}
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