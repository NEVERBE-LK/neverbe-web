"use client";
import Spinner from "@/components/Spinner";

import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Form, Button } from "antd";
import { RootState } from "@/redux/store";
import { IoArrowForward, IoLockClosedOutline } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import BagItemCard from "@/components/BagItemCard";
import CouponInput from "@/components/CouponInput";
import PromotionBanner from "@/components/PromotionBanner";
import {
  calculateFee,
  calculateSubTotal,
  calculateTotal,
  calculateTotalDiscount,
} from "@/utils/bagCalculations";
import { PaymentMethod } from "@/interfaces";
import { BagItem } from "@/interfaces/BagItem";
import PaymentOptions from "./PaymentOptions";
import Image from "next/image";
import axiosInstance from "@/actions/axiosInstance";

interface PaymentDetailsProps {
  paymentType: string;
  setPaymentType: React.Dispatch<React.SetStateAction<string>>;
  setPaymentTypeId: React.Dispatch<React.SetStateAction<string>>;
  setPaymentFee: React.Dispatch<React.SetStateAction<number>>;
  setMerchantFee?: React.Dispatch<React.SetStateAction<number>>;
  selectedPaymentFee: number;
  shippingCost: number;
  isHighRisk?: boolean;
}

interface BundleGroup {
  comboId: string;
  comboName: string;
  items: BagItem[];
  totalPrice: number;
  totalDiscount: number;
}

