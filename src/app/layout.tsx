import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { ToastProvider } from "../context/Toastify";
import ClientLayout from "../context/ClientLayout";
import { Suspense } from "react";
import PortfolioProLogo from "./components/logo/PortfolioProTextLogo";
import DynamicTitle from "../context/DynamicTitle";
import { WebSocketProvider } from "../context/WebSocketContext";
import { themePresets } from "@/lib/utilities/indices/Themes";
import { BASE_URL } from "@/lib/utilities/syncFunctions/syncs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Portfolio Pro - Build Your Portfolios Like A Pro",
    template: "%s | Portfolio Pro",
  },
  description:
    "Create stunning professional portfolios with Portfolio Pro. Build, customize, and showcase your work with our powerful portfolio builder platform.",

  keywords: [
    "portfolio builder",
    "professional portfolio",
    "portfolio website",
    "resume builder",
    "personal branding",
    "web portfolio",
    "creative portfolio",
    "online portfolio",
    "portfolio templates",
    "career showcase",
  ],

  authors: [{ name: "Portfolio Pro Team" }],
  creator: "Portfolio Pro",
  publisher: "Portfolio Pro",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Portfolio Pro",
    title: "Portfolio Pro - Build Your Portfolios Like A Pro",
    description:
      "Create stunning professional portfolios with Portfolio Pro. Build, customize, and showcase your work with our powerful portfolio builder platform.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Portfolio Pro - Professional Portfolio Builder",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Portfolio Pro - Build Your Portfolios Like A Pro",
    description:
      "Create stunning professional portfolios with Portfolio Pro. Build, customize, and showcase your work with our powerful portfolio builder platform.",
    images: [`${BASE_URL}/twitter-image.png`],
    creator: "@portfoliopro",
    site: "@portfoliopro",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: BASE_URL,
  },

  applicationName: "Portfolio Pro",
  category: "Business",

  verification: {
    google: "w5XtqI99jBr7rAfeYcCgTEEBjV0rZUF7l9iTMrM1Eco",
  },

  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "theme-color": themePresets[0].accent,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#000000" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Portfolio Pro",
              description:
                "Create stunning professional portfolios with Portfolio Pro. Build, customize, and showcase your work with our powerful portfolio builder platform.",
              url: BASE_URL,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              creator: { "@type": "Organization", name: "Portfolio Pro", url: BASE_URL },
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Suspense
          fallback={
            <div className="flex justify-center w-full items-center h-screen">
              <PortfolioProLogo tracking={0.2} scale={0.75} fontWeight={"extrabold"} reanimateDelay={3000} />
            </div>
          }
        >
          <DynamicTitle />
          <ToastProvider>
            <WebSocketProvider>
              <ThemeProvider>
                <ClientLayout>{children}</ClientLayout>
              </ThemeProvider>
            </WebSocketProvider>
          </ToastProvider>
        </Suspense>
      </body>
    </html>
  );
}