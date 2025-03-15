/**
 * storyPromptTemplates.ts
 * 
 * Token-optimized prompt templates for story generation
 * Uses PromptManager to construct efficient, modular prompts
 */

import { PromptComponent, PromptManager } from './PromptManager';
import { StoryGenerationParams, StoryLength, ReadingLevel } from '../../types/story';

/**
 * System prompt component for story generation
 */
const STORY_SYSTEM_PROMPT: PromptComponent = {
  id: 'story_system',
  type: 'system',
  content: "You are a creative children's storywriter. You write engaging, age-appropriate stories for children ages 4-10. Your stories are imaginative, positive, and teach good values. Your tone is warm and friendly.",
  required: true,
  priority: 10
};

/**
 * Reading level instructions by level type
 */
const READING_LEVEL_INSTRUCTIONS: Record<ReadingLevel, string> = {
  'easy': 'Use simple vocabulary with short sentences suitable for very young readers (ages 4-6). Avoid complex words.',
  'moderate': 'Use grade-appropriate vocabulary for children ages 7-8 with a mix of simple and moderately complex sentences.',
  'advanced': 'Use rich vocabulary appropriate for confident readers (ages 9-10) with some challenging words and varied sentence structures.'
};

/**
 * Story length instructions by length type
 */
const STORY_LENGTH_INSTRUCTIONS: Record<StoryLength, string> = {
  'short': '4-6 paragraphs, perfect for a 2-3 minute read',
  'medium': '8-10 paragraphs, perfect for a 4-6 minute read',
  'long': '10-12 paragraphs, perfect for a 7-10 minute read'
};

/**
 * Visualization guidance for story generation
 */
const VISUALIZATION_GUIDANCE = `Create a story with strong visual elements that can be illustrated effectively. Include:
• Character appearance: Specific details about how characters look, dress, and move
• Settings: Vivid descriptions of locations with distinctive visual features
• Action scenes: Dynamic moments that show character movement and interaction
• Emotional expressions: Clear facial expressions and body language that convey feelings
• Visual progression: Scene changes that show the journey through different environments`;

/**
 * Narrative guidance for better story structure
 */
const NARRATIVE_GUIDANCE = `Structure your story with a clear narrative arc:
• Beginning: Introduce main character(s) and establish the setting
• Challenge: Present a problem, quest, or challenge to overcome
• Journey: Take the character(s) through a sequence of events or discoveries
• Climax: Create a meaningful high point where the main challenge is addressed
• Resolution: Conclude with growth, learning, or positive change
• Emotional arc: Show how characters' feelings evolve through the story`;

/**
 * Key moments guidance for better illustrations
 */
const KEY_MOMENTS_GUIDANCE = `For keyMoments, identify 4 important narrative moments that would make exceptional illustrations:
• Introduction: A moment that establishes character appearance and setting (paragraphIndex: early)
• Development: A moment showing character interaction or problem discovery (paragraphIndex: 1/3 into story)
• Climax: The most visually impactful moment in the story (paragraphIndex: 2/3 into story)
• Resolution: A satisfying final image that captures the story's conclusion (paragraphIndex: near end)

Each description should be detailed enough to create a compelling, child-friendly illustration that captures the essence of that story moment.`;

/**
 * Output formatting instructions for template-based stories
 */
const TEMPLATE_FORMAT_INSTRUCTIONS = `Return your response as a JSON object with this format:
{
  "title": "The story title",
  "content": ["Paragraph 1", "Paragraph 2", "Paragraph 3", ...], 
  "theme": "{{theme}}",
  "keyMoments": [
    { "paragraphIndex": 0, "description": "Description of a key visual moment in paragraph 1", "emotionalTone": "joyful/scared/curious/etc" },
    { "paragraphIndex": 3, "description": "Description of a key visual moment in paragraph 4", "emotionalTone": "joyful/scared/curious/etc" },
    { "paragraphIndex": 6, "description": "Description of a key visual moment in paragraph 7", "emotionalTone": "joyful/scared/curious/etc" },
    { "paragraphIndex": 9, "description": "Description of a key visual moment in paragraph 10", "emotionalTone": "joyful/scared/curious/etc" }
  ]
}

The content array should contain paragraphs, each being 1-3 sentences that form a complete thought or scene.`;

/**
 * Output formatting instructions for keyword-based stories
 */
const KEYWORDS_FORMAT_INSTRUCTIONS = `Return your response as a JSON object with this format:
{
  "title": "The story title",
  "content": ["Paragraph 1", "Paragraph 2", "Paragraph 3", ...],
  "keywords": ["keyword1", "keyword2", ...],
  "keyMoments": [
    { "paragraphIndex": 0, "description": "Description of a key visual moment in paragraph 1", "emotionalTone": "joyful/scared/curious/etc" },
    { "paragraphIndex": 3, "description": "Description of a key visual moment in paragraph 4", "emotionalTone": "joyful/scared/curious/etc" },
    { "paragraphIndex": 6, "description": "Description of a key visual moment in paragraph 7", "emotionalTone": "joyful/scared/curious/etc" },
    { "paragraphIndex": 9, "description": "Description of a key visual moment in paragraph 10", "emotionalTone": "joyful/scared/curious/etc" }
  ]
}

The keywords array should contain the specific keywords you used from the provided list.
The content array should contain paragraphs, each being 1-3 sentences that form a complete thought or scene.`;

