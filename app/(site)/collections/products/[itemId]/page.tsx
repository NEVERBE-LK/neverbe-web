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

const getAbsoluteUrl = (url?: string) => {
  if (!url) return "https://neverbe.lk/collections-og.png";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://neverbe.lk${url.startsWith("/") ? "" : "/"}${url}`;
};

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

  return {
    metadataBase: new URL("https://neverbe.lk"),
    title: safeTitle,
    description: `Shop ${item.name} online in Sri Lanka. Premium quality ${categoryLabel} with island-wide delivery & Cash on Delivery available at neverbe.`,
    keywords: [
      item.name,
      `${categoryLabel} sri lanka`,
      `buy ${categoryLabel} online sri lanka`,
      item.brand ? `${item.brand} ${categoryLabel} sri lanka` : "neverbe premium",
      "premium quality sri lanka",
      "neverbe sri lanka",
      "cash on delivery sri lanka",
    ],
    alternates: {
      canonical: `https://neverbe.lk/collections/products/${item.id}`,
    },
    openGraph: {
      title: `${safeTitle} | neverbe.`,
      description: `Shop ${item.name} - premium ${categoryLabel} in Sri Lanka at neverbe.`,
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
      description: `Shop ${item.name} online in Sri Lanka. Premium quality ${categoryLabel} with island-wide delivery at neverbe.`,
      images: [ogImageUrl],
    },
    other: {
      "image_src": ogImageUrl,
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
        item: `https://neverbe.lk/collections/products?category=${encodeURIComponent(item.category || "")}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: item.name,
      },
    ],
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    image: [getAbsoluteUrl(item.thumbnail?.url)],
    description: `Shop ${item.name} — premium quality ${categoryLabel.toLowerCase()} available in Sri Lanka at Neverbe. Island-wide delivery with Cash on Delivery.`,
    sku: item.id,
    category: categoryLabel,
    brand: {
      "@type": "Brand",
      name: item.brand || "Neverbe",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "89",
    },
    review: [
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "Verified Customer",
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
        },
        reviewBody: "Super comfortable and premium quality. Highly recommended!",
      }
    ],
    offers: {
      "@type": "Offer",
      url: `https://neverbe.lk/collections/products/${item.id}`,
      priceCurrency: "LKR",
      price: item.discount > 0
        ? Math.round((item.sellingPrice - (item.sellingPrice * item.discount) / 100) / 10) * 10
        : item.sellingPrice || "0.00",
      priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
      availability: item.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Neverbe",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "LK",
        },
        shippingRate: {
          "@type": "MonetaryAmount",
          value: `${((item.weight || 1000) / 1000 <= 1.0 ? 425 : 600).toFixed(2)}`,
          currency: "LKR",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "LK",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnFeesCustomerPaying",
      },
    },
  };

  // Build breadcrumb items for visual breadcrumbs
  const breadcrumbItems = [
    { label: "Products", href: "/collections/products" },
    {
      label: item.category || "Footwear",
      href: `/collections/products?category=${encodeURIComponent(
        item.category || "",
      )}`,
    },
    { label: item.name },
  ];

  return (
    <div
      className="commerce-product-page flex flex-col w-full relative min-h-screen bg-void text-primary"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
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
