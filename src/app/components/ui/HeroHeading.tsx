"use client";

import React from 'react';
import { TextReveal } from '../animations';

interface HeroHeadingProps {
  title: string;
  subtitle?: string;
  highlightWords?: string[];
  themeColor: string;
  className?: string;
}

/**
 * HeroHeading - A beautiful animated heading component for hero sections
 */
export default function HeroHeading({
  title,
  subtitle,
  highlightWords = [],
  themeColor = 'blue',
  className = '',
}: HeroHeadingProps) {
  // Get theme color class for gradient and text
  const getThemeGradient = () => `from-${themeColor}-500 to-${themeColor}-700`;
  const getThemeText = () => `text-${themeColor}-600`;

  return (
    <div className={`text-center ${className}`}>
      {/* Main title with text reveal animation */}
      <h1 className={`font-[family-name:var(--font-baloo)] text-6xl md:text-7xl ${getThemeText()} font-bold mb-4`}>
        <TextReveal
          text={title}
          highlightWords={highlightWords}
          highlightClassName={`bg-clip-text text-transparent bg-gradient-to-r ${getThemeGradient()}`}
          duration={0.5}
          staggerChildren={0.05}
        />
      </h1>
      
      {/* Subtitle with staggered animation */}
      {subtitle && (
        <div className="relative">
          <div className="text-xl md:text-2xl text-center text-gray-600 max-w-2xl mx-auto mb-6">
            <TextReveal
              text={subtitle}
              delay={0.6}
              duration={0.4}
              staggerChildren={0.03}
            />
          </div>
          <div className={`w-36 h-1.5 bg-gradient-to-r ${getThemeGradient()} rounded-full mx-auto`}></div>
        </div>
      )}
    </div>
  );
}