/**
 * Generate a template-based story prompt
 * Using token-aware PromptManager
 */
export function createTemplateStoryPrompt(
  template: string, 
  options?: { 
    storyLength?: StoryLength;
    readingLevel?: ReadingLevel;
  }
): PromptManager {
  // Create prompt manager with gpt-4o model
  const promptManager = new PromptManager('gpt-4o');
  
  // Always add system prompt
  promptManager.addComponent(STORY_SYSTEM_PROMPT);
  
  // Add main instruction based on template
  promptManager.addComponent({
    id: 'story_instruction',
    type: 'instruction',
    content: `Create a children's story based on the theme: "${template}".`,
    required: true,
    priority: 9
  });
  
  // Add reading level instructions if specified
  if (options?.readingLevel) {
    promptManager.addComponent({
      id: 'reading_level',
      type: 'instruction',
      content: READING_LEVEL_INSTRUCTIONS[options.readingLevel],
      priority: 8
    });
  }
  
  // Add story length instructions if specified
  if (options?.storyLength) {
    promptManager.addComponent({
      id: 'story_length',
      type: 'instruction',
      content: `The story should be ${STORY_LENGTH_INSTRUCTIONS[options.storyLength]}.`,
      priority: 7
    });
  }
  
  // Add visualization guidance
  promptManager.addComponent({
    id: 'visualization',
    type: 'instruction',
    content: VISUALIZATION_GUIDANCE,
    priority: 6
  });
  
  // Add narrative guidance
  promptManager.addComponent({
    id: 'narrative_guidance',
    type: 'instruction',
    content: NARRATIVE_GUIDANCE,
    priority: 6
  });
  
  // Add key moments guidance
  promptManager.addComponent({
    id: 'key_moments_guidance',
    type: 'instruction',
    content: KEY_MOMENTS_GUIDANCE,
    priority: 5
  });
  
  // Add output format instructions
  promptManager.addComponent({
    id: 'format_instructions',
    type: 'formatting',
    content: TEMPLATE_FORMAT_INSTRUCTIONS,
    required: true,
    priority: 4
  });
  
  // Set template variable for theme
  promptManager.setTemplateVariable('theme', template);
  
  return promptManager;
}

/**
 * Generate a keywords-based story prompt
 * Using token-aware PromptManager
 */
export function createKeywordsStoryPrompt(
  keywords: string,
  options?: { 
    storyLength?: StoryLength;
    readingLevel?: ReadingLevel;
  }
): PromptManager {
  // Create prompt manager with gpt-4o model
  const promptManager = new PromptManager('gpt-4o');
  
  // Always add system prompt
  promptManager.addComponent(STORY_SYSTEM_PROMPT);
  
  // Add main instruction based on keywords
  promptManager.addComponent({
    id: 'story_instruction',
    type: 'instruction',
    content: `Create a children's story using these keywords: ${keywords}.`,
    required: true,
    priority: 9
  });
  
  // Add reading level instructions if specified
  if (options?.readingLevel) {
    promptManager.addComponent({
      id: 'reading_level',
      type: 'instruction',
      content: READING_LEVEL_INSTRUCTIONS[options.readingLevel],
      priority: 8
    });
  }
  
  // Add story length instructions if specified
  if (options?.storyLength) {
    promptManager.addComponent({
      id: 'story_length',
      type: 'instruction',
      content: `The story should be ${STORY_LENGTH_INSTRUCTIONS[options.storyLength]}.`,
      priority: 7
    });
  }
  
  // Add visualization guidance
  promptManager.addComponent({
    id: 'visualization',
    type: 'instruction',
    content: VISUALIZATION_GUIDANCE,
    priority: 6
  });
  
  // Add narrative guidance
  promptManager.addComponent({
    id: 'narrative_guidance',
    type: 'instruction',
    content: NARRATIVE_GUIDANCE,
    priority: 6
  });
  
  // Add key moments guidance
  promptManager.addComponent({
    id: 'key_moments_guidance',
    type: 'instruction',
    content: KEY_MOMENTS_GUIDANCE,
    priority: 5
  });
  
  // Add keywords-specific output format instructions
  promptManager.addComponent({
    id: 'format_instructions',
    type: 'formatting',
    content: KEYWORDS_FORMAT_INSTRUCTIONS,
    required: true,
    priority: 4
  });
  
  return promptManager;
}

/**
 * Create a story prompt based on StoryGenerationParams
 * @param params Story generation parameters
 * @returns Optimized PromptManager for the request
 */
