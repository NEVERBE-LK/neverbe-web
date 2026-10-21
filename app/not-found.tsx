import "@/app/globals.css";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | Neverbe",
  description: "The page you are looking for does not exist on Neverbe.",
};

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-primary px-4 sm:px-6 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Container */}
      <div className="text-center max-w-lg w-full relative z-10">
        {/* Badge */}
        <span className="v2-section-label mb-2">ERROR 404</span>

        {/* 404 - Glitch / Glowing display */}
        <h1 className="text-[100px] sm:text-[140px] md:text-[180px] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-primary via-primary to-muted select-none m-0">
          404
        </h1>

        {/* Message */}
        <div className="mt-4 mb-8 space-y-2">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-primary m-0">
            Page Not Found
          </h2>
          <p className="text-xs sm:text-sm font-medium leading-relaxed text-secondary max-w-md mx-auto m-0">
            The drop or page you are looking for might have been moved, renamed, or is temporarily offline.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-8 py-3.5 bg-accent text-accent-text text-xs font-black uppercase tracking-widest rounded-full hover:opacity-90 transition-all shadow-lg text-center"
          >
            Return Home
          </Link>
          <Link
            href="/collections/products"
            className="px-8 py-3.5 bg-glass border border-glass-border text-primary hover:border-accent text-xs font-black uppercase tracking-widest rounded-full transition-all text-center"
          >
            Explore Drops
          </Link>
        </div>
      </div>

      {/* Footer link */}
      <p className="absolute bottom-8 text-[11px] text-muted font-extrabold uppercase tracking-widest m-0">
        Need assistance?{" "}
        <Link
          href="/contact"
          className="text-accent hover:underline ml-1"
        >
          Contact Support
        </Link>
      </p>
    </div>
  );
};

export default NotFound;
