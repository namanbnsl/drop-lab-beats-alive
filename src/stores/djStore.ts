import { create } from 'zustand';
import { DeckAudioEngine } from '../lib/deckAudioEngine';
import { snapBPMToCommon, BPMInfo } from '../lib/bpmDetector';
import * as Tone from 'tone';

interface Track {
  name: string;
  bpm: number;
  key: string;
  url?: string;
  originalBPM?: number; // Auto-detected original BPM
}

interface DeckState {
  isPlaying: boolean;
  track: Track | null;
  pitch: number;
  eq: { low: number; mid: number; high: number };
  volume: number;
  fx: { filter: number; reverb: number; delay: number };
  isSyncing: boolean;
  bpmInfo?: BPMInfo;
  gridPosition?: { bar: number; beat: number; isAligned: boolean; isQueued: boolean };
}

interface FXState {
  filter: number;
  reverb: number;
  delay: number;
  assignedTo: 'A' | 'B' | 'BOTH';
}

interface DJState {
  // Audio engines
  deckA: DeckAudioEngine | null;
  deckB: DeckAudioEngine | null;
  
  // Deck states
  deckAState: DeckState;
  deckBState: DeckState;
  
  // Mixer
  crossfader: number;
  
  // Global FX
  fx: FXState;
  
  // Global BPM Control (Backend Metronome)
  globalBPM: number;
  bpmSyncEnabled: boolean;
  
  // Transport for sync (Backend Metronome at 128 BPM)
  isTransportRunning: boolean;
  masterGridPosition: { bar: number; beat: number };
  metronomeClickEnabled: boolean;
  
  // Metronome audio
  metronomeClick: Tone.Player | null;
  
  // Audio context state
  audioUnlocked: boolean;
  audioError: string | null;
  
  // Actions
  initializeAudio: () => Promise<void>;
  unlockAudioContext: () => Promise<void>;
  playDeck: (deck: 'A' | 'B') => void;
  pauseDeck: (deck: 'A' | 'B') => void;
  loadTrack: (deck: 'A' | 'B', track: Track) => Promise<void>;
  setPitch: (deck: 'A' | 'B', value: number) => void;
  setEQ: (deck: 'A' | 'B', eq: { low: number; mid: number; high: number }) => void;
  setVolume: (deck: 'A' | 'B', value: number) => void;
  setCrossfader: (value: number) => void;
  setFX: (fx: Partial<FXState>) => void;
  setDeckFX: (deck: 'A' | 'B', fx: Partial<{ filter: number; reverb: number; delay: number }>) => void;
  scrubTrack: (deck: 'A' | 'B', velocity: number) => void;
  triggerBackspin: (deck: 'A' | 'B') => void;
  bendTempo: (deck: 'A' | 'B', rate: number) => void;
  syncDecks: () => void;
  reSnapToGrid: (deck: 'A' | 'B') => void;
  updateGridPositions: () => void;
  toggleMetronomeClick: () => void;
  cleanup: () => void;
}

const defaultDeckState: DeckState = {
  isPlaying: false,
  track: null,
  pitch: 0,
  eq: { low: 50, mid: 50, high: 50 },
  volume: 75,
  fx: { filter: 50, reverb: 0, delay: 0 },
  isSyncing: false,
  gridPosition: { bar: 1, beat: 1, isAligned: false, isQueued: false },
};

