import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jiwaku - AI-Powered Omnichannel CRM",
  description:
    "Modern, responsive, and user-friendly AI-powered Omnichannel CRM for Sales and Customer Support",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  authors: [
    {
      name: "Jiwaku Team",
      url: "https://jiwaku.app",
    },
  ],
  keywords: [
    "CRM",
    "Omnichannel",
    "AI",
    "Customer Support",
    "Sales",
    "WhatsApp",
    "Chat",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jiwaku.app",
    siteName: "Jiwaku",
    title: "Jiwaku - AI-Powered Omnichannel CRM",
    description:
      "Modern, responsive, and user-friendly AI-powered Omnichannel CRM",
    images: [
      {
        url: "https://jiwaku.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Jiwaku - AI-Powered Omnichannel CRM",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0066FF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Jiwaku" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
