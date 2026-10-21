"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getFirebaseAnalytics } from "@/firebase/firebaseClient";
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  useEffect(() => {
    let cancelled = false;
    const track = async () => {
      const analytics = await getFirebaseAnalytics();
      if (!analytics || cancelled) return;
      const { logEvent } = await import("firebase/analytics");
      if (cancelled) return;
      logEvent(analytics, "page_view", {
        page_path: pathname + (search ? `?${search}` : ""),
        page_title: document.title,
        page_location: window.location.href,
      });
    };
    const id = window.setTimeout(() => {
      void track();
    }, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [pathname, search]);
  return null;
}
