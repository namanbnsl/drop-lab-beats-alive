
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MixerPanel = () => {
  const [crossfader, setCrossfader] = useState(50);
  const [deckAVolume, setDeckAVolume] = useState(75);
  const [deckBVolume, setDeckBVolume] = useState(75);
  const [masterVolume, setMasterVolume] = useState(80);
  
  // EQ knobs
  const [deckAEQ, setDeckAEQ] = useState({ low: 50, mid: 50, high: 50 });
  const [deckBEQ, setDeckBEQ] = useState({ low: 50, mid: 50, high: 50 });

  const Knob = ({ 
    value, 
    onChange, 
    label, 
    color = 'purple' 
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    label: string;
    color?: string;
  }) => {
    const rotation = (value / 100) * 270 - 135; // -135 to +135 degrees

    return (
      <div className="flex flex-col items-center space-y-1">
        <div className="relative w-12 h-12">
          <div 
            className={`w-12 h-12 rounded-full border-4 ${
              color === 'purple' ? 'border-purple-500' : 'border-gray-500'
            } bg-gray-800 relative cursor-pointer shadow-lg`}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
              const degrees = (angle * 180 / Math.PI + 90 + 360) % 360;
              const normalizedValue = Math.max(0, Math.min(100, (degrees / 270) * 100));
              onChange(normalizedValue);
            }}
          >
            <div 
              className={`absolute w-1 h-4 ${
                color === 'purple' ? 'bg-purple-400' : 'bg-gray-400'
              } top-1 left-1/2 transform -translate-x-1/2 origin-bottom rounded-full transition-transform`}
              style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
            />
          </div>
        </div>
        <div className="text-xs text-gray-400 text-center">{label}</div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-purple-500/30">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-purple-400">Mixer</h3>
      </div>

      {/* EQ Section */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Deck A EQ */}
        <div>
          <div className="text-sm text-purple-400 text-center mb-3 font-semibold">Deck A</div>
          <div className="flex justify-around">
            <Knob
              value={deckAEQ.high}
              onChange={(value) => setDeckAEQ(prev => ({ ...prev, high: value }))}
              label="HIGH"
            />
            <Knob
              value={deckAEQ.mid}
              onChange={(value) => setDeckAEQ(prev => ({ ...prev, mid: value }))}
              label="MID"
            />
            <Knob
              value={deckAEQ.low}
              onChange={(value) => setDeckAEQ(prev => ({ ...prev, low: value }))}
              label="LOW"
            />
          </div>
        </div>

        {/* Deck B EQ */}
        <div>
          <div className="text-sm text-purple-400 text-center mb-3 font-semibold">Deck B</div>
          <div className="flex justify-around">
            <Knob
              value={deckBEQ.high}
              onChange={(value) => setDeckBEQ(prev => ({ ...prev, high: value }))}
              label="HIGH"
            />
            <Knob
              value={deckBEQ.mid}
              onChange={(value) => setDeckBEQ(prev => ({ ...prev, mid: value }))}
              label="MID"
            />
            <Knob
              value={deckBEQ.low}
              onChange={(value) => setDeckBEQ(prev => ({ ...prev, low: value }))}
              label="LOW"
            />
          </div>
        </div>
      </div>

      {/* Volume Faders */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Deck A Volume */}
        <div className="flex flex-col items-center space-y-2">
          <div className="text-xs text-purple-400 font-semibold">DECK A</div>
          <div className="h-32 w-6 bg-gray-700 rounded-full relative">
            <input
              type="range"
              min="0"
              max="100"
              value={deckAVolume}
              onChange={(e) => setDeckAVolume(Number(e.target.value))}
              className="h-32 w-6 appearance-none bg-transparent cursor-pointer vertical-slider"
              orient="vertical"
            />
            <div 
              className="absolute w-6 h-6 bg-purple-500 rounded-full shadow-lg pointer-events-none"
              style={{ 
                bottom: `${deckAVolume}%`,
                transform: 'translateY(50%)'
              }}
            />
          </div>
          <div className="text-xs text-gray-400">{deckAVolume}%</div>
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
              className="h-32 w-6 appearance-none bg-transparent cursor-pointer vertical-slider"
              orient="vertical"
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

        {/* Deck B Volume */}
        <div className="flex flex-col items-center space-y-2">
          <div className="text-xs text-purple-400 font-semibold">DECK B</div>
          <div className="h-32 w-6 bg-gray-700 rounded-full relative">
            <input
              type="range"
              min="0"
              max="100"
              value={deckBVolume}
              onChange={(e) => setDeckBVolume(Number(e.target.value))}
              className="h-32 w-6 appearance-none bg-transparent cursor-pointer vertical-slider"
              orient="vertical"
            />
            <div 
              className="absolute w-6 h-6 bg-purple-500 rounded-full shadow-lg pointer-events-none"
              style={{ 
                bottom: `${deckBVolume}%`,
                transform: 'translateY(50%)'
              }}
            />
          </div>
          <div className="text-xs text-gray-400">{deckBVolume}%</div>
        </div>
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
