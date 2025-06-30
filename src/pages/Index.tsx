import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Zap, Settings, Disc3, Sliders, Grid3X3, Monitor, PlayCircle, Brain, BookOpen } from 'lucide-react';
import CDJDeck from '../components/DJ/CDJDeck';

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();

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
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const featureVariants = {
    hidden: { opacity: 0, y: 50, rotate: -2 },
    visible: {
      opacity: 1,
      y: 0,
      rotate: Math.random() * 4 - 2,
      transition: { duration: 0.8, type: "spring" as const, bounce: 0.4 },
    },
  };

  const producerFeatures = [
    { icon: Music, title: "Melody Generator", doodle: "🎵", color: "highlighter-purple" },
    { icon: Zap, title: "Drum Pattern Builder", doodle: "⚡", color: "highlighter-yellow" },
    { icon: Grid3X3, title: "Balance Your Mix", doodle: "🎹", color: "highlighter-blue" },
    { icon: Settings, title: "Modular FX Playground", doodle: "🔧", color: "highlighter-green" },
  ];

  const djFeatures = [
    { icon: Monitor, title: "Dual CDJs", doodle: "💿", color: "highlighter-orange" },
    { icon: Sliders, title: "3-Band EQ Mixer", doodle: "🎚️", color: "highlighter-pink" },
    { icon: PlayCircle, title: "3 Effects on the Mixer", doodle: "▶️", color: "highlighter-teal" },
    { icon: Brain, title: "Tutorial + Tooltips", doodle: "💡", color: "highlighter-cyan" },
  ];

  const techStack = [
    { name: "React ⚛️", color: "highlighter-blue" },
    { name: "Tailwind CSS 💨", color: "highlighter-cyan" },
    { name: "Tone.js 🎚️", color: "highlighter-green" },
    { name: "WebAudio API 🎧", color: "highlighter-purple" },
  ];

  const scatteredIcons = [
    { icon: "🎤", top: "10%", left: "5%", delay: 0 },
    { icon: "🎸", top: "15%", right: "8%", delay: 1 },
    { icon: "🥁", top: "25%", left: "3%", delay: 2 },
    { icon: "🎺", top: "35%", right: "5%", delay: 0.5 },
    { icon: "🎻", top: "45%", left: "2%", delay: 1.5 },
    { icon: "🎹", top: "55%", right: "3%", delay: 2.5 },
    { icon: "🎧", top: "65%", left: "4%", delay: 1 },
    { icon: "🔊", top: "75%", right: "6%", delay: 2 },
    { icon: "📻", top: "85%", left: "5%", delay: 0.5 },
    { icon: "🎵", top: "20%", left: "85%", delay: 1.5 },
    { icon: "🎶", top: "40%", left: "90%", delay: 2 },
    { icon: "🎼", top: "60%", left: "88%", delay: 0.5 },
    { icon: "🔥", top: "80%", left: "92%", delay: 1 },
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
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 relative"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 bg-orange-500 rounded-full transform rotate-3"></div>
            <div className="absolute inset-0 bg-blue-500 rounded-full transform -rotate-2 flex items-center justify-center">
              <Disc3 className="w-10 h-10 sm:w-12 sm:h-12 text-white transform rotate-12" />
            </div>
          </motion.div>
          <motion.p
            className="text-white text-base sm:text-lg font-bold font-handwritten"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            Warming up the decks...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-handwritten overflow-x-hidden relative grid-bg">
      {/* Bolt.new Badge - Top Right */}
      <motion.a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-4 right-4 z-50 transition-transform duration-300 hover:scale-110"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <img
          src="/bolt_white_circle_360x360.png"
          alt="Bolt.new Badge"
          className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
          style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))' }}
        />
      </motion.a>

      {/* Scattered Icons */}
      {scatteredIcons.map((item, index) => (
        <motion.div
          key={index}
          className="scattered-icon"
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            animationDelay: `${item.delay}s`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ delay: item.delay + 3, duration: 0.5 }}
        >
          {item.icon}
        </motion.div>
      ))}

      {/* Hand-drawn background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <svg className="absolute inset-0 w-full h-full">
          <g className="animate-pulse">
            <path
              d="M100,100 Q120,80 140,100 Q160,120 180,100"
              stroke="#10b981"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="200" cy="110" r="6" fill="#f59e0b" />
            <path
              d="M300,200 Q320,180 340,200 Q360,220 380,200"
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {/* Hero Section */}
      <motion.section
        className="min-h-[80vh] flex items-center justify-center relative px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="text-center z-10 relative">
          <motion.svg
            className="absolute -top-20 -right-10 w-16 h-16 text-orange-400"
            initial={{ opacity: 0, rotate: -20 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <path
              d="M5,25 Q15,5 35,15 Q45,20 40,30 L35,25 M40,30 L30,35"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </motion.svg>

          <motion.h1
            className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4 sm:mb-6 handwritten-title transform -rotate-1"
            initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: -1 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.3 }}
          >
            <span className="text-white">DropLab</span>
          </motion.h1>

          <motion.svg
            className="mx-auto mb-6"
            width="300"
            height="20"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
          >
            <path
              d="M20,10 Q80,5 150,12 Q220,8 280,15"
              stroke="#f59e0b"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </motion.svg>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-white font-handwritten font-bold animate-handwrite transform rotate-1"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            From Studio to Stage, All in One Tab.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              onClick={() => navigate('/producer')}
              className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 border-2 border-gray-700 rounded-lg font-bold text-base sm:text-lg text-white transition-all btn-fun duration-300 hover:scale-105 touch-manipulation transform -rotate-1 hover:rotate-0"
              whileHover={{ scale: 1.05, rotate: 0 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">🎼 Start Producing</span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/dj')}
              className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 border-2 border-gray-700 rounded-lg font-bold text-base sm:text-lg text-white transition-all btn-fun duration-300 hover:scale-105 touch-manipulation transform rotate-1 hover:rotate-0"
              whileHover={{ scale: 1.05, rotate: 0 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">🎧 Enter DJ Booth</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Mindmap Features Section */}
      <section className="pt-8 pb-12 sm:pt-12 sm:pb-20 px-4 relative">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Central Hub */}
          <div className="flex justify-center mb-16"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative" style={{ zIndex: 2 }}>
            {/* Producer Mode */}
            <div className="space-y-8">
              <motion.h2
                className="text-2xl sm:text-3xl font-bold text-center handwritten-title mb-8 transform -rotate-1"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <span className="text-white">Producer Mode</span>
                <motion.svg
                  className="mx-auto mt-2"
                  width="200"
                  height="15"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 1.5 }}
                  viewport={{ once: true }}
                >
                  <path
                    d="M20,8 Q60,5 100,10 Q140,6 180,12"
                    stroke="#a855f7"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </motion.h2>

              <div className="space-y-6">
                {producerFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="group relative"
                    variants={featureVariants}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div
                      className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-emerald-500 transition-all duration-300 transform hover:scale-105"
                      style={{
                        transform: `rotate(${Math.random() * 4 - 2}deg)`,
                        marginLeft: `${index * 20}px`,
                      }}
                    >
                      <div className="text-2xl">{feature.doodle}</div>
                      <h3 className="text-base sm:text-lg font-bold font-handwritten text-white">
                        {feature.title}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* DJ Mode */}
            <div className="space-y-8">
              <motion.h2
                className="text-2xl sm:text-3xl font-bold text-center handwritten-title mb-8 transform rotate-1"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <span className="text-white">DJ Mode</span>
                <motion.svg
                  className="mx-auto mt-2"
                  width="200"
                  height="15"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 1.5 }}
                  viewport={{ once: true }}
                >
                  <path
                    d="M20,8 Q60,5 100,10 Q140,6 180,12"
                    stroke="#ec4899"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </motion.h2>

              <div className="space-y-6">
                {djFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="group relative"
                    variants={featureVariants}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div
                      className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-pink-500 transition-all duration-300 transform hover:scale-105"
                      style={{
                        transform: `rotate(${Math.random() * 4 - 2}deg)`,
                        marginRight: `${index * 20}px`,
                      }}
                    >
                      <div className="text-2xl">{feature.doodle}</div>
                      <h3 className="text-base sm:text-lg font-bold font-handwritten text-white">
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
      <section className="py-12 sm:py-20 px-4 bg-gray-900/30 relative">
        <motion.div
          className="max-w-4xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 handwritten-title transform -rotate-1">
            <span className="text-white">No gear? No problem.</span>
          </h2>

          <motion.svg
            className="mx-auto mb-8"
            width="400"
            height="20"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 2 }}
            viewport={{ once: true }}
          >
            <path
              d="M20,10 Q100,5 200,12 Q300,8 380,15 Q350,18 200,15 Q100,18 20,12"
              stroke="#10b981"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </motion.svg>

          <p className="text-lg sm:text-xl text-white mb-8 sm:mb-12 leading-relaxed font-handwritten">
            We have online gear similar to real life, but not a 100% copy—just enough to get you started!
          </p>

          <motion.div
            className="flex flex-col items-center"
            whileHover={{ scale: 1.07, rotate: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="drop-shadow-2xl pointer-events-none select-none"
              style={{ width: 180, height: 180, marginLeft: '20rem', marginRight: 'auto' }}
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
            >
              <div style={{ transform: 'scale(0.7) rotate(-8deg)', width: 260, height: 260 }}>
                <CDJDeck side="A" />
              </div>
            </motion.div>
            <button
              onClick={() => navigate('/dj')}
              className="mt-64 px-6 py-2 btn-fun text-white font-bold rounded-full shadow-lg transition-all duration-200 text-lg font-handwritten"
              style={{ pointerEvents: 'auto' }}
            >
              Check this gear out
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Tech Stack */}
      <section className="py-12 sm:py-20 px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold handwritten-title transform rotate-1">
              <span className="text-white">Built with powerful tech:</span>
            </h2>
            <motion.svg
              className="mx-auto mt-2"
              width="300"
              height="15"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 1.5 }}
              viewport={{ once: true }}
            >
              <path
                d="M20,8 Q80,5 150,10 Q220,6 280,12"
                stroke="#6366f1"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </motion.svg>
          </div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {techStack.map((tech, index) => (
              <motion.span
                key={tech.name}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-900 border border-gray-800 rounded-full font-bold text-xs sm:text-sm text-white touch-manipulation font-handwritten relative hover:border-emerald-500 transition-colors"
                initial={{ opacity: 0, scale: 0.8, rotate: Math.random() * 20 - 10 }}
                whileInView={{ opacity: 1, scale: 1, rotate: Math.random() * 6 - 3 }}
                transition={{ delay: index * 0.1, duration: 0.5, type: "spring", bounce: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1, rotate: 0 }}
              >
                {tech.name}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-20 px-4 bg-gray-900/30 relative">
        <motion.div
          className="max-w-4xl mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 handwritten-title transform -rotate-1">
            <span className="text-white">Ready to make some noise?</span>
          </h2>

          <motion.svg
            className="mx-auto mb-8"
            width="400"
            height="20"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 2 }}
            viewport={{ once: true }}
          >
            <path
              d="M20,10 Q100,5 200,12 Q300,8 380,15 Q350,18 200,15 Q100,18 20,12"
              stroke="#ef4444"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </motion.svg>

          <p className="text-lg sm:text-xl text-white mb-8 sm:mb-12 leading-relaxed font-handwritten">
            Jump into the studio or the DJ booth and start creating. No account needed, just pure musical expression.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-8 sm:mb-12">
            <motion.button
              onClick={() => navigate('/producer')}
              className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 border-2 rounded-lg font-bold text-base sm:text-lg text-white transition-all duration-300 btn-fun touch-manipulation font-handwritten transform -rotate-2 hover:rotate-0  border-gray-700"
              whileHover={{ scale: 1.05, rotate: 0 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">🎼 Start Producing</span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/dj')}
              className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 border-2 rounded-lg font-bold text-base sm:text-lg text-white transition-all duration-300 btn-fun touch-manipulation font-handwritten transform rotate-2 hover:rotate-0  border-gray-700"
              whileHover={{ scale: 1.05, rotate: 0 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">🎧 Enter DJ Booth</span>
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.section
        className="py-6 px-4 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <p className="text-white text-xs sm:text-sm font-handwritten transform rotate-1">
          © 2025 DropLab by Aarjav & Naman 🚀 | Hackathon Edition
        </p>
      </motion.section>
    </div>
  );
};

export default Index;
