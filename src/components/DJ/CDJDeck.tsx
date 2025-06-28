import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, RefreshCw, Activity } from 'lucide-react';
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
  
  const {
    deckAState,
    deckBState,
    playDeck,
    pauseDeck,
    setPitch,
    syncDecks,
    scrubTrack,
    triggerBackspin,
    bendTempo,
    initializeAudio,
    isTransportRunning,
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
      
      // Outer ring with enhanced state-based colors for 128 BPM sync
      ctx.beginPath();
      ctx.arc(0, 0, 80, 0, Math.PI * 2);
      
      if (isDragging) {
        ctx.strokeStyle = '#ff6b6b'; // Red when scrubbing
      } else if (isPlaying && deckState.track?.originalBPM) {
        ctx.strokeStyle = '#00ff88'; // Bright green when auto-synced to 128 BPM
      } else if (isPlaying) {
        ctx.strokeStyle = '#10b981'; // Regular green when playing
      } else if (isCuePressed) {
        ctx.strokeStyle = '#22c55e'; // Green when cueing
      } else if (deckState.isSyncing) {
        ctx.strokeStyle = '#3b82f6'; // Blue when syncing to next bar
      } else if (deckState.track) {
        ctx.strokeStyle = '#fbbf24'; // Yellow when track loaded but not playing
      } else {
        ctx.strokeStyle = '#374151'; // Gray when no track
      }
      
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Inner details (pitch marks)
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(60, 0);
        ctx.lineTo(75, 0);
        ctx.strokeStyle = isPlaying && deckState.track?.originalBPM ? '#00ff88' : (isPlaying ? '#10b981' : '#6b7280');
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.rotate(Math.PI / 4);
      }
      
      ctx.restore();
      
      // Center dot
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 8, 0, Math.PI * 2);
      ctx.fillStyle = isPlaying && deckState.track?.originalBPM ? '#00ff88' : (isPlaying ? '#10b981' : '#374151');
      ctx.fill();

      // 128 BPM sync indicator ring
      if (deckState.track?.originalBPM) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.beginPath();
        ctx.arc(0, 0, 85, 0, Math.PI * 2);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();
      }

      // Syncing to next bar indicator
      if (deckState.isSyncing) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.beginPath();
        ctx.arc(0, 0, 90, 0, Math.PI * 2);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 4;
        ctx.setLineDash([2, 2]);
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
  }, [isPlaying, isDragging, isCuePressed, scrubIndicator, cuePoint, tempoBend, deckState.track, deckState.isSyncing]);

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
      console.log(`🌀 Double-click backspin triggered on Deck ${side}`);
    }
    
    lastClickRef.current = now;
  };

  // Drag to scrub functionality
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
    
    // Calculate angular velocity
    let angleDelta = currentAngle - lastAngleRef.current;
    
    // Handle angle wrap-around
    if (angleDelta > Math.PI) angleDelta -= 2 * Math.PI;
    if (angleDelta < -Math.PI) angleDelta += 2 * Math.PI;
    
    const velocity = angleDelta * 15; // Increased sensitivity for better scrubbing
    
    // Update visual rotation
    rotationRef.current += angleDelta;
    lastAngleRef.current = currentAngle;

    // Show scrub indicator
    setScrubIndicator({ active: true, direction: velocity });
    
    // Scrub the track (works when paused or cueing)
    if (!isPlaying || isCuePressed) {
      scrubTrack(side, velocity);
    }

    console.log(`🎛️ Scrubbing Deck ${side}: ${velocity > 0 ? 'Forward' : 'Rewind'} (${velocity.toFixed(3)})`);
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

    console.log(`⏩ Tempo bend Deck ${side}: ${bendDirection > 0 ? 'Speed Up' : 'Slow Down'} (${bendAmount}x)`);
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

  const handleSync = () => {
    if (side === 'B') {
      syncDecks();
    }
  };

  const getPlaybackRate = () => {
    if (deckState.track?.originalBPM) {
      return 128 / deckState.track.originalBPM; // Auto-synced to 128 BPM
    }
    return 1;
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-purple-500/30">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-purple-400">Deck {side}</h3>
        {isTransportRunning && (
          <div className="text-xs text-green-400 flex items-center justify-center gap-1 mt-1">
            <Activity className="w-3 h-3" />
            Master Transport @ 128 BPM
          </div>
        )}
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
            title="Double-click for backspin • Drag to scrub • Scroll to bend tempo"
          />
          
          {/* Status overlays */}
          {isPlaying && deckState.track?.originalBPM && (
            <div className="absolute inset-0 rounded-full bg-green-500/10 animate-pulse pointer-events-none" />
          )}
          
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
              {tempoBend.direction > 0 ? '⏩ FASTER' : '⏪ SLOWER'}
            </div>
          )}

          {deckState.isSyncing && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full pointer-events-none animate-pulse">
              🎯 SYNCING
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
        <div className="text-purple-400 font-semibold truncate">
          {deckState.track?.name || 'No Track Loaded'}
        </div>
        <div className="text-sm text-gray-400 flex justify-between mt-1">
          <div className="flex items-center gap-1">
            {deckState.track?.originalBPM ? (
              <span className="flex items-center gap-1">
                <span className="text-green-400">128 BPM</span>
                <Activity className="w-3 h-3 text-green-400" />
              </span>
            ) : (
              <span>{deckState.track?.bpm || 0} BPM</span>
            )}
          </div>
          <span>Key: {deckState.track?.key || '-'}</span>
        </div>
        
        {/* Auto-sync info */}
        {deckState.track?.originalBPM && (
          <div className="text-xs text-green-400 mt-1 space-y-1">
            <div className="flex items-center justify-center gap-1">
              <span>🎯 Auto-synced to 128 BPM</span>
            </div>
            <div className="text-blue-400">
              Original: {deckState.track.originalBPM} BPM → Rate: {getPlaybackRate().toFixed(3)}x
            </div>
          </div>
        )}
        
        {deckState.bpmInfo && deckState.bpmInfo.confidence > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            Detected: {deckState.bpmInfo.original.toFixed(1)} BPM 
            ({(deckState.bpmInfo.confidence * 100).toFixed(0)}% confidence)
          </div>
        )}
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
                ? 'bg-green-600 text-white shadow-lg shadow-green-500/25' 
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
            className={`p-3 rounded-full transition-all font-bold text-sm ${
              isCuePressed
                ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                : deckState.track
                ? 'bg-gray-700 text-green-400 hover:bg-gray-600 border border-green-500/30'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!deckState.track}
            title="Hold to preview from cue point"
          >
            CUE
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
            onClick={() => setCuePoint(0)}
            title="Reset cue point"
          >
            <RotateCcw className="w-6 h-6" />
          </motion.button>

          {side === 'B' && (
            <motion.button
              onClick={handleSync}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-full transition-all ${
                deckState.isSyncing
                  ? 'bg-blue-600 text-white animate-pulse'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
              title="Sync to next bar at 128 BPM"
              disabled={deckState.isSyncing || !deckState.track}
            >
              <RefreshCw className={`w-6 h-6 ${deckState.isSyncing ? 'animate-spin' : ''}`} />
            </motion.button>
          )}
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

        {/* Status Indicators */}
        <div className="text-center space-y-1">
          {scrubIndicator.active && (
            <div className="text-xs text-red-400">
              Scrubbing: {scrubIndicator.direction > 0 ? '→ Forward' : '← Rewind'}
            </div>
          )}
          
          {tempoBend.active && (
            <div className="text-xs text-blue-400">
              Tempo: {tempoBend.direction > 0 ? '⏩ +5%' : '⏪ -5%'}
            </div>
          )}
          
          {cuePoint > 0 && (
            <div className="text-xs text-green-400">
              Cue Point Set
            </div>
          )}
          
          {deckState.isSyncing && (
            <div className="text-xs text-blue-400 animate-pulse">
              🎯 Syncing to Next Bar at 128 BPM...
            </div>
          )}

          {deckState.track?.originalBPM && (
            <div className="text-xs text-green-400">
              🎯 Auto-synced to 128 BPM
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <div>Double-click jogwheel for backspin</div>
          <div>Drag to scrub • Scroll to bend tempo</div>
          {deckState.track?.originalBPM && <div>🎯 Auto-sync to 128 BPM Active</div>}
          {isTransportRunning && <div>🎵 Master Transport @ 128 BPM</div>}
        </div>
      </div>
    </div>
  );
};

export default CDJDeck;