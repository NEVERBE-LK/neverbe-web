import { Metadata } from "next";
import { getPaginatedCombos } from "@/actions/promotionAction";
import Link from "next/link";
import CombosGrid from "./components/CombosGrid";
import EmptyState from "@/components/EmptyState";

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "var(--color-primary)",
  display: "block",
  marginBottom: 12,
};

// OPTIMIZATION: Cache for 1 hour (ISR)
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Bundle Deals & Combos | Shoes & Clothing Offers | Neverbe",
  description:
    "Exclusive BOGO deals, multi-buy discounts and combo packs on sneakers, clothing & apparel. Save more when you bundle at Neverbe Sri Lanka.",
  keywords: [
    "combo deals sri lanka",
    "bundle shoe offers",
    "bogo sneakers sri lanka",
    "clothing bundle deals sri lanka",
    "buy one get one free shoes",
    "multi buy discount footwear",
    "save on shoes sri lanka",
    "apparel combo deals",
  ],
  alternates: { canonical: "https://neverbe.lk/collections/combos" },
  openGraph: {
    title: "Bundle Deals & Combos | Neverbe Sri Lanka",
    description:
      "BOGO deals and multi-buy discounts on premium sneakers & clothing. Save more when you bundle.",
    url: "https://neverbe.lk/collections/combos",
    type: "website",
    siteName: "Neverbe",
    locale: "en_LK",
    images: [
      {
        url: "/offers-og.png",
        width: 1200,
        height: 630,
        alt: "Neverbe Bundle Deals - Shoes & Clothing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bundle Deals | Neverbe Sri Lanka",
    description: "BOGO & multi-buy discounts on sneakers & clothing in Sri Lanka.",
    images: ["/offers-og.png"],
  },
  metadataBase: new URL("https://neverbe.lk"),
};

const CombosPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const params = await searchParams;
  const page = Math.max(1, Number(params?.page) || 1);
  const pageSize = 12;
  let combos: any[] = [];
  let total = 0;
  let totalPages = 0;

  try {
    const data = await getPaginatedCombos({ page, pageSize });
    combos = data.combos || data.dataList || [];
    total = data.total || 0;
    totalPages = data.totalPages || Math.ceil(total / pageSize);
  } catch (e) {
    console.error("Error fetching combos:", e);
    combos = [];
  }

  /* Structured Data with BreadcrumbList for SEO */
  const combosSchema = {
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
            name: "Bundle Deals",
            item: "https://neverbe.lk/collections/combos",
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: "Bundle Deals & Combo Offers",
        description:
          "Exclusive combo deals, BOGO offers, and bundle discounts on premium footwear in Sri Lanka.",
        url: `https://neverbe.lk/collections/combos`,
        inLanguage: "en-LK",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: combos.length,
          itemListElement: combos.map((combo: any, index: number) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Product",
              name: combo?.name,
              image: combo?.previewThumbnail
                ? (combo.previewThumbnail.startsWith("http")
                    ? combo.previewThumbnail
                    : `https://neverbe.lk${combo.previewThumbnail.startsWith("/") ? "" : "/"}${combo.previewThumbnail}`)
                : "https://neverbe.lk/offers-og.png",
              description:
                combo?.description || "Bundle deal at Neverbe Sri Lanka.",
              url: `https://neverbe.lk/collections/combos/${combo?.id}`,
              brand: { "@type": "Brand", name: "Neverbe" },
              offers: {
                "@type": "Offer",
                priceCurrency: "LKR",
                price: combo?.comboPrice || "0.00",
                priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
                availability: "https://schema.org/InStock",
                shippingDetails: {
                  "@type": "OfferShippingDetails",
                  shippingDestination: {
                    "@type": "DefinedRegion",
                    addressCountry: "LK",
                  },
                  shippingRate: {
                    "@type": "MonetaryAmount",
                    value: `${(((combo.items?.reduce((sum: number, item: any) => sum + (item.product?.weight || 1000) * (item.quantity || 1), 0) || 1000) / 1000) <= 1.0 ? 425 : 600).toFixed(2)}`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combosSchema) }}
      />

      {/* Hero Header */}
      <div className="bg-surface border-b border-glass-border pt-28 pb-10 md:pt-36 md:pb-14">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted mb-3">
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-primary">Bundle Deals</span>
          </nav>
          <span className="v2-section-label mb-2">BUNDLE &amp; SAVE</span>
          <h1 className="v2-section-title text-[clamp(2.5rem,6vw,4.5rem)] font-black uppercase tracking-tight text-primary mb-2">
            Bundle Deals
          </h1>
          <p className="text-[15px] font-medium text-secondary m-0 max-w-xl">
            BOGO offers &amp; exclusive combo packs — save more when you buy together.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 md:py-16">
        {combos.length > 0 ? (
          <CombosGrid
            combos={combos}
            currentPage={page}
            totalPages={totalPages}
          />
        ) : (
          <div className="pt-20">
            <EmptyState
              heading="No bundle deals active right now."
              subHeading="Check back later for new combo offers."
            />
          </div>
        )}
      </div>

      {/* SEO Footer */}
      <div className="border-t border-glass-border py-12 md:py-16 bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent block mb-2">Stack &amp; Save</span>
              <p className="text-xs text-secondary leading-relaxed m-0">
                Our bundle deals give you maximum value — BOGO or multi-buy, you always get premium quality for less.
              </p>
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent block mb-2">Popular Bundles</span>
              <ul className="text-xs text-secondary space-y-1.5 list-none p-0 m-0">
                <li>• Buy 2 Pairs, Get 15% Off</li>
                <li>• Essential Socks Packs</li>
                <li>• Complete Gym Kits</li>
              </ul>
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent block mb-2">Limited Time</span>
              <p className="text-xs text-secondary leading-relaxed m-0">
                Most bundle deals are available for a limited time only. Grab your favorites before the campaign ends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CombosPage;
