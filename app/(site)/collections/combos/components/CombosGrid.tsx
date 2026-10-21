import ComboCard from "./ComboCard";
import CatalogPagination from "@/components/CatalogPagination";
import { catalogQuery } from "@/utils/catalogQuery";

export default function CombosGrid({
  combos,
  currentPage,
  totalPages,
}: {
  combos: any[];
  currentPage: number;
  totalPages: number;
}) {
  if (combos.length === 0) return null;
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-12">
        {combos.map((combo) => (
          <ComboCard key={combo.id} combo={combo} />
        ))}
      </div>
      <CatalogPagination
        path="/collections/combos"
        query={catalogQuery({ page: String(currentPage) })}
        total={totalPages * 12}
      />
    </>
  );
}
