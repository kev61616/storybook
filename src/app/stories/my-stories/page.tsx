"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navigation from '../../components/Navigation';
import ImmersiveReader from '../../components/ImmersiveReader';
import { getSavedStories, toggleFavoriteStory, deleteStory, SavedStory } from '../../utils/storage';

export default function MyStories() {
  const [stories, setStories] = useState<SavedStory[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStory, setSelectedStory] = useState<SavedStory | null>(null);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  
  // Load saved stories
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadStories = () => {
        const savedStories = getSavedStories();
        setStories(savedStories);
      };
      
      loadStories();
      
      // Also set up a listener to reload stories if localStorage changes in another tab
      window.addEventListener('storage', loadStories);
      
      return () => {
        window.removeEventListener('storage', loadStories);
      };
    }
  }, []);
  
  // Filter and search stories
  const filteredStories = stories.filter(story => {
    // First apply favorite filter
    if (activeFilter === 'favorites' && !story.favorite) {
      return false;
    }
    
    // Then apply search filter if there's a search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return (
        story.title.toLowerCase().includes(query) ||
        (story.keywords && story.keywords.some(keyword => 
          keyword.toLowerCase().includes(query)
        ))
      );
    }
    
    return true;
  });
  
  // Handle toggling a story as favorite
  const handleToggleFavorite = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (toggleFavoriteStory(id)) {
      setStories(getSavedStories());
    }
  };
  
  // Handle deleting a story
  const handleDeleteStory = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (window.confirm('Are you sure you want to delete this story? This cannot be undone.')) {
      if (deleteStory(id)) {
        setStories(getSavedStories());
      }
    }
  };
  
  // Handle opening a story
  const handleOpenStory = (story: SavedStory) => {
    setSelectedStory(story);
    setIsImmersiveMode(true);
  };
  
  // Handle closing immersive reader
  const handleCloseReader = () => {
    setIsImmersiveMode(false);
  };

  // Get a formatted date string
  const getFormattedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };
  
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Immersive reader (conditionally rendered) */}
      {isImmersiveMode && selectedStory && (
        <ImmersiveReader
          story={selectedStory}
          onClose={handleCloseReader}
        />
      )}
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-baloo)] text-4xl md:text-5xl text-purple-600 font-bold mb-4">
            My Stories
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Your collection of magical adventures
          </p>
          
          {/* Filters and search */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-4">
            <div className="flex rounded-full bg-gray-100 p-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-full text-sm ${
                  activeFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Stories
              </button>
              <button
                onClick={() => setActiveFilter('favorites')}
                className={`px-4 py-2 rounded-full text-sm ${
                  activeFilter === 'favorites'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Favorites
              </button>
            </div>
            
            <div className="relative max-w-md w-full">
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Create new story button */}
          <Link
            href="/stories/templates"
            className="inline-block py-3 px-6 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full font-[family-name:var(--font-baloo)] font-medium hover:opacity-90 transition-opacity mt-2"
          >
            Create a New Story
          </Link>
        </header>
        
        {/* Stories grid */}
        {stories.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl max-w-2xl mx-auto">
            <div className="text-7xl mb-4">📚</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No stories yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first story to see it here!
            </p>
            <Link
              href="/stories/templates"
              className="py-2 px-6 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              Create a Story
            </Link>
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl max-w-2xl mx-auto">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No matching stories</h2>
            <p className="text-gray-600 mb-4">
              Try a different search term or filter
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="py-2 px-4 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredStories.map((story) => (
              <motion.div
                key={story.id}
                whileHover={{ y: -5, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)' }}
                className="bg-white rounded-xl overflow-hidden shadow-md cursor-pointer relative"
                onClick={() => handleOpenStory(story)}
              >
                {/* Cover image */}
                <div className="relative h-48 bg-purple-100">
                  {story.images && story.images[0] ? (
                    <Image
                      src={story.images[0]}
                      alt={story.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 384px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-6xl">
                      📖
                    </div>
                  )}
                </div>
                
                {/* Story info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-[family-name:var(--font-baloo)] text-xl font-bold text-gray-800 line-clamp-1">
                      {story.title}
                    </h3>
                    <button
                      onClick={(e) => handleToggleFavorite(story.id, e)}
                      className={`p-1 rounded-full transition-colors ${
                        story.favorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill={story.favorite ? 'currentColor' : 'none'}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={story.favorite ? 0 : 2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Keywords */}
                  {story.keywords && story.keywords.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {story.keywords.slice(0, 3).map((keyword, idx) => (
                        <span key={idx} className="inline-block px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                          {keyword}
                        </span>
                      ))}
                      {story.keywords.length > 3 && (
                        <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          +{story.keywords.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Details row */}
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <div>Created: {getFormattedDate(story.savedAt)}</div>
                    <div>Read {story.readCount} times</div>
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-4 flex justify-between items-center">
                    <button
                      onClick={() => handleOpenStory(story)}
                      className="py-1.5 px-4 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700 transition-colors"
                    >
                      Read
                    </button>
                    <button
                      onClick={(e) => handleDeleteStory(story.id, e)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Delete story"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
