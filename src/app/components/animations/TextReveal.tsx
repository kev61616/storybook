"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface TextRevealProps {
  text: string;
  className?: string;
  textClassName?: string;
  delay?: number;
  duration?: number;
  staggerChildren?: number;
  once?: boolean;
  highlightWords?: string[];
  highlightClassName?: string;
}

/**
 * TextReveal - Animated text reveal component
 * Each word appears one after another with a staggered animation
 */
export default function TextReveal({
  text,
  className = '',
  textClassName = '',
  delay = 0,
  duration = 0.5,
  staggerChildren = 0.1,
  once = true,
  highlightWords = [],
  highlightClassName = 'bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500',
}: TextRevealProps) {
  // Split text into words
  const words = text.split(' ');
  
  // Container animation
  const container = {
    hidden: { opacity: 0 },
    visible: () => ({
      opacity: 1,
      transition: { 
        staggerChildren,
        delayChildren: delay,
        when: "beforeChildren" 
      },
    }),
  };
  
  // Word animation
  const child = {
    hidden: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration,
      },
    },
  };
  
  // Check if a word should be highlighted
  const shouldHighlight = (word: string): boolean => {
    // Remove punctuation for comparison
    const cleanWord = word.replace(/[.,!?;:()]/g, '').toLowerCase();
    return highlightWords.some(hw => hw.toLowerCase() === cleanWord);
  };

  return (
    <motion.div
      className={`inline-block ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      variants={container}
    >
      {words.map((word, index) => (
        <React.Fragment key={index}>
          <motion.span
            className={`inline-block ${textClassName} ${shouldHighlight(word) ? highlightClassName : ''}`}
            variants={child}
          >
            {word}
          </motion.span>
          {index !== words.length - 1 && <span>&nbsp;</span>}
        </React.Fragment>
      ))}
    </motion.div>
  );
}
