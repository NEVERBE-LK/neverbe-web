import React, { Suspense } from "react";
import Products from "@/app/(site)/collections/products/components/Products";
import { getProducts } from "@/actions/productAction";
import ComponentLoader from "@/components/ComponentLoader";
import type { Metadata } from "next";
import Link from "next/link";

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "var(--color-primary)",
  display: "block",
  marginBottom: 12,
};

export const revalidate = 3600;

export const metadata: Metadata = {
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
    description: "Premium quality shoes & clothing. Cash on Delivery island-wide.",
    images: ["/collections-og.png"],
  },
  metadataBase: new URL("https://neverbe.lk"),
};

const Page = async () => {
  let items: any = {};

  try {
    // Initial fetch to 12 for 12 products per page
    items = await getProducts({ page: 1, size: 12 });
  } catch (e) {
    console.error("Error fetching items:", e);
    items = { dataList: [] };
  }

  const productList = items?.dataList || [];

  const productListingSchema = {
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
            name: "Products",
            item: "https://neverbe.lk/collections/products",
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: "Buy Shoes & Clothing Online Sri Lanka | Neverbe Collection",
        description:
          "Shop sneakers, clothing, activewear, sportswear & accessories in Sri Lanka. Cash on Delivery available.",
        url: "https://neverbe.lk/collections/products",
        inLanguage: "en-LK",
        isPartOf: {
          "@id": "https://neverbe.lk/#website",
        },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: productList.length,
          itemListElement: productList
            .slice(0, 20)
            .map((product: any, index: number) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Product",
                name: product?.name,
                image: product?.thumbnail?.url
                  ? (product.thumbnail.url.startsWith("http")
                      ? product.thumbnail.url
                      : `https://neverbe.lk${product.thumbnail.url.startsWith("/") ? "" : "/"}${product.thumbnail.url}`)
                  : "https://neverbe.lk/collections-og.png",
                url: `https://neverbe.lk/collections/products/${product?.id}`,
                description: product?.description || `Shop ${product?.name} online in Sri Lanka at Neverbe.`,
                brand: { "@type": "Brand", name: product?.brand || "Neverbe" },
                offers: {
                  "@type": "Offer",
                  priceCurrency: "LKR",
                  price: product?.discount > 0
                    ? Math.round((product.sellingPrice - (product.sellingPrice * product.discount) / 100) / 10) * 10
                    : product?.sellingPrice || "0.00",
                  priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
                  availability: product?.inStock
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
    <main className="commerce-legacy v2-landing w-full min-h-screen bg-void text-primary transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productListingSchema),
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
            Sneakers, activewear, slides, accessories &amp; lifestyle essentials delivered island-wide.
          </p>
        </div>
      </div>

      {/* Product Grid & Filter Layout */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-16">
        <Suspense fallback={<ComponentLoader />}>
          <Products items={productList} />
        </Suspense>
      </div>

      {/* SEO Footer */}
      <div className="border-t border-glass-border py-16 bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent block mb-3">
                Premium Fashion in Sri Lanka
              </span>
              <p className="text-xs text-secondary leading-relaxed">
                Neverbe offers shoes, clothing, activewear, and accessories — all with island-wide Cash on Delivery.
              </p>
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent block mb-3">
                Popular Collections
              </span>
              <ul className="text-xs text-secondary space-y-2 list-none p-0 m-0">
                <li>Men&apos;s Sneakers</li>
                <li>Women&apos;s Activewear</li>
                <li>Slides &amp; Sandals</li>
                <li>High-Ankle Boots</li>
              </ul>
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent block mb-3">
                Quality Guaranteed
              </span>
              <p className="text-xs text-secondary leading-relaxed">
                Size exchanges within 7 days. Every product is Premium Grade quality — durability and comfort guaranteed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
