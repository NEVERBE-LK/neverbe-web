import axiosInstance from "./axiosInstance";
import { getCategoryBySlug, categoryLabelToSlug } from "@/utils/categorySlug";
import { catalogSitemapEntries } from "@/utils/catalogSitemap";

export const getProducts = async (params: any = {}) => {
  try {
    const q = new URLSearchParams({ size: "12", ...params }).toString();
    const res = await axiosInstance.get(`/web/products?${q}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { dataList: [], total: 0 };
  }
};

export const getRecentItems = async (limit: number = 10) => {
  try {
    const res = await axiosInstance.get(`/web/products/new?size=${limit}`);
    return res.data.dataList || [];
  } catch (error) {
    console.error("Failed to fetch recent items:", error);
    return [];
  }
};

export const getProductById = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/web/products/${id}`);
    const data = res.data;
    return data.data || data;
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    return null;
  }
};

export const getSimilarItems = async (id: string, limit: number = 4) => {
  try {
    const res = await axiosInstance.get(
      `/web/products/${id}/similar?size=${limit}`,
    );
    return res.data.dataList || [];
  } catch (error) {
    console.error(`Failed to fetch similar items for ${id}:`, error);
    return [];
  }
};

export const getNewArrivals = async (limit: number = 12) => {
  try {
    const res = await axiosInstance.get(`/web/products/new?size=${limit}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch new arrivals:", error);
    return { dataList: [], total: 0 };
  }
};

export const getDealsProducts = async (params: any = {}) => {
  try {
    const q = new URLSearchParams({ size: "12", ...params }).toString();
    const res = await axiosInstance.get(`/web/products/deals?${q}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch deals products:", error);
    return { dataList: [], total: 0 };
  }
};

export const getHotProducts = async () => {
  try {
    const res = await axiosInstance.get("/web/products/hot");
    return res.data.dataList || [];
  } catch (error) {
    console.error("Failed to fetch hot products:", error);
    return [];
  }
};

export const getBrandForSitemap = async () => {
  try {
    const res = await axiosInstance.get("/web/brands/dropdown");
    const brands = res.data;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://neverbe.lk";
    return brands
      .filter(
        (b: any) =>
          b.label && b.label !== "undefined" && String(b.label).trim() !== "",
      )
      .map((b: any) => ({
        url: `${baseUrl}/collections/products?brand=${encodeURIComponent(b.label)}`,
        priority: 0.6,
        lastModified: new Date(),
        changeFrequency: "weekly",
      }));
  } catch (error) {
    console.error("Failed to fetch brands for sitemap:", error);
    return [];
  }
};

export const getCategoriesForSitemap = async () => {
  try {
    const res = await axiosInstance.get("/web/categories/dropdown");
    const categories = res.data;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://neverbe.lk";
    return categories
      .filter(
        (c: any) =>
          c.label &&
          c.label !== "undefined" &&
          String(c.label).trim() !== "" &&
          !!getCategoryBySlug(categoryLabelToSlug(c.label)),
      )
      .map((c: any) => ({
        url: `${baseUrl}/collections/${categoryLabelToSlug(c.label)}`,
        priority: 0.7,
        changeFrequency: "weekly",
      }));
  } catch (error) {
    console.error("Failed to fetch categories for sitemap:", error);
    return [];
  }
};

export const getCatalogForSitemap = async () => {
  const readPage = async (page: number) => {
    const { data } = await axiosInstance.get(`/web/products?page=${page}&size=200`);
    const dataList = data?.dataList ?? (data?.total === 0 ? [] : undefined);
    if (
      !Array.isArray(dataList) ||
      !Number.isSafeInteger(data.total) || data.total < 0
    ) {
      throw new Error("Invalid catalog response while generating sitemap");
    }
    return { total: data.total, dataList };
  };
  const first = await readPage(1);
  const products = [...first.dataList];
  const pages = Math.ceil(first.total / 200);
  // Bound concurrency while including the complete catalog in the sitemap.
  for (let page = 2; page <= pages; page += 4) {
    const responses = await Promise.all(
      Array.from({ length: Math.min(4, pages - page + 1) }, (_, index) =>
        readPage(page + index),
      ),
    );
    responses.forEach((response) => products.push(...response.dataList));
  }
  // Let failed regeneration retain the previous sitemap instead of caching
  // a successful response that silently removes all catalog URLs.
  if (products.length < first.total) {
    throw new Error("Incomplete catalog while generating sitemap");
  }
  return catalogSitemapEntries(products);
};

export const getCategories = async () => {
  try {
    const res = await axiosInstance.get("/web/categories/dropdown");
    const data = res.data;
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
};

export const getSizes = async () => {
  try {
    const res = await axiosInstance.get("/web/sizes/dropdown");
    const data = res.data;
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error("Failed to fetch sizes:", error);
    return [];
  }
};

export const getProductsByCategory = async (
  category: string,
  params: any = {},
) => {
  try {
    const q = new URLSearchParams({
      size: "12",
      ...params,
      category,
    }).toString();
    const res = await axiosInstance.get(`/web/products?${q}`);
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch products for category ${category}:`, error);
    return { dataList: [], total: 0 };
  }
};
