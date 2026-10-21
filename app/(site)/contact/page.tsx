import { serializeJsonLd } from "@/utils/seo";
import React from "react";
import { Metadata } from "next";
import ContactDetailsSection from "@/app/(site)/contact/components/ContactDetailsSection";
import SocialMediaSection from "@/app/(site)/contact/components/SocialMediaSection";
import MapSection from "@/app/(site)/contact/components/MapSection";

export const metadata: Metadata = {
  title: "Contact Us - Neverbe | Shoes & Clothing Sri Lanka",
  description:
    "Get in touch with Neverbe for inquiries about shoes, clothing & apparel. Contact us via email, WhatsApp, social media, or visit our store in Sri Lanka.",
  keywords:
    "Neverbe contact, customer service, shoe store sri lanka, clothing store sri lanka, whatsapp, support, inquiries",
  alternates: {
    canonical: "https://neverbe.lk/contact",
  },
  openGraph: {
    title: "Contact Us - Neverbe",
    description:
      "Reach out to Neverbe via email, social media, WhatsApp, or visit our store in Sri Lanka.",
    url: "https://neverbe.lk/contact",
    type: "website",
    siteName: "Neverbe",
    locale: "en_LK",
    images: [
      {
        url: "/main-og.png",
        width: 1200,
        height: 630,
        alt: "Neverbe Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@neverbe",
    creator: "@neverbe",
    title: "Contact Us - Neverbe",
    description:
      "Reach out to Neverbe via email, social media, WhatsApp, or visit our store in Sri Lanka.",
    images: ["/main-og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

const ContactPage = () => {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://neverbe.lk",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Contact",
          item: "https://neverbe.lk/contact",
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact NEVERBE",
      url: "https://neverbe.lk/contact",
      about: { "@id": "https://neverbe.lk/#organization" },
    },
  ];

  return (
    <div className="commerce-legacy min-h-screen pt-28 pb-20 flex flex-col items-center px-4 sm:px-6 lg:px-12 bg-surface text-primary">
      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />

      {/* --- Header Section --- */}
      <header className="text-center mb-12 max-w-2xl mx-auto">
        <span className="v2-section-label mb-2">WE ARE HERE FOR YOU</span>
        <h1 className="v2-section-title text-[clamp(2.5rem,6vw,4.5rem)] font-black uppercase tracking-tight text-primary m-0 leading-none">
          Contact Us
        </h1>
        <p className="text-xs sm:text-sm font-medium text-secondary mt-4 m-0">
          Whether you have a question about sizing, order tracking, or feedback
          — we&apos;re ready to assist.
        </p>
      </header>

      {/* --- Main Content Section --- */}
      <div className="w-full max-w-6xl space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <ContactDetailsSection />
          <SocialMediaSection />
        </div>

        <MapSection />
      </div>
    </div>
  );
};

export default ContactPage;
