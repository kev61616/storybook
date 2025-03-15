import { enhanceImagePrompt, createStylePrompt } from '../utils/prompts';

/**
 * Generate an image using the DALL-E API
 * @param prompt - The image description to use for generation
 * @returns The URL of the generated image
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    // Enhance the prompt for better child-friendly illustrations
    const enhancedPrompt = enhanceImagePrompt(prompt);
    
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: enhancedPrompt }),
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
 * Generate multiple images for a story
 * @param imagePrompts - Array of image descriptions
 * @param storyTitle - Title of the story (for style consistency)
 * @param theme - Optional theme to influence art style
 * @returns Array of image URLs
 */
export async function generateStoryImages(
  imagePrompts: string[],
  storyTitle: string,
  theme?: string
): Promise<string[]> {
  try {
    const images: string[] = [];
    
    // Generate a style prompt for consistent illustrations
    const stylePrompt = createStylePrompt(storyTitle, theme);
    
    // Generate each image sequentially
    for (const prompt of imagePrompts) {
      try {
        // Combine the base prompt with style guidance
        const enhancedPrompt = `${enhanceImagePrompt(prompt)}\n\n${stylePrompt}`;
        
        const imageUrl = await generateImage(enhancedPrompt);
        images.push(imageUrl);
      } catch (error) {
        console.error(`Error generating image for prompt: ${prompt}`, error);
        // Use a placeholder image on failure
        images.push("https://placehold.co/600x400/e0f2fe/0284c7?text=Image+Generation+Failed");
      }
    }
    
    return images;
  } catch (error) {
    console.error('Error generating story images:', error);
    throw error;
  }
}

/**
 * Get a fallback image URL when image generation fails
 * @param theme - Optional theme to customize the placeholder
 * @returns Placeholder image URL
 */
export function getFallbackImageUrl(theme?: string): string {
  // Default colors
  let bgColor = 'e0f2fe';
  let textColor = '0284c7';
  
  // Customize colors based on theme if provided
  if (theme) {
    switch (theme.toLowerCase()) {
      case 'adventure':
        bgColor = 'fef3c7';
        textColor = 'b45309';
        break;
      case 'fantasy':
        bgColor = 'f3e8ff';
        textColor = '7e22ce';
        break;
      case 'space':
        bgColor = 'e0e7ff';
        textColor = '4338ca';
        break;
      case 'underwater':
        bgColor = 'cffafe';
        textColor = '0e7490';
        break;
      case 'dinosaurs':
        bgColor = 'fef3c7';
        textColor = '92400e';
        break;
    }
  }
  
  return `https://placehold.co/600x400/${bgColor}/${textColor}?text=Image+Generation+Failed`;
}
