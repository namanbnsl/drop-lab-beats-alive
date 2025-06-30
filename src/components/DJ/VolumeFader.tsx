import React from 'react';

interface VolumeFaderProps {
  deck: 'A' | 'B';
  value: number;
  onChange: (value: number) => void;
}

const VolumeFader = ({ deck, value, onChange }: VolumeFaderProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-xs text-white font-semibold">VOL {deck}</div>
      <div className="h-32 w-6 bg-gray-700 rounded-full flex items-center justify-center relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={handleChange}
          className="h-32 w-6 appearance-none bg-transparent cursor-pointer transform -rotate-90 origin-center volume-fader"
          style={{
            width: '128px',
            height: '24px',
            padding: 0,
            margin: 0,
            display: 'block',
          }}
          title={`Controls deck ${deck} volume`}
        />
      </div>
      <div className="text-xs text-white font-bold">{value}%</div>
    </div>
  );
};

export default VolumeFader;