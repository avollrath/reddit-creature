import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CTC - Chess.com Trading Card",
  description:
    "Turn any Chess.com player into a collectible fantasy card with live profile data, derived playstyle stats, lore, and premium artwork.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap"
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
