"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type FontSize = 'small' | 'medium' | 'large';
export type FontFamily = 'standard' | 'dyslexic' | 'comic';
export type LineSpacing = 'compact' | 'standard' | 'spacious';
export type LetterSpacing = 'normal' | 'expanded';

export interface TypographySettings {
  fontSize: FontSize;
  fontFamily: FontFamily;
  lineSpacing: LineSpacing;
  letterSpacing: LetterSpacing;
}

const defaultSettings: TypographySettings = {
  fontSize: 'medium',
  fontFamily: 'standard',
  lineSpacing: 'standard',
  letterSpacing: 'normal'
};

type TypographyContextType = {
  settings: TypographySettings;
  updateSettings: (settings: Partial<TypographySettings>) => void;
  resetSettings: () => void;
  getFontSizeClass: () => string;
  getFontFamilyClass: () => string;
  getLineHeightClass: () => string;
  getLetterSpacingClass: () => string;
};

export const TypographyContext = createContext<TypographyContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  resetSettings: () => {},
  getFontSizeClass: () => '',
  getFontFamilyClass: () => '',
  getLineHeightClass: () => '',
  getLetterSpacingClass: () => '',
});

const STORAGE_KEY = 'storybuddy_typography_settings';

export function TypographyProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TypographySettings>(defaultSettings);
  
  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
        } catch (error) {
          console.error('Failed to parse typography settings:', error);
        }
      }
    }
  }, []);
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings]);
  
  const updateSettings = (newSettings: Partial<TypographySettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };
  
  const resetSettings = () => {
    setSettings(defaultSettings);
  };
  
  // Helper functions to get the appropriate CSS classes
  const getFontSizeClass = (): string => {
    switch (settings.fontSize) {
      case 'small':
        return 'text-base'; // 16px
      case 'medium':
        return 'text-lg'; // 18px
      case 'large':
        return 'text-xl'; // 20px
      default:
        return 'text-lg';
    }
  };
  
  const getFontFamilyClass = (): string => {
    switch (settings.fontFamily) {
      case 'standard':
        return 'font-literata';
      case 'dyslexic':
        return 'font-dyslexic';
      case 'comic':
        return 'font-comic';
      default:
        return 'font-literata';
    }
  };
  
  const getLineHeightClass = (): string => {
    switch (settings.lineSpacing) {
      case 'compact':
        return 'leading-relaxed'; // 1.5
      case 'standard':
        return 'leading-loose'; // 1.75
      case 'spacious':
        return 'leading-[1.9]'; // 1.9
      default:
        return 'leading-loose';
    }
  };
  
  const getLetterSpacingClass = (): string => {
    switch (settings.letterSpacing) {
      case 'normal':
        return 'tracking-normal';
      case 'expanded':
        return 'tracking-wide';
      default:
        return 'tracking-normal';
    }
  };
  
  const value = {
    settings,
    updateSettings,
    resetSettings,
    getFontSizeClass,
    getFontFamilyClass,
    getLineHeightClass,
    getLetterSpacingClass,
  };
  
  return (
    <TypographyContext.Provider value={value}>
      {children}
    </TypographyContext.Provider>
  );
}

export function useTypography() {
  return useContext(TypographyContext);
}
