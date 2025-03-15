"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navigation from "./components/Navigation";

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
  
  return (
    <>
      <Navigation />
      {/* User Settings Landing Page */}
      <div className={`min-h-screen ${getThemeClass("bg")} transition-colors duration-300`}>
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section - Visual & Impactful */}
          <header className="relative flex flex-col items-center mb-14 mt-8">
            {/* Abstract Shapes Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 -z-10">
              <div className={`absolute top-10 left-10 w-64 h-64 rounded-full bg-${getCurrentThemeColor()}-200 blur-3xl`}></div>
              <div className={`absolute bottom-10 right-10 w-64 h-64 rounded-full bg-${getCurrentThemeColor()}-300 blur-3xl`}></div>
            </div>
            
            {/* Main Title with Animation */}
            <h1 className={`font-[family-name:var(--font-baloo)] text-6xl md:text-7xl text-center ${getThemeClass("text")} font-bold mb-4 animate-fadeIn`}>
              StoryBuddy
            </h1>
            
            {/* Tagline with Visual Flair */}
            <div className="relative">
              <p className="text-xl md:text-2xl text-center text-gray-600 max-w-2xl mb-6 animate-fadeIn animation-delay-100">
                Create magical stories and illustrations for curious little minds
              </p>
              <div className={`w-36 h-1.5 bg-gradient-to-r ${getThemeClass("gradient")} rounded-full mx-auto`}></div>
            </div>
            
            {/* Visual Characters */}
            <div className="flex justify-center mt-6 space-x-8 animate-fadeIn animation-delay-200">
              <div className="relative w-16 h-16">
                <div className={`absolute -inset-1 rounded-full bg-gradient-to-r ${getThemeClass("gradient")} blur-sm opacity-70`}></div>
                <div className="relative bg-white rounded-full w-full h-full flex items-center justify-center text-3xl">
                  👦
                </div>
              </div>
              <div className="relative w-16 h-16">
                <div className={`absolute -inset-1 rounded-full bg-gradient-to-r ${getThemeClass("gradient")} blur-sm opacity-70`}></div>
                <div className="relative bg-white rounded-full w-full h-full flex items-center justify-center text-3xl">
                  👧
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex flex-col items-center">
            {/* Personalization Section */}
            <div className="w-full max-w-3xl mb-10 bg-white rounded-2xl shadow-md p-6 md:p-8">
              <h2 className={`font-[family-name:var(--font-baloo)] text-3xl ${getThemeClass("text")} font-bold mb-6 text-center`}>
                User Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Age Range Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I am...
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {ageRanges.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setUserProfile({...userProfile, childAge: option.value})}
                        className={`flex items-center p-3 rounded-xl border-2 transition-all
                          ${userProfile.childAge === option.value 
                            ? `border-${option.theme}-500 bg-${option.theme}-50 shadow-md` 
                            : 'border-gray-200 hover:border-gray-300'}`
                        }
                      >
                        <div className={`w-10 h-10 rounded-full bg-${option.theme}-100 flex items-center justify-center mr-3 text-${option.theme}-600`}>
                          {option.value === "3-5" && "🧸"}
                          {option.value === "6-8" && "🚀"}
                          {option.value === "9-12" && "🔍"}
                          {option.value === "teenager" && "🎮"}
                        </div>
                        <span className="font-medium text-gray-800">
                          {option.label}
                        </span>
                      </button>
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
                      {genderOptions.map((option) => {
                        const themeColor = themeColors[userProfile.childAge][option.value];
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setUserProfile({...userProfile, childGender: option.value})}
                            className={`flex-1 py-3 px-4 rounded-full transition-all ${
                              userProfile.childGender === option.value
                                ? `bg-${themeColor}-500 text-white shadow-md`
                                : `bg-gray-100 text-gray-700 hover:bg-gray-200`
                            }`}
                          >
                            {option.value === "boy" ? "👦 " : "👧 "} 
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Personality Select */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Character Personality
                    </label>
                    <select 
                      value={userProfile.childPersonality}
                      onChange={(e) => setUserProfile({...userProfile, childPersonality: e.target.value as Personality})}
                      className={`w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-${getCurrentThemeColor()}-500 focus:border-transparent`}
                    >
                      {personalityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Continue Button */}
              <div className="mt-8 text-center">
                <button 
                  onClick={showTemplatesSection}
                  className={`py-3 px-8 bg-gradient-to-r ${getThemeClass("gradient")} text-white rounded-full font-[family-name:var(--font-baloo)] font-medium text-lg hover:opacity-90 transition-opacity shadow-md`}
                >
                  Continue to Story Options
                </button>
              </div>
            </div>
            
            {/* Animated character */}
            <div className="relative w-48 h-48 mb-8">
              <Image
                src="/friendly-character.svg"
                alt="Friendly character"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Feature Highlights */}
            <div className="mt-8 w-full max-w-4xl">
              <h2 className={`font-[family-name:var(--font-baloo)] text-3xl text-center ${getThemeClass("text")} font-bold mb-8`}>
                Magical Features
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <div className="bg-white rounded-xl p-5 text-center shadow-md">
                  <div className={`${getThemeClass("bg")} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-baloo)] text-xl font-semibold mb-2">
                    Beautiful Illustrations
                  </h3>
                  <p className="text-gray-600">
                    Colorful pictures that bring your stories to life
                  </p>
                </div>
                
                {/* Feature 2 */}
                <div className="bg-white rounded-xl p-5 text-center shadow-md">
                  <div className={`${getThemeClass("bg")} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-baloo)] text-xl font-semibold mb-2">
                    Exciting Stories
                  </h3>
                  <p className="text-gray-600">
                    Adventure-filled tales that spark imagination
                  </p>
                </div>
                
                {/* Feature 3 */}
                <div className="bg-white rounded-xl p-5 text-center shadow-md">
                  <div className={`${getThemeClass("bg")} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-baloo)] text-xl font-semibold mb-2">
                    Immersive Reading
                  </h3>
                  <p className="text-gray-600">
                    Page-turning animations that feel like a real book
                  </p>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="mt-20 text-center text-gray-500">
            <p className="text-sm">
              Made with ❤️ for curious children everywhere
            </p>
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
            <button 
              onClick={() => setShowTemplates(false)}
              className="flex items-center text-gray-700 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Back to User Settings</span>
            </button>
            
            <h2 className={`font-[family-name:var(--font-baloo)] text-2xl ${getThemeClass("text")} font-bold`}>
              Mode Selection
            </h2>
            
            <div className="w-24"></div> {/* Empty div for balanced flex layout */}
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-6">
          {/* Visual Header */}
          <header className="text-center mb-10 animate-fadeIn">
            <h1 className={`font-[family-name:var(--font-baloo)] text-4xl md:text-5xl text-${getCurrentThemeColor()}-600 font-bold mb-3`}>
              Choose Your Adventure
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              How would you like to create your magical story today?
            </p>
            <div className={`w-24 h-1 bg-gradient-to-r ${getThemeClass("gradient")} rounded-full mt-3 mx-auto`}></div>
          </header>
          
          {/* Mode Selection - Visually Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl mx-auto">
            {/* Templates Option - Visual Card */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 duration-300 overflow-hidden animate-fadeIn">
              <div className={`h-3 w-full bg-gradient-to-r from-blue-500 to-blue-700`}></div>
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <span className="text-4xl">📚</span>
                  </div>
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
                  <div className="relative text-5xl">📚</div>
                </div>
                
                <button 
                  onClick={() => navigateWithProfile('/stories/templates')}
                  className={`w-full block text-center py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full font-[family-name:var(--font-baloo)] text-lg font-medium hover:opacity-90 transition-opacity shadow-md`}
                >
                  Browse Templates
                </button>
              </div>
            </div>

            {/* Custom Story Option - Visual Card */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 duration-300 overflow-hidden animate-fadeIn animation-delay-100">
              <div className={`h-3 w-full bg-gradient-to-r from-pink-500 to-orange-500`}></div>
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-pink-100 p-3 rounded-full mr-4">
                    <span className="text-4xl">✏️</span>
                  </div>
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
                  <div className="relative text-5xl">✏️</div>
                </div>
                
                <button 
                  onClick={() => navigateWithProfile('/stories/create')}
                  className={`w-full block text-center py-4 px-6 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full font-[family-name:var(--font-baloo)] text-lg font-medium hover:opacity-90 transition-opacity shadow-md`}
                >
                  Create Custom Story
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
