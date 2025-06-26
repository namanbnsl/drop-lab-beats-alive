
import React, { useState, useRef } from 'react';

interface VerticalFaderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const VerticalFader: React.FC<VerticalFaderProps> = ({ 
  label, 
  value, 
  onChange, 
  className = "" 
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
      const percentage = Math.max(0, Math.min(100, (y / rect.height) * 100));
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

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <label className="text-xs text-gray-300 mb-2">{label}</label>
      
      <div className="relative">
        {/* Fader Rail */}
        <div
          ref={faderRef}
          className={`relative h-36 w-4 bg-gray-800 rounded-full cursor-pointer transition-all duration-200 ${
            isDragging ? 'bg-gray-700' : 'hover:bg-gray-700'
          }`}
          onMouseDown={handleMouseDown}
        >
          {/* Active Fill */}
          <div
            className="absolute bottom-0 left-0 w-full bg-purple-500 rounded-full transition-all duration-100"
            style={{ height: `${100 - value}%` }}
          />
          
          {/* Fader Handle */}
          <div
            className={`absolute w-6 h-3 bg-white rounded-sm border border-gray-600 transform -translate-x-1/2 transition-all duration-100 ${
              isDragging ? 'shadow-lg shadow-purple-500/50 scale-110' : 'hover:shadow-md hover:shadow-purple-500/30'
            }`}
            style={{ 
              left: '50%',
              top: `${value}%`,
              transform: 'translateX(-50%) translateY(-50%)'
            }}
          />
        </div>
        
        {/* Value Display */}
        {showValue && (
          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 bg-black border border-purple-500 text-white text-xs px-2 py-1 rounded">
            {100 - value}%
          </div>
        )}
      </div>
      
      <span className="text-xs text-gray-300 mt-2">{100 - value}%</span>
    </div>
  );
};

export default VerticalFader;
