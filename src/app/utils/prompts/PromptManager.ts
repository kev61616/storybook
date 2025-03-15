/**
 * PromptManager.ts
 * 
 * A token-aware prompt management system for optimizing LLM prompts.
 * - Tracks token usage across prompt components
 * - Manages token budgets and limits
 * - Provides modular prompt assembly
 * - Optimizes prompts for quality and efficiency
 */

import { Tiktoken, encoding_for_model, get_encoding } from 'tiktoken';

/**
 * Models supported for tokenization
 */
export type SupportedModel = 'gpt-4o' | 'gpt-4-turbo' | 'gpt-4' | 'gpt-3.5-turbo';

/**
 * Prompt component types
 */
export type PromptComponentType = 
  | 'system' 
  | 'instruction' 
  | 'context' 
  | 'example' 
  | 'user_input'
  | 'formatting';

/**
 * A prompt component representing a discrete section of a prompt
 */
export interface PromptComponent {
  id: string;
  type: PromptComponentType;
  content: string;
  required?: boolean;
  maxTokens?: number;
  priority?: number; // Higher number = higher priority
}

/**
 * Token budget configuration
 */
export interface TokenBudget {
  total: number;
  system?: number;
  instruction?: number;
  context?: number;
  example?: number;
  user_input?: number;
  formatting?: number;
  reserved?: number; // Reserved for system overhead, safety margin
}

/**
 * Default token budgets by model
 */
export const DEFAULT_TOKEN_BUDGETS: Record<SupportedModel, TokenBudget> = {
  'gpt-4o': {
    total: 128000,
    system: 1000,
    instruction: 2000,
    context: 100000,
    example: 3000,
    user_input: 10000,
    formatting: 500,
    reserved: 8000
  },
  'gpt-4-turbo': {
    total: 128000,
    system: 1000,
    instruction: 2000,
    context: 100000,
    example: 3000,
    user_input: 10000,
    formatting: 500,
    reserved: 8000
  },
  'gpt-4': {
    total: 8192,
    system: 800,
    instruction: 1000,
    context: 4000,
    example: 1000,
    user_input: 500,
    formatting: 300,
    reserved: 592
  },
  'gpt-3.5-turbo': {
    total: 16385,
    system: 500,
    instruction: 800,
    context: 10000,
    example: 800,
    user_input: 300,
    formatting: 200,
    reserved: 500
  }
};

/**
 * Built prompt result including token counts
 */
export interface BuiltPrompt {
  systemPrompt: string;
  userPrompt: string;
  systemTokens: number;
  userTokens: number;
  totalTokens: number;
  components: {
    id: string;
    type: PromptComponentType;
    tokens: number;
    included: boolean;
  }[];
}

/**
 * PromptManager class for token-aware prompt construction
 */
export class PromptManager {
  private model: SupportedModel;
  private tokenBudget: TokenBudget;
  private components: PromptComponent[];
  private tokenizer: Tiktoken;
  private templateVariables: Record<string, string>;

  /**
   * Create a new PromptManager
   * @param model - The LLM model to optimize for
   * @param customTokenBudget - Optional custom token budget (overrides defaults)
   */
  constructor(model: SupportedModel = 'gpt-4o', customTokenBudget?: Partial<TokenBudget>) {
    this.model = model;
    this.tokenBudget = {
      ...DEFAULT_TOKEN_BUDGETS[model],
      ...customTokenBudget
    };
    this.components = [];
    this.templateVariables = {};
    
    try {
      // Try to get model-specific tokenizer
      this.tokenizer = encoding_for_model(model);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      // Fall back to cl100k_base which works for GPT-4 & GPT-3.5-turbo
      this.tokenizer = get_encoding('cl100k_base');
      console.warn(`Specific tokenizer for ${model} not found, using cl100k_base instead.`);
    }
  }

  /**
   * Count tokens in a string using the appropriate tokenizer
   * @param text - Text to tokenize
   * @returns Number of tokens
   */
  countTokens(text: string): number {
    if (!text) return 0;
    const tokens = this.tokenizer.encode(text);
    return tokens.length;
  }
  
