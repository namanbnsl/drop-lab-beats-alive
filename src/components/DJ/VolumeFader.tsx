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
      <div className="text-xs text-blue-400 font-semibold">VOL {deck}</div>
      <div className="h-32 w-6 bg-gray-700 rounded-full relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={handleChange}
          className="h-32 w-6 appearance-none bg-transparent cursor-pointer transform -rotate-90 origin-center"
          style={{
            width: '128px',
            height: '24px',
            marginTop: '52px',
            marginLeft: '-61px'
          }}
          title={`Controls deck ${deck} volume`}
        />
        <div
          className="absolute w-6 h-6 bg-blue-500 rounded-full shadow-lg pointer-events-none"
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

export default VolumeFader;
