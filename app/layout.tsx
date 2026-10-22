import { serializeJsonLd } from "@/utils/seo";
import { designTokens, themeCss } from "@/config/theme";
import { BusinessInfo } from "@/config/BusinessInfo";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./sportswear.css";
import "./commerce.css";
import { WebVitals } from "@/components/WebVitals";
import { Suspense } from "react";
import AnalyticsTracker from "@/app/(site)/components/AnalyticsTracker";

export const metadata: Metadata = {
  title: {
    default:
      "Neverbe — Shoes & Clothing Sri Lanka | Sneakers, Apparel & Fashion Online",
    template: "%s | Neverbe",
  },
  description:
    "Neverbe is an online store in Sri Lanka for shoes, clothing & apparel. Shop sneakers, t-shirts, activewear, sportswear & fashion accessories. Island-wide delivery & Cash on Delivery.",
  applicationName: "Neverbe",
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  keywords: [
    "Neverbe",
    "shoes sri lanka",
    "buy shoes online sri lanka",
    "sneakers sri lanka",
    "clothing sri lanka",
    "apparel online sri lanka",
    "men's t-shirts sri lanka",
    "women's clothing sri lanka",
    "activewear sri lanka",
    "gym wear sri lanka",
    "branded clothes sri lanka",
    "running shoes sri lanka",
    "casual footwear colombo",
    "online fashion store sri lanka",
    "cash on delivery clothes sri lanka",
    "sportswear sri lanka",
    "premium footwear sri lanka",
    "buy sneakers online colombo",
  ],
  authors: [{ name: "Neverbe" }],
  creator: "Neverbe",
  publisher: "Neverbe",
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/neverbe-mark-black.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://neverbe.lk"),
  openGraph: {
    title: "Neverbe — Shoes & Clothing in Sri Lanka | Online Fashion Store",
    description:
      "Shop online in Sri Lanka for shoes, clothing & fashion. Sneakers, t-shirts, activewear, gym wear & more with island-wide delivery.",
    siteName: "Neverbe",
    url: "https://neverbe.lk",
    locale: "en_LK",
    type: "website",
    images: [
      {
        url: "/main-og.png",
        width: 1200,
        height: 630,
        alt: "Neverbe - Premium Footwear & Apparel Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Neverbe — Shoes & Clothing Sri Lanka | Fashion Online",
    description:
      "Shop shoes, clothing & apparel in Sri Lanka. Sneakers, activewear, t-shirts & more with Cash on Delivery island-wide.",
    images: ["/main-og.png"],
    creator: "@neverbe_lk",
  },
  category: "retail",
};

export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: designTokens.light["v2-bg-void"],
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: designTokens.dark["v2-bg-void"],
    },
  ],
  colorScheme: "light dark",
};

import StoreProvider from "@/app/(site)/components/StoreProvider";
import AuthProvider from "@/components/AuthProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import CommerceThemeProvider from "@/components/CommerceThemeProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://neverbe.lk/#organization",
    name: "Neverbe",
    url: "https://neverbe.lk",
    logo: "https://neverbe.lk/brand/neverbe-logo-black.svg",
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+94729249999",
        contactType: "customer service",
        areaServed: "LK",
        availableLanguage: "English",
      },
      {
        "@type": "ContactPoint",
        telephone: "+94705208999",
        contactType: "sales",
        areaServed: "LK",
        availableLanguage: "English",
      },
    ],
    sameAs: [
      "https://www.facebook.com/share/1GaP5gJB2p/",
      "https://www.instagram.com/neverbe.196",
      "https://www.tiktok.com/@neverbe196",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "330/4/10, New Kandy Road",
      addressLocality: "Delgoda",
      addressRegion: "Gampaha",
      addressCountry: "LK",
    },
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://neverbe.lk/#website",
    name: "Neverbe",
    alternateName: ["Neverbe", "Neverbe Shoes & Clothing"],
    url: "https://neverbe.lk",
  };

  const localBusinessLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Neverbe",
    image: "https://neverbe.lk/main-og.png",
    "@id": "https://neverbe.lk/#store",
    areaServed: { "@type": "Country", name: "Sri Lanka" },
    url: "https://neverbe.lk",
    telephone: "+94729249999",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      ...BusinessInfo.openingHours,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "330/4/10, New Kandy Road",
      addressLocality: "Delgoda",
      addressRegion: "Gampaha",
      addressCountry: "LK",
    },
  };

  return (
    <html lang="en-LK" suppressHydrationWarning>
      <head>
        <style
          id="neverbe-theme"
          dangerouslySetInnerHTML={{ __html: themeCss }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('neverbe_theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.classList.add(t)}catch(e){document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}})()`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && window.location.hostname.includes('dev.neverbe')) {
                var meta = document.createElement('meta');
                meta.name = 'robots';
                meta.content = 'noindex, nofollow';
                document.head.appendChild(meta);
              }
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(localBusinessLd) }}
        />
        <a href="#main-content" className="sport-skip-link">
          Skip to content
        </a>
        <StoreProvider>
          <AuthProvider>
            <AntdRegistry>
              <CommerceThemeProvider>
                <div className="flex-1 flex flex-col w-full">{children}</div>
                <WebVitals />
                <Suspense fallback={null}>
                  <AnalyticsTracker />
                </Suspense>
              </CommerceThemeProvider>
            </AntdRegistry>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
