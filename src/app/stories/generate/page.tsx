"use client";

import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navigation from "../../components/Navigation";
import { generateStory } from "../../utils/api";
import { StoryData } from "../../types/story";
import EnhancedReader from "../../components/reader/EnhancedReader";
import { ImageManagementService, ImageGenerationProgress } from "../../services/imageManagementService";
import ProgressTracker from "../../components/ui/ProgressTracker";

/**
 * StoryGenerate page that displays a story generated from a template
 * Shows the story with AI-generated illustrations in a kid-friendly format
 */
export default function GenerateStory() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading parameters...</div>}>
      <GenerateStoryContent />
    </Suspense>
  );
}

/**
 * Internal component that uses useSearchParams inside a Suspense boundary
 */
function GenerateStoryContent() {
  const searchParams = useSearchParams();
  const template = searchParams.get("template");
  
  // Story generation parameters
  const [storyLength, setStoryLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [readingLevel, setReadingLevel] = useState<'easy' | 'moderate' | 'advanced'>('moderate');
  const [showOptions, setShowOptions] = useState(true);
  
  // Story generation state
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState<StoryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Enhanced progress tracking for better UX
  const [progressState, setProgressState] = useState<ImageGenerationProgress>({
    currentImage: 0,
    totalImages: 0,
    isCached: false,
    imageStatus: 'success',
    stage: 'preparation',
    percentComplete: 0
  });
  
  // Register for progress updates from the image management service
  useEffect(() => {
    // Only register when loading
    if (!isLoading) return;
    
    // Set up the progress tracking subscription
    const unsubscribe = ImageManagementService.onProgressUpdate((progress) => {
      setProgressState(progress);
    });
    
    // Clean up subscription when component unmounts or loading stops
    return () => {
      unsubscribe();
    };
  }, [isLoading]);

  // Helper function to get template title
  function getTemplateTitle() {
    if (!template) return "";
    
    // Find the template in the categories
    const titles: Record<string, string> = {
      "adventure": "Adventure",
      "animals": "Animal Friends",
      "fantasy": "Magic & Fantasy",
      "space": "Space Adventures",
      "underwater": "Under the Sea",
      "dinosaurs": "Dinosaur World",
      "cars": "Racing Cars",
      "pirates": "Pirate Adventures",
      "superheroes": "Superhero",
      "fairy": "Fairy Tale",
      "robots": "Robot Friends",
      "sports": "Sports Star"
    };
    
    return titles[template] || template.charAt(0).toUpperCase() + template.slice(1);
  }
  
  // Helper function to get template emoji
  function getTemplateEmoji() {
    if (!template) return "📚";
    
    // Find the emoji for the template
    const emojis: Record<string, string> = {
      "adventure": "🏰",
      "animals": "🐶",
      "fantasy": "✨",
      "space": "🚀",
      "underwater": "🐠",
      "dinosaurs": "🦕",
      "cars": "🏎️",
      "pirates": "🏴‍☠️",
      "superheroes": "🦸",
      "fairy": "🧚",
      "robots": "🤖",
      "sports": "⚽"
    };
    
    return emojis[template] || "📚";
  }

  // Start story generation process with enhanced progress tracking
  const startGeneration = async () => {
    if (!template) return;
    
    setIsLoading(true);
    setShowOptions(false);
    setError(null);
    
    // Initialize progress tracking
    setProgressState({
      currentImage: 0,
      totalImages: 0,
      isCached: false,
      imageStatus: 'success',
      stage: 'preparation',
      percentComplete: 5
    });
    
    try {
      // Story generation phase
      
      // Generate story from the template using OpenAI
      // Include options in the template name
      const templateWithOptions = `${template} (length: ${storyLength}, reading level: ${readingLevel})`;
      
      console.log(`Generating story with template: ${templateWithOptions}`);
      // Generate story from API and convert to our app's StoryData type
      const apiStoryData = await generateStory('template', templateWithOptions);
      
      // Map the API reading level to our app's reading level format
      const readingLevelMap: Record<string, 'easy' | 'moderate' | 'advanced'> = {
        'simple': 'easy',
        'standard': 'moderate', 
        'advanced': 'advanced'
      };
      
      // Convert to our app's StoryData format
      const storyData: StoryData = {
        ...apiStoryData,
        readingLevel: readingLevelMap[apiStoryData.readingLevel || 'standard'] || 'moderate'
      };
      
      // Create a unique ID for this story to use with the image management service
      // This allows us to cache images and retrieve them later
      const storyId = `story_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const storyWithId = { ...storyData, id: storyId };
      
      setStory(storyWithId);
      // Image generation phase
      
      // Generate images for the story paragraphs using our enhanced image service
      if (storyWithId.imagePrompts && storyWithId.imagePrompts.length > 0) {
        console.log(`Starting image generation for ${storyWithId.imagePrompts.length} images`);
        
        try {
          // Use the enhanced image management service that handles progress tracking
          const images = await ImageManagementService.generateAllStoryImages(
            storyId,
            storyWithId.imagePrompts,
            storyWithId.title,
            template // Use the template as the theme for consistent styling
          );
          
          // Update story with generated images
          setStory(prevStory => prevStory ? { ...prevStory, images } : null);
          
        } catch (imageError) {
          console.error("Error generating images:", imageError);
          // Even if image generation fails, we still want to show the story
          // The ImageManagementService will have provided fallbacks
          const fallbackImages = ImageManagementService.getAllStoredImages(storyId);
          if (fallbackImages.length > 0) {
            setStory(prevStory => prevStory ? { ...prevStory, images: fallbackImages } : null);
          } else {
            // If no images were stored, create basic fallbacks
            const defaultFallbacks = Array(storyWithId.imagePrompts.length).fill(
              `https://placehold.co/800x800/e0f2fe/0284c7?text=Temporary+Illustration`
            );
            setStory(prevStory => prevStory ? { ...prevStory, images: defaultFallbacks } : null);
          }
        }
      }
      
      // Complete phase
      setIsLoading(false);
      
    } catch (error) {
      console.error("Error generating story:", error);
      setError(error instanceof Error ? error.message : 'Failed to generate story');
      setIsLoading(false);
      
      // Reset progress state on error
      setProgressState({
        currentImage: 0,
        totalImages: 0,
        isCached: false,
        imageStatus: 'success',
        stage: 'preparation',
        percentComplete: 0
      });
    }
  };

  // Get theme colors based on the template
  const getThemeColors = () => {
    const colors = {
      bg: "bg-blue-50",
      text: "text-blue-700",
      accent: "from-blue-500 to-blue-700"
    };
    
    if (!template) return colors;
    
    switch (template) {
      case "animals":
        return { bg: "bg-green-50", text: "text-green-700", accent: "from-green-500 to-green-700" };
      case "fantasy":
        return { bg: "bg-purple-50", text: "text-purple-700", accent: "from-purple-500 to-purple-700" };
      case "space":
        return { bg: "bg-indigo-50", text: "text-indigo-700", accent: "from-indigo-500 to-indigo-700" };
      case "underwater":
        return { bg: "bg-cyan-50", text: "text-cyan-700", accent: "from-cyan-500 to-cyan-700" };
      case "dinosaurs":
        return { bg: "bg-amber-50", text: "text-amber-700", accent: "from-amber-500 to-amber-700" };
      default:
        return colors;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {showOptions && !isLoading && !story ? (
          // Story Options Form
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <h2 className="font-[family-name:var(--font-baloo)] text-3xl text-center text-purple-600 font-bold mb-6">
              Customize Your {getTemplateTitle()} Story
            </h2>
            
            {/* Template Icon */}
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 rounded-full ${getThemeColors().bg} flex items-center justify-center text-4xl`}>
                {getTemplateEmoji()}
              </div>
            </div>
            
            {/* Story Options */}
            <div className="space-y-6">
              {/* Story Length */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  How long would you like your story to be?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setStoryLength('short')}
                    className={`py-3 px-4 rounded-xl border-2 transition-all ${
                      storyLength === 'short'
                        ? 'border-purple-500 bg-purple-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">Short</div>
                    <div className="text-xs text-gray-500">2-3 minutes</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoryLength('medium')}
                    className={`py-3 px-4 rounded-xl border-2 transition-all ${
                      storyLength === 'medium'
                        ? 'border-purple-500 bg-purple-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">Medium</div>
                    <div className="text-xs text-gray-500">4-6 minutes</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStoryLength('long')}
                    className={`py-3 px-4 rounded-xl border-2 transition-all ${
                      storyLength === 'long'
                        ? 'border-purple-500 bg-purple-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">Long</div>
                    <div className="text-xs text-gray-500">7-10 minutes</div>
                  </button>
                </div>
              </div>
              
              {/* Reading Level */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Select reading level:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setReadingLevel('easy')}
                    className={`py-3 px-4 rounded-xl border-2 transition-all ${
                      readingLevel === 'easy'
                        ? 'border-green-500 bg-green-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">Easy</div>
                    <div className="text-xs text-gray-500">Simple words</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReadingLevel('moderate')}
                    className={`py-3 px-4 rounded-xl border-2 transition-all ${
                      readingLevel === 'moderate'
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">Medium</div>
                    <div className="text-xs text-gray-500">Grade level</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReadingLevel('advanced')}
                    className={`py-3 px-4 rounded-xl border-2 transition-all ${
                      readingLevel === 'advanced'
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">Advanced</div>
                    <div className="text-xs text-gray-500">More vocabulary</div>
                  </button>
                </div>
              </div>
              
              {/* Generate Story Button */}
              <div className="mt-8">
                <button
                  onClick={startGeneration}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full font-[family-name:var(--font-baloo)] font-medium text-lg hover:opacity-90 transition-opacity shadow-md"
                >
                  Create My Story
                </button>
              </div>
              
              <div className="text-center mt-4">
                <Link
                  href="/stories/templates"
                  className="text-purple-600 hover:text-purple-800 text-sm"
                >
                  ← Choose a different template
                </Link>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          // Enhanced loading UI with detailed progress information and theme-specific styling
          <ProgressTracker 
            progressState={progressState}
            theme={template || 'default'}
            emoji={getTemplateEmoji()}
          />
        ) : error ? (
          // Enhanced error state with recovery options
          <div className="text-center py-16 max-w-md mx-auto">
            <div className="bg-red-50 rounded-lg p-6 border border-red-200 mb-6">
              <div className="text-5xl mb-4">😢</div>
              <h3 className="text-xl font-semibold text-red-700 mb-2">
                Oops! Story Creation Issue
              </h3>
              <p className="text-gray-700 mb-4">
                {error.includes('timed out') 
                  ? "The illustration is taking too long to create. This could be because our magical artists are very busy right now."
                  : error}
              </p>
              <div className="space-y-3 mt-6">
                <button
                  onClick={() => startGeneration()}
                  className="w-full py-3 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    setShowOptions(true);
                  }}
                  className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Change Story Options
                </button>
                <Link href="/stories/templates" className="block w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-500 rounded-lg border border-gray-200 transition-colors">
                  Choose Different Template
                </Link>
              </div>
            </div>
          </div>
        ) : story ? (
          // Enhanced Reader Component with image-per-page and larger display
          <EnhancedReader
            story={story}
            onClose={() => {
              // Return to options or templates
              setShowOptions(true);
              setStory(null);
            }}
            onSave={(savedStory) => {
              console.log("Story saved:", savedStory);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