  /**
   * Add a prompt component to the manager
   * @param component - The prompt component to add
   * @returns The PromptManager instance (for chaining)
   */
  addComponent(component: PromptComponent): PromptManager {
    // Check for duplicate ID
    if (this.components.some(c => c.id === component.id)) {
      throw new Error(`Component with ID "${component.id}" already exists`);
    }
    
    this.components.push(component);
    return this;
  }
  
  /**
   * Add multiple prompt components at once
   * @param components - Array of prompt components
   * @returns The PromptManager instance (for chaining)
   */
  addComponents(components: PromptComponent[]): PromptManager {
    components.forEach(component => this.addComponent(component));
    return this;
  }
  
  /**
   * Remove a prompt component by ID
   * @param id - The ID of the component to remove
   * @returns The PromptManager instance (for chaining)
   */
  removeComponent(id: string): PromptManager {
    this.components = this.components.filter(c => c.id !== id);
    return this;
  }
  
  /**
   * Set variables to be used in prompt templates
   * @param variables - Key-value pairs for template variables
   * @returns The PromptManager instance (for chaining)
   */
  setTemplateVariables(variables: Record<string, string>): PromptManager {
    this.templateVariables = {
      ...this.templateVariables,
      ...variables
    };
    return this;
  }

  /**
   * Set a single template variable
   * @param key - The variable name
   * @param value - The variable value
   * @returns The PromptManager instance (for chaining)
   */
  setTemplateVariable(key: string, value: string): PromptManager {
    this.templateVariables[key] = value;
    return this;
  }
  
  /**
   * Apply template variables to a string
   * @param text - The template string with {{variable}} placeholders
   * @returns The processed string with variables replaced
   */
  private applyTemplateVariables(text: string): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return this.templateVariables[key] || `{{${key}}}`;
    });
  }
  
  /**
   * Truncate text to fit within a token budget
   * @param text - Text to truncate
   * @param maxTokens - Maximum tokens allowed
   * @returns Truncated text
   */
  truncateToTokenLimit(text: string, maxTokens: number): string {
    if (!text) return '';
    
    const tokens = this.tokenizer.encode(text);
    if (tokens.length <= maxTokens) return text;
    
    // Truncate tokens and decode back to text
    const truncatedTokens = tokens.slice(0, maxTokens);
    return this.tokenizer.decode(truncatedTokens) + ' [truncated]';
  }
  
  /**
   * Builds the final prompt based on components and token budget
   * @returns The built prompt object
   */
  buildPrompt(): BuiltPrompt {
    const systemComponents: PromptComponent[] = [];
    const userComponents: PromptComponent[] = [];
    
    // Process and sort components by priority (higher first)
    const sortedComponents = [...this.components].sort((a, b) => 
      (b.priority || 0) - (a.priority || 0)
    );
    
    // First pass: gather required components and check their token counts
    let systemTokenCount = 0;
    let userTokenCount = 0;
    
    // Track components that will be included in final prompt
    const includedComponents: {
      id: string;
      type: PromptComponentType;
      tokens: number;
      included: boolean;
    }[] = [];
    
    // Process components and allocate to system or user prompt
    for (const component of sortedComponents) {
      // Apply variables to component content
      const processedContent = this.applyTemplateVariables(component.content);
      
      // Count tokens
      const tokenCount = this.countTokens(processedContent);
      const maxTypeTokens = this.tokenBudget[component.type] || Infinity;
      
      // Check if we can include this component
      const canIncludeInSystem = component.type === 'system' && 
                                (systemTokenCount + tokenCount) <= maxTypeTokens;
      
      const canIncludeInUser = component.type !== 'system' && 
                              (userTokenCount + tokenCount) <= (this.tokenBudget.total - systemTokenCount - (this.tokenBudget.reserved || 0));
      
      // If component is required but exceeds budget, truncate it
      if (component.required && !canIncludeInSystem && !canIncludeInUser) {
        const availableBudget = component.type === 'system' 
          ? Math.max(0, maxTypeTokens - systemTokenCount)
          : Math.max(0, this.tokenBudget.total - systemTokenCount - userTokenCount - (this.tokenBudget.reserved || 0));
        
        const truncatedContent = this.truncateToTokenLimit(processedContent, availableBudget);
        const truncatedTokenCount = this.countTokens(truncatedContent);
        
        if (component.type === 'system') {
          systemComponents.push({...component, content: truncatedContent});
          systemTokenCount += truncatedTokenCount;
        } else {
          userComponents.push({...component, content: truncatedContent});
          userTokenCount += truncatedTokenCount;
        }
        
        includedComponents.push({
          id: component.id,
          type: component.type,
          tokens: truncatedTokenCount,
          included: true
        });
      }
      // If component fits in budget, include it as is
      else if ((component.type === 'system' && canIncludeInSystem) || 
               (component.type !== 'system' && canIncludeInUser)) {
        if (component.type === 'system') {
          systemComponents.push({...component, content: processedContent});
          systemTokenCount += tokenCount;
        } else {
          userComponents.push({...component, content: processedContent});
          userTokenCount += tokenCount;
        }
        
        includedComponents.push({
          id: component.id,
          type: component.type,
          tokens: tokenCount,
          included: true
        });
      }
      // Component doesn't fit and isn't required
      else {
        includedComponents.push({
          id: component.id,
          type: component.type,
          tokens: tokenCount,
          included: false
        });
      }
    }
    
    // Build final prompt strings
    const systemPrompt = systemComponents
      .map(component => component.content)
      .join('\n\n');
    
    const userPrompt = userComponents
      .map(component => component.content)
      .join('\n\n');
    
    return {
      systemPrompt,
      userPrompt,
      systemTokens: systemTokenCount,
      userTokens: userTokenCount,
      totalTokens: systemTokenCount + userTokenCount,
      components: includedComponents
    };
  }
  
  /**
   * Creates OpenAI-compatible message objects for chat completions
   * @returns Array of message objects for OpenAI API
   */
  createChatCompletionMessages(): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    const { systemPrompt, userPrompt } = this.buildPrompt();
    
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    
    if (systemPrompt) {
      messages.push({
        role: "system",
        content: systemPrompt
      });
    }
    
    if (userPrompt) {
      messages.push({
        role: "user",
        content: userPrompt
      });
    }
    
    return messages;
  }

  /**
   * Utility to create a reusable prompt template
   * @param templateName - Unique name for this prompt template
   * @param components - The set of components for this template
   * @returns A template object
   */
  static createTemplate(templateName: string, components: PromptComponent[]) {
    return {
      name: templateName,
      components,
      instantiate: (model: SupportedModel = 'gpt-4o', variables: Record<string, string> = {}) => {
        const manager = new PromptManager(model);
        manager.addComponents(components);
        manager.setTemplateVariables(variables);
        return manager;
      }
    };
  }
}

