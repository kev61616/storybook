import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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
    const { mode, template, keywords } = await request.json();
    
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
    
    // Get appropriate prompt based on mode
    const prompt = getPrompt(mode, template, keywords);
    
    // Generate story using OpenAI's GPT
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a creative children's storywriter. You write engaging, age-appropriate stories for children ages 4-10. Your stories are imaginative, positive, and teach good values. Your tone is warm and friendly."
        },
        {
          role: "user",
          content: prompt
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

/**
 * Helper function to create the appropriate prompt based on the mode
 */
function getPrompt(mode: string, template?: string, keywords?: string): string {
  if (mode === 'template') {
    return `Create a children's story based on the theme: "${template}".
    
    The story should be appropriate for children ages 4-10, with a beginning, middle, and end.
    
    Return your response as a JSON object with this format:
    {
      "title": "The story title",
      "content": ["Paragraph 1", "Paragraph 2", "Paragraph 3", ...], 
      "theme": "${template}",
      "imagePrompts": ["A descriptive prompt for an illustration that matches paragraph 1", "A descriptive prompt for an illustration that matches paragraph 4", "A descriptive prompt for an illustration that matches paragraph 7", "A descriptive prompt for an illustration that matches paragraph 10"]
    }
    
    The content array should contain 10-12 paragraphs, each being 1-2 sentences.
    
    For imagePrompts, create 4 descriptive prompts that would work well for generating illustrations that match specific paragraphs in your story. These should be vivid and specific.`;
  } else {
    // Keywords mode
    return `Create a children's story using these keywords: ${keywords}.
    
    The story should be appropriate for children ages 4-10, with a beginning, middle, and end.
    
    Return your response as a JSON object with this format:
    {
      "title": "The story title",
      "content": ["Paragraph 1", "Paragraph 2", "Paragraph 3", ...],
      "keywords": ["keyword1", "keyword2", ...],
      "imagePrompts": ["A descriptive prompt for an illustration that matches paragraph 1", "A descriptive prompt for an illustration that matches paragraph 4", "A descriptive prompt for an illustration that matches paragraph 7", "A descriptive prompt for an illustration that matches paragraph 10"]
    }
    
    The keywords array should contain the keywords you used from the provided list.
    The content array should contain 10-12 paragraphs, each being 1-2 sentences.
    
    For imagePrompts, create 4 descriptive prompts that would work well for generating illustrations that match specific paragraphs in your story. These should be vivid and specific.`;
  }
}
