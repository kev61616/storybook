"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FloatingElement } from '../animations';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color?: string;
  className?: string;
}

/**
 * FeatureCard - An animated card component for showcasing features
 * Includes hover animations and a floating icon
 */
export default function FeatureCard({
  title,
  description,
  icon,
  color = 'blue',
  className = '',
}: FeatureCardProps) {
  const backgroundColorClass = `bg-${color}-100`;
  const textColorClass = `text-${color}-600`;
  
  return (
    <motion.div 
      className={`bg-white rounded-xl p-5 text-center shadow-md hover:shadow-lg transition-shadow duration-300 ${className}`}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Icon with floating animation */}
      <div className="relative">
        <FloatingElement
          duration={3}
          yOffset={5}
          className={`${backgroundColorClass} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}
        >
          <span className="text-2xl">{icon}</span>
        </FloatingElement>
      </div>
      
      {/* Title */}
      <h3 className={`font-[family-name:var(--font-baloo)] text-xl font-semibold mb-2 ${textColorClass}`}>
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-gray-600">
        {description}
      </p>
    </motion.div>
  );
}
