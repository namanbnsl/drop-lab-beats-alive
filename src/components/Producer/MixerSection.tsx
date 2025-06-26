import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

interface ChannelStripProps {
  label: string;
  color: string;
}

const ChannelStrip: React.FC<ChannelStripProps> = ({ label, color }) => {
  const [volume, setVolume] = useState(75);
  const [pan, setPan] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isSolo, setIsSolo] = useState(false);

  return (
    <div className="bg-gray-900/50 rounded-xl p-4 border border-purple-500/30 w-full max-w-xs">
      <h3 className={`text-lg font-semibold mb-4 text-center ${color}`}>{label}</h3>
      
      {/* Pan Knob */}
      <div className="flex flex-col items-center mb-6">
        <label className="text-xs text-gray-300 mb-2">Pan</label>
        <div className="relative w-12 h-12 bg-gray-800 rounded-full border-2 border-purple-500/30">
          <div
            className="absolute top-1 left-1/2 w-1 h-4 bg-purple-400 rounded-full transform -translate-x-1/2 origin-bottom"
            style={{ transform: `translateX(-50%) rotate(${(pan - 50) * 2.7}deg)` }}
          />
          <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-mono">{pan}</span>
          </div>
        </div>
      </div>

      {/* Volume Fader */}
      <div className="flex flex-col items-center mb-6">
        <label className="text-xs text-gray-300 mb-2">Volume</label>
        <div className="relative h-32 w-8 bg-gray-800 rounded-full">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' }}
          />
          <div
            className="absolute bottom-0 left-0 w-full bg-purple-500 rounded-full transition-all duration-200"
            style={{ height: `${volume}%` }}
          />
          <div
            className="absolute w-6 h-3 bg-white rounded-sm border border-gray-600 transform -translate-x-1/2 transition-all duration-200"
            style={{ 
              left: '50%',
              bottom: `${volume}%`,
              transform: 'translateX(-50%) translateY(50%)'
            }}
          />
        </div>
        <span className="text-xs text-gray-300 mt-2">{volume}</span>
      </div>

      {/* Mute/Solo Buttons */}
      <div className="flex gap-2">
        <motion.button
          onClick={() => setIsMuted(!isMuted)}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
            isMuted ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMuted ? <VolumeX className="w-4 h-4 mx-auto" /> : 'MUTE'}
        </motion.button>
        
        <motion.button
          onClick={() => setIsSolo(!isSolo)}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
            isSolo ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          SOLO
        </motion.button>
      </div>
    </div>
  );
};

const MixerSection = () => {
  return (
    <section id="mixer" className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        className="max-w-6xl mx-auto text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          🎚 Balance the Mix
        </h2>
        
        <p className="text-xl text-gray-300 mb-12">
          Fine-tune your track levels and create the perfect balance
        </p>

        <div className="flex flex-wrap justify-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <ChannelStrip label="Drums" color="text-red-400" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <ChannelStrip label="Melody" color="text-blue-400" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <ChannelStrip label="FX" color="text-green-400" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <ChannelStrip label="Master" color="text-purple-400" />
          </motion.div>
        </div>

        {/* Master Controls */}
        <motion.div
          className="mt-12 bg-gray-900/50 rounded-xl p-6 border border-purple-500/30 max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-lg font-semibold text-purple-400 mb-4">Master Output</h3>
          <div className="flex items-center justify-center gap-4">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <div className="flex-1 h-2 bg-gray-700 rounded-full">
              <div className="h-full w-3/4 bg-purple-500 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-300">75%</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default MixerSection;