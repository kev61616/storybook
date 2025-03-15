"use client";

import React, { useState, useRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { StoryData } from '../types';
import { useTypography } from '../context/TypographyContext';
import SpeechControls from './SpeechControls';
import { saveStory } from '../services/storageService';

// Define the type for the PageFlip instance that's returned by react-pageflip
interface PageFlip {
  flipNext: () => void;
  flipPrev: () => void;
}

// Types for page props
interface PageProps {
  pageNumber: number;
  content?: string;
  imageUrl?: string;
  hasImage: boolean;
  isHighlighted?: boolean;
  theme?: string;
}

// Interface for saved story return type
interface SavedStory extends StoryData {
  savedAt: number;
  isRead: boolean;
}

// Component for each page in the book
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
        
        <div className="p-6 md:p-8 h-full flex flex-col justify-between">
          {/* Content */}
          <div>
            {hasImage && imageUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6 rounded-xl overflow-hidden shadow-lg relative w-full aspect-[4/3]"
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
            
            {content && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  backgroundColor: isHighlighted 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : 'rgba(59, 130, 246, 0)'
                }}
                transition={{ duration: 0.4 }}
                className={`${fontSizeClass} ${fontFamilyClass} ${lineHeightClass} ${letterSpacingClass} text-gray-800 px-2 py-1 rounded-md transition-colors duration-300`}
              >
                {content}
              </motion.p>
            )}
          </div>
          
          {/* Page number */}
          <div className="text-center mt-6">
            <span className="text-gray-400 inline-block px-4 py-1 rounded-full text-sm bg-white/50 shadow-inner">
              {pageNumber}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

Page.displayName = 'Page';

// Interface for flip events
interface FlipEvent {
  data: number; // Current page number
}

// Types for EnhancedReader props
interface EnhancedReaderProps {
  story: StoryData;
  onClose: () => void;
  onSave?: (savedStory: SavedStory) => void;
}

/**
 * EnhancedReader component
 * Provides an immersive book-like reading experience with text-to-speech capabilities
 */
