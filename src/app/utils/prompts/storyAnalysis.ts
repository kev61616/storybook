/**
 * Utilities for analyzing story content to improve illustration relevance
 * and narrative-aware image generation
 */

/**
 * Narrative element describing a key moment in the story
 */
export interface NarrativeElement {
  paragraphIndex: number;
  type: 'introduction' | 'action' | 'climax' | 'resolution';
  importance: number; // 1-10 scale of visual importance
  characters: string[];
  setting: string;
  action: string;
  description: string;
  emotionalTone: string;
}

/**
 * Character description for visual consistency
 */
export interface CharacterDescription {
  name: string;
  description: string;
  firstAppearance: number; // paragraph index
  importance: number; // 1-10 scale
}

/**
 * Setting/location description for visual consistency
 */
export interface SettingDescription {
  name: string;
  description: string;
  firstAppearance: number; // paragraph index
}

/**
 * Complete story analysis result
 */
export interface StoryAnalysis {
  title: string;
  theme?: string;
  mainCharacters: CharacterDescription[];
  settings: SettingDescription[];
  narrativeElements: NarrativeElement[];
  recommendedImageParagraphs: number[];
}

/**
 * Analyzes story content to identify key narrative elements and visualizable moments
 * 
 * @param title Story title
 * @param content Array of story paragraphs
 * @param theme Optional theme of the story
 * @returns Story analysis with visualization recommendations
 */
export function analyzeStoryContent(
  title: string,
  content: string[],
  theme?: string
): StoryAnalysis {
  // Extract character mentions and estimate importance
  const characterMentions = extractCharacters(content);
  
  // Extract setting descriptions
  const settings = extractSettings(content);
  
  // Find narrative elements (key moments)
  const narrativeElements = identifyNarrativeElements(content);
  
  // Convert to character descriptions
  const mainCharacters = Object.entries(characterMentions)
    .map(([name, mentions]) => {
      // Find first paragraph where character appears
      const firstAppearance = content.findIndex(p => 
        p.toLowerCase().includes(name.toLowerCase())
      );
      
      // Extract description if available
      const descPattern = new RegExp(`${name}[^.!?]*was[^.!?]*`, 'i');
      const descMatch = content.join(' ').match(descPattern);
      const description = descMatch ? descMatch[0] : `Character named ${name}`;
      
      return {
        name,
        description,
        firstAppearance: firstAppearance >= 0 ? firstAppearance : 0,
        importance: Math.min(10, Math.max(1, Math.ceil(mentions / 2)))
      };
    })
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 3); // Limit to top 3 characters
  
  // Select optimal paragraphs for illustration based on narrative importance
  const recommendedImageParagraphs = selectOptimalImageParagraphs(
    content, 
    narrativeElements,
    mainCharacters
  );
  
  return {
    title,
    theme,
    mainCharacters,
    settings,
    narrativeElements,
    recommendedImageParagraphs
  };
}

/**
 * Extracts character names and counts mentions
 * 
 * @param paragraphs Story paragraphs
 * @returns Map of character names to mention counts
 */
function extractCharacters(paragraphs: string[]): Record<string, number> {
  const characterMentions: Record<string, number> = {};
  const fullText = paragraphs.join(' ');
  
  // Simple pattern to find names (capitalized words)
  const namePattern = /\b[A-Z][a-z]+\b/g;
  const potentialNames = fullText.match(namePattern) || [];
  
  // Filter common non-name capitalized words
  const commonWords = ['The', 'A', 'An', 'It', 'This', 'That', 'Then', 'But', 'And'];
  
  for (const name of potentialNames) {
    if (commonWords.includes(name)) continue;
    
    // Count occurrences
    const regex = new RegExp(`\\b${name}\\b`, 'g');
    const count = (fullText.match(regex) || []).length;
    
    // Only include if mentioned multiple times (likely a character)
    if (count >= 2) {
      characterMentions[name] = count;
    }
  }
  
  return characterMentions;
}

/**
 * Extracts setting descriptions from story
 * 
 * @param paragraphs Story paragraphs
 * @returns Array of setting descriptions
 */
