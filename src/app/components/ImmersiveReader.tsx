"use client";

import React, { useState, useRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { StoryData } from '../utils/api';
import { SavedStory, saveStory, markStoryAsRead, getUserPreferences } from '../utils/storage';

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
}

// Component for each page in the book
const Page = React.forwardRef<HTMLDivElement, PageProps>(({ pageNumber, content, imageUrl, hasImage }, ref) => {
  // Get user preferences safely (client-side only)
  const fontSize = typeof window !== 'undefined' 
    ? getUserPreferences().fontSize 
    : 'medium';
  
  // Font size class based on user preference
  const fontSizeClass = fontSize === 'small' 
    ? 'text-base' 
    : fontSize === 'large' 
      ? 'text-xl' 
      : 'text-lg';

  return (
    <div 
      ref={ref} 
      className="page bg-[#fffbf0] shadow-lg relative"
    >
      <div className="p-6 md:p-8 h-full flex flex-col justify-between">
        {/* Content */}
        <div>
          {hasImage && imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden shadow-md relative w-full aspect-[4/3]">
              <Image
                src={imageUrl}
                alt="Story illustration"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}
          
          {content && (
            <p className={`${fontSizeClass} font-serif leading-relaxed text-gray-700`}>
              {content}
            </p>
          )}
        </div>
        
        {/* Page number */}
        <div className="text-center text-gray-400 text-sm mt-4">
          {pageNumber}
        </div>
      </div>
    </div>
  );
});

Page.displayName = 'Page';

// Interface for flip events
interface FlipEvent {
  data: number; // Current page number
}

// Types for ImmersiveReader props
interface ImmersiveReaderProps {
  story: StoryData;
  onClose: () => void;
  onSave?: (savedStory: SavedStory) => void;
}

/**
 * ImmersiveReader component
 * Provides a book-like reading experience with page turning animations
 */
export default function ImmersiveReader({ story, onClose, onSave }: ImmersiveReaderProps) {
  // Use a ref with the PageFlip interface
  const bookRef = useRef<{ pageFlip: () => PageFlip } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  
  // Extract content and images from story
  const storyContent = story.content || [];
  const storyImages = story.images || [];
  
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
    hasImage: true
  });
  
  // Title page
  pages.push({
    pageNumber: 2,
    content: `${story.title}\n\n`,
    hasImage: false
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
      hasImage
    });
  });
  
  // If odd number of pages, add blank page at the end
  if (pages.length % 2 !== 0) {
    pages.push({
      pageNumber: pages.length + 1,
      hasImage: false
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
  
  // Handle page turn
  const handlePageFlip = (e: FlipEvent) => {
    setCurrentPage(e.data);
  };
  
  // Calculate total pages
  useEffect(() => {
    setTotalPages(pages.length);
  }, [pages.length]);
  
  // Handle save story
  const handleSaveStory = () => {
    if (!isSaved) {
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
  
  // Mark story as read when opened
  useEffect(() => {
    if (story.id) {
      markStoryAsRead(story.id);
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

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center">
      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black to-transparent">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="text-white p-2 rounded-full hover:bg-white/10"
          aria-label="Close reader"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
        
        <div className="text-white text-sm">
          {currentPage} of {totalPages}
        </div>
        
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveStory}
            className={`p-2 rounded-full ${isSaved ? 'text-yellow-400 bg-white/10' : 'text-white hover:bg-white/10'}`}
            aria-label={isSaved ? "Story saved" : "Save story"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="text-white p-2 rounded-full hover:bg-white/10"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          className="bg-white/10 text-white p-3 rounded-full shadow-lg pointer-events-auto"
          disabled={currentPage <= 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={flipToNext}
          className="bg-white/10 text-white p-3 rounded-full shadow-lg pointer-events-auto"
          disabled={currentPage >= totalPages - 1}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
