import axiosInstance from "./axiosInstance";

// Public, short-lived data shared by listing and cart consumers in the same runtime.
// Authenticated/customer requests are never cached here.
let cached: unknown[] | undefined;
let expires = 0;
let pending: Promise<unknown[]> | undefined;
export async function getPublicPromotions<T>(): Promise<T[]> {
  if (cached && Date.now() < expires) return cached as T[];
  if (!pending) {
    pending = axiosInstance
      .get("/web/promotions")
      .then((response) => {
        cached = Array.isArray(response.data) ? response.data : [];
        expires = Date.now() + 30_000;
        return cached;
      })
      .finally(() => {
        pending = undefined;
      });
  }
  return pending as Promise<T[]>;
}
