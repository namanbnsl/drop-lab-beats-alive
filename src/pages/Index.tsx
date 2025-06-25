
import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Music, Headphones, Zap, Settings, Disc3, Sliders, Grid3X3, Waveform, Monitor, PlayCircle, Brain, BookOpen } from 'lucide-react';

const Index = () => {
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
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const producerFeatures = [
    { icon: Music, title: "Melody Generator" },
    { icon: Zap, title: "Drum Pattern Builder" },
    { icon: Grid3X3, title: "Synth Grid Composer" },
    { icon: Settings, title: "Modular FX Playground" }
  ];

  const djFeatures = [
    { icon: Monitor, title: "Dual CDJs" },
    { icon: Sliders, title: "3-Band EQ Mixer" },
    { icon: PlayCircle, title: "Launch Sim Mode" },
    { icon: Brain, title: "Tutorial + Tooltips" }
  ];

  const techStack = [
    "React ⚛️",
    "Tailwind CSS 💨",
    "Tone.js 🎚️",
    "Magenta.js 🎹",
    "WebAudio API 🎧",
    "Firebase 🔥"
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
            className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Disc3 className="w-12 h-12 text-white" />
          </motion.div>
          <motion.p
            className="text-white text-lg font-medium"
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

  const waveformPath = `M0,50 Q${mousePosition.x * 0.1},${30 + mousePosition.y * 0.02} 200,50 T400,50 T600,50 T800,50 T1000,50 T1200,50 T1400,50 T1600,50 T1800,50 T2000,50`;

  return (
    <div className="min-h-screen bg-black text-white font-['Poppins'] overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`
          }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <path
            d={waveformPath}
            stroke="url(#waveGradient)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Hero Section */}
      <motion.section
        className="min-h-screen flex items-center justify-center relative px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="text-center z-10">
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-pink-400 to-green-400 bg-clip-text text-transparent"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            DropLab
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl mb-12 text-gray-300"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            From Studio to Stage, All in One Tab.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105">
              <span className="relative z-10 flex items-center gap-2">
                🎼 Start Producing
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </button>

            <button className="group relative px-8 py-4 bg-gradient-to-r from-pink-600 to-green-600 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/25 hover:scale-105">
              <span className="relative z-10 flex items-center gap-2">
                🎧 Enter DJ Booth
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Feature Breakdown */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-2 gap-12">
            {/* Producer Mode */}
            <div>
              <motion.h2
                className="text-3xl font-bold mb-8 text-center text-blue-400"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                Producer Mode
              </motion.h2>
              <div className="space-y-6">
                {producerFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="group p-6 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
                    variants={featureVariants}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                        <feature.icon className="w-6 h-6 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* DJ Mode */}
            <div>
              <motion.h2
                className="text-3xl font-bold mb-8 text-center text-pink-400"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                DJ Mode
              </motion.h2>
              <div className="space-y-6">
                {djFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="group p-6 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-pink-500 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10"
                    variants={featureVariants}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-pink-500/20 rounded-lg group-hover:bg-pink-500/30 transition-colors">
                        <feature.icon className="w-6 h-6 text-pink-400" />
                      </div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Education Focus */}
      <section className="py-20 px-4 bg-gray-900/30">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            No gear? No problem. Learn as you mix.
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            DropLab is built to teach as you play. With interactive tooltips and a step-by-step walkthrough, anyone can go from beginner to beat master.
          </p>
          
          <motion.div
            className="relative inline-block"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-64 h-40 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 flex items-center justify-center relative overflow-hidden">
              <BookOpen className="w-16 h-16 text-green-400" />
              <div className="absolute top-2 right-2 bg-green-500 text-black text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                Learn!
              </div>
              <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Tip: Try this!
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-12">
            Built with ❤️ and powerful tech:
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            {techStack.map((tech, index) => (
              <motion.span
                key={tech}
                className="px-6 py-3 bg-gray-800 rounded-full border border-gray-700 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 text-sm font-medium"
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

      {/* Final CTA */}
      <motion.section
        className="py-20 px-4 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-12 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
          Ready to drop your first beat?
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
          <motion.button
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">🎼 Start Producing</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          </motion.button>

          <motion.button
            className="group relative px-8 py-4 bg-gradient-to-r from-pink-600 to-green-600 rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/25"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">🎧 Enter DJ Booth</span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          </motion.button>
        </div>

        <p className="text-gray-400 text-sm">
          © 2025 DropLab by Aarjav & Team 🚀 | Hackathon Edition
        </p>
      </motion.section>
    </div>
  );
};

export default Index;
