"use client";

import React from "react";
import Link from "next/link";
import Navigation from "../../components/Navigation";

/**
 * StoryTemplates page that displays popular story templates
 * Children can select a template to create a random story
 */
export default function StoryTemplates() {
  // Template categories with metadata for filtering
  const templateCategories = [
    {
      id: "adventure",
      title: "Adventure",
      description: "Exciting journeys to magical places!",
      color: "from-blue-500 to-blue-700", 
      bgColor: "bg-blue-50",
      emoji: "🏰",
      ageRange: "6-12",
      gender: "neutral",
      personality: ["adventurous", "brave", "curious"]
    },
    {
      id: "animals",
      title: "Animal Friends",
      description: "Stories about furry, feathery, and scaly friends!",
      color: "from-green-500 to-green-700",
      bgColor: "bg-green-50",
      emoji: "🐶",
      ageRange: "3-7",
      gender: "neutral",
      personality: ["kind", "friendly", "gentle"]
    },
    {
      id: "fantasy",
      title: "Magic & Fantasy",
      description: "Wizards, dragons, and magical powers!",
      color: "from-purple-500 to-purple-700",
      bgColor: "bg-purple-50",
      emoji: "✨",
      ageRange: "6-12",
      gender: "neutral",
      personality: ["creative", "imaginative", "dreamy"]
    },
    {
      id: "space",
      title: "Space Adventures",
      description: "Zoom through the stars and meet aliens!",
      color: "from-indigo-500 to-indigo-700",
      bgColor: "bg-indigo-50",
      emoji: "🚀",
      ageRange: "6-12",
      gender: "neutral",
      personality: ["adventurous", "curious", "brave"]
    },
    {
      id: "underwater",
      title: "Under the Sea",
      description: "Explore the ocean depths with sea creatures!",
      color: "from-cyan-500 to-cyan-700",
      bgColor: "bg-cyan-50",
      emoji: "🐠",
      ageRange: "3-8",
      gender: "neutral",
      personality: ["peaceful", "curious", "friendly"]
    },
    {
      id: "dinosaurs",
      title: "Dinosaur World",
      description: "Travel back to the time of giant dinosaurs!",
      color: "from-amber-500 to-amber-700",
      bgColor: "bg-amber-50",
      emoji: "🦕",
      ageRange: "4-10",
      gender: "neutral",
      personality: ["adventurous", "curious", "brave"]
    },
    {
      id: "cars",
      title: "Racing Cars",
      description: "Zoom around the track with super fast cars!",
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-50",
      emoji: "🏎️",
      ageRange: "4-10",
      gender: "neutral",
      personality: ["competitive", "energetic", "determined"]
    },
    {
      id: "pirates",
      title: "Pirate Adventures",
      description: "Sail the high seas looking for treasure!",
      color: "from-yellow-600 to-yellow-800",
      bgColor: "bg-yellow-50",
      emoji: "🏴‍☠️",
      ageRange: "5-12",
      gender: "neutral",
      personality: ["adventurous", "daring", "clever"]
    },
    {
      id: "superheroes",
      title: "Superhero Stories",
      description: "Save the day with amazing superpowers!",
      color: "from-blue-600 to-indigo-800",
      bgColor: "bg-blue-50",
      emoji: "🦸",
      ageRange: "5-12",
      gender: "neutral",
      personality: ["brave", "helpful", "strong"]
    },
    {
      id: "fairy",
      title: "Fairy Tales",
      description: "Magical stories with fairies and enchanted forests!",
      color: "from-pink-400 to-purple-400",
      bgColor: "bg-pink-50",
      emoji: "🧚",
      ageRange: "3-8",
      gender: "neutral",
      personality: ["imaginative", "gentle", "kind"]
    },
    {
      id: "robots",
      title: "Robot Friends",
      description: "Adventures with friendly robots and AI pals!",
      color: "from-gray-500 to-gray-700",
      bgColor: "bg-gray-50",
      emoji: "🤖",
      ageRange: "5-12",
      gender: "neutral",
      personality: ["logical", "helpful", "curious"]
    },
    {
      id: "sports",
      title: "Sports Stars",
      description: "Experience the thrill of sports competitions!",
      color: "from-green-600 to-blue-600",
      bgColor: "bg-green-50",
      emoji: "⚽",
      ageRange: "6-12",
      gender: "neutral",
      personality: ["determined", "teamwork", "energetic"]
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="font-[family-name:var(--font-baloo)] text-4xl md:text-5xl text-purple-600 font-bold mb-4">
            Choose a Story Template
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pick a magical template and we&apos;ll create a unique story just for you!
          </p>
        </header>

        {/* Visual Elements */}
        <div className="flex justify-center mb-12">
          <div className="relative flex items-center space-x-6">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              <span role="img" aria-label="book" className="text-3xl">📚</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
              <span role="img" aria-label="fantasy" className="text-3xl">✨</span>
            </div>
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span role="img" aria-label="adventure" className="text-3xl">🏰</span>
            </div>
            
            {/* Decorative line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 -z-10 transform -translate-y-1/2"></div>
          </div>
        </div>

        {/* Template Grid - Enhanced Visual Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {templateCategories.map((category) => (
            <div 
              key={category.id}
              className={`${category.bgColor} rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 duration-300 overflow-hidden group`}
            >
              <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
              <div className="p-6 relative">
                <div className="absolute top-4 right-4 text-4xl transform group-hover:scale-110 transition-transform" aria-hidden="true">
                  {category.emoji}
                </div>
                
                <h2 className="font-[family-name:var(--font-baloo)] text-2xl font-bold mb-2">
                  {category.title}
                </h2>
                
                <p className="text-gray-600 mb-6">
                  {category.description}
                </p>
                
                <Link 
                  href={`/stories/generate?template=${category.id}`}
                  className={`w-full block text-center py-3 px-4 bg-gradient-to-r ${category.color} text-white rounded-full font-[family-name:var(--font-baloo)] font-medium hover:opacity-90 transition-opacity shadow-md`}
                >
                  Create a {category.title} Story
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Story Option */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Want to create your own unique story instead?
          </p>
          <Link 
            href="/stories/create"
            className="inline-block py-3 px-6 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full font-[family-name:var(--font-baloo)] font-medium hover:opacity-90 transition-opacity"
          >
            Make My Own Story
          </Link>
        </div>
      </div>
    </div>
  );
}
