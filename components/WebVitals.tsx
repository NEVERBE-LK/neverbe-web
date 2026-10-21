"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { getFirebaseAnalytics } from "@/firebase/firebaseClient";

type Metric = Parameters<Parameters<typeof useReportWebVitals>[0]>[0];
type Report = { metric: Metric; route: string };

async function report({ metric, route }: Report) {
  try {
    const analytics = await getFirebaseAnalytics();
    if (!analytics) return;
    const { logEvent } = await import("firebase/analytics");
    logEvent(analytics, "web_vital", {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: metric.rating,
      metric_id: metric.id,
      page_type: route,
      non_interaction: true,
    });
  } catch {
    // Analytics failures must not affect the storefront.
  }
}

export const WebVitals = () => {
  const pending = useRef(new Map<string, Report>());
  const ready = useRef(false);
  useEffect(() => {
    // Share the existing Analytics integration after the initial render.
    const timer = window.setTimeout(() => {
      ready.current = true;
      for (const value of pending.current.values()) void report(value);
      pending.current.clear();
    }, 2500);
    return () => window.clearTimeout(timer);
  }, []);
  useReportWebVitals(
    useCallback((metric: Metric) => {
      if (process.env.NODE_ENV !== "production") return;
      // Group dynamic IDs and omit query strings from performance dimensions.
      const route = window.location.pathname
        .replace(/(\/collections\/(?:products|combos))\/[^/]+/, "$1/[id]")
        .replace(/(\/(?:ebill|checkout\/(?:success|fail)))\/[^/]+/, "$1/[id]");
      const entry = { metric, route };
      if (ready.current) void report(entry);
      else pending.current.set(metric.id, entry);
    }, []),
  );
  return null;
};
