import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Disc3 } from 'lucide-react';
import AIStudioInterface from '../components/Producer/AIStudioInterface';

const Producer = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-md rounded-lg px-4 py-2"
        >
          <Disc3 className="w-6 h-6" />
          <span className="font-bold">DropLab</span>
        </button>
      </div>

      {/* Main AI Studio Interface */}
      <AIStudioInterface />
    </div>
  );
};

export default Producer;