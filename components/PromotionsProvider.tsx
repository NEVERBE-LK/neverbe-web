"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Promotion, ProductVariantTarget, PromotionCondition } from "@/interfaces/Promotion";
import {
  isPromotionDateValid,
  checkVariantEligibility,
  isVariantEligibleForPromotion,
} from "@/utils/promotionUtils";
import axiosInstance from "@/actions/axiosInstance";

// Active promotion for context consumers
export interface ActivePromotion extends Partial<Promotion> {
  id: string;
  name: string;
  description: string;
  type: Promotion["type"];
  bannerUrl?: string;
  isEligible?: boolean;
  message?: string;
}

interface PromotionsContextType {
  promotions: ActivePromotion[];
  isLoading: boolean;
  getPromotionForProduct: (
    productId: string,
    variantId?: string,
  ) => ActivePromotion | null;
  getPromotionsForProduct: (
    productId: string,
    variantId?: string,
  ) => ActivePromotion[];
}

const PromotionsContext = createContext<PromotionsContextType>({
  promotions: [],
  isLoading: false,
  getPromotionForProduct: () => null,
  getPromotionsForProduct: () => [],
});

export const usePromotionsContext = () => useContext(PromotionsContext);

export const PromotionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [promotions, setPromotions] = useState<ActivePromotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all active promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await axiosInstance.get("/web/promotions");
        if (res.data) {
          const data = res.data;
          setPromotions(data || []);
        }
      } catch (error) {
        console.error("Failed to fetch promotions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  // Precompute and sort active date-valid promotions once
  const validPromotions = React.useMemo(() => {
    return promotions
      .filter((promo) => isPromotionDateValid(promo.startDate, promo.endDate).valid)
      .sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0));
  }, [promotions]);

  // Fast cache for product promotion lookups
  const promoCache = React.useRef(new Map<string, ActivePromotion | null>());
  React.useEffect(() => {
    promoCache.current.clear();
  }, [validPromotions]);

  // Match a product to the best available promotion
  const getPromotionForProduct = useCallback(
    (productId: string, variantId?: string): ActivePromotion | null => {
      if (!productId) return null;
      const key = `${productId}:${variantId || ""}`;
      if (promoCache.current.has(key)) {
        return promoCache.current.get(key) || null;
      }

      for (const promo of validPromotions) {
        if (promo.excludedProducts?.includes(productId)) continue;

        const isEligible = isVariantEligibleForPromotion(
          productId,
          variantId || "",
          promo.applicableProductVariants as ProductVariantTarget[],
          promo.conditions as PromotionCondition[],
          promo.applicableProducts,
        );

        if (isEligible) {
          promoCache.current.set(key, promo);
          return promo;
        }
      }

      promoCache.current.set(key, null);
      return null;
    },
    [validPromotions],
  );

  const getPromotionsForProduct = useCallback(
    (productId: string, variantId?: string): ActivePromotion[] => {
      if (!productId) return [];

      return validPromotions.filter((promo) => {
        if (promo.excludedProducts?.includes(productId)) return false;

        return isVariantEligibleForPromotion(
          productId,
          variantId || "",
          promo.applicableProductVariants as ProductVariantTarget[],
          promo.conditions as PromotionCondition[],
          promo.applicableProducts,
        );
      });
    },
    [validPromotions],
  );

  const contextValue = React.useMemo(
    () => ({
      promotions,
      isLoading,
      getPromotionForProduct,
      getPromotionsForProduct,
    }),
    [promotions, isLoading, getPromotionForProduct, getPromotionsForProduct],
  );

  return (
    <PromotionsContext.Provider value={contextValue}>
      {children}
    </PromotionsContext.Provider>
  );
};
