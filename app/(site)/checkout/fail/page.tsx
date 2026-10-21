import Link from "next/link";
import { IoHelpCircleOutline, IoRefresh } from "react-icons/io5";
import FailAnimationComponent from "@/app/(site)/checkout/fail/components/FailAnimationComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transaction Failed | Neverbe",
};

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; error?: string }>;
}) => {
  const params = await searchParams;
  const errorMsg = params.error || "Transaction declined";

  return (
    <main className="commerce-legacy w-full min-h-screen bg-surface text-primary pt-28 pb-20 px-4 md:px-8 flex flex-col items-center justify-center text-center">
      <div className="w-full max-w-xl animate-fadeIn v2-glass p-8 sm:p-12 rounded-3xl border border-glass-border">
        {/* Animation */}
        <FailAnimationComponent />

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none mb-3 text-error m-0">
          Order Failed
        </h1>

        <p className="text-xs sm:text-sm text-secondary font-medium mb-6 leading-relaxed m-0">
          We couldn&apos;t process your transaction. This might be due to a network issue or a payment gateway decline.
        </p>

        {/* Error Code */}
        <div className="inline-block px-4 py-1.5 bg-error/10 border border-error/30 rounded-full mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-error m-0">
            Error: {errorMsg}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
          <Link
            href="/checkout"
            className="flex-1 py-3.5 px-6 bg-accent !text-accent-text font-black uppercase tracking-widest text-xs rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
          >
            <IoRefresh size={16} />
            <span>Try Again</span>
          </Link>

          <Link
            href="/contact"
            className="flex-1 py-3.5 px-6 bg-glass border border-glass-border text-primary font-black uppercase tracking-widest text-xs rounded-full flex items-center justify-center gap-2 hover:border-accent transition-all"
          >
            <IoHelpCircleOutline size={18} />
            <span>Contact Support</span>
          </Link>
        </div>

        {/* Footer Link */}
        <div className="mt-8">
          <Link
            href="/"
            className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-accent transition-colors"
          >
            Return to Home Page
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Page;
