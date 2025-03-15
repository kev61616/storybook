import { enhanceImagePrompt, createStylePrompt } from '../utils/prompts';

/**
 * Constants for image generation
 */
const MAX_RETRY_ATTEMPTS = 3; // Increased from 2 to 3
const DELAY_BETWEEN_REQUESTS = 2000; // Increased from 1 to 2 seconds delay between requests
const BATCH_SIZE = 2; // Reduced from 3 to 2 to reduce likelihood of timeouts
const RETRY_DELAY = 3000; // Increased from 2 to 3 seconds delay before retrying a failed request

/**
 * Delay utility function
 * @param ms - Time to delay in milliseconds
 */
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate an image using the DALL-E API with improved error handling
 * @param prompt - The image description to use for generation
 * @param retryCount - Current retry attempt (internal)
 * @returns The URL of the generated image or a fallback
 */
export async function generateImage(
  prompt: string,
  retryCount: number = 0
): Promise<string> {
  try {
    // Enhance the prompt for better child-friendly illustrations
    const enhancedPrompt = enhanceImagePrompt(prompt);
    
    console.log(`Generating image (attempt ${retryCount + 1}): "${enhancedPrompt.substring(0, 50)}..."`);
    
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: enhancedPrompt }),
    });

    const data = await response.json();
    
    // Check if a fallback was returned
    if (data.fallback) {
      console.warn(`Received fallback image due to: ${data.details}`);
      
      // Retry if we haven't reached max attempts and specific errors
      if (retryCount < MAX_RETRY_ATTEMPTS && 
          (data.type === 'timeout' || data.type === 'rate-limit')) {
        console.log(`Retrying after delay... (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
        await delay(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
        return generateImage(prompt, retryCount + 1);
      }
    }
    
    return data.imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    
    // Retry logic for unexpected errors
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      console.log(`Retrying after unexpected error... (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
      await delay(RETRY_DELAY * (retryCount + 1));
      return generateImage(prompt, retryCount + 1);
    }
    
    // Return a fallback image on ultimate failure
    return getFallbackImageUrl();
  }
}

/**
 * Generate multiple images for a story with improved batching and reliability
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
  // Generate a style prompt for consistent illustrations
  const stylePrompt = createStylePrompt(storyTitle, theme);
  
  // Prepare enhanced prompts
  const enhancedPrompts = imagePrompts.map(prompt => 
    `${enhanceImagePrompt(prompt)}\n\n${stylePrompt}`
  );
  
  const images: string[] = [];
  const startTime = Date.now();
  
  try {
    console.log(`Starting batch image generation for ${enhancedPrompts.length} images...`);
    
    // Process prompts in batches to avoid overwhelming the API
    for (let i = 0; i < enhancedPrompts.length; i += BATCH_SIZE) {
      const batchPrompts = enhancedPrompts.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i / BATCH_SIZE + 1} with ${batchPrompts.length} images...`);
      
      // Generate images in the current batch in parallel
      const batchResults = await Promise.all(
        batchPrompts.map(async (prompt, index) => {
          try {
            // Stagger requests within a batch to reduce load
            await delay(index * DELAY_BETWEEN_REQUESTS);
            return await generateImage(prompt);
          } catch (error) {
            console.error(`Error in batch generation (prompt ${i + index}):`, error);
            return getFallbackImageUrl(theme);
          }
        })
      );
      
      images.push(...batchResults);
      
      // Add a delay between batches to respect rate limits
      if (i + BATCH_SIZE < enhancedPrompts.length) {
        await delay(DELAY_BETWEEN_REQUESTS * 2);
      }
    }
    
    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`Generated ${images.length} images in ${totalTime.toFixed(1)} seconds`);
    
    return images;
  } catch (error) {
    console.error('Error in batch image generation:', error);
    
    // If we already have some images, return those plus fallbacks for the rest
    if (images.length > 0) {
      console.log(`Returning ${images.length} successful images with fallbacks for the rest`);
      
      // Fill in the remaining slots with fallbacks
      while (images.length < imagePrompts.length) {
        images.push(getFallbackImageUrl(theme));
      }
      
      return images;
    }
    
    // Complete failure case - return all fallbacks
    console.log('Returning all fallback images');
    return Array(imagePrompts.length).fill(0).map(() => getFallbackImageUrl(theme));
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
    switch (theme?.toLowerCase()) {
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
  
  return `https://placehold.co/800x800/${bgColor}/${textColor}?text=Temporary+Illustration`;
}
