/**
 * Utility functions for API interactions
 */

/**
 * Generates a story using the OpenAI API
 * @param mode - Either 'template' or 'keywords'
 * @param template - Template theme (required when mode is 'template')
 * @param keywords - Keywords string (required when mode is 'keywords')
 * @returns The generated story data
 */
export async function generateStory(
  mode: 'template' | 'keywords',
  template?: string,
  keywords?: string
) {
  try {
    const response = await fetch('/api/generate-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode,
        template,
        keywords,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to generate story');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
}

/**
 * Generates an image using DALL-E based on a prompt
 * @param prompt - The description of the image to generate
 * @returns The URL of the generated image
 */
export async function generateImage(prompt: string) {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to generate image');
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

/**
 * Type definitions for story data
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
  pageCount?: 'few' | 'standard' | 'full';
  readingLevel?: 'simple' | 'standard' | 'advanced';
}
