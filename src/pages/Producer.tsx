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

  // Mixer mute/solo states
  const [drumsMuted, setDrumsMuted] = useState(false);
  const [melodyMuted, setMelodyMuted] = useState(false);
  const [fxMuted, setFxMuted] = useState(false);
  const [masterMuted, setMasterMuted] = useState(false);

  const [drumsSolo, setDrumsSolo] = useState(false);
  const [melodySolo, setMelodySolo] = useState(false);
  const [fxSolo, setFxSolo] = useState(false);

  // FX state
  const [reverbAmount, setReverbAmount] = useState(0);
  const [delayAmount, setDelayAmount] = useState(0);
  const [distortionAmount, setDistortionAmount] = useState(0);
  const [filterAmount, setFilterAmount] = useState(50);

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

  // FX refs for proper audio routing
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const delayRef = useRef<Tone.FeedbackDelay | null>(null);
  const distortionRef = useRef<Tone.Distortion | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const masterGainRef = useRef<Tone.Gain | null>(null);

  // Individual track gain refs for mixer control
  const drumGainRef = useRef<Tone.Gain | null>(null);
  const melodyGainRef = useRef<Tone.Gain | null>(null);
  const fxGainRef = useRef<Tone.Gain | null>(null);

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

  // Calculate effective volumes considering mute/solo states
  const getEffectiveVolume = (volume: number, isMuted: boolean, isSolo: boolean, anySolo: boolean) => {
    if (isMuted || masterMuted) return 0;
    if (anySolo && !isSolo) return 0; // If any channel is solo'd and this isn't it, mute this
    return volume;
  };

  const anySolo = drumsSolo || melodySolo || fxSolo;
  const effectiveDrumsVolume = getEffectiveVolume(drumsVolume, drumsMuted, drumsSolo, anySolo);
  const effectiveMelodyVolume = getEffectiveVolume(melodyVolume, melodyMuted, melodySolo, anySolo);
  const effectiveFxVolume = getEffectiveVolume(fxVolume, fxMuted, fxSolo, anySolo);
  const effectiveMasterVolume = masterMuted ? 0 : masterVolume;

  // Mixer Volume Controls - Apply volume changes in real-time with mute/solo logic
  useEffect(() => {
    if (drumGainRef.current && audioUnlocked) {
      const volume = effectiveDrumsVolume / 100;
      drumGainRef.current.gain.rampTo(volume, 0.1);
      console.log(`🎚️ Drums effective volume: ${effectiveDrumsVolume}% (${volume.toFixed(2)}) ${drumsMuted ? '[MUTED]' : ''} ${drumsSolo ? '[SOLO]' : ''}`);
    }
  }, [effectiveDrumsVolume, drumsMuted, drumsSolo, audioUnlocked]);

  useEffect(() => {
    if (melodyGainRef.current && audioUnlocked) {
      const volume = effectiveMelodyVolume / 100;
      melodyGainRef.current.gain.rampTo(volume, 0.1);
      console.log(`🎚️ Melody effective volume: ${effectiveMelodyVolume}% (${volume.toFixed(2)}) ${melodyMuted ? '[MUTED]' : ''} ${melodySolo ? '[SOLO]' : ''}`);
    }
  }, [effectiveMelodyVolume, melodyMuted, melodySolo, audioUnlocked]);

  useEffect(() => {
    if (fxGainRef.current && audioUnlocked) {
      const volume = effectiveFxVolume / 100;
      fxGainRef.current.gain.rampTo(volume, 0.1);
      console.log(`🎚️ FX effective volume: ${effectiveFxVolume}% (${volume.toFixed(2)}) ${fxMuted ? '[MUTED]' : ''} ${fxSolo ? '[SOLO]' : ''}`);
    }
  }, [effectiveFxVolume, fxMuted, fxSolo, audioUnlocked]);

  useEffect(() => {
    if (masterGainRef.current && audioUnlocked) {
      const volume = effectiveMasterVolume / 100;
      masterGainRef.current.gain.rampTo(volume, 0.1);
      console.log(`🎚️ Master effective volume: ${effectiveMasterVolume}% (${volume.toFixed(2)}) ${masterMuted ? '[MUTED]' : ''}`);
    }
  }, [effectiveMasterVolume, masterMuted, audioUnlocked]);

  // FX Control Effects - Apply FX changes in real-time
  useEffect(() => {
    if (reverbRef.current && audioUnlocked) {
      reverbRef.current.wet.rampTo(reverbAmount, 0.1);
      console.log(`🎛️ Reverb: ${Math.round(reverbAmount * 100)}%`);
    }
  }, [reverbAmount, audioUnlocked]);

  useEffect(() => {
    if (delayRef.current && audioUnlocked) {
      delayRef.current.wet.rampTo(delayAmount, 0.1);
      console.log(`🎛️ Delay: ${Math.round(delayAmount * 100)}%`);
    }
  }, [delayAmount, audioUnlocked]);

  useEffect(() => {
    if (distortionRef.current && audioUnlocked) {
      distortionRef.current.wet.rampTo(distortionAmount / 100, 0.1);
      distortionRef.current.distortion = Math.max(0.01, distortionAmount / 100);
      console.log(`🎛️ Distortion: ${distortionAmount}%`);
    }
  }, [distortionAmount, audioUnlocked]);

  useEffect(() => {
    if (filterRef.current && audioUnlocked) {
      // Filter sweep: 0-50 = low-pass sweep, 50-100 = high-pass sweep
      if (filterAmount <= 50) {
        // Low-pass filter: 20Hz to 20kHz
        const frequency = 20 + ((filterAmount / 50) * 19980);
        filterRef.current.type = 'lowpass';
        filterRef.current.frequency.rampTo(frequency, 0.1);
      } else {
        // High-pass filter: 20Hz to 5kHz
        const frequency = 20 + (((filterAmount - 50) / 50) * 4980);
        filterRef.current.type = 'highpass';
        filterRef.current.frequency.rampTo(frequency, 0.1);
      }
      console.log(`🎛️ Filter: ${filterAmount}% (${filterRef.current.type})`);
    }
  }, [filterAmount, audioUnlocked]);

  // Initialize all synths and FX chain once
  useEffect(() => {
    const initializeSynths = () => {
      try {
        // Initialize individual track gains for mixer control
        drumGainRef.current = new Tone.Gain(0.8);
        melodyGainRef.current = new Tone.Gain(0.7);
        
        // Initialize FX chain
        filterRef.current = new Tone.Filter(20000, 'lowpass');
        distortionRef.current = new Tone.Distortion(0.4);
        reverbRef.current = new Tone.Reverb(2);
        delayRef.current = new Tone.FeedbackDelay('8n', 0.3);
        fxGainRef.current = new Tone.Gain(0.5);
        masterGainRef.current = new Tone.Gain(0.75);

        // Create a mixer bus that combines drum and melody signals
        const mixerBus = new Tone.Gain(1);
        
        // Connect individual tracks to mixer bus
        drumGainRef.current.connect(mixerBus);
        melodyGainRef.current.connect(mixerBus);
        
        // Connect mixer bus through FX chain to master output
        mixerBus.chain(
          filterRef.current,
          distortionRef.current,
          reverbRef.current,
          delayRef.current,
          fxGainRef.current,
          masterGainRef.current
        );
        
        masterGainRef.current.toDestination();

        // Set initial FX values
        reverbRef.current.wet.value = 0;
        delayRef.current.wet.value = 0;
        distortionRef.current.wet.value = 0;

        // Initialize drum synths and connect to drum gain
        kickSynthRef.current = new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 10,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
        }).connect(drumGainRef.current);

        snareSynthRef.current = new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.005, decay: 0.1, sustain: 0.0, release: 0.4 }
        }).connect(drumGainRef.current);

        hihatSynthRef.current = new Tone.MetalSynth({
          envelope: { attack: 0.001, decay: 0.1, sustain: 0.0, release: 0.01 },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5
        }).connect(drumGainRef.current);

        crashSynthRef.current = new Tone.MetalSynth({
          envelope: { attack: 0.001, decay: 0.4, sustain: 0.0, release: 0.8 },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5
        }).connect(drumGainRef.current);

        // Initialize melody synth and connect to melody gain
        melodySynthRef.current = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.8 }
        }).connect(melodyGainRef.current);

        console.log('✅ All synths and FX chain initialized successfully');
        console.log('🎛️ Audio routing: Drums/Melody → Individual Gains → Mixer Bus → Filter → Distortion → Reverb → Delay → FX Gain → Master Gain → Output');
        console.log('🎚️ Mixer controls are now active and will affect audio levels');
      } catch (error) {
        console.error('Failed to initialize synths and FX:', error);
        setAudioError('Failed to initialize audio synths and effects');
      }
    };

    initializeSynths();

    return () => {
      // Cleanup synths and FX on unmount
      if (kickSynthRef.current) kickSynthRef.current.dispose();
      if (snareSynthRef.current) snareSynthRef.current.dispose();
      if (hihatSynthRef.current) hihatSynthRef.current.dispose();
      if (crashSynthRef.current) crashSynthRef.current.dispose();
      if (melodySynthRef.current) melodySynthRef.current.dispose();
      if (drumGainRef.current) drumGainRef.current.dispose();
      if (melodyGainRef.current) melodyGainRef.current.dispose();
      if (fxGainRef.current) fxGainRef.current.dispose();
      if (reverbRef.current) reverbRef.current.dispose();
      if (delayRef.current) delayRef.current.dispose();
      if (distortionRef.current) distortionRef.current.dispose();
      if (filterRef.current) filterRef.current.dispose();
      if (masterGainRef.current) masterGainRef.current.dispose();
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
      
      // Apply current mixer settings after audio is unlocked
      if (drumGainRef.current) drumGainRef.current.gain.value = effectiveDrumsVolume / 100;
      if (melodyGainRef.current) melodyGainRef.current.gain.value = effectiveMelodyVolume / 100;
      if (fxGainRef.current) fxGainRef.current.gain.value = effectiveFxVolume / 100;
      if (masterGainRef.current) masterGainRef.current.gain.value = effectiveMasterVolume / 100;
      
      console.log('🎚️ Mixer levels applied after audio unlock');
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

  // Get FX status for display
  const getFXStatus = () => {
    const fxActive = [];
    if (reverbAmount > 0.1) fxActive.push('REV');
    if (delayAmount > 0.1) fxActive.push('DLY');
    if (distortionAmount > 10) fxActive.push('DIST');
    if (filterAmount !== 50) fxActive.push('FILT');
    return fxActive.join(' + ');
  };

  // Get mixer status for display
  const getMixerStatus = () => {
    const status = [];
    if (anySolo) {
      if (drumsSolo) status.push('D:SOLO');
      if (melodySolo) status.push('M:SOLO');
      if (fxSolo) status.push('F:SOLO');
    } else {
      status.push(`D:${effectiveDrumsVolume}`);
      status.push(`M:${effectiveMelodyVolume}`);
      status.push(`F:${effectiveFxVolume}`);
    }
    status.push(`⚡:${effectiveMasterVolume}`);
    
    const muted = [];
    if (drumsMuted) muted.push('D:MUTE');
    if (melodyMuted) muted.push('M:MUTE');
    if (fxMuted) muted.push('F:MUTE');
    if (masterMuted) muted.push('⚡:MUTE');
    
    return { levels: status.join(' '), muted: muted.join(' ') };
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
            distortionAmount={distortionAmount}
            filterAmount={filterAmount}
            onReverbChange={setReverbAmount}
            onDelayChange={setDelayAmount}
            onDistortionChange={setDistortionAmount}
            onFilterChange={setFilterAmount}
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

  const mixerStatus = getMixerStatus();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-50">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-md rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base touch-manipulation"
        >
          <Disc3 className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="font-bold">DropLab</span>
        </button>
      </div>

      {/* Audio Status Notifications */}
      {!audioUnlocked && (
        <div className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-50 px-4">
          <div className="bg-yellow-900/90 backdrop-blur-md rounded-lg p-3 sm:p-4 border border-yellow-500/50 max-w-sm">
            <p className="text-yellow-200 text-xs sm:text-sm text-center">
              🔊 Click anywhere or press any key to unlock audio
            </p>
          </div>
        </div>
      )}

      {audioError && (
        <div className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-50 px-4">
          <div className="bg-red-900/90 backdrop-blur-md rounded-lg p-3 sm:p-4 border border-red-500/50 max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-300" />
              <p className="text-red-200 text-xs sm:text-sm font-medium">Audio Error</p>
            </div>
            <p className="text-red-200 text-xs sm:text-sm">{audioError}</p>
            {isRecovering && (
              <p className="text-yellow-200 text-xs mt-2">Recovering...</p>
            )}
          </div>
        </div>
      )}

      {/* Master Transport Controls */}
      <div className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 px-4">
        <div className="bg-black/30 backdrop-blur-md rounded-lg p-2 sm:p-3 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-white">Tempo:</span>
            <input
              type="range"
              min="60"
              max="200"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="w-16 sm:w-20 h-1 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white w-12 sm:w-16">{tempo} BPM</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMasterPlayPause}
              disabled={!audioUnlocked || isRecovering}
              className={`p-2 rounded-lg transition-colors touch-manipulation ${audioUnlocked && !isRecovering
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
            >
              {isPlaying ? <Pause className="w-3 h-3 sm:w-4 sm:h-4" /> : <Play className="w-3 h-3 sm:w-4 sm:h-4" />}
            </button>
            <button
              onClick={handleMasterStop}
              disabled={!audioUnlocked || isRecovering}
              className={`p-2 rounded-lg transition-colors touch-manipulation ${audioUnlocked && !isRecovering
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
            >
              <Square className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white">Beat:</span>
            <span className="text-purple-400 font-mono w-8 sm:w-12">
              {getCurrentBeatDisplay()}
            </span>
          </div>

          {/* Enhanced Mixer Status Indicator */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span className="text-white">Mix:</span>
              <span className="text-blue-400 font-mono text-xs">
                {mixerStatus.levels}
              </span>
            </div>
            {mixerStatus.muted && (
              <div className="flex items-center gap-1">
                <span className="text-red-400 font-mono text-xs">
                  {mixerStatus.muted}
                </span>
              </div>
            )}
          </div>

          {/* FX Status Indicator */}
          {getFXStatus() && (
            <div className="flex items-center gap-2">
              <span className="text-white">FX:</span>
              <span className="text-green-400 font-mono text-xs">
                {getFXStatus()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed top-2 sm:top-4 right-2 sm:right-4 z-50">
        <div className="bg-black/30 backdrop-blur-md rounded-lg p-2">
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setCurrentSection(section.id)}
                className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors touch-manipulation ${currentSection === section.id
                  ? 'bg-purple-600 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span className="mr-1 sm:mr-2">{section.icon}</span>
                <span className="hidden sm:inline">{section.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 sm:pt-24">
        {renderSection()}
      </div>
    </div>
  );
};

export default Producer;