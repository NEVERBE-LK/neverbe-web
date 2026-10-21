"use client";
import React from "react";
import ComboCard from "./ComboCard";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useRouter, useSearchParams } from "next/navigation";

interface CombosGridProps {
  combos: any[];
  currentPage: number; // Controlled by parent
  totalPages: number; // Controlled by parent
}

const CombosGrid: React.FC<CombosGridProps> = ({
  combos,
  currentPage,
  totalPages,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;

    // Create new URL params
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());

    // Push new URL
    router.push(`?${params.toString()}`, { scroll: true });
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      const showPage =
        i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1;
      if (showPage) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  if (combos.length === 0) return null;

  return (
    <>
      {/* Combo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-12">
        {combos.map((combo: any) => (
          <ComboCard key={combo.id} combo={combo} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center mt-20 pt-12 border-t border-default">
          <div className="flex items-center gap-4">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-6 py-2 text-xs font-black uppercase tracking-widest text-primary-dark hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <IoChevronBack size={18} />
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-2">
              {getPageNumbers().map((page, idx) => {
                if (page === "...") {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-muted">
                      ...
                    </span>
                  );
                }
                const pageNum = page as number;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`min-w-[36px] h-9 flex items-center justify-center text-sm font-black rounded-full transition-all ${
                      currentPage === pageNum
                        ? "bg-accent text-accent-text shadow-custom"
                        : "bg-transparent text-primary hover:text-secondary hover:bg-surface-2"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-6 py-2 text-xs font-black uppercase tracking-widest text-primary-dark hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <IoChevronForward size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CombosGrid;
