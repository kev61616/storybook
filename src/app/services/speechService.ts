"use client";

export interface SpeechOptions {
  rate: number;
  pitch: number;
  voice: string | null;
}

const defaultOptions: SpeechOptions = {
  rate: 1.0,
  pitch: 1.0,
  voice: null,
};

/**
 * SpeechService - Text-to-speech functionality for story narration
 * Uses the Web Speech API for cross-browser compatibility
 */
class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;
  private options: SpeechOptions = defaultOptions;
  private isPlaying: boolean = false;
  private currentIndex: number = 0;
  private textQueue: string[] = [];
  private onHighlightCallback: ((index: number) => void) | null = null;
  private onPlayStatusChange: ((isPlaying: boolean) => void) | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      
      // Initialize voices if available immediately
      this.voices = this.synth?.getVoices() || [];
      
      // Otherwise set up the onvoiceschanged event
      if (this.voices.length === 0 && this.synth) {
        this.synth.onvoiceschanged = () => {
          this.voices = this.synth?.getVoices() || [];
        };
      }
    }
  }
  
  /**
   * Set speech options like rate, pitch, and voice
   */
  public setOptions(options: Partial<SpeechOptions>): void {
    this.options = { ...this.options, ...options };
    
    // If currently speaking, apply changes to active utterance
    if (this.utterance && this.isPlaying) {
      this.utterance.rate = this.options.rate;
      this.utterance.pitch = this.options.pitch;
      
      // Apply voice if specified and available
      if (this.options.voice) {
        const voice = this.voices.find(v => v.name === this.options.voice);
        if (voice && this.utterance) {
          this.utterance.voice = voice;
        }
      }
    }
  }
  
  /**
   * Get available voices for speech synthesis
   */
  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
  
  /**
   * Set callback for highlighting current text
   */
  public setOnHighlight(callback: (index: number) => void): void {
    this.onHighlightCallback = callback;
  }
  
  /**
   * Set callback for play status changes
   */
  public setOnPlayStatusChange(callback: (isPlaying: boolean) => void): void {
    this.onPlayStatusChange = callback;
    // Ensure callback is called with initial state
    if (callback) {
      callback(this.isPlaying);
    }
  }
  
  /**
   * Start speaking the provided text array
   */
  public speak(texts: string[]): void {
    if (!this.synth) return;
    
    // Store the text queue
    this.textQueue = texts;
    this.currentIndex = 0;
    
    // Start speaking the first item
    this.speakCurrent();
  }
  
  /**
   * Pause current speech
   */
  public pause(): void {
    if (!this.synth) return;
    
    if (this.isPlaying) {
      this.synth.pause();
      this.isPlaying = false;
      
      // Notify listeners
      if (this.onPlayStatusChange) {
        this.onPlayStatusChange(false);
      }
    }
  }
  
  /**
   * Resume paused speech
   */
  public resume(): void {
    if (!this.synth) return;
    
    if (!this.isPlaying && this.utterance) {
      this.synth.resume();
      this.isPlaying = true;
      
      // Notify listeners
      if (this.onPlayStatusChange) {
        this.onPlayStatusChange(true);
      }
    }
  }
  
  /**
   * Stop all speech and reset
   */
  public stop(): void {
    if (!this.synth) return;
    
    this.synth.cancel();
    this.isPlaying = false;
    this.currentIndex = 0;
    
    // Notify listeners
    if (this.onPlayStatusChange) {
      this.onPlayStatusChange(false);
    }
  }
  
  /**
   * Jump to a specific index in the text queue
   */
  public jumpTo(index: number): void {
    if (!this.synth || index < 0 || index >= this.textQueue.length) return;
    
    // Stop current speech
    this.synth.cancel();
    
    // Update index and start speaking
    this.currentIndex = index;
    this.speakCurrent();
  }
  
  /**
   * Check if speech service is currently playing
   */
  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
  
  /**
   * Get current paragraph index being spoken
   */
  public getCurrentIndex(): number {
    return this.currentIndex;
  }
  
  /**
   * Toggle play/pause
   */
  public togglePlayPause(): void {
    if (this.isPlaying) {
      this.pause();
    } else if (this.currentIndex < this.textQueue.length) {
      this.resume();
    } else {
      // If we've reached the end, start over
      this.currentIndex = 0;
      this.speakCurrent();
    }
  }
  
  /**
   * Speak the current item in the queue
   * Private method for internal use
   */
  private speakCurrent(): void {
    if (!this.synth) return;
    
    if (this.currentIndex >= this.textQueue.length) {
      // We've reached the end
      this.isPlaying = false;
      if (this.onPlayStatusChange) {
        this.onPlayStatusChange(false);
      }
      return;
    }
    
    const text = this.textQueue[this.currentIndex];
    this.utterance = new SpeechSynthesisUtterance(text);
    
    // Apply options
    this.utterance.rate = this.options.rate;
    this.utterance.pitch = this.options.pitch;
    
    // Apply voice if specified
    if (this.options.voice) {
      const voice = this.voices.find(v => v.name === this.options.voice);
      if (voice && this.utterance) {
        this.utterance.voice = voice;
      }
    }
    
    // Highlight current paragraph
    if (this.onHighlightCallback) {
      this.onHighlightCallback(this.currentIndex);
    }
    
    // Set up events
    this.utterance.onend = () => {
      this.currentIndex++;
      this.speakCurrent();
    };
    
    this.utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isPlaying = false;
      if (this.onPlayStatusChange) {
        this.onPlayStatusChange(false);
      }
    };
    
    // Start speaking
    this.synth.speak(this.utterance);
    this.isPlaying = true;
    
    // Notify listeners
    if (this.onPlayStatusChange) {
      this.onPlayStatusChange(true);
    }
  }
}

// Create a singleton instance for use throughout the app
// Will be null during server-side rendering
export const speechService = typeof window !== 'undefined' 
  ? new SpeechService() 
  : null;
