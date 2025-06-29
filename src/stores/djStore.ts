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

interface DJState {
  // Audio engines
  deckA: DeckAudioEngine | null;
  deckB: DeckAudioEngine | null;
  
  // Deck states
  deckAState: DeckState;
  deckBState: DeckState;
  
  // Mixer
  crossfader: number;
  
  // Global BPM Control (internal only)
  globalBPM: number;
  bpmSyncEnabled: boolean;
  
  // Transport for sync (Silent Backend Metronome)
  isTransportRunning: boolean;
  masterGridPosition: { bar: number; beat: number };
  
  // Actions
  initializeAudio: () => Promise<void>;
  playDeck: (deck: 'A' | 'B') => void;
  pauseDeck: (deck: 'A' | 'B') => void;
  loadTrack: (deck: 'A' | 'B', track: Track) => Promise<void>;
  setPitch: (deck: 'A' | 'B', value: number) => void;
  setEQ: (deck: 'A' | 'B', eq: { low: number; mid: number; high: number }) => void;
  setVolume: (deck: 'A' | 'B', value: number) => void;
  setCrossfader: (value: number) => void;
  setDeckFX: (deck: 'A' | 'B', fx: Partial<{ filter: number; reverb: number; delay: number }>) => void;
  scrubTrack: (deck: 'A' | 'B', velocity: number) => void;
  triggerBackspin: (deck: 'A' | 'B') => void;
  bendTempo: (deck: 'A' | 'B', rate: number) => void;
  syncDecks: () => void;
  reSnapToGrid: (deck: 'A' | 'B') => void;
  updateGridPositions: () => void;
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
  globalBPM: 128, // Fixed at 128 BPM for all tracks
  bpmSyncEnabled: true,
  isTransportRunning: false,
  masterGridPosition: { bar: 1, beat: 1 },

  initializeAudio: async () => {
    try {
      await Tone.start();
      
      const deckA = new DeckAudioEngine();
      const deckB = new DeckAudioEngine();
      
      // 🎯 Initialize master beat grid at 128 BPM
      Tone.Transport.bpm.value = 128;
      Tone.Transport.start("+0.1"); // Start with small delay to ensure proper initialization
      
      set({ 
        deckA, 
        deckB, 
        isTransportRunning: true 
      });
      
      // Start grid position updates
      get().updateGridPositions();
      
      console.log('🎧 DJ Audio System Initialized - Master Grid @ 128 BPM');
      console.log('🎯 Beat Snapping System Active - Tracks will auto-align to grid');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  },

  updateGridPositions: () => {
    const state = get();
    
    if (!state.isTransportRunning) return;
    
    // Update master grid position
    const transportTime = Tone.Transport.seconds;
    const beatInterval = 60 / 128; // 128 BPM
    const currentBeat = Math.floor(transportTime / beatInterval);
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
    
    // Continue updating every 100ms
    setTimeout(() => get().updateGridPositions(), 100);
  },

  playDeck: (deck) => {
    const state = get();
    const engine = deck === 'A' ? state.deckA : state.deckB;
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    
    if (engine && engine.isLoaded) {
      // Ensure master transport is running
      if (!state.isTransportRunning) {
        Tone.Transport.bpm.value = 128;
        Tone.Transport.start();
        set({ isTransportRunning: true });
        get().updateGridPositions();
        console.log('🎯 Master Transport started at 128 BPM');
      }

      // ⚡ INSTANT PLAY: Engine handles beat-snapped instant play
      engine.play();
      
      const bpmInfo = engine.getBPMInfo();
      const gridPosition = engine.getGridPosition();
      
      set({
        [deckState]: {
          ...state[deckState],
          isPlaying: true,
          bpmInfo,
          gridPosition
        },
      });
      
      if (gridPosition.isQueued) {
        console.log(`⚡ Deck ${deck} instant sync play - Grid aligned!`);
      } else {
        console.log(`▶️ Deck ${deck} manual play at 128 BPM`);
      }
    }
  },

  pauseDeck: (deck) => {
    const state = get();
    const engine = deck === 'A' ? state.deckA : state.deckB;
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    
    if (engine) {
      engine.pause();
      const gridPosition = engine.getGridPosition();
      
      set({
        [deckState]: {
          ...state[deckState],
          isPlaying: false,
          gridPosition
        },
      });
    }
  },

  loadTrack: async (deck, track) => {
    const state = get();
    const engine = deck === 'A' ? state.deckA : state.deckB;
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    
    if (engine && track.url) {
      // Use the provided BPM as the original BPM for auto-sync calculation
      const originalBPM = track.bpm;
      const targetBPM = 128; // Always sync to 128 BPM
      
      // Create track with original BPM
      const trackWithBPM = { ...track, originalBPM };
      
      const loaded = await engine.loadTrack(track.url, originalBPM);
      if (loaded) {
        // Force auto-sync to 128 BPM immediately
        engine.setGlobalBPMSync(targetBPM, originalBPM);
        
        const playbackRate = (targetBPM / originalBPM).toFixed(3);
        console.log(`🎯 Auto-sync Deck ${deck}: ${originalBPM} BPM → ${targetBPM} BPM (${playbackRate}x rate)`);
        
        const bpmInfo = engine.getBPMInfo();
        const gridPosition = engine.getGridPosition();
        
        set({
          [deckState]: {
            ...state[deckState],
            track: trackWithBPM,
            isPlaying: false,
            bpmInfo,
            gridPosition
          }
        });
        
        console.log(`✅ "${track.name}" loaded to Deck ${deck} and beat-snapped to grid`);
        console.log(`🎯 Ready for instant sync play: Bar ${gridPosition.bar}, Beat ${gridPosition.beat}`);
      }
    }
  },

  reSnapToGrid: (deck) => {
    const state = get();
    const engine = deck === 'A' ? state.deckA : state.deckB;
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    
    if (engine && engine.isLoaded) {
      engine.reSnapToGrid();
      const gridPosition = engine.getGridPosition();
      
      set({
        [deckState]: {
          ...state[deckState],
          gridPosition
        }
      });
      
      console.log(`🔄 Deck ${deck} re-snapped to grid: Bar ${gridPosition.bar}, Beat ${gridPosition.beat}`);
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
      
      // Then play for instant sync
      setTimeout(() => {
        get().playDeck('B');
      }, 50); // Small delay to ensure re-snap completes
      
      console.log('🎯 Deck B synced to master grid at 128 BPM');
    }
  },

  cleanup: () => {
    const state = get();
    state.deckA?.dispose();
    state.deckB?.dispose();
    Tone.Transport.stop();
    Tone.Transport.cancel();
    set({ isTransportRunning: false });
  },
}));