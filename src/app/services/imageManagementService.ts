import { generateImage, getFallbackImageUrl } from './imageService';

/**
 * Interface for image metadata
 */
interface ImageMetadata {
  url: string;
  generatedAt: number; // timestamp
  prompt?: string;
  status: 'success' | 'fallback';
}

/**
 * Interface for image storage entry
 */
interface ImageStorageEntry {
  storyId: string;
  images: Record<string, ImageMetadata>;
  updatedAt: number;
}

/**
 * Progress event interface
 */
export interface ImageGenerationProgress {
  currentImage: number;
  totalImages: number;
  currentPrompt?: string;
  isCached: boolean;
  imageStatus: 'success' | 'fallback';
  stage: 'preparation' | 'generation' | 'processing' | 'complete';
  percentComplete: number;
}

/**
 * Progress callback type
 */
type ProgressCallback = (progress: ImageGenerationProgress) => void;

/**
 * Key constants
 */
const IMAGE_STORAGE_PREFIX = 'storybuddy_images_';
const IMAGE_STORAGE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * ImageManagementService - Handle image generation and localStorage management
 *
 * This service manages the entire lifecycle of story images:
 * - Generating images
 * - Storing them in localStorage
 * - Retrieving them when needed
 * - Handling fallbacks and errors
 * - Tracking and reporting progress
 */
export class ImageManagementService {
  private static progressCallbacks: ProgressCallback[] = [];

