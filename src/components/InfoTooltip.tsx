import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  className?: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
      >
        <Info className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-8 left-0 z-50 bg-black border border-blue-500 text-white rounded-lg p-3 text-sm shadow-lg max-w-xs"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-1 right-1 text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
              <p className="pr-4">{content}</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InfoTooltip;
