/**
 * Type definitions for story data
 */

/**
 * Represents a complete story with its content and metadata
 */
export interface StoryData {
  id?: string;        // Only exists on saved stories
  title: string;
  content: string[];
  theme?: string;
  keywords?: string[];
  imagePrompts?: string[];
  images?: string[]; // URLs of generated images
  storyLength?: 'short' | 'medium' | 'long';
  readingLevel?: 'easy' | 'moderate' | 'advanced';
}

/**
 * Valid story generation modes
 */
export type StoryMode = 'template' | 'keywords';

/**
 * Story length options
 */
export type StoryLength = 'short' | 'medium' | 'long';

/**
 * Reading level options
 */
export type ReadingLevel = 'easy' | 'moderate' | 'advanced';

/**
 * Story generation parameters
 */
export interface StoryGenerationParams {
  mode: StoryMode;
  template?: string;
  keywords?: string;
  options?: {
    storyLength?: StoryLength;
    readingLevel?: ReadingLevel;
  };
}

/**
 * Story theme details
 */
export interface StoryTheme {
  id: string;
  title: string;
  emoji: string;
  bg: string;
  text: string;
  accent: string;
}
