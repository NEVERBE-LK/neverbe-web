import { Product } from "@/interfaces/Product";

interface Promotion {
  type: "COMBO" | "BOGO" | "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  actions?: Array<{ value?: number }>;
}

/**
 * Calculate the final price of a product after applying discounts and promotions
 * Consolidates duplicate price calculation logic from ItemCard, SearchResultCard, BagItemCard
 */
export function hasConditions(promotion?: Promotion | null): boolean {
  if (!promotion) return false;
  // If promotion has conditions array and it's not empty, it has conditions.
  // We're adding an explicit safe-check since Promotion's interface might not define it
  const conditions = (promotion as any).conditions;
  return Array.isArray(conditions) && conditions.length > 0;
}

export function calculateFinalPrice(
  product: Product,
  promotion?: Promotion | null,
  isEligible: boolean = false
): number {
  let finalPrice = product.sellingPrice;

  // PRIORITY 1: Promotion (if exists, AND it's either an explicitly eligible cart or has no cart conditions)
  if (promotion?.actions?.[0]?.value && (isEligible || !hasConditions(promotion))) {
    const discountValue = promotion.actions[0].value;
    if (promotion.type === "PERCENTAGE") {
      finalPrice =
        Math.round((product.sellingPrice * (100 - discountValue)) / 100 / 10) *
        10;
    } else if (promotion.type === "FIXED" && isEligible) {
      // FIXED promotions should ONLY apply to finalPrice if explicitly requested via cart eligibility,
      // because FIXED amounts apply to the entire cart, not purely one item, and drawing them down here
      // on individual cards creates massive visual inaccuracies (e.g., 7500 - 6500 = 1000)
      finalPrice = Math.max(0, product.sellingPrice - discountValue);
    }
    return finalPrice;
  }

  // PRIORITY 2: Item-level discount (only if no promotion)
  if (product.discount > 0) {
    finalPrice =
      Math.round(
        (product.sellingPrice -
          (product.sellingPrice * product.discount) / 100) /
          10
      ) * 10;
  }

  return finalPrice;
}

/**
 * Check if a product has any discount (product-level, promotion, or market-price difference)
 */
export function hasDiscount(
  product: Product,
  promotion?: Promotion | null,
  isEligible: boolean = false
): boolean {
  const promoValid = !!promotion && (isEligible || !hasConditions(promotion));
  return (
    product.discount > 0 ||
    promoValid ||
    (product.marketPrice > 0 && product.marketPrice > product.sellingPrice)
  );
}

/**
 * Get the original price to show with strikethrough.
 * For items with an item-level discount, the original price is our real selling price.
 * For items without an item discount, show market price if higher than selling price.
 */
export function getOriginalPrice(product: Product): number {
  if ((product.discount || 0) > 0) {
    return product.sellingPrice;
  }
  return (product.marketPrice || 0) > product.sellingPrice
    ? product.marketPrice
    : product.sellingPrice;
}

/**
 * Calculate savings amount
 */
export function calculateSavings(
  product: Product,
  promotion?: Promotion | null,
  isEligible: boolean = false
): number {
  const originalPrice = getOriginalPrice(product);
  const finalPrice = calculateFinalPrice(product, promotion, isEligible);
  return Math.max(0, originalPrice - finalPrice);
}

/**
 * Calculate savings percentage
 */
export function calculateSavingsPercent(
  product: Product,
  promotion?: Promotion | null,
  isEligible: boolean = false
): number {
  const originalPrice = getOriginalPrice(product);
  const savings = calculateSavings(product, promotion, isEligible);
  return Math.round((savings / originalPrice) * 100);
}

export type DiscountType = "item" | "promotion" | null;

/**
 * Determine which discount type applies to a product:
 * - "promotion": active promotion reduces the price (rendered in yellow)
 * - "item": item-level discount reduces the price (rendered in red)
 * - null: no discount applied
 */
export function getDiscountType(
  product: Product,
  promotion?: Promotion | null,
  isEligible: boolean = false
): DiscountType {
  const hasPromo = Boolean(
    promotion?.actions?.[0]?.value && (isEligible || !hasConditions(promotion))
  );
  if (hasPromo) {
    const promoPrice = calculateFinalPrice(product, promotion, isEligible);
    if (promoPrice < product.sellingPrice) {
      return "promotion";
    }
  }

  if ((product.discount || 0) > 0) {
    return "item";
  }

  return null;
}

/**
 * Returns the CSS color class corresponding to the discount type:
 * - "item" -> "text-error" (red)
 * - "promotion" -> "text-warning" (yellow)
 * - null -> ""
 */
export function getDiscountColorClass(discountType: DiscountType): string {
  if (discountType === "item") return "text-error";
  if (discountType === "promotion") return "text-warning";
  return "";
}


