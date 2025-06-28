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
  playDeckOnNextBar: (deck: 'A' | 'B') => void;
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
  globalBPM: 128, // Fixed at 128 BPM for all tracks
  bpmSyncEnabled: true,
  isTransportRunning: false,

  initializeAudio: async () => {
    try {
      await Tone.start();
      
      const deckA = new DeckAudioEngine();
      const deckB = new DeckAudioEngine();
      
      // Initialize silent backend metronome at 128 BPM
      Tone.Transport.bpm.value = 128;
      
      set({ deckA, deckB });
      
      console.log('🎧 DJ Audio System Initialized - All tracks will auto-sync to 128 BPM');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  },

  playDeck: (deck) => {
    const state = get();
    const engine = deck === 'A' ? state.deckA : state.deckB;
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    
    if (engine && engine.isLoaded) {
      // Start silent backend metronome if not already running
      if (!state.isTransportRunning) {
        Tone.Transport.bpm.value = 128; // Always 128 BPM
        Tone.Transport.start();
        set({ isTransportRunning: true });
        console.log('🎯 Master Transport started at 128 BPM');
      }

      // For Deck A or when no other deck is playing, start immediately
      const otherDeckState = deck === 'A' ? state.deckBState : state.deckAState;
      if (deck === 'A' || !otherDeckState.isPlaying) {
        engine.play();
        
        const bpmInfo = engine.getBPMInfo();
        
        set({
          [deckState]: {
            ...state[deckState],
            isPlaying: true,
            bpmInfo
          },
        });
        
        console.log(`▶️ Deck ${deck} playing at 128 BPM (auto-synced)`);
      } else {
        // For secondary decks, use bar-aligned playback for perfect sync
        get().playDeckOnNextBar(deck);
      }
    }
  },

  playDeckOnNextBar: (deck) => {
    const state = get();
    const engine = deck === 'A' ? state.deckA : state.deckB;
    const deckState = deck === 'A' ? 'deckAState' : 'deckBState';
    
    if (!engine || !engine.isLoaded) return;

    // Set deck to syncing state
    set({
      [deckState]: {
        ...state[deckState],
        isSyncing: true,
      },
    });

    // Calculate current transport position and beats until next bar
    const position = Tone.Transport.position;
    const [bars, beats, sixteenths] = position.split(':').map(Number);
    const currentBeat = beats + (sixteenths / 4);
    const beatsUntilNextBar = 4 - (currentBeat % 4);
    
    console.log(`⏱️ Syncing Deck ${deck} to next bar in ${beatsUntilNextBar.toFixed(2)} beats`);

    // Schedule playback to start on the next bar
    Tone.Transport.scheduleOnce(() => {
      if (engine.isLoaded) {
        engine.play();
        
        const bpmInfo = engine.getBPMInfo();
        
        set({
          [deckState]: {
            ...get()[deckState],
            isPlaying: true,
            isSyncing: false,
            bpmInfo
          },
        });
        
        console.log(`🎯 Deck ${deck} synced perfectly to 128 BPM on bar boundary!`);
      }
    }, `+${beatsUntilNextBar}n`);
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
        
        set({
          [deckState]: {
            ...state[deckState],
            track: trackWithBPM,
            isPlaying: false,
            bpmInfo
          }
        });
        
        console.log(`✅ "${track.name}" loaded to Deck ${deck} and auto-synced to 128 BPM`);
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
    const { deckA, deckB, deckBState } = state;
    
    if (deckA && deckB && deckBState.track) {
      // Ensure transport is at 128 BPM
      Tone.Transport.bpm.value = 128;
      
      if (!state.isTransportRunning) {
        Tone.Transport.start();
        set({ isTransportRunning: true });
      }

      // Use bar-aligned playback for perfect sync at 128 BPM
      get().playDeckOnNextBar('B');
      console.log('🎯 Syncing Deck B to 128 BPM on next bar');
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