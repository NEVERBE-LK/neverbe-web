"use client";

import { useMemo } from "react";
import Spinner from "@/components/Spinner";
import { useFilterData, sortSizes } from "@/hooks/useFilterData";
import { AVAILABLE_SIZES, OCCASIONS, STYLES } from "@/constants/filters";
import { ChevronDown, RotateCcw } from "lucide-react";

export interface FilterPanelProps {
  selectedBrands: string[];
  selectedCategories: string[];
  selectedSizes: string[];
  selectedOccasions: string[];
  selectedStyles: string[];
  inStock: boolean;
  onBrandToggle: (value: string) => void;
  onCategoryToggle: (value: string) => void;
  onSizeToggle: (value: string) => void;
  onOccasionToggle: (value: string) => void;
  onStyleToggle: (value: string) => void;
  onInStockChange: (value: boolean) => void;
  onReset: () => void;
  showCategories?: boolean;
  title?: string;
  sortValue?: string;
  onSortChange?: (value: string) => void;
  availableSizes?: string[];
}

function FilterGroup({
  title,
  values,
  selected,
  onToggle,
  open = false,
}: {
  title: string;
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
  open?: boolean;
}) {
  return (
    <details className="commerce-filter-group" open={open}>
      <summary>
        {title}
        {selected.length > 0 && <span>{selected.length}</span>}
        <ChevronDown size={16} />
      </summary>
      <div className="commerce-filter-options">
        {values.map((value) => (
          <label key={value}>
            <input
              type="checkbox"
              checked={selected.some(
                (item) => item.toLowerCase() === value.toLowerCase(),
              )}
              onChange={() => onToggle(value)}
            />
            <span>{value}</span>
          </label>
        ))}
        {!values.length && (
          <p className="commerce-muted">No options available.</p>
        )}
      </div>
    </details>
  );
}

export default function FilterPanel(p: FilterPanelProps) {
  const { brands, categories, sizes: dynamicSizes, loading } = useFilterData(
    p.showCategories !== false,
  );

  const displaySizes = useMemo(() => {
    // 1. Explicitly provided sizes from parent (e.g., category-specific catalog)
    if (p.availableSizes && p.availableSizes.length > 0) {
      return sortSizes(
        Array.from(new Set([...p.availableSizes, ...p.selectedSizes])),
      );
    }

    // 2. Dynamically fetched sizes from /web/sizes/dropdown
    const fetched = dynamicSizes.map((s) => s.label).filter(Boolean);
    if (fetched.length > 0) {
      return sortSizes(Array.from(new Set([...fetched, ...p.selectedSizes])));
    }

    // 3. Fallback when network/API returns empty list
    const fallback = Array.from(
      new Set([...AVAILABLE_SIZES, ...p.selectedSizes]),
    );
    return sortSizes(fallback);
  }, [p.availableSizes, dynamicSizes, p.selectedSizes]);

  return (
    <div className="commerce-filters">
      <div className="commerce-filter-top">
        <h2>{p.title || "Refine your rotation"}</h2>
        <button type="button" onClick={p.onReset}>
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      <label className="commerce-stock-toggle">
        <span>In stock only</span>
        <input
          type="checkbox"
          role="switch"
          checked={p.inStock}
          onChange={(e) => p.onInStockChange(e.target.checked)}
        />
      </label>

      {loading && (
        <div className="commerce-filter-loading">
          <Spinner />
        </div>
      )}

      {p.showCategories !== false && (
        <FilterGroup
          title="Category"
          values={categories.map((c) => c.label)}
          selected={p.selectedCategories}
          onToggle={p.onCategoryToggle}
          open
        />
      )}

      <FilterGroup
        title="Brand"
        values={brands.map((b) => b.label)}
        selected={p.selectedBrands}
        onToggle={p.onBrandToggle}
        open
      />

      <details className="commerce-filter-group" open>
        <summary>
          Size
          {p.selectedSizes.length > 0 && (
            <span>{p.selectedSizes.length}</span>
          )}
          <ChevronDown size={16} />
        </summary>
        <div className="commerce-size-filters">
          {displaySizes.map((size) => (
            <button
              type="button"
              key={size}
              aria-pressed={p.selectedSizes.includes(size)}
              onClick={() => p.onSizeToggle(size)}
            >
              {size}
            </button>
          ))}
          {!displaySizes.length && !loading && (
            <p className="commerce-muted">No sizes available.</p>
          )}
        </div>
      </details>

      <FilterGroup
        title="Occasion"
        values={OCCASIONS}
        selected={p.selectedOccasions}
        onToggle={p.onOccasionToggle}
      />

      <FilterGroup
        title="Style"
        values={STYLES}
        selected={p.selectedStyles}
        onToggle={p.onStyleToggle}
      />
    </div>
  );
}
