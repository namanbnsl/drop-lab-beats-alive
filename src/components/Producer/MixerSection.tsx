import React from 'react';
import { motion } from 'framer-motion';
import InfoTooltip from '../InfoTooltip';
import VerticalFader from '../VerticalFader';
import ChannelStrip from './ChannelStrip';

interface MixerSectionProps {
  melodyVolume: number;
  drumsVolume: number;
  fxVolume: number;
  masterVolume: number;
  onMelodyVolumeChange: (value: number) => void;
  onDrumsVolumeChange: (value: number) => void;
  onFxVolumeChange: (value: number) => void;
  onMasterVolumeChange: (value: number) => void;
  drumsMuted: boolean;
  melodyMuted: boolean;
  fxMuted: boolean;
  masterMuted: boolean;
  drumsSolo: boolean;
  melodySolo: boolean;
  fxSolo: boolean;
  onDrumsMuteChange: (muted: boolean) => void;
  onMelodyMuteChange: (muted: boolean) => void;
  onFxMuteChange: (muted: boolean) => void;
  onMasterMuteChange: (muted: boolean) => void;
  onDrumsSoloChange: (solo: boolean) => void;
  onMelodySoloChange: (solo: boolean) => void;
  onFxSoloChange: (solo: boolean) => void;
}

const MixerSection: React.FC<MixerSectionProps> = ({
  melodyVolume,
  drumsVolume,
  fxVolume,
  masterVolume,
  onMelodyVolumeChange,
  onDrumsVolumeChange,
  onFxVolumeChange,
  onMasterVolumeChange,
  drumsMuted,
  melodyMuted,
  fxMuted,
  masterMuted,
  drumsSolo,
  melodySolo,
  fxSolo,
  onDrumsMuteChange,
  onMelodyMuteChange,
  onFxMuteChange,
  onMasterMuteChange,
  onDrumsSoloChange,
  onMelodySoloChange,
  onFxSoloChange
}) => {
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
    <section id="mixer" className="px-4 pt-32 pb-8">
      <motion.div
        className="max-w-6xl mx-auto text-center w-full"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 text-white">
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
              onMuteChange={onDrumsMuteChange}
              onSoloChange={onDrumsSoloChange}
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
              onMuteChange={onMelodyMuteChange}
              onSoloChange={onMelodySoloChange}
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
              label="FX Dry/Wet"
              color="text-green-400"
              volume={fxVolume}
              onVolumeChange={onFxVolumeChange}
              onMuteChange={onFxMuteChange}
              onSoloChange={onFxSoloChange}
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
              color="text-blue-400"
              volume={masterVolume}
              onVolumeChange={onMasterVolumeChange}
              onMuteChange={onMasterMuteChange}
              onSoloChange={() => {}} // Master doesn't have solo
              isMuted={masterMuted}
              isSolo={false}
              showSolo={false}
            />
          </motion.div>
        </div>

        {/* Balance Faders */}
        <motion.div
          className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-blue-500/30 max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-base sm:text-lg font-semibold text-blue-400 mb-4 sm:mb-6">Track Balance</h3>
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
                <span className="text-xs sm:text-sm text-green-400 font-semibold">FX Dry/Wet</span>
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
                <span className="text-xs sm:text-sm text-blue-400 font-semibold">Master</span>
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
            className="mt-6 bg-gray-900/50 rounded-xl p-4 border border-blue-500/30 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-sm font-semibold text-blue-400 mb-2">Mixer Status</h4>
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