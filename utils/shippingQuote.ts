export type ShippingQuote =
  | { key: string; status: "loading" | "error" }
  | { key: string; status: "ready"; cost: number };

/** An absent/invalid quote is never a free-shipping offer. */
export function parseShippingCost(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

export function currentShippingCost(quote: ShippingQuote, cartKey: string) {
  return quote.key === cartKey && quote.status === "ready"
    ? parseShippingCost(quote.cost)
    : null;
}
