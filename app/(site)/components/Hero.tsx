"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import type { Slide } from "@/interfaces/Slide";

interface HeroSlide {
  id: string;
  type: "editorial" | "banner";
  url: string;
  alt: string;
  link?: string;
  eyebrow?: string;
  titlePrimary?: string;
  titleSecondary?: string;
  titleEmphasis?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

const DEFAULT_EDITORIAL_SLIDES: HeroSlide[] = [
  {
    id: "hero-performance",
    type: "editorial",
    url: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1920&q=85",
    alt: "Athlete training outdoors in activewear",
    eyebrow: "YOUR PACE. YOUR PATH.",
    titlePrimary: "NEVER",
    titleSecondary: "STAND",
    titleEmphasis: "STILL.",
    description:
      "For the early starts. The extra mile. The everyday. Find the footwear and apparel that move with you.",
    primaryButtonText: "Shop new arrivals",
    primaryButtonLink: "/collections/new-arrivals",
    secondaryButtonText: "Explore the collection",
    secondaryButtonLink: "/collections/products",
  },
  {
    id: "hero-footwear",
    type: "editorial",
    url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1920&q=85",
    alt: "Premium sneakers on urban asphalt",
    eyebrow: "FOOTWEAR ROTATION",
    titlePrimary: "ELEVATE",
    titleSecondary: "EVERY",
    titleEmphasis: "STRIDE.",
    description:
      "Iconic silhouettes, court heritage, and relentless all-day comfort engineered for the street.",
    primaryButtonText: "Shop sneakers",
    primaryButtonLink: "/collections/sneakers",
    secondaryButtonText: "Running shoes",
    secondaryButtonLink: "/collections/running-shoes",
  },
  {
    id: "hero-activewear",
    type: "editorial",
    url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1920&q=85",
    alt: "Fitness athlete in high-performance training session",
    eyebrow: "BUILT FOR INTENSITY",
    titlePrimary: "PUSH",
    titleSecondary: "PAST",
    titleEmphasis: "LIMITS.",
    description:
      "Technical sweat-wicking activewear designed to keep up with your heaviest sessions and longest days.",
    primaryButtonText: "Shop activewear",
    primaryButtonLink: "/collections/activewear",
    secondaryButtonText: "Bundle deals",
    secondaryButtonLink: "/collections/combos",
  },
  {
    id: "hero-lifestyle",
    type: "editorial",
    url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1920&q=85",
    alt: "Outdoor runners moving through trail path",
    eyebrow: "OFF-DUTY STYLE",
    titlePrimary: "MADE FOR",
    titleSecondary: "THE",
    titleEmphasis: "JOURNEY.",
    description:
      "Breathable tees, everyday layers, and timeless silhouettes crafted for life in motion.",
    primaryButtonText: "Explore all gear",
    primaryButtonLink: "/collections/products",
    secondaryButtonText: "Exclusive offers",
    secondaryButtonLink: "/collections/offers",
  },
];

export default function Hero({ slides = [] }: { slides?: Slide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Combine curated hardcoded editorial slides with any marketing promotional banners from DB
  const slideList: HeroSlide[] = useMemo(() => {
    const bannerSlides: HeroSlide[] = (slides || []).map((slide, idx) => ({
      id: slide.id || `fetched-slide-${idx}`,
      type: "banner" as const,
      url: slide.url,
      alt: slide.fileName
        ? slide.fileName.replace(/\.[^/.]+$/, "")
        : `Promotion ${idx + 1}`,
      link: (slide as any).link || "/collections/offers",
    }));

    return [...DEFAULT_EDITORIAL_SLIDES, ...bannerSlides];
  }, [slides]);

  useEffect(() => {
    if (slideList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideList.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slideList.length]);

  const currentSlide = slideList[currentIndex] || slideList[0];
  const isEditorialSlide = currentSlide.type === "editorial";

  return (
    <section
      className={`sport-hero ${!isEditorialSlide ? "is-banner-active" : ""}`}
      aria-labelledby="hero-heading"
    >
      {slideList.map((slide, index) => {
        const isCurrent = index === currentIndex;
        const isNext = index === (currentIndex + 1) % slideList.length;
        if (!isCurrent && !isNext && index !== 0) return null;

        const isBanner = slide.type === "banner";

        const imageNode = (
          <Image
            src={slide.url}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className={`sport-hero-image ${
              isBanner ? "sport-hero-banner-image" : ""
            } transition-opacity duration-700 ease-out ${
              isCurrent ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          />
        );

        if (isBanner && slide.link) {
          return (
            <Link
              key={slide.id || index}
              href={slide.link}
              aria-label={`View ${slide.alt}`}
              className={`absolute inset-0 z-0 transition-opacity duration-700 ease-out ${
                isCurrent ? "opacity-100 cursor-pointer" : "opacity-0 pointer-events-none"
              }`}
            >
              {imageNode}
            </Link>
          );
        }

        return <div key={slide.id || index}>{imageNode}</div>;
      })}

      {/* Scrim Gradient for text contrast on editorial slides */}
      {isEditorialSlide && (
        <div
          className="sport-hero-scrim transition-opacity duration-500 ease-out"
          aria-hidden="true"
        />
      )}

      {/* Hero Editorial Content: dynamically transitions with current slide */}
      {isEditorialSlide && (
        <div
          key={currentSlide.id}
          className="sport-hero-content transition-all duration-500 ease-out opacity-100 translate-y-0"
        >
          {currentSlide.eyebrow && (
            <p className="sport-eyebrow">{currentSlide.eyebrow}</p>
          )}
          <h1 id="hero-heading">
            {currentSlide.titlePrimary}
            <br />
            {currentSlide.titleSecondary} <em>{currentSlide.titleEmphasis}</em>
          </h1>
          {currentSlide.description && <p>{currentSlide.description}</p>}
          <div className="sport-hero-buttons">
            {currentSlide.primaryButtonLink && currentSlide.primaryButtonText && (
              <Link
                href={currentSlide.primaryButtonLink}
                className="sport-button sport-button-white text-black"
              >
                {currentSlide.primaryButtonText}{" "}
                <ArrowUpRight size={19} className="shrink-0 stroke-current text-current" />
              </Link>
            )}
            {currentSlide.secondaryButtonLink && currentSlide.secondaryButtonText && (
              <Link href={currentSlide.secondaryButtonLink} className="sport-hero-link">
                {currentSlide.secondaryButtonText} <ArrowUpRight size={17} />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Controls & Pagination: accessible across all slides */}
      <div className="sport-hero-bottom">
        {slideList.length > 1 && (
          <div className="sport-hero-dots" aria-label="Slide indicators">
            {slideList.map((slide, i) => (
              <button
                key={slide.id || i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`sport-hero-dot ${i === currentIndex ? "active" : ""}`}
                aria-label={`Go to slide ${i + 1}${
                  slide.type === "editorial"
                    ? ` (${slide.titlePrimary} ${slide.titleSecondary})`
                    : " (Promotion)"
                }`}
                aria-current={i === currentIndex ? "true" : undefined}
              />
            ))}
          </div>
        )}
        <a href="#discover" aria-label="Discover the collection">
          <ArrowDown size={19} />
        </a>
      </div>
    </section>
  );
}
