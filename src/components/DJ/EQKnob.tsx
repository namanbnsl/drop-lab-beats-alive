import React, { useState } from 'react';

interface EQKnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color?: string;
}

const EQKnob = ({ label, value, onChange, color = 'purple' }: EQKnobProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const min = 0;
  const max = 100;
  const rotation = ((value - min) / (max - min)) * 270 - 135;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const degrees = (angle * 180) / Math.PI + 90;
      const normalizedDegrees = ((degrees + 360) % 360);
      const clampedDegrees = Math.max(0, Math.min(270, normalizedDegrees));
      const newValue = min + (clampedDegrees / 270) * (max - min);
      onChange(Math.round(newValue));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
      const degrees = (angle * 180) / Math.PI + 90;
      const normalizedDegrees = ((degrees + 360) % 360);
      const clampedDegrees = Math.max(0, Math.min(270, normalizedDegrees));
      const newValue = min + (clampedDegrees / 270) * (max - min);
      onChange(Math.round(newValue));
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'border-red-500';
      case 'green': return 'border-green-500';
      case 'blue': return 'border-blue-500';
      case 'orange': return 'border-orange-500';
      default: return 'border-blue-500';
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
    <div className="flex flex-col items-center">
      <div
        className={`relative w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 rounded-full border-2 cursor-pointer transition-all duration-200 touch-manipulation ${isDragging ? `${getColorClass(color)} shadow-lg shadow-${color}-500/25` : `border-gray-600 hover:${getColorClass(color)}`}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className={`absolute top-1 left-1/2 w-1 h-4 sm:h-6 rounded-full transform -translate-x-1/2 origin-bottom transition-all ${getIndicatorColor(color)}`}
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        />
        <div className={`absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center`}>
          <span className="text-xs text-white font-mono">{Math.round(value)}</span>
        </div>
      </div>
      <label className="text-xs text-gray-300 mt-2 text-center">{label}</label>
    </div>
  );
};

export default EQKnob;