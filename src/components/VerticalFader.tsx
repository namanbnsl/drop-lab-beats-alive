import React, { useState, useRef } from 'react';

interface VerticalFaderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  isMuted?: boolean;
  onMuteChange?: (muted: boolean) => void;
}

const VerticalFader: React.FC<VerticalFaderProps> = ({
  label,
  value,
  onChange,
  className = "",
  isMuted = false,
  onMuteChange
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showValue, setShowValue] = useState(false);
  const faderRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setShowValue(true);

    const updateValue = (clientY: number) => {
      if (!faderRef.current) return;

      const rect = faderRef.current.getBoundingClientRect();
      const y = clientY - rect.top;
      // FIXED: Invert the calculation so top = 100%, bottom = 0%
      const percentage = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
      onChange(Math.round(percentage));
    };

    updateValue(e.clientY);

    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setShowValue(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setShowValue(true);

    const updateValue = (clientY: number) => {
      if (!faderRef.current) return;

      const rect = faderRef.current.getBoundingClientRect();
      const y = clientY - rect.top;
      // FIXED: Invert the calculation so top = 100%, bottom = 0%
      const percentage = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
      onChange(Math.round(percentage));
    };

    const touch = e.touches[0];
    updateValue(touch.clientY);

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      updateValue(touch.clientY);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      setShowValue(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  // FIXED: Calculate handle position correctly (inverted)
  const handlePosition = 100 - value; // Top = 0%, Bottom = 100%

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label && <label className="text-xs text-white mb-2">{label}</label>}

      <div className="relative">
        {/* Fader Rail */}
        <div
          ref={faderRef}
          className={`relative h-24 sm:h-36 w-3 sm:w-4 bg-gray-800 rounded-full cursor-pointer transition-all duration-200 touch-manipulation ${isDragging ? 'bg-gray-700' : 'hover:bg-gray-700'
            } ${isMuted ? 'opacity-50' : ''}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Active Fill - FIXED: Fill from bottom up */}
          <div
            className={`absolute bottom-0 left-0 w-full rounded-full transition-all duration-100 ${isMuted ? 'bg-red-500' : 'bg-blue-500'
              }`}
            style={{ height: `${value}%` }}
          />

          {/* Fader Handle - FIXED: Position correctly and make it blue */}
          <div
            className={`absolute w-5 h-2 sm:w-6 sm:h-3 bg-blue-500 rounded-sm border border-blue-600 transform -translate-x-1/2 transition-all duration-100 touch-manipulation ${isDragging ? 'shadow-lg shadow-blue-500/50 scale-110' : 'hover:shadow-md hover:shadow-blue-500/30'
              } ${isMuted ? 'bg-red-300 border-red-500' : ''}`}
            style={{
              left: '50%',
              top: `${handlePosition}%`,
              transform: 'translateX(-50%) translateY(-50%)'
            }}
          />
        </div>

        {/* Value Display */}
        {showValue && (
          <div className="absolute -right-6 sm:-right-8 top-1/2 transform -translate-y-1/2 bg-black border border-blue-500 text-white text-xs px-2 py-1 rounded z-10">
            {value}%
          </div>
        )}
      </div>

      <span className={`text-xs mt-2 ${isMuted ? 'text-red-400' : 'text-white'}`}>
        {isMuted ? 'MUTE' : `${value}%`}
      </span>
    </div>
  );
};

export default VerticalFader;