"use client";

import React from "react";
import { Modal } from "antd";
import { Order } from "@/interfaces";
import { FiShield, FiAlertTriangle, FiCreditCard, FiX, FiCheckCircle } from "react-icons/fi";

interface PrepaidFeeDecisionModalProps {
  isOpen: boolean;
  order: Order | null;
  onPayNow: () => void;
  onDismiss: () => void;
}

export default function PrepaidFeeDecisionModal({
  isOpen,
  order,
  onPayNow,
  onDismiss,
}: PrepaidFeeDecisionModalProps) {
  if (!order) return null;

  return (
    <Modal
      open={isOpen}
      footer={null}
      closable={false}
      centered
      className="v2-modal prepaid-fee-modal"
      width={460}
      styles={{
        container: {
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-glass-border)",
          borderRadius: "24px",
          padding: "24px",
          color: "var(--color-primary)",
        },
      }}
    >
      <div className="flex flex-col items-center text-center">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-warning/10 border border-warning/30 flex items-center justify-center text-warning mb-4">
          <FiShield size={28} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-black uppercase tracking-tight text-primary mb-2">
          Delivery Prepayment Required
        </h3>

        {/* Order ID Badge */}
        <span className="inline-block px-3 py-1 bg-glass border border-glass-border rounded-full text-xs font-mono text-warning font-bold mb-4">
          Order #{order.orderId}
        </span>

        {/* Message */}
        <p className="text-xs text-secondary font-medium leading-relaxed mb-6">
          Due to delivery risk indicators on past network activity, a{" "}
          <strong className="text-warning font-bold">Rs. {order.shippingFee} Delivery Fee Prepayment</strong>{" "}
          is required online before your Cash-on-Delivery parcel can be dispatched.
        </p>

        {/* Benefit Box */}
        <div className="w-full bg-glass border border-glass-border rounded-xl p-3 mb-6 text-left space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-secondary">
            <FiCheckCircle className="text-success shrink-0" size={14} />
            <span>Pay LKR {order.shippingFee} delivery fee online immediately</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-secondary">
            <FiCheckCircle className="text-success shrink-0" size={14} />
            <span>Pay remaining balance (LKR {((order.total || 0) - (order.shippingFee || 0)).toLocaleString()}) in cash upon delivery</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            type="button"
            onClick={onPayNow}
            className="w-full py-3.5 px-4 bg-accent text-accent-text font-black uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg cursor-pointer border-none"
          >
            <FiCreditCard size={16} />
            <span>Pay LKR {order.shippingFee} Delivery Fee Now</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="w-full py-3 px-4 bg-transparent border border-glass-border text-secondary hover:text-primary hover:border-secondary font-bold uppercase tracking-wider text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <FiX size={14} />
            <span>Pay Later (Keep Pending Banner)</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
