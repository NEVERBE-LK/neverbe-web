"use client";
import { printPalette } from "@/config/theme";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoClose,
  IoCloudDownloadOutline,
  IoCubeOutline,
  IoLocationOutline,
  IoCardOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
} from "react-icons/io5";
import { toSafeLocaleString } from "@/actions/utilAction";
import Image from "next/image";
import Link from "next/link";
import { Button } from "antd";
import { Order } from "@/interfaces/Order";
import { BusinessInfo } from "@/config/BusinessInfo";
import { axiosInstance } from "@/actions/axiosInstance";
import {
  submitExternalForm,
  processDeliveryFeePrepayment,
} from "@/actions/orderAction";
import toast from "react-hot-toast";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new (window as any).Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e: any) => reject(e);
    img.src = url;
  });
};

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const [downloading, setDownloading] = React.useState(false);
  const [processingFee, setProcessingFee] = React.useState(false);
  const [trackingHistory, setTrackingHistory] = React.useState<
    { date: string; status: string }[]
  >([]);
  const [loadingTracking, setLoadingTracking] = React.useState(false);

  const orderId = order?.orderId;
  const trackingNumber = order?.trackingNumber;

  React.useEffect(() => {
    const fetchTracking = async () => {
      if (trackingNumber && orderId) {
        setLoadingTracking(true);
        try {
          const res = await axiosInstance.get(
            `/web/orders/${orderId}/tracking`,
          );
          setTrackingHistory(res.data.data.history || []);
        } catch (error) {
          console.error("Error fetching tracking", error);
        } finally {
          setLoadingTracking(false);
        }
      }
    };
    fetchTracking();
  }, [orderId, trackingNumber]);

  if (!isOpen || !order) return null;

  const {
    createdAt,
    status,
    items,
    customer,
    paymentMethod,
    paymentStatus,
    shippingFee,
    fee,
    discount,
  } = order;

  // Calculation Logic
  // Subtotal is the sum of net prices (price - discount) * quantity
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price - (item.discount || 0)) * item.quantity,
    0,
  );

  const couponDiscountSum = (order as any).couponDiscount || discount || 0;
  const promotionDiscountSum = (order as any).promotionDiscount || 0;
  const total =
    subtotal -
    (couponDiscountSum + promotionDiscountSum) +
    (shippingFee || 0) +
    (fee || 0);

  const handlePayDeliveryFee = async () => {
    if (!order) return;
    setProcessingFee(true);
    try {
      const payhereResponse = await processDeliveryFeePrepayment(
        order,
        order.customer,
      );
      submitExternalForm(payhereResponse.actionUrl, payhereResponse.payload);
    } catch (err: any) {
      console.error("Delivery fee prepayment launch error:", err);
      toast.error("Failed to launch delivery fee prepayment.");
    } finally {
      setProcessingFee(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const doc = new jsPDF();

      // Preload images
      const loadedImages: Record<string, HTMLImageElement> = {};
      if (items) {
        await Promise.all(
          items.map(async (item: any) => {
            if (item.thumbnail) {
              try {
                const img = await loadImage(item.thumbnail);
                loadedImages[item.itemId] = img;
              } catch (e) {
                console.error("Failed to load thumbnail for", item.name, e);
              }
            }
          }),
        );
      }

      // 1. Header & Branding
      // Add Logo
      const img = new (window as any).Image();
      img.src = "/logo.png";

      // Header Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text(BusinessInfo.name, 50, 22);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120);
      doc.text(BusinessInfo.legalName, 50, 27);
      doc.text(`${BusinessInfo.addressLine1}, ${BusinessInfo.city}`, 50, 31);
      doc.text(`${BusinessInfo.email} | ${BusinessInfo.website}`, 50, 35);
      doc.text(`Tel: ${BusinessInfo.phone}`, 50, 39);

      // Add Logo to PDF
      try {
        doc.addImage(img, "PNG", 14, 12, 30, 30);
      } catch (e) {
        console.error("Logo not found or failed to load", e);
      }

      // Invoice Title & Info
      doc.setFont("helvetica", "black");
      doc.setFontSize(28);
      doc.setTextColor(printPalette.accent); // Neverbe green
      doc.text("INVOICE", 196, 22, { align: "right" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(printPalette.ink);
      doc.text(`Order ID: #${orderId}`, 196, 30, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setTextColor(printPalette.secondary);
      doc.text(`Date: ${toSafeLocaleString(createdAt)}`, 196, 35, {
        align: "right",
      });
      doc.text(`Status: ${status.toUpperCase()}`, 196, 40, { align: "right" });

      // 2. Customer & Shipping details
      doc.setDrawColor(printPalette.border);
      doc.line(14, 48, 196, 48); // Divider

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(printPalette.ink);
      doc.text("BILLED TO", 14, 58);
      doc.text("SHIPPED TO", 140, 58); // Pushed further right to justify between

      doc.setFont("helvetica", "normal");
      doc.setTextColor(printPalette.secondary);
      doc.setFontSize(9);

      // Billed To details
      doc.text(customer.name, 14, 64);
      const splitBilling = doc.splitTextToSize(customer.address || "", 80);
      doc.text(splitBilling, 14, 69);
      const billingCityY = 69 + splitBilling.length * 4.5;
      doc.text(customer.city || "", 14, billingCityY);
      doc.text(
        `Phone: ${customer.phone.startsWith("+") ? "" : "+"}${customer.phone}`,
        14,
        billingCityY + 5,
      );

      // Shipped To details
      doc.text(customer.shippingName || customer.name, 140, 64);
      const splitShipping = doc.splitTextToSize(
        customer.shippingAddress || customer.address,
        55,
      ); // Adjusted width for right side
      doc.text(splitShipping, 140, 69);
      const shippingCityY = 69 + splitShipping.length * 4.5;
      doc.text(customer.shippingCity || customer.city, 140, shippingCityY);
      doc.text(
        `Phone: ${(customer.shippingPhone || customer.phone).startsWith("+") ? "" : "+"}${customer.shippingPhone || customer.phone}`,
        140,
        shippingCityY + 5,
      );

      // 3. Items Table
      const tableColumn = [
        "",
        "Item Description",
        "Size",
        "Qty",
        "Unit Price",
        "Total",
      ];
      const tableRows = items.map((item) => {
        const netItemPrice = item.price - (item.discount || 0);
        return [
          "", // Thumbnail
          item.name,
          item.size || "-",
          item.quantity.toString(),
          `Rs. ${netItemPrice.toLocaleString()}`,
          `Rs. ${(netItemPrice * item.quantity).toLocaleString()}`,
        ];
      });

      // Calculate max Y for address block to determine table start
      const tableStartY = Math.max(billingCityY, shippingCityY) + 15;

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: tableStartY,
        theme: "grid",
        headStyles: {
          fillColor: printPalette.accent,
          textColor: printPalette.white,
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          0: { cellWidth: 15, halign: "center" },
          3: { halign: "center" },
          4: { halign: "right" },
          5: { halign: "right" },
        },
        styles: { fontSize: 9, cellPadding: 4, minCellHeight: 12 },
        didDrawCell: (data: any) => {
          if (data.column.index === 0 && data.cell.section === "body") {
            const item = items[data.row.index];
            const img = loadedImages[item.itemId];
            if (img) {
              const size = 8; // mm
              const x = data.cell.x + (data.cell.width - size) / 2;
              const y = data.cell.y + (data.cell.height - size) / 2;
              try {
                doc.addImage(img, "JPEG", x, y, size, size);
              } catch (e) {
                console.error("Failed to add image to PDF cell:", e);
              }
            }
          }
        },
      });

      const finalY = (doc as any).lastAutoTable.finalY + 15;

      // 4. Summary Totals
      const summaryX = 140;
      const valueX = 196;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(printPalette.secondary);

      doc.text("Subtotal:", summaryX, finalY);
      doc.text(`Rs. ${subtotal.toLocaleString()}`, valueX, finalY, {
        align: "right",
      });

      let currentY = finalY + 7;

      if (promotionDiscountSum > 0) {
        doc.setTextColor(printPalette.accent);
        doc.setFont("helvetica", "bold");
        doc.text("Auto Promotion:", summaryX, currentY);
        doc.text(
          `- Rs. ${promotionDiscountSum.toLocaleString()}`,
          valueX,
          currentY,
          { align: "right" },
        );
        currentY += 7;
      }

      if (couponDiscountSum > 0) {
        doc.setTextColor(printPalette.accent);
        doc.setFont("helvetica", "bold");
        doc.text("Coupon Savings:", summaryX, currentY);
        doc.text(
          `- Rs. ${couponDiscountSum.toLocaleString()}`,
          valueX,
          currentY,
          { align: "right" },
        );
        currentY += 7;
      }

      doc.setTextColor(printPalette.secondary);
      doc.setFont("helvetica", "normal");
      doc.text("Shipping Fee:", summaryX, currentY);
      doc.text(`Rs. ${(shippingFee || 0).toLocaleString()}`, valueX, currentY, {
        align: "right",
      });

      currentY += 10;
      doc.setDrawColor(printPalette.border);
      doc.line(summaryX, currentY - 5, valueX, currentY - 5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(printPalette.ink);
      doc.text("Grand Total:", summaryX, currentY);
      doc.text(`Rs. ${total.toLocaleString()}`, valueX, currentY, {
        align: "right",
      });

      // 5. Footer & Terms
      const footerY = 270;
      doc.setFontSize(8);
      doc.setTextColor(printPalette.muted);
      doc.setFont("helvetica", "italic");
      doc.text("Terms & Conditions:", 14, footerY);
      doc.text(
        "1. Items can be exchanged within 7 days of purchase.",
        14,
        footerY + 5,
      );
      doc.text(
        "2. Please present this invoice for any exchanges.",
        14,
        footerY + 9,
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(printPalette.accent);
      doc.text("THANK YOU FOR SHOPPING WITH Neverbe!", 105, 285, {
        align: "center",
      });

      doc.save(`Neverbe-Invoice-${orderId}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF invoice:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6">
        {/* Soft Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-primary-dark/40 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="relative bg-surface w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl border border-default flex flex-col"
        >
          {/* HEADER */}
          <div className="sticky top-0 bg-surface border-b border-default p-6 md:p-8 flex items-center justify-between z-20">
            <div>
              <h2 className="text-2xl font-display font-black uppercase tracking-tighter text-primary-dark leading-none">
                Order Details
              </h2>
              <p className="text-[11px] text-muted font-bold mt-2 uppercase tracking-widest">
                Reference: #{orderId} <span className="mx-2 text-muted">|</span>{" "}
                {toSafeLocaleString(createdAt)}
              </p>
            </div>
            <Button
              type="text"
              icon={<IoClose size={22} />}
              onClick={onClose}
              className="p-3 bg-surface-2 hover:bg-surface-3 text-primary-dark transition-all rounded-full h-auto"
            />
          </div>

          <div className="p-6 md:p-10 overflow-y-auto hide-scrollbar space-y-10">
            {/* STATUS & ACTIONS */}
            <div className="flex flex-wrap items-center justify-between gap-6 bg-surface-2 p-6 rounded-4xl border border-default">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-accent text-inverse rounded-2xl shadow-lg shadow-accent/20">
                  <IoCubeOutline size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">
                    Current Status
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="font-display font-black text-xl uppercase tracking-tighter text-accent">
                      {status}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleDownloadInvoice}
                  loading={downloading}
                  disabled={downloading}
                  className="flex items-center gap-2 px-6 py-4 bg-surface text-primary-dark border border-strong hover:border-primary transition-all text-xs! font-black! uppercase! tracking-widest! rounded-full shadow-sm h-auto"
                >
                  <IoCloudDownloadOutline size={18} />
                  {downloading ? null : "Download Invoice"}
                </Button>
              </div>
            </div>

            {/* TRACKING TIMELINE */}
            {trackingNumber && (
              <div className="bg-surface-2 p-6 md:p-8 rounded-4xl border border-default">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-accent rounded-full" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-dark">
                      Shipping Progress (WB #{trackingNumber})
                    </h3>
                    <a
                      href={`https://domex.lk/Order-Details.php?wbno=${trackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-accent/20 transition-colors w-fit"
                    >
                      View on Domex Site
                    </a>
                  </div>
                </div>

                {loadingTracking ? (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : trackingHistory.length > 0 ? (
                  <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-default/60">
                    {[...trackingHistory].reverse().map((item, idx) => (
                      <div key={idx} className="relative group">
                        <div
                          className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-surface-2 shadow-sm transition-transform group-hover:scale-125 ${idx === 0 ? "bg-accent scale-125" : "bg-muted"}`}
                        />
                        <div className="flex flex-col gap-1">
                          <p
                            className={`text-sm font-bold uppercase tracking-tighter transition-colors ${idx === 0 ? "text-accent" : "text-primary-dark/60"}`}
                          >
                            {item.status}
                          </p>
                          <p className="text-[10px] text-muted font-bold uppercase tracking-widest">
                            {item.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-surface-2/50 rounded-2xl border border-dashed border-default">
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest">
                      Live tracking data is being updated or currently
                      unavailable.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* PRODUCT LIST */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted mb-6">
                Purchased Items ({items.length})
              </h3>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-6 p-4 bg-surface-2 rounded-3xl border border-default hover:border-accent transition-all group"
                  >
                    <div className="w-20 h-20 bg-surface shrink-0 rounded-2xl overflow-hidden border border-default p-1">
                      <Image
                        width={80}
                        height={80}
                        src={
                          item.thumbnail || "https://placehold.co/100?text=GEAR"
                        }
                        alt={item.name}
                        className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-display font-black uppercase tracking-tighter text-primary-dark text-lg leading-tight">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-[10px] font-bold uppercase text-muted tracking-widest">
                              Size:{" "}
                              <span className="text-primary-dark">
                                {item.size}
                              </span>
                            </span>
                            <span className="text-[10px] font-bold uppercase text-muted tracking-widest">
                              Qty:{" "}
                              <span className="text-primary-dark">
                                {item.quantity}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-display font-black ${
                              (item.discount || 0) > 0
                                ? "text-error"
                                : "text-primary-dark"
                            }`}
                          >
                            Rs.{" "}
                            {(
                              item.price - (item.discount || 0)
                            ).toLocaleString()}
                          </p>
                          {(item.discount || 0) > 0 && (
                            <p className="text-[10px] text-muted font-bold uppercase line-through opacity-60">
                              Rs. {item.price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DELIVERY FEE PREPAYMENT */}
            {order.riskStatus === "HIGH_RISK" && (
              <div className="mt-6 mb-10">
                {order.deliveryFeePrepaid ? (
                  <div className="bg-accent/10 border border-accent rounded-[2.5rem] p-6 md:p-8 flex items-center gap-5">
                    <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                      <IoCheckmarkCircle className="text-accent text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-primary-dark font-display font-black uppercase text-lg">
                        Delivery Fee Paid
                      </h3>
                      <p className="text-muted text-sm mt-1">
                        LKR {order.shippingFee} Delivery Fee has been confirmed.{" "}
                        {(order as any).deliveryFeeTxnId
                          ? `Transaction: ${(order as any).deliveryFeeTxnId}`
                          : ""}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-warning/10 border border-warning rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center shrink-0">
                        <IoWarningOutline className="text-warning text-2xl" />
                      </div>
                      <div>
                        <h3 className="text-primary-dark font-display font-black uppercase text-lg">
                          Delivery Fee Required (LKR {order.shippingFee})
                        </h3>
                        <p className="text-primary-dark/70 text-sm mt-1 max-w-lg">
                          To process this order and dispatch it immediately,
                          please pay the prepaid delivery fee.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handlePayDeliveryFee}
                      loading={processingFee}
                      disabled={processingFee}
                      className="bg-warning hover:bg-warning text-dark border-none text-xs font-black uppercase tracking-widest rounded-full px-8 h-12 shadow-md shrink-0 transition-all"
                    >
                      Pay LKR {order.shippingFee} Delivery Fee
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* DELIVERY & PAYMENT GRID */}
            <div className="grid md:grid-cols-2 gap-10 pt-10 border-t border-default">
              <div className="space-y-10">
                <div className="group">
                  <div className="flex items-center gap-3 mb-5">
                    <IoLocationOutline size={20} className="text-accent" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-dark">
                      Shipping Details
                    </h3>
                  </div>
                  <address className="not-text-sm text-primary-dark font-medium leading-relaxed pl-8 border-l-2 border-default group-hover:border-accent transition-colors">
                    <p className="text-primary-dark font-black uppercase tracking-tighter text-base">
                      {customer.shippingName || customer.name}
                    </p>
                    <p className="mt-1">
                      {customer.shippingAddress || customer.address}
                    </p>
                    <p>{customer.shippingCity || customer.city}</p>
                    <p className="text-accent font-black mt-3">
                      {(customer.shippingPhone || customer.phone).startsWith(
                        "+",
                      )
                        ? ""
                        : "+"}
                      {customer.shippingPhone || customer.phone}
                    </p>
                  </address>
                </div>

                {customer.address && (
                  <div className="group">
                    <div className="flex items-center gap-3 mb-5">
                      <IoLocationOutline size={20} className="text-accent" />
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-dark">
                        Billing Details
                      </h3>
                    </div>
                    <address className="not-text-sm text-primary-dark font-medium leading-relaxed pl-8 border-l-2 border-default group-hover:border-accent transition-colors">
                      <p className="text-primary-dark font-black uppercase tracking-tighter text-base">
                        {customer.name}
                      </p>
                      <p className="mt-1">{customer.address}</p>
                      <p>{customer.city}</p>
                      <p className="text-accent font-black mt-3">
                        {customer.phone.startsWith("+") ? "" : "+"}
                        {customer.phone}
                      </p>
                    </address>
                  </div>
                )}

                <div className="group">
                  <div className="flex items-center gap-3 mb-5">
                    <IoCardOutline size={20} className="text-accent" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-dark">
                      Payment Method
                    </h3>
                  </div>
                  <div className="pl-8 border-l-2 border-default group-hover:border-accent transition-colors">
                    <p className="text-sm font-bold text-primary-dark uppercase tracking-widest">
                      {paymentMethod}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-accent mt-1">
                      Status: {paymentStatus}
                    </p>
                  </div>
                </div>
              </div>

              {/* SUMMARY */}
              <div className="bg-surface-2 p-8 rounded-[2.5rem] border border-default flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-accent">
                    <span>Subtotal</span>
                    <span className="text-primary-dark">
                      Rs. {subtotal.toLocaleString()}
                    </span>
                  </div>
                  {promotionDiscountSum > 0 && (
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-warning">
                      <span>Auto Discount</span>
                      <span>- Rs. {promotionDiscountSum.toLocaleString()}</span>
                    </div>
                  )}
                  {couponDiscountSum > 0 && (
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-accent">
                      <span>Coupon Discount</span>
                      <span>- Rs. {couponDiscountSum.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-accent/40">
                    <span>Shipping</span>
                    <span className="text-primary-dark">
                      Rs. {(shippingFee || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-default">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent block mb-2">
                        Order Total
                      </span>
                      <div className="flex items-center gap-2">
                        <IoCheckmarkCircle className="text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                          Payment Verified
                        </span>
                      </div>
                    </div>
                    <span className="text-4xl font-display font-black text-primary-dark tracking-tighter">
                      Rs. {total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-surface border-t border-default text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted">
              Customer Exclusives
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderDetailsModal;
