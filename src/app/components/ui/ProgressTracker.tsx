"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ImageGenerationProgress } from '../../services/imageManagementService';

interface ProgressTrackerProps {
  progressState: ImageGenerationProgress;
  theme?: string;
  emoji?: string;
}

/**
 * ProgressTracker component
 * Displays detailed progress information for story and image generation
 * with stage-specific animations and theme-appropriate styling
 * Enhanced with larger text sizes and more child-friendly language
 */
export default function ProgressTracker({ 
  progressState, 
  theme = 'default',
  emoji = '📚'
}: ProgressTrackerProps) {
  
  // Theme-specific styling
  const getThemeColors = () => {
    switch (theme) {
      case 'adventure':
        return {
          primary: 'amber',
          accent: 'amber',
          text: 'amber-700',
          gradient: 'from-amber-500 via-amber-400 to-amber-500',
          shadow: 'shadow-amber-500/20',
          bg: 'bg-amber-50',
          decoration: <AdventureDecoration />
        };
      case 'fantasy':
        return {
          primary: 'purple',
          accent: 'purple',
          text: 'purple-700',
          gradient: 'from-purple-500 via-purple-400 to-purple-500',
          shadow: 'shadow-purple-500/20',
          bg: 'bg-purple-50',
          decoration: <FantasyDecoration />
        };
      case 'space':
        return {
          primary: 'indigo',
          accent: 'blue',
          text: 'indigo-700',
          gradient: 'from-indigo-500 via-blue-400 to-indigo-500',
          shadow: 'shadow-indigo-500/20',
          bg: 'bg-indigo-50',
          decoration: <SpaceDecoration />
        };
      case 'underwater':
        return {
          primary: 'cyan',
          accent: 'blue',
          text: 'cyan-700',
          gradient: 'from-cyan-500 via-blue-400 to-cyan-500',
          shadow: 'shadow-cyan-500/20',
          bg: 'bg-cyan-50',
          decoration: <UnderwaterDecoration />
        };
      case 'dinosaurs':
        return {
          primary: 'green',
          accent: 'emerald',
          text: 'green-700',
          gradient: 'from-green-500 via-emerald-400 to-green-500',
          shadow: 'shadow-green-500/20',
          bg: 'bg-green-50',
          decoration: <DinosaurDecoration />
        };
      case 'pirates':
        return {
          primary: 'blue',
          accent: 'amber',
          text: 'blue-700',
          gradient: 'from-blue-500 via-amber-400 to-blue-500',
          shadow: 'shadow-blue-500/20',
          bg: 'bg-blue-50',
          decoration: <PirateDecoration />
        };
      default:
        return {
          primary: 'blue',
          accent: 'purple',
          text: 'blue-700',
          gradient: 'from-blue-500 via-purple-400 to-blue-500',
          shadow: 'shadow-blue-500/20',
          bg: 'bg-blue-50',
          decoration: null
        };
    }
  };
  
  const colors = getThemeColors();
  
  // Determine the emojis based on the stage
  const getStageEmoji = () => {
    switch (progressState.stage) {
      case 'preparation': return '✨';
      case 'generation': return '🎨';
      case 'processing': return '🔄';
      case 'complete': return '🎉';
      default: return '📚';
    }
  };
  
  // Get a human-readable stage description
  const getStageName = () => {
    switch (progressState.stage) {
      case 'preparation': return 'Getting Ready';
      case 'generation': return 'Drawing Pictures';
      case 'processing': return 'Finishing Up';
      case 'complete': return 'All Done';
      default: return 'Working';
    }
  };
  
  // Get a fun, engaging message based on stage - with simpler child-friendly language
  const getStageMessage = () => {
    if (progressState.stage === 'preparation') {
      return "Our storytellers are making a magical story just for you!";
    } else if (progressState.stage === 'generation') {
      return `Our artists are drawing picture ${progressState.currentImage} of ${progressState.totalImages}!`;
    } else if (progressState.stage === 'processing') {
      if (progressState.isCached) {
        return "Finding your pictures from last time!";
      } else {
        return `Adding the final touches to picture ${progressState.currentImage}!`;
      }
    } else {
      return "Almost done! Getting your storybook ready!";
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4">
      {/* Progress stage-specific animations - LARGER for better visibility */}
      <div className="relative w-40 h-40 mb-8">
        {progressState.stage === 'preparation' && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`w-28 h-28 rounded-full ${colors.bg} flex items-center justify-center text-5xl`}>
              {emoji}
            </div>
            <motion.div 
              className={`absolute inset-0 border-4 border-t-transparent rounded-full border-${colors.primary}-400`} 
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            />
          </motion.div>
        )}
        
        {progressState.stage === 'generation' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className={`w-32 h-32 rounded-full ${colors.bg} flex items-center justify-center text-4xl relative overflow-hidden`}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="relative z-10">{getStageEmoji()}</span>
              <motion.div 
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${colors.gradient} opacity-30`}
                initial={{ height: 0 }}
                animate={{ 
                  height: `${(progressState.currentImage / progressState.totalImages) * 100}%`
                }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
            <div className="absolute top-0 right-0 bg-white/90 text-lg font-medium rounded-full px-3 py-1 shadow-md">
              {progressState.currentImage}/{progressState.totalImages}
            </div>
          </div>
        )}
        
        {progressState.stage === 'processing' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <motion.div 
                className={`w-32 h-32 rounded-full ${colors.bg} flex items-center justify-center text-4xl`}
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {getStageEmoji()}
                </div>
                {/* Processing dots around the circle */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div 
                    key={i}
                    className={`absolute w-3 h-3 rounded-full bg-${colors.primary}-400`}
                    style={{
                      left: `${50 + 38 * Math.cos(2 * Math.PI * i / 8)}%`,
                      top: `${50 + 38 * Math.sin(2 * Math.PI * i / 8)}%`,
                    }}
                    initial={{ opacity: 0.2 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      duration: 0.8, 
                      repeat: Infinity, 
                      repeatType: "reverse",
                      delay: i * 0.1
                    }}
                  />
                ))}
              </motion.div>
              <div className="absolute -top-2 -right-2 bg-white/90 text-lg font-medium rounded-full px-3 py-1 shadow-md">
                {progressState.currentImage}/{progressState.totalImages}
              </div>
            </div>
          </div>
        )}
        
        {progressState.stage === 'complete' && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: [0, 10, -10, 0] }}
            transition={{ 
              duration: 0.8,
              scale: { duration: 0.3 },
              rotate: { duration: 0.5, delay: 0.3 }
            }}
          >
            <div className={`w-32 h-32 rounded-full ${colors.bg} flex items-center justify-center text-5xl ${colors.shadow}`}>
              🎉
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Status information - with LARGER font size for children */}
      <motion.h3 
        className={`font-[family-name:var(--font-baloo)] text-3xl sm:text-4xl md:text-5xl mb-5 text-center text-${colors.text} drop-shadow-sm`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={progressState.stage + progressState.currentImage} // Re-animate when these change
      >
        {progressState.stage === 'generation' 
          ? `Drawing picture ${progressState.currentImage} of ${progressState.totalImages}`
          : progressState.stage === 'complete'
          ? "Hooray! Story is ready!"
          : `${getStageName()} your story`}
      </motion.h3>
      
      {/* Detail message - with LARGER font size for children */}
      {progressState.stage !== 'complete' && (
        <motion.p 
          className="text-gray-700 text-xl sm:text-2xl text-center mb-8 max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          key={`${progressState.stage}-${progressState.currentImage}-detail`}
        >
          {progressState.isCached ? "Finding your pictures from before!" : getStageMessage()}
        </motion.p>
      )}
      
      {/* Cache indicator - LARGER and more child-friendly */}
      {progressState.isCached && progressState.stage !== 'complete' && (
        <div className="flex items-center mb-4 text-md text-gray-600 bg-white/70 py-2 px-3 rounded-lg">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" 
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Using saved pictures!</span>
        </div>
      )}
      
      {/* Progress bar with stages - LARGER and more colorful */}
      <div className="w-full max-w-md mb-6">
        <div className="relative pt-1">
          <div className="flex items-center justify-between mb-3">
            <div className={`text-sm font-bold ${progressState.stage === 'preparation' ? `text-${colors.primary}-600` : 'text-gray-500'}`}>
              Getting Ready
            </div>
            <div className={`text-sm font-bold ${progressState.stage === 'generation' ? `text-${colors.primary}-600` : 'text-gray-500'}`}>
              Drawing Pictures
            </div>
            <div className={`text-sm font-bold ${(progressState.stage === 'processing' || progressState.stage === 'complete') ? `text-${colors.primary}-600` : 'text-gray-500'}`}>
              Finishing Up
            </div>
          </div>
          
          {/* Main progress bar - TALLER and more colorful */}
          <div className="h-4 mb-4 overflow-hidden rounded-full bg-gray-200 shadow-inner">
            <motion.div
              className={`h-full bg-gradient-to-r ${colors.gradient}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressState.percentComplete}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          {/* Stage indicators - LARGER and more animated */}
          <div className="absolute top-0 w-full flex justify-between">
            <motion.div 
              className={`w-6 h-6 rounded-full ${progressState.percentComplete >= 10 ? `bg-${colors.primary}-500` : 'bg-gray-300'} shadow-md`} 
              initial={{ scale: 1 }}
              animate={{ 
                scale: progressState.stage === 'preparation' ? [1, 1.2, 1] : 1 
              }}
              transition={{ 
                repeat: progressState.stage === 'preparation' ? Infinity : 0, 
                repeatType: "reverse",
                duration: 1
              }}
              style={{marginLeft: "0%"}}
            />
            <motion.div 
              className={`w-6 h-6 rounded-full ${progressState.percentComplete >= 40 ? `bg-${colors.primary}-500` : 'bg-gray-300'} shadow-md`} 
              initial={{ scale: 1 }}
              animate={{ 
                scale: progressState.stage === 'generation' ? [1, 1.2, 1] : 1 
              }}
              transition={{ 
                repeat: progressState.stage === 'generation' ? Infinity : 0, 
                repeatType: "reverse",
                duration: 1
              }}
              style={{marginLeft: "-40%"}}
            />
            <motion.div 
              className={`w-6 h-6 rounded-full ${progressState.percentComplete >= 80 ? `bg-${colors.primary}-500` : 'bg-gray-300'} shadow-md`} 
              initial={{ scale: 1 }}
              animate={{ 
                scale: (progressState.stage === 'processing' || progressState.stage === 'complete') ? [1, 1.2, 1] : 1 
              }}
              transition={{ 
                repeat: (progressState.stage === 'processing' || progressState.stage === 'complete') ? Infinity : 0, 
                repeatType: "reverse",
                duration: 1
              }}
              style={{marginRight: "0%"}}
            />
          </div>
        </div>
      </div>
      
      {/* Engaging loading message - with animation and larger size */}
      <motion.div 
        className="flex items-center justify-center text-gray-700 mt-6 bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        key={`${progressState.stage}-${progressState.currentImage}-message`}
      >
        <motion.div 
          className="mr-3 text-4xl"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            repeatType: "reverse",
            duration: 2.5
          }}
        >
          {getStageEmoji()}
        </motion.div>
        <p className="italic text-lg">
          {getStageMessage()}
        </p>
      </motion.div>
      
      {/* Theme-specific decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden opacity-50 pointer-events-none">
        {colors.decoration}
      </div>
    </div>
  );
}

// Theme decorations
function UnderwaterDecoration() {
  return (
    <div className="w-full h-20 animate-wave">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-cyan-500"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="fill-cyan-500"></path>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-cyan-500"></path>
      </svg>
    </div>
  );
}

function SpaceDecoration() {
  return (
    <div className="absolute inset-0 bg-indigo-900/10">
      <div className="stars-container relative w-full h-full">
        {Array(20).fill(0).map((_, i) => (
          <motion.div key={i} 
            className="absolute w-2 h-2 bg-white rounded-full"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              repeat: Infinity,
              duration: 2 + Math.random() * 3,
              delay: Math.random() * 3,
            }}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FantasyDecoration() {
  return (
    <div className="w-full h-20">
      <div className="relative w-full h-full">
        {Array(6).fill(0).map((_, i) => (
          <motion.div 
            key={i}
            className="absolute w-4 h-4"
            style={{
              top: `${30 + Math.random() * 60}%`,
              left: `${i * 20 + Math.random() * 10}%`,
            }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ 
              y: [-10, 10, -10],
              opacity: [0, 0.6, 0], 
            }}
            transition={{
              repeat: Infinity,
              duration: 4 + Math.random() * 3,
              delay: i * 0.5,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.5L15.5 9L22 10.5L17 15L18 21.5L12 18.5L6 21.5L7 15L2 10.5L8.5 9L12 2.5Z" 
                stroke="currentColor" fill="none" strokeWidth="1.5" 
                className="text-purple-300"
              />
            </svg>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AdventureDecoration() {
  return (
    <div className="absolute bottom-0 left-0 w-full h-16">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
        <path d="M0,0 L0,100 L1200,100 L1200,0 L800,80 L600,20 L400,90 L200,30 L0,0 Z" fill="rgba(245, 158, 11, 0.2)" />
      </svg>
    </div>
  );
}

function DinosaurDecoration() {
  return (
    <div className="w-full h-20">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-20">
        <motion.path 
          d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C50.45,17.92,128.2,47,213.18,56.74,251.57,61.22,280.61,60.42,321.39,56.44Z" 
          fill="rgba(16, 185, 129, 0.2)" 
          animate={{ d: [
            "M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C50.45,17.92,128.2,47,213.18,56.74,251.57,61.22,280.61,60.42,321.39,56.44Z",
            "M321.39,46.44c58-8.79,114.16-36.13,172-41.86,82.39-8.72,168.19-1.73,250.45,19.61C823.78,41,906.67,62,985.66,82.83c70.05,10.48,146.53,16.09,214.34,3V120H0V0C50.45,27.92,128.2,37,213.18,46.74,251.57,51.22,280.61,50.42,321.39,46.44Z",
            "M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C50.45,17.92,128.2,47,213.18,56.74,251.57,61.22,280.61,60.42,321.39,56.44Z"
          ] }}
          transition={{ 
            repeat: Infinity, 
            repeatType: "loop", 
            duration: 15,
            ease: "easeInOut" 
          }}
        />
      </svg>
    </div>
  );
}

function PirateDecoration() {
  return (
    <div className="w-full h-20">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-20">
        <motion.path 
          d="M0,0V7.23C0,65.52,268.63,112.77,600,112.77S1200,65.52,1200,7.23V0Z" 
          fill="rgba(59, 130, 246, 0.2)" 
          initial={{ opacity: 0.5, y: 20 }}
          animate={{ 
            opacity: [0.3, 0.5, 0.3], 
            y: [20, 10, 20] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 5, 
            ease: "easeInOut" 
          }}
        />
        <motion.path 
          d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
          fill="rgba(245, 158, 11, 0.2)" 
          initial={{ opacity: 0.5, y: 10 }}
          animate={{ 
            opacity: [0.2, 0.4, 0.2], 
            y: [10, 5, 10] 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 7, 
            ease: "easeInOut" 
          }}
        />
      </svg>
    </div>
  );
}
