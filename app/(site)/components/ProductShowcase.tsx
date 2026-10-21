"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ItemCard from "@/components/ItemCard";
import type { Product } from "@/interfaces/Product";

export default function ProductShowcase({
  hotItems,
  arrivals,
}: {
  hotItems: Product[];
  arrivals: Product[];
}) {
  const [active, setActive] = useState<"new" | "popular">(
    arrivals.length ? "new" : "popular",
  );
  const items = active === "new" ? arrivals : hotItems;
  if (!arrivals.length && !hotItems.length) return null;
  return (
    <section
      className="sport-section sport-products"
      aria-labelledby="products-heading"
    >
      <div className="sport-section-heading">
        <div>
          <p className="sport-eyebrow">GOOD GEAR. GREAT ENERGY.</p>
          <h2 id="products-heading">Your next rotation.</h2>
        </div>
        <Link className="sport-text-link" href="/collections/products">
          Shop all <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="sport-tabs" aria-label="Product collections">
        {arrivals.length > 0 && (
          <button
            type="button"
            aria-pressed={active === "new"}
            onClick={() => setActive("new")}
          >
            Just landed
          </button>
        )}
        {hotItems.length > 0 && (
          <button
            type="button"
            aria-pressed={active === "popular"}
            onClick={() => setActive("popular")}
          >
            Popular right now
          </button>
        )}
      </div>
      <div className="sport-product-grid">
        {items.slice(0, 8).map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
