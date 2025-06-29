import React from 'react';
import { useDJStore } from '../../stores/djStore';
import WaveformDisplay from './WaveformDisplay';
import VolumeFader from './VolumeFader';
import EQKnob from './EQKnob';

const MixerPanel = () => {
  const {
    crossfader,
    deckAState,
    deckBState,
    setCrossfader,
    setVolume,
    setEQ,
    setDeckFX,
  } = useDJStore();

  const handleCrossfaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setCrossfader(value);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-purple-500/30">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-purple-400">Mixer</h3>
      </div>

      <div className="flex justify-between items-start space-x-8">
        {/* Deck A Column */}
        <div className="flex flex-col items-center space-y-4">
          <div className="text-xs text-purple-400 font-semibold">DECK A</div>
          
          {/* EQ Section */}
          <div className="space-y-3">
            <EQKnob
              label="High"
              value={deckAState.eq.high}
              onChange={(value) => setEQ('A', { ...deckAState.eq, high: value })}
              color="red"
            />
            <EQKnob
              label="Mid"
              value={deckAState.eq.mid}
              onChange={(value) => setEQ('A', { ...deckAState.eq, mid: value })}
              color="green"
            />
            <EQKnob
              label="Low"
              value={deckAState.eq.low}
              onChange={(value) => setEQ('A', { ...deckAState.eq, low: value })}
              color="blue"
            />
          </div>

          {/* FX Section */}
          <div className="space-y-3">
            <EQKnob
              label="Filter"
              value={deckAState.fx.filter}
              onChange={(value) => setDeckFX('A', { filter: value })}
              color="purple"
            />
            <EQKnob
              label="Reverb"
              value={deckAState.fx.reverb}
              onChange={(value) => setDeckFX('A', { reverb: value })}
              color="purple"
            />
            <EQKnob
              label="Delay"
              value={deckAState.fx.delay}
              onChange={(value) => setDeckFX('A', { delay: value })}
              color="purple"
            />
          </div>

          {/* Volume Fader */}
          <VolumeFader
            deck="A"
            value={deckAState.volume}
            onChange={(value) => setVolume('A', value)}
          />
        </div>

        {/* Center section with waveform */}
        <div className="flex-1 space-y-6">
          {/* Waveform Display */}
          <div>
            <WaveformDisplay />
          </div>

          {/* Crossfader */}
          <div className="space-y-2">
            <div className="text-xs text-purple-400 text-center font-semibold">CROSSFADER</div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={crossfader}
                onChange={handleCrossfaderChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer crossfader"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>A</span>
                <span className={crossfader === 50 ? 'text-purple-400' : ''}>MIX</span>
                <span>B</span>
              </div>
              {/* Center notch indicator */}
              {Math.abs(crossfader - 50) < 2 && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-1 h-4 bg-purple-400 rounded-full" />
              )}
            </div>
          </div>
        </div>

        {/* Deck B Column */}
        <div className="flex flex-col items-center space-y-4">
          <div className="text-xs text-purple-400 font-semibold">DECK B</div>
          
          {/* EQ Section */}
          <div className="space-y-3">
            <EQKnob
              label="High"
              value={deckBState.eq.high}
              onChange={(value) => setEQ('B', { ...deckBState.eq, high: value })}
              color="red"
            />
            <EQKnob
              label="Mid"
              value={deckBState.eq.mid}
              onChange={(value) => setEQ('B', { ...deckBState.eq, mid: value })}
              color="green"
            />
            <EQKnob
              label="Low"
              value={deckBState.eq.low}
              onChange={(value) => setEQ('B', { ...deckBState.eq, low: value })}
              color="blue"
            />
          </div>

          {/* FX Section */}
          <div className="space-y-3">
            <EQKnob
              label="Filter"
              value={deckBState.fx.filter}
              onChange={(value) => setDeckFX('B', { filter: value })}
              color="purple"
            />
            <EQKnob
              label="Reverb"
              value={deckBState.fx.reverb}
              onChange={(value) => setDeckFX('B', { reverb: value })}
              color="purple"
            />
            <EQKnob
              label="Delay"
              value={deckBState.fx.delay}
              onChange={(value) => setDeckFX('B', { delay: value })}
              color="purple"
            />
          </div>

          {/* Volume Fader */}
          <VolumeFader
            deck="B"
            value={deckBState.volume}
            onChange={(value) => setVolume('B', value)}
          />
        </div>
      </div>
    </div>
  );
};

export default MixerPanel;