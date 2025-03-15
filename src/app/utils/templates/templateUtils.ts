import { StoryTheme } from '../../types';
import { TEMPLATE_THEME_COLORS, STORY_TEMPLATES, StoryTemplate } from './templateData';

/**
 * Gets a template's details by ID
 * @param templateId - The template identifier to look up
 * @returns The matching template or undefined if not found
 */
export function getTemplateById(templateId: string): StoryTemplate | undefined {
  return STORY_TEMPLATES.find(template => template.id === templateId);
}

/**
 * Gets template theme colors for UI styling
 * @param templateId - The template identifier to look up
 * @returns Theme colors object for the template, or default colors if not found
 */
export function getTemplateTheme(templateId?: string): StoryTheme {
  if (!templateId) return TEMPLATE_THEME_COLORS['default'];
  return TEMPLATE_THEME_COLORS[templateId] || TEMPLATE_THEME_COLORS['default'];
}

/**
 * Gets the display title for a template
 * @param templateId - The template identifier
 * @returns The display title, or capitalized ID if template not found
 */
export function getTemplateTitle(templateId?: string): string {
  if (!templateId) return "";
  
  const template = getTemplateById(templateId);
  return template?.title || templateId.charAt(0).toUpperCase() + templateId.slice(1);
}

/**
 * Gets the emoji for a template
 * @param templateId - The template identifier
 * @returns The emoji, or a default book emoji if template not found
 */
export function getTemplateEmoji(templateId?: string): string {
  if (!templateId) return "📚";
  
  const template = getTemplateById(templateId);
  return template?.emoji || "📚";
}

/**
 * Filters templates suitable for a specific age range
 * @param ageRange - Age range to filter by (e.g., "3-5", "6-8", "9-12")
 * @returns Filtered list of templates
 */
export function getTemplatesByAgeRange(ageRange: string): StoryTemplate[] {
  return STORY_TEMPLATES.filter(template => 
    template.ageRanges.includes(ageRange)
  );
}

/**
 * Gets a random template ID
 * @param ageRange - Optional age range to filter by
 * @returns Random template ID
 */
export function getRandomTemplateId(ageRange?: string): string {
  let templates = STORY_TEMPLATES;
  
  // Filter by age range if provided
  if (ageRange) {
    templates = getTemplatesByAgeRange(ageRange);
  }
  
  // Return a random template ID
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex].id;
}
