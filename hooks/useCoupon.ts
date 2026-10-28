"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { applyCoupon, removeCoupon } from "@/redux/bagSlice/bagSlice";
import { RootState } from "@/redux/store";
import { BagItem } from "@/interfaces/BagItem";
import axiosInstance from "@/actions/axiosInstance";
import {
  calculateTotal,
  calculateTotalDiscount,
} from "@/utils/bagCalculations";

interface CouponValidationResult {
  valid: boolean;
  discount: number;
  message?: string;
  coupon?: {
    code: string;
    name: string;
    description?: string;
    discountType: string;
    discountValue: number;
    minOrderAmount?: number;
    minQuantity?: number;
    applicableProducts?: string[];
    applicableCategories?: string[];
    excludedProducts?: string[];
    firstOrderOnly?: boolean;
    expiresAt?: string;
  };
  // Condition feedback for real-time hints
  conditionFeedback?: {
    type: string;
    met: boolean;
    current?: number;
    required?: number;
    message: string;
  }[];
  restricted?: boolean;
  restrictionReason?: string;
}

interface CouponState {
  code: string;
  isValidating: boolean;
  isApplied: boolean;
  discount: number;
  message: string | null;
  messageType: "success" | "error" | "info" | "restricted" | null;
  couponDetails: CouponValidationResult["coupon"] | null;
  conditionFeedback: CouponValidationResult["conditionFeedback"] | null;
  isRestricted: boolean;
  restrictionReason: string | null;
}

interface UseCouponOptions {
  debounceMs?: number;
  autoValidate?: boolean;
}

interface UseCouponReturn {
  // State
  couponState: CouponState;

  // Actions
  setCode: (code: string) => void;
  validateCoupon: () => Promise<void>;
  applyCouponToCart: () => void;
  removeCouponFromCart: () => void;
  clearCoupon: () => void;

  // Derived
  canApply: boolean;
  formattedDiscount: string;
  hasComboItems: boolean;
  isBlocked: boolean;
}

/**
 * useCoupon - Hook for real-time coupon validation with user feedback
 */
