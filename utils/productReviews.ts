export interface ProductReview {
  reviewId: string;
  userName: string;
  rating: number;
  review: string;
  source?: "GOOGLE" | "WEB";
  createdAt?: string;
}

/** Reject invalid ratings; never manufacture praise, verification or dates. */
export function normalizeProductReviews(payload: unknown): ProductReview[] {
  const data = payload as { reviews?: unknown; data?: unknown } | null;
  const rows = Array.isArray(payload) ? payload
    : Array.isArray(data?.reviews) ? data.reviews
    : Array.isArray(data?.data) ? data.data : [];
  const reviews = new Map<string, ProductReview>();
  for (const [index, row] of rows.entries()) {
    if (!row || typeof row !== "object") continue;
    const rating = row.rating;
    if (typeof rating !== "number" || !Number.isFinite(rating) || rating < 1 || rating > 5) continue;
    const text = [row.review, row.text, row.comment, row.reviewText, row.content]
      .find((value) => typeof value === "string" && value.trim());
    const author = [row.userName, row.author_name, row.name]
      .find((value) => typeof value === "string" && value.trim());
    const date = row.createdAt || row.date;
    const id = String(row.reviewId || row.id || row._id || `review-${index}`);
    reviews.set(id, {
      reviewId: id,
      userName: author?.trim() || "Customer",
      rating,
      review: text?.trim() || "",
      source: row.source === "GOOGLE" ? "GOOGLE" : "WEB",
      ...(typeof date === "string" && !Number.isNaN(Date.parse(date)) ? { createdAt: date } : {}),
    });
  }
  return [...reviews.values()];
}

export function displayedReviewAverage(reviews: ProductReview[]) {
  return reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null;
}
