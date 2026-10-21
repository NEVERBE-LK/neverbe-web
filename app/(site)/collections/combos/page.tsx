import CollectionAdvice from "@/components/CollectionAdvice";
import { catalogQuery, type CatalogSearchParams } from "@/utils/catalogQuery";
import {
  collectionMetadata,
  collectionStructuredData,
} from "@/utils/collectionSeo";
import { serializeJsonLd } from "@/utils/seo";
import { Metadata } from "next";
import { getPaginatedCombos } from "@/actions/promotionAction";
import Link from "next/link";
import CombosGrid from "./components/CombosGrid";
import EmptyState from "@/components/EmptyState";

// OPTIMIZATION: Cache for 1 hour (ISR)
export const revalidate = 3600;

const baseMetadata: Metadata = {
  title: "Bundle Deals & Combos | Shoes & Clothing Offers | Neverbe",
  description:
    "Browse current bundle deals on sneakers, clothing and apparel at NEVERBE Sri Lanka. Check included items, available options and current prices.",
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
      "Browse current footwear and clothing bundles, included items and prices in Sri Lankan rupees.",
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
    description: "Explore current footwear and clothing bundles in Sri Lanka.",
    images: ["/offers-og.png"],
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
    "/collections/combos",
    catalogQuery({ page: (await searchParams).page }),
  );
}

const CombosPage = async ({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) => {
  const params = await searchParams;
  const query = catalogQuery({ page: params.page });
  const page = query.page;
  const pageSize = query.size;
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

  const combosSchema = collectionStructuredData({
    name: "Bundle deals in Sri Lanka",
    description:
      "Browse current NEVERBE bundle offers and their included items.",
    path: "/collections/combos",
    query,
    items: combos,
  });

  return (
    <main className="commerce-legacy w-full min-h-screen bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(combosSchema) }}
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
            Explore current bundle offers and check what is included before
            choosing your options.
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

      <CollectionAdvice collection="combos" />
    </main>
  );
};

export default CombosPage;
