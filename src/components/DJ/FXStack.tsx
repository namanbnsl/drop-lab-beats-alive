
import React from 'react';
import ImprovedFXKnob from './ImprovedFXKnob';

interface FXStackProps {
  deck: 'A' | 'B';
  fx: { filter: number; reverb: number; delay: number };
  onFXChange: (fxType: 'filter' | 'reverb' | 'delay', value: number) => void;
}

const FXStack = ({ deck, fx, onFXChange }: FXStackProps) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-xs text-purple-400 font-semibold mb-2">DECK {deck} FX</div>
      <div className="space-y-4">
        <ImprovedFXKnob
          label="Filter"
          value={fx.filter}
          onChange={(value) => onFXChange('filter', value)}
        />
        <ImprovedFXKnob
          label="Reverb"
          value={fx.reverb}
          onChange={(value) => onFXChange('reverb', value)}
        />
        <ImprovedFXKnob
          label="Delay"
          value={fx.delay}
          onChange={(value) => onFXChange('delay', value)}
        />
      </div>
    </div>
  );
};

export default FXStack;
