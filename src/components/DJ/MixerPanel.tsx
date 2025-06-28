
import React from 'react';
import { useDJStore } from '../../stores/djStore';
import WaveformDisplay from './WaveformDisplay';
import VolumeFader from './VolumeFader';
import FXStack from './FXStack';

const MixerPanel = () => {
  const {
    crossfader,
    masterVolume,
    deckAState,
    deckBState,
    setCrossfader,
    setMasterVolume,
    setVolume,
    setDeckFX,
  } = useDJStore();

  const handleDeckAFX = (fxType: 'filter' | 'reverb' | 'delay', value: number) => {
    setDeckFX('A', { [fxType]: value });
  };

  const handleDeckBFX = (fxType: 'filter' | 'reverb' | 'delay', value: number) => {
    setDeckFX('B', { [fxType]: value });
  };

  const handleCrossfaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setCrossfader(value);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-purple-500/30">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-purple-400">Mixer</h3>
      </div>

      <div className="flex justify-between items-start space-x-6">
        {/* Deck A Controls */}
        <div className="flex flex-col items-center space-y-6">
          <VolumeFader
            deck="A"
            value={deckAState.volume}
            onChange={(value) => setVolume('A', value)}
          />
          <FXStack
            deck="A"
            fx={deckAState.fx}
            onFXChange={handleDeckAFX}
          />
        </div>

        {/* Center section with waveform and controls */}
        <div className="flex-1 space-y-6">
          {/* Waveform Display */}
          <div>
            <WaveformDisplay />
          </div>

          {/* Master Volume */}
          <div className="flex flex-col items-center space-y-2">
            <div className="text-xs text-purple-400 font-semibold">MASTER</div>
            <div className="h-32 w-6 bg-gray-700 rounded-full relative">
              <input
                type="range"
                min="0"
                max="100"
                value={masterVolume}
                onChange={(e) => setMasterVolume(Number(e.target.value))}
                className="h-32 w-6 appearance-none bg-transparent cursor-pointer transform -rotate-90 origin-center"
                style={{ 
                  width: '128px',
                  height: '24px',
                  marginTop: '52px',
                  marginLeft: '-61px'
                }}
              />
              <div 
                className="absolute w-6 h-6 bg-purple-500 rounded-full shadow-lg pointer-events-none"
                style={{ 
                  bottom: `${masterVolume}%`,
                  transform: 'translateY(50%)'
                }}
              />
            </div>
            <div className="text-xs text-gray-400">{masterVolume}%</div>
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

        {/* Deck B Controls */}
        <div className="flex flex-col items-center space-y-6">
          <VolumeFader
            deck="B"
            value={deckBState.volume}
            onChange={(value) => setVolume('B', value)}
          />
          <FXStack
            deck="B"
            fx={deckBState.fx}
            onFXChange={handleDeckBFX}
          />
        </div>
      </div>
    </div>
  );
};

export default MixerPanel;
