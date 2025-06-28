import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Headphones, Zap, Settings, Disc3, Sliders, Grid3X3, Monitor, PlayCircle, Brain, BookOpen, Sparkles, Waves, Mic, Volume2, Heart, Star } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const mindmapFeatures = [
    { 
      id: 'producer', 
      icon: Music, 
      title: 'Producer Mode', 
      description: 'Create beats & melodies',
      x: 200, 
      y: 150,
      color: '#A8D8EA',
      subFeatures: [
        { icon: Zap, title: 'Drum Machine', x: 100, y: 80 },
        { icon: Waves, title: 'Synthesizer', x: 300, y: 80 },
        { icon: Settings, title: 'Effects', x: 150, y: 220 },
        { icon: Grid3X3, title: 'Step Sequencer', x: 250, y: 220 }
      ]
    },
    { 
      id: 'dj', 
      icon: Headphones, 
      title: 'DJ Mode', 
      description: 'Mix & perform live',
      x: 600, 
      y: 150,
      color: '#C7E8CA',
      subFeatures: [
        { icon: Monitor, title: 'CDJ Decks', x: 500, y: 80 },
        { icon: Sliders, title: 'Mixer', x: 700, y: 80 },
        { icon: PlayCircle, title: 'Auto-Sync', x: 550, y: 220 },
        { icon: Volume2, title: 'Effects', x: 650, y: 220 }
      ]
    },
    { 
      id: 'learn', 
      icon: Brain, 
      title: 'Learn & Grow', 
      description: 'Interactive tutorials',
      x: 400, 
      y: 300,
      color: '#FFF3B2',
      subFeatures: [
        { icon: BookOpen, title: 'Tutorials', x: 350, y: 380 },
        { icon: Sparkles, title: 'Tips & Tricks', x: 450, y: 380 }
      ]
    }
  ];

  if (isLoading) {
    return (
      <motion.div
        className="fixed inset-0 landing-grid flex items-center justify-center z-50"
        initial={{ opacity: 1 }}
        animate={{ opacity: isLoading ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 sketch-card flex items-center justify-center bounce-sketch"
          >
            <Disc3 className="w-10 h-10 text-white" />
          </motion.div>
          <p className="handwritten-text text-white">
            Setting up the studio... ♪
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen landing-grid text-white overflow-x-hidden">
      {/* Hero Section */}
      <motion.section
        className="min-h-screen flex items-center justify-center relative container mx-auto component-spacing"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center z-10 max-w-6xl mx-auto">
          <motion.h1
            className="text-display-handwritten text-white font-bold mb-8 doodle-star"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            DropLab
          </motion.h1>
          
          <motion.p
            className="text-heading-2-handwritten text-gray-300 mb-4 sketch-underline"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            From Studio to Stage, All in One Tab
          </motion.p>

          <motion.p
            className="handwritten-text text-gray-400 mb-12 marker-highlight"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Like having notes scattered on your desk, but for making music! ♫
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button 
              onClick={() => navigate('/producer')}
              className="btn-sketch-primary interactive-element touch-manipulation min-touch-target doodle-heart"
            >
              🎼 Start Producing
            </button>

            <button 
              onClick={() => navigate('/dj')}
              className="btn-sketch interactive-element touch-manipulation min-touch-target doodle-arrow"
            >
              🎧 Enter DJ Booth
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Interactive Mindmap Section */}
      <section className="py-32 container mx-auto component-spacing">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-heading-1-handwritten text-white mb-6 asterisk-decoration">
            Everything You Need to Create Music
          </h2>
          <p className="text-body-large-handwritten text-gray-300 max-w-3xl mx-auto highlight-mint">
            Like a creative workspace where all your tools are within reach - explore our music creation ecosystem!
          </p>
        </motion.div>

        {/* Mindmap Visualization */}
        <motion.div
          className="relative w-full h-96 mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400">
            {/* Connection lines */}
            {mindmapFeatures.map((feature, index) => (
              <g key={`connections-${feature.id}`}>
                {feature.subFeatures.map((sub, subIndex) => (
                  <motion.path
                    key={`line-${feature.id}-${subIndex}`}
                    d={`M ${feature.x} ${feature.y} Q ${(feature.x + sub.x) / 2} ${(feature.y + sub.y) / 2 - 20} ${sub.x} ${sub.y}`}
                    className="connector-curve"
                    style={{ stroke: feature.color }}
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: index * 0.2 + subIndex * 0.1 }}
                    viewport={{ once: true }}
                  />
                ))}
                {/* Central connections */}
                <motion.path
                  d={`M 400 200 Q ${(400 + feature.x) / 2} ${(200 + feature.y) / 2 - 30} ${feature.x} ${feature.y}`}
                  className="connector-curve"
                  style={{ stroke: feature.color, strokeWidth: 4 }}
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: index * 0.3 }}
                  viewport={{ once: true }}
                />
              </g>
            ))}
          </svg>

          {/* Central node */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="mindmap-node-sketch w-24 h-24 flex items-center justify-center pulse-sketch">
              <Disc3 className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Feature nodes */}
          {mindmapFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${(feature.x / 800) * 100}%`, top: `${(feature.y / 400) * 100}%` }}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.2 + 0.8 }}
              viewport={{ once: true }}
              onClick={() => navigate(feature.id === 'producer' ? '/producer' : feature.id === 'dj' ? '/dj' : '/')}
            >
              <div 
                className="mindmap-node-sketch w-20 h-20 flex items-center justify-center"
                style={{ backgroundColor: feature.color }}
              >
                <feature.icon className="w-8 h-8 text-gray-800" />
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-center">
                <div className="handwritten-text text-white font-semibold">{feature.title}</div>
                <div className="handwritten-small text-gray-300">{feature.description}</div>
              </div>
            </motion.div>
          ))}

          {/* Sub-feature nodes */}
          {mindmapFeatures.map((feature) =>
            feature.subFeatures.map((sub, subIndex) => (
              <motion.div
                key={`${feature.id}-${subIndex}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(sub.x / 800) * 100}%`, top: `${(sub.y / 400) * 100}%` }}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: subIndex * 0.1 + 1.5 }}
                viewport={{ once: true }}
              >
                <div 
                  className="mindmap-node-sketch w-12 h-12 flex items-center justify-center"
                  style={{ backgroundColor: feature.color }}
                >
                  <sub.icon className="w-5 h-5 text-gray-800" />
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-center">
                  <div className="handwritten-small text-gray-300 whitespace-nowrap">{sub.title}</div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 container mx-auto component-spacing">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-heading-1-handwritten text-white mb-6 circle-decoration">
            Why DropLab is Pretty Cool ★
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Music, title: 'Professional Tools', description: 'Industry-standard instruments and effects, but easier to use!', color: '#A8D8EA' },
            { icon: Brain, title: 'Learn as You Go', description: 'Interactive tutorials and real-time guidance - like having a music teacher', color: '#C7E8CA' },
            { icon: Sparkles, title: 'No Installation', description: 'Everything runs in your browser - just click and create!', color: '#FFF3B2' },
            { icon: Waves, title: 'Real-time Audio', description: 'Low-latency audio processing for smooth performance', color: '#FFD3D8' },
            { icon: Monitor, title: 'Beautiful Interface', description: 'Intuitive design that feels like your creative notebook', color: '#E1BEE7' },
            { icon: Mic, title: 'Export Ready', description: 'High-quality audio export options for sharing your creations', color: '#FFD4A3' }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="sketch-card p-8 text-center interactive-element"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div 
                className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center border-2 border-white"
                style={{ backgroundColor: feature.color }}
              >
                <feature.icon className="w-8 h-8 text-gray-800" />
              </div>
              <h3 className="text-heading-3-handwritten text-white mb-4">{feature.title}</h3>
              <p className="handwritten-text text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 container mx-auto component-spacing">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-heading-1-handwritten text-white mb-6">
            Built with Modern Tech ⚡
          </h2>
          <p className="handwritten-text text-gray-300 mb-8">
            (The boring technical stuff that makes the magic happen)
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'React ⚛️', color: '#A8D8EA' },
              { name: 'TypeScript 📝', color: '#C7E8CA' },
              { name: 'Tone.js 🎚️', color: '#FFF3B2' },
              { name: 'WebAudio API 🎧', color: '#FFD3D8' },
              { name: 'Tailwind CSS 💨', color: '#E1BEE7' },
              { name: 'Vite ⚡', color: '#FFD4A3' }
            ].map((tech, index) => (
              <motion.span
                key={tech.name}
                className="sketch-card px-6 py-3 handwritten-text font-medium text-gray-800 interactive-element touch-manipulation"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                style={{ backgroundColor: tech.color }}
              >
                {tech.name}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <motion.section
        className="py-32 container mx-auto component-spacing text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="sticky-note max-w-2xl mx-auto p-8 mb-12">
          <h2 className="text-display-handwritten text-gray-800 mb-6">
            Ready to Create Something Amazing?
          </h2>
          
          <p className="text-body-large-handwritten text-gray-700 mb-8">
            Join thousands of creators who are already making music with DropLab. 
            No downloads, no setup - just pure creativity! ♪
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <motion.button
            onClick={() => navigate('/producer')}
            className="btn-sketch-primary interactive-element touch-manipulation min-touch-target float-sketch"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎼 Start Producing Now!
          </motion.button>

          <motion.button
            onClick={() => navigate('/dj')}
            className="btn-sketch interactive-element touch-manipulation min-touch-target wiggle"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎧 Enter DJ Booth
          </motion.button>
        </div>

        <div className="sketch-box p-4 max-w-md mx-auto">
          <p className="handwritten-small text-gray-300">
            © 2025 DropLab by Aarjav & Naman
          </p>
          <p className="handwritten-small text-gray-400 mt-1">
            Built for creators, by creators ♡
          </p>
        </div>
      </motion.section>
    </div>
  );
};

export default Index;