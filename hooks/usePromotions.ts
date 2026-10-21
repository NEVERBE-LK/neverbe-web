"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { applyPromotions, removePromotion } from "@/redux/bagSlice/bagSlice";
import { BagItem } from "@/interfaces/BagItem";
import { getPublicPromotions } from "@/actions/publicPromotions";
import {
  calculateTotal,
  calculateTotalDiscount,
} from "@/utils/bagCalculations";
import { ProductVariantTarget } from "@/interfaces/Promotion";
import {
  checkPromotionEligibility,
  calculatePromotionProgress,
  getEligibleCartItems,
  CartItem,
} from "@/utils/promotionUtils";

export interface ActivePromotion {
  id: string;
  name: string;
  description: string;
  type: "COMBO" | "BOGO" | "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  priority?: number; // For priority-based selection (matches backend)
  stackable?: boolean; // Whether this promotion can stack with others
  discountValue?: number;
  minOrderAmount?: number;
  applicableProducts?: string[];
  applicableProductVariants?: ProductVariantTarget[]; // Variant-level targeting
  applicableCategories?: string[];
  applicableBrands?: string[];
  excludedProducts?: string[];
  message: string;
  savings?: number;
  isEligible: boolean;
  isRestricted?: boolean; // Eligible by conditions but restricted by targeting
  restrictionReason?: string; // Why it's restricted
  progress?: number; // 0-100 for min amount progress
  remaining?: number; // Amount remaining to qualify
  isFreeShipping?: boolean; // Flag for free shipping promotions
  isActive?: boolean; // Whether promotion is active
  bannerUrl?: string; // Banner image URL
}

interface UsePromotionsReturn {
  activePromotions: ActivePromotion[];
  eligiblePromotions: ActivePromotion[];
  nearbyPromotions: ActivePromotion[];
  restrictedPromotions: ActivePromotion[]; // Promotions restricted by targeting
  isLoading: boolean;
  hasComboItems: boolean;
  isBlocked: boolean;
  appliedPromotion: ActivePromotion | null; // Primary (backward compat)
  appliedPromotions: ActivePromotion[]; // All stacked promotions
  totalPromotionDiscount: number; // Combined discount
  refreshPromotions: () => Promise<void>;
}

/**
 * usePromotions - Hook to fetch and check active promotions
 */
