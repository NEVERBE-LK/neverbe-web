"use client";
import { formatVariantName } from "@/utils/formatting";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AppDispatch, RootState } from "@/redux/store";
import { Form, Input, Checkbox, Modal, Flex, Row, Col } from "antd";
import {
  FiX,
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiLock,
  FiShoppingBag,
  FiChevronDown,
  FiTruck,
  FiShield,
  FiRefreshCw,
} from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { evaluateCustomerFraudRisk, CompositeRiskResult } from "@/actions/thirdPartyRiskAction";
import CheckoutLoader from "@/components/CheckoutLoader";
import toast from "react-hot-toast";
import { Customer, PaymentMethod } from "@/interfaces";
import { BagItem } from "@/interfaces/BagItem";
import { auth } from "@/firebase/firebaseClient";
import { signInAnonymously } from "firebase/auth";
import { usePayment } from "@/hooks/usePayment";
import usePromotions from "@/hooks/usePromotions";
import axiosInstance from "@/actions/axiosInstance";
import PrepaidFeeDecisionModal from "./PrepaidFeeDecisionModal";
import PrepaidFeeBanner from "./PrepaidFeeBanner";
import PaymentOptions from "./PaymentOptions";
import CouponInput from "@/components/CouponInput";
import PromotionBanner from "@/components/PromotionBanner";
import { KOKOLogo } from "@/assets/images";
import { DELIVERY_ESTIMATE } from "@/config/shipping";
import { currentShippingCost, parseShippingCost, type ShippingQuote } from "@/utils/shippingQuote";