export function createStoryPrompt(params: StoryGenerationParams): PromptManager {
  const { mode, template, keywords, options } = params;
  
  if (mode === 'template' && template) {
    return createTemplateStoryPrompt(template, options);
  } else if (mode === 'keywords' && keywords) {
    return createKeywordsStoryPrompt(keywords, options);
  }
  
  throw new Error('Invalid story generation parameters');
}

/**
 * Create a narrative analysis prompt
 * @param storyTitle Story title
 * @param storyContent Array of story paragraphs
 * @returns PromptManager for narrative analysis
 */
export function createNarrativeAnalysisPrompt(
  storyTitle: string,
  storyContent: string[],
  theme?: string
): PromptManager {
  const promptManager = new PromptManager('gpt-4o');
  
  // System prompt
  promptManager.addComponent({
    id: 'analysis_system',
    type: 'system',
    content: "You are a narrative analysis expert specializing in children's stories. Your task is to analyze stories to identify key moments, character attributes, emotional beats, and optimal illustration points.",
    required: true,
    priority: 10
  });
  
  // Instructions
  promptManager.addComponent({
    id: 'analysis_instruction',
    type: 'instruction',
    content: `Analyze the following children's story "${storyTitle}" and identify the optimal moments for illustrations, key character descriptions, emotional beats, and narrative structure.`,
    required: true,
    priority: 9
  });
  
  // Story content
  promptManager.addComponent({
    id: 'story_content',
    type: 'context',
    content: storyContent.join('\n\n'),
    required: true,
    priority: 8
  });
  
  // Theme information if provided
  if (theme) {
    promptManager.addComponent({
      id: 'theme_info',
      type: 'context',
      content: `The story's theme is: ${theme}`,
      priority: 7
    });
  }
  
  // Analysis tasks
  promptManager.addComponent({
    id: 'analysis_tasks',
    type: 'instruction',
    content: `Provide a comprehensive analysis focusing on visual storytelling:

1. Character Analysis: For each main character, identify:
   • Distinctive physical features and clothing
   • Recurring poses, expressions or actions
   • Character arc and how it might be shown visually
   • Age-appropriate styling for child audience

2. Setting Analysis: For each key location:
   • Distinctive architectural or natural elements
   • Color palette and atmosphere suggestions
   • Scale and perspective relative to characters
   • Transition points between different settings

3. Emotional Journey: Map how emotions evolve through the story:
   • Color schemes that match emotional states
   • Body language changes through narrative
   • Facial expression opportunities at key moments
   • Visual metaphors for emotional transitions

4. Illustration Opportunities: Identify 4-5 prime illustration moments:
   • Strong visual interest and narrative importance
   • Paragraphs that convey peak action or emotion
   • Scenes that represent different story stages
   • Moments that reveal character or setting details

5. Visual Consistency Recommendations:
   • Character design consistency across illustrations
   • Color palette and style guidelines
   • Visual motifs that could recur across images
   • Age-appropriate visualization considerations`,
    required: true,
    priority: 6
  });
  
  // Output format
  promptManager.addComponent({
    id: 'output_format',
    type: 'formatting',
    content: `Return your analysis as a detailed JSON object with this format:
{
  "mainCharacters": [
    { 
      "name": "Character name",
      "description": "Detailed visual description including age, appearance, clothing, etc.",
      "attributes": ["distinctive feature 1", "distinctive feature 2", "distinctive feature 3"],
      "expressionRange": ["primary emotion 1", "primary emotion 2"]
    }
  ],
  "settings": [
    {
      "name": "Setting name",
      "description": "Detailed visual description including scale, colors, distinctive features",
      "attributes": ["visual element 1", "visual element 2", "visual element 3"],
      "colorPalette": ["primary color 1", "primary color 2", "accent color"]
    }
  ],
  "emotionalJourney": [
    {
      "stage": "beginning/middle/climax/resolution", 
      "emotion": "primary emotion",
      "visualCues": ["body language", "facial expression", "environmental element"],
      "paragraphIndices": [0, 1, 2]
    }
  ],
  "recommendedImageParagraphs": [
    {
      "paragraphIndex": 0,
      "description": "Detailed description of what should be illustrated",
      "rationale": "Why this moment is visually impactful",
      "visualElements": ["key element 1", "key element 2"]
    },
    {
      "paragraphIndex": 3,
      "description": "Detailed description of what should be illustrated",
      "rationale": "Why this moment is visually impactful",
      "visualElements": ["key element 1", "key element 2"]
    }
  ],
  "visualConsistency": {
    "styleRecommendations": ["recommendation 1", "recommendation 2"],
    "colorPalette": ["primary color 1", "primary color 2", "accent color"],
    "recurringMotifs": ["motif 1", "motif 2"]
  },
  "storyStructure": { 
    "introduction": [0, 1], 
    "rising": [2, 3, 4], 
    "climax": [5, 6], 
    "resolution": [7, 8, 9],
    "visualPacing": "Recommendations for visual rhythm across illustrations" 
  }
}`,
    required: true,
    priority: 5
  });
  
  return promptManager;
}
