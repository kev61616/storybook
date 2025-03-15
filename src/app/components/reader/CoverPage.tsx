"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { TextReveal, FloatingElement } from '../animations';
import { PageProps } from '../../types/ui';

interface CoverPageProps extends Omit<PageProps, 'content'> {
  title: string;
  author?: string;
}

// Theme decorative elements mapping
const themeElements = {
  adventure: [
    <path key="compass" d="M50,25 A25,25 0 1,1 49.9,25 M50,10 L50,15 M50,85 L50,90 M10,50 L15,50 M85,50 L90,50 M35,35 L30,30 M65,35 L70,30 M35,65 L30,70 M65,65 L70,70" stroke="currentColor" fill="none" strokeLinecap="round" />,
    <circle key="compassCenter" cx="50" cy="50" r="5" fill="currentColor" opacity="0.6" />,
    <path key="compassNeedle" d="M50,50 L40,30 M50,50 L60,70" stroke="currentColor" strokeWidth="2" fill="none" />
  ],
  fantasy: [
    <path key="stars" d="M20,20 L25,20 L27,15 L29,20 L34,20 L30,23 L32,28 L27,25 L22,28 L24,23 Z M70,30 L73,30 L75,27 L77,30 L80,30 L77,32 L79,35 L75,33 L71,35 L73,32 Z M40,80 L45,80 L47,75 L49,80 L54,80 L50,83 L52,88 L47,85 L42,88 L44,83 Z" fill="currentColor" />,
    <path key="wand" d="M65,15 L85,35 M67,17 C67,17 70,20 75,25 C80,30 83,33 83,33 M75,25 C75,25 70,20 65,15" stroke="currentColor" strokeWidth="1.5" fill="none" />,
    <circle key="wandGlow" cx="75" cy="25" r="8" fill="currentColor" opacity="0.2" />
  ],
  space: [
    <circle key="planet" cx="75" cy="25" r="15" fill="currentColor" opacity="0.2" />,
    <circle key="moon" cx="60" cy="20" r="5" fill="currentColor" opacity="0.3" />,
    <path key="stars" d="M20,30 L22,30 L24,26 L26,30 L28,30 L26,32 L28,36 L24,34 L20,36 L22,32 Z M40,70 L42,70 L44,66 L46,70 L48,70 L46,72 L48,76 L44,74 L40,76 L42,72 Z" fill="currentColor" opacity="0.7" />,
    <path key="orbit" d="M75,25 C75,25 65,45 75,65 C85,85 95,65 95,45 C95,25 85,5 75,25" stroke="currentColor" fill="none" opacity="0.4" />
  ],
  underwater: [
    <path key="bubbles" d="M20,20 A5,5 0 1,1 19.9,20 M30,40 A3,3 0 1,1 29.9,40 M25,70 A4,4 0 1,1 24.9,70 M70,25 A6,6 0 1,1 69.9,25 M80,60 A4,4 0 1,1 79.9,60" stroke="currentColor" fill="none" opacity="0.5" />,
    <path key="waves" d="M10,50 C20,45 30,55 40,50 C50,45 60,55 70,50 C80,45 90,55 100,50" stroke="currentColor" fill="none" opacity="0.3" strokeWidth="1.5" />,
    <path key="fish" d="M80,30 C85,25 90,25 90,30 C90,35 85,35 80,30 Z M90,30 L95,35 M90,30 L95,25" stroke="currentColor" fill="none" opacity="0.6" />
  ],
  dinosaurs: [
    <path key="footprint" d="M25,25 A3,5 0 1,1 24.9,25 M35,20 A3,5 0 1,1 34.9,20 M45,20 A3,5 0 1,1 44.9,20" stroke="currentColor" fill="none" opacity="0.4" />,
    <path key="footprint2" d="M65,75 A3,5 0 1,1 64.9,75 M75,70 A3,5 0 1,1 74.9,70 M85,70 A3,5 0 1,1 84.9,70" stroke="currentColor" fill="none" opacity="0.4" />,
    <path key="leaf" d="M80,30 C90,20 95,25 85,35 C95,45 90,50 80,40 C70,50 65,45 75,35 C65,25 70,20 80,30 Z" stroke="currentColor" fill="none" opacity="0.3" />
  ],
  pirates: [
    <path key="anchor" d="M50,20 L50,60 M30,45 C30,60 50,70 70,45 M50,20 A8,8 0 1,1 49.9,20" stroke="currentColor" fill="none" opacity="0.4" strokeWidth="1.5" />,
    <path key="wheel" d="M80,70 A15,15 0 1,1 79.9,70 M80,55 L80,85 M65,70 L95,70 M68,58 L92,82 M68,82 L92,58" stroke="currentColor" fill="none" opacity="0.3" />,
    <path key="waves" d="M10,85 C20,80 30,90 40,85 C50,80 60,90 70,85" stroke="currentColor" fill="none" opacity="0.3" />
  ]
};

