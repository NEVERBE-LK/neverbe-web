"use client";

import React from "react";
import { Order } from "@/interfaces";
import { FiAlertTriangle, FiCreditCard } from "react-icons/fi";

interface PrepaidFeeBannerProps {
  order: Order;
  onPayNow: () => void;
}

export default function PrepaidFeeBanner({ order, onPayNow }: PrepaidFeeBannerProps) {
  const isCOD =
    (order?.paymentMethod || "").toLowerCase().includes("cod") ||
    (order?.paymentMethod || "").toLowerCase().includes("cash on delivery");

  if (!order || !isCOD || order.riskStatus !== "HIGH_RISK" || order.deliveryFeePrepaid) {
    return null;
  }

  return (
    <div className="w-full bg-warning/10 border-b border-warning/30 py-3 px-4 md:px-8 text-primary">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <FiAlertTriangle className="text-warning shrink-0 animate-bounce" size={20} />
          <p className="text-xs font-semibold m-0">
            <strong className="text-warning font-bold">Action Required for Order #{order.orderId}:</strong>{" "}
            Rs. {order.shippingFee} Delivery Fee Prepayment is pending before dispatch.
          </p>
        </div>

        <button
          type="button"
          onClick={onPayNow}
          className="shrink-0 py-2 px-4 bg-warning hover:bg-warning text-inverse font-black uppercase tracking-wider text-[11px] rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <FiCreditCard size={14} />
          <span>Pay LKR {order.shippingFee} Now</span>
        </button>
      </div>
    </div>
  );
}
