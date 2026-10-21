/**
 * Currency and formatting utilities for Neverbe
 * Consolidates duplicate formatting patterns across the codebase
 */

/**
 * Format a number as Sri Lankan Rupees
 * Replaces pattern: `Rs. ${value.toLocaleString()}`
 */
export function formatCurrency(value: number): string {
  return `Rs. ${value.toLocaleString()}`;
}

/**
 * Format a negative discount amount
 * Replaces pattern: `- Rs. ${value.toLocaleString()}`
 */
export function formatDiscount(value: number): string {
  return `- Rs. ${value.toLocaleString()}`;
}

/** Capitalize variant words for display, preserving acronyms and stored catalog values. */
export function formatVariantName(value?: string | null): string {
  return (value || "").replace(
    /(^|[\s/()&-]+)([^\s/()&-])/g,
    (_match, separator: string, initial: string) =>
      separator + initial.toLocaleUpperCase("en-LK"),
  );
}

/**
 * Sort products by price
 * Consolidates duplicate sorting logic from Products, CollectionProducts, DealsProducts
 */
export function sortProductsByPrice<T extends { sellingPrice: number }>(
  products: T[],
  direction: "LOW TO HIGH" | "HIGH TO LOW" | string
): T[] {
  if (!products || !Array.isArray(products)) return [];

  const sorted = [...products];

  if (direction === "LOW TO HIGH") {
    return sorted.sort((a, b) => a.sellingPrice - b.sellingPrice);
  }

  if (direction === "HIGH TO LOW") {
    return sorted.sort((a, b) => b.sellingPrice - a.sellingPrice);
  }

  return sorted;
}

/**
 * Get WhatsApp URL with optional message
 * Consolidates duplicate WhatsApp link generation
 */
export function getWhatsAppUrl(message?: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) return "#";

  if (message) {
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  return `https://wa.me/${number}`;
}
