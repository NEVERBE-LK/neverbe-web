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
import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Products from "@/app/(site)/collections/products/components/Products";
import { getCategoryBySlug, CATEGORY_MAPPINGS } from "@/utils/categorySlug";

// Generate static params for all known categories
export async function generateStaticParams() {
  return CATEGORY_MAPPINGS.map((c) => ({
    category: c.slug,
  }));
}

export async function generateMetadata(context: {
  params: Promise<{ category: string }>;
  searchParams: Promise<CatalogSearchParams>;
}): Promise<Metadata> {
  const params = await context.params;
  const decodedCategory = decodeURIComponent(params.category);
  const mapping = getCategoryBySlug(decodedCategory);

  if (!mapping) {
    const normalized = decodedCategory.toLowerCase().trim();
    const match = CATEGORY_MAPPINGS.find(
      (c) =>
        c.label.toLowerCase() === normalized ||
        c.slug.replace(/-/g, " ") === normalized ||
        c.slug === normalized.replace(/\s+/g, "-"),
    );
    if (match) {
      return {
        alternates: {
          canonical: `https://neverbe.lk/collections/${match.slug}`,
        },
      };
    }
    return {
      title: "Category Not Found | Neverbe",
      description: "The requested category could not be found.",
      robots: { index: false, follow: true },
    };
  }

  return collectionMetadata(
    {
      title: /neverbe/i.test(mapping.title) ? mapping.title : `${mapping.title} | NEVERBE`,
      description: mapping.description,
      openGraph: {
        title: mapping.title,
        description: mapping.description,
        type: "website",
        siteName: "NEVERBE",
        locale: "en_LK",
        images: [
          {
            url: "/collections-og.png",
            width: 1200,
            height: 630,
            alt: mapping.h1,
          },
        ],
      },
      twitter: { card: "summary_large_image", images: ["/collections-og.png"] },
    },
    `/collections/${mapping.slug}`,
    catalogQuery(await context.searchParams, mapping.label),
  );
}

export const revalidate = 3600;

const CategoryPage = async (context: {
  params: Promise<{ category: string }>;
  searchParams: Promise<CatalogSearchParams>;
}) => {
  const params = await context.params;
  const decodedCategory = decodeURIComponent(params.category);
  const mapping = getCategoryBySlug(decodedCategory);

  if (!mapping) {
    const normalized = decodedCategory.toLowerCase().trim();
    const match = CATEGORY_MAPPINGS.find(
      (c) =>
        c.label.toLowerCase() === normalized ||
        c.slug.replace(/-/g, " ") === normalized ||
        c.slug === normalized.replace(/\s+/g, "-"),
    );
    if (match) {
      permanentRedirect(`/collections/${match.slug}`);
    }
    return notFound();
  }

  const query = catalogQuery(await context.searchParams, mapping.label);
  const initialData = await getCatalogPage("/web/products", query.key);
  const productList = initialData.products;
  if (!initialData.error && !catalogPageExists(query, initialData.total))
    notFound();
  const categorySchema = collectionStructuredData({
    name: `${mapping.h1} in Sri Lanka`,
    description: mapping.description,
    path: `/collections/${mapping.slug}`,
    query,
    items: productList,
    categoryName: mapping.h1,
  });

  return (
    <main className="commerce-legacy v2-landing w-full min-h-screen bg-void text-primary transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(categorySchema),
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
            <Link
              href="/collections/products"
              className="hover:text-accent transition-colors"
            >
              Products
            </Link>
            <span>/</span>
            <span className="text-primary">{mapping.h1}</span>
          </nav>

          <span className="v2-section-label mb-2">Category Spotlight</span>
          <h1 className="v2-section-title text-[clamp(2.5rem,6vw,4.5rem)] font-black uppercase tracking-tight text-primary mb-3">
            {mapping.h1}
          </h1>
          <p className="text-[15px] font-medium text-secondary max-w-xl">
            {mapping.subtitle}
          </p>
        </div>
      </div>

      {/* Product Grid & Filter Layout */}
      <div className="w-full py-4 md:py-8">
        <Suspense fallback={null}>
          <Products
            key={query.key}
            items={productList}
            defaultCategory={mapping.label}
            initialData={initialData}
            initialKey={query.key}
          />
        </Suspense>
      </div>

      <CollectionAdvice collection={mapping.slug} />
    </main>
  );
};

export default CategoryPage;
