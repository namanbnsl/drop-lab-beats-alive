import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Headphones, Zap, Settings, Disc3, Sliders, Grid3X3, Monitor, PlayCircle, Brain, BookOpen, Sparkles, Waves, Mic, Volume2 } from 'lucide-react';

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
      description: 'Create beats and melodies',
      x: 200, 
      y: 150,
      color: '#8B5CF6',
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
      description: 'Mix and perform live',
      x: 600, 
      y: 150,
      color: '#10B981',
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
      color: '#F59E0B',
      subFeatures: [
        { icon: BookOpen, title: 'Tutorials', x: 350, y: 380 },
        { icon: Sparkles, title: 'Tips', x: 450, y: 380 }
      ]
    }
  ];

  if (isLoading) {
    return (
      <motion.div
        className="fixed inset-0 dark-bg flex items-center justify-center z-50"
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
            className="w-20 h-20 mx-auto mb-6 modern-card flex items-center justify-center spin"
          >
            <Disc3 className="w-10 h-10 text-white" />
          </motion.div>
          <p className="text-white text-body-large">
            Initializing studio...
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen dark-bg text-white overflow-x-hidden">
      {/* Hero Section */}
      <motion.section
        className="min-h-screen flex items-center justify-center relative container mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center z-10 max-w-6xl mx-auto spacing-16">
          <motion.h1
            className="text-display gradient-text font-bold mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            DropLab
          </motion.h1>
          
          <motion.p
            className="text-heading-2 text-medium-contrast mb-12"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            From Studio to Stage, All in One Tab
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button 
              onClick={() => navigate('/producer')}
              className="btn-modern-primary interactive-element touch-manipulation min-touch-target"
            >
              🎼 Start Producing
            </button>

            <button 
              onClick={() => navigate('/dj')}
              className="btn-modern interactive-element touch-manipulation min-touch-target"
            >
              🎧 Enter DJ Booth
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Interactive Mindmap Section */}
      <section className="py-32 container mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-heading-1 text-high-contrast mb-6">
            Everything You Need to Create
          </h2>
          <p className="text-body-large text-medium-contrast max-w-3xl mx-auto">
            Explore our comprehensive music creation ecosystem with interactive features designed for both beginners and professionals.
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
                  <motion.line
                    key={`line-${feature.id}-${subIndex}`}
                    x1={feature.x}
                    y1={feature.y}
                    x2={sub.x}
                    y2={sub.y}
                    className="mindmap-connection"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: index * 0.2 + subIndex * 0.1 }}
                    viewport={{ once: true }}
                  />
                ))}
                {/* Central connections */}
                <motion.line
                  x1={400}
                  y1={200}
                  x2={feature.x}
                  y2={feature.y}
                  className="mindmap-connection"
                  style={{ stroke: feature.color, strokeWidth: 3 }}
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
            <div className="mindmap-node w-24 h-24 flex items-center justify-center pulse-glow">
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
                className="mindmap-node w-20 h-20 flex items-center justify-center"
                style={{ borderColor: feature.color }}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-center">
                <div className="text-body font-semibold text-high-contrast">{feature.title}</div>
                <div className="text-body-small text-low-contrast">{feature.description}</div>
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
                <div className="mindmap-node w-12 h-12 flex items-center justify-center">
                  <sub.icon className="w-5 h-5 text-white" />
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-center">
                  <div className="text-body-small text-medium-contrast whitespace-nowrap">{sub.title}</div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Music, title: 'Professional Tools', description: 'Industry-standard instruments and effects', color: '#8B5CF6' },
            { icon: Brain, title: 'Learn as You Go', description: 'Interactive tutorials and real-time guidance', color: '#10B981' },
            { icon: Sparkles, title: 'No Installation', description: 'Everything runs in your browser', color: '#F59E0B' },
            { icon: Waves, title: 'Real-time Audio', description: 'Low-latency audio processing', color: '#3B82F6' },
            { icon: Monitor, title: 'Professional UI', description: 'Intuitive interface designed for creators', color: '#EF4444' },
            { icon: Mic, title: 'Export Ready', description: 'High-quality audio export options', color: '#8B5CF6' }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="modern-card p-8 text-center interactive-element"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div 
                className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${feature.color}20`, border: `2px solid ${feature.color}` }}
              >
                <feature.icon className="w-8 h-8" style={{ color: feature.color }} />
              </div>
              <h3 className="text-heading-3 text-high-contrast mb-4">{feature.title}</h3>
              <p className="text-body text-medium-contrast">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 container mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-heading-1 text-high-contrast mb-6">
            Built with Modern Technology
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'React', color: '#61DAFB' },
              { name: 'TypeScript', color: '#3178C6' },
              { name: 'Tone.js', color: '#8B5CF6' },
              { name: 'WebAudio API', color: '#10B981' },
              { name: 'Tailwind CSS', color: '#06B6D4' },
              { name: 'Vite', color: '#646CFF' }
            ].map((tech, index) => (
              <motion.span
                key={tech.name}
                className="modern-card px-6 py-3 text-body font-medium text-high-contrast interactive-element touch-manipulation"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                style={{ borderColor: tech.color }}
              >
                {tech.name}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <motion.section
        className="py-32 container mx-auto text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-display text-high-contrast mb-8">
          Ready to Create?
        </h2>
        
        <p className="text-body-large text-medium-contrast mb-12 max-w-2xl mx-auto">
          Join thousands of creators who are already making music with DropLab. 
          No downloads, no setup - just pure creativity.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <motion.button
            onClick={() => navigate('/producer')}
            className="btn-modern-primary interactive-element touch-manipulation min-touch-target float"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎼 Start Producing Now
          </motion.button>

          <motion.button
            onClick={() => navigate('/dj')}
            className="btn-modern interactive-element touch-manipulation min-touch-target"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎧 Enter DJ Booth
          </motion.button>
        </div>

        <p className="text-body-small text-low-contrast">
          © 2025 DropLab by Aarjav & Naman | Built for creators, by creators
        </p>
      </motion.section>
    </div>
  );
};

export default Index;