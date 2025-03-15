"use client";

import React, { useState } from "react";
import Navigation from "../../components/Navigation";
import { useRouter } from "next/navigation";

/**
 * Create Story page that allows children to input keywords
 * to generate a custom story with illustrations
 */
export default function CreateStory() {
  // State for story creation inputs and validation
  const [keywords, setKeywords] = useState("");
  const [storySettings, setStorySettings] = useState({
    ageRange: "6-12", // Default to middle age range
    gender: "neutral", // Default to gender neutral
    personality: "curious" // Default personality
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Keywords suggestions for inspiration
  const keywordSuggestions = [
    "dragon", "princess", "pirate", "astronaut", 
    "robot", "mermaid", "unicorn", "dinosaur",
    "castle", "treasure", "superhero", "magic",
    "forest", "monster", "spaceship", "fairy",
    "car", "race", "alien", "adventure"
  ];
  
  // Available personalities for the filter
  const personalityTypes = [
    "adventurous", "brave", "curious", "kind", "friendly", 
    "gentle", "creative", "imaginative", "peaceful", 
    "competitive", "energetic", "determined", "clever", 
    "helpful", "strong", "logical"
  ];

  const router = useRouter();

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!keywords.trim()) {
      setError("Please enter at least one keyword");
      return;
    }
    
    setError("");
    setIsSubmitting(true);
    
    // Navigate to display page where story generation will happen with settings
    const queryParams = new URLSearchParams({
      keywords: keywords,
      ageRange: storySettings.ageRange,
      gender: storySettings.gender,
      personality: storySettings.personality
    });
    
    router.push(`/stories/display?${queryParams.toString()}`);
  };

  // Add a keyword suggestion to the input
  const addKeyword = (keyword: string) => {
    const currentKeywords = keywords.trim();
    
    if (currentKeywords === "") {
      setKeywords(keyword);
    } else if (!currentKeywords.split(",").map(k => k.trim()).includes(keyword)) {
      setKeywords(`${currentKeywords}, ${keyword}`);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="font-[family-name:var(--font-baloo)] text-4xl md:text-5xl text-purple-600 font-bold mb-4">
            Create Your Own Story
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter some keywords to create a unique story about anything you can imagine!
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label 
                htmlFor="keywords" 
                className="block font-[family-name:var(--font-baloo)] text-xl font-semibold mb-2 text-purple-600"
              >
                What should your story be about?
              </label>
              <p className="text-gray-600 mb-3 text-sm">
                Enter words like &quot;dragon&quot;, &quot;space&quot;, or &quot;underwater adventure&quot;
              </p>
              <input
                type="text"
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Enter your story ideas here..."
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-gray-700"
                aria-describedby="keywordsHelp"
              />
              {error && (
                <p className="mt-2 text-red-500">{error}</p>
              )}
            </div>

            {/* Keyword suggestions */}
            <div className="mb-6">
              <p className="font-[family-name:var(--font-baloo)] font-medium mb-2 text-gray-700">
                Need ideas? Try these:
              </p>
              <div className="flex flex-wrap gap-2">
                {keywordSuggestions.slice(0, 10).map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => addKeyword(keyword)}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
              {isSettingsOpen ? null : (
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="mt-6 text-center text-purple-600 hover:text-purple-800 transition-colors font-medium underline-offset-2 underline flex items-center mx-auto"
                >
                  <span>Show More Options</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Advanced Settings */}
            {isSettingsOpen && (
              <div className="mb-8 bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-[family-name:var(--font-baloo)] text-lg font-semibold text-purple-600">
                    Customize Your Story
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close advanced settings"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Age Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Character Age
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      value={storySettings.ageRange}
                      onChange={(e) => setStorySettings({...storySettings, ageRange: e.target.value})}
                    >
                      <option value="3-7">Young Child (3-7)</option>
                      <option value="6-12">Older Child (6-12)</option>
                      <option value="teenager">Teenager</option>
                      <option value="adult">Adult</option>
                      <option value="varied">Varied Ages</option>
                    </select>
                  </div>
                  
                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Character Gender
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      value={storySettings.gender}
                      onChange={(e) => setStorySettings({...storySettings, gender: e.target.value})}
                    >
                      <option value="boy">Boy</option>
                      <option value="girl">Girl</option>
                      <option value="neutral">Gender Neutral</option>
                    </select>
                  </div>
                  
                  {/* Personality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Character Personality
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      value={storySettings.personality}
                      onChange={(e) => setStorySettings({...storySettings, personality: e.target.value})}
                    >
                      {personalityTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* More keyword suggestions in advanced settings */}
                <div className="mt-4">
                  <p className="font-[family-name:var(--font-baloo)] font-medium mb-2 text-gray-700 text-sm">
                    More keyword ideas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {keywordSuggestions.slice(10).map((keyword) => (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => addKeyword(keyword)}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-full font-[family-name:var(--font-baloo)] font-medium hover:opacity-90 transition-opacity disabled:opacity-70 flex justify-center items-center"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                  Creating Your Story...
                </>
              ) : (
                "Create My Story!"
              )}
            </button>
          </form>

          {/* Illustration */}
          <div className="mt-10 text-center">
            <div className="inline-block p-6 bg-yellow-50 rounded-full">
              <div className="text-7xl">
                ✏️
                <span className="ml-4">🖌️</span>
              </div>
            </div>
            <p className="mt-4 text-gray-600 italic">
              Your story will include beautiful illustrations!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
