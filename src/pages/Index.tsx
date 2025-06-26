
import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Music, Headphones, Zap, Settings, Disc3, Sliders, Grid3X3, Monitor, PlayCircle, Brain, BookOpen } from 'lucide-react';
import { HandDrawnArrow, HandDrawnCircle, HandDrawnUnderline, HandDrawnStar, StickyNote } from '@/components/SketchElements';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const producerFeatures = [
    { icon: Music, title: "Melody Generator", note: "🔥 Try This First!" },
    { icon: Zap, title: "Drum Pattern Builder", note: "Sick beats!" },
    { icon: Grid3X3, title: "Synth Grid Composer", note: "So cool" },
    { icon: Settings, title: "Modular FX Playground", note: "Magic ✨" }
  ];

  const djFeatures = [
    { icon: Monitor, title: "Dual CDJs", note: "Tap to Spin" },
    { icon: Sliders, title: "3-Band EQ Mixer", note: "Mix it up!" },
    { icon: PlayCircle, title: "Launch Sim Mode", note: "Go live!" },
    { icon: Brain, title: "Tutorial + Tooltips", note: "Learn as you go" }
  ];

  if (isLoading) {
    return (
      <motion.div
        className="fixed inset-0 bg-black flex items-center justify-center z-50"
        initial={{ opacity: 1 }}
        animate={{ opacity: isLoading ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/25"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Disc3 className="w-12 h-12 text-white" />
          </motion.div>
          <motion.p
            className="text-white text-lg font-caveat text-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Warming up the decks...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-poppins overflow-x-hidden relative bg-paper-texture">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-gradient-radial from-purple-900/15 via-transparent to-transparent"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(162, 89, 255, 0.12) 0%, transparent 50%)`
          }}
        />
        {/* Floating sketch elements */}
        <HandDrawnStar className="absolute top-20 left-10 animate-bounce-gentle opacity-30" />
        <HandDrawnStar className="absolute top-40 right-20 animate-bounce-gentle opacity-20 animation-delay-1000" />
        <HandDrawnCircle className="absolute bottom-20 left-1/4 opacity-10 animate-wiggle" />
      </div>

      {/* Hero Section */}
      <motion.section
        className="min-h-screen flex items-center justify-center relative px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="text-center z-10 relative">
          {/* Hand-drawn arrow pointing to title */}
          <motion.div 
            className="absolute -top-20 -left-20 transform -rotate-12"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
          >
            <HandDrawnArrow direction="down" className="text-purple-400" />
            <span className="font-caveat text-purple-300 text-lg absolute -right-10 top-8 transform rotate-12">
              This is it!
            </span>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-marker mb-2 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent transform -rotate-1 hover:animate-jitter"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            🎧 DropLab
          </motion.h1>
          
          <motion.div 
            className="relative inline-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <HandDrawnUnderline className="absolute -bottom-2 left-0" />
          </motion.div>

          <motion.div
            className="font-caveat text-2xl md:text-4xl mb-4 text-purple-300 transform rotate-1"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            → from beats → to booth
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl mb-12 text-gray-300 font-caveat transform -rotate-1"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            💭 "make stuff. mix stuff. drop it loud."
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.button 
              className="group relative px-8 py-4 bg-black border-2 border-purple-500 rounded-full font-caveat text-xl text-white transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 transform rotate-1 hover:animate-wiggle"
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">
                🎼 Start Producing
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>

            <motion.button 
              className="group relative px-8 py-4 bg-black border-2 border-purple-500 rounded-full font-caveat text-xl text-white transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 transform -rotate-1 hover:animate-wiggle"
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">
                🎧 Enter DJ Booth
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Feature Breakdown - Chaotic Layout */}
      <section className="py-20 px-4 relative">
        <motion.div
          className="max-w-6xl mx-auto relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Producer Mode - Tilted left */}
          <div className="transform -rotate-2 mb-20">
            <motion.h2
              className="text-4xl font-marker mb-8 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Producer Mode
              <HandDrawnCircle className="absolute -top-4 -right-8 opacity-30" />
            </motion.h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {producerFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className={`group p-6 bg-black rounded-xl border border-purple-500/30 hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 relative transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                      <feature.icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">{feature.title}</h3>
                  </div>
                  {/* Sticky note */}
                  <div className="absolute -top-2 -right-2 transform rotate-12">
                    <div className="bg-yellow-200 border-yellow-300 border-2 p-2 shadow-lg font-caveat text-sm text-gray-800 rounded">
                      {feature.note}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Hand-drawn arrow between sections */}
          <motion.div 
            className="flex justify-center my-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <HandDrawnArrow direction="down" className="text-purple-400 mx-auto mb-2" />
              <span className="font-caveat text-purple-300 text-lg">Check this out too!</span>
            </div>
          </motion.div>

          {/* DJ Mode - Tilted right */}
          <div className="transform rotate-2">
            <motion.h2
              className="text-4xl font-marker mb-8 text-center bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              DJ Mode
              <HandDrawnStar className="absolute -top-2 -left-6 animate-bounce-gentle" />
            </motion.h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {djFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className={`group p-6 bg-black rounded-xl border border-purple-500/30 hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 relative transform ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'} hover:rotate-0`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                      <feature.icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">{feature.title}</h3>
                  </div>
                  {/* Sticky note */}
                  <div className="absolute -top-2 -right-2 transform -rotate-12">
                    <div className="bg-pink-200 border-pink-300 border-2 p-2 shadow-lg font-caveat text-sm text-gray-800 rounded">
                      {feature.note}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Education Focus - Sketchy section */}
      <section className="py-20 px-4 bg-gray-900/20 relative">
        <motion.div
          className="max-w-4xl mx-auto text-center transform rotate-1"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-marker mb-6 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent relative">
            No gear? No problem!
            <HandDrawnUnderline className="absolute -bottom-2 left-0" />
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed font-caveat transform -rotate-1">
            Learn as you mix. Built by music nerds, for music nerds.
          </p>
          
          <motion.div
            className="relative inline-block transform rotate-2"
            whileHover={{ scale: 1.05, rotate: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-64 h-40 bg-black rounded-xl border border-purple-500/30 flex items-center justify-center relative overflow-hidden">
              <BookOpen className="w-16 h-16 text-purple-400" />
              <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-caveat animate-pulse">
                Learn!
              </div>
              <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-caveat">
                Tip: Try this!
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Tech Stack - Scattered layout */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-marker mb-12 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent transform -rotate-1">
            Built with ❤️ and powerful tech:
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            {["React ⚛️", "Tailwind CSS 💨", "Tone.js 🎚️", "Magenta.js 🎹", "WebAudio API 🎧", "Firebase 🔥"].map((tech, index) => (
              <motion.span
                key={tech}
                className={`px-6 py-3 bg-black rounded-full border border-purple-500/30 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 text-sm font-caveat text-lg text-white transform ${index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-0'} hover:rotate-0`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA - Playful */}
      <motion.section
        className="py-20 px-4 text-center relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="absolute top-10 left-1/4 transform -rotate-12">
          <HandDrawnArrow direction="right" className="text-purple-400" />
          <span className="font-caveat text-purple-300 text-lg absolute -bottom-8 left-0">
            Do it!
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl font-marker mb-12 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent transform rotate-1">
          Ready to drop your first beat?
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <motion.button
            className="group relative px-8 py-4 bg-black border-2 border-purple-500 rounded-full font-caveat text-xl text-white transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 transform rotate-2 hover:animate-wiggle"
            whileHover={{ scale: 1.05, rotate: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">🎼 Start Producing</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.button>

          <motion.button
            className="group relative px-8 py-4 bg-black border-2 border-purple-500 rounded-full font-caveat text-xl text-white transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 transform -rotate-2 hover:animate-wiggle"
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">🎧 Enter DJ Booth</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.button>
        </div>

        <p className="text-gray-400 text-sm font-caveat text-lg transform rotate-1">
          © 2025 DropLab by Aarjav & Team 🚀 | Hackathon Edition
        </p>

        <div className="absolute bottom-10 right-1/4 transform rotate-12">
          <HandDrawnStar className="text-purple-400 animate-bounce-gentle" />
        </div>
      </motion.section>
    </div>
  );
};

export default Index;
