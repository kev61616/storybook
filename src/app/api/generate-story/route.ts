import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { STORY_SYSTEM_PROMPT } from '../../utils/prompts';
import { StoryMode } from '../../types';
import { createStoryPrompt } from '../../utils/prompts';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * API route to generate a story using OpenAI's GPT model
 * Supports two modes:
 * 1. Template-based stories (using predefined themes)
 * 2. Keyword-based custom stories
 */
export async function POST(request: NextRequest) {
  try {
    // Get request data
    const data = await request.json();
    const { mode, template, keywords, systemPrompt, prompt: customPrompt } = data;
    
    // Validate core parameters
    if (mode !== 'template' && mode !== 'keywords') {
      return NextResponse.json(
        { error: 'Mode must be either "template" or "keywords"' },
        { status: 400 }
      );
    }
    
    if (mode === 'template' && !template) {
      return NextResponse.json(
        { error: 'Template is required when mode is "template"' },
        { status: 400 }
      );
    }
    
    if (mode === 'keywords' && (!keywords || keywords.trim() === '')) {
      return NextResponse.json(
        { error: 'Keywords are required when mode is "keywords"' },
        { status: 400 }
      );
    }
    
    // Use custom prompt if provided, otherwise generate one
    const promptContent = customPrompt || createStoryPrompt({
      mode: mode as StoryMode,
      template,
      keywords
    });
    
    // Use custom system prompt if provided, otherwise use default
    const systemContent = systemPrompt || STORY_SYSTEM_PROMPT;
    
    // Generate story using OpenAI's GPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemContent
        },
        {
          role: "user",
          content: promptContent
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    
    // Parse the response
    const response = completion.choices[0]?.message?.content || '';
    const storyData = JSON.parse(response);
    
    return NextResponse.json(storyData);
    
  } catch (error) {
    console.error('Error generating story:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Failed to generate story', details: errorMessage },
      { status: 500 }
    );
  }
}
