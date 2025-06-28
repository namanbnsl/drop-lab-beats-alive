
import React from 'react';

interface FXKnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const FXKnob = ({ label, value, onChange, min = 0, max = 100 }: FXKnobProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  // Calculate rotation angle for the knob visual (270 degrees total range)
  const rotation = ((value - min) / (max - min)) * 270 - 135;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative w-12 h-12">
        {/* Knob background */}
        <div className="w-12 h-12 bg-gray-800 rounded-full border-2 border-gray-600 shadow-lg hover:border-purple-500 transition-colors">
          {/* Knob indicator */}
          <div 
            className="absolute top-1 left-1/2 w-0.5 h-4 bg-purple-400 rounded-full transform -translate-x-1/2 origin-bottom"
            style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
          />
        </div>
        
        {/* Hidden range input for interaction */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      
      {/* Label */}
      <div className="text-xs text-white font-medium text-center">
        {label}
      </div>
      
      {/* Value display */}
      <div className="text-xs text-gray-400">
        {Math.round(value)}
      </div>
    </div>
  );
};

export default FXKnob;
