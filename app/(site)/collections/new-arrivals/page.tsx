import React, { Suspense } from "react";
import Products from "@/app/(site)/collections/products/components/Products";
import { getNewArrivals } from "@/actions/productAction";
import ComponentLoader from "@/components/ComponentLoader";
import type { Metadata } from "next";
import Link from "next/link";

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "var(--color-primary)",
  display: "block",
  marginBottom: 12,
};

export const metadata: Metadata = {
  title: "New Arrivals | Latest Shoes, Clothing & Apparel | Neverbe Sri Lanka",
  description:
    "Shop the latest shoe drops, clothing & fresh apparel at Neverbe. New sneakers, t-shirts, activewear & sportswear added weekly. Premium quality. Cash on Delivery island-wide.",
  alternates: { canonical: "https://neverbe.lk/collections/new-arrivals" },
  keywords: [
    "new sneakers sri lanka",
    "latest shoe drops sri lanka",
    "new arrivals footwear 2025",
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
      "Latest shoe drops, clothing & fresh apparel added weekly at Neverbe Sri Lanka.",
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
    description: "Fresh shoe drops, clothing & apparel added weekly in Sri Lanka.",
    images: ["/collections-og.png"],
  },
};

const NewArrivalsPage = async () => {
  const { total, dataList } = await getNewArrivals(12);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
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
            name: "New Arrivals",
            item: "https://neverbe.lk/collections/new-arrivals",
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: "New Arrivals - Latest Shoes & Clothing Sri Lanka",
        description:
          "Shop the newest shoes & clothing in Sri Lanka. Latest sneakers, apparel & footwear.",
        url: "https://neverbe.lk/collections/new-arrivals",
        inLanguage: "en-LK",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: dataList.length,
          itemListElement: dataList
            .slice(0, 15)
            .map((product: any, index: number) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Product",
                name: product.name,
                image: product.thumbnail?.url
                  ? (product.thumbnail.url.startsWith("http")
                      ? product.thumbnail.url
                      : `https://neverbe.lk${product.thumbnail.url.startsWith("/") ? "" : "/"}${product.thumbnail.url}`)
                  : "https://neverbe.lk/collections-og.png",
                url: `https://neverbe.lk/collections/products/${product.id}`,
                description: product.description || `Shop ${product.name} online in Sri Lanka at Neverbe.`,
                brand: { "@type": "Brand", name: product.brand || "Neverbe" },
                offers: {
                  "@type": "Offer",
                  priceCurrency: "LKR",
                  price: product.discount > 0
                    ? Math.round((product.sellingPrice - (product.sellingPrice * product.discount) / 100) / 10) * 10
                    : product.sellingPrice || "0.00",
                  priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
                  availability: product.inStock
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
                      value: `${((product.weight || 1000) / 1000 <= 1.0 ? 425 : 600).toFixed(2)}`,
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
              },
            })),
        },
      },
    ],
  };

  return (
    <main className="commerce-legacy w-full min-h-screen bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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
          <Products items={dataList} apiEndpoint="/web/products/new" />
        </Suspense>
      </div>

      {/* SEO Footer */}
      <div className="border-t border-glass-border py-12 md:py-16 bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent block mb-2">Fresh Drops Weekly</span>
              <p className="text-xs text-secondary leading-relaxed m-0">
                We update our collection with the latest releases from global sneaker culture. Premium quality guaranteed.
              </p>
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent block mb-2">Trending Now</span>
              <ul className="text-xs text-secondary space-y-1.5 list-none p-0 m-0">
                <li>• Retro High Tops</li>
                <li>• Chunky Dad Shoes</li>
                <li>• Minimalist Slides</li>
              </ul>
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent block mb-2">Limited Stock</span>
              <p className="text-xs text-secondary leading-relaxed m-0">
                Most new arrivals are limited runs. If you see your size, grab it before it&apos;s gone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NewArrivalsPage;
