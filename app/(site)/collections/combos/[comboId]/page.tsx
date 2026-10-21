import { absoluteUrl, plainDescription, serializeJsonLd } from "@/utils/seo";
import { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getComboById } from "@/actions/promotionAction";
import ComboHero from "./components/ComboHero";
import Breadcrumbs from "@/components/Breadcrumbs";

// Cache the fetch to dedupe requests
const getCombo = cache(async (id: string) => {
  try {
    return await getComboById(id);
  } catch (e) {
    console.error(e);
    return null;
  }
});

const getAbsoluteUrl = (url?: string) => {
  if (!url) return "https://neverbe.lk/offers-og.png";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://neverbe.lk${url.startsWith("/") ? "" : "/"}${url}`;
};

// Dynamic Metadata
export async function generateMetadata(context: {
  params: Promise<{ comboId: string }>;
}): Promise<Metadata> {
  const params = await context.params;
  const combo = await getCombo(params.comboId);

  if (!combo) {
    return {
      title: "Deal Not Found | neverbe.",
      description: "The requested combo deal could not be found.",
      robots: { index: false, follow: true },
    };
  }

  const savings = combo.originalPrice - combo.comboPrice;
  const ogImg = getAbsoluteUrl(combo.thumbnail?.url || "/offers-og.png");

  return {
    metadataBase: new URL("https://neverbe.lk"),
    alternates: {
      canonical: absoluteUrl(
        `/collections/combos/${encodeURIComponent(combo.id)}`,
      ),
    },
    title: `${combo.name} - Save Rs. ${savings} | neverbe.`,
    description:
      combo.description ||
      `Get ${combo.name} bundle and save Rs. ${savings}. Limited time combo deal at neverbe.lk!`,
    openGraph: {
      title: `${combo.name} | neverbe.`,
      description: `Save Rs. ${savings} with this exclusive combo deal.`,
      url: `https://neverbe.lk/collections/combos/${combo.id}`,
      siteName: "neverbe.",
      images: [
        {
          url: ogImg,
          secureUrl: ogImg,
          width: 1200,
          height: 630,
          alt: combo.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${combo.name} | neverbe.`,
      description: `Save Rs. ${savings} with this exclusive combo deal.`,
      images: [ogImg],
    },
    other: {
      image_src: ogImg,
      "og:image:secure_url": ogImg,
    },
  };
}

const ComboDetailPage = async (context: {
  params: Promise<{ comboId: string }>;
}) => {
  const params = await context.params;
  const combo = await getCombo(params.comboId);

  if (!combo) return notFound();

  // JSON-LD Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: combo.name,
    url: absoluteUrl(`/collections/combos/${encodeURIComponent(combo.id)}`),
    description: plainDescription(combo.description || combo.name),
    image: getAbsoluteUrl(combo.thumbnail?.url),
    ...(Number.isFinite(combo.comboPrice) && combo.comboPrice > 0
      ? {
          offers: {
            "@type": "Offer",
            price: combo.comboPrice,
            priceCurrency: "LKR",
            url: absoluteUrl(
              `/collections/combos/${encodeURIComponent(combo.id)}`,
            ),
          },
        }
      : {}),
  };

  // Build breadcrumb items
  const breadcrumbItems = [
    { label: "Combos", href: "/collections/combos" },
    { label: combo.name },
  ];

  return (
    <main className="commerce-legacy w-full relative bg-void text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />

      {/* Container with Nike-style spacing */}
      <div className="max-w-text mx-auto pt-[100px] md:pt-[140px] px-6 md:px-12 pb-20">
        {/* Breadcrumbs Navigation */}
        <div className="pb-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <ComboHero combo={combo} />
      </div>
    </main>
  );
};

export default ComboDetailPage;
