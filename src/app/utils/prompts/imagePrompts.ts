/**
 * Utility functions for image prompt generation
 */

/**
 * Base system prompt for illustration generation
 */
export const IMAGE_SYSTEM_PROMPT = 
  "You are a creative children's book illustrator. You create vivid, engaging, and age-appropriate illustrations for children ages 4-10. Your illustrations are colorful, whimsical, and support story narratives.";

/**
 * Enhances an image prompt to make it more suitable for children's illustrations
 * @param basePrompt - The original image prompt
 * @returns Enhanced prompt for better child-friendly illustrations
 */
export function enhanceImagePrompt(basePrompt: string): string {
  // Make sure the prompt requests child-friendly, colorful illustrations in a consistent style
  return `Create a child-friendly, colorful, and engaging illustration for a children's storybook: ${basePrompt}. 
  
The style should be suitable for children aged 4-10, avoid realistic scary elements, use bright colors, and have a whimsical, positive tone. Make it look like a professional children's book illustration with clear characters and a well-defined scene.`;
}

/**
 * Creates a consistent style prompt for a series of illustrations
 * @param storyTitle - The title of the story
 * @param theme - Optional theme to influence the art style
 * @returns A style prompt to ensure consistent illustrations
 */
export function createStylePrompt(storyTitle: string, theme?: string): string {
  let styleBase = `For the story "${storyTitle}", create illustrations in a consistent style that's`;
  
  // Adjust style based on theme if provided
  if (theme) {
    const themeStyleMap: Record<string, string> = {
      'adventure': 'vibrant and dynamic with rich details and a sense of exploration',
      'animals': 'warm and friendly with naturalistic but slightly anthropomorphized animal characters',
      'fantasy': 'magical and dreamy with soft glowing elements and fantastical creatures',
      'space': 'cosmic and awe-inspiring with deep space backgrounds and futuristic elements',
      'underwater': 'flowing and bubbly with translucent water effects and vibrant sea life',
      'dinosaurs': 'prehistoric and textured with attention to scale and natural environments',
      'cars': 'sleek and shiny with dynamic motion effects and expressive vehicle designs',
      'pirates': 'weathered and adventurous with rich ocean colors and dramatic lighting',
      'superheroes': 'bold and dynamic with strong outlines and action-oriented compositions',
      'fairy': 'delicate and enchanted with glittering effects and flowing organic shapes',
      'robots': 'geometric and polished with interesting mechanical details and expressive robot faces',
      'sports': 'energetic and motion-filled with dynamic poses and a sense of achievement'
    };
    
    // Use the theme-specific style if available, or a generic one if not
    styleBase += ` ${themeStyleMap[theme.toLowerCase()] || 'colorful and engaging with a cohesive color palette'}`;
  } else {
    // Default style guidance if no theme is specified
    styleBase += ' colorful and engaging with a cohesive color palette';
  }
  
  return `${styleBase}. The illustrations should work well together as a series, with consistent character designs, art style, and color usage throughout the story.`;
}
