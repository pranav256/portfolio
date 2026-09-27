import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ArtworkMotion } from "@/components/site/artwork-motion";
import { DevelopmentTools } from "@/components/dev/development-tools";
import { site, socialImage } from "@/lib/site";
import "./globals.css";
import "./fonts.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Pranav — Developer & maker", template: "%s — Pranav" },
  description: site.description,
  authors: [{ name: site.name, url: site.github }],
  alternates: { canonical: "/", types: { "application/rss+xml": "/feed.xml" } },
  openGraph: { type: "website", locale: "en", siteName: site.name, title: "Pranav — Developer & maker", description: site.description, url: "/", images: [socialImage] },
  twitter: { card: "summary_large_image", images: [socialImage] },
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
