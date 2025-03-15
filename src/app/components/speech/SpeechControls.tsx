"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SpeechControlsProps } from '../../types/ui';
import { speechService, SpeechOptions } from '../../services/speechService';

// Icons as separate components for better organization
const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8 5.14v14l11-7-11-7z" />
  </svg>
);

const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 6h12v12H6z" />
  </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const RewindIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
  </svg>
);

const FastForwardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
  </svg>
);

/**
 * SpeechControls - A component for controlling text-to-speech narration
 * Features large, child-friendly controls and options for voice selection and speed
 */
export default function SpeechControls({ 
  paragraphs, 
  onHighlight,
  className = '',
  theme = 'default'
}: SpeechControlsProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [options, setOptions] = useState<SpeechOptions>({
    rate: 1.0,
    pitch: 1.0,
    voice: null
  });
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Initialize speech service
  useEffect(() => {
    if (!speechService) return;
    
    // Initialize available voices
    const initVoices = () => {
      if (speechService) {
        const availableVoices = speechService.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
        }
      }
    };
    
    // Voice list handling
    initVoices();
    
    // Set callbacks
    if (speechService) {
      speechService.setOnHighlight((index) => {
        setCurrentIndex(index);
        onHighlight(index);
      });
      
      speechService.setOnPlayStatusChange(setIsPlaying);
    }
    
    // Cleanup on unmount
    return () => {
      if (speechService) {
        speechService.stop();
      }
    };
  }, [onHighlight]);
  
  // Toggle play/pause
  const togglePlay = () => {
    if (!speechService) return;
    
    if (paragraphs.length > 0) {
      speechService.togglePlayPause();
    }
  };
  
  // Stop speech
  const stopSpeech = () => {
    if (speechService) {
      speechService.stop();
    }
  };
  
  // Jump to previous paragraph
  const goToPrevious = () => {
    if (speechService && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      speechService.jumpTo(newIndex);
    }
  };
  
  // Jump to next paragraph
  const goToNext = () => {
    if (speechService && currentIndex < paragraphs.length - 1) {
      const newIndex = currentIndex + 1;
      speechService.jumpTo(newIndex);
    }
  };
  
  // Update speech options
  const updateOption = <K extends keyof SpeechOptions>(name: K, value: SpeechOptions[K]) => {
    const newOptions = { ...options, [name]: value };
    setOptions(newOptions);
    
    if (speechService) {
      speechService.setOptions(newOptions);
    }
  };
  
  // Get theme colors
  const getThemeColors = () => {
    switch (theme) {
      case 'adventure':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'fantasy':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'space':
        return 'bg-indigo-500 hover:bg-indigo-600';
      case 'underwater':
        return 'bg-cyan-500 hover:bg-cyan-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };
  
  const primaryButtonClass = `${getThemeColors()} text-white shadow-lg transition-all duration-200`;
  const secondaryButtonClass = 'bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-md transition-all duration-200';
  
  return (
    <div className={`speech-controls ${className}`}>
      <div className="flex items-center justify-center space-x-4">
        {/* Previous button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={goToPrevious}
          disabled={currentIndex <= 0}
          className={`p-4 rounded-full ${secondaryButtonClass} ${currentIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Previous paragraph"
        >
          <RewindIcon className="w-8 h-8" />
        </motion.button>
        
        {/* Play/Pause button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlay}
          className={`p-5 rounded-full ${primaryButtonClass}`}
          aria-label={isPlaying ? "Pause narration" : "Start narration"}
        >
          {isPlaying ? (
            <PauseIcon className="w-10 h-10" />
          ) : (
            <PlayIcon className="w-10 h-10" />
          )}
        </motion.button>
        
        {/* Stop button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={stopSpeech}
          className={`p-4 rounded-full ${secondaryButtonClass}`}
          aria-label="Stop narration"
          disabled={!isPlaying && currentIndex === 0}
        >
          <StopIcon className="w-8 h-8" />
        </motion.button>
        
        {/* Next button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={goToNext}
          disabled={currentIndex >= paragraphs.length - 1}
          className={`p-4 rounded-full ${secondaryButtonClass} ${currentIndex >= paragraphs.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Next paragraph"
        >
          <FastForwardIcon className="w-8 h-8" />
        </motion.button>
        
        {/* Settings button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowOptions(!showOptions)}
          className={`p-4 rounded-full ${secondaryButtonClass}`}
          aria-label="Speech options"
        >
          <SettingsIcon className="w-7 h-7" />
        </motion.button>
      </div>
      
      {/* Options panel with animation */}
      {showOptions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-6 p-6 bg-white rounded-xl shadow-lg"
        >
          {/* Reading speed slider */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Reading Speed
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Slow</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={options.rate}
                onChange={(e) => updateOption('rate', parseFloat(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                aria-label="Reading speed"
              />
              <span className="text-sm text-gray-500">Fast</span>
            </div>
          </div>
          
          {/* Voice selection */}
          {voices.length > 0 && (
            <div className="mb-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Narrator Voice
              </label>
              <select
                value={options.voice || ''}
                onChange={(e) => updateOption('voice', e.target.value || null)}
                className="w-full p-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Select narrator voice"
              >
                <option value="">Default Voice</option>
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Current paragraph indicator */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-500">
              Paragraph {currentIndex + 1} of {paragraphs.length}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
