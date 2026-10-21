"use client";
import React from "react";
import { contactInfo } from "@/constants";
import Link from "next/link";

const ContactDetailsSection = () => {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <span className="v2-section-label mb-1">DIRECT CONTACT</span>
        <h2 className="text-2xl font-black uppercase tracking-tight text-primary m-0 mb-2">
          Get In Touch
        </h2>
        <div className="h-1 w-12 bg-accent rounded-full" />
      </div>

      <p className="text-xs md:text-sm font-medium leading-relaxed text-secondary m-0 max-w-md">
        For inquiries regarding online orders, shipping, or product sizing, contact our team directly. We respond within 24 hours.
      </p>

      <div className="space-y-4">
        {contactInfo.map((info, idx) => (
          <div key={idx}>
            <Link
              href={info.link}
              target="_blank"
              rel="noopener noreferrer"
              className="v2-glass p-5 rounded-2xl border border-glass-border hover:border-accent transition-all group flex flex-col gap-1"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                {(info as any).title || "Contact"}
              </span>
              <div className="flex items-center gap-3">
                <info.icon size={20} className="text-primary group-hover:text-accent transition-colors" />
                <span className="text-base font-black text-primary group-hover:text-accent transition-colors">
                  {info.content}
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContactDetailsSection;
