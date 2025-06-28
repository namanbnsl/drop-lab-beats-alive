import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Send, FileAudio, Music, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExportSectionProps {
  onExportMelody: () => void;
  onExportDrums: () => void;
  onExportAudio: () => void;
  onPlayTrack: () => void;
  hasGeneratedContent: boolean;
  isPlaying: boolean;
  isRecording: boolean;
}

const ExportSection: React.FC<ExportSectionProps> = ({
  onExportMelody,
  onExportDrums,
  onExportAudio,
  onPlayTrack,
  hasGeneratedContent,
  isPlaying,
  isRecording
}) => {
  const navigate = useNavigate();

  const handleSendToDJ = () => {
    navigate('/dj');
  };

  return (
    <section id="export" className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-20">
      <motion.div
        className="max-w-4xl mx-auto text-center w-full"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          💾 Time to Drop It
        </h2>
        
        <p className="text-lg sm:text-xl text-gray-300 mb-2 sm:mb-4">
          You made it. Now drop it.
        </p>
        
        <p className="text-base sm:text-lg text-gray-400 mb-8 sm:mb-12">
          Export your AI-generated masterpiece or take it straight to the DJ booth
        </p>

        {/* Play/Pause Button */}
        {hasGeneratedContent && (
          <motion.div
            className="mb-8 sm:mb-12"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <motion.button
              onClick={onPlayTrack}
              className="group relative px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full font-bold text-lg sm:text-2xl text-white transition-all duration-300 hover:from-purple-500 hover:to-purple-400 hover:shadow-xl hover:shadow-purple-500/25 touch-manipulation"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-3 justify-center">
                {isPlaying ? (
                  <>
                    <Pause className="w-6 h-6 sm:w-8 sm:h-8" />
                    <span className="hidden sm:inline">Stop Track</span>
                    <span className="sm:hidden">Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 sm:w-8 sm:h-8" />
                    <span className="hidden sm:inline">Play Full Track</span>
                    <span className="sm:hidden">Play</span>
                  </>
                )}
              </span>
            </motion.button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Export Melody as MIDI */}
          <motion.div
            className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-purple-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="mb-4 sm:mb-6">
              <Music className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Export Melody</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Download your AI-generated melody as MIDI</p>
            </div>
            
            <motion.button
              onClick={onExportMelody}
              disabled={!hasGeneratedContent}
              className="w-full py-3 px-4 bg-purple-600 rounded-full font-semibold text-white hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm touch-manipulation"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2 justify-center">
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                Melody MIDI
              </span>
            </motion.button>
          </motion.div>

          {/* Export Drums as MIDI */}
          <motion.div
            className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-purple-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="mb-4 sm:mb-6">
              <Music className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Export Drums</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Download your AI-generated drums as MIDI</p>
            </div>
            
            <motion.button
              onClick={onExportDrums}
              disabled={!hasGeneratedContent}
              className="w-full py-3 px-4 bg-purple-600 rounded-full font-semibold text-white hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm touch-manipulation"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2 justify-center">
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                Drums MIDI
              </span>
            </motion.button>
          </motion.div>

          {/* Export as WAV - Now Functional */}
          <motion.div
            className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-purple-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="mb-4 sm:mb-6">
              <FileAudio className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Export Audio</h3>
              <p className="text-gray-400 text-xs sm:text-sm">High-quality audio file ready for streaming</p>
            </div>
            
            <motion.button
              onClick={onExportAudio}
              disabled={isRecording || !hasGeneratedContent}
              className="w-full py-3 px-4 bg-purple-600 rounded-full font-semibold text-white hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm touch-manipulation"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2 justify-center">
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                {isRecording ? 'Recording...' : 'Export Audio'}
              </span>
            </motion.button>
          </motion.div>

          {/* Send to DJ Mode */}
          <motion.div
            className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-purple-500/30"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="mb-4 sm:mb-6">
              <Send className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">DJ Mode</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Take your track straight to the decks</p>
            </div>
            
            <motion.button
              onClick={handleSendToDJ}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full font-semibold text-white hover:from-purple-500 hover:to-purple-400 transition-all duration-300 shadow-lg shadow-purple-500/25 text-xs sm:text-sm touch-manipulation"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2 justify-center">
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                Enter DJ Booth
              </span>
            </motion.button>
          </motion.div>
        </div>

        {/* Content Status */}
        {!hasGeneratedContent && (
          <div className="mb-6 sm:mb-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-xs sm:text-sm">
              🎵 Generate some melodies or drums first to unlock export options!
            </p>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <motion.div
            className="mt-6 sm:mt-8 bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-purple-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-purple-400 font-semibold text-sm sm:text-base">Recording your AI-generated track...</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-purple-500 h-2 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 8, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          className="mt-12 sm:mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400 text-xs sm:text-sm mb-4">
            🎉 Congratulations! You've created your first AI-powered DropLab track.
          </p>
          <p className="text-gray-500 text-xs">
            Ready to take it to the next level? Try DJ Mode and mix with other tracks.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ExportSection;