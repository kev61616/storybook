/**
 * Utility functions for image prompt generation
 * Enhanced for higher quality, more beautiful illustrations
 */

/**
 * Base system prompt for illustration generation
 */
export const IMAGE_SYSTEM_PROMPT = 
  "You are a master children's book illustrator with expertise in creating stunning, professional-quality illustrations. Your work combines the charm of classic Golden Books with modern digital techniques. You create richly detailed, emotionally resonant, and age-appropriate illustrations with perfect composition, lighting, and color harmony.";

/**
 * Art style definitions for different illustration approaches
 */
export const ART_STYLES = {
  watercolor: "Create a soft, dreamy watercolor illustration with delicate brush strokes, gentle color transitions, and subtle textures. Use a light touch with transparent layers that blend beautifully while maintaining clear subject definition.",
  
  cartoon: "Create a cheerful cartoon illustration with clean outlines, flat vibrant colors, expressive characters, and simplified backgrounds. Use strong shapes, exaggerated proportions, and playful elements that appeal to children.",
  
  papercraft: "Create an illustration that resembles an intricate paper craft with layered paper elements, subtle drop shadows, and textured details. Show depth through carefully constructed paper layers with a handmade aesthetic.",
  
  vintage: "Create a nostalgic vintage illustration reminiscent of classic children's books from the 1950s-60s with slightly muted colors, textured brushwork, careful composition, and charming character designs with a timeless quality.",
  
  digital: "Create a polished digital illustration with smooth gradients, perfect lighting effects, sharp details, and contemporary design elements. Use depth of field, dramatic lighting, and rich colors for a modern, professional look.",
  
  storybook: "Create a magical storybook illustration with rich details, slightly exaggerated proportions, whimsical elements, and an inviting color palette. Include subtle patterns, thoughtful textures, and charming background details.",
};

/**
 * Scene composition guides for better image structure
 */
export const SCENE_COMPOSITIONS = {
  character_focused: "Frame the character(s) prominently in the center of the composition, with supportive environmental elements arranged to direct attention to them. Use lighting to highlight the character while maintaining balanced overall composition.",
  
  landscape: "Create a wide, panoramic composition that showcases the environment with characters appropriately scaled and positioned. Pay attention to horizon placement, foreground/middle-ground/background relationships, and natural directional flow.",
  
  action: "Capture a dynamic moment with diagonal composition elements, implied motion lines, and energetic character poses. Position characters to show movement through the scene with appropriate environmental reaction elements.",
  
  intimate: "Create a close, personal composition focusing on emotional character moments with soft background elements. Use tight framing, warm lighting, and subtle color harmony to create a sense of connection.",
  
  dramatic: "Design a composition with strong light and shadow contrasts, interesting viewing angles, and emotional intensity. Use compositional elements to create visual tension appropriate for the scene's mood."
};

/**
 * Lighting styles for enhanced illustration mood
 */
export const LIGHTING_STYLES = {
  soft: "Illuminate the scene with soft, diffused lighting that creates gentle shadows and a warm, comforting atmosphere. Use subtle highlights to define form without harsh contrasts.",
  
  golden_hour: "Bathe the scene in warm, golden sunlight reminiscent of late afternoon, with long, soft shadows and a rich amber glow that adds warmth and nostalgia to the illustration.",
  
  moonlight: "Light the scene with cool, blue-tinted moonlight that creates a magical, dreamy quality with soft shadows and subtle highlighting on important elements.",
  
  dramatic: "Use strong directional lighting with significant contrast between light and shadow areas to create visual drama and highlight key elements of the illustration.",
  
  magical: "Incorporate glowing, ethereal light sources with visible light rays, gentle particle effects, and luminous highlights that suggest wonder and enchantment."
};

/**
 * Enhances an image prompt to make it suitable for high-quality children's illustrations
 * @param basePrompt - The original image prompt
 * @param artStyle - Optional preferred art style
 * @returns Enhanced prompt for better, more beautiful illustrations
 */
export function enhanceImagePrompt(basePrompt: string, artStyle?: keyof typeof ART_STYLES): string {
  // Default to storybook style if none specified
  const style = artStyle ? ART_STYLES[artStyle] : ART_STYLES.storybook;
  
  // Select a composition approach based on prompt content
  let composition = SCENE_COMPOSITIONS.character_focused;
  if (basePrompt.toLowerCase().includes("action") || basePrompt.toLowerCase().includes("running")) {
    composition = SCENE_COMPOSITIONS.action;
  } else if (basePrompt.toLowerCase().includes("landscape") || basePrompt.toLowerCase().includes("forest")) {
    composition = SCENE_COMPOSITIONS.landscape;
  }
  
  // Select lighting based on scene mood
  let lighting = LIGHTING_STYLES.soft;
  if (basePrompt.toLowerCase().includes("night") || basePrompt.toLowerCase().includes("dark")) {
    lighting = LIGHTING_STYLES.moonlight;
  } else if (basePrompt.toLowerCase().includes("magic") || basePrompt.toLowerCase().includes("sparkle")) {
    lighting = LIGHTING_STYLES.magical;
  } else if (basePrompt.toLowerCase().includes("sunset") || basePrompt.toLowerCase().includes("warm")) {
    lighting = LIGHTING_STYLES.golden_hour;
  }
  
  // Build the enhanced prompt
  return `Create a beautiful, high-quality illustration for a premium children's storybook: ${basePrompt}
  
${style}

${composition}

${lighting}

The illustration should be rich in detail but maintain clarity and focus, with perfect color harmony and balanced composition. Create emotionally engaging characters with expressive faces and body language. Include subtle background details that enhance the story context without overwhelming. The final result should look like it belongs in an award-winning children's book with professional publishing quality. Make it appropriate for children aged 4-10, with a positive, uplifting feeling.`;
}

