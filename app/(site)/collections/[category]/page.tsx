import { cache, Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getProductsByCategory } from "@/actions/productAction";
import Products from "@/app/(site)/collections/products/components/Products";
import {
  getCategoryBySlug,
  CATEGORY_MAPPINGS,
} from "@/utils/categorySlug";

const getProductsForCategory = cache(
  async (categoryLabel: string, page: number = 1) => {
    try {
      return await getProductsByCategory(categoryLabel, {
        page: String(page),
        size: "12",
      });
    } catch (e) {
      console.error(e);
      return { dataList: [], total: 0 };
    }
  },
);

// Generate static params for all known categories
export async function generateStaticParams() {
  return CATEGORY_MAPPINGS.map((c) => ({
    category: c.slug,
  }));
}

export async function generateMetadata(context: {
  params: Promise<{ category: string }>;
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
        c.slug === normalized.replace(/\s+/g, "-")
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

  return {
    title: `${mapping.title} | Neverbe`,
    description: mapping.description,
    keywords: mapping.keywords,
    alternates: {
      canonical: `https://neverbe.lk/collections/${mapping.slug}`,
    },
    openGraph: {
      title: `${mapping.title} | Neverbe`,
      description: mapping.description,
      url: `https://neverbe.lk/collections/${mapping.slug}`,
      type: "website",
      siteName: "Neverbe",
      locale: "en_LK",
      images: [
        {
          url: "/collections-og.png",
          width: 1200,
          height: 630,
          alt: `${mapping.h1} - Neverbe Sri Lanka`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${mapping.h1} | Neverbe Sri Lanka`,
      description: mapping.description,
      images: ["/collections-og.png"],
    },
    metadataBase: new URL("https://neverbe.lk"),
  };
}

export const revalidate = 3600;

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  color: "var(--color-primary)",
  display: "block",
  marginBottom: 12,
};

const CategoryPage = async (context: {
  params: Promise<{ category: string }>;
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
        c.slug === normalized.replace(/\s+/g, "-")
    );
    if (match) {
      permanentRedirect(`/collections/${match.slug}`);
    }
    return notFound();
  }

  const items = await getProductsForCategory(mapping.label);
  const productList = items?.dataList || [];

  const categorySchema = {
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
          {
            "@type": "ListItem",
            position: 3,
            name: mapping.h1,
            item: `https://neverbe.lk/collections/${mapping.slug}`,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        name: `${mapping.h1} - Neverbe Sri Lanka`,
        description: mapping.description,
        url: `https://neverbe.lk/collections/${mapping.slug}`,
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
          __html: JSON.stringify(categorySchema),
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
            <Link href="/collections/products" className="hover:text-accent transition-colors">
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
          <Products items={productList} defaultCategory={mapping.label} />
        </Suspense>
      </div>

      {/* SEO Footer */}
      <div className="border-t border-glass-border py-16 bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent block mb-3">
                {mapping.h1} in Sri Lanka
              </span>
              <p className="text-xs text-secondary leading-relaxed">
                {mapping.description}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent block mb-3">
                Browse More
              </span>
              <ul className="text-xs text-secondary space-y-2 list-none p-0 m-0">
                {CATEGORY_MAPPINGS.filter((c) => c.slug !== mapping.slug)
                  .slice(0, 4)
                  .map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/collections/${c.slug}`}
                        className="hover:text-accent transition-colors"
                      >
                        {c.h1}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-accent block mb-3">
                Quality Guaranteed
              </span>
              <p className="text-xs text-secondary leading-relaxed">
                Free size exchanges within 7 days. Cash on Delivery island-wide. Every product is premium quality — durability and comfort guaranteed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CategoryPage;
