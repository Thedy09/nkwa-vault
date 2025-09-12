import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ size = 40, animated = true, className = "" }) => {
  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      rotate: 2,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const LogoContent = () => (
    <div className={`logo-container ${className}`} style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 200 200" 
        xmlns="http://www.w3.org/2000/svg"
        className="logo-svg"
      >
        {/* Background Circle */}
        <circle cx="100" cy="100" r="95" fill="url(#backgroundGradient)" stroke="url(#borderGradient)" strokeWidth="4"/>
        
        {/* Tree Trunk */}
        <rect x="90" y="120" width="20" height="60" fill="url(#trunkGradient)" rx="10"/>
        
        {/* Tree Canopy */}
        <circle cx="100" cy="100" r="50" fill="url(#canopyGradient)"/>
        
        {/* Circuit Roots */}
        <g stroke="url(#circuitGradient)" strokeWidth="2" fill="none">
          <path d="M100 180 Q70 160 50 140" strokeDasharray="5,5">
            {animated && <animate attributeName="strokeDashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>}
          </path>
          <path d="M100 180 Q90 160 80 140" strokeDasharray="3,3">
            {animated && <animate attributeName="strokeDashoffset" values="0;6" dur="1.5s" repeatCount="indefinite"/>}
          </path>
          <path d="M100 180 Q130 160 150 140" strokeDasharray="4,4">
            {animated && <animate attributeName="strokeDashoffset" values="0;8" dur="1.8s" repeatCount="indefinite"/>}
          </path>
          <path d="M100 180 Q110 160 120 140" strokeDasharray="3,3">
            {animated && <animate attributeName="strokeDashoffset" values="0;6" dur="1.2s" repeatCount="indefinite"/>}
          </path>
        </g>
        
        {/* Circuit Nodes */}
        <circle cx="50" cy="140" r="3" fill="url(#nodeGradient)"/>
        <circle cx="80" cy="140" r="2" fill="url(#nodeGradient)"/>
        <circle cx="120" cy="140" r="2" fill="url(#nodeGradient)"/>
        <circle cx="150" cy="140" r="3" fill="url(#nodeGradient)"/>
        
        {/* Cultural Elements */}
        <g opacity="0.8">
          {/* Music Note */}
          <circle cx="70" cy="80" r="4" fill="url(#elementGradient)"/>
          <path d="M70 76 L70 60" stroke="url(#elementGradient)" strokeWidth="2"/>
          <path d="M70 60 Q75 55 80 60" stroke="url(#elementGradient)" strokeWidth="2" fill="none"/>
          
          {/* Book */}
          <rect x="120" y="75" width="8" height="10" fill="url(#elementGradient)" rx="1"/>
          <path d="M120 80 L128 80" stroke="white" strokeWidth="0.5"/>
          <path d="M120 82 L126 82" stroke="white" strokeWidth="0.5"/>
          
          {/* Drum */}
          <ellipse cx="85" cy="120" rx="8" ry="3" fill="url(#elementGradient)"/>
          <rect x="85" y="120" width="2" height="15" fill="url(#elementGradient)"/>
          
          {/* Mask */}
          <path d="M130 110 Q125 105 120 110 Q125 115 130 110" fill="url(#elementGradient)"/>
        </g>
        
        {/* Central Symbol */}
        <circle cx="100" cy="100" r="15" fill="url(#centerGradient)" stroke="white" strokeWidth="2"/>
        <text x="100" y="107" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="bold" fill="white">N</text>
        
        {/* Gradients */}
        <defs>
          <radialGradient id="backgroundGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{stopColor:'#1a1a1a', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#2d2d2d', stopOpacity:1}} />
          </radialGradient>
          
          <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#FFD700', stopOpacity:1}} />
            <stop offset="50%" style={{stopColor:'#32CD32', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#DC143C', stopOpacity:1}} />
          </linearGradient>
          
          <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#FFD700', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#FFA500', stopOpacity:1}} />
          </linearGradient>
          
          <radialGradient id="canopyGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" style={{stopColor:'#FFD700', stopOpacity:1}} />
            <stop offset="70%" style={{stopColor:'#32CD32', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#228B22', stopOpacity:1}} />
          </radialGradient>
          
          <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor:'#00D4AA', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#00B8A3', stopOpacity:1}} />
          </linearGradient>
          
          <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{stopColor:'#00D4AA', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#00B8A3', stopOpacity:1}} />
          </radialGradient>
          
          <linearGradient id="elementGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor:'#DC143C', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#B22222', stopOpacity:1}} />
          </linearGradient>
          
          <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{stopColor:'#FFD700', stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#FFA500', stopOpacity:1}} />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        variants={logoVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        className={`logo-wrapper ${className}`}
      >
        <LogoContent />
      </motion.div>
    );
  }

  return <LogoContent />;
};

export default Logo;
