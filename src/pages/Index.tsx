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
    "React",
    "Tailwind CSS",
    "Tone.js",
    "WebAudio API",
    "TypeScript",
    "Vite"
  ];

  if (isLoading) {
    return (
      <motion.div
        className="fixed inset-0 pure-black flex items-center justify-center z-50"
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
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-white flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Disc3 className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
          </motion.div>
          <p className="text-white text-base sm:text-lg font-medium">
            Loading...
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen pure-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <motion.section
        className="min-h-screen flex items-center justify-center relative px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center z-10 max-w-6xl mx-auto">
          <motion.h1
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-6 sm:mb-8 md:mb-12"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            DropLab
          </motion.h1>
          
          <motion.p
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-12 md:mb-16 text-gray-300"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            From Studio to Stage, All in One Tab
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 justify-center items-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <button 
              onClick={() => navigate('/producer')}
              className="btn-minimal-primary px-8 sm:px-12 py-4 sm:py-6 font-semibold text-base sm:text-lg md:text-xl transition-all duration-200 hover:scale-105 touch-manipulation min-touch-target"
            >
              Start Producing
            </button>

            <button 
              onClick={() => navigate('/dj')}
              className="btn-minimal px-8 sm:px-12 py-4 sm:py-6 font-semibold text-base sm:text-lg md:text-xl text-white transition-all duration-200 hover:scale-105 touch-manipulation min-touch-target"
            >
              Enter DJ Booth
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
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 text-center"
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
                    className="clean-card p-6 sm:p-8"
                    variants={featureVariants}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="p-3 sm:p-4 bg-white text-black">
                        <feature.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">
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
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 text-center"
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
                    className="clean-card p-6 sm:p-8"
                    variants={featureVariants}
                    initial="hidden"
                    whileInView="visible"
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className="p-3 sm:p-4 bg-white text-black">
                        <feature.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold">
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 md:mb-12">
            No gear? No problem.<br />
            Learn as you mix.
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-12 sm:mb-16 md:mb-20 leading-relaxed">
            DropLab is built to teach as you play. With interactive tooltips and a step-by-step walkthrough, anyone can go from beginner to beat master.
          </p>
          
          <motion.div
            className="inline-block"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-48 h-32 sm:w-64 sm:h-40 md:w-80 md:h-48 clean-card flex items-center justify-center relative">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white" />
              <div className="absolute top-2 right-2 bg-white text-black text-xs sm:text-sm px-2 py-1 font-semibold">
                Learn!
              </div>
              <div className="absolute bottom-2 left-2 bg-white text-black text-xs sm:text-sm px-2 py-1 font-semibold">
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-12 sm:mb-16 md:mb-20">
            Built with powerful tech
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
            {techStack.map((tech, index) => (
              <motion.span
                key={tech}
                className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-white text-black font-semibold text-sm sm:text-base md:text-lg transition-all duration-200 hover:scale-105 touch-manipulation min-touch-target"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
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
        className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-12 sm:mb-16 md:mb-20">
          Ready to drop your first beat?
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 md:gap-12 justify-center mb-16 sm:mb-20 md:mb-24">
          <motion.button
            onClick={() => navigate('/producer')}
            className="btn-minimal-primary px-8 sm:px-12 py-4 sm:py-6 font-semibold text-base sm:text-lg md:text-xl transition-all duration-200 touch-manipulation min-touch-target"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Producing
          </motion.button>

          <motion.button
            onClick={() => navigate('/dj')}
            className="btn-minimal px-8 sm:px-12 py-4 sm:py-6 font-semibold text-base sm:text-lg md:text-xl text-white transition-all duration-200 touch-manipulation min-touch-target"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Enter DJ Booth
          </motion.button>
        </div>

        <p className="text-gray-400 text-sm sm:text-base">
          © 2025 DropLab by Aarjav & Naman | Hackathon Edition
        </p>
      </motion.section>
    </div>
  );
};

export default Index;