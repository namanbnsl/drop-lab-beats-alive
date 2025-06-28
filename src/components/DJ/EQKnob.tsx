
import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface EQKnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color?: string;
}

const EQKnob = ({ label, value, onChange, color = 'purple' }: EQKnobProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);

  // Calculate rotation angle for the knob visual (270 degrees total range)
  const rotation = ((value / 100) * 270) - 135;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
    e.preventDefault();
  }, [value]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = startY - e.clientY;
    const sensitivity = 0.5;
    const deltaValue = deltaY * sensitivity;
    const newValue = Math.max(0, Math.min(100, startValue + deltaValue));
    
    onChange(newValue);
  }, [isDragging, startY, startValue, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.1;
    const newValue = Math.max(0, Math.min(100, value + delta));
    onChange(newValue);
  }, [value, onChange]);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'border-red-500 hover:border-red-400';
      case 'green': return 'border-green-500 hover:border-green-400';
      case 'blue': return 'border-blue-500 hover:border-blue-400';
      default: return 'border-purple-500 hover:border-purple-400';
    }
  };

  const getIndicatorColor = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-400';
      case 'green': return 'bg-green-400';
      case 'blue': return 'bg-blue-400';
      default: return 'bg-purple-400';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      <motion.div 
        className="relative w-12 h-12 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        animate={{ 
          boxShadow: isDragging 
            ? `0 0 15px rgba(162, 89, 255, 0.8)` 
            : '0 0 5px rgba(162, 89, 255, 0.3)'
        }}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        title={`EQ control for ${label}`}
      >
        {/* Knob background */}
        <div className={`w-12 h-12 bg-gray-800 rounded-full border-2 shadow-lg transition-all ${
          isDragging ? getColorClass(color) + ' bg-gray-700' : 'border-gray-600 ' + getColorClass(color)
        }`}>
          {/* Knob indicator */}
          <div 
            className={`absolute top-1 left-1/2 w-1 h-4 rounded-full transform -translate-x-1/2 origin-bottom transition-all ${
              getIndicatorColor(color)
            }`}
            style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
          />
          
          {/* Center dot */}
          <div className={`absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
            getIndicatorColor(color)
          }`} />
        </div>
      </motion.div>
      
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

export default EQKnob;
