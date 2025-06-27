
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, Upload } from 'lucide-react';

interface CDJDeckProps {
  side: 'A' | 'B';
}

const CDJDeck: React.FC<CDJDeckProps> = ({ side }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [trackInfo, setTrackInfo] = useState({
    name: 'No Track Loaded',
    bpm: 0,
    key: '-'
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const rotationRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (isPlaying) {
        rotationRef.current += 0.02;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw platter ring
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotationRef.current);
      
      // Outer ring
      ctx.beginPath();
      ctx.arc(0, 0, 80, 0, Math.PI * 2);
      ctx.strokeStyle = isPlaying ? '#a259ff' : '#374151';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Inner details
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(60, 0);
        ctx.lineTo(75, 0);
        ctx.strokeStyle = isPlaying ? '#8b5cf6' : '#6b7280';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.rotate(Math.PI / 4);
      }
      
      ctx.restore();
      
      // Center dot
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 8, 0, Math.PI * 2);
      ctx.fillStyle = isPlaying ? '#a259ff' : '#374151';
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPitch(Number(e.target.value));
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-purple-500/30">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-purple-400">Deck {side}</h3>
      </div>

      {/* Platter */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="rounded-full bg-gray-800 shadow-lg"
          />
          {isPlaying && (
            <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-pulse" />
          )}
        </div>
      </div>

      {/* Track Info */}
      <div className="bg-black rounded-lg p-3 mb-4 text-center">
        <div className="text-purple-400 font-semibold truncate">{trackInfo.name}</div>
        <div className="text-sm text-gray-400 flex justify-between mt-1">
          <span>{trackInfo.bpm} BPM</span>
          <span>Key: {trackInfo.key}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Main Controls */}
        <div className="flex justify-center gap-3">
          <motion.button
            onClick={handlePlayPause}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-full transition-all ${
              isPlaying 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
          >
            <RotateCcw className="w-6 h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
          >
            <Zap className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Pitch Fader */}
        <div className="space-y-2">
          <div className="text-xs text-gray-400 text-center">
            Pitch: {pitch > 0 ? '+' : ''}{pitch}%
          </div>
          <div className="flex justify-center">
            <input
              type="range"
              min="-25"
              max="25"
              value={pitch}
              onChange={handlePitchChange}
              className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer pitch-slider"
              style={{
                background: `linear-gradient(to right, #374151 0%, #374151 ${((pitch + 25) / 50) * 100}%, #a259ff ${((pitch + 25) / 50) * 100}%, #a259ff 100%)`
              }}
            />
          </div>
        </div>

        {/* Load Track */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full p-3 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Load Track
        </motion.button>
      </div>
    </div>
  );
};

export default CDJDeck;
