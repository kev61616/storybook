import { StoryData, SavedStory } from '../types';

/**
 * Key used to store saved stories in localStorage
 */
const SAVED_STORIES_KEY = 'storybuddy_saved_stories';

/**
 * Save a story to localStorage
 * @param story - The story data to save
 * @returns The saved story with metadata (savedAt, isRead)
 */
export function saveStory(story: StoryData): SavedStory {
  try {
    // Get existing saved stories
    const savedStories = getStoredStories();
    
    // Generate ID if it doesn't exist
    if (!story.id) {
      story.id = generateStoryId();
    }
    
    // Create SavedStory with metadata
    const savedStory: SavedStory = {
      ...story,
      savedAt: Date.now(),
      isRead: false
    };
    
    // Add or update story in the array
    const existingIndex = savedStories.findIndex(s => s.id === story.id);
    if (existingIndex >= 0) {
      savedStories[existingIndex] = savedStory;
    } else {
      savedStories.push(savedStory);
    }
    
    // Save back to localStorage
    localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(savedStories));
    
    return savedStory;
  } catch (error) {
    console.error('Error saving story:', error);
    throw error;
  }
}

/**
 * Get all stored stories from localStorage
 * @returns Array of saved story data
 */
export function getStoredStories(): SavedStory[] {
  try {
    // Return empty array if running server-side
    if (typeof window === 'undefined') {
      return [];
    }
    
    // Get saved stories from localStorage
    const savedStoriesJson = localStorage.getItem(SAVED_STORIES_KEY);
    if (!savedStoriesJson) {
      return [];
    }
    
    return JSON.parse(savedStoriesJson);
  } catch (error) {
    console.error('Error getting stored stories:', error);
    return [];
  }
}

/**
 * Delete a story from localStorage by ID
 * @param storyId - ID of the story to delete
 * @returns True if deletion was successful
 */
export function deleteStory(storyId: string): boolean {
  try {
    // Get existing saved stories
    const savedStories = getStoredStories();
    
    // Filter out the story to delete
    const filteredStories = savedStories.filter(story => story.id !== storyId);
    
    // If no change, story wasn't found
    if (filteredStories.length === savedStories.length) {
      return false;
    }
    
    // Save filtered stories back to localStorage
    localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(filteredStories));
    
    return true;
  } catch (error) {
    console.error('Error deleting story:', error);
    return false;
  }
}

/**
 * Get a specific stored story by ID
 * @param storyId - ID of the story to retrieve
 * @returns The story data or null if not found
 */
export function getStoryById(storyId: string): SavedStory | null {
  try {
    const savedStories = getStoredStories();
    const story = savedStories.find(s => s.id === storyId);
    return story || null;
  } catch (error) {
    console.error('Error getting story by ID:', error);
    return null;
  }
}

/**
 * Mark a story as read
 * @param storyId - ID of the story to mark as read
 * @returns Updated story or null if not found
 */
export function markStoryAsRead(storyId: string): SavedStory | null {
  try {
    // Get existing saved stories
    const savedStories = getStoredStories();
    
    // Find the story to update
    const storyIndex = savedStories.findIndex(story => story.id === storyId);
    if (storyIndex === -1) {
      return null;
    }
    
    // Update the isRead status
    savedStories[storyIndex].isRead = true;
    
    // Save back to localStorage
    localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(savedStories));
    
    return savedStories[storyIndex];
  } catch (error) {
    console.error('Error marking story as read:', error);
    return null;
  }
}

/**
 * Generate a unique ID for a story
 * @returns A unique string ID
 */
function generateStoryId(): string {
  // Simple UUID-like generation
  return 'story_' + 
    Date.now().toString(36) + 
    Math.random().toString(36).substring(2, 9);
}
