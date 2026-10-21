import { serializeJsonLd } from "@/utils/seo";
import React from "react";
import type { Metadata } from "next";
import AboutUsClient from "./components/AboutUsClient";

export const metadata: Metadata = {
  title: "About NEVERBE | Shoes & Clothing in Sri Lanka",
  description:
    "Learn about Neverbe, Sri Lanka's trusted destination for premium shoes, clothing & apparel. Discover our mission, vision, and commitment to style, quality, and affordability.",
  keywords:
    "Neverbe, about us, shoes sri lanka, clothing sri lanka, premium footwear, apparel online, sneakers, online shoe and clothing store sri lanka",
  alternates: {
    canonical: "https://neverbe.lk/aboutUs",
  },
  openGraph: {
    title: "About Neverbe - Sri Lanka's Trusted Shoe & Clothing Store",
    description:
      "Learn about Neverbe, Sri Lanka's trusted destination for premium shoes, clothing & apparel. Style, quality, and affordability.",
    url: "https://neverbe.lk/aboutUs",
    siteName: "Neverbe",
    type: "website",
    locale: "en_LK",
    images: [
      {
        url: "/main-og.png",
        width: 1200,
        height: 630,
        alt: "Neverbe - Shoes & Clothing Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@neverbe",
    creator: "@neverbe",
    title: "About Neverbe - Sri Lanka's Trusted Shoe & Clothing Store",
    description:
      "Learn about Neverbe, Sri Lanka's trusted destination for premium shoes & clothing.",
    images: ["/main-og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

const AboutUs = () => {
  /* ✅ Structured Data for AboutPage + Organization */
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        about: { "@id": "https://neverbe.lk/#organization" },
        name: "About Neverbe",
        description:
          "Learn about Neverbe, Sri Lanka's trusted destination for premium shoes, clothing & apparel. Discover our mission, vision, and commitment to style, quality, and affordability.",
        url: "https://neverbe.lk/aboutUs",
        inLanguage: "en-LK",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <AboutUsClient />
    </>
  );
};

export default AboutUs;
