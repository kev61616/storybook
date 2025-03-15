import type { Metadata } from "next";
import "./globals.css";
import { TypographyProvider } from "./context/TypographyContext";
import { literata, nunito, comicNeue } from "./fonts";

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
        className={`${literata.variable} ${nunito.variable} ${comicNeue.variable} antialiased bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen`}
      >
        <TypographyProvider>
          {children}
        </TypographyProvider>
      </body>
    </html>
  );
}
