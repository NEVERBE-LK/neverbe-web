import axiosInstance from "./axiosInstance";

export const getPaginatedCombos = async (params: any = {}) => {
  try {
    const q = new URLSearchParams({ size: "12", ...params }).toString();
    const res = await axiosInstance.get(`/web/combos?${q}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch paginated combos:", error);
    return { dataList: [], total: 0 };
  }
};

export const getCombosForSitemap = async () => {
  const readPage = async (page: number) => {
    const { data } = await axiosInstance.get(`/web/combos?page=${page}&size=100`);
    const dataList = data?.dataList ?? data?.combos ?? data?.data ?? (data?.total === 0 ? [] : undefined);
    if (!Array.isArray(dataList) || !Number.isSafeInteger(data.total) || data.total < 0) {
      throw new Error("Invalid bundle response while generating sitemap");
    }
    return { total: data.total, dataList };
  };
  const first = await readPage(1);
  const combos = [...first.dataList];
  const pages = Math.ceil(first.total / 100);
  for (let page = 2; page <= pages; page += 4) {
    const responses = await Promise.all(
      Array.from({ length: Math.min(4, pages - page + 1) }, (_, index) => readPage(page + index)),
    );
    responses.forEach(response => combos.push(...response.dataList));
  }
  if (combos.length < first.total) {
    throw new Error("Incomplete bundles while generating sitemap");
  }
  return combos
    .filter((c: any) => c.id && String(c.id).toLowerCase() !== "undefined")
    .map((c: any) => ({
      url: `/collections/combos/${encodeURIComponent(c.id)}`,
      priority: 0.7,
      ...(c.updatedAt ? { lastModified: new Date(c.updatedAt) } : {}),
      changeFrequency: "weekly",
    }));
};

export const getComboById = async (id: string) => {
  try {
    const res = await axiosInstance.get(`/web/combos/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch combo ${id}:`, error);
    return null;
  }
};

export const getActivePromotions = async () => {
  try {
    const res = await axiosInstance.get("/web/promotions");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch active promotions:", error);
    return [];
  }
};

export const getActiveCoupons = async () => {
  try {
    const res = await axiosInstance.get("/web/coupons");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch active coupons:", error);
    return [];
  }
};
