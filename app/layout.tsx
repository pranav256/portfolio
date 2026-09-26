import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ArtworkMotion } from "@/components/site/artwork-motion";
import { DevelopmentTools } from "@/components/dev/development-tools";
import "./globals.css";
import "./fonts.css";

export const metadata: Metadata = {
  title: "Pranav — Developer & maker",
  description: "Open-source tools, web experiments, and notes on building software by Pranav.",
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/inter-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/fraunces-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <ArtworkMotion />
        <DevelopmentTools />
      </body>
    </html>
  );
}
