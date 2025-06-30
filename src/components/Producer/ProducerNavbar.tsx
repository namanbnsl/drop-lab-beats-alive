import React from 'react';
import { motion } from 'framer-motion';
import { Home, Music, Grid3X3, Sliders, Volume2, Download, Brain } from 'lucide-react';

interface ProducerNavbarProps {
  activeSection: string;
  onNavigateHome: () => void;
}

const ProducerNavbar: React.FC<ProducerNavbarProps> = ({ activeSection, onNavigateHome }) => {
  const navItems = [
    { id: 'studio', label: 'Drums', icon: Music },
    { id: 'sequencer', label: 'Sequencer', icon: Grid3X3 },
    { id: 'mixer', label: 'Mixer', icon: Volume2 },
    { id: 'export', label: 'Export', icon: Download },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-black/80 backdrop-blur-md rounded-2xl border border-blue-500/30 p-4"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo/Home Button */}
      <motion.button
        onClick={onNavigateHome}
        className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 hover:bg-blue-500 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Home className="w-6 h-6 text-white" />
      </motion.button>

      {/* Navigation Items */}
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default ProducerNavbar;