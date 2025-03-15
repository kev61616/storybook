import { StoryData, StoryGenerationParams } from '../types';
import { createStoryPrompt, STORY_SYSTEM_PROMPT } from '../utils/prompts';

/**
 * Generate a story using the OpenAI API
 * @param params - Story generation parameters including mode, template/keywords, and options
 * @returns The generated story data
 */
export async function generateStory(params: StoryGenerationParams): Promise<StoryData> {
  try {
    // Create the appropriate prompt based on parameters
    const prompt = createStoryPrompt(params);
    
    const response = await fetch('/api/generate-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: params.mode,
        template: params.template,
        keywords: params.keywords,
        systemPrompt: STORY_SYSTEM_PROMPT,
        prompt: prompt
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
 * Format story data for display
 * @param storyData - Raw story data from API
 * @returns Formatted story data
 */
export function formatStoryData(storyData: StoryData): StoryData {
  // Make sure we have valid story content
  if (!storyData.content || !Array.isArray(storyData.content)) {
    storyData.content = ['Once upon a time...'];
  }
  
  // Make sure we have a title
  if (!storyData.title) {
    storyData.title = 'My Story';
  }
  
  return storyData;
}

/**
 * Generate a story using the legacy API format (for backward compatibility)
 * @param mode - Either 'template' or 'keywords'
 * @param template - Template theme (required when mode is 'template')
 * @param keywords - Keywords string (required when mode is 'keywords')
 * @returns The generated story data
 */
export async function legacyGenerateStory(
  mode: 'template' | 'keywords',
  template?: string,
  keywords?: string
): Promise<StoryData> {
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
