import type { ReactNode } from "react";
/** Native scrolling preserves device behavior and requires no animation ticker. */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
