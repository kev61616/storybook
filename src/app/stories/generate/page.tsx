"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navigation from "../../components/Navigation";
import Link from "next/link";
import Image from "next/image";
import { generateStory, generateImage, StoryData } from "../../utils/api";
import ImmersiveReader from "../../components/ImmersiveReader";

/**
 * StoryGenerate page that displays a story generated from a template
 * Shows the story with AI-generated illustrations in a kid-friendly format
 */
export default function GenerateStory() {
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

  // Start story generation process
  const startGeneration = async () => {
    if (!template) return;
    
    setIsLoading(true);
    setShowOptions(false);
    
    try {
        setCurrentStep('generating-story');
        setProgress(10);
        
        // Generate story from the template using OpenAI
        // Pass parameters for story generation
        const storyData = await generateStory('template', template, {
          length: storyLength,
          readingLevel: readingLevel
        });
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
  
  const { bg, text } = getThemeColors();

  // Determine which paragraphs will have illustrations
  const getIllustratedParagraphIndices = () => {
    // Make sure we have story, content, and images
    if (!story?.content?.length || !story?.images?.length) {
      return [];
    }
    
    const { content, images } = story;
    
    // If we have fewer than 4 images, use what we have
    if (images.length < 4) {
      return images.map((_, i) => i * Math.floor(content.length / (images.length + 1)));
    }
    
    // Otherwise, distribute 4 images evenly
    return [0, 3, 6, 9].slice(0, Math.min(4, content.length));
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
                
                return (
                  <div key={index} className={hasIllustration ? "flex flex-col gap-6" : ""}>
                    {/* Illustration if this paragraph has one */}
                    {hasIllustration && story.images && (
                      <div className="mx-auto w-full max-w-2xl rounded-xl overflow-hidden shadow-lg relative aspect-[4/3]">
                        <Image 
                          src={story.images[illustrationIndex]} 
                          alt={`Illustration for ${story.title}`}
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
              <Link 
                href="/stories/templates"
                className="py-3 px-6 bg-white text-purple-600 rounded-full font-[family-name:var(--font-baloo)] font-medium border-2 border-purple-200 hover:border-purple-400 transition-colors text-center"
              >
                Try Another Template
              </Link>
              <Link 
                href="/stories/create"
                className="py-3 px-6 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full font-[family-name:var(--font-baloo)] font-medium hover:opacity-90 transition-opacity text-center"
              >
                Create My Own Story
              </Link>
            </div>
          </div>
        ) : null}
        
        {!isLoading && !story && !error && (
          // Error state
          <div className="text-center py-16">
            <p className="text-xl text-red-500">
              Oops! We couldn&apos;t create a story. Please try again.
            </p>
            <Link 
              href="/stories/templates"
              className="mt-6 inline-block py-3 px-6 bg-purple-600 text-white rounded-full"
            >
              Back to Templates
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
