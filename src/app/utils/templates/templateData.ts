import { StoryTheme } from '../../types';

/**
 * Story template categories with their IDs and display information
 */
export interface StoryTemplate {
  id: string;           // Template identifier
  title: string;        // Display title
  emoji: string;        // Emoji for visual representation
  description: string;  // Short description of the template
  ageRanges: string[];  // Suitable age ranges
}

/**
 * All available story templates
 */
export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'adventure',
    title: 'Adventure',
    emoji: '🏰',
    description: 'Exciting journeys filled with exploration and discovery',
    ageRanges: ['3-5', '6-8', '9-12']
  },
  {
    id: 'animals',
    title: 'Animal Friends',
    emoji: '🐶',
    description: 'Heartwarming stories featuring lovable animal characters',
    ageRanges: ['3-5', '6-8', '9-12']
  },
  {
    id: 'fantasy',
    title: 'Magic & Fantasy',
    emoji: '✨',
    description: 'Enchanted worlds filled with magic and wonder',
    ageRanges: ['3-5', '6-8', '9-12']
  },
  {
    id: 'space',
    title: 'Space Adventures',
    emoji: '🚀',
    description: 'Intergalactic journeys exploring the cosmos',
    ageRanges: ['6-8', '9-12']
  },
  {
    id: 'underwater',
    title: 'Under the Sea',
    emoji: '🐠',
    description: 'Explore the magical world beneath the waves',
    ageRanges: ['3-5', '6-8', '9-12']
  },
  {
    id: 'dinosaurs',
    title: 'Dinosaur World',
    emoji: '🦕',
    description: 'Travel back in time to the age of dinosaurs',
    ageRanges: ['3-5', '6-8', '9-12']
  },
  {
    id: 'cars',
    title: 'Racing Cars',
    emoji: '🏎️',
    description: 'Fast-paced stories about cars and racing',
    ageRanges: ['3-5', '6-8']
  },
  {
    id: 'pirates',
    title: 'Pirate Adventures',
    emoji: '🏴‍☠️',
    description: 'Sail the high seas with treasure and adventure',
    ageRanges: ['6-8', '9-12']
  },
  {
    id: 'superheroes',
    title: 'Superhero',
    emoji: '🦸',
    description: 'Stories of brave heroes with amazing powers',
    ageRanges: ['6-8', '9-12']
  },
  {
    id: 'fairy',
    title: 'Fairy Tale',
    emoji: '🧚',
    description: 'Classic fairy tales with a modern twist',
    ageRanges: ['3-5', '6-8']
  },
  {
    id: 'robots',
    title: 'Robot Friends',
    emoji: '🤖',
    description: 'Futuristic tales with friendly robot companions',
    ageRanges: ['6-8', '9-12']
  },
  {
    id: 'sports',
    title: 'Sports Star',
    emoji: '⚽',
    description: 'Inspiring stories about sports and teamwork',
    ageRanges: ['6-8', '9-12']
  }
];

/**
 * Map of template theme colors for UI consistency
 */
export const TEMPLATE_THEME_COLORS: Record<string, StoryTheme> = {
  'adventure': {
    id: 'adventure',
    title: 'Adventure',
    emoji: '🏰',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    accent: 'from-yellow-500 to-yellow-700'
  },
  'animals': {
    id: 'animals',
    title: 'Animal Friends',
    emoji: '🐶',
    bg: 'bg-green-50',
    text: 'text-green-700',
    accent: 'from-green-500 to-green-700'
  },
  'fantasy': {
    id: 'fantasy',
    title: 'Magic & Fantasy',
    emoji: '✨',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    accent: 'from-purple-500 to-purple-700'
  },
  'space': {
    id: 'space',
    title: 'Space Adventures',
    emoji: '🚀',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    accent: 'from-indigo-500 to-indigo-700'
  },
  'underwater': {
    id: 'underwater',
    title: 'Under the Sea',
    emoji: '🐠',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    accent: 'from-cyan-500 to-cyan-700'
  },
  'dinosaurs': {
    id: 'dinosaurs',
    title: 'Dinosaur World',
    emoji: '🦕',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    accent: 'from-amber-500 to-amber-700'
  },
  'cars': {
    id: 'cars',
    title: 'Racing Cars',
    emoji: '🏎️',
    bg: 'bg-red-50',
    text: 'text-red-700',
    accent: 'from-red-500 to-red-700'
  },
  'pirates': {
    id: 'pirates',
    title: 'Pirate Adventures',
    emoji: '🏴‍☠️',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    accent: 'from-blue-500 to-blue-700'
  },
  'superheroes': {
    id: 'superheroes',
    title: 'Superhero',
    emoji: '🦸',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    accent: 'from-emerald-500 to-emerald-700'
  },
  'fairy': {
    id: 'fairy',
    title: 'Fairy Tale',
    emoji: '🧚',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    accent: 'from-pink-500 to-pink-700'
  },
  'robots': {
    id: 'robots',
    title: 'Robot Friends',
    emoji: '🤖',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    accent: 'from-slate-500 to-slate-700'
  },
  'sports': {
    id: 'sports',
    title: 'Sports Star',
    emoji: '⚽',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    accent: 'from-orange-500 to-orange-700'
  },
  // Default theme as fallback
  'default': {
    id: 'default',
    title: 'Story',
    emoji: '📚',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    accent: 'from-blue-500 to-blue-700'
  }
};
