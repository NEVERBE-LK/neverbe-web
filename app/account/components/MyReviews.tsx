"use client";

import React, { useEffect, useState } from "react";
import { Rate, Modal } from "antd";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import axiosInstance from "@/actions/axiosInstance";
import { auth } from "@/firebase/firebaseClient";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import ReviewForm from "@/components/ReviewForm";
import EmptyState from "@/components/EmptyState";
import { motion } from "framer-motion";

const { confirm } = Modal;

interface Review {
  reviewId: string;
  itemId: string;
  rating: number;
  review: string;
  status: string;
  createdAt: string;
}

const MyReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await axiosInstance.get("/web/customers/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = (reviewId: string) => {
    confirm({
      title: "Are you sure you want to delete this review?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const token = await auth.currentUser?.getIdToken();
          await axiosInstance.delete(`/web/reviews/${reviewId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("Review deleted successfully");
          fetchReviews();
        } catch (error) {
          console.error("Failed to delete review", error);
          toast.error("Failed to delete review");
        }
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-glass-border pb-6">
        <span className="v2-section-label mb-1">FEEDBACK</span>
        <h2 className="text-3xl font-black uppercase tracking-tight text-primary m-0">
          My Reviews &amp; Ratings
        </h2>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          heading="No reviews submitted"
          subHeading="Once you purchase items and share your experience, your reviews will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <motion.div
              key={r.reviewId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="v2-glass p-6 rounded-3xl border border-glass-border hover:border-accent transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Rate disabled defaultValue={r.rating} style={{ fontSize: 14, color: "var(--color-accent)" }} />
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      r.status === "APPROVED"
                        ? "bg-accent/10 text-accent border border-accent/30"
                        : r.status === "PENDING"
                        ? "bg-warning/10 text-warning border border-warning/30"
                        : "bg-error/10 text-error border border-error/30"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <p className="text-xs text-primary leading-relaxed m-0 mb-4 font-medium">
                  &ldquo;{r.review}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-glass-border text-[10px] font-extrabold uppercase tracking-widest text-muted">
                <span>
                  {r.createdAt ? formatDistanceToNow(new Date(r.createdAt), { addSuffix: true }) : "Recently"}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setEditingReview(r);
                      setIsModalOpen(true);
                    }}
                    className="text-secondary hover:text-accent transition-colors border-none bg-transparent cursor-pointer p-0"
                  >
                    <EditOutlined />
                  </button>
                  <button
                    onClick={() => handleDelete(r.reviewId)}
                    className="text-error hover:text-error transition-colors border-none bg-transparent cursor-pointer p-0"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Review Modal */}
      <Modal
        title={
          <span className="font-black uppercase tracking-tight text-primary">
            Edit Review
          </span>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingReview(null);
        }}
        footer={null}
        destroyOnClose
        centered
        className="v2-landing"
      >
        {editingReview && (
          <ReviewForm
            productId={editingReview.itemId}
            initialValues={editingReview}
            open={isModalOpen}
            onCancel={() => { setIsModalOpen(false); setEditingReview(null); }}
            onSuccess={() => {
              setIsModalOpen(false);
              setEditingReview(null);
              fetchReviews();
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default MyReviews;
