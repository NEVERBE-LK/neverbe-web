"use client";

import React from "react";
import { termsAndConditions } from "@/constants";

const TermsContent = () => {
  return (
    <div className="flex flex-col gap-6">
      {termsAndConditions.map((item, index) => (
        <div
          key={index}
          className="v2-glass p-8 rounded-3xl border border-glass-border hover:border-accent transition-all group"
        >
          <div className="flex items-center gap-4 mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="text-xl font-black uppercase tracking-tight text-primary m-0">
              {item.title}
            </h2>
          </div>
          <p className="text-xs md:text-sm font-medium leading-relaxed text-secondary whitespace-pre-line m-0">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TermsContent;
