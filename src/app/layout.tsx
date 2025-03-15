import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Baloo_2 } from "next/font/google";
import "./globals.css";

// Main font for most text
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// For code and technical elements
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fun, rounded font for headings and child-friendly UI elements
const balooFont = Baloo_2({
  weight: ["400", "500", "600", "700"],
  variable: "--font-baloo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StoryBuddy - Interactive Stories for Kids",
  description: "Create beautiful illustrations and stories for children with templates or custom keywords",
  keywords: ["stories", "children", "illustrations", "kids app", "storytelling"],
  authors: [{ name: "StoryBuddy Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${balooFont.variable} antialiased bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
