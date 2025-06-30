import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Power } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';

interface FXSectionProps {
  reverbAmount: number;
  delayAmount: number;
  distortionAmount: number;
  filterAmount: number;
  onReverbChange: (value: number) => void;
  onDelayChange: (value: number) => void;
  onDistortionChange: (value: number) => void;
  onFilterChange: (value: number) => void;
}

interface KnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  color?: string;
}

const Knob: React.FC<KnobProps> = ({ label, value, onChange, min = 0, max = 100, color = 'purple' }) => {
  const [isDragging, setIsDragging] = useState(false);
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
        className={`relative w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 rounded-full border-2 cursor-pointer transition-all duration-200 touch-manipulation ${isDragging ? `${getColorClass(color)} shadow-lg shadow-${color}-500/25` : `border-gray-600 hover:${getColorClass(color)}`
          }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className={`absolute top-1 left-1/2 w-1 h-4 sm:h-6 rounded-full transform -translate-x-1/2 origin-bottom transition-all ${getIndicatorColor(color)
            }`}
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        />
        <div className={`absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center`}>
          <span className="text-xs text-white font-mono">{value}</span>
        </div>
      </div>
      <label className="text-xs text-gray-300 mt-2 text-center">{label}</label>
    </div>
  );
};

const FXSection: React.FC<FXSectionProps> = ({
  reverbAmount,
  delayAmount,
  distortionAmount,
  filterAmount,
  onReverbChange,
  onDelayChange,
  onDistortionChange,
  onFilterChange
}) => {
  // FX bypass states
  const [delayBypass, setDelayBypass] = useState(false);
  const [reverbBypass, setReverbBypass] = useState(false);
  const [distortionBypass, setDistortionBypass] = useState(false);
  const [filterBypass, setFilterBypass] = useState(false);

  // Convert 0-100 range to 0-1 for Tone.js
  const handleReverbChange = (value: number) => {
    onReverbChange(reverbBypass ? 0 : value);
  };

  const handleDelayChange = (value: number) => {
    onDelayChange(delayBypass ? 0 : value);
  };

  const handleDistortionChange = (value: number) => {
    onDistortionChange(distortionBypass ? 0 : value);
  };

  const handleFilterChange = (value: number) => {
    onFilterChange(filterBypass ? 50 : value); // 50 is neutral position
  };

  const fxTooltips = {
    reverb: "Reverb creates space and depth—like placing your sound in a hall, tunnel, or cathedral.",
    delay: "Delay adds echoes. Great for spatial effects and rhythmic bounce.",
    distortion: "Distortion adds grit and edge. Perfect for punchy basslines or gritty leads.",
    filter: "Filters sculpt your sound. 0-50 = low-pass sweep, 50-100 = high-pass sweep."
  };

  return (
    <section id="fx" className="px-4 pt-32 pb-8">
      <motion.div
        className="max-w-6xl mx-auto text-center w-full"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 text-white">
          🎛 Add Some Texture
        </h2>

        <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12">
          Shape your sound with professional-grade effects
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Delay - Functional */}
          <motion.div
            className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-blue-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-white">Delay</h3>
                <InfoTooltip content={fxTooltips.delay} />
              </div>
              <motion.button
                onClick={() => {
                  setDelayBypass(!delayBypass);
                  onDelayChange(delayBypass ? delayAmount : 0);
                }}
                className={`p-2 rounded-full transition-colors touch-manipulation ${delayBypass ? 'bg-gray-600 text-gray-400' : 'bg-blue-600 text-white'
                  }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Power className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <Knob
                label="Amount"
                value={delayAmount}
                onChange={handleDelayChange}
                color="purple"
              />
            </div>
          </motion.div>

          {/* Reverb - Functional */}
          <motion.div
            className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-blue-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-white">Reverb</h3>
                <InfoTooltip content={fxTooltips.reverb} />
              </div>
              <motion.button
                onClick={() => {
                  setReverbBypass(!reverbBypass);
                  onReverbChange(reverbBypass ? reverbAmount : 0);
                }}
                className={`p-2 rounded-full transition-colors touch-manipulation ${reverbBypass ? 'bg-gray-600 text-gray-400' : 'bg-green-600 text-white'
                  }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Power className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <Knob
                label="Amount"
                value={reverbAmount}
                onChange={handleReverbChange}
                color="green"
              />
            </div>
          </motion.div>

          {/* Distortion - Functional */}
          <motion.div
            className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-blue-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-white">Distortion</h3>
                <InfoTooltip content={fxTooltips.distortion} />
              </div>
              <motion.button
                onClick={() => {
                  setDistortionBypass(!distortionBypass);
                  onDistortionChange(distortionBypass ? distortionAmount : 0);
                }}
                className={`p-2 rounded-full transition-colors touch-manipulation ${distortionBypass ? 'bg-gray-600 text-gray-400' : 'bg-red-600 text-white'
                  }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Power className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <Knob
                label="Drive"
                value={distortionAmount}
                onChange={handleDistortionChange}
                color="red"
              />
            </div>
          </motion.div>

          {/* Filter - Functional */}
          <motion.div
            className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-blue-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-white">Filter</h3>
                <InfoTooltip content={fxTooltips.filter} />
              </div>
              <motion.button
                onClick={() => {
                  setFilterBypass(!filterBypass);
                  onFilterChange(filterBypass ? filterAmount : 50);
                }}
                className={`p-2 rounded-full transition-colors touch-manipulation ${filterBypass ? 'bg-gray-600 text-gray-400' : 'bg-blue-600 text-white'
                  }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Power className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <Knob
                label="Cutoff"
                value={filterAmount}
                onChange={handleFilterChange}
                color="blue"
              />
            </div>
          </motion.div>
        </div>

        {/* FX Status Display */}
        <motion.div
          className="mt-8 sm:mt-12 bg-gray-900/30 rounded-xl p-4 sm:p-6 border border-blue-500/20 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Active Effects</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="text-white font-medium">Delay</p>
              <p className={`text-xs ${delayBypass ? 'text-gray-500' : 'text-white'}`}>
                {delayBypass ? 'Bypassed' : `${delayAmount}%`}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white font-medium">Reverb</p>
              <p className={`text-xs ${reverbBypass ? 'text-gray-500' : 'text-white'}`}>
                {reverbBypass ? 'Bypassed' : `${reverbAmount}%`}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white font-medium">Distortion</p>
              <p className={`text-xs ${distortionBypass ? 'text-gray-500' : 'text-white'}`}>
                {distortionBypass ? 'Bypassed' : `${distortionAmount}%`}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white font-medium">Filter</p>
              <p className={`text-xs ${filterBypass ? 'text-gray-500' : 'text-white'}`}>
                {filterBypass ? 'Bypassed' : `${filterAmount}%`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          className="mt-8 sm:mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400 text-xs sm:text-sm mb-4">
            🎛️ Drag knobs to adjust effect intensity • Power buttons to bypass effects
          </p>
          <p className="text-gray-500 text-xs">
            Filter: 0-50 = Low-pass sweep • 50-100 = High-pass sweep
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default FXSection;