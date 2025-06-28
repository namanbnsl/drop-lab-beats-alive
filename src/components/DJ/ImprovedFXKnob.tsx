
import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface ImprovedFXKnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const ImprovedFXKnob = ({ label, value, onChange, min = 0, max = 100 }: ImprovedFXKnobProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);
  const knobRef = useRef<HTMLDivElement>(null);

  // Calculate rotation angle for the knob visual (270 degrees total range)
  const rotation = ((value - min) / (max - min)) * 270 - 135;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
    e.preventDefault();
  }, [value]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = startY - e.clientY; // Inverted for natural feel
    const sensitivity = 0.5;
    const deltaValue = deltaY * sensitivity;
    const newValue = Math.max(min, Math.min(max, startValue + deltaValue));
    
    onChange(newValue);
  }, [isDragging, startY, startValue, min, max, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.1;
    const newValue = Math.max(min, Math.min(max, value + delta));
    onChange(newValue);
  }, [value, min, max, onChange]);

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

  return (
    <div className="flex flex-col items-center space-y-2">
      <motion.div 
        ref={knobRef}
        className="relative w-14 h-14 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        animate={{ 
          boxShadow: isDragging 
            ? '0 0 20px rgba(162, 89, 255, 0.8)' 
            : '0 0 10px rgba(162, 89, 255, 0.3)'
        }}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        title={`${label}: ${Math.round(value)}`}
      >
        {/* Knob background */}
        <div className={`w-14 h-14 bg-gray-800 rounded-full border-2 shadow-lg transition-all ${
          isDragging ? 'border-purple-400 bg-gray-700' : 'border-gray-600 hover:border-purple-500'
        }`}>
          {/* Knob indicator */}
          <div 
            className={`absolute top-2 left-1/2 w-1 h-5 rounded-full transform -translate-x-1/2 origin-bottom transition-all ${
              isDragging ? 'bg-purple-300' : 'bg-purple-400'
            }`}
            style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
          />
          
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-purple-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
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

export default ImprovedFXKnob;
