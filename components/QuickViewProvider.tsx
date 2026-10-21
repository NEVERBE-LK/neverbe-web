"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Product } from "@/interfaces/Product";
import dynamic from "next/dynamic";
const QuickViewModal = dynamic(() => import("@/components/QuickViewModal"), {
  ssr: false,
});
import { useRecentlyViewed } from "@/components/RecentlyViewedProvider";

interface QuickViewContextType {
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextType | null>(null);

export const useQuickView = () => {
  const context = useContext(QuickViewContext);
  if (!context) {
    throw new Error("useQuickView must be used within a QuickViewProvider");
  }
  return context;
};

export const QuickViewProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const { addToRecentlyViewed } = useRecentlyViewed();

  const openQuickView = useCallback(
    (product: Product) => {
      setProduct(product);
      setIsOpen(true);
      addToRecentlyViewed(product);
    },
    [addToRecentlyViewed],
  );

  const closeQuickView = useCallback(() => {
    setIsOpen(false);
    // Retain the product while the dialog exits; the next open replaces it.
  }, []);

  const contextValue = React.useMemo(
    () => ({ openQuickView, closeQuickView }),
    [openQuickView, closeQuickView],
  );

  return (
    <QuickViewContext.Provider value={contextValue}>
      {children}
      {product && (
        <QuickViewModal
          isOpen={isOpen}
          onClose={closeQuickView}
          product={product}
        />
      )}
    </QuickViewContext.Provider>
  );
};

export default QuickViewProvider;
