import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useDJStore } from '../../stores/djStore';

interface CDJDeckProps {
  side: 'A' | 'B';
}

const CDJDeck: React.FC<CDJDeckProps> = ({ side }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const rotationRef = useRef(0);
  const lastAngleRef = useRef(0);
  const lastClickRef = useRef(0);
  const tempoBendTimeoutRef = useRef<NodeJS.Timeout>();

  const [isDragging, setIsDragging] = useState(false);
  const [isJogPressed, setIsJogPressed] = useState(false);
  const [isCuePressed, setIsCuePressed] = useState(false);
  const [cuePoint, setCuePoint] = useState(0);
  const [backspinCooldown, setBackspinCooldown] = useState(false);
  const [scrubIndicator, setScrubIndicator] = useState({ active: false, direction: 0 });
  const [tempoBend, setTempoBend] = useState({ active: false, direction: 0 });
  const [toggle, setToggle] = useState(false);

  const {
    deckAState,
    deckBState,
    playDeck,
    pauseDeck,
    setPitch,
    scrubTrack,
    triggerBackspin,
    bendTempo,
    initializeAudio,
    isTransportRunning,
    masterGridPosition,
    audioUnlocked,
    audioError,
    unlockAudioContext,
  } = useDJStore();

  const deckState = side === 'A' ? deckAState : deckBState;
  const isPlaying = deckState.isPlaying;
  const gridPosition = deckState.gridPosition || { bar: 1, beat: 1, isAligned: false, isQueued: false };

  // Handle user gesture for audio initialization
  useEffect(() => {
    const handleUserGesture = async () => {
      if (!audioUnlocked && !audioError) {
        await unlockAudioContext();
      }
      // Remove event listeners after first interaction
      document.removeEventListener('click', handleUserGesture);
      document.removeEventListener('keydown', handleUserGesture);
      document.removeEventListener('touchstart', handleUserGesture);
    };

    // Add event listeners for user interaction
    document.addEventListener('click', handleUserGesture);
    document.addEventListener('keydown', handleUserGesture);
    document.addEventListener('touchstart', handleUserGesture);

    // Cleanup function
    return () => {
      document.removeEventListener('click', handleUserGesture);
      document.removeEventListener('keydown', handleUserGesture);
      document.removeEventListener('touchstart', handleUserGesture);
    };
  }, [audioUnlocked, audioError, unlockAudioContext]);

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

      // Draw platter ring with enhanced grid-aware colors
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotationRef.current);

      // Outer ring with enhanced grid-aware status colors
      ctx.beginPath();
      ctx.arc(0, 0, 80, 0, Math.PI * 2);

      if (isDragging) {
        ctx.strokeStyle = '#ff6b6b'; // Red when scrubbing
      } else if (gridPosition.isQueued && gridPosition.isAligned) {
        ctx.strokeStyle = '#00ff88'; // Bright green when beat-snapped and ready
      } else if (gridPosition.isQueued) {
        ctx.strokeStyle = '#ffaa00'; // Orange when queued but not yet aligned
      } else if (isPlaying && deckState.track?.originalBPM) {
        ctx.strokeStyle = '#10b981'; // Green when playing and auto-synced
      } else if (isPlaying) {
        ctx.strokeStyle = '#8b5cf6'; // Purple when playing normally
      } else if (isCuePressed) {
        ctx.strokeStyle = '#22c55e'; // Green when cueing
      } else if (deckState.track) {
        ctx.strokeStyle = '#fbbf24'; // Yellow when track loaded but not playing
      } else {
        ctx.strokeStyle = '#374151'; // Gray when no track
      }

      ctx.lineWidth = 4;
      ctx.stroke();

      // Inner details (pitch marks) with grid-aware colors
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(60, 0);
        ctx.lineTo(75, 0);
        ctx.strokeStyle = gridPosition.isQueued && gridPosition.isAligned ? '#00ff88' :
          gridPosition.isQueued ? '#ffaa00' :
            (isPlaying ? '#10b981' : '#6b7280');
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.rotate(Math.PI / 4);
      }

      ctx.restore();

      // Center dot with grid status
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 8, 0, Math.PI * 2);
      ctx.fillStyle = gridPosition.isQueued && gridPosition.isAligned ? '#00ff88' :
        gridPosition.isQueued ? '#ffaa00' :
          (isPlaying ? '#10b981' : '#374151');
      ctx.fill();

      // Beat-snapped indicator ring with pulsing animation
      if (gridPosition.isQueued && gridPosition.isAligned) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.beginPath();
        ctx.arc(0, 0, 85, 0, Math.PI * 2);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        // Pulsing outer ring for ready state
        const pulseRadius = 90 + Math.sin(Date.now() * 0.01) * 5;
        ctx.beginPath();
        ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      // Queued but not aligned indicator
      if (gridPosition.isQueued && !gridPosition.isAligned) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.beginPath();
        ctx.arc(0, 0, 85, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.restore();
      }

      // Auto-sync indicator ring
      if (deckState.track?.originalBPM) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.beginPath();
        ctx.arc(0, 0, 90, 0, Math.PI * 2);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.restore();
      }

      // Scrub direction indicator
      if (scrubIndicator.active) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.beginPath();
        ctx.arc(0, 0, 95, 0, Math.PI * 2);
        ctx.strokeStyle = scrubIndicator.direction > 0 ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.restore();
      }

      // Tempo bend indicator
      if (tempoBend.active) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.beginPath();
        ctx.arc(0, 0, 100, 0, Math.PI * 2);
        ctx.strokeStyle = tempoBend.direction > 0 ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 4;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.restore();
      }

      // Cue point indicator
      if (cuePoint > 0) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((cuePoint / 100) * Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(85, 0);
        ctx.lineTo(95, 0);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isDragging, isCuePressed, scrubIndicator, cuePoint, tempoBend, deckState.track, gridPosition]);

  const handlePlayPause = () => {
    console.log(`🎧 Deck ${side} - Current state: ${isPlaying ? 'Playing' : 'Stopped'}`);
    if (isPlaying) {
      console.log(`⏸️ Pausing Deck ${side}`);
      pauseDeck(side);
      setTimeout(() => setToggle(t => !t), 50); // Force UI update
    } else {
      console.log(`▶️ Playing Deck ${side}`);
      playDeck(side);
      setTimeout(() => setToggle(t => !t), 50); // Force UI update
    }
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setPitch(side, value);
  };

  const getMouseAngle = (e: MouseEvent | React.MouseEvent, rect: DOMRect) => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    return Math.atan2(deltaY, deltaX);
  };

  // Double-click detection for backspin
  const handlePlatterClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickRef.current;

    if (timeSinceLastClick < 300 && !backspinCooldown) {
      // Double-click detected - trigger backspin
      e.preventDefault();
      triggerBackspin(side);
      setBackspinCooldown(true);
      setTimeout(() => setBackspinCooldown(false), 1000);
    }

    lastClickRef.current = now;
  };

  const handlePlatterMouseDown = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const angle = getMouseAngle(e, rect);

    setIsDragging(true);
    setIsJogPressed(true);
    lastAngleRef.current = angle;

    // Set cue point if track is loaded and stopped
    if (deckState.track && !isPlaying) {
      setCuePoint(50);
    }
  };

  const handlePlatterMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentAngle = getMouseAngle(e, rect);

    // Calculate angular velocity with proper direction
    let angleDelta = currentAngle - lastAngleRef.current;

    // Handle angle wrap-around properly
    if (angleDelta > Math.PI) angleDelta -= 2 * Math.PI;
    if (angleDelta < -Math.PI) angleDelta += 2 * Math.PI;

    // Enhanced sensitivity for better scrubbing control
    const velocity = angleDelta * 25; // Increased sensitivity

    // Update visual rotation
    rotationRef.current += angleDelta;
    lastAngleRef.current = currentAngle;

    // Show scrub indicator with direction
    setScrubIndicator({ active: true, direction: velocity });

    // Enhanced scrubbing
    scrubTrack(side, velocity);

    // Clear scrub indicator after a short delay
    setTimeout(() => {
      setScrubIndicator({ active: false, direction: 0 });
    }, 100);
  };

  const handlePlatterMouseUp = () => {
    setIsDragging(false);
    setIsJogPressed(false);
    setScrubIndicator({ active: false, direction: 0 });
  };

  // Scroll to bend tempo functionality
  const handlePlatterWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    if (!isPlaying || !deckState.track) return;

    const delta = e.deltaY;
    const bendDirection = delta < 0 ? 1 : -1; // Up = speed up, Down = slow down
    const bendAmount = bendDirection > 0 ? 1.05 : 0.95; // 5% tempo change

    // Apply tempo bend
    bendTempo(side, bendAmount);

    // Show visual feedback
    setTempoBend({ active: true, direction: bendDirection });

    // Clear any existing timeout
    if (tempoBendTimeoutRef.current) {
      clearTimeout(tempoBendTimeoutRef.current);
    }

    // Reset tempo after 500ms
    tempoBendTimeoutRef.current = setTimeout(() => {
      bendTempo(side, 1.0); // Reset to normal tempo
      setTempoBend({ active: false, direction: 0 });
    }, 500);
  };

  // Cue button handlers
  const handleCueMouseDown = () => {
    if (deckState.track) {
      setIsCuePressed(true);
      if (!isPlaying) {
        playDeck(side);
      }
    }
  };

  const handleCueMouseUp = () => {
    if (isCuePressed) {
      setIsCuePressed(false);
      if (isPlaying) {
        pauseDeck(side);
        scrubTrack(side, -cuePoint);
      }
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handlePlatterMouseMove);
      document.addEventListener('mouseup', handlePlatterMouseUp);

      return () => {
        document.removeEventListener('mousemove', handlePlatterMouseMove);
        document.removeEventListener('mouseup', handlePlatterMouseUp);
      };
    }
  }, [isDragging, lastAngleRef.current]);

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-blue-500/30">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-blue-400">Deck {side}</h3>
      </div>

      {/* Platter */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="rounded-full bg-gray-800 shadow-lg cursor-pointer select-none"
            onMouseDown={handlePlatterMouseDown}
            onClick={handlePlatterClick}
            onWheel={handlePlatterWheel}
          />

          {/* Status overlays */}
          {isDragging && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
              SCRUB
            </div>
          )}

          {isCuePressed && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
              CUE
            </div>
          )}

          {backspinCooldown && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
              BACKSPIN
            </div>
          )}

          {tempoBend.active && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
              {tempoBend.direction > 0 ? '⏩' : '⏪'}
            </div>
          )}

          {gridPosition.isQueued && gridPosition.isAligned && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded-full pointer-events-none animate-pulse">
              🎯
            </div>
          )}

          {deckState.track?.originalBPM && (
            <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
              128
            </div>
          )}
        </div>
      </div>

      {/* Track Info */}
      <div className="bg-black rounded-lg p-3 mb-4 text-center">
        <div className="text-blue-400 font-semibold truncate">
          {deckState.track?.name || 'No Track'}
        </div>
        <div className="text-sm text-gray-400 flex justify-between mt-1">
          <div className="flex items-center gap-1">
            {deckState.track?.originalBPM ? (
              <span className="flex items-center gap-1">
                <span className="text-green-400">128</span>
              </span>
            ) : (
              <span>{deckState.track?.bpm || 0}</span>
            )}
          </div>
          <span>{deckState.track?.key || '-'}</span>
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
            className={`p-3 rounded-full transition-all ${isPlaying
                ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                : gridPosition.isQueued && gridPosition.isAligned
                  ? 'bg-green-600 text-white shadow-lg shadow-green-500/25 animate-pulse'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </motion.button>

          {/* Cue Button */}
          <motion.button
            onMouseDown={handleCueMouseDown}
            onMouseUp={handleCueMouseUp}
            onMouseLeave={handleCueMouseUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-full transition-all font-bold text-sm ${isCuePressed
                ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                : deckState.track
                  ? 'bg-gray-700 text-green-400 hover:bg-gray-600 border border-green-500/30'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            disabled={!deckState.track}
          >
            CUE
          </motion.button>
        </div>

        {/* Pitch Slider */}
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