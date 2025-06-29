import React from 'react';
import { useDJStore } from '../../stores/djStore';
import WaveformDisplay from './WaveformDisplay';
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

  const VerticalFader = ({ deck, value, onChange }: { deck: string; value: number; onChange: (value: number) => void }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    };

    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="text-xs text-purple-400 font-semibold">VOL {deck}</div>
        <div className="h-24 w-6 bg-gray-700 rounded-full relative">
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={handleChange}
            className="h-24 w-6 appearance-none bg-transparent cursor-pointer transform -rotate-90 origin-center"
            style={{ 
              width: '96px',
              height: '24px',
              marginTop: '36px',
              marginLeft: '-35px'
            }}
          />
          <div 
            className="absolute w-6 h-6 bg-purple-500 rounded-full shadow-lg pointer-events-none"
            style={{ 
              bottom: `${value}%`,
              transform: 'translateY(50%)'
            }}
          />
        </div>
        <div className="text-xs text-gray-400">{value}%</div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-purple-500/30">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-purple-400">Mixer</h3>
      </div>

      <div className="flex justify-between items-start space-x-6">
        {/* Deck A Column */}
        <div className="flex flex-col items-center space-y-4">
          <div className="text-xs text-purple-400 font-semibold">DECK A</div>
          
          {/* Combined Controls Row */}
          <div className="flex items-start gap-6">
            {/* EQ Section */}
            <div className="flex flex-col space-y-3">
              <div className="text-xs text-gray-400 text-center">EQ</div>
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
            <div className="flex flex-col space-y-3">
              <div className="text-xs text-gray-400 text-center">FX</div>
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
            <VerticalFader
              deck="A"
              value={deckAState.volume}
              onChange={(value) => setVolume('A', value)}
            />
          </div>
        </div>

        {/* Center section with waveform */}
        <div className="flex-1 space-y-4">
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
          
          {/* Combined Controls Row */}
          <div className="flex items-start gap-6">
            {/* EQ Section */}
            <div className="flex flex-col space-y-3">
              <div className="text-xs text-gray-400 text-center">EQ</div>
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
            <div className="flex flex-col space-y-3">
              <div className="text-xs text-gray-400 text-center">FX</div>
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
            <VerticalFader
              deck="B"
              value={deckBState.volume}
              onChange={(value) => setVolume('B', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MixerPanel;