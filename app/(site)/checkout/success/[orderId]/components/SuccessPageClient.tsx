"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { Order } from "@/interfaces";
import SuccessAnimationComponents from "./SuccessAnimationComponents";
import { IoArrowForward } from "react-icons/io5";
import PrepaidFeeBanner from "@/app/(site)/checkout/components/PrepaidFeeBanner";
import PrepaidFeeDecisionModal from "@/app/(site)/checkout/components/PrepaidFeeDecisionModal";
import { submitExternalForm, processDeliveryFeePrepayment } from "@/actions/orderAction";
import toast from "react-hot-toast";
import axiosInstance from "@/actions/axiosInstance";

const emptySubscribe = () => () => {};

export default function SuccessPageClient({ order }: { order: Order }) {
  const [feePaid, setFeePaid] = useState(order?.deliveryFeePrepaid || false);
  const isHighRiskPending = order?.riskStatus === "HIGH_RISK" && !feePaid;
  const [showModal, setShowModal] = useState<boolean>(isHighRiskPending);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const pollCountRef = useRef(0);
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    if (isHighRiskPending) {
      const intervalId = setInterval(async () => {
        pollCountRef.current += 1;
        if (pollCountRef.current > 20) {
          clearInterval(intervalId);
          return;
        }
        
        try {
          const response = await axiosInstance.get(`/web/orders/${order.orderId}/prepaid-status`);
          const statusData = response.data?.data || response.data;
          if (statusData?.deliveryFeePrepaid === true) {
            setFeePaid(true);
            setShowModal(false);
            clearInterval(intervalId);
            toast.success('Delivery fee confirmed! Your order will be dispatched shortly.');
          }
        } catch (error) {
          console.error("Failed to poll prepaid status:", error);
        }
      }, 3000);
      
      return () => clearInterval(intervalId);
    }
  }, [isHighRiskPending, order.orderId]);

  const handlePayFeeNow = async () => {
    if (!order) return;
    try {
      const payhereResponse = await processDeliveryFeePrepayment(order, order.customer);
      submitExternalForm(payhereResponse.actionUrl, payhereResponse.payload);
    } catch (err: any) {
      console.error("Delivery fee prepayment launch error:", err);
      toast.error("Failed to launch delivery fee prepayment. Please try again.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface text-primary">
      {/* Persistent Warning Banner */}
      {isHighRiskPending && (
        <PrepaidFeeBanner order={order} onPayNow={handlePayFeeNow} />
      )}

      {/* Main Success Container */}
      <main className="w-full pt-20 pb-20 px-4 md:px-8 flex flex-col items-center justify-center text-center">
        <div className="w-full max-w-xl animate-fadeIn v2-glass p-8 sm:p-12 rounded-3xl border border-glass-border">
          <SuccessAnimationComponents />

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none mb-3 text-primary m-0">
            Order Confirmed!
          </h1>

          <p className="text-xs sm:text-sm text-secondary font-medium mb-6 leading-relaxed m-0">
            Thank you, <span className="text-primary font-bold">{order.customer?.name?.split(" ")[0]}</span>. Your order is registered &amp; being prepared.
          </p>

          <div className="inline-block px-4 py-1.5 bg-accent/10 border border-accent/30 rounded-full mb-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary m-0">
              Order ID: <span className="text-accent">#{order.orderId}</span>
            </p>
          </div>

          {/* High-Risk Delivery Fee Status Callout */}
          {isHighRiskPending && (
            <div className="w-full bg-warning/10 border border-warning/30 rounded-2xl p-4 mb-8 text-left">
              <p className="text-xs font-bold text-warning mb-1">
                ⚠️ Delivery Fee Prepayment Pending (LKR {order.shippingFee})
              </p>
              <p className="text-[11px] text-secondary leading-relaxed mb-3">
                Your order is safely registered. Complete the LKR {order.shippingFee} online delivery fee payment so our dispatch team can send out your package immediately.
              </p>
              <button
                type="button"
                onClick={handlePayFeeNow}
                className="w-full py-2.5 px-4 bg-warning hover:bg-warning text-inverse font-black uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                Pay LKR {order.shippingFee} Delivery Fee Online
              </button>
            </div>
          )}

          {order?.riskStatus === 'HIGH_RISK' && feePaid && (
            <div className="w-full bg-accent/10 border border-accent/30 rounded-2xl p-4 mb-8 text-left">
              <p className="text-xs font-bold text-accent mb-1">
                ✓ Delivery Fee Paid
              </p>
              <p className="text-[11px] text-secondary leading-relaxed m-0">
                LKR {order.shippingFee} delivery fee has been confirmed. Your order will be dispatched shortly!
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
            <Link
              href="/collections/products"
              className="flex-1 py-3.5 px-6 bg-accent text-inverse font-black uppercase tracking-widest text-xs rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
            >
              <span>Continue Shopping</span>
              <IoArrowForward size={16} />
            </Link>

            <Link
              href="/account"
              className="flex-1 py-3.5 px-6 bg-glass border border-glass-border text-primary font-black uppercase tracking-widest text-xs rounded-full flex items-center justify-center gap-2 hover:border-accent transition-all"
            >
              Go to Account
            </Link>
          </div>

          <p className="mt-8 text-[10px] text-muted font-extrabold uppercase tracking-widest m-0">
            Confirmation receipt sent to {order.customer?.email}
          </p>
        </div>
      </main>

      {/* Interactive High-Risk Decision Modal */}
      {isMounted && (
        <PrepaidFeeDecisionModal
          isOpen={showModal}
          order={order}
          onPayNow={handlePayFeeNow}
          onDismiss={() => {
            setShowModal(false);
            setIsDismissed(true);
          }}
        />
      )}
    </div>
  );
}
