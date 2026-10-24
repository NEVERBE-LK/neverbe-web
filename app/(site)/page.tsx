import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Truck, CreditCard, MapPin } from "lucide-react";
import Hero from "./components/Hero";
import ProductShowcase from "./components/ProductShowcase";
import SEOContent from "./components/SEOContent";
import ShopByCategory from "@/components/ShopByCategory";
import { getRecentItems, getHotProducts } from "@/actions/productAction";
import { getSliders } from "@/actions/slideAction";

export const metadata: Metadata = {
  title: { absolute: "NEVERBE | Shoes, Sneakers & Slides Online Sri Lanka" },
  description:
    "Shop sneakers, running shoes, slides and everyday footwear online at NEVERBE Sri Lanka. Compare sizes and prices in LKR, with island-wide cash on delivery.",
  alternates: { canonical: "https://neverbe.lk" },
  openGraph: {
    title: "NEVERBE — Never stand still",
    description:
      "Sneakers, running shoes, slides and everyday footwear. Compare sizes and prices with delivery across Sri Lanka.",
    url: "https://neverbe.lk",
    siteName: "Neverbe",
    locale: "en_LK",
    type: "website",
    images: [
      {
        url: "/main-og.png",
        width: 1200,
        height: 630,
        alt: "NEVERBE Sri Lanka — footwear and apparel",
      },
    ],
  },
};
export const revalidate = 3600;
const categories = [
  {
    name: "The everyday rotation.",
    label: "SNEAKERS & FOOTWEAR",
    href: "/collections/sneakers",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    alt: "Red sports sneaker on a bold red background",
    className: "sport-category-shoes",
  },
  {
    name: "Made to move.",
    label: "RUNNING SHOES",
    href: "/collections/running-shoes",
    image:
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=900&q=80",
    alt: "Athlete stretching outdoors in activewear",
    className: "sport-category-active",
  },
  {
    name: "Off-duty. On point.",
    label: "EVERYDAY STYLE",
    href: "/collections/casual-shoes",
    image:
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80",
    alt: "Sneakers styled for everyday wear",
    className: "sport-category-style",
  },
];
export default async function Home() {
  const [arrivals, hotItems, sliders] = await Promise.all([
    getRecentItems(8),
    getHotProducts(),
    getSliders(),
  ]);
  return (
    <div className="sport-home">
      <Hero slides={sliders} />
      <div className="sport-benefits">
        <span>
          <Truck size={19} /> Delivered across Sri Lanka
        </span>
        <span>
          <CreditCard size={19} /> Cash on delivery available
        </span>
        <span>
          <MapPin size={19} /> From our island. For your journey.
        </span>
      </div>
      <ShopByCategory />
      <section
        id="discover"
        className="sport-section"
        aria-labelledby="discover-heading"
      >
        <div className="sport-section-heading">
          <div>
            <p className="sport-eyebrow">FIND YOUR EVERYDAY EXTRA</p>
            <h2 id="discover-heading">Different ways to move.</h2>
          </div>
          <span className="sport-section-note">
            One destination. Endless possibilities.
          </span>
        </div>
        <div className="sport-categories">
          {categories.map((category) => (
            <Link
              key={category.label}
              href={category.href}
              className={`sport-category ${category.className}`}
            >
              <Image
                src={category.image}
                alt={category.alt}
                fill
                sizes="(max-width: 640px) 88vw, (max-width: 1000px) 48vw, 33vw"
              />
              <div className="sport-category-shade" />
              <div className="sport-category-copy">
                <span>{category.label}</span>
                <h3>{category.name}</h3>
                <span className="sport-category-cta">
                  Shop collection <ArrowUpRight size={18} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <ProductShowcase arrivals={arrivals} hotItems={hotItems} />
      <section className="sport-editorial" aria-labelledby="editorial-heading">
        <div className="sport-editorial-image">
          <Image
            src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80"
            alt="Runners finding their pace on an outdoor trail"
            fill
            sizes="(max-width: 760px) 100vw, 50vw"
          />
          <span>THE WORLD IS YOUR TRACK.</span>
        </div>
        <div className="sport-editorial-copy">
          <p className="sport-eyebrow">A LITTLE FURTHER. A LITTLE FREER.</p>
          <h2 id="editorial-heading">
            IT’S NOT
            <br />
            JUST A<br />
            <em>MOVE.</em>
            <br />
            IT’S YOU.
          </h2>
          <p>
            Morning miles to late-night plans. Show up as yourself, wherever the
            day takes you.
          </p>
          <Link
            className="sport-button sport-button-ink text-accent-text"
            href="/collections/products"
          >
            Find your fit{" "}
            <ArrowUpRight size={19} className="shrink-0 stroke-current text-current" />
          </Link>
        </div>
      </section>
      <section className="sport-statement">
        <p className="sport-eyebrow">NEVER ORDINARY. ALWAYS YOU.</p>
        <h2>
          BIG ENERGY.
          <br />
          ISLAND ROOTS.
        </h2>
        <p>
          Sneakers, sportswear, and everyday essentials.
          <br />A fresh perspective from Sri Lanka.
        </p>
        <Link href="/aboutUs" className="sport-text-link">
          Get to know NEVERBE <ArrowUpRight size={18} />
        </Link>
      </section>
      <SEOContent />
    </div>
  );
}
