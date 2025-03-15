"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FloatingElement } from '../animations';

interface CharacterMascotProps {
  imageSrc: string;
  alt?: string;
  size?: number;
  className?: string;
  interactive?: boolean;
  themeColor?: string;
}

/**
 * CharacterMascot - An animated character mascot for the StoryBuddy app
 * Features floating animation and interactive behaviors
 */
export default function CharacterMascot({
  imageSrc,
  alt = "StoryBuddy mascot",
  size = 150,
  className = '',
  interactive = true,
  themeColor = 'blue'
}: CharacterMascotProps) {
  const [isWaving, setIsWaving] = useState(false);
  const [hasWaved, setHasWaved] = useState(false);
  
  // Automatic welcome wave on first appearance
  useEffect(() => {
    if (!hasWaved && interactive) {
      // Delay the wave for a natural feel
      const timeout = setTimeout(() => {
        setIsWaving(true);
        
        // Stop waving after 2 seconds
        setTimeout(() => {
          setIsWaving(false);
          setHasWaved(true);
        }, 2000);
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [hasWaved, interactive]);
  
  // Handle mouse hover
  const handleMouseEnter = () => {
    if (interactive) {
      setIsWaving(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (interactive) {
      setIsWaving(false);
    }
  };
  
  // Animation variants for the mascot
  const characterVariants = {
    wave: {
      rotate: [0, -10, 15, -10, 15, 0],
      transition: {
        duration: 1.5,
        ease: "easeInOut",
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: "easeInOut",
      }
    }
  };
  
  return (
    <div className={`relative ${className}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* Light effect behind character */}
      <div className={`absolute -inset-4 rounded-full bg-gradient-to-r from-${themeColor}-500/20 to-${themeColor}-700/20 blur-xl`} />
      
      {/* Floating animation wrapper */}
      <FloatingElement duration={4} yOffset={10}>
        <motion.div
          animate={isWaving ? "wave" : ""}
          whileHover={interactive ? "hover" : ""}
          whileTap={interactive ? "tap" : ""}
          variants={characterVariants}
          className="cursor-pointer"
        >
          {/* Character image */}
          <div className="relative" style={{ width: size, height: size }}>
            <Image
              src={imageSrc}
              alt={alt}
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
          
          {/* Speech bubble that appears when hovering */}
          {interactive && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: -10 }}
              animate={isWaving ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-xl shadow-md text-${themeColor}-600 font-medium text-sm whitespace-nowrap`}
            >
              <div className="relative">
                Hello! I&apos;m your StoryBuddy!
                {/* Speech bubble tail */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-white" />
              </div>
            </motion.div>
          )}
        </motion.div>
      </FloatingElement>
    </div>
  );
}
