"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Rate } from "antd";
import ComponentLoader from "@/components/ComponentLoader";
import axiosInstance from "@/actions/axiosInstance";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { FcGoogle } from "react-icons/fc";
import { IoCreateOutline, IoChevronDown, IoChevronUp } from "react-icons/io5";
import dynamic from "next/dynamic";
import ReCaptchaProviderWrapper from "@/app/(site)/components/ReCaptchaProvider";
const ReviewForm = dynamic(() => import("@/components/ReviewForm"));
import { Product } from "@/interfaces/Product";
import { normalizeProductReviews, displayedReviewAverage, type ProductReview as Review } from "@/utils/productReviews";

interface ProductReviewsProps {
  product: Product;
}

function ProductReviewCard({ review }: { review: Review }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = (review.review || "").length > 120;

  return (
    <div className="p-6 v2-glass rounded-3xl border border-glass-border hover:border-accent/30 transition-all group flex flex-col justify-between min-h-[220px] h-full">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent text-inverse dark:text-accent-text font-black uppercase flex items-center justify-center text-xs shrink-0">
            {review.userName?.[0] || "U"}
          </div>
          <div>
            <span className="block text-sm font-black text-primary m-0 leading-tight flex items-center gap-2">
              {review.userName}
              {review.source === "GOOGLE" && <FcGoogle size={14} />}
            </span>
            <span className="text-[10px] text-muted uppercase tracking-wider font-extrabold block mt-0.5">
              {review.source === "GOOGLE"
                ? "Google Review"
                : review.createdAt ? formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                  }) : "Customer review"}
            </span>
          </div>
        </div>

        <Rate
          disabled
          defaultValue={review.rating}
          style={{ color: "var(--color-accent)", fontSize: 12 }}
          className="mb-3 block"
        />

        {review.review && <p
          className={`text-xs text-secondary leading-relaxed font-medium italic m-0 transition-all ${
            !isExpanded && isLong ? "line-clamp-3" : ""
          }`}
        >
          &ldquo;{review.review}&rdquo;
        </p>}

        {isLong && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold text-accent hover:underline border-none bg-transparent cursor-pointer p-0 uppercase tracking-wider"
          >
            <span>{isExpanded ? "Show Less" : "Read More"}</span>
            {isExpanded ? (
              <IoChevronUp size={12} />
            ) : (
              <IoChevronDown size={12} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

const ProductReviews = ({ product }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.authSlice);

  const fetchReviews = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await axiosInstance.get(
        `/web/reviews?itemId=${encodeURIComponent(product.id)}&limit=20`,
        { signal },
      );
      if (!signal?.aborted) setReviews(normalizeProductReviews(res.data));
    } catch (error) {
      if (!signal?.aborted) {
        setReviews([]);
        setLoadError(true);
        console.error("Failed to fetch reviews", error);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [product.id]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchReviews(controller.signal);
    return () => controller.abort();
  }, [fetchReviews]);
  const average = displayedReviewAverage(reviews);

  const handleWriteReview = () => {
    if (!user) {
      toast.error("Please login to write a review");
      window.location.href = "/account/login";
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-20 border-t border-glass-border">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <span className="v2-section-label text-[10px] mb-1 block">
            CUSTOMER FEEDBACK
          </span>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-primary m-0">
            Customer Reviews
          </h2>
          {!loading && !loadError && <div className="flex items-center gap-3 mt-2">
            {average !== null && <Rate
              disabled
              allowHalf
              value={average}
              style={{ color: "var(--color-accent)", fontSize: 14 }}
            />}
            <span className="text-xs font-black uppercase tracking-wider text-secondary">
              {average !== null ? `${average.toFixed(1)} / 5 · ${reviews.length} displayed ${reviews.length === 1 ? "review" : "reviews"}` : "No reviews yet"}
            </span>
          </div>}
        </div>

        <button
          onClick={handleWriteReview}
          className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-accent text-accent-text font-black uppercase text-xs tracking-widest hover:opacity-90 transition-all border-none cursor-pointer shadow-lg w-full md:w-auto"
        >
          <IoCreateOutline size={18} className="text-accent-text shrink-0" />
          <span className="text-accent-text font-black">Write a Review</span>
        </button>
      </div>

      {/* Floating reviews container */}
      <div className="w-full">
        {loading ? (
          <ComponentLoader />
        ) : loadError ? (
          <p role="status" className="text-sm text-secondary">Reviews could not be loaded. <button type="button" className="underline" onClick={() => void fetchReviews()}>Try again</button></p>
        ) : reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <ProductReviewCard key={review.reviewId} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm font-bold text-secondary uppercase tracking-wider mb-3 m-0">
              Be the first to review this product!
            </p>
            <button
              onClick={handleWriteReview}
              className="text-xs font-black uppercase tracking-widest text-accent hover:underline border-none bg-transparent cursor-pointer p-0"
            >
              Submit your experience &rarr;
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ReCaptchaProviderWrapper>
          <ReviewForm
            open={isModalOpen}
            productId={product.id}
            onCancel={() => setIsModalOpen(false)}
            onSuccess={() => {
              setIsModalOpen(false);
              fetchReviews();
            }}
          />
        </ReCaptchaProviderWrapper>
      )}
    </div>
  );
};

export default ProductReviews;
