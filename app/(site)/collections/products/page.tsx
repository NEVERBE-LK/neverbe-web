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

export const revalidate = 3600;

const baseMetadata: Metadata = {
  title: "Shop Shoes, Clothing & Apparel | Neverbe Sri Lanka",
  description:
    "Browse the full Neverbe collection — sneakers, t-shirts, activewear, sportswear, slides, accessories and more. Premium quality. Cash on Delivery island-wide.",
  keywords: [
    "buy shoes online sri lanka",
    "buy clothing online sri lanka",
    "sneakers colombo",
    "mens shoes sri lanka",
    "womens shoes sri lanka",
    "mens clothing sri lanka",
    "womens clothing sri lanka",
    "running shoes sri lanka",
    "activewear sri lanka",
    "t-shirts sri lanka",
    "sportswear sri lanka",
    "gym wear sri lanka",
    "slides sri lanka",
    "accessories sri lanka",
    "shoes under 5000",
    "shoes under 10000",
    "neverbe collection",
  ],
  alternates: { canonical: "https://neverbe.lk/collections/products" },
  openGraph: {
    title: "Shop Shoes, Clothing & Apparel | Neverbe Sri Lanka",
    description:
      "Browse the full Neverbe collection. Sneakers, clothing, activewear, sportswear and more at best prices. Cash on Delivery island-wide.",
    url: "https://neverbe.lk/collections/products",
    type: "website",
    siteName: "Neverbe",
    locale: "en_LK",
    images: [
      {
        url: "/collections-og.png",
        width: 1200,
        height: 630,
        alt: "Neverbe Collection - Shoes & Clothing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Neverbe | Shoes, Clothing & Apparel",
    description:
      "Premium quality shoes & clothing. Cash on Delivery island-wide.",
    images: ["/collections-og.png"],
  },
  metadataBase: new URL("https://neverbe.lk"),
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}): Promise<Metadata> {
  return collectionMetadata(
    baseMetadata,
    "/collections/products",
    catalogQuery(await searchParams),
  );
}

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) => {
  const query = catalogQuery(await searchParams);
  const initialData = await getCatalogPage("/web/products", query.key);
  const productList = initialData.products;
  if (!initialData.error && !catalogPageExists(query, initialData.total))
    notFound();

  const productListingSchema = collectionStructuredData({
    name: "Shop shoes, clothing & apparel in Sri Lanka",
    description:
      "Browse sneakers, activewear, clothing and accessories. Compare styles, sizes and prices in LKR.",
    path: "/collections/products",
    query,
    items: productList,
  });

  return (
    <main className="commerce-legacy v2-landing w-full min-h-screen bg-void text-primary transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(productListingSchema),
        }}
      />

      {/* Page Header Hero */}
      <div className="relative w-full py-12 md:py-16 border-b border-glass-border overflow-hidden bg-surface">
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,color-mix(in srgb, var(--color-accent) 8.0%, transparent),transparent_70%)]" />

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8">
          <nav className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-muted mb-4">
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-primary">All Products</span>
          </nav>

          <span className="v2-section-label mb-2">Exclusive Lineup</span>
          <h1 className="v2-section-title text-[clamp(2.5rem,6vw,4.5rem)] font-black uppercase tracking-tight text-primary mb-3">
            All Products
          </h1>
          <p className="text-[15px] font-medium text-secondary max-w-xl">
            Sneakers, activewear, slides, accessories &amp; lifestyle essentials
            delivered island-wide.
          </p>
        </div>
      </div>

      {/* Product Grid & Filter Layout */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-16">
        <Suspense fallback={<ComponentLoader />}>
          <Products
            key={query.key}
            items={productList}
            initialData={initialData}
            initialKey={query.key}
          />
        </Suspense>
      </div>

      <CollectionAdvice collection="products" />
    </main>
  );
};

export default Page;
