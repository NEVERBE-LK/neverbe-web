import React from "react";
import axiosInstance from "@/actions/axiosInstance";
import { formatCurrency } from "@/utils/formatting";
import { notFound } from "next/navigation";
import EBillDownloadButton from "../components/EBillDownloadButton";
import EBillView from "../components/EBillView";
import { BusinessInfo } from "@/config/BusinessInfo";
import { Metadata } from "next";
import { formatSLDate } from "@/actions/utilAction";

export async function generateMetadata(props: { params: Promise<{ orderId: string }> }): Promise<Metadata> {
  const { orderId } = await props.params;
  const title = `Electronic Receipt #${orderId.toUpperCase()} - Neverbe`;
  const description = `View and download your official Neverbe electronic receipt for order #${orderId.toUpperCase()}. Digital billing made simple.`;
  const ogImage = "/ebill-og.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Neverbe Electronic Receipt" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

const getOrder = async (orderId: string) => {
  try {
    const res = await axiosInstance.get(`/web/orders/${orderId}`);
    return { 
      order: res.data?.data || res.data, 
      daysRemaining: res.data?.daysRemaining,
      expired: false 
    };
  } catch (error: any) {
    if (error?.response?.status === 410) {
      return { order: null, daysRemaining: 0, expired: true };
    }
    return { order: null, daysRemaining: null, expired: false };
  }
};

export default async function EBillPage(props: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await props.params;
  const { order, expired, daysRemaining } = await getOrder(orderId);

  if (expired) {
    return (
      <div className="min-h-screen bg-surface text-primary flex flex-col font-sans">
        {/* HEADER */}
        <div className="w-full border-b border-glass-border bg-surface p-6 md:p-12">
          <div className="max-w-5xl mx-auto">
            <span className="v2-section-label mb-2">RECEIPT EXPIRED</span>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-primary m-0">
              Electronic Receipt
            </h1>
          </div>
        </div>

        {/* EXPIRED CONTENT */}
        <div className="flex-1 w-full p-6 md:p-12 bg-surface flex items-center justify-center">
          <div className="max-w-lg mx-auto text-center space-y-6 v2-glass p-10 rounded-3xl border border-glass-border">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-glass border border-glass-border text-warning mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight text-primary m-0">
                eBill Expired
              </h2>
              <p className="text-xs font-medium text-secondary leading-relaxed m-0">
                This electronic receipt has expired. Receipts are accessible for 30 days from the purchase date.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-accent m-0">
                Ref: #{orderId.toUpperCase()}
              </p>
              <p className="text-[10px] font-medium text-muted uppercase tracking-wider m-0">
                Need assistance? Contact support at {BusinessInfo.phone}
              </p>
            </div>

            <a
              href="https://neverbe.lk"
              className="inline-block px-8 py-3.5 bg-accent text-accent-text text-xs font-black uppercase tracking-widest rounded-full hover:opacity-90 transition-all shadow-md mt-4"
            >
              Visit Neverbe Store
            </a>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="w-full border-t border-glass-border p-8 text-center bg-surface">
          <a
            href="https://neverbe.lk"
            className="text-sm font-black uppercase tracking-widest text-muted hover:text-accent transition-colors"
          >
            neverbe.lk
          </a>
        </footer>
      </div>
    );
  }

  if (!order) {
    return notFound();
  }

  return <EBillView order={order} daysRemaining={daysRemaining} />;
}
