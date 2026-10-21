import Link from "next/link";
import {
  catalogPageHref,
  paginationPages,
  type CatalogQuery,
} from "@/utils/catalogQuery";

export default function CatalogPagination({
  path,
  query,
  total,
}: {
  path: string;
  query: CatalogQuery;
  total: number;
}) {
  const totalPages = Math.ceil(total / query.size);
  if (totalPages <= 1) return null;
  return (
    <nav className="catalog-pagination" aria-label="Collection pages">
      {query.page > 1 && (
        <Link
          prefetch={false}
          href={catalogPageHref(path, query, query.page - 1)}
          aria-label="Previous page"
        >
          Previous
        </Link>
      )}
      {paginationPages(query.page, totalPages).map((page, index) =>
        page === "gap" ? (
          <span key={`gap-${index}`} aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={page}
            prefetch={false}
            href={catalogPageHref(path, query, page)}
            aria-label={`Page ${page}`}
            aria-current={page === query.page ? "page" : undefined}
          >
            {page}
          </Link>
        ),
      )}
      {query.page < totalPages && (
        <Link
          prefetch={false}
          href={catalogPageHref(path, query, query.page + 1)}
          aria-label="Next page"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
