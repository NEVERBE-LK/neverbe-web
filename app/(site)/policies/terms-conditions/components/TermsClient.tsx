"use client";

import TermsContent from "./TermsContent";

const TermsClient = () => {
  return (
    <div className="commerce-legacy w-full bg-surface text-primary min-h-screen pt-28 md:pt-36 pb-20">
      {/* 1. HERO SECTION */}
      <section className="w-full px-4 md:px-8 mb-12">
        <div className="max-w-[1200px] mx-auto">
          <span className="v2-section-label mb-3">LEGAL TERMS</span>
          <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-black uppercase tracking-tight text-primary mb-4 m-0 leading-tight">
            Terms &amp; Conditions
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <p className="text-xs font-black uppercase tracking-widest text-accent m-0">
              User Agreement
            </p>
            <div className="h-px w-8 bg-glass-border"></div>
            <p className="text-xs font-black uppercase tracking-widest text-secondary m-0">
              Effective Date: {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </section>

      {/* 2. CONTENT SECTION */}
      <section className="w-full border-t border-glass-border px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto">
          <TermsContent />
        </div>
      </section>
    </div>
  );
};

export default TermsClient;
