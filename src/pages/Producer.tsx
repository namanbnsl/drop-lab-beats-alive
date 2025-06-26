import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Home, Volume2, Play, Pause, Download, Send } from 'lucide-react';
import ProducerNavbar from '../components/Producer/ProducerNavbar';
import WelcomeSection from '../components/Producer/WelcomeSection';
import MelodySection from '../components/Producer/MelodySection';
import DrumSection from '../components/Producer/DrumSection';
import GridSection from '../components/Producer/GridSection';
import FXSection from '../components/Producer/FXSection';
import MixerSection from '../components/Producer/MixerSection';
import ExportSection from '../components/Producer/ExportSection';

const Producer = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('welcome');

  // Scroll spy effect to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['welcome', 'melody', 'drums', 'grid', 'fx', 'mixer', 'export'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-['Poppins'] overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-purple-800/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(162,89,255,0.03)_0%,transparent_50%)]" />
      </div>

      {/* Navigation */}
      <ProducerNavbar activeSection={activeSection} onNavigateHome={() => navigate('/')} />

      {/* Main Content */}
      <main className="relative z-10">
        <WelcomeSection />
        <MelodySection />
        <DrumSection />
        <GridSection />
        <FXSection />
        <MixerSection />
        <ExportSection />
      </main>
    </div>
  );
};

export default Producer;