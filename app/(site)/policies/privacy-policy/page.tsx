import { serializeJsonLd } from "@/utils/seo";
import { Metadata } from "next";
import PrivacyPolicyClient from "./components/PrivacyPolicyClient";

export const metadata: Metadata = {
  title: "Privacy Policy - Neverbe Sri Lanka",
  description:
    "Read Neverbe's Privacy Policy outlining how we collect, use, and protect your data. Trusted online shoe store in Sri Lanka.",
  keywords:
    "Neverbe, privacy policy, data protection, online shoe store Sri Lanka, nike premium, adidas premium, sneakers Sri Lanka",
  alternates: {
    canonical: "https://neverbe.lk/policies/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy - Neverbe Sri Lanka",
    description:
      "Read Neverbe's Privacy Policy outlining how we collect, use, and protect your data.",
    url: "https://neverbe.lk/policies/privacy-policy",
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
    title: "Privacy Policy - Neverbe Sri Lanka",
    description:
      "Read Neverbe's Privacy Policy outlining how we collect, use, and protect your data.",
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
  /* ✅ Structured Data: WebPage + Organization */
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      publisher: { "@id": "https://neverbe.lk/#organization" },
      name: "Privacy Policy",
      description:
        "Neverbe Privacy Policy outlining how we collect, use, and protect your data.",
      url: "https://neverbe.lk/policies/privacy-policy",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <PrivacyPolicyClient />
    </>
  );
};

export default Page;
