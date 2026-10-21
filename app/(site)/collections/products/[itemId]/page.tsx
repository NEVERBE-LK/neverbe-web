import {
  absoluteUrl,
  plainDescription,
  productStructuredData,
  serializeJsonLd,
} from "@/utils/seo";
import { categoryLabelToSlug, getCategoryBySlug } from "@/utils/categorySlug";
import { cache } from "react";
import ProductHero from "@/app/(site)/collections/products/[itemId]/components/ProductHero";
import SimilarProducts from "@/app/(site)/collections/products/[itemId]/components/SimilarProducts";
import { notFound } from "next/navigation";
import { getProductById, getSimilarItems } from "@/actions/productAction";
import type { Metadata } from "next";
import { Product } from "@/interfaces/Product";
import ProductFAQ from "./components/ProductFAQ";
import RecentlyViewedTracker from "./components/RecentlyViewedTracker";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductReviews from "./components/ProductReviews";

export const revalidate = 300;

const getProduct = cache(async (id: string): Promise<Product | null> => {
  try {
    return await getProductById(id);
  } catch (e) {
    console.error(e);
    return null;
  }
});

export async function generateMetadata(context: {
  params: Promise<{ itemId: string }>;
}): Promise<Metadata> {
  const params = await context.params;
  const item = await getProduct(params.itemId);

  if (!item) {
    return {
      title: "Item Not Found | neverbe.",
      description: "The requested item could not be found.",
      robots: { index: false, follow: true },
    };
  }

  const safeTitle = `${item.name}`;
  const categoryLabel = item.category || "apparel";
  const ogImageUrl = `https://neverbe.lk/api/og/product/${item.id}`;
  const description = plainDescription(
    item.description ||
      `Shop ${item.name}, ${categoryLabel}, online at NEVERBE Sri Lanka. View available sizes, colours and current pricing in LKR.`,
    160,
  );

  return {
    metadataBase: new URL("https://neverbe.lk"),
    title: `${safeTitle} in Sri Lanka`,
    description,
    keywords: [
      item.name,
      `${categoryLabel} sri lanka`,
      `buy ${categoryLabel} online sri lanka`,
      item.brand
        ? `${item.brand} ${categoryLabel} sri lanka`
        : "neverbe premium",
      "premium quality sri lanka",
      "neverbe sri lanka",
      "cash on delivery sri lanka",
    ],
    alternates: {
      canonical: absoluteUrl(
        `/collections/products/${encodeURIComponent(item.id)}`,
      ),
    },
    openGraph: {
      title: `${safeTitle} | neverbe.`,
      description,
      url: `https://neverbe.lk/collections/products/${item.id}`,
      type: "website",
      siteName: "neverbe.",
      locale: "en_LK",
      images: [
        {
          url: ogImageUrl,
          secureUrl: ogImageUrl,
          width: 1200,
          height: 630,
          type: "image/jpeg",
          alt: `${item.name} | neverbe.`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${safeTitle} | neverbe.`,
      description,
      images: [ogImageUrl],
    },
    other: {
      image_src: ogImageUrl,
      "og:image:secure_url": ogImageUrl,
    },
  };
}

const Page = async (context: { params: Promise<{ itemId: string }> }) => {
  const params = await context.params;

  const itemData = getProduct(params.itemId);
  const similarData = getSimilarItems(params.itemId).catch(() => []);

  const [item, similarItems] = await Promise.all([itemData, similarData]);

  if (!item) return notFound();

  const categoryLabel = item.category || "Fashion";
  const categoryMapping = getCategoryBySlug(
    categoryLabelToSlug(item.category || ""),
  );
  const categoryPath = categoryMapping
    ? `/collections/${categoryMapping.slug}`
    : `/collections/products?category=${encodeURIComponent(item.category || "")}`;

  // BreadcrumbList JSON-LD for Google rich breadcrumbs
  const breadcrumbSchema = {
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
        name: "Products",
        item: "https://neverbe.lk/collections/products",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryLabel,
        item: absoluteUrl(categoryPath),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: item.name,
        item: `https://neverbe.lk/collections/products/${encodeURIComponent(item.id)}`,
      },
    ],
  };

  const productSchema = productStructuredData(item);

  // Build breadcrumb items for visual breadcrumbs
  const breadcrumbItems = [
    { label: "Products", href: "/collections/products" },
    {
      label: item.category || "Footwear",
      href: categoryPath,
    },
    { label: item.name },
  ];

  return (
    <div className="commerce-product-page flex flex-col w-full relative min-h-screen bg-void text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productSchema) }}
      />
      {/* Breadcrumbs Navigation */}
      <div className="w-full bg-surface border-b border-glass-border py-3.5">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>
      <ProductHero item={item} />
      <ProductReviews product={item} />
      <ProductFAQ />
      <SimilarProducts items={similarItems || []} />
      <RecentlyViewedTracker product={item} />
    </div>
  );
};

export default Page;
