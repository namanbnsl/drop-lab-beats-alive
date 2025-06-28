
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { useDJStore } from '../../stores/djStore';
import PerformancePads from './PerformancePads';

interface CDJDeckProps {
  side: 'A' | 'B';
}

const CDJDeck: React.FC<CDJDeckProps> = ({ side }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const rotationRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const {
    deckAState,
    deckBState,
    playDeck,
    pauseDeck,
    setPitch,
    setEQ,
    initializeAudio,
  } = useDJStore();

  const deckState = side === 'A' ? deckAState : deckBState;
  const isPlaying = deckState.isPlaying;

  useEffect(() => {
    initializeAudio();
  }, [initializeAudio]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (isPlaying && !isDragging) {
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
  }, [isPlaying, isDragging]);

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseDeck(side);
    } else {
      playDeck(side);
    }
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setPitch(side, value);
  };

  const handleEQChange = (band: 'low' | 'mid' | 'high', value: number) => {
    const newEQ = { ...deckState.eq, [band]: value };
    setEQ(side, newEQ);
  };

  const handlePlatterMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

  const handlePlatterMouseUp = () => {
    setIsDragging(false);
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
            className="rounded-full bg-gray-800 shadow-lg cursor-pointer"
            onMouseDown={handlePlatterMouseDown}
            onMouseUp={handlePlatterMouseUp}
          />
          {isPlaying && (
            <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-pulse" />
          )}
        </div>
      </div>

      {/* Track Info */}
      <div className="bg-black rounded-lg p-3 mb-4 text-center">
        <div className="text-purple-400 font-semibold truncate">
          {deckState.track?.name || 'No Track Loaded'}
        </div>
        <div className="text-sm text-gray-400 flex justify-between mt-1">
          <span>{deckState.track?.bpm || 0} BPM</span>
          <span>Key: {deckState.track?.key || '-'}</span>
        </div>
      </div>

      {/* EQ Section */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {(['high', 'mid', 'low'] as const).map((band) => (
          <div key={band} className="flex flex-col items-center space-y-1">
            <div className="relative w-12 h-12">
              <div 
                className="w-12 h-12 rounded-full border-4 border-purple-500 bg-gray-800 relative cursor-pointer shadow-lg"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const centerX = rect.left + rect.width / 2;
                  const centerY = rect.top + rect.height / 2;
                  const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
                  const degrees = (angle * 180 / Math.PI + 90 + 360) % 360;
                  const normalizedValue = Math.max(0, Math.min(100, (degrees / 270) * 100));
                  handleEQChange(band, normalizedValue);
                }}
              >
                <div 
                  className="absolute w-1 h-4 bg-purple-400 top-1 left-1/2 transform -translate-x-1/2 origin-bottom rounded-full transition-transform"
                  style={{ 
                    transform: `translateX(-50%) rotate(${(deckState.eq[band] / 100) * 270 - 135}deg)` 
                  }}
                />
              </div>
            </div>
            <div className="text-xs text-gray-400 text-center uppercase">{band}</div>
          </div>
        ))}
      </div>

      {/* Performance Pads */}
      <div className="mb-4">
        <div className="text-xs text-purple-400 text-center mb-2">PERFORMANCE PADS</div>
        <PerformancePads side={side} />
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
            Pitch: {deckState.pitch > 0 ? '+' : ''}{deckState.pitch}%
          </div>
          <div className="flex justify-center">
            <input
              type="range"
              min="-25"
              max="25"
              value={deckState.pitch}
              onChange={handlePitchChange}
              className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer pitch-slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CDJDeck;
