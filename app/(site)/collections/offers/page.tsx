import React, { Suspense } from "react";
import {
  getActivePromotions,
  getActiveCoupons,
} from "@/actions/promotionAction";
import { getDealsProducts } from "@/actions/productAction";
import CouponCard from "./components/CouponCard";
import DealsProducts from "./components/DealsProducts";
import CampaignCarousel from "./components/CampaignCarousel";
import ComponentLoader from "@/components/ComponentLoader";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "antd";

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "var(--color-primary)",
  display: "block",
  marginBottom: 12,
};

export const metadata: Metadata = {
  title: "Exclusive Deals, Coupons & Promotions | Neverbe Sri Lanka",
  description:
    "Unlock exclusive promotions, seasonal coupons and markdown deals at Neverbe. Best discounts on sneakers, clothing & apparel in Sri Lanka. Cash on Delivery available.",
  alternates: { canonical: "https://neverbe.lk/collections/offers" },
  keywords: [
    "shoe deals sri lanka",
    "clothing deals sri lanka",
    "discount sneakers colombo",
    "apparel sale sri lanka",
    "coupon codes sri lanka",
    "neverbe promotions",
    "footwear sale sri lanka",
    "clothing sale sri lanka",
    "markdown deals shoes",
  ],
  openGraph: {
    title: "Deals & Promotions | Neverbe Sri Lanka",
    description:
      "Exclusive promotions, coupons and markdown deals on sneakers, clothing & apparel in Sri Lanka.",
    url: "https://neverbe.lk/collections/offers",
    type: "website",
    siteName: "Neverbe",
    locale: "en_LK",
    images: [
      {
        url: "/offers-og.png",
        width: 1200,
        height: 630,
        alt: "Neverbe Offers & Deals - Shoes & Clothing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deals & Promotions | Neverbe",
    description: "Exclusive coupons & markdown deals on sneakers & clothing in Sri Lanka.",
    images: ["/offers-og.png"],
  },
};

export const revalidate = 600;

const OffersPage = async () => {
  const [promotions, coupons] = await Promise.all([
    getActivePromotions(),
    getActiveCoupons(),
  ]);

  const bannerPromotions = promotions.filter(
    (p: any) => p.bannerUrl && p.isActive,
  );

  let dealsList: any[] = [];
  try {
    const dealsResult = await getDealsProducts({ page: 1, size: 12 });
    dealsList = dealsResult?.dataList || [];
  } catch (e) {
    console.error("Error fetching deal items:", e);
  }

  const offersSchema = {
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
            name: "Offers",
            item: "https://neverbe.lk/collections/offers",
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: "Offers & Deals - Neverbe Sri Lanka",
        description:
          "Exclusive deals and discounts on premium footwear at Neverbe.",
        url: "https://neverbe.lk/collections/offers",
        inLanguage: "en-LK",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: dealsList.length,
          itemListElement: dealsList
            .slice(0, 15)
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
                brand: {
                  "@type": "Brand",
                  name: product?.brand || "Neverbe",
                },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offersSchema) }}
      />

      {/* Hero Header */}
      <div className="bg-surface border-b border-glass-border pt-16 pb-6 md:pt-20 md:pb-8">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted mb-3">
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-primary">Offers</span>
          </nav>
          <span className="v2-section-label mb-2">LIMITED TIME DEALS</span>
          <h1 className="v2-section-title text-[clamp(2.5rem,6vw,4.5rem)] font-black uppercase tracking-tight text-primary mb-2">
            Offers &amp; Promotions
          </h1>
          <p className="text-[15px] font-medium text-secondary m-0 max-w-xl">
            Exclusive discounts, active coupons &amp; markdown deals on sneakers and apparel.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12 space-y-12">
        {/* Campaign Hero Banner */}
        <section>
          <CampaignCarousel promotions={bannerPromotions} />
        </section>

        {/* Active Promotions */}
        {promotions.length > 0 && (
          <section>
            <h2 className="font-display font-black text-2xl uppercase tracking-tight text-primary mb-6">
              Active Campaigns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promotions.map((promo: any) => (
                <div
                  key={promo.id}
                  className="v2-glass p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-accent text-accent-text inline-block mb-3">
                      {promo.type}
                    </span>
                    <h3 className="font-display font-bold text-xl uppercase text-primary mb-2">
                      {promo.name}
                    </h3>
                    <p className="text-xs text-secondary leading-relaxed m-0">
                      {promo.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-glass-border flex justify-between items-center">
                    <span className="text-[11px] font-extrabold text-accent uppercase tracking-wider">
                      Auto-applied at checkout
                    </span>
                    <Link
                      href="/collections/products"
                      className="text-[11px] font-extrabold text-primary hover:text-accent uppercase tracking-wider transition-colors"
                    >
                      Shop Eligible Items →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Active Coupons */}
        {coupons.length > 0 && (
          <section>
            <h2 className="font-display font-black text-2xl uppercase tracking-tight text-primary mb-6">
              Available Coupons
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {coupons.map((coupon: any) => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          </section>
        )}

        {/* Markdown Deals */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display font-black text-2xl uppercase tracking-tight text-primary mb-1">
                Markdown Deals
              </h2>
              <p className="text-xs text-secondary m-0">
                Best prices on premium products.
              </p>
            </div>
            <Link
              href="/collections/combos"
              className="text-xs font-extrabold text-accent uppercase tracking-wider hover:underline"
            >
              View Bundle Deals →
            </Link>
          </div>
          <Suspense fallback={<ComponentLoader />}>
            <DealsProducts items={dealsList} />
          </Suspense>
        </section>
      </div>

      {/* SEO Footer */}
      <div className="border-t border-glass-border py-12 md:py-16 bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent block mb-2">Member Benefits</span>
              <p className="text-xs text-secondary leading-relaxed m-0">
                Sign up to unlock early access, exclusive deals, and the best prices on premium products in Sri Lanka.
              </p>
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent block mb-2">Ways to Save</span>
              <ul className="text-xs text-secondary space-y-1.5 list-none p-0 m-0">
                <li>• Seasonal Markdown Deals</li>
                <li>• Exclusive Coupon Codes</li>
                <li>• Bundle &amp; Save Combos</li>
              </ul>
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent block mb-2">Price Match Promise</span>
              <p className="text-xs text-secondary leading-relaxed m-0">
                Found a better price elsewhere? Let us know and we&apos;ll do our best to match it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OffersPage;
