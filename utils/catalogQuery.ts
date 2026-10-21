export type CatalogSearchParams = Record<string, string | string[] | undefined>;

export interface CatalogQuery {
  page: number;
  size: number;
  params: Record<string, string>;
  key: string;
  filtered: boolean;
  defaultCategory?: string;
}

export function catalogSearchParams(search: {
  forEach(callback: (value: string, key: string) => void): void;
}): CatalogSearchParams {
  const result: CatalogSearchParams = {};
  search.forEach((value, key) => {
    if (!(key in result)) result[key] = value;
  });
  return result;
}

function positiveInteger(
  value: string | undefined,
  fallback: number,
  max: number,
) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0
    ? Math.min(number, max)
    : fallback;
}

/** The same normalized request is used for SSR, hydration, pagination and metadata. */
export function catalogQuery(
  search: CatalogSearchParams,
  defaultCategory?: string,
): CatalogQuery {
  const first = (key: string) => {
    const value = search[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const page = positiveInteger(first("page"), 1, 100000);
  const size = positiveInteger(first("size"), 12, 100);
  const params: Record<string, string> = {
    page: String(page),
    size: String(size),
  };
  for (const key of [
    "brand",
    "category",
    "gender",
    "sizes",
    "occasion",
    "style",
  ]) {
    const value = first(key)?.trim();
    if (value)
      params[key] =
        key === "brand" || key === "category"
          ? value.split(",")[0].toLowerCase()
          : value;
  }
  if (defaultCategory) params.category = defaultCategory.toLowerCase();
  if (first("inStock") === "true") params.inStock = "true";
  if (["low", "high", "new"].includes(first("sort") || ""))
    params.sort = first("sort")!;
  const filtered = Object.keys(params).some(
    (key) =>
      key !== "page" &&
      key !== "size" &&
      !(key === "category" && defaultCategory),
  );
  return {
    page,
    size,
    params,
    key: new URLSearchParams(params).toString(),
    filtered,
    defaultCategory,
  };
}

/** Keep active filters; omit redundant page=1 and the default page size. */
export function catalogPageHref(
  path: string,
  query: CatalogQuery,
  page: number,
) {
  const params = new URLSearchParams(query.params);
  if (page === 1) params.delete("page");
  else params.set("page", String(page));
  if (query.defaultCategory) params.delete("category");
  if (query.size === 12) params.delete("size");
  const suffix = params.toString();
  return path + (suffix ? `?${suffix}` : "");
}

export function paginationPages(
  page: number,
  totalPages: number,
): (number | "gap")[] {
  const numbers = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  for (const value of numbers) {
    const previous = result[result.length - 1];
    if (typeof previous === "number" && value - previous > 1)
      result.push("gap");
    result.push(value);
  }
  return result;
}

export function catalogPageExists(query: CatalogQuery, total: number) {
  return query.page === 1 || query.page <= Math.ceil(total / query.size);
}
