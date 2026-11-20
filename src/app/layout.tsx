import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/shared/ui/sonner";
import { Header } from '@/widgets/header';
import { Footer, HideOnAuthRoutes } from "@/widgets/layout";
import React from "react";
import { APP_NAME } from "@/shared/config/constants";
import { ROUTES } from '@/shared/config/routes';

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
    default: `${APP_NAME} - Rent a car by the day`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Browse the fleet, request your dates and pay once the rental is approved.",
  keywords: [
    "car rental",
    "rent a car",
    "vehicle rental",
    "car hire",
    "affordable car rental",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: ROUTES.home,
    siteName: APP_NAME,
    title: `${APP_NAME} - Rent a car by the day`,
    description:
      "Browse the fleet, request your dates and pay once the rental is approved.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - Rent a car by the day`,
    description:
      "Browse the fleet, request your dates and pay once the rental is approved.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh flex flex-col pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)]`}
        suppressHydrationWarning
      >
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-medium"
          >
            Skip to main content
          </a>
          <HideOnAuthRoutes>
            <Header />
          </HideOnAuthRoutes>
          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">{children}</main>
          <HideOnAuthRoutes>
            <Footer />
          </HideOnAuthRoutes>
        </Providers>
        <Toaster richColors position="top-right" offset="calc(76px + env(safe-area-inset-top))" mobileOffset="calc(76px + env(safe-area-inset-top))" duration={3000} />
      </body>
    </html>
  );
}
