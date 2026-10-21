"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Product } from "@/interfaces/Product";
import { sortProductsByPrice } from "@/utils/formatting";
import { catalogQuery, catalogSearchParams } from "@/utils/catalogQuery";
import type { CatalogPageData } from "@/actions/catalogPage";
import axiosInstance from "@/actions/axiosInstance";

type SortOption = "NO SELCT" | "LOW TO HIGH" | "HIGH TO LOW" | "NEW ARRIVALS";

interface UseProductListingOptions {
  apiEndpoint: string;
  defaultSize?: number;
  defaultCategory?: string;
  initialData?: CatalogPageData;
  initialKey?: string;
}

export const useProductListing = ({
  apiEndpoint,
  defaultCategory,
  initialData,
  initialKey,
}: UseProductListingOptions) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- 1. Read State from URL ---
  const query = catalogQuery(
    catalogSearchParams(searchParams),
    defaultCategory,
  );
  const { page, size } = query;
  const inStock = searchParams.get("inStock") === "true";
  const selectedGender = searchParams.get("gender") || "";

  // Array params are usually comma-separated in URL
  const selectedBrands = useMemo(
    () => searchParams.get("brand")?.split(",").filter(Boolean) || [],
    [searchParams],
  );
  const selectedCategories = useMemo(
    () =>
      defaultCategory
        ? [defaultCategory.toLowerCase()]
        : searchParams.get("category")?.split(",").filter(Boolean) || [],
    [searchParams, defaultCategory],
  );
  const selectedSizes = useMemo(
    () => searchParams.get("sizes")?.split(",").filter(Boolean) || [],
    [searchParams],
  );

  const selectedOccasions = useMemo(
    () => searchParams.get("occasion")?.split(",").filter(Boolean) || [],
    [searchParams],
  );

  const selectedStyles = useMemo(
    () => searchParams.get("style")?.split(",").filter(Boolean) || [],
    [searchParams],
  );

  // Parse Sort
  const sortParam = searchParams.get("sort");
  let selectedSort: SortOption = "NO SELCT";
  if (sortParam === "low") selectedSort = "LOW TO HIGH";
  else if (sortParam === "high") selectedSort = "HIGH TO LOW";
  else if (sortParam === "new") selectedSort = "NEW ARRIVALS";

  // --- 2. Local Data State ---
  const [products, setProducts] = useState<Product[]>(
    initialData?.products || [],
  );
  const [total, setTotal] = useState(initialData?.total || 0);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(initialData?.error || false);
  const [attempt, setAttempt] = useState(0);

  // --- 3. Data Fetching ---
  const requestKey = query.key;
  useEffect(() => {
    // Server-rendered products already match this URL; avoid a duplicate hydration request.
    if (attempt === 0 && initialData && initialKey === requestKey) return;
    const controller = new AbortController();
    const fetchProducts = async () => {
      setLoading(true);
      setError(false);
      try {
        const params = new URLSearchParams(requestKey);

        const endpoint = apiEndpoint.includes("/api/v1")
          ? apiEndpoint.split("/api/v1")[1]
          : apiEndpoint;

        const res = await axiosInstance.get(`${endpoint}?${params}`, {
          signal: controller.signal,
        });
        const data = res.data;

        // Client-side Sort (if API sort isn't sufficient or for consistency)
        // Note: Ideally API handles sort. But current legacy behavior does it client-side?
        // Checking current implementation: it fetches then sorts.
        // We will maintain that for now, but API *should* do it.
        const sorted = sortProductsByPrice(
          (data.dataList || []) as Product[],
          selectedSort,
        );

        if (controller.signal.aborted) return;
        setProducts(sorted);
        setTotal(data.total || 0);
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(true);
        console.error("Failed to fetch products:", error);
        setProducts([]);
        setTotal(0);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [attempt, apiEndpoint, requestKey, initialData, initialKey, selectedSort]);

  // --- 4. URL Updaters (Actions) ---
  const updateURL = useCallback(
    (newParams: URLSearchParams) => {
      // Create fresh params to ensure clean state or merge?
      // Since we build newParams based on logic below, we just trigger push.
      const queryString = newParams.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      // scroll: false to prevent jumping to top on every filter click?
      // User implies "Optimized... pagination". Usually filter changes reset scroll.
      // Pagination changes DEFINITELY scroll to top.
      router.push(url, { scroll: false });
    },
    [pathname, router],
  );

  const createQueryString = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(overrides).forEach(([key, value]) => {
        if (value === null) params.delete(key);
        else params.set(key, value);
      });
      return params;
    },
    [searchParams],
  );

  // -- Pagination --
  const setPage = (newPage: number) => {
    const params = createQueryString({ page: newPage.toString() });
    router.push(`${pathname}?${params}`, { scroll: true }); // Scroll to top on page change
  };

  // -- Filters --
  const toggleBrand = (brand: string) => {
    // Logic: Single Selection for brands? Old code had logic: "includes ? [] : [brand]" (Single Select Toggle)
    // Actually current legacy `useFilterToggles` does single select for Brands/Categories, Multi for Sizes?
    // Let's replicate legacy behavior: Single Select for Brand.
    const lower = brand.toLowerCase();
    const current = selectedBrands[0]?.toLowerCase();
    const newValue = current === lower ? null : lower;

    // Reset page to 1 on filter change
    const params = createQueryString({ brand: newValue, page: "1" });
    updateURL(params);
  };

  const toggleCategory = (category: string) => {
    // Single Select Logic
    const lower = category.toLowerCase();
    const current = selectedCategories[0]?.toLowerCase();
    const newValue = current === lower ? null : lower;

    const params = createQueryString({ category: newValue, page: "1" });
    updateURL(params);
  };

  const toggleSize = (size: string) => {
    // Multi Select Logic
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];

    const params = createQueryString({
      sizes: newSizes.length > 0 ? newSizes.join(",") : null,
      page: "1",
    });
    updateURL(params);
  };

  const toggleOccasion = (val: string) => {
    const lower = val.toLowerCase();
    const newVals = selectedOccasions.includes(lower)
      ? selectedOccasions.filter((s) => s !== lower)
      : [...selectedOccasions, lower];

    const params = createQueryString({
      occasion: newVals.length > 0 ? newVals.join(",") : null,
      page: "1",
    });
    updateURL(params);
  };

  const toggleStyle = (val: string) => {
    const lower = val.toLowerCase();
    const newVals = selectedStyles.includes(lower)
      ? selectedStyles.filter((s) => s !== lower)
      : [...selectedStyles, lower];

    const params = createQueryString({
      style: newVals.length > 0 ? newVals.join(",") : null,
      page: "1",
    });
    updateURL(params);
  };

  const setInStock = (val: boolean) => {
    const params = createQueryString({
      inStock: val ? "true" : null,
      page: "1",
    });
    updateURL(params);
  };

  const setSelectedSort = (val: string) => {
    // Map UI value to param
    let paramVal: string | null = null;
    if (val === "LOW TO HIGH") paramVal = "low";
    else if (val === "HIGH TO LOW") paramVal = "high";
    else if (val === "NEW ARRIVALS") paramVal = "new";

    const params = createQueryString({ sort: paramVal, page: "1" });
    updateURL(params);
  };

  const resetFilters = () => {
    router.push(pathname);
  };

  return {
    // Data
    products,
    total,
    loading,
    error,
    retry: () => setAttempt((value) => value + 1),

    // State
    page,
    size,
    totalPages: Math.ceil(total / size),
    filters: {
      brands: selectedBrands,
      categories: selectedCategories,
      sizes: selectedSizes,
      gender: selectedGender,
      occasion: selectedOccasions,
      style: selectedStyles,
      inStock,
      sort: selectedSort,
    },

    // Actions
    setPage,
    toggleBrand,
    toggleCategory,
    toggleSize,
    toggleOccasion,
    toggleStyle,
    setInStock,
    setSort: setSelectedSort,
    resetFilters,
  };
};
