"use client";
import React from "react";
import { ContactUs } from "@/constants";

const MapSection = () => {
  return (
    <section className="w-full relative h-[420px] sm:h-[480px] lg:h-[520px] rounded-3xl border border-glass-border overflow-hidden bg-surface shadow-xs">
      {/* Label Overlay */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-10 bg-surface/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-glass-border shadow-xs pointer-events-none">
        <h2 className="text-xs font-black uppercase tracking-widest text-primary m-0">
          Store Location
        </h2>
      </div>

      <iframe
        src={ContactUs.embeddedMap}
        loading="eager"
        title="Neverbe Store Location"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 w-full h-full border-0 block"
      />
    </section>
  );
};

export default MapSection;
