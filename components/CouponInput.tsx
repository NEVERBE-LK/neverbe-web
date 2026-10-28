"use client";
import React, { useEffect } from "react";
import useCoupon from "@/hooks/useCoupon";
import Spinner from "./Spinner";

export default function CouponInput({
  className = "",
  onDiscountChange,
}: {
  className?: string;
  onDiscountChange?: (discount: number) => void;
}) {
  const {
    couponState,
    setCode,
    validateCoupon,
    removeCouponFromCart,
    isBlocked,
    hasComboItems,
  } = useCoupon({ autoValidate: false, debounceMs: 600 });

  useEffect(() => {
    onDiscountChange?.(couponState.discount);
  }, [couponState.discount, onDiscountChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (!couponState.isApplied && !isBlocked) {
        validateCoupon();
      }
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (couponState.isApplied) {
      removeCouponFromCart();
    } else if (!isBlocked) {
      validateCoupon();
    }
  };

  return (
    <div className={`commerce-coupon ${className}`}>
      {isBlocked && hasComboItems && (
        <p className="commerce-muted">Coupons cannot be combined with this bundle.</p>
      )}
      <div className="commerce-coupon-inner flex items-center gap-2.5">
        <label className="sr-only" htmlFor="promo-code">
          Promo code
        </label>
        <input
          id="promo-code"
          value={couponState.code}
          onChange={(event) => setCode(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Promo code"
          disabled={couponState.isApplied || isBlocked}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isBlocked || couponState.isValidating}
        >
          {couponState.isValidating ? (
            <Spinner />
          ) : couponState.isApplied ? (
            "Remove"
          ) : (
            "Apply"
          )}
        </button>
      </div>
      {!couponState.isValidating && couponState.message && (
        <p
          className={`commerce-coupon-message text-[11px] mt-1.5 ${
            couponState.messageType === "success"
              ? "text-accent font-bold"
              : couponState.messageType === "error" ||
                couponState.messageType === "restricted"
              ? "text-error font-medium"
              : "text-secondary"
          }`}
          role="status"
        >
          {couponState.message}
        </p>
      )}
    </div>
  );
}
