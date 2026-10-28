import type { Metadata } from "next";
import CheckoutForm from "./components/CheckoutForm";
import ReCaptchaProviderWrapper from "@/app/(site)/components/ReCaptchaProvider";

export const metadata: Metadata = {
  title: "Secure Checkout | NEVERBE",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <ReCaptchaProviderWrapper>
      <div className="commerce-checkout w-full max-w-[1240px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-10">
        <CheckoutForm />
      </div>
    </ReCaptchaProviderWrapper>
  );
}

