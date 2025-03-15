"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface FloatingElementProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  yOffset?: number;
  xOffset?: number;
  className?: string;
}

/**
 * A component that creates a gentle floating animation for its children
 * Perfect for decorative elements, mascots, or UI embellishments
 */
export default function FloatingElement({
  children,
  duration = 4,
  delay = 0,
  yOffset = 10,
  xOffset = 0,
  className = '',
}: FloatingElementProps) {
  // Generate a random seed for slight randomness in animation
  const seed = React.useRef(Math.random());
  
  const floatingAnimation = {
    y: {
      duration: duration,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut",
      delay: delay,
    },
    x: xOffset !== 0 ? {
      duration: duration * 1.3, // Slightly different duration creates more organic movement
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut",
      delay: delay + seed.current, // Add slight seed for randomization
    } : undefined
  };

  return (
    <motion.div
      className={className}
      initial={{ y: 0, x: 0 }}
      animate={{ 
        y: [0, yOffset],
        x: xOffset !== 0 ? [0, xOffset] : undefined,
      }}
      transition={floatingAnimation}
    >
      {children}
    </motion.div>
  );
}
