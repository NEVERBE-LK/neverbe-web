import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/og/"],
      disallow: [
        "/bag",
        "/cart",
        "/checkout",
        "/account",
        "/admin",
        "/api/",
        "/ebill",
        "/search",
      ],
    },
    sitemap: "https://neverbe.lk/sitemap.xml",
    host: "https://neverbe.lk",
  };
}
