/**
 * Category slug utilities for SEO-friendly URLs.
 * Maps clean URL slugs to actual category names used by the API.
 */

export interface CategoryMapping {
  slug: string;
  label: string;
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  subtitle: string;
}

/**
 * Static category mappings for SEO.
 * Slugs are used in clean URLs like /collections/sneakers
 * Labels match the exact category names from the API.
 */
export const CATEGORY_MAPPINGS: CategoryMapping[] = [
  {
    slug: "sneakers",
    label: "Sneakers",
    title: "Sneakers Sri Lanka — Sizes & Prices | NEVERBE",
    description:
      "Shop sneakers online in Sri Lanka. Compare men's and women's styles, prices in LKR, colours and available sizes at NEVERBE. Cash on delivery available.",
    keywords: [
      "sneakers sri lanka",
      "buy sneakers online",
      "sneakers colombo",
      "mens sneakers sri lanka",
      "womens sneakers sri lanka",
      "best sneakers 2026",
    ],
    h1: "Sneakers",
    subtitle: "Compare everyday sneakers by size, colour and price in LKR. Shop online with delivery across Sri Lanka.",
  },
  {
    slug: "running-shoes",
    label: "Running Shoes",
    title: "Running Shoes Sri Lanka — Sizes & Prices | NEVERBE",
    description:
      "Compare running shoes in Sri Lanka at NEVERBE. Browse current prices in LKR, available sizes and colours, with island-wide delivery and cash on delivery.",
    keywords: [
      "running shoes sri lanka",
      "buy running shoes online",
      "jogging shoes colombo",
      "marathon shoes sri lanka",
      "sports shoes sri lanka",
    ],
    h1: "Running Shoes",
    subtitle: "Browse running shoes, compare current prices in LKR and choose an available size. Delivery across Sri Lanka, with cash on delivery available.",
  },
  {
    slug: "slides-sandals",
    label: "Sandals & Slippers & Slides",
    title: "Slides, Sandals & Slippers Sri Lanka | NEVERBE",
    description:
      "Shop slides, sandals and slippers in Sri Lanka. Compare available sizes, colours and prices in LKR at NEVERBE. Island-wide delivery and cash on delivery.",
    keywords: [
      "slides sri lanka",
      "sandals sri lanka",
      "slippers sri lanka",
      "casual footwear colombo",
      "mens slides sri lanka",
    ],
    h1: "Slides, Sandals & Slippers",
    subtitle: "Find everyday slides, sandals and slippers. Compare sizes, colours and prices in Sri Lankan rupees before choosing your pair.",
  },
  {
    slug: "boots",
    label: "Boots",
    title: "Boots in Sri Lanka | Premium Boots Online",
    description:
      "Shop premium boots in Sri Lanka at Neverbe. High-ankle boots, combat boots & casual boots. Cash on Delivery island-wide.",
    keywords: [
      "boots sri lanka",
      "high-ankle boots sri lanka",
      "mens boots sri lanka",
      "combat boots colombo",
    ],
    h1: "Boots",
    subtitle: "Statement boots built for style and durability.",
  },
  {
    slug: "mens-clothing",
    label: "Clothing",
    title: "Men's Clothing in Sri Lanka | T-Shirts, Hoodies & More",
    description:
      "Shop men's clothing in Sri Lanka at Neverbe. T-shirts, hoodies, joggers & casual wear. Premium quality with Cash on Delivery island-wide.",
    keywords: [
      "mens clothing sri lanka",
      "mens t-shirts sri lanka",
      "hoodies sri lanka",
      "joggers sri lanka",
      "casual wear colombo",
      "buy clothing online sri lanka",
    ],
    h1: "Men's Clothing",
    subtitle: "Premium t-shirts, hoodies, joggers & casual wear.",
  },
  {
    slug: "activewear",
    label: "Activewear",
    title: "Activewear & Sportswear in Sri Lanka | Gym Wear Online",
    description:
      "Shop activewear & sportswear in Sri Lanka at Neverbe. Gym wear, workout clothing & performance apparel. Cash on Delivery island-wide.",
    keywords: [
      "activewear sri lanka",
      "gym wear sri lanka",
      "sportswear sri lanka",
      "workout clothes colombo",
      "performance apparel sri lanka",
      "gym clothing online",
    ],
    h1: "Activewear & Sportswear",
    subtitle: "Performance gear for the gym, track, and beyond.",
  },
  {
    slug: "sports-apparel",
    label: "Sports Apparel",
    title: "Sports Apparel in Sri Lanka | Athletic Clothing Online",
    description:
      "Shop sports apparel in Sri Lanka at Neverbe. Athletic clothing for men & women. Premium quality with Cash on Delivery island-wide.",
    keywords: [
      "sports apparel sri lanka",
      "athletic clothing sri lanka",
      "sports clothing colombo",
      "sports wear online sri lanka",
    ],
    h1: "Sports Apparel",
    subtitle: "Athletic clothing for peak performance.",
  },
  {
    slug: "accessories",
    label: "Accessories",
    title: "Fashion Accessories in Sri Lanka | Bags, Socks & More",
    description:
      "Shop fashion accessories in Sri Lanka at Neverbe. Bags, socks, caps & more. Premium quality with Cash on Delivery island-wide.",
    keywords: [
      "fashion accessories sri lanka",
      "bags sri lanka",
      "socks sri lanka",
      "caps sri lanka",
      "accessories colombo",
    ],
    h1: "Accessories",
    subtitle: "Complete your look with premium accessories.",
  },
  {
    slug: "casual-shoes",
    label: "Casual Shoes",
    title: "Casual Shoes Sri Lanka — Shop Online | NEVERBE",
    description:
      "Browse casual shoes for men and women in Sri Lanka. Compare everyday footwear, available sizes and prices in LKR. Shop NEVERBE with cash on delivery.",
    keywords: [
      "casual shoes sri lanka",
      "buy casual shoes online",
      "mens casual shoes sri lanka",
      "casual footwear colombo",
    ],
    h1: "Casual Shoes",
    subtitle: "Everyday comfort and relaxed style footwear.",
  },
  {
    slug: "chunky-shoes",
    label: "Chunky Shoes",
    title: "Chunky Shoes & Sneakers Sri Lanka | NEVERBE",
    description:
      "Shop chunky shoes and sneakers in Sri Lanka. Explore available colours, sizes and current prices in LKR at NEVERBE. Delivery across the island.",
    keywords: [
      "chunky shoes sri lanka",
      "ladies chunky shoes",
      "chunky shoes women",
      "chunky shoes price in sri lanka",
      "chunky sneakers colombo",
    ],
    h1: "Chunky Shoes",
    subtitle: "Make a statement with bold, retro-inspired chunky footwear.",
  },
  {
    slug: "formal-shoes",
    label: "Formal Shoes",
    title: "Formal Shoes Sri Lanka | Buy Men's Dress Shoes - Neverbe",
    description:
      "Shop premium formal shoes in Sri Lanka at Neverbe. High-quality dress shoes, oxford shoes, and formal loafers with Cash on Delivery island-wide.",
    keywords: [
      "formal shoes sri lanka",
      "buy formal shoes online",
      "mens formal shoes colombo",
      "dress shoes sri lanka",
    ],
    h1: "Formal Shoes",
    subtitle: "Sophisticated formal footwear for special occasions and office wear.",
  },
  {
    slug: "sports-shoes",
    label: "Sports Shoes",
    title: "Sports & Gym Shoes Sri Lanka | NEVERBE",
    description:
      "Explore sports and gym shoes in Sri Lanka. Compare product details, prices in LKR and available sizes at NEVERBE. Cash on delivery available.",
    keywords: [
      "sports shoes sri lanka",
      "athletic shoes colombo",
      "gym shoes sri lanka",
      "training sneakers online",
    ],
    h1: "Sports Shoes",
    subtitle: "Compare sports footwear by fit, size and price. Check each product's intended use before choosing shoes for your training.",
  },
  {
    slug: "outdoor-hiking-shoes",
    label: "Outdoor & Hiking Shoes",
    title: "Hiking & Outdoor Shoes Sri Lanka | Trail Footwear - Neverbe",
    description:
      "Shop outdoor & hiking shoes in Sri Lanka at Neverbe. Durable, high-traction trekking and trail footwear with Cash on Delivery island-wide.",
    keywords: [
      "hiking shoes sri lanka",
      "outdoor shoes colombo",
      "trekking shoes sri lanka",
      "trail running shoes",
    ],
    h1: "Outdoor & Hiking Shoes",
    subtitle: "Rugged and durable footwear built for adventure and hiking trails.",
  },
];

/** Main shopping paths: established footwear collections, not faceted search URLs. */
export const FEATURED_COLLECTION_SLUGS = [
  "running-shoes", "sneakers", "casual-shoes", "slides-sandals", "sports-shoes", "chunky-shoes",
] as const;

/**
 * Find a category mapping by its URL slug.
 */
export function getCategoryBySlug(
  slug: string,
): CategoryMapping | undefined {
  return CATEGORY_MAPPINGS.find((c) => c.slug === slug);
}

/**
 * Convert a category label (from API) to a URL slug.
 */
export function categoryLabelToSlug(label: string): string {
  const mapping = CATEGORY_MAPPINGS.find(
    (c) => c.label.toLowerCase() === label.toLowerCase(),
  );
  if (mapping) return mapping.slug;
  // Fallback: generate slug from label
  return label
    .toLowerCase()
    .replace(/[&]/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
