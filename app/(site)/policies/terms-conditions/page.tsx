import { Metadata } from "next";
import TermsClient from "./components/TermsClient";

export const metadata: Metadata = {
  title: "Terms & Conditions - Neverbe Sri Lanka",
  description:
    "Read Neverbe's Terms & Conditions outlining the rules and guidelines for using our website and purchasing our products in Sri Lanka.",
  keywords:
    "Neverbe, terms and conditions, website rules, online shopping Sri Lanka, nike premium, adidas premium, sneakers Sri Lanka",
  alternates: {
    canonical: "https://neverbe.lk/policies/terms-conditions",
  },
  openGraph: {
    title: "Terms & Conditions - Neverbe Sri Lanka",
    description:
      "Read Neverbe's Terms & Conditions outlining the rules and guidelines for using our website and purchasing our products.",
    url: "https://neverbe.lk/policies/terms-conditions",
    siteName: "Neverbe",
    type: "website",
    locale: "en_LK",
    images: [
      {
        url: "https://neverbe.lk/main-og.png",
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
    title: "Terms & Conditions - Neverbe Sri Lanka",
    description:
      "Read Neverbe's Terms & Conditions outlining the rules and guidelines for using our website and purchasing our products.",
    images: ["https://neverbe.lk/main-og.png"],
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

const Page = () => {
  /* ✅ Structured Data for Google Rich Results */
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Terms & Conditions",
      description:
        "Neverbe Terms & Conditions outlining the rules and guidelines for using our website and purchasing our products.",
      url: "https://neverbe.lk/policies/terms-conditions",
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Neverbe",
      url: "https://neverbe.lk",
      logo: "https://neverbe.lk/logo.png",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+94 70 520 8999",
        contactType: "Customer Service",
        areaServed: "LK",
        availableLanguage: ["English", "Sinhala", "Tamil"],
      },
      sameAs: [
        "https://www.facebook.com/neverbe196",
        "https://www.instagram.com/neverbe196",
        "https://tiktok.com/@neverbe196",
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <TermsClient />
    </>
  );
};

export default Page;
