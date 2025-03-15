"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navigation from "../../components/Navigation";
import { generateStory, generateImage, StoryData } from "../../utils/api";
import ImmersiveReader from "../../components/ImmersiveReader";

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
  const [currentStep, setCurrentStep] = useState<'options' | 'generating-story' | 'generating-images' | 'complete'>('options');
  const [progress, setProgress] = useState(0);
  const [story, setStory] = useState<StoryData | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Start story generation process
  const startGeneration = async () => {
    if (!template) return;
    
    setIsLoading(true);
    setShowOptions(false);
    
    try {
      setCurrentStep('generating-story');
      setProgress(10);
      
      // Generate story from the template using OpenAI
      // Include options in the template name
      const templateWithOptions = `${template} (length: ${storyLength}, reading level: ${readingLevel})`;
      const storyData = await generateStory('template', templateWithOptions);
      
      setProgress(40);
      setStory(storyData);
      
      // Generate images for the story paragraphs
      if (storyData.imagePrompts && storyData.imagePrompts.length > 0) {
        setCurrentStep('generating-images');
        
        const images: string[] = [];
        const totalImages = storyData.imagePrompts.length;
        
        // Generate each image sequentially
        for (let i = 0; i < totalImages; i++) {
          try {
            const imageUrl = await generateImage(storyData.imagePrompts[i]);
            images.push(imageUrl);
          } catch (error) {
            console.error(`Error generating image ${i}:`, error);
            // If image generation fails, use a placeholder
            images.push("https://placehold.co/600x400/e0f2fe/0284c7?text=Image+Generation+Failed");
          }
          setProgress(40 + Math.floor(((i + 1) / totalImages) * 60));
        }
        
        // Update story with generated images
        setStory(prevStory => prevStory ? { ...prevStory, images } : null);
      }
      
      setCurrentStep('complete');
      setProgress(100);
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating story:", error);
      setError(error instanceof Error ? error.message : 'Failed to generate story');
      setIsLoading(false);
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
          // Loading state with progress bar and animated elements
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="font-[family-name:var(--font-baloo)] text-2xl text-purple-600 mb-6">
              {currentStep === 'generating-story' 
                ? "Creating your magical story..."
                : "Drawing beautiful illustrations..."}
            </p>
            <div className="w-full max-w-md bg-gray-200 rounded-full h-5 mb-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-pulse mr-2">
                {currentStep === 'generating-story' 
                  ? "🧙‍♂️"
                  : "🎨"}
              </div>
              <p>
                {currentStep === 'generating-story' 
                  ? "Our magical writers are crafting your story..."
                  : "Our artists are drawing wonderful pictures..."}
              </p>
            </div>
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-16">
            <p className="text-xl text-red-500">
              Oops! We couldn&apos;t create a story. {error}
            </p>
            <Link 
              href="/stories/templates"
              className="mt-6 inline-block py-3 px-6 bg-purple-600 text-white rounded-full"
            >
              Back to Templates
            </Link>
          </div>
        ) : story ? (
          // Immersive Reader Component
          <ImmersiveReader
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
