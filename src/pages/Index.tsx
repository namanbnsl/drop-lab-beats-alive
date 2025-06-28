import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Headphones, Zap, Settings, Disc3, Sliders, Grid3X3, Monitor, PlayCircle, Brain, BookOpen, Star, Heart, Sparkles } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();

  useEffect(() => {
    // Simulate loading time
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

  const featureVariants = {
    hidden: { opacity: 0, y: 50, rotate: -5 },
    visible: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.6 } }
  };

  const producerFeatures = [
    { icon: Music, title: "Melody Generator", color: "text-pink-400", glow: "glow-pink" },
    { icon: Zap, title: "Drum Pattern Builder", color: "text-yellow-400", glow: "glow-yellow" },
    { icon: Grid3X3, title: "Synth Grid Composer", color: "text-blue-400", glow: "glow-blue" },
    { icon: Settings, title: "Modular FX Playground", color: "text-green-400", glow: "glow-green" }
  ];

  const djFeatures = [
    { icon: Monitor, title: "Dual CDJs", color: "text-cyan-400", glow: "glow-cyan" },
    { icon: Sliders, title: "3-Band EQ Mixer", color: "text-purple-400", glow: "glow-purple" },
    { icon: PlayCircle, title: "Launch Sim Mode", color: "text-pink-400", glow: "glow-pink" },
    { icon: Brain, title: "Tutorial + Tooltips", color: "text-yellow-400", glow: "glow-yellow" }
  ];

  const techStack = [
    { name: "React ⚛️", color: "bg-blue-500" },
    { name: "Tailwind CSS 💨", color: "bg-cyan-500" },
    { name: "Tone.js 🎚️", color: "bg-green-500" },
    { name: "Magenta.js 🎹", color: "bg-purple-500" },
    { name: "WebAudio API 🎧", color: "bg-pink-500" },
    { name: "Firebase 🔥", color: "bg-orange-500" }
  ];

  if (isLoading) {
    return (
      <motion.div
        className="fixed inset-0 dark-paper flex items-center justify-center z-50"
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
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg glow-purple"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Disc3 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
          </motion.div>
          <motion.p
            className="text-white text-base sm:text-lg md:text-xl font-medium handwritten-bold"
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
    <div className="min-h-screen dark-paper text-white handwritten overflow-x-hidden">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-10 left-10 text-yellow-400 opacity-30"
          animate={{ rotate: 360, y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <Star className="w-6 h-6" />
        </motion.div>
        <motion.div
          className="absolute top-20 right-20 text-pink-400 opacity-30"
          animate={{ rotate: -360, y: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <Heart className="w-8 h-8" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-20 text-cyan-400 opacity-30"
          animate={{ rotate: 180, y: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        >
          <Sparkles className="w-7 h-7" />
        </motion.div>
        <motion.div
          className="absolute bottom-10 right-10 text-green-400 opacity-30"
          animate={{ rotate: -180, y: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
        >
          <Music className="w-6 h-6" />
        </motion.div>
      </div>

      {/* Hero Section */}
      <motion.section
        className="min-h-screen flex items-center justify-center relative px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="text-center z-10 max-w-6xl mx-auto">
          <motion.h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-4 sm:mb-6 md:mb-8 handwritten-title"
            initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="highlight-yellow">Drop</span>
            <span className="highlight-pink">Lab</span>
          </motion.h1>
          
          <motion.p
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6 sm:mb-8 md:mb-12 text-gray-200 handwritten-bold"
            initial={{ y: 50, opacity: 0, rotate: 1 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="highlight-blue underline-squiggly">From Studio to Stage</span>, All in One Tab.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 justify-center items-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {/* Producer Button */}
            <motion.button 
              onClick={() => navigate('/producer')}
              className="group relative px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full font-bold text-base sm:text-lg md:text-xl text-white transition-all duration-300 hover:shadow-2xl glow-pink hover:scale-105 touch-manipulation btn-fun handwritten-bold min-touch-target"
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">
                🎼 <span className="highlight-yellow">Start Producing</span>
              </span>
            </motion.button>

            <motion.button 
              onClick={() => navigate('/dj')}
              className="group relative px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full font-bold text-base sm:text-lg md:text-xl text-white transition-all duration-300 hover:shadow-2xl glow-cyan hover:scale-105 touch-manipulation btn-fun handwritten-bold min-touch-target"
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">
                🎧 <span className="highlight-green">Enter DJ Booth</span>
              </span>
            </motion.button>
          </motion.div>

          {/* Fun doodle arrow pointing down */}
          <motion.div
            className="mt-8 sm:mt-12 md:mt-16"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-yellow-400 opacity-70" viewBox="0 0 100 100" fill="none">
              <path d="M20 30 Q50 20 80 30 Q70 50 50 70 Q30 50 20 30" stroke="currentColor" strokeWidth="3" fill="none"/>
              <path d="M45 60 L50 70 L55 60" stroke="currentColor" strokeWidth="3" fill="none"/>
            </svg>
          </motion.div>
        </div>
      </motion.section>

      {/* Feature Breakdown */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
            {/* Producer Mode */}
            <div>
              <motion.h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 md:mb-10 text-center handwritten-title"
                initial={{ opacity: 0, y: 30, rotate: -2 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <span className="highlight-pink">Producer Mode</span>
              </motion.h2>
              <div className="space-y-4 sm:space-y-6">
                {producerFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className={`group p-4 sm:p-6 md:p-8 card-fun hover:${feature.glow} transition-all duration-300`}
                    variants={featureVariants}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ rotate: 1, scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                      <div className={`p-3 sm:p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl group-hover:${feature.glow} transition-all duration-300 float`}>
                        <feature.icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${feature.color}`} />
                      </div>
                      <h3 className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold handwritten-bold ${feature.color}`}>
                        {feature.title}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* DJ Mode */}
            <div>
              <motion.h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 md:mb-10 text-center handwritten-title"
                initial={{ opacity: 0, y: 30, rotate: 2 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <span className="highlight-cyan">DJ Mode</span>
              </motion.h2>
              <div className="space-y-4 sm:space-y-6">
                {djFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className={`group p-4 sm:p-6 md:p-8 card-fun hover:${feature.glow} transition-all duration-300`}
                    variants={featureVariants}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ rotate: -1, scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                      <div className={`p-3 sm:p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl group-hover:${feature.glow} transition-all duration-300 float`}>
                        <feature.icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${feature.color}`} />
                      </div>
                      <h3 className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold handwritten-bold ${feature.color}`}>
                        {feature.title}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Education Focus */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-cyan-900/20 rounded-3xl"></div>
        <motion.div
          className="max-w-5xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 handwritten-title">
            <span className="highlight-yellow">No gear?</span> <span className="highlight-green">No problem.</span><br />
            <span className="highlight-blue underline-squiggly">Learn as you mix.</span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-200 mb-8 sm:mb-12 md:mb-16 leading-relaxed handwritten-bold">
            DropLab is built to <span className="highlight-pink">teach as you play</span>. With interactive tooltips and a step-by-step walkthrough, anyone can go from <span className="highlight-cyan">beginner to beat master</span>.
          </p>
          
          <motion.div
            className="relative inline-block"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-48 h-32 sm:w-64 sm:h-40 md:w-80 md:h-48 card-fun flex items-center justify-center relative overflow-hidden glow-yellow">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-yellow-400 float" />
              <motion.div 
                className="absolute top-2 right-2 bg-pink-500 text-white text-xs sm:text-sm px-2 py-1 rounded-full font-bold handwritten-bold bounce-fun"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Learn!
              </motion.div>
              <motion.div 
                className="absolute bottom-2 left-2 bg-cyan-500 text-white text-xs sm:text-sm px-2 py-1 rounded-full handwritten-bold wiggle"
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Tip: Try this!
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Tech Stack */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 md:mb-16 handwritten-title">
            Built with <span className="highlight-pink">❤️</span> and <span className="highlight-cyan">powerful tech</span>:
          </h2>
          
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
            {techStack.map((tech, index) => (
              <motion.span
                key={tech.name}
                className={`px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 ${tech.color} rounded-full text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg handwritten-bold transition-all duration-300 hover:scale-110 hover:rotate-3 touch-manipulation min-touch-target`}
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
              >
                {tech.name}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <motion.section
        className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 sm:mb-12 md:mb-16 handwritten-title">
          <span className="highlight-yellow underline-squiggly">Ready to drop</span> your <span className="highlight-pink">first beat</span>?
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 justify-center mb-8 sm:mb-12 md:mb-16">
          <motion.button
            onClick={() => navigate('/producer')}
            className="group relative px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full font-bold text-base sm:text-lg md:text-xl text-white transition-all duration-300 glow-pink touch-manipulation btn-fun handwritten-bold min-touch-target"
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">🎼 <span className="highlight-yellow">Start Producing</span></span>
          </motion.button>

          <motion.button
            onClick={() => navigate('/dj')}
            className="group relative px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full font-bold text-base sm:text-lg md:text-xl text-white transition-all duration-300 glow-cyan touch-manipulation btn-fun handwritten-bold min-touch-target"
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">🎧 <span className="highlight-green">Enter DJ Booth</span></span>
          </motion.button>
        </div>

        <motion.p 
          className="text-gray-400 text-xs sm:text-sm md:text-base handwritten-bold"
          animate={{ rotate: [0, 1, -1, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          © 2025 <span className="highlight-pink">DropLab</span> by <span className="highlight-cyan">Aarjav & Naman</span> 🚀 | <span className="highlight-yellow">Hackathon Edition</span>
        </motion.p>
      </motion.section>
    </div>
  );
};

export default Index;