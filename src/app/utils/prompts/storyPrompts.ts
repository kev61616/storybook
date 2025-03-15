import { StoryGenerationParams } from '../../types';

/**
 * Base system prompt for story generation
 */
export const STORY_SYSTEM_PROMPT = 
  "You are a creative children's storywriter. You write engaging, age-appropriate stories for children ages 4-10. Your stories are imaginative, positive, and teach good values. Your tone is warm and friendly.";

/**
 * Generates a template-based story prompt
 * @param template - The story template/theme
 * @param options - Additional options including storyLength and readingLevel
 * @returns Formatted prompt string
 */
export function generateTemplatePrompt(template: string, options?: { 
  storyLength?: 'short' | 'medium' | 'long',
  readingLevel?: 'easy' | 'moderate' | 'advanced'
}): string {
  let promptBase = `Create a children's story based on the theme: "${template}".`;
  
  // Add optional parameters if provided
  if (options) {
    if (options.storyLength) {
      const lengthMap = {
        'short': '4-6 paragraphs, perfect for a 2-3 minute read',
        'medium': '8-10 paragraphs, perfect for a 4-6 minute read',
        'long': '10-12 paragraphs, perfect for a 7-10 minute read'
      };
      promptBase += `\n\nThe story should be ${lengthMap[options.storyLength]}.`;
    }
    
    if (options.readingLevel) {
      const readingLevelMap = {
        'easy': 'Use simple vocabulary with short sentences suitable for very young readers (ages 4-6). Avoid complex words.',
        'moderate': 'Use grade-appropriate vocabulary for children ages 7-8 with a mix of simple and moderately complex sentences.',
        'advanced': 'Use rich vocabulary appropriate for confident readers (ages 9-10) with some challenging words and varied sentence structures.'
      };
      promptBase += `\n\n${readingLevelMap[options.readingLevel]}`;
    }
  }
  
  // Add formatting instructions
  const formattingInstructions = `
    
    The story should have a beginning, middle, and end.
    
    Return your response as a JSON object with this format:
    {
      "title": "The story title",
      "content": ["Paragraph 1", "Paragraph 2", "Paragraph 3", ...], 
      "theme": "${template}",
      "imagePrompts": ["A descriptive prompt for an illustration that matches paragraph 1", "A descriptive prompt for an illustration that matches paragraph 4", "A descriptive prompt for an illustration that matches paragraph 7", "A descriptive prompt for an illustration that matches paragraph 10"]
    }
    
    The content array should contain paragraphs, each being 1-2 sentences.
    
    For imagePrompts, create 4 descriptive prompts that would work well for generating illustrations that match specific paragraphs in your story. These should be vivid and specific.`;
  
  return promptBase + formattingInstructions;
}

/**
 * Generates a keyword-based story prompt
 * @param keywords - Keywords to include in the story
 * @param options - Additional options including storyLength and readingLevel
 * @returns Formatted prompt string
 */
export function generateKeywordsPrompt(keywords: string, options?: { 
  storyLength?: 'short' | 'medium' | 'long',
  readingLevel?: 'easy' | 'moderate' | 'advanced'
}): string {
  let promptBase = `Create a children's story using these keywords: ${keywords}.`;
  
  // Add optional parameters if provided
  if (options) {
    if (options.storyLength) {
      const lengthMap = {
        'short': '4-6 paragraphs, perfect for a 2-3 minute read',
        'medium': '8-10 paragraphs, perfect for a 4-6 minute read',
        'long': '10-12 paragraphs, perfect for a 7-10 minute read'
      };
      promptBase += `\n\nThe story should be ${lengthMap[options.storyLength]}.`;
    }
    
    if (options.readingLevel) {
      const readingLevelMap = {
        'easy': 'Use simple vocabulary with short sentences suitable for very young readers (ages 4-6). Avoid complex words.',
        'moderate': 'Use grade-appropriate vocabulary for children ages 7-8 with a mix of simple and moderately complex sentences.',
        'advanced': 'Use rich vocabulary appropriate for confident readers (ages 9-10) with some challenging words and varied sentence structures.'
      };
      promptBase += `\n\n${readingLevelMap[options.readingLevel]}`;
    }
  }
  
  // Add formatting instructions
  const formattingInstructions = `
    
    The story should have a beginning, middle, and end.
    
    Return your response as a JSON object with this format:
    {
      "title": "The story title",
      "content": ["Paragraph 1", "Paragraph 2", "Paragraph 3", ...],
      "keywords": ["keyword1", "keyword2", ...],
      "imagePrompts": ["A descriptive prompt for an illustration that matches paragraph 1", "A descriptive prompt for an illustration that matches paragraph 4", "A descriptive prompt for an illustration that matches paragraph 7", "A descriptive prompt for an illustration that matches paragraph 10"]
    }
    
    The keywords array should contain the keywords you used from the provided list.
    The content array should contain paragraphs, each being 1-2 sentences.
    
    For imagePrompts, create 4 descriptive prompts that would work well for generating illustrations that match specific paragraphs in your story. These should be vivid and specific.`;
  
  return promptBase + formattingInstructions;
}

/**
 * Creates a story generation prompt based on parameters
 * @param params - Story generation parameters
 * @returns Appropriate prompt for story generation
 */
export function createStoryPrompt(params: StoryGenerationParams): string {
  const { mode, template, keywords, options } = params;
  
  if (mode === 'template' && template) {
    return generateTemplatePrompt(template, options);
  } else if (mode === 'keywords' && keywords) {
    return generateKeywordsPrompt(keywords, options);
  }
  
  throw new Error('Invalid story generation parameters');
}
