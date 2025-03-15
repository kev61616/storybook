/**
 * Utility functions for image prompt generation
 * Optimized for safety and story context
 */
import { analyzeStoryContent, createContextAwareImagePrompt } from './storyAnalysis';
import type { StoryAnalysis } from './storyAnalysis';

/**
 * Base system prompt for illustration generation (simplified for safety)
 */
export const IMAGE_SYSTEM_PROMPT = 
  "You are a children's book illustrator who creates age-appropriate, child-friendly illustrations with clear visuals and balanced compositions. Your illustrations should be engaging and support the story's narrative.";

/**
 * Art style definitions for different illustration approaches (simplified)
 */
export const ART_STYLES = {
  watercolor: "Use watercolor style with soft colors and gentle transitions.",
  
  cartoon: "Use cartoon style with clean outlines and bright colors.",
  
  papercraft: "Use layered paper craft style with a handmade feel.",
  
  vintage: "Use vintage storybook style with a classic feel.",
  
  digital: "Use modern digital illustration style with clean lines.",
  
  storybook: "Use traditional children's storybook style with warm colors."
};

/**
 * Scene composition formats (simplified)
 */
export const SCENE_COMPOSITIONS = {
  character_focused: "Focus on the characters in the center of the image.",
  
  landscape: "Show a wider view of the environment with characters in it.",
  
  action: "Show characters in motion with dynamic poses.",
  
  intimate: "Create a close, personal view of the characters.",
  
  dramatic: "Use interesting viewpoints to show the scene."
};

/**
 * Lighting styles (simplified)
 */
export const LIGHTING_STYLES = {
  soft: "Use soft, gentle lighting.",
  
  golden_hour: "Use warm sunlight lighting.",
  
  moonlight: "Use cool, blue-tinted lighting.",
  
  dramatic: "Use contrast between light and shadow.",
  
  magical: "Use glowing, colorful lighting effects."
};

/**
 * Enhances an image prompt to make it suitable for children's illustrations
 * @param basePrompt - The original image prompt
 * @param artStyle - Optional preferred art style
 * @returns Enhanced prompt for child-friendly illustrations
 */
export function enhanceImagePrompt(basePrompt: string, artStyle?: keyof typeof ART_STYLES): string {
  // Default to storybook style if none specified
  const style = artStyle ? ART_STYLES[artStyle] : ART_STYLES.storybook;
  
  // Select a composition approach based on prompt content
  let composition = SCENE_COMPOSITIONS.character_focused;
  if (basePrompt.toLowerCase().includes("action") || basePrompt.toLowerCase().includes("running")) {
    composition = SCENE_COMPOSITIONS.action;
  } else if (basePrompt.toLowerCase().includes("landscape") || basePrompt.toLowerCase().includes("forest")) {
    composition = SCENE_COMPOSITIONS.landscape;
  }
  
  // Select lighting based on scene mood
  let lighting = LIGHTING_STYLES.soft;
  if (basePrompt.toLowerCase().includes("night") || basePrompt.toLowerCase().includes("dark")) {
    lighting = LIGHTING_STYLES.moonlight;
  } else if (basePrompt.toLowerCase().includes("magic") || basePrompt.toLowerCase().includes("sparkle")) {
    lighting = LIGHTING_STYLES.magical;
  } else if (basePrompt.toLowerCase().includes("sunset") || basePrompt.toLowerCase().includes("warm")) {
    lighting = LIGHTING_STYLES.golden_hour;
  }
  
  // Build the enhanced prompt (concise and safe)
  return `Children's book illustration showing: ${basePrompt}

Style: ${style}
Composition: ${composition}
Lighting: ${lighting}

Make the illustration clear, age-appropriate for children 4-10, with a positive feeling.`;
}

/**
 * Creates a consistent style prompt for a series of illustrations
 * @param storyTitle - The title of the story
 * @param theme - Optional theme to influence the art style
 * @param artStyle - Optional preferred art style
 * @returns A style prompt to ensure consistent illustrations
 */
export function createStylePrompt(
  storyTitle: string, 
  theme?: string, 
  artStyle?: keyof typeof ART_STYLES
): string {
  // Start with base style guidance (simplified)
  let styleBase = `Maintain consistent style across all illustrations for "${storyTitle}":`;
  
  // Add condensed theme-specific style guidance
  if (theme) {
    const themeStyleMap: Record<string, string> = {
      'adventure': "Use warm colors, outdoor lighting, and exploration elements.",
      'animals': "Use natural colors, gentle lighting, and accurate animal features.",
      'fantasy': "Use dreamy colors, magical lighting, and fantasy elements.",
      'space': "Use deep blues/purples, starlight, and cosmic elements.",
      'underwater': "Use blue/green colors, water effects, and marine life.",
      'dinosaurs': "Use earth tones, prehistoric plants, and dinosaur elements.",
      'pirates': "Use sea blues, wooden textures, and nautical elements.",
      'fairy': "Use soft pastels, glowing effects, and miniature perspective."
    };
    
    // Add the theme guidance if available
    if (themeStyleMap[theme.toLowerCase()]) {
      styleBase += ` ${themeStyleMap[theme.toLowerCase()]}`;
    }
  }
  
  // Add art style specification if provided (simplified)
  if (artStyle && ART_STYLES[artStyle]) {
    styleBase += ` ${ART_STYLES[artStyle]}`;
  }
  
  return styleBase;
}

/**
 * Creates a cover illustration prompt that's safer and more concise
 * @param storyTitle - The title of the story
 * @param storyDescription - Brief description of the story content
 * @param theme - Optional theme to influence the cover art
 * @returns A prompt for a cover illustration
 */
export function createCoverPrompt(
  storyTitle: string,
  storyDescription: string,
  theme?: string
): string {
  // Theme-specific cover guidance (simplified)
  let themeGuidance = '';
  
  if (theme) {
    const coverThemeMap: Record<string, string> = {
      'adventure': "Show exploration elements like paths or maps.",
      'animals': "Show the main animal character in their natural habitat.",
      'fantasy': "Include magical elements and fantastical scenery.",
      'space': "Show stars, planets, or spacecraft with cosmic colors.",
      'underwater': "Show underwater scene with marine life and water effects.",
      'pirates': "Include nautical elements like ships, maps, or treasure.",
      'fairy': "Show the tiny scale of fairy world among flowers or leaves."
    };

    // If we have specific guidance for this theme, add it
    if (coverThemeMap[theme.toLowerCase()]) {
      themeGuidance = ` ${coverThemeMap[theme.toLowerCase()]}`;
    }
  }
  
  return `Cover illustration for children's book "${storyTitle}".
  
Story summary: ${storyDescription}

Create a clear, central illustration showing the main character(s) or setting.${themeGuidance}

Make the cover child-friendly, colorful, and inviting with space for the title text.`;
}

/**
 * Creates image prompts for a complete story using story analysis
 * @param storyTitle - The title of the story
 * @param paragraphs - Array of story paragraphs
 * @param theme - Optional story theme
 * @returns Array of context-aware image prompts
 */
export function createStoryImagePrompts(
  storyTitle: string,
  paragraphs: string[],
  theme?: string
): string[] {
  // Analyze the story content
  const analysis = analyzeStoryContent(storyTitle, paragraphs, theme);
  
  // Get the recommended paragraphs for illustration
  const imageParas = analysis.recommendedImageParagraphs;
  
  // Create context-aware prompts for each recommended paragraph
  return imageParas.map((paraIndex: number) => 
    createContextAwareImagePrompt(
      paragraphs[paraIndex],
      analysis,
      paraIndex
    )
  );
}