export const useDJStore = create<DJState>((set, get) => ({
  deckA: null,
  deckB: null,
  
  deckAState: defaultDeckState,
  deckBState: defaultDeckState,
  
  crossfader: 50,
  fx: { filter: 50, reverb: 0, delay: 0, assignedTo: 'BOTH' },
  globalBPM: 128, // Backend metronome fixed at 128 BPM
  bpmSyncEnabled: true,
  isTransportRunning: false,
  masterGridPosition: { bar: 1, beat: 1 },
  metronomeClickEnabled: false,
  metronomeClick: null,
  audioUnlocked: false,
  audioError: null,

  initializeAudio: async () => {
    try {
      // Only proceed if audio context is unlocked
      if (!get().audioUnlocked) {
        console.log("🔒 Audio context not unlocked yet, waiting for user gesture");
        return;
      }

      // Ensure audio context is ready
      await Tone.start();
      
      // Wait a moment for context to stabilize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const deckA = new DeckAudioEngine();
      const deckB = new DeckAudioEngine();
      
      // Initialize metronome without click sound to avoid base64 errors
      const metronomeClick = null;
      
      // 🎯 Initialize backend metronome at 128 BPM with precise timing
      Tone.Transport.bpm.value = 128;
      Tone.Transport.position = 0; // Reset position to bar 1, beat 1
      Tone.Transport.loop = false; // Continuous running
      Tone.Transport.loopStart = 0;
      Tone.Transport.loopEnd = "1m"; // Loop every measure for consistent timing
      
      // Create metronome sequence for visual feedback and optional click
      const metronomeSequence = new Tone.Sequence((time, beat) => {
        const state = get();
        
        // Update master grid position
        const currentBar = Math.floor(Tone.Transport.position.split(':')[0]) + 1;
        const currentBeat = beat + 1;
        
        set({ masterGridPosition: { bar: currentBar, beat: currentBeat } });
        
        // Play metronome click if enabled (disabled for now to fix base64 errors)
        // if (state.metronomeClickEnabled && state.metronomeClick) {
        //   // Metronome click functionality removed
        // }
        
        console.log(`🎯 Backend Metronome: Bar ${currentBar}, Beat ${currentBeat}`);
      }, [0, 1, 2, 3], "4n");
      
      metronomeSequence.start(0);
      
      // Start transport immediately for backend metronome
      if (Tone.Transport.state !== 'started') {
        Tone.Transport.start("+0.01"); // Very small delay for stability
      }
      
      set({ 
        deckA, 
        deckB, 
        isTransportRunning: true,
        metronomeClick
      });
      
      // Start grid position updates with high frequency for smooth feedback
      get().updateGridPositions();
      
      console.log('🎧 DJ Audio System Initialized');
      console.log('🎯 Backend Metronome @ 128 BPM - All tracks will sync to this grid');
      console.log(`⏰ Transport State: ${Tone.Transport.state}, BPM: ${Tone.Transport.bpm.value}`);
      console.log('🔄 Metronome sequence started for continuous sync');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      set({ audioError: "Failed to initialize audio system. Please try again." });
    }
  },

  updateGridPositions: () => {
    const state = get();
    
    if (!state.isTransportRunning) return;
    
    try {
      // Update master grid position with high precision
      const transportTime = Tone.Transport.seconds;
      const beatDuration = 60 / 128; // 128 BPM beat duration
      const currentBeat = Math.floor(transportTime / beatDuration);
      const bar = Math.floor(currentBeat / 4) + 1;
      const beat = (currentBeat % 4) + 1;
      
      set({ masterGridPosition: { bar, beat } });
      
      // Update deck grid positions
      if (state.deckA) {
        const deckAGrid = state.deckA.getGridPosition();
        set({
          deckAState: {
            ...state.deckAState,
            gridPosition: deckAGrid
          }
        });
      }
      
      if (state.deckB) {
        const deckBGrid = state.deckB.getGridPosition();
        set({
          deckBState: {
            ...state.deckBState,
            gridPosition: deckBGrid
          }
        });
      }
      
      // Continue updating every 50ms for smooth feedback
      setTimeout(() => get().updateGridPositions(), 50);
    } catch (error) {
      console.error('Grid position update error:', error);
      // Continue updating even if there's an error
      setTimeout(() => get().updateGridPositions(), 100);
    }
  },

  playDeck: (deck) => {
    const state = get();
    
    // Check if audio is unlocked
    if (!state.audioUnlocked) {
      console.log("🔒 Audio not unlocked, cannot play deck");
      return;
    }
    
    const engine = deck === 'A' ? state.deckA : state.deckB;
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    
    if (engine && engine.isLoaded) {
      // Ensure backend metronome is running
      if (!state.isTransportRunning || Tone.Transport.state !== 'started') {
        Tone.Transport.bpm.value = 128;
        if (Tone.Transport.state !== 'started') {
          Tone.Transport.start();
        }
        set({ isTransportRunning: true });
        get().updateGridPositions();
        console.log('🎯 Backend Metronome ensured running at 128 BPM');
      }

      // ⚡ BEAT-ALIGNED PLAY: Engine will wait for next bar to start
      engine.play();
      
      const bpmInfo = engine.getBPMInfo();
      const gridPosition = engine.getGridPosition();
      
      set({
        [deckState]: {
          ...state[deckState],
          isPlaying: engine.isPlaying, // Use engine's actual playing state
          bpmInfo,
          gridPosition
        },
      });
      
      if (gridPosition.isQueued) {
        console.log(`⚡ Deck ${deck} queued for next bar sync play`);
      } else {
        console.log(`▶️ Deck ${deck} manual play at 128 BPM`);
      }
    }
  },

  pauseDeck: (deck) => {
    const state = get();
    
    // Check if audio is unlocked
    if (!state.audioUnlocked) {
      console.log("🔒 Audio not unlocked, cannot pause deck");
      return;
    }
    
    const engine = deck === 'A' ? state.deckA : state.deckB;
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    
    if (engine) {
      console.log(`⏸️ Pausing Deck ${deck} - Engine playing state: ${engine.isPlaying}`);
      engine.pause();
      const gridPosition = engine.getGridPosition();
      
      set({
        [deckState]: {
          ...state[deckState],
          isPlaying: engine.isPlaying, // Use engine's actual playing state
          gridPosition
        },
      });
      
      console.log(`⏸️ Deck ${deck} paused - New state: ${engine.isPlaying}`);
    }
  },

  loadTrack: async (deck, track) => {
    const state = get();
    
    // Check if audio is unlocked
    if (!state.audioUnlocked) {
      console.log("🔒 Audio not unlocked, cannot load track");
      return;
    }
    
    const engine = deck === 'A' ? state.deckA : state.deckB;
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    
    if (engine && track.url) {
      // Ensure backend metronome is running before loading
      if (!state.isTransportRunning || Tone.Transport.state !== 'started') {
        await get().initializeAudio();
        // Wait for transport to stabilize
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Use the provided BPM as the original BPM for auto-sync calculation
      const originalBPM = track.bpm;
      const targetBPM = 128; // Always sync to 128 BPM backend metronome
      
      // Create track with original BPM
      const trackWithBPM = { ...track, originalBPM };
      
      const loaded = await engine.loadTrack(track.url, originalBPM);
      if (loaded) {
        // Force auto-sync to 128 BPM immediately
        engine.setGlobalBPMSync(targetBPM, originalBPM);
        
        const playbackRate = (targetBPM / originalBPM).toFixed(3);
        console.log(`🎯 Auto-sync Deck ${deck}: ${originalBPM} BPM → ${targetBPM} BPM (${playbackRate}x rate)`);
        
        // Wait a moment for beat snapping to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const bpmInfo = engine.getBPMInfo();
        const gridPosition = engine.getGridPosition();
        
        set({
          [deckState]: {
            ...state[deckState],
            track: trackWithBPM,
            isPlaying: engine.isPlaying, // Use engine's actual playing state
            bpmInfo,
            gridPosition
          }
        });
        
        console.log(`✅ "${track.name}" loaded to Deck ${deck} and synced to backend metronome`);
        console.log(`🎯 Grid Status: Bar ${gridPosition.bar}, Beat ${gridPosition.beat}, Aligned: ${gridPosition.isAligned}, Queued: ${gridPosition.isQueued}`);
      }
    }
  },

  reSnapToGrid: (deck) => {
    const state = get();
    const engine = deck === 'A' ? state.deckA : state.deckB;
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    
    if (engine && engine.isLoaded) {
      engine.reSnapToGrid();
      
      // Wait for re-snap to complete
      setTimeout(() => {
        const gridPosition = engine.getGridPosition();
        
        set({
          [deckState]: {
            ...state[deckState],
            gridPosition
          }
        });
        
        console.log(`🔄 Deck ${deck} re-snapped: Bar ${gridPosition.bar}, Beat ${gridPosition.beat}, Queued: ${gridPosition.isQueued}`);
      }, 100);
    }
  },

  setPitch: (deck, value) => {
    const state = get();
    const engine = deck === 'A' ? state.deckA : state.deckB;
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    
    if (engine) {
      engine.setPitch(value);
      set({
        [deckState]: {
          ...state[deckState],
          pitch: value,
          bpmInfo: engine.getBPMInfo()
        },
      });
    }
  },

  setEQ: (deck, eq) => {
    const state = get();
    const engine = deck === 'A' ? state.deckA : state.deckB;
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    
    if (engine) {
      engine.setEQ(eq.low, eq.mid, eq.high);
      set({
        [deckState]: {
          ...state[deckState],
          eq,
        },
      });
    }
  },

  setVolume: (deck, value) => {
    const state = get();
    const engine = deck === 'A' ? state.deckA : state.deckB;
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    
    if (engine) {
      // Apply crossfader mixing with cosine curve
      const crossfaderNormalized = state.crossfader / 100;
      let finalVolume = value / 100;
      
      if (deck === 'A') {
        // Deck A fades out as crossfader moves right
        finalVolume *= Math.cos(crossfaderNormalized * 0.5 * Math.PI);
      } else {
        // Deck B fades out as crossfader moves left
        finalVolume *= Math.cos((1 - crossfaderNormalized) * 0.5 * Math.PI);
      }
      
      engine.setGain(finalVolume * 100);
      
      set({
        [deckState]: {
          ...state[deckState],
          volume: value,
        },
      });
    }
  },

  setCrossfader: (value) => {
    const state = get();
    set({ crossfader: value });
    
    // Update both deck volumes to apply crossfader
    get().setVolume('A', state.deckAState.volume);
    get().setVolume('B', state.deckBState.volume);
  },

  setFX: (fx) => {
    const state = get();
    const newFX = { ...state.fx, ...fx };
    set({ fx: newFX });
    
    // Apply FX to the appropriate decks
    if (newFX.assignedTo === 'A' || newFX.assignedTo === 'BOTH') {
      get().setDeckFX('A', newFX);
    }
    if (newFX.assignedTo === 'B' || newFX.assignedTo === 'BOTH') {
      get().setDeckFX('B', newFX);
    }
  },

  setDeckFX: (deck, fx) => {
    const state = get();
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    const engine = deck === 'A' ? state.deckA : state.deckB;
    
    const newDeckFX = { ...state[deckState].fx, ...fx };
    
    set({
      [deckState]: {
        ...state[deckState],
        fx: newDeckFX,
      },
    });

    // Apply FX to the engine
    if (engine) {
      if (fx.filter !== undefined) engine.setFilter(fx.filter);
      if (fx.reverb !== undefined) engine.setReverb(fx.reverb);
      if (fx.delay !== undefined) engine.setDelay(fx.delay);
    }
  },

  scrubTrack: (deck, velocity) => {
    const state = get();
    const engine = deck === 'A' ? state.deckA : state.deckB;
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    
    if (engine && engine.isLoaded) {
      engine.scrub(velocity);
      const gridPosition = engine.getGridPosition();
      
      set({
        [deckState]: {
          ...state[deckState],
          gridPosition
        }
      });
    }
  },

  triggerBackspin: (deck) => {
    const state = get();
    const engine = deck === 'A' ? state.deckA : state.deckB;
    
    if (engine) {
      engine.triggerBackspin();
      console.log(`🌀 Backspin triggered on Deck ${deck}`);
    }
  },

  bendTempo: (deck, rate) => {
    const state = get();
    const engine = deck === 'A' ? state.deckA : state.deckB;
    
    if (engine && engine.isLoaded) {
      engine.bendTempo(rate);
      console.log(`⏩ Tempo bend Deck ${deck}: ${rate}x (temporary)`);
    }
  },

  syncDecks: () => {
    const state = get();
    const { deckB } = state;
    
    if (deckB && state.deckBState.track) {
      // Re-snap Deck B to current grid position for perfect sync
      get().reSnapToGrid('B');
      
      // Then play for instant sync after a short delay
      setTimeout(() => {
        get().playDeck('B');
      }, 150); // Slightly longer delay to ensure re-snap completes
      
      console.log('🎯 Deck B synced to backend metronome at 128 BPM');
    }
  },

  toggleMetronomeClick: () => {
    const state = get();
    set({ metronomeClickEnabled: !state.metronomeClickEnabled });
    console.log(`🎵 Metronome click ${!state.metronomeClickEnabled ? 'enabled' : 'disabled'}`);
  },

  cleanup: () => {
    const state = get();
    state.deckA?.dispose();
    state.deckB?.dispose();
    state.metronomeClick?.dispose();
    if (Tone.Transport.state === 'started') {
      Tone.Transport.stop();
      Tone.Transport.cancel();
    }
    set({ isTransportRunning: false });
  },

  unlockAudioContext: async () => {
    try {
      await Tone.start();
      console.log("🔊 DJ Audio context started");
      set({ audioUnlocked: true, audioError: null });
      await get().initializeAudio();
    } catch (error) {
      console.error("❌ Failed to start DJ audio context:", error);
      set({ audioError: "Failed to start audio. Please try refreshing the page." });
    }
  },
}));