/**
 * Creates a consistent style prompt for a series of illustrations
 * Enhanced for better visual continuity and professional quality
 * @param storyTitle - The title of the story
 * @param theme - Optional theme to influence the art style
 * @param artStyle - Optional preferred art style
 * @returns A style prompt to ensure consistent, beautiful illustrations
 */
export function createStylePrompt(
  storyTitle: string, 
  theme?: string, 
  artStyle?: keyof typeof ART_STYLES
): string {
  // Start with base style guidance
  let styleBase = `For the story "${storyTitle}", create a cohesive series of illustrations with these consistent elements:`;
  
  // Add theme-specific style guidance
  if (theme) {
    const themeStyleMap: Record<string, string> = {
      'adventure': `
• A vibrant, dynamic color palette dominated by warm amber, rich greens, and deep blues
• Dramatic lighting with directional sunbeams or dappled forest light
• Slightly exaggerated perspective that emphasizes the sense of exploration
• Consistent character design with expressive, determined facial expressions
• Environmental details that suggest vastness and discovery (maps, paths, distant landmarks)
• Textural elements like rough stone, weathered wood, and wild vegetation`,

      'animals': `
• A harmonious natural color palette with warm earth tones and gentle highlights
• Soft, diffused lighting that creates a nurturing atmosphere
• Carefully designed animal characters with consistent proportions and expressive faces
• Subtle anthropomorphic details while maintaining authentic animal characteristics
• Environmental elements showing natural habitats with seasonal consistency
• Textural details in fur, feathers, and natural environments`,

      'fantasy': `
• A dreamy color palette with jewel tones and ethereal pastels
• Magical lighting effects with glowing elements and light particles
• Fantastical architecture and landscape features with consistent design language
• Otherworldly flora and fauna with coherent biological design
• Recurring magical motifs and symbols throughout illustrations
• Slight atmospheric haze or mist to enhance the magical quality`,

      'space': `
• A cosmic color palette dominated by deep indigos, vibrant nebula colors, and starlight
• Dramatic light sources from stars, spacecraft, or alien technology
• Scientific attention to astronomical accuracy balanced with artistic wonder
• Consistent portrayal of zero-gravity effects on characters and objects
• Technical details in spacecraft or equipment that follow a unified design language
• A sense of vast scale contrasted with intimate character moments`,

      'underwater': `
• A fluid color palette of aquatic blues, greens, and coral accents
• Refracted light patterns and caustics from surface water
• Consistent bubble effects, water current indicators, and fluid dynamics
• Marine life with accurate yet stylized anatomical features
• Light attenuation effects showing proper underwater depth perception
• Translucent and transparent elements for underwater flora and fauna`,

      'dinosaurs': `
• A prehistoric color palette with earthy tones, lush greens, and dramatic sky colors
• Careful attention to scale relationships between dinosaurs and environment
• Scientifically informed yet child-friendly dinosaur designs
• Consistent portrayal of prehistoric flora appropriate to the time period
• Textural details in dinosaur skin, feathers, scales, and environmental elements
• Dramatic weather or lighting effects to enhance prehistoric atmosphere`,

      'pirates': `
• A weather-beaten color palette with sea blues, ship browns, and treasure golds
• Dynamic lighting from lanterns, sunlight through fog, or stormy skies
• Nautical details with consistent design language for ships, maps, and equipment
• Characters with distinctive silhouettes and consistent costume details
• Ocean textures showing different sea conditions with accurate wave patterns
• Atmospheric elements like sea spray, fog, or tropical air`,

      'fairy': `
• A delicate color palette with luminous pastels and natural jewel tones
• Ethereal lighting with visible light rays, glowing elements, and soft radiance
• Miniature perspective showing the tiny scale of fairy environments
• Botanical accuracy in flowers, plants, and natural elements
• Recurring decorative motifs in fairy architecture, clothing, and objects
• Translucent wing effects with consistent design across fairy characters`
    };
    
    // Use the enhanced theme-specific style if available
    if (themeStyleMap[theme.toLowerCase()]) {
      styleBase += themeStyleMap[theme.toLowerCase()];
    } else {
      // Generic but still detailed style guidance
      styleBase += `
• A cohesive color palette with recurring key colors that reflect the story's mood
• Consistent lighting approach across all illustrations
• Recognizable character design with the same proportions, features, and clothing details
• Environmental consistency in architecture, landscape, and decorative elements
• Similar compositional approach and framing techniques
• Unified texturing and detailing methodology`;
    }
  } else {
    // Default style guidance if no theme is specified
    styleBase += `
• A cohesive color palette with recurring key colors that reflect the story's mood
• Consistent lighting approach across all illustrations
• Recognizable character design with the same proportions, features, and clothing details
• Environmental consistency in architecture, landscape, and decorative elements
• Similar compositional approach and framing techniques
• Unified texturing and detailing methodology`;
  }
  
  // Add art style specification if provided
  if (artStyle && ART_STYLES[artStyle]) {
    styleBase += `\n\nApply this consistent art technique throughout: ${ART_STYLES[artStyle]}`;
  }
  
  // Add final quality guidance
  return `${styleBase}

These illustrations should function as a premium, cohesive series with the polish and quality of award-winning children's books. Maintain perfect visual continuity from one image to the next, as if created by a single master illustrator for a professionally published book.`;
}

