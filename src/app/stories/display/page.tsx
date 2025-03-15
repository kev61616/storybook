"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Navigation from "../../components/Navigation";
import { generateStory, generateImage, StoryData } from "../../utils/api";
import ImmersiveReader from "../../components/ImmersiveReader";
import { saveStory } from "../../utils/storage";

/**
 * StoryDisplay page that shows a story generated from user keywords
 * Displays a custom story with AI-generated illustrations based on provided keywords
 */
export default function DisplayStory() {
  // Wrap content in a suspense boundary for useSearchParams
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading parameters...</div>}>
      <StoryDisplayContent />
    </Suspense>
  );
}

// Component with the search params logic, wrapped in Suspense
function StoryDisplayContent() {
  const searchParams = useSearchParams();
  const keywords = searchParams.get("keywords") || "";
  
  // Get additional story settings from URL
  const ageRange = searchParams.get("ageRange") || "6-12";
  const gender = searchParams.get("gender") || "neutral";
  const personality = searchParams.get("personality") || "curious";
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<'generating-story' | 'generating-images' | 'complete'>('generating-story');
  const [progress, setProgress] = useState(0);
  const [story, setStory] = useState<StoryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  // State to track if the story has been saved
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function createStory() {
      if (!keywords) return;
      
      try {
        setCurrentStep('generating-story');
        setProgress(10);
        
        // Enhance the prompt with the character settings
        const enhancedKeywords = `${keywords}. The main character is a ${ageRange === "varied" ? "group of characters of various ages" : ageRange === "adult" ? "adult" : ageRange === "teenager" ? "teenager" : `child aged ${ageRange}`} who is ${gender === "neutral" ? "" : `a ${gender} and `}${personality}.`;
        
        // Generate story from keywords using OpenAI with enhanced prompt
        const storyData = await generateStory('keywords', undefined, enhancedKeywords);
        setProgress(40);
        setStory(storyData);
        
        // Generate images for the story paragraphs
        if (storyData.imagePrompts && storyData.imagePrompts.length > 0) {
          setCurrentStep('generating-images');
          
          const images: string[] = [];
          const totalImages = storyData.imagePrompts.length;
          
          // Generate each image sequentially 
          for (let i = 0; i < totalImages; i++) {
            const imageUrl = await generateImage(storyData.imagePrompts[i]);
            images.push(imageUrl);
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
    }

    if (keywords) {
      createStory();
    }
  }, [keywords, ageRange, gender, personality]); // Include all dependencies

  // Determine which paragraphs will have illustrations
  const getIllustratedParagraphIndices = () => {
    // Make sure we have story, content, and images
    if (!story?.content?.length || !story?.images?.length) {
      return [];
    }
    
    const { content, images } = story;
    
    // If we have fewer than 4 images, use what we have
    if (images.length < 4) {
      return images.map((_: unknown, i: number) => i * Math.floor(content.length / (images.length + 1)));
    }
    
    // Otherwise, distribute 4 images evenly
    return [0, 3, 6, 9].slice(0, Math.min(4, content.length));
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          // Loading state with progress bar
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-[family-name:var(--font-baloo)] text-xl text-green-600 mb-4">
              {currentStep === 'generating-story' 
                ? "Creating your unique story..."
                : "Generating beautiful illustrations..."}
            </p>
            <div className="w-full max-w-md bg-gray-200 rounded-full h-4 mb-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-teal-500 h-4 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              {currentStep === 'generating-story' 
                ? "Our storytellers are weaving your words into a magical tale..."
                : "Our artists are creating pictures for your story..."}
            </p>
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-16">
            <p className="text-xl text-red-500">
              Oops! We couldn&apos;t create a story. {error}
            </p>
            <Link 
              href="/stories/create"
              className="mt-6 inline-block py-3 px-6 bg-green-600 text-white rounded-full"
            >
              Back to Create Story
            </Link>
          </div>
        ) : story ? (
          // Story display
          <div className="max-w-4xl mx-auto bg-gradient-to-b from-green-50 to-blue-50 rounded-2xl shadow-lg p-8">
            {/* Story title */}
            <h1 className="font-[family-name:var(--font-baloo)] text-4xl md:text-5xl text-center text-green-600 font-bold mb-8">
              {story.title}
            </h1>
            
            {/* Keywords display */}
            <div className="mb-8 text-center">
              <p className="text-sm text-gray-500 mb-2">This story was created with these keywords:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {story.keywords ? story.keywords.map((keyword: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                )) : keywords.split(",").map((keyword: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Story content */}
            <div className="space-y-10">
              {story.content.map((paragraph, index) => {
                const illustrationIndex = story.images && 
                  getIllustratedParagraphIndices().indexOf(index);
                const hasIllustration = illustrationIndex !== -1 && illustrationIndex !== undefined;
                
                return (
                  <div key={index} className={hasIllustration ? "flex flex-col gap-6" : ""}>
                    {/* Illustration if this paragraph has one */}
                    {hasIllustration && story.images && (
                      <div className="mx-auto w-full max-w-2xl rounded-xl overflow-hidden shadow-lg relative aspect-[4/3]">
                        <Image 
                          src={story.images[illustrationIndex]} 
                          alt={`Illustration for "${story.title}"`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 768px"
                        />
                      </div>
                    )}
                    
                    {/* Paragraph text */}
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  </div>
                );
              })}
            </div>
            
            {/* Actions */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setIsImmersiveMode(true)}
                className="py-3 px-6 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full font-[family-name:var(--font-baloo)] font-medium hover:opacity-90 transition-opacity text-center"
              >
                Read in Immersive Mode
              </button>
              
              <button
                onClick={() => {
                  if (!story) return;
                  
                  saveStory(story);
                  setIsSaved(true);
                  
                  // Show success message
                  const messageElement = document.createElement('div');
                  messageElement.className = 'fixed bottom-4 right-4 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg z-50';
                  messageElement.innerText = 'Story saved successfully!';
                  document.body.appendChild(messageElement);
                  
                  // Remove after 3 seconds
                  setTimeout(() => {
                    document.body.removeChild(messageElement);
                  }, 3000);
                }}
                disabled={isSaved}
                className={`py-3 px-6 bg-white ${isSaved ? 'text-gray-400 border-gray-200' : 'text-yellow-600 border-yellow-200 hover:border-yellow-400'} rounded-full font-[family-name:var(--font-baloo)] font-medium border-2 transition-colors text-center`}
              >
                {isSaved ? 'Story Saved!' : 'Save Story'}
              </button>
              
              <Link 
                href="/stories/create"
                className="py-3 px-6 bg-white text-green-600 rounded-full font-[family-name:var(--font-baloo)] font-medium border-2 border-green-200 hover:border-green-400 transition-colors text-center"
              >
                Create Another Story
              </Link>
              <Link 
                href="/stories/templates"
                className="py-3 px-6 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full font-[family-name:var(--font-baloo)] font-medium hover:opacity-90 transition-opacity text-center"
              >
                Try Story Templates
              </Link>
            </div>
          </div>
        ) : null}
        
        {!isLoading && !story && !error && (
          // Error state
          <div className="text-center py-16">
            <p className="text-xl text-red-500">
              Oops! We couldn&apos;t create a story. Please try again with different keywords.
            </p>
            <Link 
              href="/stories/create"
              className="mt-6 inline-block py-3 px-6 bg-green-600 text-white rounded-full"
            >
              Back to Create Story
            </Link>
          </div>
        )}
      </div>
      
      {/* Immersive Reader (conditionally rendered) */}
      {isImmersiveMode && story && (
        <ImmersiveReader
          story={story}
          onClose={() => setIsImmersiveMode(false)}
          onSave={() => setIsSaved(true)}
        />
      )}
    </div>
  );
}
