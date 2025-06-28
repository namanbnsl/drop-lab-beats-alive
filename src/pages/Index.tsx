import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Headphones, Zap, Settings, Disc3, Sliders, Grid3X3, Monitor, PlayCircle, Brain, BookOpen } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const producerFeatures = [
    { icon: Music, title: "Melody Generator", color: "highlight-blue" },
    { icon: Zap, title: "Drum Pattern Builder", color: "highlight-pink" },
    { icon: Grid3X3, title: "Synth Grid Composer", color: "highlight-mint" },
    { icon: Settings, title: "Modular FX Playground", color: "highlight-yellow" }
  ];

  const djFeatures = [
    { icon: Monitor, title: "Dual CDJs", color: "highlight-mint" },
    { icon: Sliders, title: "3-Band EQ Mixer", color: "highlight-yellow" },
    { icon: PlayCircle, title: "Launch Sim Mode", color: "highlight-blue" },
    { icon: Brain, title: "Tutorial + Tooltips", color: "highlight-pink" }
  ];

  const techStack = [
    { name: "React", color: "highlight-blue" },
    { name: "Tailwind CSS", color: "highlight-pink" },
    { name: "Tone.js", color: "highlight-mint" },
    { name: "WebAudio API", color: "highlight-yellow" },
    { name: "TypeScript", color: "highlight-blue" },
    { name: "Vite", color: "highlight-pink" }
  ];

  if (isLoading) {
    return (
      <motion.div
        className="fixed inset-0 paper-bg flex items-center justify-center z-50"
        initial={{ opacity: 1 }}
        animate={{ opacity: isLoading ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sketch-card flex items-center justify-center spin-sketch"
          >
            <Disc3 className="w-8 h-8 sm:w-10 sm:h-10 text-gray-700" />
          </motion.div>
          <p className="handwritten-text text-gray-700 text-lg sm:text-xl">
            Getting ready...
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen paper-bg text-gray-800 overflow-x-hidden paper-texture">
      {/* Hero Section */}
      <motion.section
        className="min-h-screen flex items-center justify-center relative px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center z-10 max-w-6xl mx-auto">
          <motion.h1
            className="handwritten-title text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-bold mb-6 sm:mb-8 md:mb-12 text-gray-800 sketch-underline"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            DropLab ★
          </motion.h1>
          
          <motion.div
            className="marker-highlight inline-block mb-8 sm:mb-12 md:mb-16"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="handwritten-text text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-700">
              From Studio to Stage, All in One Tab
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-12 justify-center items-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <button 
              onClick={() => navigate('/producer')}
              className="btn-sketch-primary asterisk-decoration touch-manipulation min-touch-target"
            >
              🎼 Start Producing
            </button>

            <button 
              onClick={() => navigate('/dj')}
              className="btn-sketch doodle-arrow touch-manipulation min-touch-target"
            >
              🎧 Enter DJ Booth
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Feature Breakdown */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-20">
            {/* Producer Mode */}
            <div>
              <motion.h2
                className="handwritten-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 sm:mb-12 text-center text-gray-800 sketch-circle"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
              >
                Producer Mode
              </motion.h2>
              <div className="space-y-6 sm:space-y-8">
                {producerFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="sketch-card p-6 sm:p-8"
                    variants={featureVariants}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className={`p-3 sm:p-4 ${feature.color} doodle-star`}>
                        <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" />
                      </div>
                      <h3 className="handwritten-text text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
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
                className="handwritten-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 sm:mb-12 text-center text-gray-800 sketch-circle"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
              >
                DJ Mode
              </motion.h2>
              <div className="space-y-6 sm:space-y-8">
                {djFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    className="sketch-card p-6 sm:p-8"
                    variants={featureVariants}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className={`p-3 sm:p-4 ${feature.color} doodle-star`}>
                        <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" />
                      </div>
                      <h3 className="handwritten-text text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
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
      <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="handwritten-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 md:mb-12 text-gray-800">
            <span className="marker-highlight">No gear? No problem.</span><br />
            <span className="sketch-underline">Learn as you mix.</span>
          </h2>
          <p className="handwritten-text text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-700 mb-12 sm:mb-16 md:mb-20 leading-relaxed">
            DropLab is built to teach as you play. With interactive tooltips and a step-by-step walkthrough, 
            anyone can go from beginner to beat master.
          </p>
          
          <motion.div
            className="inline-block wiggle"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-48 h-32 sm:w-64 sm:h-40 md:w-80 md:h-48 sketch-card flex items-center justify-center relative">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-gray-700" />
              <div className="absolute top-2 right-2 highlight-yellow text-gray-800 handwritten-small px-2 py-1 font-semibold">
                Learn!
              </div>
              <div className="absolute bottom-2 left-2 highlight-mint text-gray-800 handwritten-small px-2 py-1 font-semibold">
                Tip: Try this!
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="handwritten-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-12 sm:mb-16 md:mb-20 text-gray-800 sketch-underline">
            Built with powerful tech ⚡
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
            {techStack.map((tech, index) => (
              <motion.span
                key={tech.name}
                className={`${tech.color} handwritten-text px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 font-semibold text-base sm:text-lg md:text-xl text-gray-800 transition-all duration-200 hover:scale-105 touch-manipulation min-touch-target border-2 border-gray-800`}
                style={{ borderRadius: '15px 20px 18px 22px' }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                {tech.name}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <motion.section
        className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="handwritten-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-12 sm:mb-16 md:mb-20 text-gray-800">
          <span className="marker-highlight">Ready to drop</span><br />
          <span className="sketch-underline asterisk-decoration">your first beat?</span>
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-12 justify-center mb-16 sm:mb-20 md:mb-24">
          <motion.button
            onClick={() => navigate('/producer')}
            className="btn-sketch-primary bounce-sketch touch-manipulation min-touch-target"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎼 Start Producing
          </motion.button>

          <motion.button
            onClick={() => navigate('/dj')}
            className="btn-sketch doodle-arrow touch-manipulation min-touch-target"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎧 Enter DJ Booth
          </motion.button>
        </div>

        <p className="handwritten-small text-gray-600 text-sm sm:text-base">
          © 2025 DropLab by Aarjav & Naman | Hackathon Edition
        </p>
      </motion.section>
    </div>
  );
};

export default Index;