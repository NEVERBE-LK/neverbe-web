"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export interface BentoShowcaseProps {
  categories: Array<{ name: string; imageUrl?: string }>;
  promotions: Array<{ id: string; name: string; bannerUrl?: string; isActive: boolean }>;
}

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "casual shoes":
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
  sneakers:
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80",
  "formal shoes":
    "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80",
  "sandals & slippers & slides":
    "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80",
  "chunky shoes":
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
  "running shoes":
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  "men's clothing":
    "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=800&q=80",
  "women's clothing":
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
  activewear:
    "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80",
};

const resolveCategoryImage = (name: string, imageUrl?: string) => {
  if (imageUrl && imageUrl.trim() !== "") {
    return imageUrl;
  }
  const key = name.toLowerCase().trim();
  if (CATEGORY_IMAGE_MAP[key]) {
    return CATEGORY_IMAGE_MAP[key];
  }
  for (const [mapKey, url] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (key.includes(mapKey) || mapKey.includes(key)) {
      return url;
    }
  }
  return "/collection-placeholder.png";
};

export function BentoShowcase({ categories, promotions }: BentoShowcaseProps) {
  const activePromotions = promotions.filter((p) => p.isActive);

  const items = [
    ...categories.map((cat) => ({
      label: cat.name,
      image: resolveCategoryImage(cat.name, cat.imageUrl),
      link:
        "/collections/products?category=" +
        encodeURIComponent(cat.name.toLowerCase()),
    })),
    ...activePromotions.map((promo) => ({
      label: promo.name,
      image: promo.bannerUrl || "/collection-placeholder.png",
      link: "/collections/offers",
    })),
  ].slice(0, 6);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const getGridAreaClass = (index: number) => {
    switch (index) {
      case 0:
        return "col-span-2 md:col-span-1 md:row-start-1 md:row-end-4 md:col-start-1 md:col-end-2 h-[280px] md:h-auto";
      case 1:
        return "md:row-start-1 md:row-end-2 md:col-start-2 md:col-end-3 h-[200px] md:h-auto";
      case 2:
        return "md:row-start-1 md:row-end-3 md:col-start-3 md:col-end-4 h-[200px] md:h-auto";
      case 3:
        return "md:row-start-2 md:row-end-3 md:col-start-2 md:col-end-3 h-[200px] md:h-auto";
      case 4:
        return "md:row-start-3 md:row-end-4 md:col-start-2 md:col-end-3 h-[200px] md:h-auto";
      case 5:
        return "md:row-start-3 md:row-end-4 md:col-start-3 md:col-end-4 h-[200px] md:h-auto";
      default:
        return "h-[200px] md:h-auto";
    }
  };

  return (
    <section className="py-16 md:py-24 max-w-[1400px] mx-auto px-4 md:px-8">
      <div className="flex flex-row justify-between items-end mb-8">
        <div>
          <span className="v2-section-label block mb-2">CURATED FOR YOU</span>
          <h2
            className="v2-section-title"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
          >
            SHOP BY STYLE
          </h2>
        </div>
        <Link
          href="/collections/products"
          className="text-secondary hover:text-accent transition-colors text-sm font-medium"
        >
          View All &rarr;
        </Link>
      </div>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 gap-4 md:grid-rows-[repeat(3,200px)]"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {items.map((item, index) => (
          <motion.div
            key={item.label + index}
            variants={itemVariants}
            className={`group relative overflow-hidden rounded-sm border border-glass-border hover:border-accent transition-all duration-500 ${getGridAreaClass(
              index
            )}`}
          >
            <Link href={item.link} className="block w-full h-full relative z-10">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-surface-2 to-surface-2 transition-transform duration-700 group-hover:scale-105" />
              )}

              {/* Dark Gradient Overlay for High Contrast Text */}
              <div
                className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-300"
                style={{
                  background:
                    "linear-gradient(to top, color-mix(in srgb, var(--color-black) 85.0%, transparent) 0%, color-mix(in srgb, var(--color-black) 30.0%, transparent) 50%, transparent 100%)",
                }}
              />

              <div className="absolute inset-x-0 bottom-0 p-6 z-30 flex justify-between items-end">
                <h3 className="text-[14px] font-[800] uppercase tracking-wide text-inverse group-hover:text-accent transition-colors duration-300 m-0">
                  {item.label}
                </h3>

                <div className="w-9 h-9 rounded-full bg-dark/40 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:bg-accent group-hover:border-accent transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4 text-inverse group-hover:text-accent-text transition-colors" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
