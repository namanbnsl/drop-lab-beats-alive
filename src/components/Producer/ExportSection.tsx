import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Send, FileAudio, Music, Play, Pause, AlertCircle, CheckCircle, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MIDIExporter } from '../../lib/midiExporter';
import { AudioRecorder } from '../../lib/audioRecorder';

interface Note {
  pitch: number;
  velocity: number;
  startTime: number;
  duration: number;
}

interface DrumPattern {
  kick: boolean[];
  snare: boolean[];
  hihat: boolean[];
  crash: boolean[];
}

interface ExportSectionProps {
  onExportMelody: () => void;
  onExportDrums: () => void;
  onExportAudio: () => void;
  onPlayTrack: () => void;
  hasGeneratedContent: boolean;
  isPlaying: boolean;
  isRecording: boolean;
  melodyNotes?: Note[];
  drumPattern?: DrumPattern;
  tempo?: number;
}

const ExportSection: React.FC<ExportSectionProps> = ({
  onPlayTrack,
  hasGeneratedContent,
  isPlaying,
  melodyNotes = [],
  drumPattern = { kick: [], snare: [], hihat: [], crash: [] },
  tempo = 120
}) => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setExportStatus({ type, message });
    setTimeout(() => {
      setExportStatus({ type: null, message: '' });
    }, 3000);
  };

  const handleExportMelody = () => {
    try {
      if (melodyNotes.length === 0) {
        showStatus('error', 'No melody notes to export. Create some notes first!');
        return;
      }

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `droplab-melody-${timestamp}`;
      
      MIDIExporter.exportMelody(melodyNotes, tempo, filename);
      showStatus('success', 'Melody exported successfully as MIDI!');
    } catch (error) {
      console.error('Failed to export melody:', error);
      showStatus('error', 'Failed to export melody. Please try again.');
    }
  };

  const handleExportDrums = () => {
    try {
      const hasAnyDrums = Object.values(drumPattern).some(pattern => 
        pattern.some(step => step)
      );

      if (!hasAnyDrums) {
        showStatus('error', 'No drum pattern to export. Create a drum pattern first!');
        return;
      }

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `droplab-drums-${timestamp}`;
      
      MIDIExporter.exportDrums(drumPattern, tempo, filename);
      showStatus('success', 'Drum pattern exported successfully as MIDI!');
    } catch (error) {
      console.error('Failed to export drums:', error);
      showStatus('error', 'Failed to export drums. Please try again.');
    }
  };

  const handleExportAudio = async () => {
    try {
      if (!hasGeneratedContent) {
        showStatus('error', 'No content to record. Create some music first!');
        return;
      }

      setIsRecording(true);
      setRecordingProgress(0);

      // Initialize audio recorder
      if (!audioRecorderRef.current) {
        audioRecorderRef.current = new AudioRecorder();
      }

      // Start recording
      await audioRecorderRef.current.startRecording();

      // Start the track if not already playing
      if (!isPlaying) {
        onPlayTrack();
      }

      // Record for 8 seconds (2 bars at 120 BPM)
      const recordingDuration = 8000; // 8 seconds
      const progressInterval = 100; // Update every 100ms

      recordingIntervalRef.current = setInterval(() => {
        setRecordingProgress(prev => {
          const newProgress = prev + (progressInterval / recordingDuration) * 100;
          return Math.min(newProgress, 100);
        });
      }, progressInterval);

      // Stop recording after duration
      setTimeout(async () => {
        try {
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
          }

          const audioBlob = await audioRecorderRef.current!.stopRecording();
          
          // Generate filename with timestamp
          const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
          const filename = `droplab-track-${timestamp}`;
          
          // Download the audio file
          AudioRecorder.downloadAudio(audioBlob, filename);
          
          setIsRecording(false);
          setRecordingProgress(0);
          showStatus('success', 'Audio track exported successfully!');
        } catch (error) {
          console.error('Failed to export audio:', error);
          setIsRecording(false);
          setRecordingProgress(0);
          showStatus('error', 'Failed to export audio. Please try again.');
        }
      }, recordingDuration);

    } catch (error) {
      console.error('Failed to start audio export:', error);
      setIsRecording(false);
      setRecordingProgress(0);
      showStatus('error', 'Failed to start audio recording. Please try again.');
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (audioRecorderRef.current) {
        audioRecorderRef.current.dispose();
      }
    };
  }, []);

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
          Export your masterpiece
        </p>

        {/* Status Messages */}
        {exportStatus.type && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-lg border ${
              exportStatus.type === 'success' 
                ? 'bg-green-900/20 border-green-500/30 text-green-400' 
                : 'bg-red-900/20 border-red-500/30 text-red-400'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {exportStatus.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{exportStatus.message}</span>
            </div>
          </motion.div>
        )}

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
              <p className="text-gray-400 text-xs sm:text-sm">Download your melody as MIDI file</p>
              <p className="text-purple-400 text-xs mt-1">
                {melodyNotes.length} notes ready
              </p>
            </div>
            
            <motion.button
              onClick={handleExportMelody}
              disabled={melodyNotes.length === 0}
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
              <p className="text-gray-400 text-xs sm:text-sm">Download your drum pattern as MIDI</p>
              <p className="text-purple-400 text-xs mt-1">
                {Object.values(drumPattern).reduce((total, pattern) => 
                  total + pattern.filter(Boolean).length, 0
                )} hits ready
              </p>
            </div>
            
            <motion.button
              onClick={handleExportDrums}
              disabled={!Object.values(drumPattern).some(pattern => pattern.some(step => step))}
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

          {/* Export as Audio */}
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
              <p className="text-gray-400 text-xs sm:text-sm">High-quality WAV file ready for streaming</p>
              <p className="text-purple-400 text-xs mt-1">
                8-second recording
              </p>
            </div>
            
            <motion.button
              onClick={handleExportAudio}
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
        </div>

        {/* Content Status */}
        {!hasGeneratedContent && (
          <div className="mb-6 sm:mb-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-xs sm:text-sm">
              🎵 Generate some melodies or drums first to unlock export options!
            </p>
          </div>
        )}

        {/* Recording Progress */}
        {isRecording && (
          <motion.div
            className="mt-6 sm:mt-8 bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-purple-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-purple-400 font-semibold text-sm sm:text-base">Recording your track...</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <motion.div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${recordingProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-gray-400 text-xs">
              {Math.round(recordingProgress)}% complete • High-quality WAV recording
            </p>
          </motion.div>
        )}

        {/* Export Info */}
        <motion.div
          className="mt-8 sm:mt-12 bg-gray-900/30 rounded-xl p-4 sm:p-6 border border-purple-500/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-lg font-semibold text-purple-400 mb-4">Export Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-white font-medium">MIDI Files</p>
              <p className="text-gray-400">Compatible with all DAWs</p>
              <p className="text-purple-400 text-xs">Logic, Ableton, FL Studio</p>
            </div>
            <div className="text-center">
              <p className="text-white font-medium">Audio Export</p>
              <p className="text-gray-400">High-quality WAV format</p>
              <p className="text-purple-400 text-xs">44.1kHz, 16-bit</p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-12 sm:mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400 text-xs sm:text-sm mb-4">
            🎉 Congratulations! You've created your first DropLab track.
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