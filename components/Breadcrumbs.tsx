import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({
  items,
  className = "",
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`commerce-breadcrumbs flex items-center gap-3 text-[11px] text-secondary ${className}`.trim()}
    >
      <Link
        href="/"
        className="text-secondary hover:text-primary transition-colors"
      >
        Home
      </Link>
      {items.map((item, index) => (
        <span
          key={`${item.label}-${index}`}
          className="inline-flex items-center gap-3"
        >
          <ChevronRight size={11} className="text-muted shrink-0" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-secondary hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span
              aria-current="page"
              className="text-primary font-semibold truncate max-w-[260px]"
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
