import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { StoryMode } from '../../types';
import { createStoryPrompt } from '../../utils/prompts/storyPromptTemplates';

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
    
    // Create prompt using token-aware PromptManager
    let messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    
    if (customPrompt) {
      // Handle legacy custom prompt format
      messages = [
        {
          role: "system" as const,
          content: systemPrompt || "You are a creative children's storywriter who creates engaging, age-appropriate stories."
        },
        {
          role: "user" as const,
          content: customPrompt
        }
      ];
    } else {
      // Use token-optimized prompt manager
      const promptManager = createStoryPrompt({
        mode: mode as StoryMode,
        template,
        keywords,
        options: data.options
      });
      
      // Get OpenAI-compatible messages
      messages = promptManager.createChatCompletionMessages();
      
      // Log token usage (optional)
      const builtPrompt = promptManager.buildPrompt();
      console.log(`Prompt tokens: ${builtPrompt.totalTokens} (system: ${builtPrompt.systemTokens}, user: ${builtPrompt.userTokens})`);
    }
    
    // Generate story using OpenAI's GPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
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