export const usePromotions = (): UsePromotionsReturn => {
  const dispatch = useDispatch();
  const bagItems = useSelector((state: RootState) => state.bag.bag);
  const appliedPromotionId = useSelector(
    (state: RootState) => state.bag.promotionId,
  );
  const [promotions, setPromotions] = useState<ActivePromotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastBagHash = useRef<string>("");

  // Check if bag contains combo items
  const hasComboItems = bagItems.some((item) => item.isComboItem === true);
  const isBlocked = hasComboItems;

  const cartTotal = calculateTotal(bagItems) - calculateTotalDiscount(bagItems);

  // Generate hash of bag for change detection
  const getBagHash = useCallback(() => {
    return bagItems
      .map(
        (item) =>
          `${item.itemId}-${item.variantId}-${item.size}-${item.quantity}`,
      )
      .sort()
      .join("|");
  }, [bagItems]);

  // Fetch active promotions
  const fetchPromotions = useCallback(async () => {
    // Don't fetch if combo items block promotions
    if (hasComboItems || bagItems.length === 0) {
      setPromotions([]);
      dispatch(removePromotion());
      return;
    }

    setIsLoading(true);
    try {
      const data = await getPublicPromotions<any>();
      if (data) {
        // Process promotions to check eligibility
        const processedPromotions: ActivePromotion[] = (data || [])
          .map((promo: any) => {
            const eligibilityResult = checkEligibility(
              promo,
              bagItems,
              cartTotal,
            );
            const { progress, remaining } = calculateProgress(
              promo,
              cartTotal,
              bagItems,
            );

            return {
              id: promo.id,
              name: promo.name,
              description: promo.description,
              type: promo.type,
              priority: promo.priority || 0, // Include priority for sorting
              stackable: promo.stackable || false, // Include stackable flag
              discountValue: promo.actions?.[0]?.value,
              minOrderAmount: promo.conditions?.find(
                (c: any) => c.type === "MIN_AMOUNT",
              )?.value,
              applicableProducts: promo.applicableProducts,
              applicableProductVariants: promo.applicableProductVariants, // Include variant targeting
              applicableCategories: promo.applicableCategories,
              applicableBrands: promo.applicableBrands,
              excludedProducts: promo.excludedProducts,
              message: getPromoMessage(promo, eligibilityResult.eligible),
              savings: eligibilityResult.eligible
                ? calculateSavings(promo, cartTotal, bagItems)
                : undefined,
              isEligible: eligibilityResult.eligible,
              isRestricted: eligibilityResult.restricted,
              restrictionReason: eligibilityResult.reason,
              progress,
              remaining,
              isFreeShipping:
                promo.type === "FREE_SHIPPING" ||
                promo.actions?.[0]?.type === "FREE_SHIPPING",
              isActive: promo.isActive,
              bannerUrl: promo.bannerUrl,
            };
          })
          // Sort by priority (high to low) to match backend behavior
          .sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0));

        setPromotions(processedPromotions);

        // --- STACKING LOGIC ---
        // Filter eligible promotions with savings
        const eligible = processedPromotions.filter(
          (p) => p.isEligible && p.savings && p.savings > 0,
        );

        if (eligible.length > 0) {
          const firstEligible = eligible[0];

          // If highest-priority promotion is NOT stackable, apply only that one
          if (!firstEligible.stackable) {
            dispatch(
              applyPromotions([
                {
                  id: firstEligible.id,
                  name: firstEligible.name,
                  discount: firstEligible.savings || 0,
                },
              ]),
            );
          } else {
            // First promotion IS stackable - collect all stackable promotions
            const stackedPromos = eligible
              .filter((p) => p.stackable)
              .map((p) => ({
                id: p.id,
                name: p.name,
                discount: p.savings || 0,
              }));

            dispatch(applyPromotions(stackedPromos));
          }
        } else {
          // No eligible promotions, clear any applied
          dispatch(removePromotion());
        }
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [bagItems, cartTotal, hasComboItems, dispatch]);

  // Helper: Check if cart items are eligible based on variant-level targeting
  const checkVariantEligibility = (
    items: BagItem[],
    targets: ProductVariantTarget[],
  ): boolean => {
    if (!targets || targets.length === 0) return true;

    for (const target of targets) {
      const matchingCartItems = items.filter(
        (item) => item.itemId === target.productId,
      );

      if (matchingCartItems.length === 0) continue;

      if (target.variantMode === "ALL_VARIANTS") return true;

      if (target.variantMode === "SPECIFIC_VARIANTS" && target.variantIds) {
        const hasMatchingVariant = matchingCartItems.some(
          (item) =>
            item.variantId && target.variantIds!.includes(item.variantId),
        );
        if (hasMatchingVariant) return true;
      }
    }
    return false;
  };

  // Helper: Get cart items that match variant-level targeting (for discount calculation)
  const getEligibleCartItems = (
    items: BagItem[],
    targets: ProductVariantTarget[],
  ): BagItem[] => {
    if (!targets || targets.length === 0) return items;

    return items.filter((item) => {
      for (const target of targets) {
        if (item.itemId !== target.productId) continue;

        if (target.variantMode === "ALL_VARIANTS") return true;

        if (target.variantMode === "SPECIFIC_VARIANTS" && target.variantIds) {
          return item.variantId && target.variantIds.includes(item.variantId);
        }
      }
      return false;
    });
  };

  // Check if cart meets promotion conditions
  // Returns: { eligible: boolean, restricted: boolean, reason?: string }
  const checkEligibility = (
    promo: any,
    items: BagItem[],
    total: number,
  ): { eligible: boolean; restricted: boolean; reason?: string } => {
    // First check date validity
    const now = new Date();
    if (promo.startDate) {
      const startDate = new Date(promo.startDate);
      if (now < startDate)
        return { eligible: false, restricted: false, reason: "Not yet active" };
    }
    if (promo.endDate) {
      const endDate = new Date(promo.endDate);
      if (now > endDate)
        return { eligible: false, restricted: false, reason: "Expired" };
    }

    // Check variant-level targeting FIRST (this is the fix)
    if (
      promo.applicableProductVariants &&
      promo.applicableProductVariants.length > 0
    ) {
      const variantEligible = checkVariantEligibility(
        items,
        promo.applicableProductVariants,
      );
      if (!variantEligible) {
        return {
          eligible: false,
          restricted: true,
          reason: "Requires specific product variants not in your cart",
        };
      }
    }

    // Check applicable products targeting (if any cart item matches)
    if (promo.applicableProducts && promo.applicableProducts.length > 0) {
      const hasApplicableProduct = items.some((item) =>
        promo.applicableProducts.includes(item.itemId),
      );
      if (!hasApplicableProduct) {
        return {
          eligible: false,
          restricted: true,
          reason: "Requires specific products not in your cart",
        };
      }
    }

    // Check applicable categories targeting
    if (promo.applicableCategories && promo.applicableCategories.length > 0) {
      const hasApplicableCategory = items.some(
        (item) =>
          (item as any).category &&
          promo.applicableCategories.includes((item as any).category),
      );
      if (!hasApplicableCategory) {
        return {
          eligible: false,
          restricted: true,
          reason: "Requires products from specific categories",
        };
      }
    }

    // Check applicable brands targeting
    if (promo.applicableBrands && promo.applicableBrands.length > 0) {
      const hasApplicableBrand = items.some(
        (item) =>
          (item as any).brand &&
          promo.applicableBrands.includes((item as any).brand),
      );
      if (!hasApplicableBrand) {
        return {
          eligible: false,
          restricted: true,
          reason: "Requires products from specific brands",
        };
      }
    }

    // Check excluded products (if ALL items are excluded, promo doesn't apply)
    if (promo.excludedProducts && promo.excludedProducts.length > 0) {
      const allExcluded = items.every((item) =>
        promo.excludedProducts.includes(item.itemId),
      );
      if (allExcluded) {
        return {
          eligible: false,
          restricted: true,
          reason: "All cart items are excluded from this promotion",
        };
      }
    }

    // Check conditions
    if (!promo.conditions || promo.conditions.length === 0) {
      return { eligible: true, restricted: false };
    }

    // Separate SPECIFIC_PRODUCT conditions from other conditions
    // SPECIFIC_PRODUCT: Cart needs to have ANY of the specified products (variant-aware)
    // Other conditions (MIN_AMOUNT, MIN_QUANTITY, CATEGORY): ALL must be met
    const productConditions = promo.conditions.filter(
      (c: any) => c.type === "SPECIFIC_PRODUCT",
    );
    const otherConditions = promo.conditions.filter(
      (c: any) => c.type !== "SPECIFIC_PRODUCT",
    );

    // Collect all product IDs for MIN_QUANTITY calculation
    const specificProductIds: string[] = [];
    productConditions.forEach((condition: any) => {
      if (condition.value) specificProductIds.push(condition.value);
      if (condition.productIds)
        specificProductIds.push(...condition.productIds);
    });

    // Check SPECIFIC_PRODUCT conditions: ANY product from any condition must match
    if (productConditions.length > 0) {
      const hasAnyMatchingProduct = productConditions.some((condition: any) => {
        if (
          condition.variantMode === "SPECIFIC_VARIANTS" &&
          condition.variantIds
        ) {
          // Must match both product AND specific variant
          return items.some(
            (item) =>
              item.itemId === condition.value &&
              item.variantId &&
              condition.variantIds.includes(item.variantId),
          );
        }
        // ALL_VARIANTS or no restriction - just check product ID
        return items.some((item) => item.itemId === condition.value);
      });

      if (!hasAnyMatchingProduct) {
        return {
          eligible: false,
          restricted: true,
          reason: "Requires specific products not in your cart",
        };
      }
    }

    // Check other conditions (MIN_AMOUNT, MIN_QUANTITY, CATEGORY) - ALL must be met
    const otherConditionsMet = otherConditions.every((condition: any) => {
      switch (condition.type) {
        case "MIN_AMOUNT":
          return total >= Number(condition.value);
        case "MIN_QUANTITY":
          // Count only items that match specific product+variant conditions
          let eligibleQty = 0;

          if (productConditions.length > 0) {
            // Filter items by product AND variant (when specified)
            const eligibleItems = items.filter((item) => {
              return productConditions.some((pc: any) => {
                if (item.itemId !== pc.value) return false;

                if (pc.variantMode === "SPECIFIC_VARIANTS" && pc.variantIds) {
                  return (
                    item.variantId && pc.variantIds.includes(item.variantId)
                  );
                }
                return true; // ALL_VARIANTS or no variant restriction
              });
            });
            eligibleQty = eligibleItems.reduce(
              (sum, item) => sum + item.quantity,
              0,
            );
          } else {
            // No specific products - count all items
            eligibleQty = items.reduce((sum, item) => sum + item.quantity, 0);
          }

          return eligibleQty >= Number(condition.value);
        case "CATEGORY":
          return items.some(
            (item) =>
              (item as any).category === condition.value ||
              promo.applicableCategories?.includes((item as any).category),
          );
        case "CUSTOMER_TAG":
          console.log("CUSTOMER_TAG condition - validated server-side");
          return true;
        default:
          return true;
      }
    });

    return { eligible: otherConditionsMet, restricted: false };
  };

  // Calculate progress towards promotion conditions
  const calculateProgress = (
    promo: any,
    total: number,
    items: BagItem[],
  ): { progress: number; remaining: number } => {
    // Get SPECIFIC_PRODUCT conditions
    const productConditions =
      promo.conditions?.filter((c: any) => c.type === "SPECIFIC_PRODUCT") || [];

    // If no specific products, check MIN_AMOUNT
    if (productConditions.length === 0) {
      const minAmount = promo.conditions?.find(
        (c: any) => c.type === "MIN_AMOUNT",
      )?.value;
      if (!minAmount) return { progress: 100, remaining: 0 };
      const progress = Math.min(Math.round((total / minAmount) * 100), 100);
      return { progress, remaining: Math.max(minAmount - total, 0) };
    }

    // Filter items by product+variant conditions
    const eligibleItems = items.filter((item) => {
      return productConditions.some((pc: any) => {
        if (item.itemId !== pc.value) return false;

        if (pc.variantMode === "SPECIFIC_VARIANTS" && pc.variantIds) {
          return item.variantId && pc.variantIds.includes(item.variantId);
        }
        return true; // ALL_VARIANTS or no variant restriction
      });
    });

    // No eligible items - no progress
    if (eligibleItems.length === 0) {
      const minQty =
        promo.conditions?.find((c: any) => c.type === "MIN_QUANTITY")?.value ||
        1;
      return { progress: 0, remaining: Number(minQty) };
    }

    // Check MIN_QUANTITY for eligible items
    const minQtyCondition = promo.conditions?.find(
      (c: any) => c.type === "MIN_QUANTITY",
    );
    if (minQtyCondition) {
      const requiredQty = Number(minQtyCondition.value);
      const eligibleQty = eligibleItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const progress = Math.min(
        Math.round((eligibleQty / requiredQty) * 100),
        100,
      );
      const remaining = Math.max(requiredQty - eligibleQty, 0);
      return { progress, remaining };
    }

    return { progress: 100, remaining: 0 };
  };

  // Calculate potential savings
  const calculateSavings = (
    promo: any,
    total: number,
    items: BagItem[],
  ): number => {
    const action = promo.actions?.[0];
    if (!action) return 0;

    // PRIORITY 1: Variant-level targeting (most specific)
    if (
      promo.applicableProductVariants &&
      promo.applicableProductVariants.length > 0
    ) {
      const eligibleItems = getEligibleCartItems(
        items,
        promo.applicableProductVariants,
      );
      const eligibleTotal = eligibleItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Apply discount only to eligible items
      return calculateDiscountAmount(action, eligibleTotal, eligibleItems);
    }

    // PRIORITY 2: Product-level targeting from conditions
    // Extract SPECIFIC_PRODUCT conditions with variant info
    const productConditions =
      promo.conditions?.filter((c: any) => c.type === "SPECIFIC_PRODUCT") || [];

    if (productConditions.length > 0) {
      // Filter items that match ANY of the product conditions (with variant awareness)
      const eligibleItems = items.filter((item) => {
        return productConditions.some((condition: any) => {
          if (item.itemId !== condition.value) return false;

          // Check variant restriction if specified
          if (
            condition.variantMode === "SPECIFIC_VARIANTS" &&
            condition.variantIds
          ) {
            return (
              item.variantId && condition.variantIds.includes(item.variantId)
            );
          }
          // ALL_VARIANTS or no restriction - product match is enough
          return true;
        });
      });

      const eligibleTotal = eligibleItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      return calculateDiscountAmount(
        action,
        eligibleTotal,
        eligibleItems,
        promo,
      );
    } else if (
      promo.applicableProducts &&
      promo.applicableProducts.length > 0
    ) {
      // PRIORITY 3: Legacy product-level targeting
      const eligibleItems = items.filter((item) =>
        promo.applicableProducts.includes(item.itemId),
      );

      const eligibleTotal = eligibleItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      return calculateDiscountAmount(
        action,
        eligibleTotal,
        eligibleItems,
        promo,
      );
    } else if (
      (promo.applicableCategories && promo.applicableCategories.length > 0) ||
      (promo.applicableBrands && promo.applicableBrands.length > 0)
    ) {
      // PRIORITY 4: Category or Brand targeting
      const eligibleItems = items.filter((item) => {
        const matchesCategory =
          promo.applicableCategories && promo.applicableCategories.length > 0
            ? promo.applicableCategories.includes((item as any).category)
            : true;
        const matchesBrand =
          promo.applicableBrands && promo.applicableBrands.length > 0
            ? promo.applicableBrands.includes((item as any).brand)
            : true;
        return matchesCategory && matchesBrand;
      });

      const eligibleTotal = eligibleItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      return calculateDiscountAmount(
        action,
        eligibleTotal,
        eligibleItems,
        promo,
      );
    }

    // No specific product/category conditions - apply to entire cart
    let applicableTotal = total;
    let eligibleItems = items;

    // Exclude excluded products from calculation
    if (promo.excludedProducts && promo.excludedProducts.length > 0) {
      eligibleItems = eligibleItems.filter(
        (item) => !promo.excludedProducts.includes(item.itemId),
      );
      applicableTotal = eligibleItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    }

    return calculateDiscountAmount(
      action,
      applicableTotal,
      eligibleItems,
      promo,
    );
  };

  // Helper: Calculate discount amount based on action type
  const calculateDiscountAmount = (
    action: any,
    applicableTotal: number,
    eligibleItems: BagItem[],
    promo?: any,
  ): number => {
    let grossDiscount = 0;
    switch (action.type) {
      case "PERCENTAGE_OFF":
        grossDiscount = (applicableTotal * action.value) / 100;
        if (action.maxDiscount) {
          grossDiscount = Math.min(grossDiscount, action.maxDiscount);
        }
        break;
      case "FIXED_OFF":
        // Apply scaling multiplier if MIN_QUANTITY is present
        const minQtyCondition = promo?.conditions?.find(
          (c: any) => c.type === "MIN_QUANTITY",
        );
        const minQtyValue = minQtyCondition ? Number(minQtyCondition.value) : 0;

        if (minQtyValue > 0) {
          const totalEligibleQty = eligibleItems.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );
          const multiplier = Math.floor(totalEligibleQty / minQtyValue);
          grossDiscount = Math.min(action.value * multiplier, applicableTotal);
        } else {
          grossDiscount = Math.min(action.value, applicableTotal);
        }
        break;
      case "FREE_SHIPPING":
        // Return estimated average shipping cost for display
        return 400; // Average shipping cost saved (not subject to item discount override)
      case "FREE_ITEM":
        // Return the price of the free item if specified
        if (action.freeProductId) {
          const freeItem = eligibleItems.find(
            (item: BagItem) => item.itemId === action.freeProductId,
          );
          if (freeItem) {
            grossDiscount = freeItem.price;
          }
        }
        break;
      case "BOGO":
        // Buy One Get One - calculate the value of the cheapest eligible items
        const flattenedItems: number[] = [];
        eligibleItems.forEach((item) => {
          for (let i = 0; i < item.quantity; i++)
            flattenedItems.push(item.price);
        });

        if (flattenedItems.length >= 2) {
          flattenedItems.sort((a, b) => a - b);
          const freeItemsCount = Math.floor(flattenedItems.length / 2); // 1 free for every pair
          grossDiscount = flattenedItems
            .slice(0, freeItemsCount)
            .reduce((acc, price) => acc + price, 0);
        }
        break;
      default:
        return 0;
    }

    if (action.type === "FREE_SHIPPING") return grossDiscount;

    // To prevent double dipping, we calculate the total base item discounts already granted to these eligible items
    const eligibleItemDiscounts = eligibleItems.reduce(
      (sum, item) => sum + (item.discount || 0),
      0,
    );

    // The promotion only grants the net extra savings value!
    return Math.max(
      0,
      Math.round(grossDiscount) - Math.round(eligibleItemDiscounts),
    );
  };

  // Generate message for promotion
  const getPromoMessage = (promo: any, isEligible: boolean): string => {
    const action = promo.actions?.[0];
    const minAmount = promo.conditions?.find(
      (c: any) => c.type === "MIN_AMOUNT",
    )?.value;

    if (!action) return promo.description;

    switch (action.type) {
      case "PERCENTAGE_OFF":
        const msg = `Get ${action.value}% off`;
        if (minAmount && !isEligible) {
          return `${msg} on orders over Rs. ${minAmount.toLocaleString()}`;
        }
        return isEligible ? `${msg} applied!` : msg;
      case "FIXED_OFF":
        return `Save Rs. ${action.value} on your order`;
      case "FREE_SHIPPING":
        return isEligible ? "Free shipping applied!" : "Get free shipping!";
      case "BOGO":
        return "Buy one, get one free!";
      default:
        return promo.description;
    }
  };

  // Refresh on mount and when cart changes
  useEffect(() => {
    const currentHash = getBagHash();
    const bagChanged = currentHash !== lastBagHash.current;
    lastBagHash.current = currentHash;

    // Clear promotions if combo items added
    if (hasComboItems || bagItems.length === 0) {
      setPromotions([]);
      dispatch(removePromotion());
      return;
    }

    // Refresh on any bag change
    if (bagChanged || promotions.length === 0) {
      fetchPromotions();
    }
  }, [bagItems, hasComboItems, getBagHash, fetchPromotions, dispatch]);

  // Split promotions by eligibility
  const eligiblePromotions = promotions.filter((p) => p.isEligible);
  const nearbyPromotions = promotions.filter(
    (p) => !p.isEligible && !p.isRestricted && (p.progress || 0) >= 50,
  );
  // Promotions that user could qualify for if they had the right items
  const restrictedPromotions = promotions.filter(
    (p) => !p.isEligible && p.isRestricted,
  );

  // Get applied promotions from Redux state
  const appliedPromotionIds = useSelector(
    (state: RootState) => state.bag.promotionIds,
  );
  const totalPromotionDiscount = useSelector(
    (state: RootState) => state.bag.promotionDiscount,
  );
  const reduxAppliedPromotions = useSelector(
    (state: RootState) => state.bag.appliedPromotions,
  );

  // Find currently applied promotion (primary - for backward compat)
  const appliedPromotion =
    promotions.find((p) => p.id === appliedPromotionId) || null;

  // Find all applied promotions
  const appliedPromotionsFromState: ActivePromotion[] = promotions.filter((p) =>
    appliedPromotionIds.includes(p.id),
  );

  return {
    activePromotions: promotions,
    eligiblePromotions,
    nearbyPromotions,
    restrictedPromotions,
    isLoading,
    hasComboItems,
    isBlocked,
    appliedPromotion,
    appliedPromotions: appliedPromotionsFromState,
    totalPromotionDiscount,
    refreshPromotions: fetchPromotions,
  };
};

export default usePromotions;
