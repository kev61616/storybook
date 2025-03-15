/**
 * Utility functions for story storage
 * Currently using localStorage, designed to be easily migrated to Supabase later
 */

import { StoryData } from './api';

// Interface for saved story with metadata
export interface SavedStory extends StoryData {
  id: string;
  savedAt: string;
  favorite: boolean;
  readCount: number;
  lastReadAt: string | null;
}

// Interface for user preferences
export interface UserPreferences {
  readingMode: 'standard' | 'immersive';
  fontSize: 'small' | 'medium' | 'large';
  textToSpeech: boolean;
  darkMode: boolean;
  musicEnabled: boolean;
}

// Keys for localStorage
const STORAGE_KEYS = {
  STORIES: 'storybuddy_stories',
  PREFERENCES: 'storybuddy_preferences'
};

/**
 * Saves a story to localStorage
 * @param story - The story data to save
 * @returns The saved story with metadata
 */
export const saveStory = (story: StoryData): SavedStory => {
  // Generate a unique ID for the story
  const id = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create saved story with metadata
  const savedStory: SavedStory = {
    ...story,
    id,
    savedAt: new Date().toISOString(),
    favorite: false,
    readCount: 1,
    lastReadAt: new Date().toISOString()
  };
  
  // Get existing stories
  const existingStories = getSavedStories();
  
  // Add new story
  const updatedStories = [savedStory, ...existingStories];
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(updatedStories));
  
  return savedStory;
};

/**
 * Gets all saved stories from localStorage
 * @returns Array of saved stories
 */
export const getSavedStories = (): SavedStory[] => {
  try {
    const storiesJson = localStorage.getItem(STORAGE_KEYS.STORIES);
    return storiesJson ? JSON.parse(storiesJson) : [];
  } catch (error) {
    console.error('Error getting saved stories:', error);
    return [];
  }
};

/**
 * Gets a specific story by ID
 * @param id - The story ID to find
 * @returns The story if found, null otherwise
 */
export const getStoryById = (id: string): SavedStory | null => {
  const stories = getSavedStories();
  return stories.find(story => story.id === id) || null;
};

/**
 * Updates a saved story
 * @param updatedStory - The story with updated fields
 * @returns Boolean indicating success
 */
export const updateSavedStory = (updatedStory: SavedStory): boolean => {
  try {
    const stories = getSavedStories();
    const storyIndex = stories.findIndex(story => story.id === updatedStory.id);
    
    if (storyIndex === -1) {
      return false;
    }
    
    stories[storyIndex] = updatedStory;
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
    return true;
  } catch (error) {
    console.error('Error updating story:', error);
    return false;
  }
};

/**
 * Marks a story as read, updating its read count and lastReadAt
 * @param id - The story ID
 * @returns Boolean indicating success
 */
export const markStoryAsRead = (id: string): boolean => {
  const story = getStoryById(id);
  
  if (!story) {
    return false;
  }
  
  const updatedStory = {
    ...story,
    readCount: story.readCount + 1,
    lastReadAt: new Date().toISOString()
  };
  
  return updateSavedStory(updatedStory);
};

/**
 * Toggles the favorite status of a story
 * @param id - The story ID
 * @returns Boolean indicating success
 */
export const toggleFavoriteStory = (id: string): boolean => {
  const story = getStoryById(id);
  
  if (!story) {
    return false;
  }
  
  const updatedStory = {
    ...story,
    favorite: !story.favorite
  };
  
  return updateSavedStory(updatedStory);
};

/**
 * Deletes a story by ID
 * @param id - The story ID to delete
 * @returns Boolean indicating success
 */
export const deleteStory = (id: string): boolean => {
  try {
    const stories = getSavedStories();
    const filteredStories = stories.filter(story => story.id !== id);
    
    if (filteredStories.length === stories.length) {
      return false; // Story not found
    }
    
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(filteredStories));
    return true;
  } catch (error) {
    console.error('Error deleting story:', error);
    return false;
  }
};

/**
 * Gets the default user preferences
 * @returns Default user preferences
 */
export const getDefaultPreferences = (): UserPreferences => {
  return {
    readingMode: 'standard',
    fontSize: 'medium',
    textToSpeech: false,
    darkMode: false,
    musicEnabled: false
  };
};

/**
 * Gets the user preferences from localStorage
 * @returns User preferences
 */
export const getUserPreferences = (): UserPreferences => {
  try {
    const preferencesJson = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return preferencesJson ? JSON.parse(preferencesJson) : getDefaultPreferences();
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return getDefaultPreferences();
  }
};

/**
 * Saves user preferences to localStorage
 * @param preferences - The preferences to save
 */
export const saveUserPreferences = (preferences: UserPreferences): void => {
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
};
