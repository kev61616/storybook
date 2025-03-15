import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { enhanceImagePrompt } from '../../utils/prompts';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * API route to generate an image using DALL-E
 * Takes a prompt and generates an appropriate image for children's stories
 */
export async function POST(request: NextRequest) {
  try {
    // Get request data
    const data = await request.json();
    const { prompt, enhancedPrompt: customPrompt } = data;
    
    if (!prompt || prompt.trim() === '') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // Use provided prompt if specified, otherwise enhance the original prompt
    const finalPrompt = customPrompt || enhanceImagePrompt(prompt);
    
    // Generate image using OpenAI's DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: finalPrompt,
      n: 1,
      size: "1024x1024",
      style: "vivid",
    });
    
    const imageUrl = response.data[0]?.url;
    
    if (!imageUrl) {
      throw new Error('Failed to generate image URL');
    }
    
    return NextResponse.json({ imageUrl });
    
  } catch (error) {
    console.error('Error generating image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Failed to generate image', details: errorMessage },
      { status: 500 }
    );
  }
}
