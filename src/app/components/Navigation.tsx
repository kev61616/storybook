"use client";

import React, { useState } from "react";
import Link from "next/link";

/**
 * Navigation component for the StoryBuddy app
 * Responsive navbar with mobile menu toggle functionality
 */
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm py-4 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-[family-name:var(--font-baloo)] text-2xl font-bold text-purple-600">
            StoryBuddy
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            href="/" 
            className="font-[family-name:var(--font-baloo)] text-gray-600 hover:text-purple-600 transition-colors"
          >
            Home
          </Link>
          <Link 
            href="/stories/templates" 
            className="font-[family-name:var(--font-baloo)] text-gray-600 hover:text-purple-600 transition-colors"
          >
            Story Templates
          </Link>
          <Link 
            href="/stories/create" 
            className="font-[family-name:var(--font-baloo)] text-gray-600 hover:text-purple-600 transition-colors"
          >
            Create Story
          </Link>
          <Link 
            href="/stories/my-stories" 
            className="font-[family-name:var(--font-baloo)] text-gray-600 hover:text-purple-600 transition-colors"
          >
            My Stories
          </Link>
          <Link 
            href="/stories/create" 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-full font-[family-name:var(--font-baloo)] hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white pt-4 pb-6 px-6 shadow-inner">
          <div className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className="font-[family-name:var(--font-baloo)] text-gray-600 hover:text-purple-600 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/stories/templates" 
              className="font-[family-name:var(--font-baloo)] text-gray-600 hover:text-purple-600 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Story Templates
            </Link>
            <Link 
              href="/stories/create" 
              className="font-[family-name:var(--font-baloo)] text-gray-600 hover:text-purple-600 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Create Story
            </Link>
            <Link 
              href="/stories/my-stories" 
              className="font-[family-name:var(--font-baloo)] text-gray-600 hover:text-purple-600 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              My Stories
            </Link>
            <Link 
              href="/stories/create" 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-full font-[family-name:var(--font-baloo)] hover:opacity-90 transition-opacity text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
