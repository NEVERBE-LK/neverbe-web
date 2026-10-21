import { serializeJsonLd } from "@/utils/seo";
import React from "react";
import { Metadata } from "next";
import axiosInstance from "@/actions/axiosInstance";
import SearchPageClient from "./SearchPageClient";
import { Product } from "@/interfaces/Product";
import Script from "next/script";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

const WEB_BASE_URL =
  process.env.NEXT_PUBLIC_WEB_BASE_URL || "https://neverbe.lk";

export async function generateMetadata(
  props: SearchPageProps,
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const canonicalUrl = `${WEB_BASE_URL}/search?q=${encodeURIComponent(query)}`;

  return {
    title: query
      ? `Search results for "${query}" | Neverbe`
      : "Search | Neverbe",
    description: query
      ? `Browse search results for "${query}" at Neverbe. Discover our curated collection of premium apparel including linen shirts, trousers, and more.`
      : "Search for premium apparel and accessories at Neverbe. Find high-quality linen shirts, casual wear, and luxury gear.",
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: query ? `Shop "${query}" at Neverbe` : "Search Products | Neverbe",
      description: `Find the best ${query || "premium apparel"} at Neverbe. Order online for islandwide delivery in Sri Lanka.`,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: "/collections-og.png",
          width: 1200,
          height: 630,
          alt: "Neverbe Search",
        },
      ],
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";

  let products: Product[] = [];

  if (query.trim().length >= 2) {
    try {
      const response = await axiosInstance.get("/web/products/search", {
        params: {
          q: query.trim(),
          hitsPerPage: 12,
        },
      });
      products = response.data.hits || [];
    } catch (error) {
      console.error("[SearchPage] Backend Search failed:", error);
    }
  }

  // Generate JSON-LD for Search Results (ItemList)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${WEB_BASE_URL}/collections/products/${product.id}`,
      name: product.name,
      image: product.thumbnail?.url,
    })),
  };

  return (
    <>
      <Script
        id="search-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <SearchPageClient query={query} products={products} />
    </>
  );
}
