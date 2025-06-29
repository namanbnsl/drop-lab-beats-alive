import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const WelcomeSection = () => {
  const scrollToMelody = () => {
    const element = document.getElementById('music-generation');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="welcome" className="min-h-screen flex items-center justify-center relative px-4">
      <div className="text-center z-10 max-w-4xl mx-auto">
        <motion.h1
          className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          DropLab: Producer Mode
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl mb-12 text-gray-300"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Every beat starts somewhere. Let's build yours.
        </motion.p>

        <motion.button
          onClick={scrollToMelody}
          className="group relative px-8 py-4 bg-black border-2 border-blue-500 rounded-full font-semibold text-lg text-white transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105 btn-glow btn-glow-blue"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative z-10 flex items-center gap-2 justify-center">
            Drop In 🎧
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </motion.button>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-8 h-8 text-blue-400" />
      </motion.div>
    </section>
  );
};

export default WelcomeSection;