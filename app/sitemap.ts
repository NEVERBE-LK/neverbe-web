import { MetadataRoute } from "next";
import { getCatalogForSitemap } from "@/actions/productAction";
import { getCombosForSitemap } from "@/actions/promotionAction";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://neverbe.lk";

  // Core static pages
  const staticPages = [
    "",
    "/collections/products",
    "/collections/new-arrivals",
    "/collections/combos",
    "/collections/offers",
    "/aboutUs",
    "/contact",
    "/policies/shipping-return-policy",
    "/policies/terms-conditions",
    "/policies/privacy-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamically fetch catalog data
  const [catalog, combos] = await Promise.all([
    getCatalogForSitemap(),
    getCombosForSitemap(),
  ]);

  // Ensure all dynamic URLs use the correct base URL and are structured correctly
  const processDynamicUrls = (items: any[]) => {
    return items
      .filter(
        (item) =>
          item.url && !String(item.url).toLowerCase().includes("undefined"),
      )
      .map((item) => {
        let path = String(item.url).replace(/^https?:\/\/[^\/]+/, "");
        if (!path.startsWith("/")) path = `/${path}`;

        return {
          url: `${baseUrl}${path}`,
          ...(item.lastModified &&
          !Number.isNaN(new Date(item.lastModified).getTime())
            ? { lastModified: new Date(item.lastModified) }
            : {}),
          changeFrequency: item.changeFrequency || "weekly",
          priority: item.priority || 0.7,
        };
      });
  };

  const entries = [
    ...staticPages,
    ...catalog,
    ...processDynamicUrls(combos),
  ];
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}