function extractSettings(paragraphs: string[]): SettingDescription[] {
  const settings: SettingDescription[] = [];
  
  // Look for setting indicators in early paragraphs
  const settingIndicators = [
    'in the', 'at the', 'inside', 'outside', 'in a', 'near the', 
    'beneath', 'within', 'around', 'village', 'forest', 'castle',
    'house', 'room', 'city', 'town', 'kingdom', 'ocean', 'sea', 'school'
  ];
  
  // Focus on earlier paragraphs for setting establishment
  const earlyParagraphs = paragraphs.slice(0, Math.min(5, paragraphs.length));
  
  earlyParagraphs.forEach((paragraph, idx) => {
    for (const indicator of settingIndicators) {
      if (paragraph.toLowerCase().includes(indicator)) {
        // Extract the setting phrase
        const position = paragraph.toLowerCase().indexOf(indicator);
        const sentenceEnd = paragraph.indexOf('.', position);
        const settingPhrase = paragraph.substring(
          position, 
          sentenceEnd > position ? sentenceEnd : paragraph.length
        );
        
        settings.push({
          name: settingPhrase.trim(),
          description: paragraph,
          firstAppearance: idx
        });
        
        break; // Only extract one setting per paragraph
      }
    }
  });
  
  return settings;
}

/**
 * Identifies key narrative elements in the story
 * 
 * @param paragraphs Story paragraphs
 * @returns Array of narrative elements
 */
function identifyNarrativeElements(paragraphs: string[]): NarrativeElement[] {
  const elements: NarrativeElement[] = [];
  const totalParagraphs = paragraphs.length;
  
  // Intro is usually at the beginning
  if (paragraphs.length > 0) {
    elements.push({
      paragraphIndex: 0,
      type: 'introduction',
      importance: 9, // High importance for establishing shot
      characters: extractNamesFromParagraph(paragraphs[0]),
      setting: extractSettingFromParagraph(paragraphs[0]),
      action: extractActionFromParagraph(paragraphs[0]),
      description: paragraphs[0],
      emotionalTone: determineEmotionalTone(paragraphs[0])
    });
  }
  
  // Action/development in the middle
  if (paragraphs.length > 2) {
    // Find paragraph with action words
    const actionParagraphIndex = findActionParagraph(paragraphs, 1, Math.floor(totalParagraphs * 0.6));
    
    if (actionParagraphIndex !== -1) {
      elements.push({
        paragraphIndex: actionParagraphIndex,
        type: 'action',
        importance: 7,
        characters: extractNamesFromParagraph(paragraphs[actionParagraphIndex]),
        setting: extractSettingFromParagraph(paragraphs[actionParagraphIndex]),
        action: extractActionFromParagraph(paragraphs[actionParagraphIndex]),
        description: paragraphs[actionParagraphIndex],
        emotionalTone: determineEmotionalTone(paragraphs[actionParagraphIndex])
      });
    }
  }
  
  // Climax near the end
  if (paragraphs.length > 3) {
    const climaxIdx = findClimaxParagraph(
      paragraphs,
      Math.floor(totalParagraphs * 0.6),
      Math.floor(totalParagraphs * 0.9)
    );
    
    if (climaxIdx !== -1) {
      elements.push({
        paragraphIndex: climaxIdx,
        type: 'climax',
        importance: 10, // Highest importance for climactic moment
        characters: extractNamesFromParagraph(paragraphs[climaxIdx]),
        setting: extractSettingFromParagraph(paragraphs[climaxIdx]),
        action: extractActionFromParagraph(paragraphs[climaxIdx]),
        description: paragraphs[climaxIdx],
        emotionalTone: determineEmotionalTone(paragraphs[climaxIdx])
      });
    }
  }
  
  // Resolution at the end
  if (paragraphs.length > 1) {
    const resolutionIdx = paragraphs.length - 1;
    
    elements.push({
      paragraphIndex: resolutionIdx,
      type: 'resolution',
      importance: 8,
      characters: extractNamesFromParagraph(paragraphs[resolutionIdx]),
      setting: extractSettingFromParagraph(paragraphs[resolutionIdx]),
      action: extractActionFromParagraph(paragraphs[resolutionIdx]),
      description: paragraphs[resolutionIdx],
      emotionalTone: determineEmotionalTone(paragraphs[resolutionIdx])
    });
  }
  
  return elements;
}

/**
 * Extract character names from a paragraph
 */
function extractNamesFromParagraph(paragraph: string): string[] {
  const namePattern = /\b[A-Z][a-z]+\b/g;
  const potentialNames = paragraph.match(namePattern) || [];
  const commonWords = ['The', 'A', 'An', 'It', 'This', 'That', 'Then', 'But', 'And'];
  
  return potentialNames.filter(name => !commonWords.includes(name));
}

