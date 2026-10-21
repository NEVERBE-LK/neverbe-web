"use client";

import PrivacyPolicyContent from "./PrivacyPolicyContent";

const PrivacyPolicyClient = () => {
  return (
    <div className="commerce-legacy w-full bg-surface text-primary min-h-screen pt-28 md:pt-36 pb-20">
      {/* 1. HERO SECTION */}
      <section className="w-full px-4 md:px-8 mb-12">
        <div className="max-w-[1200px] mx-auto">
          <span className="v2-section-label mb-3">LEGAL &amp; COMPLIANCE</span>
          <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-black uppercase tracking-tight text-primary mb-4 m-0 leading-tight">
            Privacy Policy
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <p className="text-xs font-black uppercase tracking-widest text-secondary m-0">
              Last Updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="h-px w-8 bg-glass-border"></div>
            <p className="text-xs font-black uppercase tracking-widest text-accent m-0">
              Data Security Guaranteed
            </p>
          </div>
        </div>
      </section>

      {/* 2. CONTENT SECTION */}
      <section className="w-full border-t border-glass-border px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto">
          <PrivacyPolicyContent />
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyClient;
