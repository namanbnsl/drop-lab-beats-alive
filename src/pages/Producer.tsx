
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, ArrowLeft, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import MagentaGenerator from '../components/MagentaGenerator';

const Producer = () => {
  const [generatedMelodies, setGeneratedMelodies] = useState<any[]>([]);

  const handleMelodyGenerated = (melody: any) => {
    setGeneratedMelodies(prev => [...prev, melody]);
  };

  return (
    <div className="min-h-screen bg-black text-white font-['Poppins']">
      {/* Header */}
      <header className="border-b border-purple-500/30 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="p-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-purple-400" />
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Producer Mode
            </h1>
          </div>
          <button className="p-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 transition-colors">
            <Settings className="w-5 h-5 text-purple-400" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* AI Melody Generator */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">AI-Powered Tools</h2>
            <MagentaGenerator onMelodyGenerated={handleMelodyGenerated} />
          </div>

          {/* Generated Melodies Library */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Generated Melodies</h2>
            <div className="space-y-4">
              {generatedMelodies.length === 0 ? (
                <div className="bg-black border border-purple-500/30 rounded-xl p-8 text-center">
                  <Music className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400">No melodies generated yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Use the AI Melody Generator to create your first composition
                  </p>
                </div>
              ) : (
                generatedMelodies.map((melody, index) => (
                  <motion.div
                    key={index}
                    className="bg-black border border-purple-500/30 rounded-xl p-4 hover:border-purple-500 transition-all duration-300"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-purple-300">
                          Melody #{index + 1}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {melody.notes?.length || 0} notes • Generated with AI
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded text-sm hover:bg-purple-500/30 transition-colors">
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded text-sm hover:bg-purple-500/30 transition-colors">
                          Export
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-6">Coming Soon</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              'Drum Pattern Builder',
              'Synth Grid Composer',
              'Modular FX Playground'
            ].map((feature, index) => (
              <motion.div
                key={feature}
                className="bg-black border border-purple-500/20 rounded-xl p-6 opacity-60"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="font-medium text-purple-400 mb-2">{feature}</h3>
                <p className="text-sm text-gray-500">In development</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Producer;
