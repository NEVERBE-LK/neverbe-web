import type { Product } from "@/interfaces/Product";

export const SITE_URL = "https://neverbe.lk";
export const SITE_NAME = "NEVERBE";

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).href;
}

export function plainDescription(value: string, limit = 300) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

/** Escape markup delimiters so catalog text cannot terminate a JSON-LD script. */
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/** Only factual catalog properties; no invented ratings, reviews or shipping prices. */
export function productStructuredData(product: Product) {
  const canonical = absoluteUrl(
    `/collections/products/${encodeURIComponent(product.id)}`,
  );
  const price =
    product.discount > 0
      ? Math.round(
          (product.sellingPrice * (100 - product.discount)) / 100 / 10,
        ) * 10
      : product.sellingPrice;
  const images = [
    product.thumbnail?.url,
    ...(product.variants?.flatMap(
      (variant) => variant.images?.map((image) => image.url) || [],
    ) || []),
  ].filter((image): image is string => Boolean(image));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${canonical}#product`,
    name: product.name,
    url: canonical,
    image: [...new Set(images)].slice(0, 8).map(absoluteUrl),
    description: plainDescription(
      product.description ||
        `${product.name}. Shop ${product.category || "footwear and clothing"} online in Sri Lanka at NEVERBE.`,
      1000,
    ),
    sku: product.id,
    category: product.category,
    brand: { "@type": "Brand", name: product.brand || SITE_NAME },
    ...(Number.isFinite(price) && price > 0
      ? {
          offers: {
            "@type": "Offer",
            url: canonical,
            priceCurrency: "LKR",
            price: price.toFixed(2),
            availability: product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: {
              "@id": `${SITE_URL}/#organization`,
              "@type": "Organization",
              name: SITE_NAME,
            },
            availableAtOrFrom: { "@id": `${SITE_URL}/#store` },
          },
        }
      : {}),
  };
}
