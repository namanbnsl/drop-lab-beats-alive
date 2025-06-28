import { create } from 'zustand';
import { DeckAudioEngine } from '../lib/audioEngine';
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
  masterVolume: number;
  
  // FX
  fx: FXState;
  
  // Actions
  initializeAudio: () => Promise<void>;
  playDeck: (deck: 'A' | 'B') => void;
  pauseDeck: (deck: 'A' | 'B') => void;
  loadTrack: (deck: 'A' | 'B', track: Track) => Promise<void>;
  setPitch: (deck: 'A' | 'B', value: number) => void;
  setEQ: (deck: 'A' | 'B', eq: { low: number; mid: number; high: number }) => void;
  setVolume: (deck: 'A' | 'B', value: number) => void;
  setCrossfader: (value: number) => void;
  setMasterVolume: (value: number) => void;
  setFX: (fx: Partial<FXState>) => void;
  setDeckFX: (deck: 'A' | 'B', fx: Partial<{ filter: number; reverb: number; delay: number }>) => void;
  cleanup: () => void;
}

const defaultDeckState: DeckState = {
  isPlaying: false,
  track: null,
  pitch: 0,
  eq: { low: 50, mid: 50, high: 50 },
  volume: 75,
  fx: { filter: 50, reverb: 0, delay: 0 },
};

export const useDJStore = create<DJState>((set, get) => ({
  deckA: null,
  deckB: null,
  
  deckAState: defaultDeckState,
  deckBState: defaultDeckState,
  
  crossfader: 50,
  masterVolume: 80,
  
  fx: {
    filter: 50,
    reverb: 0,
    delay: 0,
    assignedTo: 'BOTH',
  },

  initializeAudio: async () => {
    try {
      await Tone.start();
      
      const deckA = new DeckAudioEngine();
      const deckB = new DeckAudioEngine();
      
      set({ deckA, deckB });
      
      console.log('Audio initialized');
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
      const loaded = await engine.loadTrack(track.url);
      if (loaded) {
        set({
          [deckState]: {
            ...state[deckState],
            track,
            isPlaying: false,
          },
        });
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
      
      engine.setGain(finalVolume * (state.masterVolume / 100) * 100);
      
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
    
    // Update both deck volumes to apply crossfader with cosine curve
    get().setVolume('A', state.deckAState.volume);
    get().setVolume('B', state.deckBState.volume);
  },

  setMasterVolume: (value) => {
    const state = get();
    set({ masterVolume: value });
    
    // Update both deck volumes
    get().setVolume('A', state.deckAState.volume);
    get().setVolume('B', state.deckBState.volume);
  },

  setFX: (fx) => {
    const state = get();
    const newFX = { ...state.fx, ...fx };
    set({ fx: newFX });
    
    // Apply FX to assigned decks
    const applyToA = newFX.assignedTo === 'A' || newFX.assignedTo === 'BOTH';
    const applyToB = newFX.assignedTo === 'B' || newFX.assignedTo === 'BOTH';
    
    if (applyToA && state.deckA) {
      state.deckA.setFilter(newFX.filter);
      state.deckA.setReverb(newFX.reverb);
      state.deckA.setDelay(newFX.delay);
    }
    
    if (applyToB && state.deckB) {
      state.deckB.setFilter(newFX.filter);
      state.deckB.setReverb(newFX.reverb);
      state.deckB.setDelay(newFX.delay);
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

  cleanup: () => {
    const state = get();
    state.deckA?.dispose();
    state.deckB?.dispose();
  },
}));
