"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface SelectionCardProps {
  label: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  theme?: string;
  className?: string;
}

/**
 * SelectionCard - An enhanced card for selection options
 * Used for user preferences like age range, gender, etc.
 * Features smooth animations and visual feedback
 */
export default function SelectionCard({
  label,
  icon,
  isSelected,
  onClick,
  theme = 'blue',
  className = ''
}: SelectionCardProps) {
  // Generate theme-based classes
  const getSelectedClasses = () => {
    return isSelected
      ? `border-${theme}-500 bg-${theme}-50 shadow-md`
      : 'border-gray-200 hover:border-gray-300';
  };
  
  const getIconContainerClasses = () => {
    return `w-10 h-10 rounded-full bg-${theme}-100 flex items-center justify-center mr-3 text-${theme}-600`;
  };
  
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`flex items-center p-3 rounded-xl border-2 transition-all duration-200 ${getSelectedClasses()} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={{ 
        y: isSelected ? [5, 0] : 0, 
        transition: { 
          y: { type: "spring", stiffness: 300, damping: 10 } 
        }
      }}
    >
      {/* Icon container with theme colors */}
      <motion.div 
        className={getIconContainerClasses()}
        animate={{ 
          scale: isSelected ? [1, 1.2, 1] : 1,
          transition: { 
            scale: { 
              duration: 0.3, 
              ease: "easeInOut",
              times: [0, 0.6, 1]
            } 
          }
        }}
      >
        {icon}
      </motion.div>
      
      {/* Label */}
      <span className="font-medium text-gray-800">
        {label}
      </span>
      
      {/* Selected indicator */}
      {isSelected && (
        <motion.div 
          className={`ml-auto w-5 h-5 rounded-full bg-${theme}-500 flex items-center justify-center`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 10 }}
        >
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12l5 5 9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}
