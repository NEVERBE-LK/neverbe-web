"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoBagAdd, IoAddOutline, IoRemoveOutline } from "react-icons/io5";
import { Button } from "antd";

interface FloatingAddToBagProps {
  productName: string;
  price: number;
  selectedSize: string;
  canAddToBag: boolean;
  onAddToBag: () => void;
  qty?: number;
  onQtyChange?: (qty: number) => void;
  maxQty?: number;
  discountType?: "item" | "promotion" | null;
}

/**
 * Floating Add to Bag button - NEVERBE Theme
 * Optimized for mobile "one-thumb" interactions.
 */
const FloatingAddToBag: React.FC<FloatingAddToBagProps> = ({
  productName,
  price,
  selectedSize,
  canAddToBag,
  onAddToBag,
  qty = 1,
  onQtyChange,
  maxQty = 10,
  discountType,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Logic: Show after scrolling past the main hero/CTA
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          // Added brand surface, border-default, and custom shadow logic
          className="fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-t border-default shadow-hover p-4 lg:hidden"
        >
          <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
            {/* Product Summary */}
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-primary-dark truncate uppercase tracking-tight">
                {productName}
              </p>
              <div className="flex items-center gap-2">
                <p
                  className={`text-md font-display font-black tracking-tighter ${
                    discountType === "item"
                      ? "text-error"
                      : discountType === "promotion"
                      ? "text-warning"
                      : "text-accent"
                  }`}
                >
                  Rs. {price.toLocaleString()}
                </p>
                {selectedSize && (
                  <span className="text-xs font-bold text-muted uppercase">
                    • Size: {selectedSize}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            {onQtyChange && (
              <div className="flex items-center border border-default rounded-full overflow-hidden">
                <Button
                  type="text"
                  onClick={() => onQtyChange(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                  className="w-8 h-8 flex items-center justify-center text-primary-dark hover:bg-surface-2 disabled:text-muted disabled:cursor-not-allowed p-0 rounded-none border-none"
                  icon={<IoRemoveOutline size={16} />}
                />
                <span className="w-6 text-center font-display font-black text-sm text-primary-dark">
                  {qty}
                </span>
                <Button
                  type="text"
                  onClick={() => onQtyChange(Math.min(maxQty, qty + 1))}
                  disabled={qty >= maxQty}
                  className="w-8 h-8 flex items-center justify-center text-primary-dark hover:bg-surface-2 disabled:text-muted disabled:cursor-not-allowed p-0 rounded-none border-none"
                  icon={<IoAddOutline size={16} />}
                />
              </div>
            )}

            {/* Branded Add to Bag Button */}
            <Button
              type="primary"
              onClick={onAddToBag}
              disabled={!canAddToBag}
              className={`
                h-auto flex items-center gap-2 px-6 py-3 rounded-full transition-all active:scale-95 shadow-custom border-none
                ${
                  canAddToBag
                    ? "bg-dark text-inverse hover:bg-accent hover:text-primary-dark font-black uppercase tracking-widest text-xs"
                    : "bg-surface-3 text-muted cursor-not-allowed font-bold uppercase text-xs"
                }
              `}
              icon={
                <IoBagAdd
                  size={20}
                  className={canAddToBag ? "text-accent" : ""}
                />
              }
            >
              <span className="hidden sm:inline">Add to Bag</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingAddToBag;