/**
 * Creates a specific cover illustration prompt 
 * @param storyTitle - The title of the story
 * @param storyDescription - Brief description of the story content
 * @param theme - Optional theme to influence the cover art
 * @returns A detailed prompt for a beautiful cover illustration
 */
export function createCoverPrompt(
  storyTitle: string,
  storyDescription: string,
  theme?: string
): string {
  // Theme-specific cover guidance
  let themeGuidance = '';
  
  if (theme) {
    const coverThemeMap: Record<string, string> = {
      'adventure': `
• Include natural elements that evoke exploration and discovery
• Use dramatic lighting like a golden sunbeam or the glow of a campfire
• Show a vista or path that suggests an exciting journey ahead
• Include subtle adventure symbols like a compass, map, or landmark
• Create a sense of scale that emphasizes the adventure's grandeur`,

      'animals': `
• Feature the main animal character(s) in an expressive, endearing pose
• Show the natural habitat with accurate but stylized environmental details
• Use warm, nurturing lighting that highlights the animal's features
• Include subtle details of fur, feathers, or scales with beautiful texturing
• Balance realism with child-friendly styling for the animal characters`,

      'fantasy': `
• Include magical elements like sparkling effects, glowing objects, or enchanted items
• Create an otherworldly atmosphere with ethereal lighting and mystical colors
• Feature fantastical architecture or landscape elements in the background
• Include subtle magical symbols or motifs that relate to the story
• Balance the magical elements with emotional character connection`,

      'space': `
• Create a cosmic backdrop with stunning nebula colors and star details
• Feature spacecraft, planets, or astronomical objects with scientific inspiration
• Use dramatic lighting from stars, planets, or technology sources
• Show a sense of wonder and discovery through character positioning
• Include technical details that suggest advanced technology and space travel`,

      'underwater': `
• Create a vibrant underwater scene with beautifully rendered water effects
• Include refracted light rays filtering down from the surface
• Feature marine life with scientifically inspired but stylized designs
• Show bubbles, currents, or other dynamic water elements
• Use a color palette dominated by aquatic blues and greens with coral accents`,

      'pirates': `
• Feature nautical elements like ships, treasure, or maps with intricate details
• Create a dramatic maritime sky with dynamic cloud formations
• Show the contrast between adventure and discovery through character expressions
• Include authentic sailing details with historically inspired ship elements
• Use a color palette dominated by rich blues, weathered browns, and treasure golds`,

      'fairy': `
• Create a miniature perspective that shows the tiny scale of the fairy world
• Include luminous, magical lighting effects with soft glowing elements
• Feature delicate natural elements like flowers, leaves, and dewdrops
• Show intricate fairy architecture or clothing with consistent design language
• Use translucent wing effects with subtle rainbow highlights`
    };

    // If we have specific guidance for this theme, add it
    if (coverThemeMap[theme.toLowerCase()]) {
      themeGuidance = `\n\nFor this ${theme.toLowerCase()} themed cover, apply these special considerations:${coverThemeMap[theme.toLowerCase()]}`;
    }
  }
  
  return `Create a stunning, premium-quality cover illustration for a children's book titled "${storyTitle}". 
  
Story description: ${storyDescription}

This should be the most beautiful and captivating illustration of the series, designed to immediately draw in readers with:

• A perfectly balanced composition featuring the main character(s) in a defining moment
• Rich, vibrant colors with perfect harmony and a subtle vignette effect
• Professional-level lighting with dramatic highlights and shadows
• Exceptional detail in foreground elements while maintaining clear focal points
• A hint of the story's world and adventure visible in the background
• Thoughtfully designed negative space perfect for title text placement
• Slightly exaggerated proportions and expressions for emotional impact
• A sense of wonder, possibility, and invitation to open the book${themeGuidance}

The style should be sophisticated yet appealing to children, with the quality and charm of classic Golden Books combined with modern illustration techniques. Include subtle textures and fine details that reward closer inspection.

The cover should look like it belongs on a bestselling, award-winning children's book with exceptional production values and artistic merit.`;
}