const formatSriLankanPhoneNumber = (phone: string) => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return `+94${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith("94") && cleaned.length === 11) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 9) {
    return `+94${cleaned}`;
  }
  return phone;
};

const createCustomerFromForm = (values: any): Customer => {
  const name = `${values.first_name || ""} ${values.last_name || ""}`.trim();
  return {
    name,
    email: values.email || "",
    phone: formatSriLankanPhoneNumber(values.phone || ""),
    address: values.address || "",
    city: values.city || "",
    zip: values.zip || "",
    id: window.crypto.randomUUID().toLowerCase(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

interface BundleGroup {
  comboId: string;
  comboName: string;
  items: BagItem[];
  totalPrice: number;
  totalDiscount: number;
}

const FALLBACK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    paymentId: "pm-001",
    name: "CASH ON DELIVERY",
    fee: 0,
    customerFee: 0,
    description: "Pay with cash when your package is delivered to your doorstep.",
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
    description: "Pay in 3 interest-free instalments with Koko debit card.",
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
    description: "Secure online payment with Visa, Mastercard, Amex, or mobile wallets.",
    status: "Active",
    available: ["Website"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const CheckoutForm = () => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const [form] = Form.useForm();

  usePromotions();

  const bagItems = useSelector((state: RootState) => state.bag.bag);
  const couponDiscount = useSelector(
    (state: RootState) => state.bag.couponDiscount,
  ) || 0;
  const promotionDiscount =
    useSelector((state: RootState) => state.bag.promotionDiscount) || 0;
  const promotionIds = useSelector(
    (state: RootState) => state.bag.promotionIds,
  );
  const user = auth?.currentUser;

  const [paymentOptions, setPaymentOptions] = useState<PaymentMethod[]>(FALLBACK_PAYMENT_METHODS);
  const [isPaymentLoading, setIsPaymentLoading] = useState(true);
  const [paymentType, setPaymentType] = useState<string>("CASH ON DELIVERY");
  const [paymentTypeId, setPaymentTypeId] = useState<string>("pm-001");
  const [paymentFee, setPaymentFee] = useState<number>(0);
  const [merchantFee, setMerchantFee] = useState<number>(0);

  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(true);
  const [saveAddress, setSaveAddress] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Fraud Risk Check State
  const [riskResult, setRiskResult] = useState<CompositeRiskResult | null>(null);
  const [isEvaluatingRisk, setIsEvaluatingRisk] = useState(false);

  // Dynamic vertical centering for Order Summary sidebar
  const summaryRef = React.useRef<HTMLDivElement>(null);
  const [summaryTop, setSummaryTop] = useState<number | null>(null);

  useEffect(() => {
    const updateSummaryPosition = () => {
      if (summaryRef.current && typeof window !== "undefined") {
        const headerEl = document.querySelector(".sport-header") as HTMLElement | null;
        const headerHeight = headerEl ? headerEl.offsetHeight : 125;
        const cardHeight = summaryRef.current.offsetHeight;
        if (cardHeight < 100) return;
        const windowHeight = window.innerHeight;
        const visibleHeight = windowHeight - headerHeight;
        const margin = Math.round((visibleHeight - cardHeight) / 2);
        // Ensure top is at least headerHeight + 16px so it never overlaps the header
        const centered = Math.max(headerHeight + 16, headerHeight + margin);
        setSummaryTop(centered);
      }
    };

    updateSummaryPosition();
    window.addEventListener("resize", updateSummaryPosition);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && summaryRef.current) {
      observer = new ResizeObserver(updateSummaryPosition);
      observer.observe(summaryRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateSummaryPosition);
      observer?.disconnect();
    };
  }, [bagItems, couponDiscount, promotionDiscount]);

  // Fetch active payment methods from backend
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const res = await axiosInstance.get("/web/payment-methods");
        if (res.data?.success && res.data?.data?.length) {
          setPaymentOptions(res.data.data);
          const defaultOpt = res.data.data.find(
            (opt: PaymentMethod) => opt.name.toLowerCase().includes("cash on delivery") || opt.name.toLowerCase().includes("cod")
          ) || res.data.data[0];

          if (defaultOpt) {
            setPaymentType(defaultOpt.name);
            setPaymentTypeId(defaultOpt.paymentId);
            setPaymentFee(defaultOpt.customerFee || 0);
            if (defaultOpt.fee) setMerchantFee(defaultOpt.fee);
          }
        }
      } catch (e) {
        console.warn("Using fallback payment methods", e);
      } finally {
        setIsPaymentLoading(false);
      }
    };
    fetchPaymentMethods();
  }, []);

  const evaluateFullFraudRisk = async (overrideValues?: any): Promise<CompositeRiskResult | null> => {
    const formValues = overrideValues || form.getFieldsValue();
    if (!formValues.phone && !formValues.email && !formValues.address) return null;
    setIsEvaluatingRisk(true);
    try {
      const payload = {
        phone: formValues.phone || "",
        email: formValues.email || "",
        first_name: formValues.first_name || "",
        last_name: formValues.last_name || "",
        address: formValues.address || "",
        city: formValues.city || "",
        zip: formValues.zip || "",
      };

      let resData: CompositeRiskResult | null = null;
      try {
        const apiRes = await axiosInstance.post("/web/fraud-check", payload);
        if (apiRes.data?.success && apiRes.data?.data) {
          resData = apiRes.data.data;
        }
      } catch (apiErr) {
        console.warn("[CheckoutForm] Web API /web/fraud-check fallback to server action:", apiErr);
      }

      if (!resData) {
        resData = await evaluateCustomerFraudRisk(payload);
      }

      setRiskResult(resData);
      return resData;
    } catch (e) {
      console.warn("Fraud evaluation error", e);
      return null;
    } finally {
      setIsEvaluatingRisk(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("[CheckoutAuth] Anonymous sign-in failed:", error);
        toast.error("Authentication failed. Please refresh the page.");
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const initialCustomerState: Customer = {
    id: user?.uid || "",
    name: user?.displayName || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    address: "",
    city: "",
    zip: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const [billingCustomer, setBillingCustomer] = useState<Customer>(initialCustomerState);
  const [shippingCustomer, setShippingCustomer] = useState<Partial<Customer> | null>(null);
  const shippingKey = useMemo(() => JSON.stringify({ items: bagItems }), [bagItems]);
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote>({ key: "", status: "loading" });
  const [shippingRetry, setShippingRetry] = useState(0);
  const shippingCost = currentShippingCost(shippingQuote, shippingKey);
  const shippingError = shippingQuote.key === shippingKey && shippingQuote.status === "error";
  const shippingLabel = shippingCost === null
    ? shippingError ? "Unavailable" : "Calculating…"
    : shippingCost === 0 ? "FREE" : `LKR ${shippingCost.toLocaleString("en-LK")}`;

  useEffect(() => {
    const controller = new AbortController();
    const fetchShipping = async () => {
      try {
        const formData = new FormData();
        formData.append("data", shippingKey);
        const res = await axiosInstance.post("/web/shipping/calculate", formData, { signal: controller.signal, timeout: 10000 });
        const cost = parseShippingCost(res.data?.cost);
        if (cost === null) throw new Error("Invalid shipping quote");
        if (!controller.signal.aborted) setShippingQuote({ key: shippingKey, status: "ready", cost });
      } catch (error) {
        if (!controller.signal.aborted) {
          setShippingQuote({ key: shippingKey, status: "error" });
          console.error("Failed to fetch shipping cost", error);
        }
      }
    };
    void fetchShipping();
    return () => controller.abort();
  }, [shippingKey, shippingRetry]);

  const {
    isProcessing,
    otpState,
    calculateTotals,
    buildOrderPayload,
    processPayment,
    handleOTPVerification,
    handleResendOTP,
    closeOTPModal,
    openOTPModal,
    prepaidFeeState,
    payPrepaidFeeNow,
    dismissPrepaidFeeModal,
  } = usePayment({
    paymentMethodId: paymentTypeId,
    paymentMethodName: paymentType,
    paymentFee: paymentFee,
    merchantFee: merchantFee,
  });

  const [otp, setOtp] = useState("");

  useEffect(() => {
    const fetchAutofill = async () => {
      if (user && !user.isAnonymous) {
        try {
          const token = await auth.currentUser?.getIdToken();
          const res = await axiosInstance.get("/web/customers/autofill", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.data?.billing) {
            const { billing } = res.data;
            setBillingCustomer((prev) => ({
              ...prev,
              address: billing.address || "",
              city: billing.city || "",
              phone: billing.phone || "",
            }));
            form.setFieldsValue({
              address: billing.address || "",
              city: billing.city || "",
              phone: billing.phone || "",
            });
          }
        } catch (e) {
          console.warn("Autofill fetch error", e);
        }
      }
    };
    fetchAutofill();
  }, [user, form]);

  // Group items by bundle
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

  const rawSubTotal = useMemo(
    () => bagItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [bagItems],
  );
  const itemDiscount = useMemo(
    () => bagItems.reduce((acc, item) => acc + item.discount, 0),
    [bagItems],
  );
  const netItemTotal = Math.max(
    0,
    rawSubTotal - itemDiscount - couponDiscount - promotionDiscount,
  );
  const taxableBase = netItemTotal + (shippingCost ?? 0);
  const feePercent = paymentFee || 0;
  const fee = parseFloat((taxableBase * (feePercent / 100)).toFixed(2));
  const finalTotal = taxableBase + fee;
  const totalLabel = shippingCost === null ? "Awaiting delivery quote" : `LKR ${finalTotal.toLocaleString("en-LK")}`;
  const kokoInstallment = Math.round(finalTotal / 3);

  const totalQuantity = useMemo(
    () => bagItems.reduce((sum, item) => sum + item.quantity, 0),
    [bagItems],
  );

  const handlePaymentSubmit = async () => {
    try {
      if (shippingCost === null) {
        toast.error("Please wait for the delivery quote, or retry if it could not be loaded.");
        return;
      }
      await form.validateFields();
      const values = form.getFieldsValue(true);

      if (otpState.pendingOrder) {
        openOTPModal();
        return;
      }

      const newBilling = createCustomerFromForm(values);
      const userId = user?.uid || null;

      const orderCustomer: Customer = {
        ...newBilling,
        ...(shippingSameAsBilling
          ? {
              shippingName: newBilling.name,
              shippingAddress: newBilling.address,
              shippingCity: newBilling.city,
              shippingZip: newBilling.zip,
              shippingPhone: newBilling.phone,
            }
          : {
              shippingName: values.shippingName || shippingCustomer?.shippingName || newBilling.name,
              shippingAddress: values.shippingAddress || shippingCustomer?.shippingAddress || newBilling.address,
              shippingCity: values.shippingCity || shippingCustomer?.shippingCity || newBilling.city,
              shippingZip: values.shippingZip || shippingCustomer?.shippingZip || newBilling.zip,
              shippingPhone: values.shippingPhone || shippingCustomer?.shippingPhone || newBilling.phone,
            }),
      };

      let currentRisk = riskResult;
      if (!currentRisk) {
        currentRisk = await evaluateFullFraudRisk(values);
      }

      const totals = calculateTotals(
        bagItems,
        couponDiscount,
        promotionDiscount,
        shippingCost,
      );

      const newOrder = buildOrderPayload(
        orderCustomer,
        bagItems,
        totals,
        userId,
        {
          appliedPromotionId: promotionIds[0] || null,
          appliedPromotionIds: promotionIds,
        },
        values.delivery_instructions,
        currentRisk?.isHighRisk
          ? {
              riskStatus: "HIGH_RISK",
              ipqsFraudScore: currentRisk.fraudScore,
              ipqsRiskLevel: currentRisk.riskLevel,
              ipqsLineType: currentRisk.lineType,
              ipqsReasons: currentRisk.reasons,
            }
          : undefined,
      );

      await processPayment(newOrder, orderCustomer);
    } catch (err: any) {
      if (err?.errorFields) {
        toast.error("Please fill in all required contact and shipping fields.");
      } else {
        console.error("Payment Submission Error:", err);
        toast.error("Failed to process order. Please try again.");
      }
    }
  };

  if (isCheckingAuth || !user) {
    return <CheckoutLoader />;
  }

  if (bagItems.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center border border-glass-border">
          <FiShoppingBag size={32} className="text-secondary" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-primary mb-2">
          Your bag is empty
        </h2>
        <p className="text-sm text-secondary mb-8 max-w-md mx-auto leading-relaxed">
          Looks like you haven&apos;t added any gear to your rotation yet. Explore our footwear and apparel to get started.
        </p>
        <Link
          href="/collections/new-arrivals"
          className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-accent text-accent-text font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-md"
        >
          Explore New Arrivals <FiArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Minimal Distraction-Free Checkout Header */}
      <header className="flex items-center justify-between pb-6 mb-6 sm:mb-8 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xl sm:text-2xl font-black uppercase tracking-tight text-primary hover:opacity-80 transition-opacity"
          >
            NEVERBE
          </Link>
          <span className="text-muted text-sm font-light">/</span>
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-secondary">
            Checkout
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 text-secondary">
            <FiLock size={13} className="text-accent" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">
              Secure Checkout
            </span>
          </div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-secondary hover:text-primary transition-colors"
          >
            <span>Return to bag</span>
            <FiArrowRight size={13} />
          </Link>
        </div>
      </header>

      {/* Mobile Collapsible Order Summary Bar */}
      <div className="lg:hidden mb-6 rounded-2xl border border-glass-border overflow-hidden bg-surface transition-all">
        <button
          type="button"
          onClick={() => setShowMobileSummary(!showMobileSummary)}
          className="w-full py-4 px-5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-primary cursor-pointer hover:bg-surface-2 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <FiShoppingBag size={17} className="text-secondary" />
            <span className="text-primary font-black">
              {showMobileSummary ? "Hide order summary" : `Order summary (${totalQuantity})`}
            </span>
            <FiChevronDown
              size={15}
              className={`text-secondary transition-transform duration-300 ${
                showMobileSummary ? "rotate-180" : ""
              }`}
            />
          </div>
          <span className="font-black text-sm text-primary">
            {totalLabel}
          </span>
        </button>

        {showMobileSummary && (
          <div className="p-5 border-t border-glass-border space-y-5 bg-void/50">
            {/* Items */}
            <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
              {bundles.map((bundle) => (
                <div
                  key={bundle.comboId}
                  className="p-3 rounded-xl border border-glass-border bg-surface space-y-2"
                >
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-accent">
                    <span>Bundle Deal</span>
                    <span className="text-primary">{bundle.comboName}</span>
                  </div>
                  {bundle.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg bg-surface border border-glass-border overflow-hidden shrink-0">
                        <Image src={item.thumbnail || "/collection-placeholder.png"} alt={item.name} fill className="object-cover" />
                        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-accent text-accent-text text-[9px] font-black flex items-center justify-center px-1">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-primary truncate m-0">{item.name}</p>
                        <p className="text-[11px] text-secondary m-0">Size: {item.size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {regularItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3.5">
                  <div className="relative w-14 h-16 rounded-xl bg-surface border border-glass-border overflow-hidden shrink-0">
                    <Image src={item.thumbnail || "/collection-placeholder.png"} alt={item.name} fill className="object-cover" />
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] rounded-full bg-accent text-accent-text text-[10px] font-black flex items-center justify-center px-1 shadow-sm">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-primary truncate m-0">{item.name}</p>
                    <p className="text-[11px] text-secondary font-medium m-0">Size: {item.size}</p>
                    {item.variantName && item.variantName !== item.size && (
                      <p className="text-[10px] text-muted m-0">{formatVariantName(item.variantName)}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-primary m-0">
                      LKR {Math.max(0, item.price * item.quantity - item.discount).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code */}
            <CouponInput />

            {/* Cost Breakdown */}
            <div className="pt-4 border-t border-glass-border space-y-2.5 text-xs">
              <div className="flex justify-between text-secondary">
                <span>Subtotal</span>
                <span className="font-bold text-primary">LKR {rawSubTotal.toLocaleString()}</span>
              </div>
              {itemDiscount > 0 && (
                <div className="flex justify-between text-accent font-bold">
                  <span>Product Savings</span>
                  <span>- LKR {itemDiscount.toLocaleString()}</span>
                </div>
              )}
              {promotionDiscount > 0 && (
                <div className="flex justify-between text-accent font-bold">
                  <span>Promotions</span>
                  <span>- LKR {promotionDiscount.toLocaleString()}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-accent font-bold">
                  <span>Coupon</span>
                  <span>- LKR {couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-secondary">
                <span>Shipping</span>
                <span className="font-bold text-primary">
                  {shippingLabel}
                </span>
              </div>
              {fee > 0 && (
                <div className="flex justify-between text-secondary">
                  <span>Payment Handling</span>
                  <span className="font-bold text-primary">+ LKR {fee.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-glass-border flex justify-between items-baseline">
                <span className="text-xs font-black uppercase tracking-wider text-primary">Total</span>
                <span className="text-xl font-black text-primary">{totalLabel}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <Form
        form={form}
        layout="vertical"
        preserve={true}
        onFinish={handlePaymentSubmit}
        requiredMark={false}
        initialValues={{
          first_name: billingCustomer?.name?.split(" ")[0] || "",
          last_name: billingCustomer?.name?.split(" ").slice(1).join(" ") || "",
          address: billingCustomer?.address || "",
          city: billingCustomer?.city || "",
          zip: billingCustomer?.zip || "",
          email: billingCustomer?.email || "",
          phone: billingCustomer?.phone || "",
          country: "Sri Lanka",
        }}
        className="w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: Customer Information, Shipping & Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* Breadcrumb Steps */}
            <nav aria-label="Checkout Progress" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted">
              <Link href="/cart" className="hover:text-primary transition-colors">
                Bag
              </Link>
              <span>/</span>
              <span className="text-primary font-black">Information &amp; Delivery</span>
              <span>/</span>
              <span className="text-muted">Payment</span>
            </nav>

            {/* 1. Contact Information */}
            <div className="p-6 sm:p-7 rounded-2xl bg-surface border border-glass-border space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-glass-border pb-3.5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted block mb-0.5">
                    Step 1 of 3
                  </span>
                  <h2 className="text-base font-black uppercase tracking-tight text-primary m-0">
                    Contact Details
                  </h2>
                </div>
                {(!user || user.isAnonymous) && (
                  <Link
                    href="/account/login?redirect=/checkout"
                    className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                  >
                    <span>Log in</span>
                    <FiArrowRight size={12} />
                  </Link>
                )}
              </div>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label={
                      <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                        Email Address <span className="text-error ml-0.5">*</span>
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please enter your email" },
                      { type: "email", message: "Enter a valid email address" },
                    ]}
                  >
                    <Input
                      placeholder="e.g. alex@example.com"
                      className="h-12 rounded-xl bg-void! border-glass-border! text-primary! font-medium text-xs"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="phone"
                    label={
                      <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                        Mobile Phone <span className="text-error ml-0.5">*</span>
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please enter your phone number" },
                    ]}
                  >
                    <Input
                      placeholder="e.g. 077 123 4567"
                      onBlur={(e) => {
                        const formatted = formatSriLankanPhoneNumber(e.target.value);
                        form.setFieldsValue({ phone: formatted });
                        evaluateFullFraudRisk();
                      }}
                      className="h-12 rounded-xl bg-void! border-glass-border! text-primary! font-medium text-xs"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <p className="text-[11px] text-muted m-0 leading-relaxed">
                Order confirmation, delivery tracking, and SMS updates will be sent to these details.
              </p>
            </div>

            {/* 2. Shipping Address */}
            <div className="p-6 sm:p-7 rounded-2xl bg-surface border border-glass-border space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-glass-border pb-3.5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted block mb-0.5">
                    Step 2 of 3
                  </span>
                  <h2 className="text-base font-black uppercase tracking-tight text-primary m-0">
                    Delivery Address
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-void border border-glass-border text-[10px] font-bold text-secondary">
                  Sri Lanka · LKR
                </span>
              </div>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="first_name"
                    label={
                      <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                        First Name <span className="text-error ml-0.5">*</span>
                      </span>
                    }
                    rules={[{ required: true, message: "First name is required" }]}
                  >
                    <Input
                      placeholder="First name"
                      className="h-12 rounded-xl bg-void! border-glass-border! text-primary! font-medium text-xs"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="last_name"
                    label={
                      <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                        Last Name <span className="text-error ml-0.5">*</span>
                      </span>
                    }
                    rules={[{ required: true, message: "Last name is required" }]}
                  >
                    <Input
                      placeholder="Last name"
                      className="h-12 rounded-xl bg-void! border-glass-border! text-primary! font-medium text-xs"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    name="address"
                    label={
                      <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                        Street Address <span className="text-error ml-0.5">*</span>
                      </span>
                    }
                    rules={[{ required: true, message: "Street address is required" }]}
                  >
                    <Input
                      placeholder="House / building number, street name"
                      className="h-12 rounded-xl bg-void! border-glass-border! text-primary! font-medium text-xs"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={14}>
                  <Form.Item
                    name="city"
                    label={
                      <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                        City / District <span className="text-error ml-0.5">*</span>
                      </span>
                    }
                    rules={[{ required: true, message: "City is required" }]}
                  >
                    <Input
                      placeholder="e.g. Colombo, Kandy, Galle"
                      className="h-12 rounded-xl bg-void! border-glass-border! text-primary! font-medium text-xs"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={10}>
                  <Form.Item
                    name="zip"
                    label={
                      <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                        Postal Code
                      </span>
                    }
                  >
                    <Input
                      placeholder="e.g. 00700"
                      className="h-12 rounded-xl bg-void! border-glass-border! text-primary! font-medium text-xs"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    name="delivery_instructions"
                    label={
                      <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                        Delivery Notes (Optional)
                      </span>
                    }
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="Special instructions for the courier (e.g. landmark, gate code, call before delivery)"
                      className="rounded-xl bg-void! border-glass-border! text-primary! font-medium text-xs p-3"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div>
                <Checkbox
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="text-xs font-semibold text-secondary"
                >
                  Save this information for faster checkout next time
                </Checkbox>
              </div>
            </div>

            {/* 3. Shipping Method */}
            <div className="p-6 sm:p-7 rounded-2xl bg-surface border border-glass-border space-y-4 shadow-xs">
              <div className="border-b border-glass-border pb-3.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted block mb-0.5">
                  Shipping Option
                </span>
                <h2 className="text-base font-black uppercase tracking-tight text-primary m-0">
                  Delivery Method
                </h2>
              </div>

              <div className="p-4 rounded-xl border border-accent bg-accent/5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full border-2 border-accent bg-accent text-accent-text flex items-center justify-center shrink-0 mt-0.5">
                    <FiCheckCircle size={13} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-primary m-0 flex items-center gap-2">
                      <FiTruck size={14} className="text-accent" />
                      Standard Tracked Delivery (Sri Lanka)
                    </p>
                    <p className="text-[11px] text-secondary m-0 mt-0.5">
                      Estimated delivery · {DELIVERY_ESTIMATE}, depending on location
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black uppercase tracking-wider text-primary">
                    {shippingLabel}
                  </span>
                </div>
              </div>
              {shippingError && (
                <div role="alert" className="text-sm text-secondary">
                  We could not calculate delivery. Your order has not been submitted.{" "}
                  <button type="button" className="underline font-bold" onClick={() => {
                    setShippingQuote({ key: shippingKey, status: "loading" });
                    setShippingRetry((value) => value + 1);
                  }}>
                    Retry delivery quote
                  </button>
                </div>
              )}
            </div>

            {/* 4. Payment Method */}
            <div className="p-6 sm:p-7 rounded-2xl bg-surface border border-glass-border space-y-5 shadow-xs">
              <div className="border-b border-glass-border pb-3.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted block mb-0.5">
                  Step 3 of 3
                </span>
                <h2 className="text-base font-black uppercase tracking-tight text-primary m-0">
                  Payment Method
                </h2>
                <p className="text-[11px] text-secondary m-0 mt-1">
                  All transactions are secure, encrypted, and processed instantly.
                </p>
              </div>

              {riskResult?.isHighRisk && (
                <div className="bg-error/10 border border-error/30 rounded-xl p-4 flex items-start gap-3 text-error">
                  <FiAlertTriangle className="text-error shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider m-0">
                      High Return Risk Flagged
                    </p>
                    <p className="text-[11px] mt-1 font-medium leading-relaxed m-0 text-secondary">
                      {riskResult.noticeMessage ||
                        "Due to high delivery return risk detected, a nominal delivery fee prepayment is required for COD orders."}
                    </p>
                  </div>
                </div>
              )}

              {isPaymentLoading ? (
                <div className="p-8 rounded-xl bg-void border border-glass-border flex items-center justify-center gap-3">
                  <AiOutlineLoading3Quarters size={18} className="text-accent animate-spin" />
                  <span className="text-xs font-bold text-secondary">Loading payment options...</span>
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
                  isHighRisk={riskResult?.isHighRisk}
                />
              )}

              {/* Billing Address Toggle */}
              <div className="pt-4 border-t border-glass-border space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary block">
                  Billing Address
                </span>
                <div className="space-y-2">
                  <label
                    onClick={() => setShippingSameAsBilling(true)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      shippingSameAsBilling
                        ? "border-accent bg-accent/5 font-bold text-primary"
                        : "border-glass-border bg-void text-secondary hover:border-glass-border-hover"
                    }`}
                  >
                    <input
                      type="radio"
                      name="billingOption"
                      checked={shippingSameAsBilling}
                      onChange={() => setShippingSameAsBilling(true)}
                      className="accent-accent"
                    />
                    <span className="text-xs">Same as shipping address</span>
                  </label>

                  <label
                    onClick={() => setShippingSameAsBilling(false)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      !shippingSameAsBilling
                        ? "border-accent bg-accent/5 font-bold text-primary"
                        : "border-glass-border bg-void text-secondary hover:border-glass-border-hover"
                    }`}
                  >
                    <input
                      type="radio"
                      name="billingOption"
                      checked={!shippingSameAsBilling}
                      onChange={() => setShippingSameAsBilling(false)}
                      className="accent-accent"
                    />
                    <span className="text-xs">Use a different billing address</span>
                  </label>
                </div>

                {!shippingSameAsBilling && (
                  <div className="p-4 rounded-xl border border-glass-border bg-void space-y-4 mt-3 animate-fadeIn">
                    <Row gutter={[16, 0]}>
                      <Col xs={24}>
                        <Form.Item
                          name="shippingName"
                          label={<span className="text-[10px] font-bold uppercase text-secondary">Billing Name</span>}
                        >
                          <Input placeholder="Full billing name" className="h-11 rounded-lg bg-surface text-xs" />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          name="shippingAddress"
                          label={<span className="text-[10px] font-bold uppercase text-secondary">Billing Address</span>}
                        >
                          <Input placeholder="Billing street address" className="h-11 rounded-lg bg-surface text-xs" />
                        </Form.Item>
                      </Col>
                      <Col xs={14}>
                        <Form.Item
                          name="shippingCity"
                          label={<span className="text-[10px] font-bold uppercase text-secondary">City</span>}
                        >
                          <Input placeholder="City" className="h-11 rounded-lg bg-surface text-xs" />
                        </Form.Item>
                      </Col>
                      <Col xs={10}>
                        <Form.Item
                          name="shippingZip"
                          label={<span className="text-[10px] font-bold uppercase text-secondary">Postal Code</span>}
                        >
                          <Input placeholder="Postal code" className="h-11 rounded-lg bg-surface text-xs" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                )}
              </div>
            </div>

            {/* Complete Order Button on Main Flow */}
            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={isProcessing || bagItems.length === 0 || !paymentType || shippingCost === null}
                className="w-full h-15 rounded-full bg-accent text-accent-text font-black uppercase tracking-widest text-xs flex items-center justify-between px-8 cursor-pointer shadow-xl hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none"
              >
                <span className="flex items-center gap-2">
                  <FiLock size={15} />
                  <span>{isProcessing ? "Processing Order..." : "Complete Order"}</span>
                </span>
                <span className="text-sm font-black tracking-tight">
                  {totalLabel}
                </span>
              </button>

              {/* Trust Badges Bar */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-glass-border text-center text-secondary">
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface/60 border border-glass-border">
                  <FiLock size={16} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">Secure Checkout</span>
                  <span className="text-[9px] text-muted">Bank-grade encryption</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface/60 border border-glass-border">
                  <FiRefreshCw size={16} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">7-Day Exchange</span>
                  <span className="text-[9px] text-muted">Hassle-free sizing</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface/60 border border-glass-border">
                  <FiShield size={16} className="text-primary" />
                  <Link href="/contact" className="text-[10px] font-black uppercase tracking-wider text-primary underline">Need Help?</Link>
                  <span className="text-[9px] text-muted">Contact our team</span>
                </div>
              </div>

              {/* Policy Footer Links */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4 text-[11px] text-muted">
                <Link href="/policies/privacy-policy" target="_blank" className="hover:text-primary underline">
                  Privacy Policy
                </Link>
                <span>·</span>
                <Link href="/policies/shipping-return-policy" target="_blank" className="hover:text-primary underline">
                  Shipping &amp; Returns
                </Link>
                <span>·</span>
                <Link href="/policies/terms-conditions" target="_blank" className="hover:text-primary underline">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Order Summary (Vertically Centered in Viewport) */}
          <aside
            className="hidden lg:block lg:col-span-5 commerce-checkout-summary-sticky transition-[top] duration-150"
            style={summaryTop !== null ? { top: `${summaryTop}px` } : undefined}
          >
            <div
              ref={summaryRef}
              className="p-6 lg:p-7 rounded-2xl bg-surface border border-glass-border space-y-6 shadow-sm overflow-y-auto"
              style={{
                maxHeight: summaryTop !== null
                  ? `calc(100vh - ${summaryTop + 20}px)`
                  : "calc(100vh - 160px)",
              }}
            >
              <div className="flex items-center justify-between border-b border-glass-border pb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-primary m-0 flex items-center gap-2">
                  <FiShoppingBag size={17} />
                  <span>Order Summary</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-void border border-glass-border text-[11px] font-bold text-secondary">
                  {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Promotional Highlight */}
              <PromotionBanner variant="inline" />

              {/* Items List */}
              <div className="space-y-3.5 max-h-[260px] xl:max-h-[320px] overflow-y-auto pr-1">
                {bundles.map((bundle) => (
                  <div
                    key={bundle.comboId}
                    className="p-3.5 rounded-xl border border-glass-border bg-void space-y-2.5"
                  >
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-accent">
                      <span>Bundle Deal</span>
                      <span className="text-primary font-bold">{bundle.comboName}</span>
                    </div>
                    {bundle.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="relative w-12 h-14 rounded-lg bg-surface border border-glass-border overflow-hidden shrink-0">
                          <Image src={item.thumbnail || "/collection-placeholder.png"} alt={item.name} fill className="object-cover" />
                          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-accent text-accent-text text-[9px] font-black flex items-center justify-center px-1">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-primary truncate m-0">{item.name}</p>
                          <p className="text-[10px] text-secondary m-0">Size: {item.size}</p>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-glass-border flex justify-between text-xs font-bold">
                      <span className="text-secondary text-[11px]">Bundle Price</span>
                      <span className="text-accent font-black">
                        LKR {(bundle.totalPrice - bundle.totalDiscount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}

                {regularItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3.5">
                    <div className="relative w-16 h-18 rounded-xl bg-void border border-glass-border overflow-hidden shrink-0">
                      <Image src={item.thumbnail || "/collection-placeholder.png"} alt={item.name} fill className="object-cover" />
                      <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] rounded-full bg-accent text-accent-text text-[10px] font-black flex items-center justify-center px-1 shadow-sm">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-primary truncate m-0 leading-snug">{item.name}</p>
                      <p className="text-[11px] text-secondary font-medium m-0 mt-0.5">Size: {item.size}</p>
                      {item.variantName && item.variantName !== item.size && (
                        <p className="text-[10px] text-muted m-0">{formatVariantName(item.variantName)}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-primary m-0">
                        LKR {Math.max(0, item.price * item.quantity - item.discount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Box */}
              <div className="pt-2 border-t border-glass-border">
                <span className="text-[10px] font-black uppercase tracking-wider text-secondary block mb-2">
                  Discount Code
                </span>
                <CouponInput />
              </div>

              {/* Cost Breakdown */}
              <div className="pt-4 border-t border-glass-border space-y-2.5 text-xs font-medium">
                <div className="flex justify-between text-secondary">
                  <span>Subtotal</span>
                  <span className="font-bold text-primary">LKR {rawSubTotal.toLocaleString()}</span>
                </div>

                {itemDiscount > 0 && (
                  <div className="flex justify-between text-accent font-bold">
                    <span>Product Savings</span>
                    <span>- LKR {itemDiscount.toLocaleString()}</span>
                  </div>
                )}

                {promotionDiscount > 0 && (
                  <div className="flex justify-between text-accent font-bold">
                    <span>Promotional Discount</span>
                    <span>- LKR {promotionDiscount.toLocaleString()}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-accent font-bold">
                    <span>Coupon Applied</span>
                    <span>- LKR {couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-secondary">
                  <span>Shipping</span>
                  <span className="font-bold text-primary">
                    {shippingLabel}
                  </span>
                </div>

                {fee > 0 && (
                  <div className="flex justify-between text-secondary">
                    <span>Payment Fee</span>
                    <span className="font-bold text-primary">+ LKR {fee.toFixed(2)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="pt-4 border-t border-glass-border flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-primary block">
                      Total Due
                    </span>
                    <span className="text-[10px] text-muted">Including taxes &amp; delivery</span>
                  </div>
                  <span className="text-2xl font-black text-primary tracking-tight">
                    {totalLabel}
                  </span>
                </div>

                {/* Koko Note */}
                <div className="p-3 rounded-xl bg-void border border-glass-border flex items-center justify-between gap-2 text-[11px] text-secondary mt-3">
                  <span>{shippingCost === null ? "Instalment total available after delivery quote" : <>or 3 payments of <strong>LKR {kokoInstallment.toLocaleString()}</strong> with</>}</span>
                  <Image src={KOKOLogo} alt="Koko" width={38} height={16} className="object-contain" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Form>

      {/* OTP Verification Modal */}
      <Modal
        open={otpState.showModal && !!otpState.pendingOrder}
        onCancel={() => {
          closeOTPModal();
          setOtp("");
        }}
        footer={null}
        centered
        width={420}
        closeIcon={<FiX size={20} className="text-primary" />}
        maskClosable={false}
        className="v2-modal"
        styles={{
          container: {
            padding: "32px",
            borderRadius: "24px",
            background: "var(--color-surface)",
            border: "1px solid var(--color-glass-border)",
            color: "var(--color-primary)",
          },
          mask: {
            backdropFilter: "blur(16px)",
            background: "var(--v2-backdrop-bg)",
          },
        }}
      >
        <Flex vertical align="center" gap={8} className="text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted">SECURITY VERIFICATION</span>
          <h2 className="text-xl font-black uppercase tracking-tight text-primary m-0">
            Verify Number
          </h2>
          <p className="text-xs text-secondary font-medium m-0">
            Enter the 6-digit code sent to {otpState.pendingOrder?.customer.phone}
          </p>

          <Flex vertical gap={16} className="w-full mt-6">
            <input
              type="tel"
              value={otp}
              disabled={otpState.isVerifying}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              className="w-full h-14 text-center text-2xl tracking-[0.5em] font-extrabold border border-glass-border bg-glass rounded-2xl focus:border-accent outline-none transition-colors text-primary placeholder:text-muted"
              maxLength={6}
            />
            <button
              type="button"
              onClick={() => handleOTPVerification(otp)}
              disabled={otpState.isVerifying}
              className="w-full h-14 rounded-full bg-accent text-accent-text font-black uppercase tracking-widest text-xs transition-all hover:opacity-90 active:scale-95 border-none cursor-pointer shadow-lg"
            >
              {otpState.isVerifying ? "Verifying..." : "Confirm Order"}
            </button>

            <button
              type="button"
              onClick={() => handleResendOTP(otpState.pendingOrder!.customer.phone)}
              disabled={otpState.cooldown > 0 || otpState.isResending}
              className="text-xs font-black uppercase tracking-widest text-secondary hover:text-accent transition-all border-none bg-transparent cursor-pointer p-0"
            >
              {otpState.cooldown > 0
                ? `Resend in ${otpState.cooldown}s`
                : otpState.isResending
                ? "Sending..."
                : "Resend Code"}
            </button>
          </Flex>
        </Flex>
      </Modal>

      {isProcessing && <CheckoutLoader />}

      {/* Persistent Banner if dismissed */}
      {prepaidFeeState.isDismissed && prepaidFeeState.order && (
        <PrepaidFeeBanner
          order={prepaidFeeState.order}
          onPayNow={() => payPrepaidFeeNow(prepaidFeeState.order!)}
        />
      )}

      {/* Interactive High-Risk Delivery Fee Decision Modal */}
      <PrepaidFeeDecisionModal
        isOpen={prepaidFeeState.showModal}
        order={prepaidFeeState.order}
        onPayNow={() => payPrepaidFeeNow(prepaidFeeState.order!)}
        onDismiss={dismissPrepaidFeeModal}
      />
    </div>
  );
};

export default CheckoutForm;
