
import React from 'react';
import EQKnob from './EQKnob';

interface EQSectionProps {
  deck: 'A' | 'B';
  eq: { low: number; mid: number; high: number };
  onEQChange: (eq: { low: number; mid: number; high: number }) => void;
}

const EQSection = ({ deck, eq, onEQChange }: EQSectionProps) => {
  const handleEQChange = (band: 'low' | 'mid' | 'high', value: number) => {
    onEQChange({ ...eq, [band]: value });
  };

  return (
    <div className="flex flex-col items-center space-y-3 p-3 bg-gray-900/50 rounded-lg border border-purple-500/20">
      <div className="text-xs text-purple-400 font-semibold">EQ {deck}</div>
      <div className="space-y-3">
        <EQKnob
          label="High"
          value={eq.high}
          onChange={(value) => handleEQChange('high', value)}
          color="red"
        />
        <EQKnob
          label="Mid"
          value={eq.mid}
          onChange={(value) => handleEQChange('mid', value)}
          color="green"
        />
        <EQKnob
          label="Low"
          value={eq.low}
          onChange={(value) => handleEQChange('low', value)}
          color="blue"
        />
      </div>
    </div>
  );
};

export default EQSection;
