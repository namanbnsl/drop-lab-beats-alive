
import React, { useRef, useEffect } from 'react';
import { useDJStore } from '../../stores/djStore';

const WaveformDisplay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { deckA, deckB, deckAState, deckBState } = useDJStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Draw center line
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw Deck A waveform (top half)
      if (deckA && deckAState.track) {
        const waveformA = deckA.getWaveform();
        ctx.strokeStyle = deckAState.isPlaying ? '#a259ff' : '#4b5563';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < waveformA.length; i++) {
          const x = (i / waveformA.length) * width;
          const y = height / 4 + (waveformA[i] * height) / 4;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw Deck B waveform (bottom half)
      if (deckB && deckBState.track) {
        const waveformB = deckB.getWaveform();
        ctx.strokeStyle = deckBState.isPlaying ? '#a259ff' : '#4b5563';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < waveformB.length; i++) {
          const x = (i / waveformB.length) * width;
          const y = (3 * height) / 4 + (waveformB[i] * height) / 4;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [deckA, deckB, deckAState, deckBState]);

  return (
    <div className="bg-black rounded-lg p-4 border border-purple-500/30">
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="w-full h-full"
      />
    </div>
  );
};

export default WaveformDisplay;
