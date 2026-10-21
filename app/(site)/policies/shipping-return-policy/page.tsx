import { serializeJsonLd } from "@/utils/seo";
import { Metadata } from "next";
import ShippingReturnPolicyClient from "./components/ShippingReturnPolicyClient";

export const metadata: Metadata = {
  title: "Shipping & Return Policy - Neverbe Sri Lanka",
  description:
    "Read Neverbe's shipping & return policy outlining how we manage shipping and returns. Fast delivery and easy returns across Sri Lanka.",
  keywords:
    "Neverbe, shipping policy, return policy, delivery Sri Lanka, online shoe store Sri Lanka, nike premium, adidas premium, sneakers Sri Lanka",
  alternates: {
    canonical: "https://neverbe.lk/policies/shipping-return-policy",
  },
  openGraph: {
    title: "Shipping & Return Policy - Neverbe Sri Lanka",
    description:
      "Read Neverbe's shipping & return policy outlining how we manage shipping and returns.",
    url: "https://neverbe.lk/policies/shipping-return-policy",
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
    title: "Shipping & Return Policy - Neverbe Sri Lanka",
    description:
      "Read Neverbe's shipping & return policy outlining how we manage shipping and returns.",
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
      publisher: { "@id": "https://neverbe.lk/#organization" },
      name: "Shipping & Return Policy",
      description:
        "Neverbe Shipping & Return Policy outlining how we manage shipping and returns.",
      url: "https://neverbe.lk/policies/shipping-return-policy",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <ShippingReturnPolicyClient />
    </>
  );
};

export default Page;
