/**
 * Type definitions for UI component props
 */

import { ReactNode } from 'react';
import { StoryData } from './story';

/**
 * Props for Page component used in the reader
 */
export interface PageProps {
  pageNumber: number;
  content?: string;
  imageUrl?: string;
  hasImage: boolean;
  isHighlighted?: boolean;
  theme?: string;
}

/**
 * Props for the EnhancedReader component
 */
export interface EnhancedReaderProps {
  story: StoryData;
  onClose: () => void;
  onSave?: (savedStory: SavedStory) => void;
}

/**
 * Props for the SpeechControls component
 */
export interface SpeechControlsProps {
  paragraphs: string[];
  onHighlight: (index: number) => void;
  className?: string;
  theme?: string;
}

/**
 * Interface for saved story with additional metadata
 */
export interface SavedStory extends StoryData {
  savedAt: number;
  isRead: boolean;
}

/**
 * Interface for the PageFlip instance
 */
export interface PageFlip {
  flipNext: () => void;
  flipPrev: () => void;
}

/**
 * Interface for flip events
 */
export interface FlipEvent {
  data: number; // Current page number
}

/**
 * Props for the Navigation component
 */
export interface NavigationProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Props for the TemplateCard component
 */
export interface TemplateCardProps {
  template: {
    id: string;
    title: string;
    description: string;
    emoji: string;
  };
  onClick: () => void;
  className?: string;
  isSelected?: boolean;
}

/**
 * Props for the StoryCard component 
 */
export interface StoryCardProps {
  story: SavedStory;
  onClick: () => void;
  onDelete?: () => void;
  className?: string;
}
