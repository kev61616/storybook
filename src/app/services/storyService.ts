import { StoryData, StoryGenerationParams } from '../types';
import { createStoryPrompt, STORY_SYSTEM_PROMPT } from '../utils/prompts';
import { analyzeStoryContent, createContextAwareImagePrompt } from '../utils/prompts/storyAnalysis';

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
 * Format story data for display and enhance with better image prompts
 * @param storyData - Raw story data from API
 * @returns Formatted story data with narrative-aware image prompts
 */
export function formatStoryData(storyData: StoryData): StoryData {
  // Make sure we have valid story content
  if (!storyData.content || !Array.isArray(storyData.content)) {
    storyData.content = ['Once upon a time...'];
    return storyData;
  }
  
  // Make sure we have a title
  if (!storyData.title) {
    storyData.title = 'My Story';
  }
  
  // Generate narrative-aware image prompts if needed
  if ((!storyData.imagePrompts || storyData.imagePrompts.length === 0) && storyData.content.length > 0) {
    storyData.imagePrompts = generateNarrativeAwareImagePrompts(storyData);
  }
  
  return storyData;
}

/**
 * Generate narrative-aware image prompts for a story
 * @param storyData - The story data including content and key moments
 * @returns An array of image prompts for illustrations
 */
export function generateNarrativeAwareImagePrompts(storyData: StoryData): string[] {
  // If we already have key moments in the response, use those
  if (storyData.keyMoments && storyData.keyMoments.length > 0) {
    // Extract paragraph indices and descriptions
    const keyMoments = Array.isArray(storyData.keyMoments) ? storyData.keyMoments : [];
    
    // Sort key moments by paragraph index
    const sortedMoments = [...keyMoments].sort((a, b) => 
      (a.paragraphIndex || 0) - (b.paragraphIndex || 0)
    );
    
    // Generate better image prompts for each key moment
    return sortedMoments.map(moment => {
      const paraIndex = moment.paragraphIndex || 0;
      if (paraIndex >= 0 && paraIndex < storyData.content.length) {
        // Analyze story context
        const analysis = analyzeStoryContent(
          storyData.title,
          storyData.content,
          storyData.theme
        );
        
        // Create a context-aware prompt
        return createContextAwareImagePrompt(
          storyData.content[paraIndex],
          analysis,
          paraIndex
        );
      }
      
      // Fallback if paragraph index is invalid
      return moment.description || `Illustration for ${storyData.title}`;
    });
  }
  
  // Analyze the story and select optimal points for illustration
  const analysis = analyzeStoryContent(
    storyData.title,
    storyData.content,
    storyData.theme
  );
  
  // Use recommended paragraph indices for illustrations
  const recommendedParas = analysis.recommendedImageParagraphs;
  
  // Generate context-aware image prompts for each recommended paragraph
  return recommendedParas.map(paraIndex => 
    createContextAwareImagePrompt(
      storyData.content[paraIndex],
      analysis,
      paraIndex
    )
  );
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
