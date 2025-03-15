"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  themeColor?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

/**
 * Animated Button Component 
 * 
 * A beautiful button with hover and tap animations
 * Can be customized with different variants, sizes, and colors
 */
export default function AnimatedButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  themeColor = 'blue',
  disabled = false,
  type = 'button',
  icon,
  iconPosition = 'left',
  fullWidth = false,
}: AnimatedButtonProps) {
  
  // Base styles based on variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return `bg-gradient-to-r from-${themeColor}-500 to-${themeColor}-700 text-white shadow-md hover:shadow-lg`;
      case 'secondary':
        return `bg-white text-${themeColor}-600 border border-${themeColor}-200 shadow-sm hover:border-${themeColor}-300`;
      case 'outline':
        return `bg-transparent text-${themeColor}-600 border-2 border-${themeColor}-500 hover:bg-${themeColor}-50`;
      default:
        return `bg-gradient-to-r from-${themeColor}-500 to-${themeColor}-700 text-white shadow-md hover:shadow-lg`;
    }
  };
  
  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': 
        return 'py-1.5 px-3 text-sm';
      case 'md': 
        return 'py-2.5 px-5 text-base';
      case 'lg': 
        return 'py-3 px-6 text-lg';
      default: 
        return 'py-2.5 px-5 text-base';
    }
  };
  
  // Combined classes
  const buttonClasses = `
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${fullWidth ? 'w-full' : ''}
    font-medium rounded-full transition-all duration-200
    flex items-center justify-center
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;
  
  // Animation variants
  const buttonVariants = {
    initial: {
      scale: 1
    },
    hover: {
      scale: 1.05
    },
    tap: {
      scale: 0.98
    },
    disabled: {
      scale: 1,
      opacity: 0.5
    }
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      initial="initial"
      whileHover={disabled ? "disabled" : "hover"}
      whileTap={disabled ? "disabled" : "tap"}
      variants={buttonVariants}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-2 flex items-center">{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <span className="ml-2 flex items-center">{icon}</span>
      )}
    </motion.button>
  );
}
