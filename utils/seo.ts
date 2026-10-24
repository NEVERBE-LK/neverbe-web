import type { Product } from "@/interfaces/Product";

export const SITE_URL = "https://neverbe.lk";
export const SITE_NAME = "NEVERBE";

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).href;
}

export function plainDescription(value: string, limit = 300) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

/** Preserve an explicit catalog disclosure when a long description is shortened for search. */
export function productSearchName(product: Product) {
  const name = product.name.trim();
  const brand = product.brand?.trim();
  const hasBrand = !brand || name.toLowerCase().includes(brand.toLowerCase());
  const displayName = hasBrand || /^(fashion|generic|unbranded)$/i.test(brand)
    ? name
    : `${brand} ${name}`;
  const disclosedReplica = /\b(?:this is a (?:high[- ]quality )?replica|not a genuine original)\b/i.test(
    plainDescription(product.description || "", 10000),
  );
  return disclosedReplica && !/\breplica\b/i.test(displayName)
    ? `${displayName} (Replica)`
    : displayName;
}

export function productSearchDescription(product: Product) {
  const name = productSearchName(product);
  const description = plainDescription(product.description || "", 160);
  // The name includes any explicit replica disclosure, even if it was at the end of the catalog text.
  if (/\(Replica\)$/.test(name)) {
    return plainDescription(`${name}. View available sizes, colours and prices in LKR at NEVERBE Sri Lanka.`, 160);
  }
  return description || plainDescription(
    `Shop ${name}, ${product.category || "footwear"}, online at NEVERBE Sri Lanka. View available sizes, colours and current pricing in LKR.`,
    160,
  );
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
    name: productSearchName(product),
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
