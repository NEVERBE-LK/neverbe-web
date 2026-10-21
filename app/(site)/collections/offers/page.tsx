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
import {
  getActivePromotions,
  getActiveCoupons,
} from "@/actions/promotionAction";
import CouponCard from "./components/CouponCard";
import Products from "../products/components/Products";
import CampaignCarousel from "./components/CampaignCarousel";
import ComponentLoader from "@/components/ComponentLoader";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "antd";

const baseMetadata: Metadata = {
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
    description:
      "Exclusive coupons & markdown deals on sneakers & clothing in Sri Lanka.",
    images: ["/offers-og.png"],
  },
};

export const revalidate = 600;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}): Promise<Metadata> {
  return collectionMetadata(
    baseMetadata,
    "/collections/offers",
    catalogQuery(await searchParams),
  );
}

const OffersPage = async ({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) => {
  const query = catalogQuery(await searchParams);
  const [promotions, coupons, initialData] = await Promise.all([
    getActivePromotions(),
    getActiveCoupons(),
    getCatalogPage("/web/products/deals", query.key),
  ]);
  const bannerPromotions = promotions.filter(
    (p: any) => p.bannerUrl && p.isActive,
  );
  const dealsList = initialData.products;
  if (!initialData.error && !catalogPageExists(query, initialData.total))
    notFound();

  const offersSchema = collectionStructuredData({
    name: "Offers & deals in Sri Lanka",
    description:
      "Browse current product markdowns, promotions and coupons at NEVERBE.",
    path: "/collections/offers",
    query,
    items: dealsList,
  });

  return (
    <main className="commerce-legacy w-full min-h-screen bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(offersSchema) }}
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
            Exclusive discounts, active coupons &amp; markdown deals on sneakers
            and apparel.
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
            <Products
              key={query.key}
              items={dealsList}
              apiEndpoint="/web/products/deals"
              initialData={initialData}
              initialKey={query.key}
            />
          </Suspense>
        </section>
      </div>

      <CollectionAdvice collection="offers" />
    </main>
  );
};

export default OffersPage;
