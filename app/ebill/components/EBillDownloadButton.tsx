"use client";
import { printPalette } from "@/config/theme";

import React from "react";
import { Button } from "antd";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { toSafeLocaleString } from "@/actions/utilAction";
import { BusinessInfo } from "@/config/BusinessInfo";

interface EBillDownloadButtonProps {
  order: any;
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

const EBillDownloadButton: React.FC<EBillDownloadButtonProps> = ({ order }) => {
  const [downloading, setDownloading] = React.useState(false);

  const handleDownloadInvoice = async () => {
    setDownloading(true);
    const {
      orderId,
      createdAt,
      status,
      items,
      customer,
      paymentMethod,
      paymentStatus,
      shippingFee,
      fee,
      discount,
      couponDiscount,
      promotionDiscount,
      total: backendTotal,
    } = order;

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

      // 1. HEADER BRANDING
      try {
        const img = new (window as any).Image();
        img.src = "/logo.png";
        await new Promise((res) => {
          img.onload = res;
          img.onerror = res; // Proceed even if error
        });
        doc.addImage(img, "PNG", 14, 12, 12, 12);
      } catch (e) {
        console.error("Logo not found", e);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(printPalette.ink); // slate-900
      doc.text("INVOICE", 30, 18);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(printPalette.muted); // slate-400
      doc.text("OFFICIAL RECEIPT", 30, 23);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(printPalette.ink);
      doc.text("neverbe.", 196, 16, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(printPalette.secondary); // slate-500
      doc.text(BusinessInfo.addressLine1, 196, 21, { align: "right" });
      doc.text(`${BusinessInfo.city}, Sri Lanka`, 196, 26, { align: "right" });
      doc.text(BusinessInfo.phone, 196, 31, { align: "right" });

      doc.setDrawColor(printPalette.surface); // slate-100
      doc.setLineWidth(0.5);
      doc.line(14, 38, 196, 38);

      // 2. CUSTOMER & ORDER METADATA
      let y = 46;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(printPalette.muted); // slate-400
      doc.text("INVOICE TO", 14, y);

      y += 5;
      doc.setFontSize(10);
      doc.setTextColor(printPalette.ink); // slate-900
      doc.text(customer?.name || "Walk-in Customer", 14, y);

      if (customer) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(printPalette.secondary); // slate-600
        const addressText = `${customer.address || ""}${customer.city ? `, ${customer.city}` : ""}${customer.zip ? ` ${customer.zip}` : ""}`;
        const splitBilling = doc.splitTextToSize(addressText, 60);
        y += 5;
        doc.text(splitBilling, 14, y);
        y += splitBilling.length * 4.5;
        if (customer.phone) {
          doc.text(`Tel: ${customer.phone}`, 14, y);
        }
      }

      let yShip = 46;
      if (customer?.shippingAddress) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(printPalette.muted);
        doc.text("SHIP TO", 80, yShip);

        yShip += 5;
        doc.setFontSize(10);
        doc.setTextColor(printPalette.ink);
        doc.text(customer.shippingName || customer.name, 80, yShip);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(printPalette.secondary);
        const shipAddressText = `${customer.shippingAddress || ""}${customer.shippingCity ? `, ${customer.shippingCity}` : ""}${customer.shippingZip ? ` ${customer.shippingZip}` : ""}`;
        const splitShipping = doc.splitTextToSize(shipAddressText, 60);
        yShip += 5;
        doc.text(splitShipping, 80, yShip);
      }

      // Order info on right
      let yOrder = 46;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(printPalette.muted);
      doc.text("ORDER NO.", 196, yOrder, { align: "right" });
      yOrder += 4.5;
      doc.setFontSize(10);
      doc.setTextColor(printPalette.ink);
      doc.text(`#${orderId}`, 196, yOrder, { align: "right" });

      yOrder += 8;
      doc.setFontSize(8);
      doc.setTextColor(printPalette.muted);
      doc.text("DATE ISSUED", 196, yOrder, { align: "right" });
      yOrder += 4.5;
      doc.setFontSize(9);
      doc.setTextColor(printPalette.ink); // slate-700
      doc.text(toSafeLocaleString(createdAt) || "", 196, yOrder, {
        align: "right",
      });

      yOrder += 8;
      doc.setFontSize(8);
      doc.setTextColor(printPalette.muted);
      doc.text("PAYMENT STATUS", 196, yOrder, { align: "right" });
      yOrder += 4.5;
      doc.setFontSize(9);
      doc.setTextColor(printPalette.accent); // emerald-700
      doc.text(paymentStatus || "PENDING", 196, yOrder, { align: "right" });

      const finalMetadataY = Math.max(y + 10, yShip + 10, yOrder + 10);

      doc.setDrawColor(printPalette.surface);
      doc.line(14, finalMetadataY - 5, 196, finalMetadataY - 5);

      // 3. TABLE
      const tableColumn = [
        "",
        "Item Description",
        "Size",
        "Qty",
        "Price",
        "Discount",
        "Amount",
      ];
      const tableRows = items.map((item: any) => {
        const originalTotal = (item.price || 0) * (item.quantity || 1);
        const discountTotal = (item.discount || 0) * (item.quantity || 1);
        const finalTotal = originalTotal - discountTotal;
        return [
          "",
          item.variantName ? `${item.name}\n(${item.variantName})` : item.name,
          item.size || "—",
          (item.quantity || 1).toString(),
          `Rs ${originalTotal.toLocaleString()}`,
          discountTotal > 0 ? `-Rs ${discountTotal.toLocaleString()}` : "—",
          `Rs ${finalTotal.toLocaleString()}`,
        ];
      });

      const tableStartY = finalMetadataY;
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: tableStartY,
        theme: "plain",
        headStyles: {
          fillColor: printPalette.surface, // slate-50
          textColor: printPalette.secondary, // slate-500
          fontStyle: "bold",
          fontSize: 8,
        },
        bodyStyles: {
          textColor: printPalette.ink,
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: printPalette.surface,
        },
        columnStyles: {
          0: { cellWidth: 15, halign: "center" },
          1: { fontStyle: "bold" },
          2: { halign: "center", textColor: printPalette.ink },
          3: { halign: "center", textColor: printPalette.ink },
          4: { halign: "right", textColor: printPalette.ink },
          5: { halign: "right", textColor: printPalette.error },
          6: { halign: "right", fontStyle: "bold" },
        },
        styles: { cellPadding: 4, minCellHeight: 12 },
        didDrawCell: (data: any) => {
          if (data.column.index === 0 && data.cell.section === "body") {
            const item = items[data.row.index];
            const img = loadedImages[item.itemId];
            if (img) {
              const size = 8;
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

      // 4. TOTALS
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      const summaryX = 130;
      const valueX = 196;

      const rawSubtotal = items.reduce(
        (sum: number, item: any) =>
          sum + (item.price || 0) * (item.quantity || 1),
        0,
      );
      const itemDiscountTotal = items.reduce(
        (sum: number, item: any) =>
          sum + (item.discount || 0) * (item.quantity || 1),
        0,
      );
      const totalDiscount = discount || 0;
      const grandTotal =
        backendTotal ||
        rawSubtotal - totalDiscount + (shippingFee || 0) + (fee || 0);

      let currentY = finalY;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(printPalette.secondary);
      doc.text("Subtotal", summaryX, currentY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(printPalette.ink);
      doc.text(`Rs ${rawSubtotal.toLocaleString()}`, valueX, currentY, {
        align: "right",
      });

      if (totalDiscount > 0) {
        currentY += 6;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(printPalette.error);
        doc.text("Total Discount", summaryX, currentY);
        doc.setFont("helvetica", "bold");
        doc.text(`-Rs ${totalDiscount.toLocaleString()}`, valueX, currentY, {
          align: "right",
        });
      }
      if (shippingFee && shippingFee > 0) {
        currentY += 6;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(printPalette.secondary); // slate-600
        doc.text("Shipping Fee", summaryX, currentY);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(printPalette.ink); // slate-900
        doc.text(`Rs ${shippingFee.toLocaleString()}`, valueX, currentY, {
          align: "right",
        });
      }

      if (fee && fee > 0) {
        currentY += 6;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(printPalette.secondary); // slate-600
        doc.text("Processing Fee", summaryX, currentY);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(printPalette.ink); // slate-900
        doc.text(`Rs ${fee.toLocaleString()}`, valueX, currentY, {
          align: "right",
        });
      }

      currentY += 8;
      doc.setDrawColor(printPalette.ink); // slate-900
      doc.line(summaryX, currentY - 4, valueX, currentY - 4);

      doc.setFontSize(10);
      doc.setTextColor(printPalette.ink);
      doc.text("GRAND TOTAL", summaryX, currentY);
      doc.setTextColor(printPalette.accent); // emerald-700
      doc.text(`Rs ${grandTotal.toLocaleString()}`, valueX, currentY, {
        align: "right",
      });

      // 5. FOOTER
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(printPalette.muted); // slate-400
      doc.setDrawColor(printPalette.surface); // slate-100
      doc.line(14, 280, 196, 280);
      doc.text(
        "Thank you for choosing NeverBe! For support queries, contact info@neverbe.lk",
        105,
        285,
        { align: "center" },
      );

      doc.save(`NeverBe-Invoice-${orderId}.pdf`);
    } catch (err) {
      console.error("Error generating ebill PDF:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownloadInvoice}
      loading={downloading}
      disabled={downloading}
      className="flex items-center gap-2 px-6 py-4 bg-surface text-primary border border-strong hover:border-accent hover:text-accent transition-all text-xs font-black uppercase tracking-widest rounded-full shadow-sm h-auto"
    >
      <IoCloudDownloadOutline size={18} />
      {downloading ? null : "Download PDF"}
    </Button>
  );
};

export default EBillDownloadButton;
