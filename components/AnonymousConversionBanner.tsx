"use client";
import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { User } from "lucide-react";

const AnonymousConversionBanner: React.FC = () => {
  const user = useSelector((state: RootState) => state.authSlice.user);

  if (user && !user.isAnonymous) return null;

  return (
    <div className="bg-surface text-primary px-4 py-3 border-b border-glass-border flex items-center justify-center transition-all">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 max-w-[1400px] w-full justify-center">
        <div className="flex items-center gap-2">
          <User size={14} className="text-accent" />
          <p className="text-xs font-bold uppercase tracking-wider text-secondary m-0">
            Shopping as guest?{" "}
            <span className="text-primary font-black">
              Sign in to save orders &amp; wishlist.
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
          <Link
            href="/account/register?redirect=/checkout"
            className="text-accent hover:underline transition-colors"
          >
            Create Account
          </Link>
          <span className="text-muted">|</span>
          <Link
            href="/account/login?redirect=/checkout"
            className="text-primary hover:text-accent transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnonymousConversionBanner;
