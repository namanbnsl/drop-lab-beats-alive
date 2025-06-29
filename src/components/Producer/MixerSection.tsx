import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';
import VerticalFader from '../VerticalFader';
import { cn } from '../../lib/utils';

interface MixerSectionProps {
  melodyVolume: number;
  drumsVolume: number;
  fxVolume: number;
  masterVolume: number;
  onMelodyVolumeChange: (value: number) => void;
  onDrumsVolumeChange: (value: number) => void;
  onFxVolumeChange: (value: number) => void;
  onMasterVolumeChange: (value: number) => void;
}

interface ChannelStripProps {
  label: string;
  color: string;
  volume: number;
  onVolumeChange: (value: number) => void;
  onMuteChange: (muted: boolean) => void;
  onSoloChange: (solo: boolean) => void;
  isMuted: boolean;
  isSolo: boolean;
}

const ChannelStrip: React.FC<ChannelStripProps> = ({ 
  label, 
  color, 
  volume, 
  onVolumeChange, 
  onMuteChange, 
  onSoloChange,
  isMuted,
  isSolo
}) => {
  const [pan, setPan] = useState(50);

  const mixerTooltips = {
    volume: "Adjusts how loud the track is in the final mix. Slide up to make it louder.",
    pan: "Moves the sound left or right in stereo. Use it to widen your mix.",
    muteSolo: "Mute silences a track. Solo lets you isolate it for focused listening."
  };

  const handleVolumeChange = (newValue: number) => {
    if (!isMuted) {
      onVolumeChange(newValue);
    }
  };

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    onMuteChange(newMuted);
    
    if (newMuted && isSolo) {
      // If muting a solo'd track, turn off solo
      onSoloChange(false);
    }
    
    console.log(`🔇 ${label} ${newMuted ? 'muted' : 'unmuted'}`);
  };

  const handleSoloToggle = () => {
    const newSolo = !isSolo;
    onSoloChange(newSolo);
    
    if (newSolo && isMuted) {
      // If soloing a muted track, unmute it
      onMuteChange(false);
    }
    
    console.log(`🎯 ${label} solo ${newSolo ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="bg-gray-900/50 rounded-xl p-3 sm:p-4 border border-purple-500/30 w-full max-w-xs mx-auto">
      <h3 className={cn("text-base sm:text-lg font-semibold mb-4 text-center", color)}>{label}</h3>
      
      {/* Pan Knob */}
      <div className="flex flex-col items-center mb-4 sm:mb-6">
        <div className="flex items-center gap-1 mb-2">
          <label className="text-xs text-gray-300">Pan</label>
          <InfoTooltip content={mixerTooltips.pan} />
        </div>
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-full border-2 border-purple-500/30 touch-manipulation">
          <div
            className="absolute top-1 left-1/2 w-1 h-3 sm:h-4 bg-purple-400 rounded-full transform -translate-x-1/2 origin-bottom"
            style={{ transform: `translateX(-50%) rotate(${(pan - 50) * 2.7}deg)` }}
          />
          <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-mono">{pan}</span>
          </div>
        </div>
      </div>

      {/* Volume Fader */}
      <div className="flex flex-col items-center mb-4 sm:mb-6">
        <div className="flex items-center gap-1 mb-2">
          <label className="text-xs text-gray-300">Volume</label>
          <InfoTooltip content={mixerTooltips.volume} />
        </div>
        <VerticalFader
          label=""
          value={volume}
          onChange={handleVolumeChange}
          isMuted={isMuted}
          className="scale-90 sm:scale-100"
        />
      </div>

      {/* Mute/Solo Buttons */}
      <div className="flex gap-1 sm:gap-2">
        <div className="flex items-center gap-1 flex-1">
          <motion.button
            onClick={handleMuteToggle}
            className={cn(
              "flex-1 py-2 px-2 sm:px-3 rounded-lg font-semibold text-xs sm:text-sm transition-colors touch-manipulation",
              isMuted ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMuted ? <VolumeX className="w-3 h-3 sm:w-4 sm:h-4 mx-auto" /> : 'MUTE'}
          </motion.button>
          <InfoTooltip content={mixerTooltips.muteSolo} />
        </div>
        
        <motion.button
          onClick={handleSoloToggle}
          className={cn(
            "flex-1 py-2 px-2 sm:px-3 rounded-lg font-semibold text-xs sm:text-sm transition-colors touch-manipulation",
            isSolo ? 'bg-yellow-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          SOLO
        </motion.button>
      </div>

      {/* Status Indicators */}
      {(isMuted || isSolo) && (
        <div className="mt-2 text-center">
          {isMuted && <div className="text-xs text-red-400">🔇 MUTED</div>}
          {isSolo && <div className="text-xs text-yellow-400">🎯 SOLO</div>}
        </div>
      )}
    </div>
  );
};

const MixerSection: React.FC<MixerSectionProps> = ({
  melodyVolume,
  drumsVolume,
  fxVolume,
  masterVolume,
  onMelodyVolumeChange,
  onDrumsVolumeChange,
  onFxVolumeChange,
  onMasterVolumeChange
}) => {
  // Mute/Solo states for each channel
  const [drumsMuted, setDrumsMuted] = useState(false);
  const [melodyMuted, setMelodyMuted] = useState(false);
  const [fxMuted, setFxMuted] = useState(false);
  const [masterMuted, setMasterMuted] = useState(false);

  const [drumsSolo, setDrumsSolo] = useState(false);
  const [melodySolo, setMelodySolo] = useState(false);
  const [fxSolo, setFxSolo] = useState(false);

  // Handle solo logic - when one channel is solo'd, others are effectively muted
  const handleSoloChange = (channel: 'drums' | 'melody' | 'fx', solo: boolean) => {
    switch (channel) {
      case 'drums':
        setDrumsSolo(solo);
        if (solo) {
          setMelodySolo(false);
          setFxSolo(false);
        }
        break;
      case 'melody':
        setMelodySolo(solo);
        if (solo) {
          setDrumsSolo(false);
          setFxSolo(false);
        }
        break;
      case 'fx':
        setFxSolo(solo);
        if (solo) {
          setDrumsSolo(false);
          setMelodySolo(false);
        }
        break;
    }
  };

  // Calculate effective volume considering mute/solo states
  const getEffectiveVolume = (volume: number, isMuted: boolean, isSolo: boolean, anySolo: boolean) => {
    if (isMuted || masterMuted) return 0;
    if (anySolo && !isSolo) return 0; // If any channel is solo'd and this isn't it, mute this
    return volume;
  };

  const anySolo = drumsSolo || melodySolo || fxSolo;

  // Apply effective volumes to the audio system
  const effectiveDrumsVolume = getEffectiveVolume(drumsVolume, drumsMuted, drumsSolo, anySolo);
  const effectiveMelodyVolume = getEffectiveVolume(melodyVolume, melodyMuted, melodySolo, anySolo);
  const effectiveFxVolume = getEffectiveVolume(fxVolume, fxMuted, fxSolo, anySolo);
  const effectiveMasterVolume = masterMuted ? 0 : masterVolume;

  const balanceTooltips = {
    drums: "Controls the overall loudness of your drum tracks.",
    melody: "Adjusts the level of your generated or composed melodies.",
    fx: "Controls how present your added effects are in the mix.",
    master: "Controls the final output volume of the entire track."
  };

  return (
    <section id="mixer" className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-20">
      <motion.div
        className="max-w-6xl mx-auto text-center w-full"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          🎚 Balance the Mix
        </h2>
        
        <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12">
          Fine-tune your track levels and create the perfect balance
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <ChannelStrip 
              label="Drums" 
              color="text-red-400"
              volume={drumsVolume}
              onVolumeChange={onDrumsVolumeChange}
              onMuteChange={setDrumsMuted}
              onSoloChange={(solo) => handleSoloChange('drums', solo)}
              isMuted={drumsMuted}
              isSolo={drumsSolo}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <ChannelStrip 
              label="Melody" 
              color="text-blue-400"
              volume={melodyVolume}
              onVolumeChange={onMelodyVolumeChange}
              onMuteChange={setMelodyMuted}
              onSoloChange={(solo) => handleSoloChange('melody', solo)}
              isMuted={melodyMuted}
              isSolo={melodySolo}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <ChannelStrip 
              label="FX" 
              color="text-green-400"
              volume={fxVolume}
              onVolumeChange={onFxVolumeChange}
              onMuteChange={setFxMuted}
              onSoloChange={(solo) => handleSoloChange('fx', solo)}
              isMuted={fxMuted}
              isSolo={fxSolo}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <ChannelStrip 
              label="Master" 
              color="text-purple-400"
              volume={masterVolume}
              onVolumeChange={onMasterVolumeChange}
              onMuteChange={setMasterMuted}
              onSoloChange={() => {}} // Master doesn't have solo
              isMuted={masterMuted}
              isSolo={false}
            />
          </motion.div>
        </div>

        {/* Balance Faders */}
        <motion.div
          className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-purple-500/30 max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-base sm:text-lg font-semibold text-purple-400 mb-4 sm:mb-6">Track Balance</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs sm:text-sm text-red-400 font-semibold">Drums</span>
                <InfoTooltip content={balanceTooltips.drums} />
              </div>
              <VerticalFader
                label=""
                value={effectiveDrumsVolume}
                onChange={onDrumsVolumeChange}
                isMuted={drumsMuted || (anySolo && !drumsSolo)}
                className="scale-75 sm:scale-100"
              />
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs sm:text-sm text-blue-400 font-semibold">Melody</span>
                <InfoTooltip content={balanceTooltips.melody} />
              </div>
              <VerticalFader
                label=""
                value={effectiveMelodyVolume}
                onChange={onMelodyVolumeChange}
                isMuted={melodyMuted || (anySolo && !melodySolo)}
                className="scale-75 sm:scale-100"
              />
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs sm:text-sm text-green-400 font-semibold">FX</span>
                <InfoTooltip content={balanceTooltips.fx} />
              </div>
              <VerticalFader
                label=""
                value={effectiveFxVolume}
                onChange={onFxVolumeChange}
                isMuted={fxMuted || (anySolo && !fxSolo)}
                className="scale-75 sm:scale-100"
              />
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs sm:text-sm text-purple-400 font-semibold">Master</span>
                <InfoTooltip content={balanceTooltips.master} />
              </div>
              <VerticalFader
                label=""
                value={effectiveMasterVolume}
                onChange={onMasterVolumeChange}
                isMuted={masterMuted}
                className="scale-75 sm:scale-100"
              />
            </div>
          </div>
        </motion.div>

        {/* Mixer Status Display */}
        {(anySolo || drumsMuted || melodyMuted || fxMuted || masterMuted) && (
          <motion.div
            className="mt-6 bg-gray-900/50 rounded-xl p-4 border border-purple-500/30 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Mixer Status</h4>
            <div className="flex flex-wrap gap-2 justify-center text-xs">
              {drumsSolo && <span className="bg-yellow-600 text-white px-2 py-1 rounded">🎯 Drums SOLO</span>}
              {melodySolo && <span className="bg-yellow-600 text-white px-2 py-1 rounded">🎯 Melody SOLO</span>}
              {fxSolo && <span className="bg-yellow-600 text-white px-2 py-1 rounded">🎯 FX SOLO</span>}
              {drumsMuted && <span className="bg-red-600 text-white px-2 py-1 rounded">🔇 Drums MUTE</span>}
              {melodyMuted && <span className="bg-red-600 text-white px-2 py-1 rounded">🔇 Melody MUTE</span>}
              {fxMuted && <span className="bg-red-600 text-white px-2 py-1 rounded">🔇 FX MUTE</span>}
              {masterMuted && <span className="bg-red-600 text-white px-2 py-1 rounded">🔇 MASTER MUTE</span>}
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default MixerSection;