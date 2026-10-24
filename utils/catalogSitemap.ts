import type { MetadataRoute } from "next";
import type { Product } from "@/interfaces/Product";
import { categoryLabelToSlug, getCategoryBySlug } from "@/utils/categorySlug";
import { absoluteUrl } from "@/utils/seo";

/** Use published products as the source of truth, including legacy category labels. */
export function catalogSitemapEntries(products: Product[]): MetadataRoute.Sitemap {
  const entries = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const product of products) {
    if (
      !product.id?.trim() || product.id === "undefined" ||
      product.isDeleted || product.status === false || product.listing === false
    ) continue;

    const url = absoluteUrl(`/collections/products/${encodeURIComponent(product.id)}`);
    const updated = product.updatedAt;
    const modified = typeof updated === "string" || typeof updated === "number"
      ? new Date(updated)
      : null;
    entries.set(url, {
      url,
      ...(modified && !Number.isNaN(modified.getTime()) ? { lastModified: modified } : {}),
      changeFrequency: "daily",
      priority: 0.8,
    });

    const category = getCategoryBySlug(categoryLabelToSlug(product.category || ""));
    if (category) {
      const categoryUrl = absoluteUrl(`/collections/${category.slug}`);
      entries.set(categoryUrl, {
        url: categoryUrl,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }
  return [...entries.values()];
}
