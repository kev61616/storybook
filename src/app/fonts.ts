import { Literata, Nunito, Comic_Neue } from 'next/font/google';

// Literata - Beautiful serif font for reading
export const literata = Literata({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-literata' 
});

// Nunito - Clean, rounded sans-serif for UI
export const nunito = Nunito({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito'
});

// Comic Neue - Child-friendly comic style font
export const comicNeue = Comic_Neue({ 
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-comic'
});

// For OpenDyslexic, we would need to use local font loading
// Since we don't have the actual font file in this example,
// we'll use a CSS class approach that can be configured later
export const openDyslexicClass = 'font-dyslexic';

// Font family classes for use with Typography Context
export const fontFamilyClasses = {
  'standard': literata.variable,
  'comic': comicNeue.variable,
  'dyslexic': openDyslexicClass,
  'ui': nunito.variable
};