export const useCoupon = (options: UseCouponOptions = {}): UseCouponReturn => {
  const { debounceMs = 500, autoValidate = true } = options;

  const dispatch = useDispatch();
  const bagItems = useSelector((state: RootState) => state.bag.bag);
  const savedCouponCode = useSelector(
    (state: RootState) => state.bag.couponCode,
  );
  const savedDiscount = useSelector(
    (state: RootState) => state.bag.couponDiscount,
  );
  const user = useSelector((state: RootState) => state.authSlice.user);

  const [couponState, setCouponState] = useState<CouponState>(() => ({
    code: savedCouponCode || "",
    isValidating: false,
    isApplied: !!savedCouponCode,
    discount: savedDiscount || 0,
    message: savedCouponCode
      ? `Coupon "${savedCouponCode}" applied - You save Rs. ${(savedDiscount || 0).toLocaleString()}`
      : null,
    messageType: savedCouponCode ? "success" : null,
    couponDetails: null,
    conditionFeedback: null,
    isRestricted: false,
    restrictionReason: null,
  }));

  const [prevSavedCode, setPrevSavedCode] = useState(savedCouponCode);
  if (savedCouponCode !== prevSavedCode) {
    setPrevSavedCode(savedCouponCode);
    if (savedCouponCode && savedCouponCode !== couponState.code) {
      setCouponState((prev) => ({
        ...prev,
        code: savedCouponCode,
        isApplied: true,
        discount: savedDiscount || 0,
        message: `Coupon "${savedCouponCode}" applied - You save Rs. ${(savedDiscount || 0).toLocaleString()}`,
        messageType: "success",
      }));
    } else if (!savedCouponCode && couponState.isApplied) {
      setCouponState((prev) => ({
        ...prev,
        code: "",
        isApplied: false,
        discount: 0,
        message: null,
        messageType: null,
      }));
    }
  }

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastValidatedCode = useRef<string>("");
  const lastBagHash = useRef<string>("");

  // Check if bag contains combo items
  const hasComboItems = bagItems.some((item) => item.isComboItem === true);

  // Generate a hash of bag contents for comparison
  const getBagHash = useCallback(() => {
    return bagItems
      .map(
        (item) =>
          `${item.itemId}-${item.variantId}-${item.size}-${item.quantity}`,
      )
      .sort()
      .join("|");
  }, [bagItems]);

  // Calculate cart total for validation
  const getCartTotal = useCallback(() => {
    return calculateTotal(bagItems) - calculateTotalDiscount(bagItems);
  }, [bagItems]);

  // Generate success message based on coupon type
  const getSuccessMessage = (result: CouponValidationResult): string => {
    const { discount, coupon } = result;

    if (!coupon) {
      return `Coupon valid! You save Rs. ${discount.toLocaleString()}`;
    }

    switch (coupon.discountType) {
      case "PERCENTAGE":
        return `${
          coupon.discountValue
        }% off applied! You save Rs. ${discount.toLocaleString()}`;
      case "FIXED":
        return `Rs. ${coupon.discountValue} off applied!`;
      case "FREE_SHIPPING":
        return "Free shipping applied!";
      default:
        return `Coupon valid! You save Rs. ${discount.toLocaleString()}`;
    }
  };

  // Validate coupon against API
  const validateCoupon = useCallback(async () => {
    const code = couponState.code.trim().toUpperCase();

    if (!code) {
      setCouponState((prev) => ({
        ...prev,
        message: null,
        messageType: null,
        couponDetails: null,
      }));
      return;
    }

    if (code === lastValidatedCode.current && couponState.isApplied) {
      return; // Already validated and applied
    }

    setCouponState((prev) => ({
      ...prev,
      isValidating: true,
      message: "Checking coupon...",
      messageType: "info",
    }));

    try {
      const requestData = {
        code,
        userId: user?.uid,
        email: user?.email,
        phone: user?.phoneNumber,
        cartTotal: getCartTotal(),
        cartItems: bagItems.map((item) => ({
          itemId: item.itemId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
        })),
      };

      const formData = new FormData();
      formData.append("data", JSON.stringify(requestData));

      const res = await axiosInstance.post("/web/coupons/validate", formData);

      const result: CouponValidationResult = res.data;
      lastValidatedCode.current = code;

      if (result.valid) {
        // Auto-apply to Redux when valid
        dispatch(
          applyCoupon({
            code: code,
            discount: result.discount,
          }),
        );

        setCouponState((prev) => ({
          ...prev,
          isValidating: false,
          isApplied: true,
          discount: result.discount,
          message: getSuccessMessage(result),
          messageType: "success",
          couponDetails: result.coupon || null,
          conditionFeedback: result.conditionFeedback || null,
        }));
      } else {
        const isRestricted = (result as any).restricted || false;
        setCouponState((prev) => ({
          ...prev,
          isValidating: false,
          discount: 0,
          message: result.message || "Invalid coupon code",
          messageType: isRestricted ? "restricted" : "error",
          couponDetails: null,
          conditionFeedback: result.conditionFeedback || null,
          isApplied: false,
          isRestricted,
          restrictionReason: result.message || null,
        }));

        // Remove from redux if was previously applied
        if (savedCouponCode === code) {
          dispatch(removeCoupon());
        }
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      setCouponState((prev) => ({
        ...prev,
        isValidating: false,
        discount: 0,
        message: "Failed to validate coupon. Please try again.",
        messageType: "error",
        couponDetails: null,
      }));
    }
  }, [
    couponState.code,
    couponState.isApplied,
    user,
    bagItems,
    getCartTotal,
    savedCouponCode,
    dispatch,
  ]);

  // Set code with optional auto-validation
  const setCode = useCallback(
    (newCode: string) => {
      const upperCode = newCode.toUpperCase();

      setCouponState((prev) => ({
        ...prev,
        code: upperCode,
        // Clear applied state when code changes
        isApplied: prev.code === upperCode && prev.isApplied,
      }));

      // Debounced auto-validation
      if (autoValidate && upperCode.length >= 3) {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
          validateCoupon();
        }, debounceMs);
      } else if (!upperCode) {
        setCouponState((prev) => ({
          ...prev,
          message: null,
          messageType: null,
          discount: 0,
          couponDetails: null,
          isRestricted: false,
          restrictionReason: null,
        }));
      }
    },
    [autoValidate, debounceMs, validateCoupon],
  );

  // Apply validated coupon to cart
  const applyCouponToCart = useCallback(() => {
    if (couponState.discount > 0 && couponState.messageType === "success") {
      dispatch(
        applyCoupon({
          code: couponState.code,
          discount: couponState.discount,
        }),
      );

      setCouponState((prev) => ({
        ...prev,
        isApplied: true,
        message: `Coupon "${
          prev.code
        }" applied! You save Rs. ${prev.discount.toLocaleString()}`,
      }));
    }
  }, [couponState, dispatch]);

  // Remove coupon from cart
  const removeCouponFromCart = useCallback(() => {
    dispatch(removeCoupon());

    setCouponState((prev) => ({
      ...prev,
      isApplied: false,
      discount: 0,
      message: "Coupon removed",
      messageType: "info",
      couponDetails: null,
      conditionFeedback: null,
      isRestricted: false,
      restrictionReason: null,
    }));

    lastValidatedCode.current = "";

    // Clear message after a delay
    setTimeout(() => {
      setCouponState((prev) => ({
        ...prev,
        message: null,
        messageType: null,
        isRestricted: false,
        restrictionReason: null,
      }));
    }, 2000);
  }, [dispatch]);

  // Clear coupon completely
  const clearCoupon = useCallback(() => {
    dispatch(removeCoupon());

    setCouponState({
      code: "",
      isValidating: false,
      isApplied: false,
      discount: 0,
      message: null,
      messageType: null,
      couponDetails: null,
      conditionFeedback: null,
      isRestricted: false,
      restrictionReason: null,
    });

    lastValidatedCode.current = "";
  }, [dispatch]);

  // Re-validate when cart changes (any item added/removed/quantity changed)
  useEffect(() => {
    const currentHash = getBagHash();
    const bagChanged = currentHash !== lastBagHash.current;
    lastBagHash.current = currentHash;

    // If bag has combo items, remove any applied coupon
    if (hasComboItems && couponState.isApplied) {
      dispatch(removeCoupon());
      const timer = setTimeout(() => {
        setCouponState((prev) => ({
          ...prev,
          isApplied: false,
          discount: 0,
          message: "Coupons cannot be combined with combo deals",
          messageType: "error",
          couponDetails: null,
          isRestricted: false,
          restrictionReason: null,
        }));
      }, 0);
      lastValidatedCode.current = "";
      return () => clearTimeout(timer);
    }

    // Re-validate existing coupon when bag changes
    if (
      bagChanged &&
      couponState.isApplied &&
      couponState.code &&
      !hasComboItems
    ) {
      const timer = setTimeout(() => {
        validateCoupon();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [
    bagItems,
    hasComboItems,
    couponState.isApplied,
    couponState.code,
    getBagHash,
    validateCoupon,
    dispatch,
  ]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Derived state
  const isBlocked = hasComboItems;
  const canApply =
    !isBlocked &&
    !couponState.isApplied &&
    couponState.discount > 0 &&
    couponState.messageType === "success" &&
    !couponState.isValidating;

  const formattedDiscount =
    couponState.discount > 0
      ? `Rs. ${couponState.discount.toLocaleString()}`
      : "";

  return {
    couponState,
    setCode,
    validateCoupon,
    applyCouponToCart,
    removeCouponFromCart,
    clearCoupon,
    canApply,
    formattedDiscount,
    hasComboItems,
    isBlocked,
  };
};

export default useCoupon;
