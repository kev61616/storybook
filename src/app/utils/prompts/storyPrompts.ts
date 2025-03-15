import { StoryGenerationParams } from '../../types';
// Removed unused import

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
  
  // Add visualization guidance to create better image prompts
  promptBase += `\n\nCreate a story with strong visual elements that can be illustrated effectively. Include:
  • Clear descriptions of how characters look and dress
  • Specific settings with visible features
  • Meaningful actions that can be depicted visually
  • Emotional moments with expressive faces or body language
  `;
  
  // Add formatting instructions
  const formattingInstructions = `
    
    The story should have a clear beginning (introduction), middle (challenge or adventure), and end (resolution).
    
    Return your response as a JSON object with this format:
    {
      "title": "The story title",
      "content": ["Paragraph 1", "Paragraph 2", "Paragraph 3", ...], 
      "theme": "${template}",
      "keyMoments": [
        { "paragraphIndex": 0, "description": "Description of a key visual moment in paragraph 1" },
        { "paragraphIndex": 3, "description": "Description of a key visual moment in paragraph 4" },
        { "paragraphIndex": 6, "description": "Description of a key visual moment in paragraph 7" },
        { "paragraphIndex": 9, "description": "Description of a key visual moment in paragraph 10" }
      ]
    }
    
    The content array should contain paragraphs, each being 1-2 sentences.
    
    For keyMoments, identify 4 important narrative moments that would make good illustrations. Choose moments that represent different parts of the story: introduction, development, climax, and resolution. These should be vivid and specific to help create attractive, child-friendly illustrations.`;
  
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
  
  // Add visualization guidance to create better image prompts
  promptBase += `\n\nCreate a story with strong visual elements that can be illustrated effectively. Include:
  • Clear descriptions of how characters look and dress
  • Specific settings with visible features
  • Meaningful actions that can be depicted visually
  • Emotional moments with expressive faces or body language
  `;
  
  // Add formatting instructions
  const formattingInstructions = `
    
    The story should have a clear beginning (introduction), middle (challenge or adventure), and end (resolution).
    
    Return your response as a JSON object with this format:
    {
      "title": "The story title",
      "content": ["Paragraph 1", "Paragraph 2", "Paragraph 3", ...],
      "keywords": ["keyword1", "keyword2", ...],
      "keyMoments": [
        { "paragraphIndex": 0, "description": "Description of a key visual moment in paragraph 1" },
        { "paragraphIndex": 3, "description": "Description of a key visual moment in paragraph 4" },
        { "paragraphIndex": 6, "description": "Description of a key visual moment in paragraph 7" },
        { "paragraphIndex": 9, "description": "Description of a key visual moment in paragraph 10" }
      ]
    }
    
    The keywords array should contain the keywords you used from the provided list.
    The content array should contain paragraphs, each being 1-2 sentences.
    
    For keyMoments, identify 4 important narrative moments that would make good illustrations. Choose moments that represent different parts of the story: introduction, development, climax, and resolution. These should be vivid and specific to help create attractive, child-friendly illustrations.`;
  
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
