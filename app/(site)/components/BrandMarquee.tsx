"use client";

import { useState } from "react";
import Image from "next/image";

interface Brand {
  name: string;
  imageUrl?: string;
  id: string;
}

const BRAND_LOGOS: Record<string, string> = {
  nike: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
  adidas: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
  jordan: "https://upload.wikimedia.org/wikipedia/en/3/37/Jumpman_logo.svg",
  puma: "https://upload.wikimedia.org/wikipedia/en/0/00/Puma-logo.svg",
  "new balance": "https://upload.wikimedia.org/wikipedia/commons/e/ea/New_Balance_logo.svg",
  converse: "https://upload.wikimedia.org/wikipedia/commons/3/30/Converse_logo.svg",
  vans: "https://upload.wikimedia.org/wikipedia/commons/9/92/Vans-logo.svg",
  reebok: "https://upload.wikimedia.org/wikipedia/commons/5/53/Reebok_2019_logo.svg",
  "under armour": "https://upload.wikimedia.org/wikipedia/commons/4/44/Under_armour_logo.svg",
};

const DEFAULT_BRANDS: Brand[] = [
  { id: "1", name: "NIKE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" },
  { id: "2", name: "ADIDAS", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" },
  { id: "3", name: "JORDAN", imageUrl: "https://upload.wikimedia.org/wikipedia/en/3/37/Jumpman_logo.svg" },
  { id: "4", name: "PUMA", imageUrl: "https://upload.wikimedia.org/wikipedia/en/0/00/Puma-logo.svg" },
  { id: "5", name: "NEW BALANCE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ea/New_Balance_logo.svg" },
  { id: "6", name: "CONVERSE", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/30/Converse_logo.svg" },
  { id: "7", name: "VANS", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/92/Vans-logo.svg" },
];

function BrandItem({ brand }: { brand: Brand }) {
  const [imageError, setImageError] = useState(false);

  const normalizedName = brand.name?.toLowerCase().trim() || "";
  const logoUrl =
    !imageError && brand.imageUrl && brand.imageUrl.startsWith("http")
      ? brand.imageUrl
      : BRAND_LOGOS[normalizedName] || null;

  return (
    <div className="v2-glass inline-flex items-center justify-center w-[180px] h-20 px-6 rounded-2xl transition-all duration-300 filter grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:border-accent shrink-0 group cursor-pointer">
      {logoUrl && !imageError ? (
        <Image
          src={logoUrl}
          alt={brand.name}
          width={120}
          height={40}
          onError={() => setImageError(true)}
          className="object-contain max-h-[38px] invert brightness-200 group-hover:brightness-100 transition-all"
        />
      ) : (
        <span className="font-display font-black text-sm uppercase tracking-widest text-primary group-hover:text-accent transition-colors">
          {brand.name}
        </span>
      )}
    </div>
  );
}

export default function BrandMarquee({ brands }: { brands?: Brand[] }) {
  const displayBrands = brands && brands.length > 0 ? brands : DEFAULT_BRANDS;
  const duplicatedBrands = [...displayBrands, ...displayBrands, ...displayBrands];

  return (
    <section className="bg-void py-16 md:py-20 overflow-hidden border-t border-glass-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="v2-section-label">OUR BRANDS</span>
          <h2 className="v2-section-title text-[clamp(1.2rem,3vw,1.8rem)]">
            TRUSTED BY THE BEST
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          {/* Row 1: Scrolling Left */}
          <div
            className="flex overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
            }}
          >
            <div className="flex animate-marquee min-w-full shrink-0 items-center justify-around gap-6">
              {duplicatedBrands.map((brand, index) => (
                <BrandItem key={`${brand.id}-${index}-row1`} brand={brand} />
              ))}
            </div>
            <div
              aria-hidden="true"
              className="flex animate-marquee min-w-full shrink-0 items-center justify-around gap-6"
            >
              {duplicatedBrands.map((brand, index) => (
                <BrandItem key={`${brand.id}-${index}-row1-clone`} brand={brand} />
              ))}
            </div>
          </div>

          {/* Row 2: Scrolling Right */}
          <div
            className="flex overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
            }}
          >
            <div className="flex animate-marquee-reverse min-w-full shrink-0 items-center justify-around gap-6">
              {duplicatedBrands.map((brand, index) => (
                <BrandItem key={`${brand.id}-${index}-row2`} brand={brand} />
              ))}
            </div>
            <div
              aria-hidden="true"
              className="flex animate-marquee-reverse min-w-full shrink-0 items-center justify-around gap-6"
            >
              {duplicatedBrands.map((brand, index) => (
                <BrandItem key={`${brand.id}-${index}-row2-clone`} brand={brand} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
