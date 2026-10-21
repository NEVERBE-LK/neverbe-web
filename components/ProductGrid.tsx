"use client";
import React from "react";
import ItemCard from "@/components/ItemCard";
import EmptyState from "@/components/EmptyState";
import ComponentLoader from "@/components/ComponentLoader";
import { Product } from "@/interfaces/Product";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  emptyHeading?: string;
  emptySubHeading?: string;
}

const ProductGrid = ({
  products,
  loading,
  emptyHeading = "No Products Found",
  emptySubHeading,
}: ProductGridProps) => {
  if (loading) {
    return (
      <div className="h-[60vh] relative">
        <ComponentLoader />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="pt-20">
        <EmptyState heading={emptyHeading} subHeading={emptySubHeading} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-4 lg:gap-6 animate-fade-in">
      {products.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default ProductGrid;
