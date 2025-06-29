import React from 'react';
import { motion } from 'framer-motion';
import { VolumeX } from 'lucide-react';
import InfoTooltip from '../InfoTooltip';
import VerticalFader from '../VerticalFader';
import { cn } from '../../lib/utils';

interface ChannelStripProps {
  label: string;
  color: string;
  volume: number;
  onVolumeChange: (value: number) => void;
  onMuteChange: (muted: boolean) => void;
  onSoloChange: (solo: boolean) => void;
  isMuted: boolean;
  isSolo: boolean;
  showSolo?: boolean;
}

const ChannelStrip: React.FC<ChannelStripProps> = ({
  label,
  color,
  volume,
  onVolumeChange,
  onMuteChange,
  onSoloChange,
  isMuted,
  isSolo,
  showSolo = true
}) => {
  const mixerTooltips = {
    volume: "Adjusts how loud the track is in the final mix. Slide up to make it louder.",
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
    <div className="bg-gray-900/50 rounded-xl p-3 sm:p-4 border border-blue-500/30 w-full max-w-xs mx-auto">
      <h3 className={cn("text-base sm:text-lg font-semibold mb-4 text-center", color)}>{label}</h3>

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
              "flex-1 py-2 px-2 sm:px-3 rounded-lg font-semibold text-xs sm:text-sm transition-colors touch-manipulation btn-glow",
              isMuted ? 'bg-red-600 text-white shadow-lg btn-glow-red' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMuted ? <VolumeX className="w-3 h-3 sm:w-4 sm:h-4 mx-auto" /> : 'MUTE'}
          </motion.button>
          <InfoTooltip content={mixerTooltips.muteSolo} />
        </div>

        {showSolo && (
          <motion.button
            onClick={handleSoloToggle}
            className={cn(
              "flex-1 py-2 px-2 sm:px-3 rounded-lg font-semibold text-xs sm:text-sm transition-colors touch-manipulation btn-glow",
              isSolo ? 'bg-yellow-600 text-white shadow-lg btn-glow-yellow' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            SOLO
          </motion.button>
        )}
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

export default ChannelStrip;