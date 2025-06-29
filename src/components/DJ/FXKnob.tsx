import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface FXKnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  color?: string;
}

const FXKnob = ({ label, value, onChange, min = 0, max = 100, color = 'purple' }: FXKnobProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);

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

    const deltaY = startY - e.clientY;
    const sensitivity = 0.5;
    const deltaValue = deltaY * sensitivity;
    const newValue = Math.max(min, Math.min(max, startValue + deltaValue));

    onChange(newValue);
  }, [isDragging, startY, startValue, onChange, min, max]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.1;
    const newValue = Math.max(min, Math.min(max, value + delta));
    onChange(newValue);
  }, [value, onChange, min, max]);

  // Touch support for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartValue(value);
    e.preventDefault();
  }, [value]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const deltaY = startY - e.touches[0].clientY;
    const sensitivity = 0.5;
    const deltaValue = deltaY * sensitivity;
    const newValue = Math.max(min, Math.min(max, startValue + deltaValue));
    onChange(newValue);
  }, [isDragging, startY, startValue, onChange, min, max]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.body.style.cursor = 'ns-resize';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.body.style.cursor = 'default';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'border-red-500 hover:border-red-400';
      case 'green': return 'border-green-500 hover:border-green-400';
      case 'blue': return 'border-blue-500 hover:border-blue-400';
      case 'orange': return 'border-orange-500 hover:border-orange-400';
      default: return 'border-blue-500 hover:border-blue-400';
    }
  };

  const getIndicatorColor = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-400';
      case 'green': return 'bg-green-400';
      case 'blue': return 'bg-blue-400';
      case 'orange': return 'bg-orange-400';
      default: return 'bg-blue-400';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      <motion.div
        className="relative w-12 h-12 sm:w-16 sm:h-16 cursor-pointer knob-vibe"
        whileHover={{ scale: 1.08 }}
        animate={{
          boxShadow: isDragging
            ? `0 0 20px 4px rgba(59,130,246,0.5)`
            : '0 0 8px 2px rgba(59,130,246,0.15)'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onWheel={handleWheel}
        title={`FX control for ${label}`}
      >
        {/* Knob background with gradient and animated glow */}
        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 shadow-lg transition-all duration-200 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 knob-glow ${isDragging ? getColorClass(color) + ' ring-2 ring-blue-400/60' : 'border-gray-600 ' + getColorClass(color)}`}>
          {/* Knob indicator - bolder */}
          <div
            className={`absolute top-1 left-1/2 w-1.5 h-5 sm:h-6 rounded-full transform -translate-x-1/2 origin-bottom transition-all ${getIndicatorColor(color)} knob-indicator`}
            style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
          />
          {/* Center dot */}
          <div className={`absolute top-1/2 left-1/2 w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 bg-blue-400/80 shadow-md`} />
          
          {/* Glow effect when active */}
          {value > 10 && (
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse" />
          )}
        </div>
      </motion.div>

      {/* Label */}
      <div className="text-xs text-white font-medium text-center">
        {label}
      </div>

      {/* Value display */}
      <div className="text-xs text-white">
        {Math.round(value)}
      </div>
    </div>
  );
};

export default FXKnob;