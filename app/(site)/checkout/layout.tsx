import React from "react";
import ReCaptchaProviderWrapper from "@/app/(site)/components/ReCaptchaProvider";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReCaptchaProviderWrapper>{children}</ReCaptchaProviderWrapper>;
}
