"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navigation from "./components/Navigation";
import { 
  BackgroundShapes, 
  themeShapes, 
  AnimatedButton, 
  TextReveal,
  FloatingElement
} from "./components/animations";
import { 
  HeroHeading, 
  FeatureCard, 
  SelectionCard, 
  CharacterMascot 
} from "./components/ui";

export default function Home() {
  const router = useRouter();
  const templatesRef = useRef<HTMLDivElement>(null);
  
  // State to control the sliding animation
  const [showTemplates, setShowTemplates] = useState(false);
  
  type AgeRange = "3-5" | "6-8" | "9-12" | "teenager";
  type Gender = "boy" | "girl";
  type Personality = "adventurous" | "brave" | "creative" | "curious" | "friendly" | "gentle" | "kind" | "thoughtful";
  
  // Load user profile from localStorage or use defaults
  const loadUserProfile = () => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          return JSON.parse(savedProfile);
        } catch (e) {
          console.error('Error parsing saved user profile', e);
        }
      }
    }
    return {
      childAge: "6-8", // Default to early elementary age range
      childGender: "boy", // Default to boy
      childPersonality: "curious", // Default personality
    };
  };
  
  // User profile state with proper types
  const [userProfile, setUserProfile] = useState<{
    childAge: AgeRange;
    childGender: Gender;
    childPersonality: Personality;
  }>(loadUserProfile());
  
  // Save profile whenever it changes
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);
  
  // Options for dropdown selects with associated themes
  const ageRanges: Array<{value: AgeRange; label: string; theme: string}> = [
    { value: "3-5", label: "3-5 years (Preschool)", theme: "green" },
    { value: "6-8", label: "6-8 years (Early Elementary)", theme: "blue" },
    { value: "9-12", label: "9-12 years (Late Elementary)", theme: "purple" },
    { value: "teenager", label: "Teenager", theme: "indigo" },
  ];
  
  const genderOptions: Array<{value: Gender; label: string; modifier: number}> = [
    { value: "boy", label: "Boy", modifier: 0 },
    { value: "girl", label: "Girl", modifier: 1 },
  ];
  
  const personalityOptions: Array<{value: Personality; label: string}> = [
    { value: "adventurous", label: "Adventurous" },
    { value: "brave", label: "Brave" },
    { value: "creative", label: "Creative" },
    { value: "curious", label: "Curious" },
    { value: "friendly", label: "Friendly" },
    { value: "gentle", label: "Gentle" },
    { value: "kind", label: "Kind" },
    { value: "thoughtful", label: "Thoughtful" },
  ];
  
  // Theme colors based on age and gender with proper types
  const themeColors: Record<AgeRange, Record<Gender, string>> = {
    "3-5": {
      boy: "green",
      girl: "pink"
    },
    "6-8": {
      boy: "blue",
      girl: "purple"
    },
    "9-12": {
      boy: "indigo",
      girl: "fuchsia"
    },
    "teenager": {
      boy: "slate",
      girl: "rose"
    }
  };
  
  // Get current theme color based on age and gender
  const getCurrentThemeColor = () => {
    return themeColors[userProfile.childAge][userProfile.childGender];
  };
  
  // Handle sliding animation to templates
  const showTemplatesSection = () => {
    setShowTemplates(true);
    // Scroll to templates section with smooth animation
    if (templatesRef.current) {
      templatesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Handle direct navigation with user profile
  const navigateWithProfile = (path: string) => {
    // Add user profile as URL parameters
    const queryParams = new URLSearchParams({
      ageRange: userProfile.childAge,
      gender: userProfile.childGender,
      personality: userProfile.childPersonality,
      theme: getCurrentThemeColor()
    });
    
    router.push(`${path}?${queryParams.toString()}`);
  };
  
  // Get dynamic class based on theme color
  const getThemeClass = (type: "bg" | "text" | "gradient") => {
    const color = getCurrentThemeColor();
    
    if (type === "bg") {
      return `bg-${color}-100`;
    } else if (type === "text") {
      return `text-${color}-600`;
    } else {
      return `from-${color}-500 to-${color}-700`;
    }
  };

  // Get personality icon
  const getPersonalityIcon = (personality: Personality) => {
    switch (personality) {
      case "adventurous": return "🌄";
      case "brave": return "🛡️";
      case "creative": return "🎨";
      case "curious": return "🔍";
      case "friendly": return "👋";
      case "gentle": return "🕊️";
      case "kind": return "💖";
      case "thoughtful": return "💭";
      default: return "🔍"; // Default to curious
    }
  };
  
  return (
    <>
      <Navigation />
      {/* User Settings Landing Page */}
      <div className={`min-h-screen ${getThemeClass("bg")} transition-colors duration-500`}>
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section - Visual & Immersive */}
          <header className="relative flex flex-col items-center mb-14 mt-8 overflow-hidden">
            {/* Animated Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 -z-10">
              <BackgroundShapes shapes={themeShapes[
                userProfile.childAge === "3-5" ? "adventure" : 
                userProfile.childAge === "6-8" ? "fantasy" : 
                userProfile.childAge === "9-12" ? "space" : "default"
              ]} />
            </div>
            
            {/* Main Title & Subtitle with Animation */}
            <HeroHeading
              title="StoryBuddy"
              subtitle="Create magical stories and illustrations for curious little minds"
              highlightWords={["magical", "stories", "curious"]}
              themeColor={getCurrentThemeColor()}
            />
            
            {/* Visual Characters with Floating Animation */}
            <motion.div 
              className="flex justify-center mt-8 space-x-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="relative">
                <div className={`absolute -inset-2 rounded-full bg-gradient-to-r ${getThemeClass("gradient")} blur-sm opacity-70`}></div>
                <div className="relative bg-white rounded-full w-20 h-20 flex items-center justify-center text-4xl shadow-lg">
                  {userProfile.childGender === "boy" ? "👦" : "👧"}
                </div>
              </div>
              
              {/* Character Mascot */}
              <CharacterMascot
                imageSrc="/friendly-character.svg"
                themeColor={getCurrentThemeColor()}
                size={180}
              />
            </motion.div>
          </header>

          {/* Main Content */}
          <main className="flex flex-col items-center">
            {/* Personalization Section */}
            <div className="w-full max-w-3xl mb-10 bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className={`font-[family-name:var(--font-baloo)] text-3xl ${getThemeClass("text")} font-bold mb-6 text-center`}>
                  <TextReveal 
                    text="User Settings"
                    delay={0.2}
                  />
                </h2>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Age Range Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I am...
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {ageRanges.map((option, index) => (
                      <motion.div
                        key={option.value}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                      >
                        <SelectionCard
                          label={option.label}
                          icon={
                            option.value === "3-5" ? "🧸" :
                            option.value === "6-8" ? "🚀" :
                            option.value === "9-12" ? "🔍" : "🎮"
                          }
                          isSelected={userProfile.childAge === option.value}
                          onClick={() => setUserProfile({...userProfile, childAge: option.value})}
                          theme={option.theme}
                          className="w-full"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Right column with gender & personality */}
                <div className="space-y-6">
                  {/* Gender Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main character should be a...
                    </label>
                    <div className="flex space-x-3">
                      {genderOptions.map((option, index) => {
                        const themeColor = themeColors[userProfile.childAge][option.value];
                        return (
                          <motion.div
                            key={option.value}
                            className="flex-1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 + (0.1 * index) }}
                          >
                            <AnimatedButton
                              onClick={() => setUserProfile({...userProfile, childGender: option.value})}
                              variant={userProfile.childGender === option.value ? "primary" : "secondary"}
                              themeColor={themeColor}
                              icon={option.value === "boy" ? "👦" : "👧"}
                              fullWidth
                            >
                              {option.label}
                            </AnimatedButton>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Personality Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Character Personality
                    </label>
                    <motion.div 
                      className="bg-white rounded-xl border border-gray-200 p-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {personalityOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setUserProfile({...userProfile, childPersonality: option.value})}
                            className={`flex items-center p-2 rounded-lg transition-all ${
                              userProfile.childPersonality === option.value
                                ? `bg-${getCurrentThemeColor()}-100 text-${getCurrentThemeColor()}-600 font-medium`
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className="mr-2">{getPersonalityIcon(option.value)}</span>
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
              
              {/* Continue Button */}
              <div className="mt-8 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <AnimatedButton
                    onClick={showTemplatesSection}
                    themeColor={getCurrentThemeColor()}
                    size="lg"
                    className="font-[family-name:var(--font-baloo)]"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                      </svg>
                    }
                    iconPosition="right"
                  >
                    Continue to Story Options
                  </AnimatedButton>
                </motion.div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="mt-12 w-full max-w-4xl">
              <h2 className={`font-[family-name:var(--font-baloo)] text-3xl text-center ${getThemeClass("text")} font-bold mb-8`}>
                <TextReveal 
                  text="Magical Features"
                  delay={0.2}
                  highlightWords={["Magical"]}
                  highlightClassName={`bg-clip-text text-transparent bg-gradient-to-r ${getThemeClass("gradient")}`}
                />
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Feature Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <FeatureCard
                    title="Beautiful Illustrations"
                    description="Colorful pictures that bring your stories to life"
                    icon="🎨"
                    color={getCurrentThemeColor()}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <FeatureCard
                    title="Exciting Stories"
                    description="Adventure-filled tales that spark imagination"
                    icon="📚"
                    color={getCurrentThemeColor()}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <FeatureCard
                    title="Immersive Reading"
                    description="Page-turning animations with narration"
                    icon="📱"
                    color={getCurrentThemeColor()}
                  />
                </motion.div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="mt-20 text-center text-gray-500">
            <FloatingElement duration={6} yOffset={5}>
              <p className="text-sm">
                Made with ❤️ for curious children everywhere
              </p>
            </FloatingElement>
          </footer>
        </div>
      </div>
      
      {/* Mode Selection with Sliding Animation */}
      <div 
        ref={templatesRef}
        className={`fixed inset-0 bg-white transform transition-transform duration-500 ease-in-out z-20 overflow-y-auto ${
          showTemplates ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Mode Selection Header with Back Button */}
        <div className="sticky top-0 z-10 bg-white shadow-sm p-4">
          <div className="container mx-auto flex items-center justify-between">
            <AnimatedButton
              onClick={() => setShowTemplates(false)}
              variant="secondary"
              size="sm"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              }
            >
              Back to Settings
            </AnimatedButton>
            
            <h2 className={`font-[family-name:var(--font-baloo)] text-2xl ${getThemeClass("text")} font-bold`}>
              Mode Selection
            </h2>
            
            <div className="w-32"></div> {/* Empty div for balanced flex layout */}
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-6">
          {/* Visual Header */}
          <header className="text-center mb-10">
            <HeroHeading
              title="Choose Your Adventure"
              subtitle="How would you like to create your magical story today?"
              themeColor={getCurrentThemeColor()}
              highlightWords={["Adventure", "magical"]}
            />
          </header>
          
          {/* Mode Selection - Visually Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl mx-auto">
            {/* Templates Option - Visual Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg overflow-hidden h-full"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className={`h-3 w-full bg-gradient-to-r from-blue-500 to-blue-700`}></div>
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <FloatingElement yOffset={6} duration={4} className="bg-blue-100 p-3 rounded-full mr-4">
                    <span className="text-4xl">📚</span>
                  </FloatingElement>
                  <h2 className={`font-[family-name:var(--font-baloo)] text-2xl text-blue-600 font-bold`}>
                    Story Templates
                  </h2>
                </div>
                
                <p className="text-gray-600 mb-6 text-lg">
                  Choose from our collection of exciting pre-made story templates designed for {userProfile.childGender === "boy" ? "boys" : "girls"} aged {userProfile.childAge}!
                </p>
                
                {/* Visual Preview */}
                <div className="relative w-full h-48 mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-2 opacity-60">
                      <div className="bg-blue-100 rounded p-2 text-center">Adventure</div>
                      <div className="bg-green-100 rounded p-2 text-center">Animals</div>
                      <div className="bg-purple-100 rounded p-2 text-center">Fantasy</div>
                      <div className="bg-amber-100 rounded p-2 text-center">Dinosaurs</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                  <FloatingElement yOffset={10}>
                    <span className="relative text-5xl">📚</span>
                  </FloatingElement>
                </div>
                
                <div className="mt-auto">
                  <AnimatedButton
                    onClick={() => navigateWithProfile('/stories/templates')}
                    themeColor="blue"
                    fullWidth
                    size="lg"
                    className="font-[family-name:var(--font-baloo)]"
                  >
                    Browse Templates
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>

            {/* Custom Story Option - Visual Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg overflow-hidden h-full"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className={`h-3 w-full bg-gradient-to-r from-pink-500 to-orange-500`}></div>
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <FloatingElement yOffset={6} duration={4} className="bg-pink-100 p-3 rounded-full mr-4">
                    <span className="text-4xl">✏️</span>
                  </FloatingElement>
                  <h2 className={`font-[family-name:var(--font-baloo)] text-2xl text-pink-600 font-bold`}>
                    Custom Story
                  </h2>
                </div>
                
                <p className="text-gray-600 mb-6 text-lg">
                  Create a unique story with your own keywords, characters, and magical ideas! Perfect for unleashing your creativity.
                </p>
                
                {/* Visual Preview */}
                <div className="relative w-full h-48 mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-pink-50 to-orange-50 flex items-center justify-center">
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-60">
                    <div className="flex flex-wrap gap-2 max-w-xs justify-center">
                      <span className="bg-pink-100 px-3 py-1 rounded">Adventure</span>
                      <span className="bg-yellow-100 px-3 py-1 rounded">Castle</span>
                      <span className="bg-green-100 px-3 py-1 rounded">Dragon</span>
                      <span className="bg-blue-100 px-3 py-1 rounded">Princess</span>
                      <span className="bg-purple-100 px-3 py-1 rounded">Magic</span>
                      <span className="bg-red-100 px-3 py-1 rounded">Quest</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                  <FloatingElement yOffset={10}>
                    <span className="relative text-5xl">✏️</span>
                  </FloatingElement>
                </div>
                
                <div className="mt-auto">
                  <AnimatedButton
                    onClick={() => navigateWithProfile('/stories/create')}
                    themeColor="pink"
                    fullWidth
                    size="lg"
                    className="font-[family-name:var(--font-baloo)]"
                  >
                    Create Custom Story
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