/**
 * CoverPage component
 * A specialized page component for displaying a beautiful full-page book cover
 * with sophisticated title overlay and theme-appropriate decorative elements
 */
const CoverPage = React.forwardRef<HTMLDivElement, CoverPageProps>(
  ({ pageNumber, imageUrl, title, author, theme = 'default' }, ref) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    
    // Handle parallax effect for cover elements
    const handleMouseMove = (e: React.MouseEvent) => {
      const { clientX, clientY, currentTarget } = e;
      const { left, top, width, height } = currentTarget.getBoundingClientRect();
      
      // Calculate mouse position as percentage of element dimensions
      const x = (clientX - left) / width;
      const y = (clientY - top) / height;
      
      setMousePosition({ x, y });
    };
    
    // Handle image load completion
    useEffect(() => {
      if (imageUrl) {
        const img = new window.Image();
        img.onload = () => setImageLoaded(true);
        img.src = imageUrl;
      } else {
        setImageLoaded(true);
      }
    }, [imageUrl]);
    
    // Get theme-specific gradient
    const getThemeGradient = () => {
      switch (theme) {
        case 'adventure': return 'from-amber-900/70 via-amber-800/40 to-transparent';
        case 'fantasy': return 'from-purple-900/70 via-purple-800/40 to-transparent';
        case 'space': return 'from-blue-900/70 via-indigo-800/40 to-transparent';
        case 'underwater': return 'from-cyan-900/70 via-cyan-800/40 to-transparent';
        case 'dinosaurs': return 'from-green-900/70 via-green-800/40 to-transparent';
        case 'pirates': return 'from-slate-900/70 via-blue-900/40 to-transparent';
        case 'fairy': return 'from-pink-900/70 via-purple-800/40 to-transparent';
        default: return 'from-slate-900/70 via-slate-800/40 to-transparent';
      }
    };
    
    // Get theme-specific accent color
    const getThemeAccent = () => {
      switch (theme) {
        case 'adventure': return { border: 'border-amber-400', text: 'text-amber-300', bg: 'bg-amber-500', color: '#f59e0b' };
        case 'fantasy': return { border: 'border-purple-400', text: 'text-purple-300', bg: 'bg-purple-500', color: '#8b5cf6' };
        case 'space': return { border: 'border-blue-400', text: 'text-blue-300', bg: 'bg-blue-500', color: '#3b82f6' };
        case 'underwater': return { border: 'border-cyan-400', text: 'text-cyan-300', bg: 'bg-cyan-500', color: '#06b6d4' };
        case 'dinosaurs': return { border: 'border-green-400', text: 'text-green-300', bg: 'bg-green-500', color: '#10b981' };
        case 'pirates': return { border: 'border-amber-400', text: 'text-amber-300', bg: 'bg-amber-500', color: '#f59e0b' };
        case 'fairy': return { border: 'border-pink-400', text: 'text-pink-300', bg: 'bg-pink-500', color: '#ec4899' };
        default: return { border: 'border-slate-400', text: 'text-slate-300', bg: 'bg-slate-500', color: '#64748b' };
      }
    };

    // Decorative elements based on theme
    const renderDecorativeElements = () => {
      // Only render theme decorations for specified themes
      const elements = themeElements[theme as keyof typeof themeElements];
      if (!elements) return null;
      
      return (
        <motion.div 
          className="absolute inset-0 opacity-20 overflow-hidden pointer-events-none"
          style={{ 
            transform: `translate(${(mousePosition.x - 0.5) * -10}px, ${(mousePosition.y - 0.5) * -10}px)`
          }}
          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        >
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" 
            className={getThemeAccent().text}
          >
            {elements}
          </svg>
        </motion.div>
      );
    };
    
    const accent = getThemeAccent();
    
    return (
      <div 
        ref={ref} 
        className="page relative rounded-r-lg bg-gray-100 shadow-xl overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Full page illustration with loading state */}
        <AnimatePresence>
          {!imageLoaded && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin" 
                style={{ borderColor: `${accent.color} transparent transparent transparent` }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div 
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`Cover for ${title}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={true}
              onLoadingComplete={() => setImageLoaded(true)}
              style={{ 
                transform: `scale(1.05) translate(${(mousePosition.x - 0.5) * -5}px, ${(mousePosition.y - 0.5) * -5}px)` 
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-4xl">
              📚
            </div>
          )}
        </motion.div>
        
        {/* Decorative elements specific to theme */}
        {renderDecorativeElements()}
        
        {/* Color gradient overlay for better text readability */}
        <div className={`absolute inset-0 bg-gradient-to-t ${getThemeGradient()}`} />
        
        {/* Decorative paper texture */}
        <div className="absolute inset-0 mix-blend-overlay opacity-40">
          <div className="w-full h-full bg-[url('/paper-texture.png')] bg-repeat" />
        </div>
        
        {/* Light rays overlay for dramatic effect */}
        <div className="absolute inset-0 overflow-hidden opacity-20 mix-blend-overlay">
          <motion.div
            className="w-full h-full bg-gradient-radial from-white via-transparent to-transparent"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 8,
            }}
            style={{ 
              transformOrigin: `${50 + (mousePosition.x - 0.5) * 20}% ${30 + (mousePosition.y - 0.5) * 20}%`,
            }}
          />
        </div>
        
        {/* Vignette effect */}
        <div className="absolute inset-0 bg-black opacity-25 shadow-inner pointer-events-none" 
          style={{ 
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
          }}
        />
        
        {/* Title overlay with enhanced design */}
        <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12 flex flex-col items-center">
          {/* Decorative title container with border */}
          <motion.div 
            className={`relative mb-6 sm:mb-10 px-8 py-6 rounded-lg bg-black/20 backdrop-blur-sm border ${accent.border} shadow-lg`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {/* Decorative line above title */}
            <motion.div 
              className={`absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-1 ${accent.bg} rounded-full`}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '8rem', opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
            
            <div className="text-center">
              {/* Title with enhanced staggered animation */}
              <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 drop-shadow-lg">
                <TextReveal
                  text={title}
                  delay={0.2}
                  duration={0.6}
                  className="font-[family-name:var(--font-baloo)]"
                  textClassName="drop-shadow-lg"
                />
              </h1>
              
              {/* Author if provided */}
              {author && (
                <motion.p 
                  className="text-white/90 text-lg sm:text-xl italic"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                >
                  by {author}
                </motion.p>
              )}
            </div>
            
            {/* Decorative line below title */}
            <motion.div 
              className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-1 ${accent.bg} rounded-full`}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '8rem', opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            />
          </motion.div>
          
          {/* Floating decorative elements */}
          <FloatingElement
            className="absolute -top-6 right-6 opacity-60 text-white"
            yOffset={5}
            duration={3}
          >
            <div className="h-10 w-10">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.5L15.5 9L22 10.5L17 15L18 21.5L12 18.5L6 21.5L7 15L2 10.5L8.5 9L12 2.5Z" 
                  stroke="currentColor" fill="none" strokeWidth="1.5" 
                  className={accent.text}
                />
              </svg>
            </div>
          </FloatingElement>
          
          <FloatingElement
            className="absolute -top-10 left-10 opacity-40 text-white"
            yOffset={8}
            duration={4}
            delay={1}
          >
            <div className="h-8 w-8">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.5L15.5 9L22 10.5L17 15L18 21.5L12 18.5L6 21.5L7 15L2 10.5L8.5 9L12 2.5Z" 
                  stroke="currentColor" fill="none" strokeWidth="1.5" 
                  className={accent.text}
                />
              </svg>
            </div>
          </FloatingElement>
        </div>
        
        {/* 3D book edge effect */}
        <div className="absolute top-0 bottom-0 right-0 w-[5px]">
          <div className="h-full w-full bg-gradient-to-l from-white/10 to-transparent" />
          {/* Textured edge */}
          <div className="absolute top-0 bottom-0 right-0 w-[3px] opacity-30 overflow-hidden">
            <svg width="3" height="100%" viewBox="0 0 3 100" preserveAspectRatio="none">
              <path d="M0,0 Q1.5,10 3,15 Q1.5,25 3,35 Q1.5,45 3,55 Q1.5,65 3,75 Q1.5,85 3,95 Q1.5,100 0,100 Z" fill="white" />
            </svg>
          </div>
        </div>
        
        {/* Page number (usually hidden on cover) */}
        <div className="absolute bottom-2 right-2 text-white/40 text-xs">
          {pageNumber}
        </div>
      </div>
    );
  }
);

CoverPage.displayName = 'CoverPage';

export default CoverPage;