/**
 * Extract the setting description from a paragraph
 */
function extractSettingFromParagraph(paragraph: string): string {
  const settingIndicators = [
    'in the', 'at the', 'inside', 'outside', 'in a', 'near the'
  ];
  
  for (const indicator of settingIndicators) {
    if (paragraph.toLowerCase().includes(indicator)) {
      const position = paragraph.toLowerCase().indexOf(indicator);
      const endPosition = paragraph.indexOf('.', position);
      return paragraph.substring(
        position, 
        endPosition > position ? endPosition : paragraph.length
      ).trim();
    }
  }
  
  return '';
}

/**
 * Extract the main action from a paragraph
 */
function extractActionFromParagraph(paragraph: string): string {
  // Look for verbs followed by objects
  const actionPatterns = [
    /\b(ran|jumped|flew|swam|climbed|found|discovered|opened|closed|said|shouted|whispered)[^.!?]+/gi,
    /\b(looked|saw|heard|felt|touched|smelled|tasted)[^.!?]+/gi,
    /\b(went|came|moved|traveled|journeyed|walked)[^.!?]+/gi
  ];
  
  for (const pattern of actionPatterns) {
    const match = paragraph.match(pattern);
    if (match && match[0]) {
      return match[0].trim();
    }
  }
  
  return '';
}

/**
 * Determine the emotional tone of a paragraph
 */
function determineEmotionalTone(paragraph: string): string {
  const lowerParagraph = paragraph.toLowerCase();
  
  const toneKeywords = {
    happy: ['happy', 'joy', 'excited', 'fun', 'laugh', 'smile', 'delight'],
    sad: ['sad', 'unhappy', 'cry', 'tear', 'lonely', 'sorrow', 'upset'],
    scared: ['afraid', 'fear', 'scary', 'terrified', 'frightened', 'nervous'],
    angry: ['angry', 'mad', 'furious', 'rage', 'yelled', 'shouted'],
    peaceful: ['calm', 'quiet', 'peaceful', 'gentle', 'soft', 'serene'],
    mysterious: ['mystery', 'strange', 'weird', 'curious', 'wonder', 'magical'],
    adventurous: ['adventure', 'explore', 'discover', 'journey', 'quest', 'exciting']
  };
  
  let maxCount = 0;
  let dominantTone = 'neutral';
  
  for (const [tone, keywords] of Object.entries(toneKeywords)) {
    const count = keywords.filter(word => lowerParagraph.includes(word)).length;
    if (count > maxCount) {
      maxCount = count;
      dominantTone = tone;
    }
  }
  
  return dominantTone;
}

/**
 * Find a paragraph with strong action elements
 */
function findActionParagraph(paragraphs: string[], startIdx: number, endIdx: number): number {
  const actionWords = [
    'suddenly', 'quickly', 'raced', 'jumped', 'ran', 'flew',
    'shouted', 'exclaimed', 'burst', 'surprise', 'discovery'
  ];
  
  let bestParagraphIdx = -1;
  let highestScore = 0;
  
  for (let i = startIdx; i <= endIdx && i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].toLowerCase();
    let score = 0;
    
    for (const word of actionWords) {
      if (paragraph.includes(word)) {
        score += 1;
      }
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestParagraphIdx = i;
    }
  }
  
  // If no action paragraph found, select middle paragraph in range
  if (bestParagraphIdx === -1 && startIdx <= endIdx && endIdx < paragraphs.length) {
    return Math.floor((startIdx + endIdx) / 2);
  }
  
  return bestParagraphIdx;
}

/**
 * Find the climax paragraph in the story
 */
function findClimaxParagraph(paragraphs: string[], startIdx: number, endIdx: number): number {
  const climaxIndicators = [
    'finally', 'suddenly', 'at last', 'to their surprise',
    'amazing', 'incredible', 'astonished', 'shocked', 'realized',
    'discovered', 'found', 'revealed'
  ];
  
  let bestParagraphIdx = -1;
  let highestScore = 0;
  
  for (let i = startIdx; i <= endIdx && i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].toLowerCase();
    let score = 0;
    
    for (const indicator of climaxIndicators) {
      if (paragraph.includes(indicator)) {
        score += 1;
      }
    }
    
    // Exclamation points indicate excitement/climax
    score += (paragraph.match(/!/g) || []).length * 2;
    
    if (score > highestScore) {
      highestScore = score;
      bestParagraphIdx = i;
    }
  }
  
  // If no climax paragraph found, select paragraph 3/4 of the way through
  if (bestParagraphIdx === -1) {
    const threeQuarterPoint = Math.floor(paragraphs.length * 0.75);
    return Math.min(threeQuarterPoint, paragraphs.length - 1);
  }
  
  return bestParagraphIdx;
}

