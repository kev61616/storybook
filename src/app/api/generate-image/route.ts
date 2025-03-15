import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { enhanceImagePrompt } from '../../utils/prompts';

// Initialize OpenAI client with error handling
const initializeOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not configured in environment variables');
    throw new Error('OpenAI API key is missing');
  }
  
  return new OpenAI({ apiKey });
};

// Create the OpenAI client
let openai: OpenAI;
try {
  openai = initializeOpenAI();
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
  // We'll handle the error in the route handler
}

/**
 * Placeholder image when generation fails
 * @param errorType Type of error that occurred
 * @returns A fallback image URL
 */
function getFallbackImageUrl(errorType: string = 'general'): string {
  // Customize based on the type of error
  let bgColor = 'f0f9ff'; // Default light blue background
  let textColor = '0369a1'; // Default blue text
  let message = 'Image+Generation+Failed';
  
  switch (errorType) {
    case 'api-key':
      bgColor = 'fee2e2';
      textColor = 'b91c1c';
      message = 'API+Key+Error';
      break;
    case 'timeout':
      bgColor = 'fef3c7';
      textColor = '92400e';
      message = 'Request+Timeout';
      break;
    case 'content-policy':
      bgColor = 'f3e8ff';
      textColor = '7e22ce';
      message = 'Content+Policy+Violation';
      break;
    case 'rate-limit':
      bgColor = 'dcfce7';
      textColor = '166534';
      message = 'Rate+Limit+Exceeded';
      break;
  }
  
  return `https://placehold.co/800x800/${bgColor}/${textColor}?text=${message}`;
}

/**
 * API route to generate an image using DALL-E
 * Takes a prompt and generates an appropriate image for children's stories
 * Includes enhanced error handling and fallbacks
 */
export async function POST(request: NextRequest) {
  // Set a timeout for the request (increased from 15s to 30s to reduce timeouts)
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Image generation timed out')), 30000);
  });
  
  try {
    // Check if OpenAI client was initialized
    if (!openai) {
      throw new Error('OpenAI client is not initialized');
    }
    
    // Get request data
    const data = await request.json();
    const { prompt, enhancedPrompt: customPrompt } = data;
    
    // Validate prompt
    if (!prompt || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // Limit prompt length to prevent token issues
    const maxPromptLength = 700;
    let finalPrompt = customPrompt || enhanceImagePrompt(prompt);
    if (finalPrompt.length > maxPromptLength) {
      console.warn(`Prompt was truncated from ${finalPrompt.length} to ${maxPromptLength} characters`);
      finalPrompt = finalPrompt.substring(0, maxPromptLength) + '...';
    }
    
    console.log(`Generating image with prompt: "${finalPrompt.substring(0, 100)}..."`);
    
    // Generate image with timeout
    const generatePromise = openai.images.generate({
      model: "dall-e-3",
      prompt: finalPrompt,
      n: 1,
      size: "1024x1024",
      style: "vivid",
    });
    
    // Race between generation and timeout
    const response = await Promise.race([generatePromise, timeoutPromise]) as Awaited<typeof generatePromise>;
    
    const imageUrl = response.data[0]?.url;
    
    if (!imageUrl) {
      console.error('No image URL in the OpenAI response');
      throw new Error('Failed to generate image URL');
    }
    
    console.log('Successfully generated image');
    return NextResponse.json({ imageUrl });
    
  } catch (error: unknown) {
    // Detailed error logging
    console.error('Error generating image:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let errorType = 'general';
    let statusCode = 500;
    
    // Identify specific error types
    if (errorMessage.includes('API key')) {
      errorType = 'api-key';
      console.error('API key issue detected - check your environment variables');
    } else if (errorMessage.includes('timed out')) {
      errorType = 'timeout';
      console.error('Request timed out - the OpenAI API might be overloaded');
    } else if (errorMessage.includes('rate limit')) {
      errorType = 'rate-limit';
      console.error('Rate limit exceeded - wait before making more requests');
      statusCode = 429;
    } else if (errorMessage.includes('content policy')) {
      errorType = 'content-policy';
      console.error('Content policy violation - check your prompt content');
      statusCode = 400;
    }
    
    // Get API error details if available
    let apiErrorDetails = '';
    
    // Check if error is an object with a response property
    if (
      error && 
      typeof error === 'object' && 
      'response' in error && 
      error.response && 
      typeof error.response === 'object'
    ) {
      const errorResponse = error.response;
      // Extract status and data if available
      const status = 'status' in errorResponse ? errorResponse.status : 'unknown';
      const data = 'data' in errorResponse ? errorResponse.data : {};
      
      apiErrorDetails = `API status: ${status}, message: ${JSON.stringify(data)}`;
      console.error('API error details:', apiErrorDetails);
    }
    
    // Always return a valid response with a fallback image
    const fallbackImageUrl = getFallbackImageUrl(errorType);
    
    return NextResponse.json({
      imageUrl: fallbackImageUrl,
      error: 'Failed to generate image',
      details: errorMessage,
      type: errorType,
      apiDetails: apiErrorDetails || undefined,
      fallback: true
    }, { status: statusCode });
  }
}
