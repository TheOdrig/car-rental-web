import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CarRental - Find Your Perfect Ride",
    template: "%s | CarRental",
  },
  description:
    "Discover and rent quality vehicles at competitive prices. Easy booking, flexible pickup, and exceptional customer service.",
  keywords: [
    "car rental",
    "rent a car",
    "vehicle rental",
    "car hire",
    "affordable car rental",
  ],
  authors: [{ name: "CarRental Team" }],
  creator: "CarRental",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "CarRental",
    title: "CarRental - Find Your Perfect Ride",
    description:
      "Discover and rent quality vehicles at competitive prices. Easy booking, flexible pickup, and exceptional customer service.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CarRental - Find Your Perfect Ride",
    description:
      "Discover and rent quality vehicles at competitive prices. Easy booking, flexible pickup, and exceptional customer service.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-medium"
          >
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
        </Providers>
        <Toaster richColors position="top-right" duration={3000} />
      </body>
    </html>
  );
}
