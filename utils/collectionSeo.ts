import type { Metadata } from "next";
import { absoluteUrl, SITE_URL } from "@/utils/seo";
import { catalogPageHref, type CatalogQuery } from "@/utils/catalogQuery";

export function collectionMetadata(
  base: Metadata,
  path: string,
  query: CatalogQuery,
  options: { empty?: boolean } = {},
): Metadata {
  // Facets and sorting are browsing states; curated collections have their own indexable URLs.
  const canonical = absoluteUrl(
    query.filtered ? path : catalogPageHref(path, query, query.page),
  );
  const title =
    typeof base.title === "string" ? base.title : "Shop NEVERBE Sri Lanka";
  const pageTitle = query.page > 1 ? `${title} — Page ${query.page}` : title;
  return {
    ...base,
    title: { absolute: pageTitle },
    alternates: { ...base.alternates, canonical },
    openGraph: { ...base.openGraph, title: pageTitle, url: canonical },
    twitter: { ...base.twitter, title: pageTitle },
    robots: { index: !query.filtered && !options.empty, follow: true },
  };
}

/** Collection lists reference product pages. Merchant offers belong on product detail pages. */
export function collectionStructuredData({
  name,
  description,
  path,
  query,
  items,
  categoryName,
}: {
  name: string;
  description: string;
  path: string;
  query: CatalogQuery;
  items: { id: string; name: string }[];
  categoryName?: string;
}) {
  const url = absoluteUrl(catalogPageHref(path, query, query.page));
  const crumbs = [{ name: "Home", item: SITE_URL }];
  if (categoryName)
    crumbs.push({
      name: "Products",
      item: absoluteUrl("/collections/products"),
    });
  crumbs.push({ name: categoryName || name, item: absoluteUrl(path) });
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          ...crumb,
        })),
      },
      {
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        name,
        description,
        url,
        inLanguage: "en-LK",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: items.filter((item) => item.id && item.name).length,
          itemListElement: items
            .filter((item) => item.id && item.name)
            .map((item, index) => ({
              "@type": "ListItem",
              position: (query.page - 1) * query.size + index + 1,
              name: item.name,
              url: absoluteUrl(
                `/collections/${path === "/collections/combos" ? "combos" : "products"}/${encodeURIComponent(item.id)}`,
              ),
            })),
        },
      },
    ],
  };
}
