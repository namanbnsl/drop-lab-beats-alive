
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';
import VerticalFader from '../VerticalFader';

interface ChannelStripProps {
  label: string;
  color: string;
}

const ChannelStrip: React.FC<ChannelStripProps> = ({ label, color }) => {
  const [volume, setVolume] = useState(25); // Inverted: 0 = loud, 100 = silent
  const [pan, setPan] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isSolo, setIsSolo] = useState(false);

  const mixerTooltips = {
    volume: "Adjusts how loud the track is in the final mix. Slide down to make it quieter.",
    pan: "Moves the sound left or right in stereo. Use it to widen your mix.",
    muteSolo: "Mute silences a track. Solo lets you isolate it for focused listening."
  };

  return (
    <div className="bg-gray-900/50 rounded-xl p-4 border border-purple-500/30 w-full max-w-xs">
      <h3 className={`text-lg font-semibold mb-4 text-center ${color}`}>{label}</h3>
      
      {/* Pan Knob */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-1 mb-2">
          <label className="text-xs text-gray-300">Pan</label>
          {/* Tooltip: Pan Knob */}
          <InfoTooltip content={mixerTooltips.pan} />
        </div>
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
        <div className="flex items-center gap-1 mb-2">
          <label className="text-xs text-gray-300">Volume</label>
          {/* Tooltip: Volume Fader */}
          <InfoTooltip content={mixerTooltips.volume} />
        </div>
        <VerticalFader
          label=""
          value={volume}
          onChange={setVolume}
        />
      </div>

      {/* Mute/Solo Buttons */}
      <div className="flex gap-2">
        <div className="flex items-center gap-1">
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
          {/* Tooltip: Mute / Solo */}
          <InfoTooltip content={mixerTooltips.muteSolo} />
        </div>
        
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
  const [drumsLevel, setDrumsLevel] = useState(25);
  const [melodyLevel, setMelodyLevel] = useState(25);
  const [fxLevel, setFxLevel] = useState(25);
  const [masterLevel, setMasterLevel] = useState(25);

  const balanceTooltips = {
    drums: "Controls the overall loudness of your drum tracks.",
    melody: "Adjusts the level of your generated or composed melodies.",
    fx: "Controls how present your added effects are in the mix.",
    master: "Controls the final output volume of the entire track."
  };

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

        {/* Balance Faders */}
        <motion.div
          className="mt-12 bg-gray-900/50 rounded-xl p-6 border border-purple-500/30 max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-lg font-semibold text-purple-400 mb-6">Track Balance</h3>
          <div className="flex justify-center gap-8">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-sm text-red-400 font-semibold">Drums</span>
                {/* Tooltip: Drums Balance Fader */}
                <InfoTooltip content={balanceTooltips.drums} />
              </div>
              <VerticalFader
                label=""
                value={drumsLevel}
                onChange={setDrumsLevel}
              />
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-sm text-blue-400 font-semibold">Melody</span>
                {/* Tooltip: Melody Balance Fader */}
                <InfoTooltip content={balanceTooltips.melody} />
              </div>
              <VerticalFader
                label=""
                value={melodyLevel}
                onChange={setMelodyLevel}
              />
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-sm text-green-400 font-semibold">FX</span>
                {/* Tooltip: FX Balance Fader */}
                <InfoTooltip content={balanceTooltips.fx} />
              </div>
              <VerticalFader
                label=""
                value={fxLevel}
                onChange={setFxLevel}
              />
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-sm text-purple-400 font-semibold">Master</span>
                {/* Tooltip: Master Balance Fader */}
                <InfoTooltip content={balanceTooltips.master} />
              </div>
              <VerticalFader
                label=""
                value={masterLevel}
                onChange={setMasterLevel}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default MixerSection;
