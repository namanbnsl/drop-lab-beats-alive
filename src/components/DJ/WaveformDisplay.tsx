import React, { useRef, useEffect } from 'react';
import { useDJStore } from '../../stores/djStore';

const WaveformDisplay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { deckA, deckB, deckAState, deckBState, masterGridPosition } = useDJStore();

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

      // Draw beat grid lines
      const beatInterval = 60 / 128; // 128 BPM
      const pixelsPerSecond = width / 30; // Assuming 30 seconds visible
      const beatWidth = beatInterval * pixelsPerSecond;
      
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += beatWidth) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      // Highlight current beat
      const currentBeatX = (masterGridPosition.beat - 1) * beatWidth;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentBeatX, 0);
      ctx.lineTo(currentBeatX, height);
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

        // Draw playhead for Deck A
        if (deckAState.isPlaying) {
          const currentTime = deckA.getCurrentTime();
          const duration = deckA.getDuration();
          const playheadX = (currentTime / duration) * width;
          
          ctx.strokeStyle = '#a259ff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(playheadX, 0);
          ctx.lineTo(playheadX, height / 2);
          ctx.stroke();
        }
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

        // Draw playhead for Deck B
        if (deckBState.isPlaying) {
          const currentTime = deckB.getCurrentTime();
          const duration = deckB.getDuration();
          const playheadX = (currentTime / duration) * width;
          
          ctx.strokeStyle = '#a259ff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(playheadX, height / 2);
          ctx.lineTo(playheadX, height);
          ctx.stroke();
        }
      }

      // Draw sync indicators
      if (deckAState.gridPosition?.isQueued && deckAState.gridPosition?.isAligned) {
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(0, 0, 10, height / 2);
      }
      
      if (deckBState.gridPosition?.isQueued && deckBState.gridPosition?.isAligned) {
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(0, height / 2, 10, height / 2);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [deckA, deckB, deckAState, deckBState, masterGridPosition]);

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