export default function EnhancedReader({ story, onClose, onSave }: EnhancedReaderProps) {
  // Use a ref with the PageFlip interface
  const bookRef = useRef<{ pageFlip: () => PageFlip } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [highlightedParagraph, setHighlightedParagraph] = useState<number | null>(null);
  const [showSpeechControls, setShowSpeechControls] = useState(false);
  
  // Extract content and images from story
  const storyContent = story.content || [];
  const storyImages = story.images || [];
  const storyTheme = story.theme || 'default';
  
  // Calculate which paragraphs have images
  const getIllustratedParagraphIndices = () => {
    if (!storyContent.length || !storyImages.length) {
      return [];
    }
    
    if (storyImages.length < 4) {
      return storyImages.map((_, i) => i * Math.floor(storyContent.length / (storyImages.length + 1)));
    }
    
    // Distribute images evenly
    return [0, 3, 6, 9].slice(0, Math.min(4, storyContent.length));
  };
  
  const illustratedParagraphs = getIllustratedParagraphIndices();
  
  // Create an array of page content
  const pages: PageProps[] = [];
  
  // Cover page
  pages.push({
    pageNumber: 1,
    content: "",
    imageUrl: storyImages[0] || "",
    hasImage: true,
    theme: storyTheme
  });
  
  // Title page
  pages.push({
    pageNumber: 2,
    content: `${story.title}\n\n`,
    hasImage: false,
    theme: storyTheme
  });
  
  // Content pages
  storyContent.forEach((paragraph, index) => {
    const imageIndex = illustratedParagraphs.indexOf(index);
    const hasImage = imageIndex !== -1;
    const imageUrl = hasImage ? storyImages[imageIndex] : undefined;
    
    pages.push({
      pageNumber: index + 3, // +3 because of cover and title pages
      content: paragraph,
      imageUrl,
      hasImage,
      theme: storyTheme
    });
  });
  
  // If odd number of pages, add blank page at the end
  if (pages.length % 2 !== 0) {
    pages.push({
      pageNumber: pages.length + 1,
      hasImage: false,
      theme: storyTheme
    });
  }
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (typeof document !== 'undefined') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    }
  };
  
  // Toggle speech controls
  const toggleSpeechControls = () => {
    setShowSpeechControls(!showSpeechControls);
  };
  
  // Handle page turn
  const handlePageFlip = (e: FlipEvent) => {
    setCurrentPage(e.data);
    
    // Reset highlighted paragraph when turning pages
    setHighlightedParagraph(null);
  };
  
  // Calculate total pages
  useEffect(() => {
    setTotalPages(pages.length);
  }, [pages.length]);
  
  // Handle save story
  const handleSaveStory = () => {
    if (!isSaved && story.id) {
      const savedStory = saveStory(story);
      setIsSaved(true);
      if (onSave) {
        onSave(savedStory);
      }
    }
  };
  
  // Set up keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          bookRef.current?.pageFlip().flipNext();
          break;
        case 'ArrowLeft':
          bookRef.current?.pageFlip().flipPrev();
          break;
        case 'Escape':
          if (isFullscreen && typeof document !== 'undefined') {
            document.exitFullscreen();
            setIsFullscreen(false);
          } else {
            onClose();
          }
          break;
        default:
          break;
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
    
    return undefined;
  }, [isFullscreen, onClose]);
  
  // Mark as read logic - previously using markStoryAsRead
  useEffect(() => {
    // This would be where we'd mark the story as read
    // But since the function isn't available, we'll just log for now
    if (story.id) {
      console.log(`Story ${story.id} opened for reading`);
    }
  }, [story.id]);

  // Safe navigation for page flipping
  const flipToNext = () => {
    if (bookRef.current?.pageFlip) {
      bookRef.current.pageFlip().flipNext();
    }
  };
  
  const flipToPrev = () => {
    if (bookRef.current?.pageFlip) {
      bookRef.current.pageFlip().flipPrev();
    }
  };
  
  // Handle paragraph highlighting for text-to-speech
  const handleHighlight = (index: number) => {
    // Need to adjust index because content doesn't include cover and title pages
    setHighlightedParagraph(index);
    
    // Calculate page number from paragraph index
    const contentPageIndex = index + 2; // +2 for cover and title
    if (currentPage !== contentPageIndex) {
      // If not on the correct page, flip to it
      if (bookRef.current?.pageFlip) {
        // Need to determine if we need to go forward or backward
        if (contentPageIndex > currentPage) {
          while (currentPage < contentPageIndex) {
            bookRef.current.pageFlip().flipNext();
          }
        } else {
          while (currentPage > contentPageIndex) {
            bookRef.current.pageFlip().flipPrev();
          }
        }
      }
    }
  };

  // Calculate whether a page is highlighted
  const isPageHighlighted = (index: number): boolean => {
    if (highlightedParagraph === null) return false;
    // +2 because first two pages are cover and title
    return index === highlightedParagraph + 2;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col items-center justify-center">
      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black to-transparent">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="text-white p-3 rounded-full hover:bg-white/10"
          aria-label="Close reader"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
        
        <div className="text-white text-base bg-black/30 px-4 py-1 rounded-full">
          {currentPage} of {totalPages}
        </div>
        
        <div className="flex space-x-3">
          {/* Read aloud toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSpeechControls}
            className={`p-3 rounded-full ${showSpeechControls ? 'bg-blue-500 text-white' : 'text-white hover:bg-white/10'}`}
            aria-label={showSpeechControls ? "Hide speech controls" : "Show speech controls"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </motion.button>
          
          {/* Save button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSaveStory}
            className={`p-3 rounded-full ${isSaved ? 'text-yellow-400 bg-white/10' : 'text-white hover:bg-white/10'}`}
            aria-label={isSaved ? "Story saved" : "Save story"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </motion.button>
          
          {/* Fullscreen button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleFullscreen}
            className="text-white p-3 rounded-full hover:bg-white/10"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
      
      {/* Book container */}
      <div className="w-full h-full max-w-5xl flex items-center justify-center px-4">
        {/* @ts-expect-error - HTMLFlipBook has incomplete TypeScript definitions */}
        <HTMLFlipBook
          ref={bookRef}
          width={300}
          height={500}
          size="stretch"
          minWidth={300}
          maxWidth={600}
          minHeight={400}
          maxHeight={800}
          drawShadow={true}
          flippingTime={1000}
          className="mx-auto"
          startPage={0}
          showCover={true}
          onFlip={handlePageFlip}
          mobileScrollSupport={true}
          swipeDistance={30}
          showPageCorners={true}
          disableFlipByClick={false}
        >
          {pages.map((page, index) => (
            <Page
              key={index}
              pageNumber={page.pageNumber}
              content={page.content}
              imageUrl={page.imageUrl}
              hasImage={page.hasImage}
              theme={page.theme}
              isHighlighted={isPageHighlighted(index)}
            />
          ))}
        </HTMLFlipBook>
      </div>
      
      {/* Page turn buttons */}
      <div className="absolute left-0 right-0 bottom-1/2 transform translate-y-1/2 flex justify-between px-4 pointer-events-none">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={flipToPrev}
          className="bg-white/10 text-white p-4 rounded-full shadow-lg pointer-events-auto"
          disabled={currentPage <= 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={flipToNext}
          className="bg-white/10 text-white p-4 rounded-full shadow-lg pointer-events-auto"
          disabled={currentPage >= totalPages - 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>
      
      {/* Speech controls with animation */}
      <AnimatePresence>
        {showSpeechControls && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-8 left-0 right-0 flex justify-center"
          >
            <SpeechControls 
              paragraphs={storyContent}
              onHighlight={handleHighlight}
              className="bg-white/10 backdrop-blur-md p-5 rounded-2xl shadow-xl"
              theme={storyTheme}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