const BundleCard = ({ bundle }: { bundle: BundleGroup }) => {
  const netPrice = bundle.totalPrice - bundle.totalDiscount;

  return (
    <div className="v2-glass rounded-2xl border border-glass-border overflow-hidden">
      <div className="bg-accent/10 text-accent px-3 py-2 flex justify-between items-center border-b border-glass-border">
        <span className="text-[9px] font-black uppercase tracking-widest text-accent">
          Bundle
        </span>
        <span className="text-[10px] font-black uppercase tracking-wider text-primary">
          {bundle.comboName}
        </span>
      </div>

      <div className="divide-y divide-glass-border">
        {bundle.items.map((item, idx) => (
          <div key={idx} className="flex gap-2 p-2 items-center">
            <div className="relative w-10 h-10 bg-accent-text rounded-xl shrink-0 border border-glass-border overflow-hidden p-0.5">
              <Image
                src={item.thumbnail || ""}
                alt={item.name}
                fill
                className="object-cover rounded-lg"
              />
              <span className="absolute top-0.5 left-0.5 bg-accent text-accent-text text-[7px] font-black px-1 rounded-sm">
                {idx + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase truncate text-primary m-0">
                {item.name}
              </p>
              <p className="text-[9px] text-secondary uppercase font-bold m-0">
                Size: {item.size}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-glass-border px-3 py-2 flex justify-between items-center bg-glass">
        <span className="text-[9px] text-muted uppercase font-bold">
          {bundle.items.length} Items
        </span>
        <div className="text-right">
          {bundle.totalDiscount > 0 && (
            <span className="text-[9px] text-muted line-through mr-2">
              LKR {bundle.totalPrice.toLocaleString()}
            </span>
          )}
          <span className="text-xs font-black text-accent">
            LKR {netPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const FALLBACK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    paymentId: "pm-001",
    name: "CASH ON DELIVERY",
    fee: 0,
    customerFee: 0,
    description:
      "Cash on Delivery allows customers to pay in cash upon receiving their order.",
    status: "Active",
    available: ["Website", "Store"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    paymentId: "pm-006",
    name: "KOKO",
    fee: 12,
    customerFee: 13.5,
    description:
      "Pay in 3 interest-free instalments with Koko for a flexible and affordable shopping experience.",
    status: "Active",
    available: ["Store", "Website"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    paymentId: "pm-003",
    name: "PAYHERE",
    fee: 3.3,
    customerFee: 3.5,
    description: "Securely pay for your orders using a credit or debit card.",
    status: "Active",
    available: ["Website"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  paymentType,
  setPaymentType,
  setPaymentTypeId,
  setPaymentFee,
  setMerchantFee,
  selectedPaymentFee,
  shippingCost,
  isHighRisk,
}) => {
  const [paymentOptions, setPaymentOptions] = useState<PaymentMethod[]>(
    FALLBACK_PAYMENT_METHODS,
  );
  const [isPaymentLoading, setIsPaymentLoading] = useState(true);

  const bagItems = useSelector((state: RootState) => state.bag.bag);
  const couponDiscount =
    useSelector((state: RootState) => state.bag.couponDiscount) || 0;
  const promotionDiscount =
    useSelector((state: RootState) => state.bag.promotionDiscount) || 0;

  const { bundles, regularItems } = useMemo(() => {
    const bundleMap = new Map<string, BundleGroup>();
    const regular: BagItem[] = [];

    bagItems.forEach((item) => {
      if (item.isComboItem && item.comboId) {
        const existing = bundleMap.get(item.comboId);
        const itemTotal = item.price * item.quantity;

        if (existing) {
          existing.items.push(item);
          existing.totalPrice += itemTotal;
          existing.totalDiscount += item.discount;
        } else {
          bundleMap.set(item.comboId, {
            comboId: item.comboId,
            comboName: item.comboName || "Bundle Deal",
            items: [item],
            totalPrice: itemTotal,
            totalDiscount: item.discount,
          });
        }
      } else {
        regular.push(item);
      }
    });

    return { bundles: Array.from(bundleMap.values()), regularItems: regular };
  }, [bagItems]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setIsPaymentLoading(true);
      try {
        const response = await axiosInstance.get("/web/payment-methods");
        const data = response?.data;
        const rawList: any[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.paymentMethods)
            ? data.paymentMethods
            : Array.isArray(data?.payments)
              ? data.payments
              : Array.isArray(data?.data)
                ? data.data
                : [];

        const mappedList: (PaymentMethod & { isActive?: boolean })[] =
          rawList.map((p: any) => {
            const isItemActive =
              p.status === true ||
              p.status === "Active" ||
              p.isActive === true ||
              (p.status !== false && p.isDeleted !== true);

            return {
              paymentId: p.paymentId || p.id || p.name || "",
              name: p.name || p.title || "Payment Method",
              fee: typeof p.fee === "number" ? p.fee : 0,
              customerFee:
                typeof p.customerFee === "number"
                  ? p.customerFee
                  : typeof p.fee === "number"
                    ? p.fee
                    : 0,
              description:
                p.description ||
                p.details ||
                p.subtitle ||
                p.instructions ||
                "",
              imageUrl: p.imageUrl || p.icon || p.logo || p.bannerUrl || "",
              status: isItemActive ? "Active" : "Inactive",
              isActive: isItemActive,
              available: p.available || ["LK"],
              createdAt: p.createdAt || new Date().toISOString(),
              updatedAt: p.updatedAt || new Date().toISOString(),
            };
          });

        const activeList = mappedList.filter((p) => p.isActive !== false);
        const finalList =
          activeList.length > 0 ? activeList : FALLBACK_PAYMENT_METHODS;

        setPaymentOptions(finalList);
        if (finalList.length > 0) {
          setPaymentType(finalList[0].name);
          setPaymentTypeId(finalList[0].paymentId);
          setPaymentFee(finalList[0].customerFee || 0);
          if (setMerchantFee) setMerchantFee(finalList[0].fee || 0);
        }
      } catch (err) {
        console.error(
          "Failed to fetch payment methods from /web/payment-methods:",
          err,
        );
        setPaymentOptions(FALLBACK_PAYMENT_METHODS);
        setPaymentType(FALLBACK_PAYMENT_METHODS[0].name);
        setPaymentTypeId(FALLBACK_PAYMENT_METHODS[0].paymentId);
        setPaymentFee(0);
        if (setMerchantFee) setMerchantFee(0);
      } finally {
        setIsPaymentLoading(false);
      }
    };
    fetchPaymentMethods();
  }, [setPaymentType, setPaymentTypeId, setPaymentFee, setMerchantFee]);

  const rawSubTotal = calculateTotal(bagItems);
  const itemDiscount = calculateTotalDiscount(bagItems);
  const shipping = shippingCost;

  // Fee calculation: customerFee percentage applied to (Total item cost after discounts/promotions + shipping)
  const netItemTotal = Math.max(
    0,
    rawSubTotal - itemDiscount - couponDiscount - promotionDiscount,
  );
  const taxableBase = netItemTotal + shipping;
  const feePercent = selectedPaymentFee || 0;
  const fee = parseFloat((taxableBase * (feePercent / 100)).toFixed(2));

  const finalTotal = taxableBase + fee;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 border-b border-glass-border pb-4">
        <span className="v2-section-label text-[9px] mb-0.5">
          ORDER SUMMARY
        </span>
        <h2 className="text-xl font-black uppercase tracking-tight text-primary m-0">
          Payment &amp; Review
        </h2>
      </div>

      {/* Promotion Banner */}
      <PromotionBanner variant="inline" className="mb-6" />

      {/* Bag Items */}
      <div className="space-y-3 mb-6">
        {bundles.map((bundle) => (
          <BundleCard key={bundle.comboId} bundle={bundle} />
        ))}
        {regularItems.map((item, index) => (
          <BagItemCard
            key={`${item.itemId}-${item.variantId}-${item.size}-${index}`}
            item={item}
            compact
            showRemove
          />
        ))}
      </div>

      {/* Payment Selection */}
      <div className="mb-6 pt-4 border-t border-glass-border">
        <span className="text-[10px] font-black uppercase tracking-widest text-secondary block mb-3">
          Select Payment Method
        </span>
        {isPaymentLoading ? (
          <div className="commerce-loader">
            <Spinner />
          </div>
        ) : (
          <PaymentOptions
            paymentOptions={paymentOptions}
            paymentType={paymentType}
            setPaymentType={setPaymentType}
            setPaymentTypeId={setPaymentTypeId}
            setPaymentFee={setPaymentFee}
            setMerchantFee={setMerchantFee}
            bagItems={bagItems}
            taxableBase={taxableBase}
            isHighRisk={isHighRisk}
          />
        )}
      </div>

      {/* Coupon Section */}
      <div className="mb-6 pt-4 border-t border-glass-border">
        <span className="text-[10px] font-black uppercase tracking-widest text-secondary block mb-3">
          Promo Code
        </span>
        <CouponInput />
      </div>

      {/* Financial Breakdown */}
      <div className="space-y-3 py-4 border-t border-glass-border text-xs font-bold uppercase tracking-wider">
        <div className="flex justify-between text-secondary">
          <span>Subtotal</span>
          <span className="text-primary font-black">
            LKR {rawSubTotal.toLocaleString()}
          </span>
        </div>

        {itemDiscount > 0 && (
          <div className="flex justify-between text-error">
            <span>Item Discounts</span>
            <span className="font-black">
              - LKR {itemDiscount.toLocaleString()}
            </span>
          </div>
        )}

        {promotionDiscount > 0 && (
          <div className="flex justify-between text-warning">
            <span>Promotion</span>
            <span className="font-black">
              - LKR {promotionDiscount.toLocaleString()}
            </span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex justify-between text-accent">
            <span>Coupon</span>
            <span className="font-black">
              - LKR {couponDiscount.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between text-secondary">
          <span>Shipping</span>
          <span className="text-primary font-black">
            {shipping === 0 ? (
              <span className="text-accent">FREE</span>
            ) : (
              `LKR ${shipping}`
            )}
          </span>
        </div>

        {fee > 0 && (
          <div className="flex justify-between text-warning">
            <span>Handling Fee</span>
            <span className="font-black">+ LKR {fee.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Total Section */}
      <div className="border-t border-glass-border pt-4 mb-8 flex justify-between items-end">
        <span className="text-xs font-black uppercase tracking-widest text-primary">
          Total Due
        </span>
        <span className="text-3xl font-black tracking-tight text-accent leading-none">
          LKR {finalTotal.toLocaleString()}
        </span>
      </div>

      {/* Submit Button */}
      <Button
        type="primary"
        htmlType="submit"
        disabled={bagItems.length === 0 || !paymentType}
        className="w-full h-14 rounded-full bg-accent! text-accent-text! font-black uppercase tracking-widest text-xs border-none flex items-center justify-between px-6 cursor-pointer shadow-lg hover:opacity-90 active:scale-95 transition-all"
      >
        <span className="text-accent-text font-black">Complete Order</span>
        <div className="w-8 h-8 rounded-full bg-accent-text text-accent flex items-center justify-center">
          <IoArrowForward size={16} />
        </div>
      </Button>

      {/* Security Footer */}
      <div className="mt-6 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-muted">
          <IoLockClosedOutline size={12} />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted">
            SSL Encrypted Checkout
          </span>
        </div>
        <p className="text-[9px] text-muted leading-relaxed max-w-[280px] mx-auto m-0">
          By placing this order, you agree to Neverbe&apos;s Terms &amp;
          Conditions.
        </p>
      </div>
    </div>
  );
};

export default PaymentDetails;
