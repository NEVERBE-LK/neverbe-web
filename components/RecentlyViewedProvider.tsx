"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Product } from "@/interfaces/Product";

interface RecentlyViewedContextType {
  recentlyViewed: Product[];
  addToRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | null>(
  null
);

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error(
      "useRecentlyViewed must be used within a RecentlyViewedProvider"
    );
  }
  return context;
};

export const RecentlyViewedProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("nep_recently_viewed");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load recently viewed items", error);
      return [];
    }
  });

  const addToRecentlyViewed = useCallback((product: Product) => {
    setRecentlyViewed((prev) => {
      // Remove if existing, regardless of position
      const filtered = prev.filter((p) => p.id !== product.id);
      // Add to front
      const updated = [product, ...filtered].slice(0, 10); // Keep max 10

      // Persist
      try {
        localStorage.setItem("nep_recently_viewed", JSON.stringify(updated));
      } catch (e) {
        console.warn("Storage quota exceeded", e);
      }

      return updated;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    localStorage.removeItem("nep_recently_viewed");
  }, []);

  const contextValue = React.useMemo(
    () => ({ recentlyViewed, addToRecentlyViewed, clearRecentlyViewed }),
    [recentlyViewed, addToRecentlyViewed, clearRecentlyViewed],
  );

  return (
    <RecentlyViewedContext.Provider value={contextValue}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export default RecentlyViewedProvider;
