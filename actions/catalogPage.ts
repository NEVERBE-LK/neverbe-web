import "server-only";
import { cache } from "react";
import axiosInstance from "./axiosInstance";
import type { Product } from "@/interfaces/Product";
import { sortProductsByPrice } from "@/utils/formatting";

export interface CatalogPageData {
  products: Product[];
  total: number;
  error: boolean;
}

/** Request-local deduplication only: stock and customer data aren't shared between users. */
export const getCatalogPage = cache(
  async (endpoint: string, queryKey: string): Promise<CatalogPageData> => {
    try {
      const response = await axiosInstance.get(`${endpoint}?${queryKey}`);
      const params = new URLSearchParams(queryKey);
      const sort = params.get("sort");
      const products = sortProductsByPrice<Product>(
        response.data.dataList || [],
        sort === "low"
          ? "LOW TO HIGH"
          : sort === "high"
            ? "HIGH TO LOW"
            : sort === "new"
              ? "NEW ARRIVALS"
              : "NO SELCT",
      );
      return {
        products,
        total: Number(response.data.total) || 0,
        error: false,
      };
    } catch (error) {
      console.error("Failed to render catalog:", error);
      return { products: [], total: 0, error: true };
    }
  },
);
