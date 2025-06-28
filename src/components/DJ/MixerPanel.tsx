
import React from 'react';
import { useDJStore } from '../../stores/djStore';
import WaveformDisplay from './WaveformDisplay';

const MixerPanel = () => {
  const {
    crossfader,
    masterVolume,
    setCrossfader,
    setMasterVolume,
  } = useDJStore();

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-purple-500/30">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-purple-400">Mixer</h3>
      </div>

      {/* Waveform Display */}
      <div className="mb-6">
        <WaveformDisplay />
      </div>

      {/* Master Volume */}
      <div className="flex flex-col items-center space-y-2 mb-8">
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
            onChange={(e) => setCrossfader(Number(e.target.value))}
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
  );
};

export default MixerPanel;
