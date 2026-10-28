"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoGiftOutline,
  IoFlashOutline,
  IoCheckmarkCircleOutline,
  IoArrowForward,
  IoLockClosedOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";
import usePromotions, { ActivePromotion } from "@/hooks/usePromotions";

interface PromotionBannerProps {
  variant?: "inline" | "sticky" | "card";
  showNearby?: boolean;
  className?: string;
}

const PromotionBanner: React.FC<PromotionBannerProps> = ({
  variant = "inline",
  showNearby = true,
  className = "",
}) => {
  const {
    eligiblePromotions,
    nearbyPromotions,
    restrictedPromotions,
    isLoading,
    hasComboItems,
    isBlocked,
    appliedPromotions,
    totalPromotionDiscount,
  } = usePromotions();

  // --- BLOCKED STATE (Combo Items - NEVERBE Alert Style) ---
  if (isBlocked && hasComboItems && variant === "inline") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`flex items-start gap-4 p-5 bg-surface-2 border-l-4 border-accent shadow-custom rounded-[24px] ${className}`}
      >
        <IoLockClosedOutline
          className="text-primary-dark shrink-0 mt-0.5"
          size={20}
        />
        <div>
          <p className="text-base font-display font-black uppercase tracking-tighter text-primary-dark">
            Promotions Locked
          </p>
          <p className="text-sm text-primary-dark mt-1 font-medium leading-relaxed">
            Special offers cannot be combined with combo deals. Remove items to
            unlock.
          </p>
        </div>
      </motion.div>
    );
  }

  if (isLoading) return null;

  const bestPromo = eligiblePromotions[0];
  const nearestPromo = nearbyPromotions[0];

  if (!bestPromo && !nearestPromo && restrictedPromotions.length === 0)
    return null;

  const getIcon = (type: ActivePromotion["type"]) => {
    switch (type) {
      case "BOGO":
        return <IoGiftOutline size={22} className="text-accent" />;
      case "PERCENTAGE":
      case "FIXED":
        return <IoFlashOutline size={22} className="text-accent" />;
      default:
        return <IoCheckmarkCircleOutline size={22} className="text-accent" />;
    }
  };

  // --- VARIANT: INLINE (Cart/Checkout Summary Look) ---
  if (variant === "inline") {
    const displayPromotions =
      appliedPromotions.length > 0
        ? appliedPromotions
        : bestPromo
          ? [bestPromo]
          : [];
    const hasStackedPromotions = displayPromotions.length > 1;

    return (
      <div className={`space-y-6 animate-fade ${className}`}>
        <AnimatePresence mode="wait">
          {displayPromotions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-5 border border-default bg-surface shadow-sm relative overflow-hidden group rounded-2xl"
            >
              {/* Subtle brand glow on card */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/10 transition-all duration-700" />

              <div className="flex items-start gap-4 relative z-10">
                <div className="p-2 bg-surface-2 rounded-full shadow-inner">
                  {getIcon(displayPromotions[0].type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-base font-display font-black uppercase tracking-tighter text-primary-dark">
                        {hasStackedPromotions
                          ? `${displayPromotions.length} Offers Applied`
                          : displayPromotions[0].name}
                      </p>
                      <p className="text-xs text-muted mt-1 font-medium tracking-tight line-clamp-2">
                        {hasStackedPromotions
                          ? displayPromotions.map((p) => p.name).join(" + ")
                          : displayPromotions[0].message}
                      </p>
                    </div>
                    {totalPromotionDiscount > 0 && (
                      <p className="text-xl font-display font-black text-warning whitespace-nowrap tracking-tighter">
                        -Rs. {totalPromotionDiscount.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Technical Progress UI for Nearby Promos */}
        {showNearby && nearestPromo && !bestPromo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-5 bg-surface-3 border border-default rounded-2xl"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-start gap-3">
                <div className="bg-dark p-1.5 rounded-full text-accent shadow-lg">
                  <IoAlertCircleOutline size={20} />
                </div>
                <div>
                  <p className="text-base font-display font-black uppercase tracking-tighter text-primary-dark">
                    Unlock Special Savings
                  </p>
                  <p className="text-sm text-primary-dark mt-1 font-medium">
                    Spend{" "}
                    <span className="text-primary-dark font-black tracking-tighter">
                      Rs. {nearestPromo.remaining?.toLocaleString()}
                    </span>{" "}
                    more to get {nearestPromo.name}
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-accent bg-dark px-2 py-0.5 rounded shadow-custom">
                {nearestPromo.progress}%
              </span>
            </div>

            {/* Performance Progress Bar - Skewed Design */}
            <div className="w-full h-2 bg-surface overflow-hidden rounded-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${nearestPromo.progress}%` }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-accent shadow-[0_0_10px_var(--color-accent)] -skew-x-12 origin-left scale-110"
              />
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // --- VARIANT: STICKY (NEVERBE Performance Top Bar) ---
  if (variant === "sticky") {
    const promo = bestPromo || nearestPromo;
    if (!promo) return null;

    return (
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="w-full bg-dark text-inverse py-3 px-4 border-b border-accent/20"
      >
        <div className="max-w-content mx-auto flex items-center justify-center">
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-3">
            <IoFlashOutline size={16} className="text-accent animate-pulse" />
            {promo.isEligible ? (
              <>
                <span>{promo.message}</span>
                {promo.savings && (
                  <span className="bg-accent text-dark px-3 py-0.5 font-black tracking-tighter ml-2 shadow-custom">
                    SAVE RS. {promo.savings.toLocaleString()}
                  </span>
                )}
              </>
            ) : (
              <span>
                Add Rs. {promo.remaining?.toLocaleString()} for{" "}
                <span className="text-accent font-black tracking-tighter underline underline-offset-4 decoration-accent/50">
                  {promo.name}
                </span>
              </span>
            )}
            <IoFlashOutline size={16} className="text-accent animate-pulse" />
          </p>
        </div>
      </motion.div>
    );
  }

  // --- VARIANT: CARD (Performance Gallery Style) ---
  if (variant === "card") {
    return (
      <div className="grid gap-8">
        {eligiblePromotions.map((promo) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="p-8 border-2 border-default bg-surface flex flex-col md:flex-row items-center gap-10 group shadow-custom hover:shadow-hover hover:border-accent transition-all duration-500"
          >
            <div className="w-24 h-24 bg-surface-2 rounded-full flex items-center justify-center text-accent shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
              {getIcon(promo.type)}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] bg-accent text-dark px-3 py-1 shadow-custom">
                  Active Offer
                </span>
                <h3 className="text-3xl font-display font-black uppercase tracking-tighter text-primary-dark">
                  {promo.name}
                </h3>
              </div>
              <p className="text-base text-muted font-medium leading-relaxed mb-6 max-w-xl">
                {promo.description}
              </p>
              {promo.savings && (
                <div className="inline-flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest text-warning mb-1">
                    Your Benefit:
                  </span>
                  <p className="text-3xl font-display font-black text-warning tracking-tighter">
                    - Rs. {promo.savings.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <Link
              href="/checkout"
              className="group flex items-center justify-between px-10 py-5 bg-dark text-inverse rounded-full font-black text-sm uppercase tracking-widest transition-all hover:bg-accent hover:text-dark hover:shadow-hover active:scale-95 whitespace-nowrap"
            >
              Get Saving
              <IoArrowForward
                size={18}
                className="ml-3 transition-transform group-hover:translate-x-2"
              />
            </Link>
          </motion.div>
        ))}
      </div>
    );
  }

  return null;
};

export default PromotionBanner;
