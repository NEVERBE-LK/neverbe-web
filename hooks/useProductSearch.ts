import { useState, useCallback, useMemo, useEffect } from "react";

import { Product } from "@/interfaces/Product";
import { ProductVariant } from "@/interfaces/ProductVariant";
import axiosInstance from "@/actions/axiosInstance";

interface UseProductSearchOptions {
  indexName?: string;
  hitsPerPage?: number;
  minQueryLength?: number;
  debounceMs?: number;
  isDynamic?: boolean; // New option
}

interface UseProductSearchReturn {
  query: string;
  results: Product[];
  isSearching: boolean;
  showResults: boolean;
  recommendations: Product[];
  search: (query: string) => void;
  executeSearch: (query: string) => Promise<void>; // New function
  fetchRecommendations: () => Promise<void>;
  clearSearch: () => void;
}

/**
 * Consolidated product search hook
 * Replaces duplicate search logic in Header.tsx and Menu.tsx
 */
export function useProductSearch(
  options: UseProductSearchOptions = {},
): UseProductSearchReturn {
  const {
    indexName = "products_index",
    hitsPerPage = 12,
    minQueryLength = 3,
    debounceMs = 500,
    isDynamic = false, // Default to FALSE to remove keystroke dynamic search
  } = options;

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  // Search Client Removed
  // 1. Manual search function
  const executeSearch = useCallback(async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length < minQueryLength) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axiosInstance.get("/web/products/search", {
        params: {
          q: trimmedQuery,
          hitsPerPage,
        }
      });

      const hits = response.data.hits || [];
      const filteredResults = hits.filter(
        (item: any) =>
          !item.variants?.every(
            (v: ProductVariant) => v.isDeleted === true || v.status === false,
          ),
      );

      setResults(filteredResults);
      setShowResults(true);
    } catch (error) {
      console.error("[useProductSearch] Search failed:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [indexName, hitsPerPage, minQueryLength]);

  // 2. Debounce Effect: Updates debouncedQuery after user stops typing
  useEffect(() => {
    if (query.trim().length === 0) {
      setDebouncedQuery("");
      setResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }

    if (!isDynamic) return; // Skip dynamic trigger if not enabled

    // Set searching state immediately for UI feedback
    if (query.trim().length >= minQueryLength) {
      setIsSearching(true);
    }

    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [query, minQueryLength, debounceMs, isDynamic]);

  // 3. Search Effect: Performs actual search call when debouncedQuery changes (DYNAMIC MODE)
  useEffect(() => {
    if (isDynamic && debouncedQuery) {
      executeSearch(debouncedQuery);
    }
  }, [debouncedQuery, isDynamic, executeSearch]);

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setResults([]);
    setShowResults(false);
  }, []);

  const fetchRecommendations = useCallback(async () => {
    try {
      // Fetch from Firestore-backed API
      const response = await axiosInstance.get("/web/products", {
        params: { size: 6 }
      });
      setRecommendations(response.data.dataList || []);
    } catch (error) {
      console.error("[useProductSearch] Failed to fetch recommendations:", error);
    }
  }, []);

  return {
    query,
    results,
    isSearching,
    showResults,
    search,
    executeSearch,
    fetchRecommendations,
    clearSearch,
    recommendations,
  };
}

export default useProductSearch;
