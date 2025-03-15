"use client";

import React, { useState, useRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedReaderProps, PageProps, PageFlip, FlipEvent } from '../../types/ui';
import SpeechControls from '../speech/SpeechControls';
import Page from './Page';
import CoverPage from './CoverPage';
import { saveStory, markStoryAsRead } from '../../services/storageService';
import { ImageManagementService } from '../../services/imageManagementService';

/**
 * EnhancedReader component
 * Provides an immersive book-like reading experience with text-to-speech capabilities
 */
export default function EnhancedReader({ story, onClose, onSave }: EnhancedReaderProps) {
  // Use a ref with the PageFlip interface
  const bookRef = useRef<{ pageFlip: () => PageFlip } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [highlightedParagraph, setHighlightedParagraph] = useState<number | null>(null);
  const [showSpeechControls, setShowSpeechControls] = useState(false);
  
  // State for images loading
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  
  // Extract content and theme from story
  const storyContent = story.content || [];
  const storyTheme = story.theme || 'default';
  
  // Create image prompts for each content section
  const createImagePrompts = (): string[] => {
    const prompts: string[] = [];
    
    // Cover image - more detailed prompt for a beautiful cover
    prompts.push(`Create a beautiful, detailed cover illustration for a children's story titled "${story.title}". Full page illustration, high quality, child-friendly.`);
    
    // For each content paragraph, create a prompt
    storyContent.forEach((paragraph) => {
      // For simplicity, use the first 100 characters as the prompt
      const promptText = paragraph.substring(0, 100) + '...';
      prompts.push(promptText);
    });
    
    // Add end image if odd number of pages
    if (storyContent.length % 2 === 0) {
      prompts.push(`Final illustration for the story "${story.title}", showing the main resolution or ending scene.`);
    }
    
    return prompts;
  };
  
  // Load all images before rendering
  useEffect(() => {
    const loadAllImages = async () => {
      if (!story.id) return;
      
      try {
        setIsLoadingImages(true);
        
        // Check if images already exist in storage
        if (ImageManagementService.areAllImagesAvailable(story.id, createImagePrompts().length)) {
          // If already available, just retrieve them
          const images = ImageManagementService.getAllStoredImages(story.id);
          setLoadedImages(images);
        } else {
          // Generate and store all images
          const imagePrompts = createImagePrompts();
          const images = await ImageManagementService.generateAllStoryImages(
            story.id,
            imagePrompts,
            story.title,
            storyTheme
          );
          setLoadedImages(images);
        }
      } catch (error) {
        console.error('Error loading images:', error);
        // If error, set empty images and continue
        setLoadedImages([]);
      } finally {
        setIsLoadingImages(false);
      }
    };
    
    loadAllImages();
  }, [story.id, story.title, storyContent.length, storyTheme]);
  
  // Create an array of page content
  const getPages = (): (PageProps | React.ReactElement)[] => {
    if (isLoadingImages || !loadedImages.length) {
      return [];
    }
    
    const pages: (PageProps | React.ReactElement)[] = [];
    
    // Cover page - use CoverPage component
    pages.push(
      <CoverPage
        key="cover"
        pageNumber={1}
        imageUrl={loadedImages[0] || ""}
        title={story.title}
        theme={storyTheme}
        hasImage={true}
      />
    );
    
    // Content pages
    storyContent.forEach((paragraph, index) => {
      const imageUrl = loadedImages[index + 1] || loadedImages[0]; // Fallback to cover image
      
      pages.push({
        pageNumber: index + 2, // +2 because of cover page
        content: paragraph,
        imageUrl,
        hasImage: true, // All pages have images
        theme: storyTheme
      });
    });
    
    // If odd number of pages, add end page
    if (storyContent.length % 2 !== 0) {
      pages.push({
        pageNumber: pages.length + 1,
        content: "The End",
        imageUrl: loadedImages[loadedImages.length - 1] || loadedImages[0],
        hasImage: true,
        theme: storyTheme
      });
    }
    
    return pages;
  };
  
  const pages = getPages();
  
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
  
  // Enter fullscreen on component mount
  useEffect(() => {
    // Make sure we're in a browser environment
    if (typeof document !== 'undefined' && !document.fullscreenElement) {
      setTimeout(() => {
        document.documentElement.requestFullscreen().catch(err => {
          console.error('Error attempting to enable fullscreen on load:', err.message);
          // If fullscreen fails, at least update the state
          setIsFullscreen(false);
        });
      }, 1000); // Slight delay to ensure DOM is ready
    }
  }, []);
  
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
  
  // Mark as read logic
  useEffect(() => {
    if (story.id) {
      // Mark the story as read
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
      
      {/* Loading state */}
      {isLoadingImages && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-30">
          <div className="w-16 h-16 mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-white text-xl font-bold">Preparing Your Story</h2>
          <p className="text-white/80 mt-2">Generating beautiful illustrations...</p>
        </div>
      )}
      
      {/* Book container */}
      <div className="w-full h-full max-w-5xl flex items-center justify-center px-4">
        {!isLoadingImages && pages.length > 0 && (
          // @ts-expect-error - HTMLFlipBook has incomplete type definitions
          <HTMLFlipBook
            ref={bookRef}
            width={800}
            height={600}
            size="stretch"
            minWidth={700}
            maxWidth={1200}
            minHeight={500}
            maxHeight={900}
            drawShadow={true}
            flippingTime={1000}
            className="mx-auto landscape-mode"
            startPage={0}
            showCover={true}
            onFlip={handlePageFlip}
            mobileScrollSupport={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
            usePortrait={false}
            startZIndex={0}
            autoSize={true}
            style={{ margin: "0 auto" }}
          >
            {pages.map((page, index) => {
              // If it's a React element (for CoverPage), render it directly
              if (React.isValidElement(page)) {
                return page;
              }
              
              // Otherwise, render a Page component with the page props
              return (
                <Page
                  key={index}
                  pageNumber={(page as PageProps).pageNumber}
                  content={(page as PageProps).content}
                  imageUrl={(page as PageProps).imageUrl}
                  hasImage={(page as PageProps).hasImage}
                  theme={(page as PageProps).theme}
                  isHighlighted={isPageHighlighted(index)}
                />
              );
            })}
          </HTMLFlipBook>
        )}
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
