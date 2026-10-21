import type { Metadata } from "next";
import CheckoutForm from "./components/CheckoutForm";

export const metadata: Metadata = {
  title: "Secure Checkout | NEVERBE",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="commerce-checkout w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <CheckoutForm />
    </div>
  );
}

