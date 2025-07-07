import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  globalState,
  GlobalStateProvider,
  useGlobalState,
} from "./globalStateProvider";
import { ThemeProvider } from "./components/theme/ThemeContext ";
import { ToastProvider } from "./components/toastify/Toastify";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import ClientLayout from "./ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Improves font loading performance
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Improves font loading performance
});

// SEO Metadata Configuration
export const metadata: Metadata = {
  // Basic SEO
  title: {
    default: "Portfolio Pro - Build Your Portfolios Like A Pro",
    template: "%s | Portfolio Pro", // For page-specific titles
  },
  description:
    "Create stunning professional portfolios with Portfolio Pro. Build, customize, and showcase your work with our powerful portfolio builder platform.",

  // Keywords for SEO
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

  // Author and site info
  authors: [{ name: "Portfolio Pro Team" }],
  creator: "Portfolio Pro",
  publisher: "Portfolio Pro",

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://portfoliopro.com", // Replace with your actual domain
    siteName: "Portfolio Pro",
    title: "Portfolio Pro - Build Your Portfolios Like A Pro",
    description:
      "Create stunning professional portfolios with Portfolio Pro. Build, customize, and showcase your work with our powerful portfolio builder platform.",
    images: [
      {
        url: "https://portfoliopro.com/og-image.jpg", // Replace with your actual image
        width: 1200,
        height: 630,
        alt: "Portfolio Pro - Professional Portfolio Builder",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Portfolio Pro - Build Your Portfolios Like A Pro",
    description:
      "Create stunning professional portfolios with Portfolio Pro. Build, customize, and showcase your work with our powerful portfolio builder platform.",
    images: ["https://portfoliopro.com/twitter-image.jpg"], // Replace with your actual image
    creator: "@portfoliopro", // Replace with your Twitter handle
    site: "@portfoliopro", // Replace with your Twitter handle
  },

  // Additional meta tags
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

  // Canonical URL
  alternates: {
    canonical: "https://portfoliopro.com", // Replace with your actual domain
  },

  // App-specific metadata
  applicationName: "Portfolio Pro",
  category: "Business",

  // Verification tokens (add these when you set up search console)
  verification: {
    google: "your-google-verification-code", // Replace with actual verification code
    // bing: "your-bing-verification-code", // Uncomment and replace if using Bing
  },

  // Additional metadata
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "theme-color": "#05df72", // Replace with your brand color
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/login"
      signUpUrl="/signup"
      signUpForceRedirectUrl={`/dashboard`}
      signInForceRedirectUrl={"/dashboard"}
    >
      <html lang="en">
        <head>
          {/* Additional SEO meta tags */}
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="msapplication-TileColor" content="#000000" />
          <meta name="theme-color" content="#000000" />

          {/* Favicon and app icons */}
          <link rel="icon" href="/favicon.ico" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link rel="manifest" href="/site.webmanifest" />

          {/* Preconnect to external domains for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />

          {/* DNS prefetch for better performance */}
          <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
          <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

          {/* JSON-LD Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "Portfolio Pro",
                description:
                  "Create stunning professional portfolios with Portfolio Pro. Build, customize, and showcase your work with our powerful portfolio builder platform.",
                url: "https://portfoliopro.com",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Any",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                },
                creator: {
                  "@type": "Organization",
                  name: "Portfolio Pro",
                  url: "https://portfoliopro.com",
                },
              }),
            }}
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <GlobalStateProvider>
            <ToastProvider>
              <ThemeProvider>
                {/* Header with Clerk auth buttons */}
                <ClientLayout>{children}</ClientLayout>
              </ThemeProvider>
            </ToastProvider>
          </GlobalStateProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
