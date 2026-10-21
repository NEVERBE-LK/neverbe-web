"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import Spinner from "./Spinner";
import { motion, AnimatePresence } from "framer-motion";
import { IoStar, IoStarOutline, IoCloseOutline, IoCloudUploadOutline } from "react-icons/io5";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import axiosInstance from "@/actions/axiosInstance";
import { auth } from "@/firebase/firebaseClient";
import toast from "react-hot-toast";

interface ReviewFormProps {
  productId?: string;
  initialValues?: {
    reviewId: string;
    rating: number;
    review: string;
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
  open: boolean;
}

const ReviewForm = ({
  productId,
  initialValues,
  onSuccess,
  onCancel,
  open,
}: ReviewFormProps) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    if (initialValues) {
      setRating(initialValues.rating || 5);
      setReviewText(initialValues.review || "");
    } else {
      setRating(5);
      setReviewText("");
      setFiles([]);
    }
  }, [initialValues, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter((file) => {
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
          toast.error(`${file.name} is larger than 5MB!`);
        }
        return isLt5M;
      });
      setFiles((prev) => [...prev, ...validFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast.error("Please write a review");
      return;
    }

    setLoading(true);
    try {
      if (!executeRecaptcha) {
        toast.error("reCAPTCHA not initialized");
        return;
      }

      const captchaToken = await executeRecaptcha("submit_review");
      const token = await auth.currentUser?.getIdToken();
      const formData = new FormData();

      const payload = {
        rating,
        review: reviewText,
        captchaToken,
        ...(productId && { itemId: productId }),
      };

      formData.append("data", JSON.stringify(payload));
      files.forEach((file) => {
        formData.append("images", file);
      });

      if (initialValues) {
        await axiosInstance.patch(
          `/web/reviews/${initialValues.reviewId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Review updated successfully!");
      } else {
        await axiosInstance.post("/web/reviews", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Review submitted! It will appear once approved.");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Failed to submit review", error);
      toast.error(error.response?.data?.error || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return <Modal open={open} onCancel={onCancel} footer={null} title={initialValues?"Edit your review":"Your take. Your words."} centered rootClassName="commerce-modal commerce-review-dialog"><form onSubmit={handleSubmit} className="commerce-form"><div><p className="commerce-muted">How was your experience?</p><div className="commerce-review-rating" role="group" aria-label="Choose rating">{[1,2,3,4,5].map(value=><button type="button" key={value} aria-label={`${value} ${value===1?"star":"stars"}`} aria-pressed={rating===value} onClick={()=>setRating(value)}>{value<=rating?<IoStar size={28}/>:<IoStarOutline size={28}/>}</button>)}</div></div><label>Your review<textarea value={reviewText} onChange={event=>setReviewText(event.target.value)} rows={5} required placeholder="Tell us about the fit, comfort, or your experience."/></label><label className="commerce-review-upload">Add photos (optional)<input type="file" accept="image/*" multiple onChange={handleFileChange}/><small>Up to 5 images, 5 MB each.</small></label>{files.length>0&&<div className="commerce-review-files">{files.map((file,index)=><button type="button" key={`${file.name}-${index}`} onClick={()=>removeFile(index)} aria-label={`Remove ${file.name}`}>{file.name}<IoCloseOutline size={14}/></button>)}</div>}<button type="submit" className="commerce-primary" disabled={loading}>{loading?<Spinner/>:initialValues?"Save review":"Submit review"}</button></form></Modal>;
};
export default ReviewForm;
