import { create } from 'zustand';
import { DeckAudioEngine } from '../lib/deckAudioEngine';
import * as Tone from 'tone';

interface Track {
  name: string;
  bpm: number;
  key: string;
  url?: string;
}

interface DeckState {
  isPlaying: boolean;
  track: Track | null;
  pitch: number;
  eq: { low: number; mid: number; high: number };
  volume: number;
  fx: { filter: number; reverb: number; delay: number };
  isSyncing: boolean;
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
  
  // Transport for sync
  isTransportRunning: boolean;
  
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
  syncDecks: () => void;
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
};

export const useDJStore = create<DJState>((set, get) => ({
  deckA: null,
  deckB: null,
  
  deckAState: defaultDeckState,
  deckBState: defaultDeckState,
  
  crossfader: 50,
  isTransportRunning: false,

  initializeAudio: async () => {
    try {
      await Tone.start();
      
      const deckA = new DeckAudioEngine();
      const deckB = new DeckAudioEngine();
      
      // Initialize transport for sync
      Tone.Transport.bpm.value = 120;
      
      set({ deckA, deckB });
      
      console.log('🎧 DJ Audio System Initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  },

  playDeck: (deck) => {
    const state = get();
    const engine = deck === 'A' ? state.deckA : state.deckB;
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    
    if (engine && engine.isLoaded) {
      engine.play();
      
      // Start transport if this is deck A and not already running
      if (deck === 'A' && !state.isTransportRunning) {
        Tone.Transport.bpm.value = engine.getBPM();
        Tone.Transport.start();
        set({ isTransportRunning: true });
      }
      
      set({
        [deckState]: {
          ...state[deckState],
          isPlaying: true,
        },
      });
    }
  },

  pauseDeck: (deck) => {
    const state = get();
    const engine = deck === 'A' ? state.deckA : state.deckB;
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    
    if (engine) {
      engine.pause();
      set({
        [deckState]: {
          ...state[deckState],
          isPlaying: false,
        },
      });
    }
  },

  loadTrack: async (deck, track) => {
    const state = get();
    const engine = deck === 'A' ? state.deckA : state.deckB;
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    
    if (engine && track.url) {
      const loaded = await engine.loadTrack(track.url, track.bpm);
      if (loaded) {
        set({
          [deckState]: {
            ...state[deckState],
            track,
            isPlaying: false,
          },
        });
        console.log(`🎵 Loaded "${track.name}" to Deck ${deck}`);
      }
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
    
    if (engine && engine.isLoaded) {
      engine.scrub(velocity);
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

  syncDecks: () => {
    const state = get();
    const { deckA, deckB, deckAState, deckBState } = state;
    
    if (deckA && deckB && deckAState.isPlaying && deckBState.track) {
      // Set deck B to sync state
      set({
        deckBState: {
          ...deckBState,
          isSyncing: true,
        },
      });

      // Set transport BPM to deck A's BPM
      const deckABPM = deckA.getBPM();
      Tone.Transport.bpm.value = deckABPM;
      
      if (!state.isTransportRunning) {
        Tone.Transport.start();
        set({ isTransportRunning: true });
      }

      // Calculate beats until next bar (4/4 time)
      const currentPosition = Tone.Transport.position;
      const [bars, beats] = currentPosition.split(':').map(Number);
      const beatsUntilNextBar = 4 - (beats % 4);
      
      // Schedule deck B to start at the next bar
      Tone.Transport.scheduleOnce(() => {
        if (deckB.isLoaded) {
          deckB.play();
          set({
            deckBState: {
              ...get().deckBState,
              isPlaying: true,
              isSyncing: false,
            },
          });
          console.log(`🎯 Deck B synced to Deck A at ${deckABPM} BPM`);
        }
      }, `+${beatsUntilNextBar}n`);

      console.log(`⏱️ Deck B will sync in ${beatsUntilNextBar} beats`);
    }
  },

  cleanup: () => {
    const state = get();
    state.deckA?.dispose();
    state.deckB?.dispose();
    Tone.Transport.stop();
    Tone.Transport.cancel();
  },
}));