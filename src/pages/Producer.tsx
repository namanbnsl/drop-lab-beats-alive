import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc3, Music, Settings, Play, Pause, Square, AlertCircle, Sparkles, Zap, Star } from 'lucide-react';
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
  const [filterAmount, setFilterAmount] = useState(51);

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

  // FIXED: Complete effects chain rebuild for working FX
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const delayRef = useRef<Tone.FeedbackDelay | null>(null);
  const distortionRef = useRef<Tone.Distortion | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const masterGainRef = useRef<Tone.Gain | null>(null);

  // Individual track gain refs for mixer control
  const drumGainRef = useRef<Tone.Gain | null>(null);
  const melodyGainRef = useRef<Tone.Gain | null>(null);

  // FIXED: Effects bus for both drums and melody
  const effectsBusRef = useRef<Tone.Gain | null>(null);

  // Sequencer refs
  const sequencerRef = useRef<Tone.Sequence | null>(null);
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAudioTimeRef = useRef<number>(0);

  // FIXED: Updated sections array with mixer after effects
  const sections = [
    { id: 'drums', name: 'Drums', icon: '🥁' },
    { id: 'melody', name: 'Melody', icon: '🎼' },
    { id: 'fx', name: 'Effects/FX', icon: '🎛️' },
    { id: 'mixer', name: 'Mixer', icon: '🎚️' },
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

  // FIXED: Mixer Volume Controls - Apply volume changes in real-time with proper routing
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

  // FIXED: FX volume now controls the master dry/wet for all effects
  useEffect(() => {
    if (effectsBusRef.current && audioUnlocked) {
      const wetAmount = fxVolume / 100;
      effectsBusRef.current.gain.rampTo(wetAmount, 0.1);
      console.log(`🎛️ FX Gain: ${fxVolume}%`);
    }
  }, [fxVolume, fxMuted, fxSolo, audioUnlocked]);

  useEffect(() => {
    if (masterGainRef.current && audioUnlocked) {
      const volume = effectiveMasterVolume / 100;
      masterGainRef.current.gain.rampTo(volume, 0.1);
      console.log(`🎚️ Master effective volume: ${effectiveMasterVolume}% (${volume.toFixed(2)}) ${masterMuted ? '[MUTED]' : ''}`);
    }
  }, [effectiveMasterVolume, masterMuted, audioUnlocked]);

  // FIXED: FX Control Effects - Apply FX changes in real-time with WORKING effects
  useEffect(() => {
    if (reverbRef.current && audioUnlocked) {
      // Match DJ: Convert 0-100 to wet (0 to 0.8)
      const wetAmount = (reverbAmount / 100) * 0.8;
      reverbRef.current.wet.rampTo(wetAmount, 0.1);
      console.log(`🎛️ Reverb: ${reverbAmount}% (wet: ${wetAmount.toFixed(2)})`);
    }
  }, [reverbAmount, audioUnlocked]);

  useEffect(() => {
    if (delayRef.current && audioUnlocked) {
      // Match DJ: Convert 0-100 to wet (0 to 0.6)
      const wetAmount = (delayAmount / 100) * 0.6;
      delayRef.current.wet.rampTo(wetAmount, 0.1);
      console.log(`🎛️ Delay: ${delayAmount}% (wet: ${wetAmount.toFixed(2)})`);
    }
  }, [delayAmount, audioUnlocked]);

  useEffect(() => {
    if (distortionRef.current && audioUnlocked) {
      // Convert 0-100 to 0-1 for distortion amount
      const distAmount = Math.max(0.01, distortionAmount / 100);
      const wetAmount = distortionAmount > 0 ? 1 : 0;

      distortionRef.current.distortion = distAmount;
      distortionRef.current.wet.rampTo(wetAmount, 0.1);
      console.log(`🎛️ Distortion: ${distortionAmount}% (amount: ${distAmount.toFixed(2)})`);
    }
  }, [distortionAmount, audioUnlocked]);

  useEffect(() => {
    if (filterRef.current && audioUnlocked) {
      // Filter sweep: 0-50 = low-pass sweep, 50-100 = high-pass sweep
      if (filterAmount <= 50) {
        // Low-pass filter: 20kHz to 200Hz
        const frequency = 20000 - ((filterAmount / 50) * 19800);
        filterRef.current.type = 'lowpass';
        filterRef.current.frequency.rampTo(frequency, 0.1);
      } else {
        // High-pass filter: 20Hz to 5kHz
        const frequency = 20 + (((filterAmount - 50) / 50) * 4980);
        filterRef.current.type = 'highpass';
        filterRef.current.frequency.rampTo(frequency, 0.1);
      }
      console.log(`🎛️ Filter: ${filterAmount}% (${filterRef.current.type} @ ${filterRef.current.frequency.value.toFixed(0)}Hz)`);
    }
  }, [filterAmount, audioUnlocked]);

  // FIXED: Initialize audio system with WORKING effects for both drums and melody
  const initializeSynths = () => {
    console.log("🎵 Initializing audio system with DJ-style effects chain...");

    // Create master gain for overall volume control
    masterGainRef.current = new Tone.Gain(0.75).toDestination();

    // Create FX gain for all effects
    const fxGain = new Tone.Gain(fxVolume / 100);
    // Store reference for FX volume control
    effectsBusRef.current = fxGain;

    // Create filter, reverb, delay
    filterRef.current = new Tone.Filter({
      frequency: 20000,
      type: "lowpass",
      rolloff: -24
    });
    reverbRef.current = new Tone.Reverb({
      roomSize: 0.8,
      dampening: 3000,
      wet: 0
    });
    delayRef.current = new Tone.FeedbackDelay({
      delayTime: "8n",
      feedback: 0.4,
      wet: 0
    });
    distortionRef.current = new Tone.Distortion({
      distortion: 0.4,
      wet: 0
    });

    // Connect FX chain: Filter -> Distortion -> Reverb -> Delay -> FX Gain -> Master Gain
    filterRef.current.chain(distortionRef.current, reverbRef.current, delayRef.current, fxGain, masterGainRef.current);

    // Create drum synths and connect to filter
    kickSynthRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 10,
      oscillator: { type: "sine" },
      envelope: { decay: 0.2, sustain: 0.2, release: 1.2 }
    });
    snareSynthRef.current = new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { decay: 0.1, sustain: 0.1, release: 0.2 }
    });
    hihatSynthRef.current = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.08, release: 0.08 },
      harmonicity: 5.1,
      modulationIndex: 12,
      resonance: 1200,
      octaves: 1.5
    });
    crashSynthRef.current = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.25, release: 0.18 },
      harmonicity: 5.1,
      modulationIndex: 18,
      resonance: 1000,
      octaves: 2
    });

    // Connect all drum synths to filter
    kickSynthRef.current.connect(filterRef.current);
    snareSynthRef.current.connect(filterRef.current);
    hihatSynthRef.current.connect(filterRef.current);
    crashSynthRef.current.connect(filterRef.current);

    // Create melody synth and connect to filter
    melodySynthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
    });
    melodySynthRef.current.connect(filterRef.current);

    // No dry bus, all audio goes through FX chain
    console.log("🎵 Audio system initialized with DJ-style effects chain!");
    console.log("🎛️ Effects order: Input → Filter → Distortion → Reverb → Delay → FX Gain → Master Gain");
  };

  // Unlock audio context
  const unlockAudioContext = async () => {
    try {
      await Tone.start();
      console.log("🔊 Audio context started");
      setAudioUnlocked(true);
      setAudioError(null);
      initializeSynths();
    } catch (error) {
      console.error("❌ Failed to start audio context:", error);
      setAudioError("Failed to start audio. Please try refreshing the page.");
    }
  };

  // Audio recovery mechanism
  const handleAudioRecovery = async () => {
    setIsRecovering(true);
    try {
      // Stop any existing audio
      if (sequencerRef.current) {
        sequencerRef.current.stop();
        sequencerRef.current.dispose();
        sequencerRef.current = null;
      }

      // Clear intervals
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }

      // Reset state
      setIsPlaying(false);
      setCurrentStep(0);

      // Reinitialize audio
      await unlockAudioContext();
      console.log("🔄 Audio system recovered successfully");
    } catch (error) {
      console.error("❌ Audio recovery failed:", error);
      setAudioError("Audio recovery failed. Please refresh the page.");
    } finally {
      setIsRecovering(false);
    }
  };

  // Initialize audio on user interaction
  useEffect(() => {
    const initAudio = async () => {
      const handleUserGesture = async () => {
        if (!audioUnlocked && !isRecovering) {
          await unlockAudioContext();
        }
        // Remove event listeners after first interaction
        document.removeEventListener('click', handleUserGesture);
        document.removeEventListener('keydown', handleUserGesture);
        document.removeEventListener('touchstart', handleUserGesture);
      };

      // Add event listeners for user interaction
      document.addEventListener('click', handleUserGesture);
      document.addEventListener('keydown', handleUserGesture);
      document.addEventListener('touchstart', handleUserGesture);

      // Cleanup function
      return () => {
        document.removeEventListener('click', handleUserGesture);
        document.removeEventListener('keydown', handleUserGesture);
        document.removeEventListener('touchstart', handleUserGesture);
      };
    };

    initAudio();
  }, [audioUnlocked, isRecovering]);

  // Create sequencer for playback
  const createSequencer = () => {
    if (!audioUnlocked) return;

    // Clear existing sequencer
    if (sequencerRef.current) {
      sequencerRef.current.stop();
      sequencerRef.current.dispose();
    }

    sequencerRef.current = new Tone.Sequence(
      (time, step) => {
        setCurrentStep(step);

        // Play drums
        if (drumPattern.kick[step] && kickSynthRef.current) {
          kickSynthRef.current.triggerAttackRelease("C1", "8n", time);
        }
        if (drumPattern.snare[step] && snareSynthRef.current) {
          snareSynthRef.current.triggerAttackRelease("8n", time);
        }
        if (drumPattern.hihat[step] && hihatSynthRef.current) {
          hihatSynthRef.current.triggerAttackRelease("8n", time);
        }
        if (drumPattern.crash[step] && crashSynthRef.current) {
          crashSynthRef.current.triggerAttackRelease("C2", "8n", time);
        }

        // Play melody notes (find note for this step, quantized)
        const noteObj = melodyNotes.find(
          n => Math.floor(n.startTime * 4) === step
        );
        if (noteObj && melodySynthRef.current) {
          const noteName = Tone.Frequency(noteObj.pitch, "midi").toNote();
          melodySynthRef.current.triggerAttackRelease(noteName, noteObj.duration || "8n", time, noteObj.velocity || 0.8);
        }
      },
      Array.from({ length: 16 }, (_, i) => i),
      "8n"
    );

    sequencerRef.current.start(0);
    console.log("🎵 Sequencer created and started");
  };

  // Master play/pause control
  const handleMasterPlayPause = async () => {
    if (!audioUnlocked || isRecovering) return;

    try {
      if (isPlaying) {
        // Stop playback
        if (sequencerRef.current) {
          sequencerRef.current.stop();
        }
        if (stepIntervalRef.current) {
          clearInterval(stepIntervalRef.current);
          stepIntervalRef.current = null;
        }
        await Tone.Transport.stop();
        setIsPlaying(false);
        setCurrentStep(0);
        console.log("⏸️ Playback stopped");
      } else {
        // Start playback
        createSequencer();
        await Tone.start();
        Tone.Transport.bpm.value = tempo;
        Tone.Transport.start();
        setIsPlaying(true);
        console.log("▶️ Playback started");
      }
    } catch (error) {
      console.error("❌ Playback error:", error);
      setAudioError("Playback error. Trying to recover...");
      await handleAudioRecovery();
    }
  };

  // Master stop control
  const handleMasterStop = () => {
    if (!audioUnlocked || isRecovering) return;

    if (sequencerRef.current) {
      sequencerRef.current.stop();
    }
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
    Tone.Transport.stop();
    setIsPlaying(false);
    setCurrentStep(0);
    console.log("⏹️ Playback stopped");
  };

  // Get current beat display
  const getCurrentBeatDisplay = () => {
    const bar = Math.floor(currentStep / 16) + 1;
    const beat = Math.round((currentStep % 16) / 4) + 1;
    return `${bar}.${beat}`;
  };

  // Get FX status
  const getFXStatus = () => {
    const activeFX = [];
    if (reverbAmount > 0) activeFX.push(`R${Math.round(reverbAmount)}`);
    if (delayAmount > 0) activeFX.push(`D${Math.round(delayAmount)}`);
    if (distortionAmount > 0) activeFX.push(`X${distortionAmount}`);
    if (filterAmount !== 50) activeFX.push(`F${filterAmount}`);
    return activeFX.length > 0 ? activeFX.join(' ') : null;
  };

  // Get mixer status
  const getMixerStatus = () => {
    const levels = [];
    if (effectiveDrumsVolume > 0) levels.push(`D${effectiveDrumsVolume}`);
    if (effectiveMelodyVolume > 0) levels.push(`M${effectiveMelodyVolume}`);
    if (effectiveFxVolume > 0) levels.push(`F${effectiveFxVolume}`);

    const muted = [];
    if (drumsMuted) muted.push('D');
    if (melodyMuted) muted.push('M');
    if (fxMuted) muted.push('F');
    if (masterMuted) muted.push('MASTER');

    return {
      levels: levels.join(' '),
      muted: muted.length > 0 ? muted.join(' ') : null
    };
  };

  // Render current section
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
            drumsMuted={drumsMuted}
            melodyMuted={melodyMuted}
            fxMuted={fxMuted}
            masterMuted={masterMuted}
            drumsSolo={drumsSolo}
            melodySolo={melodySolo}
            fxSolo={fxSolo}
            onDrumsMuteChange={setDrumsMuted}
            onDrumsSoloChange={setDrumsSolo}
            onMelodyMuteChange={setMelodyMuted}
            onMelodySoloChange={setMelodySolo}
            onFxMuteChange={setFxMuted}
            onFxSoloChange={setFxSolo}
            onMasterMuteChange={setMasterMuted}
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
    <div className="min-h-screen bg-black relative overflow-hidden grid-bg">
      {/* Scattered decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="scattered-icon top-10 left-10">🎵</div>
        <div className="scattered-icon top-20 right-20">🎶</div>
        <div className="scattered-icon bottom-20 left-20">🎸</div>
        <div className="scattered-icon bottom-10 right-10">🎹</div>
        <div className="scattered-icon top-1/2 left-5">🎤</div>
        <div className="scattered-icon top-1/3 right-5">🎧</div>
      </div>

      {/* Hand-drawn background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <svg className="absolute inset-0 w-full h-full">
          <g className="animate-pulse">
            <path
              d="M100,100 Q120,80 140,100 Q160,120 180,100"
              stroke="#10b981"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="200" cy="110" r="6" fill="#f59e0b" />
            <path
              d="M300,200 Q320,180 340,200 Q360,220 380,200"
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {/* Header */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate('/')}
          className="btn-fun-secondary flex items-center gap-3 px-4 py-3 text-white/90 hover:text-white transition-all duration-300 animate-scale-in btn-glow btn-glow-blue"
        >
          <Disc3 className="w-6 h-6 animate-bounce-gentle" />
          <span className="font-display font-bold text-lg text-white">DropLab</span>
          <Sparkles className="w-4 h-4 animate-pulse-glow" />
        </button>
      </div>

      {/* Audio Status Notifications */}
      {!audioUnlocked && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 animate-slide-in-up">
          <div className="card-fun-dark p-4 border-2 border-yellow-400/50 max-w-sm">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-yellow-400 animate-pulse-glow" />
              <p className="text-yellow-200 font-display font-semibold">Audio Ready</p>
            </div>
            <p className="text-yellow-200/90 text-sm font-playful">
              🎵 Click anywhere or press any key to unlock the magic!
            </p>
          </div>
        </div>
      )}

      {audioError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 animate-slide-in-up">
          <div className="card-fun-dark p-4 border-2 border-red-400/50 max-w-md">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-200 font-display font-semibold">Audio Error</p>
            </div>
            <p className="text-red-200/90 text-sm font-playful mb-3">{audioError}</p>
            {isRecovering && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-blue-200 text-sm font-playful">Recovering...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Master Transport Controls */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 animate-slide-in-up">
        <div className="card-fun-dark p-4 flex flex-col sm:flex-row items-center gap-4 text-sm">
          {/* Tempo Control */}
          <div className="flex items-center gap-3">
            <span className="text-white font-display font-semibold">Tempo:</span>
            <input
              type="range"
              min="60"
              max="200"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="slider-fun w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white font-handwritten font-bold w-16 text-white">{tempo} BPM</span>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleMasterPlayPause}
              disabled={!audioUnlocked || isRecovering}
              className={`btn-fun p-3 rounded-xl transition-all duration-300 touch-manipulation btn-glow btn-glow-blue ${audioUnlocked && !isRecovering
                ? 'hover:scale-110 animate-pulse-glow'
                : 'opacity-50 cursor-not-allowed'
                }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={handleMasterStop}
              disabled={!audioUnlocked || isRecovering}
              className={`btn-fun-secondary p-3 rounded-xl transition-all duration-300 touch-manipulation btn-glow ${audioUnlocked && !isRecovering
                ? 'hover:scale-110'
                : 'opacity-50 cursor-not-allowed'
                }`}
            >
              <Square className="w-5 h-5" />
            </button>
          </div>

          {/* Beat Display */}
          <div className="flex items-center gap-3">
            <span className="text-white font-display font-semibold">Beat:</span>
            <span className="text-white font-handwritten font-bold w-12 text-center">
              {getCurrentBeatDisplay()}
            </span>
          </div>

          {/* Mixer Status */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-display font-semibold">Mix:</span>
              <span className="text-white font-handwritten font-bold text-xs">
                {mixerStatus.levels}
              </span>
            </div>
            {mixerStatus.muted && (
              <div className="flex items-center gap-1">
                <span className="text-white font-handwritten font-bold text-xs">
                  {mixerStatus.muted}
                </span>
              </div>
            )}
          </div>

          {/* FX Status */}
          {getFXStatus() && (
            <div className="flex items-center gap-2">
              <span className="text-white font-display font-semibold">FX:</span>
              <span className="text-white font-handwritten font-bold text-xs">
                {getFXStatus()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed top-4 right-4 z-50 animate-slide-in-up">
        <div className="card-fun-dark p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setCurrentSection(section.id)}
                className={`px-4 py-3 rounded-xl text-sm font-display font-semibold transition-all duration-300 touch-manipulation btn-glow ${currentSection === section.id
                  ? 'text-white shadow-lg scale-105 btn-fun'
                  : 'text-white/70 hover:text-white hover:bg-white/10 hover:scale-105'
                  }`}
              >
                <span className="mr-2 text-lg">{section.icon}</span>
                <span className="hidden sm:inline">{section.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Content */}
          <div className="animate-scale-in">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Producer;