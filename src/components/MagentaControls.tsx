
import React from 'react';

interface MagentaControlsProps {
  temperature: number;
  stepsPerQuarter: number;
  onTemperatureChange: (value: number) => void;
  onStepsPerQuarterChange: (value: number) => void;
  disabled?: boolean;
}

const MagentaControls: React.FC<MagentaControlsProps> = ({
  temperature,
  stepsPerQuarter,
  onTemperatureChange,
  onStepsPerQuarterChange,
  disabled = false
}) => {
  return (
    <div className="space-y-4">
      {/* Temperature Control */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Creativity (Temperature): {temperature}
        </label>
        <input
          type="range"
          min="0.1"
          max="2.0"
          step="0.1"
          value={temperature}
          onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          disabled={disabled}
        />
      </div>

      {/* Steps Per Quarter Control */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Resolution: {stepsPerQuarter} steps/quarter
        </label>
        <input
          type="range"
          min="1"
          max="8"
          step="1"
          value={stepsPerQuarter}
          onChange={(e) => onStepsPerQuarterChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default MagentaControls;
