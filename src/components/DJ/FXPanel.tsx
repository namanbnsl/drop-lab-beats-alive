
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import InfoTooltip from '../InfoTooltip';

const FXPanel = () => {
  const [filter, setFilter] = useState(50);
  const [reverb, setReverb] = useState(0);
  const [delay, setDelay] = useState(0);
  const [assignedTo, setAssignedTo] = useState<'A' | 'B' | 'BOTH'>('BOTH');

  const Knob = ({ 
    value, 
    onChange, 
    label,
    tooltip
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    label: string;
    tooltip: string;
  }) => {
    const rotation = (value / 100) * 270 - 135;

    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-16 h-16">
          <div 
            className="w-16 h-16 rounded-full border-4 border-purple-500 bg-gray-800 relative cursor-pointer shadow-lg hover:shadow-purple-500/25 transition-all"
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
              className="absolute w-1 h-6 bg-purple-400 top-1 left-1/2 transform -translate-x-1/2 origin-bottom rounded-full transition-transform"
              style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
            />
            {/* Glow effect when active */}
            {value > 10 && (
              <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm text-purple-400 font-semibold">{label}</span>
          <InfoTooltip content={tooltip} />
        </div>
        <div className="text-xs text-gray-400">{Math.round(value)}%</div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-purple-500/30">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-purple-400">FX Panel</h3>
      </div>

      {/* FX Controls */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <Knob
          value={filter}
          onChange={setFilter}
          label="FILTER"
          tooltip="Sweep from full bass (left) to full treble (right). Center is neutral."
        />
        <Knob
          value={reverb}
          onChange={setReverb}
          label="REVERB"
          tooltip="Add space and echo to your sound. Great for breakdowns and transitions."
        />
        <Knob
          value={delay}
          onChange={setDelay}
          label="DELAY"
          tooltip="Repeat sound in rhythmic bursts. Perfect for creating tension and drops."
        />
      </div>

      {/* Assignment Buttons */}
      <div className="space-y-3">
        <div className="text-xs text-purple-400 text-center font-semibold">ASSIGN FX TO:</div>
        <div className="flex justify-center gap-2">
          {(['A', 'B', 'BOTH'] as const).map((option) => (
            <motion.button
              key={option}
              onClick={() => setAssignedTo(option)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg border font-semibold transition-all ${
                assignedTo === option
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/25'
                  : 'border-purple-500/30 text-purple-400 hover:border-purple-500 hover:bg-purple-600/10'
              }`}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Visual FX Indicator */}
      {(filter !== 50 || reverb > 0 || delay > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-purple-600/20 border border-purple-500/30 rounded-lg text-center"
        >
          <div className="text-sm text-purple-400">
            FX Active on Deck {assignedTo}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {filter !== 50 && `Filter: ${Math.round(filter)}% `}
            {reverb > 0 && `Reverb: ${Math.round(reverb)}% `}
            {delay > 0 && `Delay: ${Math.round(delay)}%`}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FXPanel;
