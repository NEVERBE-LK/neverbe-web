import Link from "next/link";
import { FEATURED_COLLECTION_SLUGS, getCategoryBySlug } from "@/utils/categorySlug";

/** Server-rendered links remain available without opening a menu or filter. */
export default function ShopByCategory() {
  return (
    <nav className="shop-category-links" aria-label="Shop by footwear category">
      {FEATURED_COLLECTION_SLUGS.map((slug) => (
        <Link key={slug} href={`/collections/${slug}`}>
          {getCategoryBySlug(slug)!.h1}
        </Link>
      ))}
    </nav>
  );
}