/**
 * Common prompt formatting utilities
 */
export const PromptFormatters = {
  /**
   * Formats a list array into a numbered or bulleted list
   * @param items - Array of list items
   * @param numbered - Whether to use numbers (true) or bullets (false)
   * @returns Formatted list string
   */
  formatList: (items: string[], numbered: boolean = false): string => {
    return items.map((item, index) => 
      numbered ? `${index + 1}. ${item}` : `• ${item}`
    ).join('\n');
  },
  
  /**
   * Creates a section with a title
   * @param title - Section title
   * @param content - Section content
   * @returns Formatted section string
   */
  formatSection: (title: string, content: string): string => {
    return `## ${title}\n\n${content}`;
  },
  
  /**
   * Formats key-value pairs as a structured table
   * @param data - Object containing key-value pairs
   * @returns Formatted key-value table string
   */
  formatKeyValue: (data: Record<string, string>): string => {
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  },
  
  /**
   * Formats code with proper language syntax
   * @param code - Code to format
   * @param language - Programming language
   * @returns Formatted code block
   */
  formatCode: (code: string, language: string = ''): string => {
    return `\`\`\`${language}\n${code}\n\`\`\``;
  },
  
  /**
   * Formats JSON data for prompts
   * @param data - Object to format as JSON
   * @returns Formatted JSON string
   */
  formatJSON: <T extends Record<string, unknown>>(data: T): string => {
    return '```json\n' + JSON.stringify(data, null, 2) + '\n```';
  }
};
