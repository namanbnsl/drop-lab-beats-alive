import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Power } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';

interface FXSectionProps {
  reverbAmount: number;
  delayAmount: number;
  onReverbChange: (value: number) => void;
  onDelayChange: (value: number) => void;
}

interface KnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const Knob: React.FC<KnobProps> = ({ label, value, onChange, min = 0, max = 100 }) => {
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

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 rounded-full border-2 border-purple-500/30 cursor-pointer transition-all duration-200 touch-manipulation ${
          isDragging ? 'border-purple-500 shadow-lg shadow-purple-500/25' : 'hover:border-purple-500/50'
        }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className="absolute top-1 left-1/2 w-1 h-4 sm:h-6 bg-purple-400 rounded-full transform -translate-x-1/2 origin-bottom"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        />
        <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
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
  onReverbChange,
  onDelayChange
}) => {
  // Local state for non-functional FX (Distortion & Filter)
  const [distortionDrive, setDistortionDrive] = useState(40);
  const [distortionTone, setDistortionTone] = useState(60);
  const [distortionBypass, setDistortionBypass] = useState(false);

  const [filterCutoff, setFilterCutoff] = useState(70);
  const [filterResonance, setFilterResonance] = useState(20);
  const [filterBypass, setFilterBypass] = useState(false);

  // FX bypass states for functional effects
  const [delayBypass, setDelayBypass] = useState(false);
  const [reverbBypass, setReverbBypass] = useState(false);

  // Convert 0-100 range to 0-1 for Tone.js
  const handleReverbChange = (value: number) => {
    onReverbChange(value / 100);
  };

  const handleDelayChange = (value: number) => {
    onDelayChange(value / 100);
  };

  const fxTooltips = {
    reverb: "Reverb creates space and depth—like placing your sound in a hall, tunnel, or cathedral.",
    delay: "Delay adds echoes. Great for spatial effects and rhythmic bounce.",
    distortion: "Distortion adds grit and edge. Perfect for punchy basslines or gritty leads.",
    filter: "Filters sculpt your sound by removing low or high frequencies. Useful during transitions."
  };

  return (
    <section id="fx" className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-20">
      <motion.div
        className="max-w-6xl mx-auto text-center w-full"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          🎛 Add Some Texture
        </h2>
        
        <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12">
          Shape your sound with professional-grade effects
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Delay - Functional */}
          <motion.div
            className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-purple-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-purple-400">Delay</h3>
                <InfoTooltip content={fxTooltips.delay} />
              </div>
              <motion.button
                onClick={() => setDelayBypass(!delayBypass)}
                className={`p-2 rounded-full transition-colors touch-manipulation ${
                  delayBypass ? 'bg-gray-600 text-gray-400' : 'bg-purple-600 text-white'
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
                value={Math.round(delayAmount * 100)} 
                onChange={handleDelayChange} 
              />
              <Knob label="Feedback" value={40} onChange={() => {}} />
            </div>
          </motion.div>

          {/* Reverb - Functional */}
          <motion.div
            className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-purple-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-purple-400">Reverb</h3>
                <InfoTooltip content={fxTooltips.reverb} />
              </div>
              <motion.button
                onClick={() => setReverbBypass(!reverbBypass)}
                className={`p-2 rounded-full transition-colors touch-manipulation ${
                  reverbBypass ? 'bg-gray-600 text-gray-400' : 'bg-purple-600 text-white'
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
                value={Math.round(reverbAmount * 100)} 
                onChange={handleReverbChange} 
              />
              <Knob label="Size" value={50} onChange={() => {}} />
            </div>
          </motion.div>

          {/* Distortion - Visual Only */}
          <motion.div
            className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-purple-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-purple-400">Distortion</h3>
                <InfoTooltip content={fxTooltips.distortion} />
              </div>
              <motion.button
                onClick={() => setDistortionBypass(!distortionBypass)}
                className={`p-2 rounded-full transition-colors touch-manipulation ${
                  distortionBypass ? 'bg-gray-600 text-gray-400' : 'bg-purple-600 text-white'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Power className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <Knob label="Drive" value={distortionDrive} onChange={setDistortionDrive} />
              <Knob label="Tone" value={distortionTone} onChange={setDistortionTone} />
            </div>
          </motion.div>

          {/* Filter - Visual Only */}
          <motion.div
            className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-purple-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-purple-400">Filter</h3>
                <InfoTooltip content={fxTooltips.filter} />
              </div>
              <motion.button
                onClick={() => setFilterBypass(!filterBypass)}
                className={`p-2 rounded-full transition-colors touch-manipulation ${
                  filterBypass ? 'bg-gray-600 text-gray-400' : 'bg-purple-600 text-white'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Power className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <Knob label="Cutoff" value={filterCutoff} onChange={setFilterCutoff} />
              <Knob label="Resonance" value={filterResonance} onChange={setFilterResonance} />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default FXSection;