  /**
   * Register a callback for progress updates
   * @param callback Function to call with progress information
   */
  public static onProgressUpdate(callback: ProgressCallback): () => void {
    this.progressCallbacks.push(callback);
    
    // Return a function to remove this callback
    return () => {
      this.progressCallbacks = this.progressCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Emit a progress update to all registered callbacks
   */
  private static emitProgress(progress: ImageGenerationProgress): void {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.error('Error in progress callback:', error);
      }
    });
  }

  /**
   * Get the localStorage key for a story
   */
  private static getStorageKey(storyId: string): string {
    return `${IMAGE_STORAGE_PREFIX}${storyId}`;
  }

  /**
   * Save images for a story to localStorage
   */
  private static saveImagesToStorage(storyId: string, images: Record<string, ImageMetadata>): void {
    if (typeof window === 'undefined') return;
    
    try {
      const entry: ImageStorageEntry = {
        storyId,
        images,
        updatedAt: Date.now(),
      };
      
      localStorage.setItem(this.getStorageKey(storyId), JSON.stringify(entry));
    } catch (error) {
      console.error('Error saving images to localStorage:', error);
      // If localStorage is full, try to clean up old entries
      this.cleanupOldEntries();
    }
  }

  /**
   * Get images for a story from localStorage
   */
  private static getImagesFromStorage(storyId: string): Record<string, ImageMetadata> | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const entryStr = localStorage.getItem(this.getStorageKey(storyId));
      if (!entryStr) return null;
      
      const entry: ImageStorageEntry = JSON.parse(entryStr);
      
      // Check if entry is expired
      if (Date.now() - entry.updatedAt > IMAGE_STORAGE_EXPIRATION) {
        localStorage.removeItem(this.getStorageKey(storyId));
        return null;
      }
      
      return entry.images;
    } catch {
      return null;
    }
  }

  /**
   * Clean up old entries to free up space
   */
  private static cleanupOldEntries(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];
      
      // Find expired entries
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(IMAGE_STORAGE_PREFIX)) {
          try {
            const entryStr = localStorage.getItem(key);
            if (entryStr) {
              const entry: ImageStorageEntry = JSON.parse(entryStr);
              if (now - entry.updatedAt > IMAGE_STORAGE_EXPIRATION) {
                keysToRemove.push(key);
              }
            }
          } catch {
            // If can't parse, consider it invalid and remove
            keysToRemove.push(key!);
          }
        }
      }
      
      // Remove expired entries
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error cleaning up localStorage:', error);
    }
  }

  /**
   * Generate and store a single image
   * @returns The URL of the generated image
   */
  private static async generateAndStoreImage(
    prompt: string,
    storyId: string,
    imageKey: string,
    theme?: string,
    currentIndex: number = 0,
    totalImages: number = 1
  ): Promise<string> {
    try {
      // Emit progress update - starting this image
      this.emitProgress({
        currentImage: currentIndex + 1,
        totalImages,
        currentPrompt: prompt.substring(0, 50) + '...',
        isCached: false,
        imageStatus: 'success',
        stage: 'generation',
        percentComplete: ((currentIndex / totalImages) * 80) + 10 // 10-90% range
      });
      
      console.log(`Generating image for "${storyId}" with key "${imageKey}"`);
      
      // The generateImage function now handles retries internally
      const imageUrl = await generateImage(prompt);
      
      // Detect if the result is a fallback by checking the URL
      const isFallback = imageUrl.includes('placehold.co');
      const status = isFallback ? 'fallback' : 'success';
      
      // Store metadata in localStorage
      const existingImages = this.getImagesFromStorage(storyId) || {};
      existingImages[imageKey] = {
        url: imageUrl,
        generatedAt: Date.now(),
        prompt,
        status,
      };
      this.saveImagesToStorage(storyId, existingImages);
      
      // Emit progress update - completed this image
      this.emitProgress({
        currentImage: currentIndex + 1,
        totalImages,
        currentPrompt: prompt.substring(0, 50) + '...',
        isCached: false,
        imageStatus: status,
        stage: 'processing',
        percentComplete: ((currentIndex + 0.8) / totalImages * 80) + 10 // 10-90% range
      });
      
      if (isFallback) {
        console.warn(`Received fallback image for "${imageKey}". Using temporary illustration.`);
      } else {
        console.log(`Successfully generated and stored image for "${imageKey}"`);
      }
      
      return imageUrl;
    } catch (error) {
      console.error(`Critical error in generateAndStoreImage for "${imageKey}":`, error);
      
      // Last resort fallback
      const fallbackUrl = getFallbackImageUrl(theme);
      
      // Store fallback metadata
      const existingImages = this.getImagesFromStorage(storyId) || {};
      existingImages[imageKey] = {
        url: fallbackUrl,
        generatedAt: Date.now(),
        prompt,
        status: 'fallback',
      };
      this.saveImagesToStorage(storyId, existingImages);
      
      // Emit progress update - fallback for this image
      this.emitProgress({
        currentImage: currentIndex + 1,
        totalImages,
        currentPrompt: prompt.substring(0, 50) + '...',
        isCached: false,
        imageStatus: 'fallback',
        stage: 'processing',
        percentComplete: ((currentIndex + 1) / totalImages * 80) + 10 // 10-90% range
      });
      
      return fallbackUrl;
    }
  }

  /**
   * Get an image URL for a story - either from storage or generate new
   */
  public static async getImageUrl(
    prompt: string,
    storyId: string,
    imageKey: string,
    theme?: string,
    currentIndex: number = 0,
    totalImages: number = 1
  ): Promise<string> {
    // First check if we already have this image in localStorage
    const existingImages = this.getImagesFromStorage(storyId);
    const existingImage = existingImages?.[imageKey];
    
    if (existingImage) {
      // Emit progress update - using cached image
      this.emitProgress({
        currentImage: currentIndex + 1,
        totalImages,
        currentPrompt: prompt.substring(0, 50) + '...',
        isCached: true,
        imageStatus: existingImage.status,
        stage: 'processing',
        percentComplete: ((currentIndex + 1) / totalImages * 80) + 10 // 10-90% range
      });
      
      return existingImage.url;
    }
    
    // If not found in storage, generate and store
    return this.generateAndStoreImage(prompt, storyId, imageKey, theme, currentIndex, totalImages);
  }

  /**
   * Generate all images for a story upfront and store them
   * Enhanced with better logging, error handling, and fallbacks
   * @returns Array of image URLs
   */
  public static async generateAllStoryImages(
    storyId: string,
    imagePrompts: string[],
    storyTitle: string,
    theme?: string
  ): Promise<string[]> {
    console.log(`Starting image generation for story "${storyTitle}" (ID: ${storyId})`);
    console.log(`Total prompts: ${imagePrompts.length}, Theme: ${theme || 'default'}`);
    
    // Emit preparation stage
    this.emitProgress({
      currentImage: 0,
      totalImages: imagePrompts.length,
      isCached: false,
      imageStatus: 'success',
      stage: 'preparation',
      percentComplete: 5
    });
    
    // Create a unique key for each image
    const generateKey = (index: number) => `${storyId}_img_${index}`;
    
    // Try to get existing images from storage first
    const existingImages = this.getImagesFromStorage(storyId);
    
    if (existingImages) {
      // Check if we have all the images we need
      const allImagesExist = imagePrompts.every((_, index) => 
        existingImages[generateKey(index)] !== undefined
      );
      
      if (allImagesExist) {
        console.log(`All ${imagePrompts.length} images already exist in cache for story ${storyId}`);
        
        // Emit multiple progress updates for each cached image
        for (let i = 0; i < imagePrompts.length; i++) {
          const key = generateKey(i);
          const imageStatus = existingImages[key].status;
          
          this.emitProgress({
            currentImage: i + 1,
            totalImages: imagePrompts.length,
            isCached: true,
            imageStatus,
            stage: 'processing',
            percentComplete: ((i + 1) / imagePrompts.length * 80) + 10 // 10-90% range
          });
          
          // Small delay between progress updates to show progress animation
          if (i < imagePrompts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        // Emit completion
        this.emitProgress({
          currentImage: imagePrompts.length,
          totalImages: imagePrompts.length,
          isCached: true,
          imageStatus: 'success',
          stage: 'complete',
          percentComplete: 100
        });
        
        // If we have all images, return them in order
        return imagePrompts.map((_, index) => existingImages[generateKey(index)].url);
      } else {
        console.log(`Some images exist in cache, but not all. Generating missing images.`);
      }
    } else {
      console.log(`No images in cache for story ${storyId}. Generating all images.`);
    }
    
    // If not all cached, generate the images
    try {
      const images: string[] = [];
      
      // Generate each image sequentially with progress tracking
      for (let i = 0; i < imagePrompts.length; i++) {
        const key = generateKey(i);
        const imageUrl = await this.getImageUrl(
          imagePrompts[i], 
          storyId, 
          key, 
          theme,
          i,
          imagePrompts.length
        );
        images.push(imageUrl);
      }
      
      // Emit completion
      this.emitProgress({
        currentImage: imagePrompts.length,
        totalImages: imagePrompts.length,
        isCached: false,
        imageStatus: 'success',
        stage: 'complete',
        percentComplete: 100
      });
      
      console.log(`Successfully generated and cached ${images.length} images for story ${storyId}`);
      return images;
    } catch (error) {
      console.error(`Failed to generate images for story ${storyId}:`, error);
      
      // Critical failure - generate fallbacks for all images
      const fallbackImages = imagePrompts.map((prompt, index) => {
        const key = generateKey(index);
        const fallbackUrl = getFallbackImageUrl(theme);
        
        // Still cache the fallbacks
        const existingImagesObj = this.getImagesFromStorage(storyId) || {};
        existingImagesObj[key] = {
          url: fallbackUrl,
          generatedAt: Date.now(),
          prompt,
          status: 'fallback'
        };
        this.saveImagesToStorage(storyId, existingImagesObj);
        
        // Emit progress for this fallback
        this.emitProgress({
          currentImage: index + 1,
          totalImages: imagePrompts.length,
          currentPrompt: prompt.substring(0, 50) + '...',
          isCached: false,
          imageStatus: 'fallback',
          stage: 'processing',
          percentComplete: ((index + 1) / imagePrompts.length * 80) + 10
        });
        
        return fallbackUrl;
      });
      
      // Emit completion with fallbacks
      this.emitProgress({
        currentImage: imagePrompts.length,
        totalImages: imagePrompts.length,
        isCached: false,
        imageStatus: 'fallback',
        stage: 'complete',
        percentComplete: 100
      });
      
      console.log(`Returning ${fallbackImages.length} fallback images for story ${storyId}`);
      return fallbackImages;
    }
  }

  /**
   * Check if all images for a story are locally available
   * @returns true if all images are available
   */
  public static areAllImagesAvailable(storyId: string, imageCount: number): boolean {
    if (typeof window === 'undefined') return false;
    
    const existingImages = this.getImagesFromStorage(storyId);
    if (!existingImages) return false;
    
    // Check if we have all the images we need
    for (let i = 0; i < imageCount; i++) {
      if (!existingImages[`${storyId}_img_${i}`]) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get all stored images for a story
   */
  public static getAllStoredImages(storyId: string): string[] {
    const existingImages = this.getImagesFromStorage(storyId);
    if (!existingImages) return [];
    
    const sortedKeys = Object.keys(existingImages)
      .filter(key => key.startsWith(`${storyId}_img_`))
      .sort((a, b) => {
        const aIndex = parseInt(a.split('_img_')[1]);
        const bIndex = parseInt(b.split('_img_')[1]);
        return aIndex - bIndex;
      });
    
    return sortedKeys.map(key => existingImages[key].url);
  }

  /**
   * Manually clear images for a story
   */
  public static clearImagesForStory(storyId: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.getStorageKey(storyId));
  }
}
