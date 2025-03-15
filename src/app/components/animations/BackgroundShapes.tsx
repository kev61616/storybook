"use client";

import React from 'react';
import FloatingElement from './FloatingElement';

interface ShapeProps {
  color: string;
  size: number;
  x: number;
  y: number;
  duration?: number;
  delay?: number;
  type: 'circle' | 'square' | 'triangle' | 'blob';
  opacity?: number;
}

interface BackgroundShapesProps {
  shapes: ShapeProps[];
  className?: string;
}

/**
 * Renders a single decorative shape
 */
const Shape: React.FC<ShapeProps> = ({
  color,
  size,
  x,
  y,
  duration = 4,
  delay = 0,
  type,
  opacity = 0.2
}) => {
  const shapeStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}px`,
    height: type === 'circle' || type === 'square' ? `${size}px` : 'auto',
    backgroundColor: type !== 'triangle' ? color : 'transparent',
    borderRadius: type === 'circle' ? '50%' : type === 'blob' ? '60% 40% 70% 30% / 60% 30% 70% 40%' : '0',
    opacity,
    zIndex: 0,
  };

  if (type === 'triangle') {
    return (
      <FloatingElement
        duration={duration}
        delay={delay}
        yOffset={15}
        xOffset={8}
      >
        <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, opacity }}>
          <svg 
            width={size} 
            height={Math.floor(size * 0.866)} // height of equilateral triangle
            viewBox={`0 0 ${size} ${Math.floor(size * 0.866)}`}
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d={`M${size/2},0 L${size},${size * 0.866} L0,${size * 0.866} Z`} 
              fill={color}
            />
          </svg>
        </div>
      </FloatingElement>
    );
  }

  return (
    <FloatingElement
      duration={duration}
      delay={delay}
      yOffset={15}
      xOffset={type === 'blob' ? 10 : 5}
    >
      <div style={shapeStyle} />
    </FloatingElement>
  );
};

/**
 * Background Shapes Component
 * Creates a decorative background with animated shapes
 */
export default function BackgroundShapes({ shapes, className = '' }: BackgroundShapesProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {shapes.map((shape, index) => (
        <Shape key={index} {...shape} />
      ))}
    </div>
  );
}

/**
 * Generates a random set of shapes with theme-appropriate colors
 */
export function generateShapes(
  count: number = 8, 
  colorScheme: string[] = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981']
): ShapeProps[] {
  const shapes: ShapeProps[] = [];
  const types: ('circle' | 'square' | 'triangle' | 'blob')[] = ['circle', 'square', 'triangle', 'blob'];
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const color = colorScheme[Math.floor(Math.random() * colorScheme.length)];
    
    shapes.push({
      type,
      color,
      size: 20 + Math.random() * 60, // Between 20px and 80px
      x: Math.random() * 100,
      y: Math.random() * 100,
      opacity: 0.05 + Math.random() * 0.15, // Between 0.05 and 0.2
      duration: 3 + Math.random() * 4, // Between 3 and 7 seconds
      delay: Math.random() * 2 // Between 0 and 2 seconds
    });
  }
  
  return shapes;
}

/**
 * Predefined shape sets for different themes
 */
export const themeShapes = {
  adventure: generateShapes(10, ['#FBBF24', '#F97316', '#F43F5E', '#60A5FA']),
  fantasy: generateShapes(10, ['#8B5CF6', '#EC4899', '#A855F7', '#60A5FA']),
  space: generateShapes(10, ['#3B82F6', '#1E40AF', '#6366F1', '#4F46E5']),
  dinosaurs: generateShapes(10, ['#10B981', '#059669', '#84CC16', '#4F46E5']),
  underwater: generateShapes(10, ['#0EA5E9', '#0284C7', '#06B6D4', '#0891B2']),
  default: generateShapes(10, ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981'])
};
