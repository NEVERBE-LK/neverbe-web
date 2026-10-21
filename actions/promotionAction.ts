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
  try {
    const res = await axiosInstance.get("/web/combos?size=100");
    const combos = res.data.dataList || res.data.combos || res.data.data || [];
    return combos
      .filter((c: any) => c.id && String(c.id).toLowerCase() !== "undefined")
      .map((c: any) => ({
        url: `/collections/combos/${c.id}`,
        priority: 0.7,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
        changeFrequency: "weekly",
      }));
  } catch (error) {
    console.error("Failed to fetch combos for sitemap:", error);
    return [];
  }
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
