"use client";
import Spinner from "@/components/Spinner";
import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import CatalogPagination from "@/components/CatalogPagination";
import { catalogQuery, catalogSearchParams } from "@/utils/catalogQuery";
import type { CatalogPageData } from "@/actions/catalogPage";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/interfaces/Product";
import SortDropdown from "@/components/SortDropdown";
import FilterPanel from "@/components/FilterPanel";
import PopUpFilterPanel from "@/components/PopUpFilterPanel";
import { useProductListing } from "@/hooks/useProductListing";
import ProductGrid from "@/components/ProductGrid";
export default function Products({
  items,
  apiEndpoint = "/web/products",
  defaultCategory,
  initialData,
  initialKey,
}: {
  items: Product[];
  apiEndpoint?: string;
  defaultCategory?: string;
  initialData?: CatalogPageData;
  initialKey?: string;
}) {
  const listing = useProductListing({
    apiEndpoint,
    defaultSize: 12,
    defaultCategory,
    initialData,
    initialKey,
  });
  const { products, loading, total, page, filters } = listing;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = catalogQuery(
    catalogSearchParams(searchParams),
    defaultCategory,
  );
  const [showFilter, setShowFilter] = useState(false);
  const filterProps = {
    selectedBrands: filters.brands,
    selectedCategories: filters.categories,
    selectedSizes: filters.sizes,
    selectedOccasions: filters.occasion,
    selectedStyles: filters.style,
    inStock: filters.inStock,
    onBrandToggle: listing.toggleBrand,
    onCategoryToggle: listing.toggleCategory,
    onSizeToggle: listing.toggleSize,
    onOccasionToggle: listing.toggleOccasion,
    onStyleToggle: listing.toggleStyle,
    onInStockChange: listing.setInStock,
    onReset: listing.resetFilters,
    showCategories: !defaultCategory,
  };
  const chips = [
    ...filters.brands.map((value) => ({
      value,
      clear: () => listing.toggleBrand(value),
    })),
    ...filters.categories
      .filter((v) => v !== defaultCategory?.toLowerCase())
      .map((value) => ({ value, clear: () => listing.toggleCategory(value) })),
    ...filters.sizes.map((value) => ({
      value: `Size ${value}`,
      clear: () => listing.toggleSize(value),
    })),
    ...filters.occasion.map((value) => ({
      value,
      clear: () => listing.toggleOccasion(value),
    })),
    ...filters.style.map((value) => ({
      value,
      clear: () => listing.toggleStyle(value),
    })),
  ];
  const hasQueryFilters =
    chips.length > 0 ||
    filters.inStock ||
    !!filters.gender ||
    page > 1 ||
    filters.sort !== "NO SELCT";
  const display =
    loading && !hasQueryFilters && products.length === 0 ? items : products;
  return (
    <section className="commerce-catalog" aria-label="Shop products">
      <div className="commerce-catalog-toolbar">
        <p role="status" aria-live="polite">
          {loading ? <Spinner /> : `${total} products`}
        </p>
        <div>
          <button
            type="button"
            className="commerce-filter-trigger"
            onClick={() => setShowFilter(true)}
          >
            <SlidersHorizontal size={17} /> Filters
            {chips.length > 0 && <span>{chips.length}</span>}
          </button>
          <SortDropdown value={filters.sort} onChange={listing.setSort} />
        </div>
      </div>
      {chips.length > 0 && (
        <div className="commerce-filter-chips">
          {chips.map((chip, i) => (
            <button
              type="button"
              key={`${chip.value}-${i}`}
              onClick={chip.clear}
              aria-label={`Remove ${chip.value} filter`}
            >
              {chip.value}
              <X size={13} />
            </button>
          ))}
          <button type="button" onClick={listing.resetFilters}>
            Clear all
          </button>
        </div>
      )}
      <div className="commerce-catalog-body">
        <aside className="commerce-filter-sidebar" aria-label="Product filters">
          <FilterPanel {...filterProps} />
        </aside>
        <div className="commerce-catalog-results">
          {listing.error ? (
            <div className="commerce-empty" role="alert">
              <h2>We couldn’t load the collection.</h2>
              <p>Please try again in a moment.</p>
              <button
                type="button"
                className="commerce-primary"
                onClick={listing.retry}
              >
                Try again
              </button>
            </div>
          ) : (
            <ProductGrid
              products={display}
              loading={loading && display.length === 0}
            />
          )}
          {!loading && (
            <CatalogPagination path={pathname} query={query} total={total} />
          )}
        </div>
      </div>
      {showFilter && (
        <PopUpFilterPanel
          {...filterProps}
          onClose={() => setShowFilter(false)}
        />
      )}
    </section>
  );
}
