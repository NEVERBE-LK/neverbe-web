import { notFound } from "next/navigation";
import CollectionAdvice from "@/components/CollectionAdvice";
import {
  catalogPageExists,
  catalogQuery,
  type CatalogSearchParams,
} from "@/utils/catalogQuery";
import {
  collectionMetadata,
  collectionStructuredData,
} from "@/utils/collectionSeo";
import { getCatalogPage } from "@/actions/catalogPage";
import { serializeJsonLd } from "@/utils/seo";
import React, { Suspense } from "react";
import Products from "@/app/(site)/collections/products/components/Products";
import ComponentLoader from "@/components/ComponentLoader";
import type { Metadata } from "next";
import Link from "next/link";

const baseMetadata: Metadata = {
  title: "New Arrivals | Latest Shoes, Clothing & Apparel | Neverbe Sri Lanka",
  description:
    "Shop the latest shoe drops, clothing & fresh apparel at Neverbe. Explore new sneakers, t-shirts, activewear & sportswear. Cash on Delivery island-wide.",
  alternates: { canonical: "https://neverbe.lk/collections/new-arrivals" },
  keywords: [
    "new sneakers sri lanka",
    "latest shoe drops sri lanka",
    "new arrivals footwear sri lanka",
    "new clothing sri lanka",
    "latest fashion sri lanka",
    "new t-shirts sri lanka",
    "new activewear sri lanka",
    "fresh shoes colombo",
    "new slides sri lanka",
  ],
  openGraph: {
    title: "New Arrivals | Latest Shoes, Clothing & Apparel | Neverbe",
    description:
      "Explore the latest footwear and clothing added to NEVERBE Sri Lanka.",
    url: "https://neverbe.lk/collections/new-arrivals",
    type: "website",
    siteName: "Neverbe",
    locale: "en_LK",
    images: [
      {
        url: "/collections-og.png",
        width: 1200,
        height: 630,
        alt: "Neverbe New Arrivals - Shoes & Clothing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "New Arrivals | Neverbe Sri Lanka",
    description:
      "Fresh shoe drops, clothing & apparel at NEVERBE in Sri Lanka.",
    images: ["/collections-og.png"],
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}): Promise<Metadata> {
  return collectionMetadata(
    baseMetadata,
    "/collections/new-arrivals",
    catalogQuery(await searchParams),
  );
}

const NewArrivalsPage = async ({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) => {
  const query = catalogQuery(await searchParams);
  const initialData = await getCatalogPage("/web/products/new", query.key);
  const dataList = initialData.products;
  if (!initialData.error && !catalogPageExists(query, initialData.total))
    notFound();

  const structuredData = collectionStructuredData({
    name: "New arrivals in Sri Lanka",
    description: "Explore the latest footwear and clothing added to NEVERBE.",
    path: "/collections/new-arrivals",
    query,
    items: dataList,
  });

  return (
    <main className="commerce-legacy w-full min-h-screen bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />

      {/* Hero Header */}
      <div className="bg-surface border-b border-glass-border pt-28 pb-10 md:pt-36 md:pb-14">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted mb-3">
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-primary">New Arrivals</span>
          </nav>
          <span className="v2-section-label mb-2">JUST DROPPED</span>
          <h1 className="v2-section-title text-[clamp(2.5rem,6vw,4.5rem)] font-black uppercase tracking-tight text-primary mb-2">
            New Arrivals
          </h1>
          <p className="text-[15px] font-medium text-secondary m-0 max-w-xl">
            Fresh styles just added to the collection.
          </p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="w-full py-4 md:py-8">
        <Suspense fallback={<ComponentLoader />}>
          <Products
            key={query.key}
            items={dataList}
            apiEndpoint="/web/products/new"
            initialData={initialData}
            initialKey={query.key}
          />
        </Suspense>
      </div>

      <CollectionAdvice collection="new-arrivals" />
    </main>
  );
};

export default NewArrivalsPage;