/**
 * Select the optimal paragraphs for illustrations
 * 
 * @param paragraphs Story paragraphs
 * @param narrativeElements Identified narrative elements
 * @param characters Character descriptions
 * @returns Array of paragraph indices recommended for illustration
 */
function selectOptimalImageParagraphs(
  paragraphs: string[],
  narrativeElements: NarrativeElement[],
  characters: CharacterDescription[]
): number[] {
  // Start with narrative elements sorted by importance
  const sortedElements = [...narrativeElements].sort((a, b) => b.importance - a.importance);
  
  // Extract paragraph indices, limited to 4 or fewer illustrations
  const recommendedParagraphs = sortedElements
    .slice(0, 4)
    .map(element => element.paragraphIndex);
  
  // Ensure main character introduction is included if not already
  if (characters.length > 0 && !recommendedParagraphs.includes(characters[0].firstAppearance)) {
    // If we haven't reached our limit, add the main character introduction
    if (recommendedParagraphs.length < 4) {
      recommendedParagraphs.push(characters[0].firstAppearance);
    } 
    // Otherwise, replace the least important one
    else if (sortedElements.length > 0 && sortedElements[sortedElements.length - 1].importance < 8) {
      const leastImportantIdx = recommendedParagraphs.indexOf(
        sortedElements[sortedElements.length - 1].paragraphIndex
      );
      if (leastImportantIdx !== -1) {
        recommendedParagraphs[leastImportantIdx] = characters[0].firstAppearance;
      }
    }
  }
  
  // Sort the paragraph indices in ascending order so they appear in story order
  return [...new Set(recommendedParagraphs)].sort((a, b) => a - b);
}

/**
 * Creates a more detailed, context-aware image prompt based on story analysis
 * 
 * @param paragraphContent The paragraph content to illustrate
 * @param analysis Story analysis results
 * @param paragraphIndex The index of the paragraph to be illustrated
 * @returns Enhanced, context-aware image prompt
 */
export function createContextAwareImagePrompt(
  paragraphContent: string,
  analysis: StoryAnalysis,
  paragraphIndex: number
): string {
  // Find narrative element if it exists for this paragraph
  const narrativeElement = analysis.narrativeElements.find(
    elem => elem.paragraphIndex === paragraphIndex
  );
  
  // Determine scene type based on narrative element
  let sceneType = "scene from a children's story";
  let narrativeContext = "";
  
  if (narrativeElement) {
    if (narrativeElement.type === 'introduction') {
      sceneType = "establishing shot";
      narrativeContext = "This scene introduces the story's main setting and character(s).";
    } else if (narrativeElement.type === 'action') {
      sceneType = "action scene";
      narrativeContext = "This is an important moment showing characters in action.";
    } else if (narrativeElement.type === 'climax') {
      sceneType = "climactic moment";
      narrativeContext = "This is the emotional high point of the story.";
    } else if (narrativeElement.type === 'resolution') {
      sceneType = "resolution scene";
      narrativeContext = "This scene shows how the story concludes.";
    }
  }
  
  // Find any characters present in this paragraph
  const charactersPresent = analysis.mainCharacters.filter(character => 
    paragraphContent.toLowerCase().includes(character.name.toLowerCase())
  );
  
  // Create character context
  let characterContext = "";
  if (charactersPresent.length > 0) {
    characterContext = "Including character(s): " + 
      charactersPresent.map(char => char.description).join("; ");
  }
  
  // Extract any setting information
  let settingContext = "";
  const relevantSetting = analysis.settings.find(setting => 
    paragraphContent.toLowerCase().includes(setting.name.toLowerCase())
  );
  
  if (relevantSetting) {
    settingContext = `Setting: ${relevantSetting.name}. `;
  }
  
  // Use emotional tone if available
  let emotionalContext = "";
  if (narrativeElement && narrativeElement.emotionalTone !== 'neutral') {
    emotionalContext = `The emotional tone is ${narrativeElement.emotionalTone}. `;
  }
  
  // Assemble the final prompt
  return `Illustration for "${analysis.title}": A ${sceneType} showing ${paragraphContent} ${characterContext} ${settingContext}${emotionalContext}${narrativeContext}`.trim();
}
