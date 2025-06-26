
import React from 'react';

export const HandDrawnArrow = ({ className = "", direction = "right" }: { className?: string; direction?: "right" | "left" | "down" | "up" }) => {
  const paths = {
    right: "M10,30 Q40,20 70,30 Q50,35 55,40 M70,30 Q50,25 55,20",
    left: "M70,30 Q40,20 10,30 Q30,35 25,40 M10,30 Q30,25 25,20", 
    down: "M30,10 Q20,40 30,70 Q35,50 40,55 M30,70 Q25,50 20,55",
    up: "M30,70 Q20,40 30,10 Q35,30 40,25 M30,10 Q25,30 20,25"
  };

  return (
    <svg className={`w-20 h-12 ${className}`} viewBox="0 0 80 50" fill="none">
      <path 
        d={paths[direction]} 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="text-purple-400"
      />
    </svg>
  );
};

export const HandDrawnCircle = ({ className = "" }: { className?: string }) => (
  <svg className={`w-16 h-16 ${className}`} viewBox="0 0 60 60" fill="none">
    <path 
      d="M30,5 Q45,10 50,30 Q45,50 30,55 Q15,50 10,30 Q15,10 30,5" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      fill="none"
      className="text-purple-400"
    />
  </svg>
);

export const HandDrawnUnderline = ({ className = "" }: { className?: string }) => (
  <svg className={`w-full h-4 ${className}`} viewBox="0 0 200 20" fill="none">
    <path 
      d="M5,15 Q50,10 100,12 Q150,14 195,10" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
      className="text-purple-400"
    />
  </svg>
);

export const HandDrawnStar = ({ className = "" }: { className?: string }) => (
  <svg className={`w-8 h-8 ${className}`} viewBox="0 0 24 24" fill="none">
    <path 
      d="M12,2 L14,8 L20,9 L15,14 L17,20 L12,17 L7,20 L9,14 L4,9 L10,8 Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="currentColor"
      className="text-purple-400"
    />
  </svg>
);

export const StickyNote = ({ children, className = "", color = "yellow" }: { children: React.ReactNode; className?: string; color?: string }) => (
  <div className={`relative ${className}`}>
    <div className={`bg-${color}-200 border-${color}-300 border-2 p-3 transform rotate-1 shadow-lg font-caveat text-lg text-gray-800`}>
      {children}
      <div className={`absolute top-0 right-0 w-0 h-0 border-l-4 border-b-4 border-l-${color}-300 border-b-transparent transform rotate-45`}></div>
    </div>
  </div>
);
