"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PageProps } from '../../types/ui';
import { useTypography } from '../../context/TypographyContext';

/**
 * Page component for the book reader
 * Displays a single page with content and optional image
 * Enhanced with larger text and better spacing for improved readability
 */
const Page = React.forwardRef<HTMLDivElement, PageProps>(
  ({ pageNumber, content, imageUrl, hasImage, isHighlighted, theme = 'default' }, ref) => {
    const typography = useTypography();
    
    // Get typography classes
    const fontSizeClass = typography.getFontSizeClass();
    const fontFamilyClass = typography.getFontFamilyClass();
    const lineHeightClass = typography.getLineHeightClass();
    const letterSpacingClass = typography.getLetterSpacingClass();
    
    // Get theme colors
    const getThemeBackgroundColor = () => {
      switch (theme) {
        case 'adventure': return 'bg-[#fffbf0]'; // Warm paper color
        case 'fantasy': return 'bg-[#f8f7ff]';   // Soft purple tint
        case 'space': return 'bg-[#f0f5ff]';     // Light blue tint
        case 'underwater': return 'bg-[#f0fcff]'; // Light cyan tint
        case 'dinosaurs': return 'bg-[#fff8e6]';  // Fossil tint
        default: return 'bg-[#fffbf0]';          // Default paper color
      }
    };
    
    return (
      <div 
        ref={ref} 
        className={`page ${getThemeBackgroundColor()} shadow-xl relative rounded-r-lg`}
      >
        {/* Paper texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay">
          <div className="w-full h-full bg-gradient-to-br from-white via-transparent to-black/5" />
        </div>
        
        {/* Deckled edge effect */}
        <div className="absolute top-0 bottom-0 right-0 w-[3px] opacity-30 overflow-hidden">
          <svg width="3" height="100%" viewBox="0 0 3 100" preserveAspectRatio="none">
            <path d="M0,0 Q1.5,10 3,15 Q1.5,25 3,35 Q1.5,45 3,55 Q1.5,65 3,75 Q1.5,85 3,95 Q1.5,100 0,100 Z" fill="#000" />
          </svg>
        </div>
        
        {/* Content container with increased padding */}
        <div className="p-8 md:p-10 h-full flex flex-col justify-between">
          {/* Main content area */}
          <div>
            {/* Image with max-height to ensure text has enough room */}
            {hasImage && imageUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8 rounded-xl overflow-hidden shadow-lg relative w-full aspect-[4/3] max-h-[45%]"
              >
                <Image
                  src={imageUrl}
                  alt="Story illustration"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority={pageNumber < 4} // Prioritize loading for first few pages
                />
              </motion.div>
            )}
            
            {/* Text content with larger font sizes */}
            {content && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  backgroundColor: isHighlighted 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : 'rgba(59, 130, 246, 0)'
                }}
                transition={{ duration: 0.4 }}
                className="px-3 py-2 rounded-md transition-colors duration-300"
              >
                {/* Adaptive text sizing based on content length - with increased base sizes */}
                <p className={`
                  ${fontSizeClass} 
                  ${fontFamilyClass} 
                  ${lineHeightClass} 
                  ${letterSpacingClass} 
                  text-gray-800
                  ${content.length > 500 ? 'text-base md:text-lg lg:text-xl' : 'text-lg md:text-xl lg:text-2xl'}
                  ${content.length > 200 ? 'leading-snug' : 'leading-relaxed'}
                  ${hasImage ? 'max-h-[40vh] overflow-y-auto pr-2' : 'max-h-[65vh] overflow-y-auto pr-2'}
                  responsive-text
                `}>
                  {content}
                </p>
              </motion.div>
            )}
          </div>
          
          {/* Page number - slightly larger */}
          <div className="text-center mt-8">
            <span className="text-gray-500 inline-block px-5 py-1 rounded-full text-base bg-white/60 shadow-inner">
              {pageNumber}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

Page.displayName = 'Page';

export default Page;
