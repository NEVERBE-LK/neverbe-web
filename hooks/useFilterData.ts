"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/actions/axiosInstance";

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterData {
  brands: FilterOption[];
  categories: FilterOption[];
  sizes: FilterOption[];
  loading: boolean;
}

const apparelOrder: Record<string, number> = {
  "3XS": 1,
  "2XS": 2,
  "XXS": 2,
  "XS": 3,
  "S": 4,
  "M": 5,
  "L": 6,
  "XL": 7,
  "2XL": 8,
  "XXL": 8,
  "3XL": 9,
  "XXXL": 9,
  "4XL": 10,
  "5XL": 11,
};

/**
 * Sorts apparel and footwear sizes in standard retail order:
 * Standard clothing sizes first (XS -> 5XL), then numeric shoe sizes in ascending numeric order.
 */
export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const aClean = a.trim().toUpperCase();
    const bClean = b.trim().toUpperCase();

    const aOrder = apparelOrder[aClean];
    const bOrder = apparelOrder[bClean];

    if (aOrder !== undefined && bOrder !== undefined) {
      return aOrder - bOrder;
    }
    if (aOrder !== undefined) return -1;
    if (bOrder !== undefined) return 1;

    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }

    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  });
}

/**
 * Hook to dynamically fetch filter dropdown data (brands, categories, sizes)
 * Centralizes dynamic retrieval from backend APIs (/web/brands/dropdown, /web/sizes/dropdown, /web/categories/dropdown)
 */
// Module-level cache and inflight request deduplication
let filterCache: {
  brands: FilterOption[];
  categories: FilterOption[];
  sizes: FilterOption[];
} = {
  brands: [],
  categories: [],
  sizes: [],
};
let inflightPromise: Promise<void> | null = null;

export const useFilterData = (fetchCategories: boolean = true): FilterData => {
  const hasCachedData = filterCache.brands.length > 0 && filterCache.sizes.length > 0;
  const [brands, setBrands] = useState<FilterOption[]>(filterCache.brands);
  const [categories, setCategories] = useState<FilterOption[]>(filterCache.categories);
  const [sizes, setSizes] = useState<FilterOption[]>(filterCache.sizes);
  const [loading, setLoading] = useState(!hasCachedData);

  useEffect(() => {
    let cancelled = false;

    if (hasCachedData && (!fetchCategories || filterCache.categories.length > 0)) {
      setBrands(filterCache.brands);
      setSizes(filterCache.sizes);
      setCategories(filterCache.categories);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      if (!inflightPromise) {
        inflightPromise = (async () => {
          try {
            const brandsReq = axiosInstance.get("/web/brands/dropdown").catch(() => null);
            const sizesReq = axiosInstance.get("/web/sizes/dropdown").catch(() => null);
            const categoriesReq = fetchCategories
              ? axiosInstance.get("/web/categories/dropdown").catch(() => null)
              : Promise.resolve(null);

            const [brandsRes, sizesRes, categoriesRes] = await Promise.all([
              brandsReq,
              sizesReq,
              categoriesReq,
            ]);

            if (brandsRes) {
              const raw = brandsRes.data?.data || brandsRes.data || [];
              const list: FilterOption[] = Array.isArray(raw)
                ? raw
                    .map((b: any) =>
                      typeof b === "string"
                        ? { id: b, label: b }
                        : { id: b.id || b.label || b.name, label: b.label || b.name || b.id }
                    )
                    .filter((b) => Boolean(b.label))
                : [];
              filterCache.brands = list;
            }

            if (sizesRes) {
              const raw = sizesRes.data?.data || sizesRes.data || [];
              const list: FilterOption[] = Array.isArray(raw)
                ? raw
                    .map((s: any) =>
                      typeof s === "string"
                        ? { id: s, label: s }
                        : { id: s.id || s.label || s.name, label: s.label || s.name || s.id }
                    )
                    .filter((s) => Boolean(s.label))
                : [];

              const sortedLabels = sortSizes(list.map((s) => s.label));
              const sortedOptions = sortedLabels
                .map((label) => list.find((s) => s.label === label) || { id: label, label })
                .filter((v, i, a) => a.findIndex((t) => t.label === v.label) === i);

              filterCache.sizes = sortedOptions;
            }

            if (categoriesRes) {
              const raw = categoriesRes.data?.data || categoriesRes.data || [];
              const list: FilterOption[] = Array.isArray(raw)
                ? raw
                    .map((c: any) =>
                      typeof c === "string"
                        ? { id: c, label: c }
                        : { id: c.id || c.label || c.name, label: c.label || c.name || c.id }
                    )
                    .filter((c) => Boolean(c.label))
                : [];
              filterCache.categories = list;
            }
          } catch (e) {
            console.error("Failed to fetch filter data:", e);
          } finally {
            inflightPromise = null;
          }
        })();
      }

      await inflightPromise;
      if (!cancelled) {
        setBrands(filterCache.brands);
        setSizes(filterCache.sizes);
        setCategories(filterCache.categories);
        setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [fetchCategories, hasCachedData]);

  return { brands, categories, sizes, loading };
};

export default useFilterData;
