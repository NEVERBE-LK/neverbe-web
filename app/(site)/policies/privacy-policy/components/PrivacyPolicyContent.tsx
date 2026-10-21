import React from "react";
import { privacyPolicy } from "@/constants";

const PrivacyPolicyContent = () => {
  const renderSection = (key: string, value: any, index: number) => {
    if (key === "intro") return null;

    return (
      <div
        key={key}
        className="v2-glass p-8 rounded-3xl border border-glass-border hover:border-accent transition-all group mb-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <span className="text-xs font-black uppercase tracking-widest text-accent">
            {String(index).padStart(2, "0")}
          </span>
          <h2 className="text-xl font-black uppercase tracking-tight text-primary m-0">
            {value.title || key.replace(/([A-Z])/g, " $1")}
          </h2>
        </div>

        <div className="space-y-3 text-xs md:text-sm font-medium leading-relaxed text-secondary">
          {typeof value === "string" && <p className="m-0">{value}</p>}

          {value.description && <p className="m-0">{value.description}</p>}

          {Array.isArray(value) && (
            <ul className="space-y-2 m-0 p-0 list-none">
              {value.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {typeof value === "object" &&
            !Array.isArray(value) &&
            Object.entries(value).map(([subKey, subValue]) => (
              <div
                key={subKey}
                className="mt-4 p-4 rounded-2xl bg-glass border border-glass-border"
              >
                {typeof subValue === "string" && (
                  <p className="mb-2 m-0 text-xs">{subValue}</p>
                )}
                {Array.isArray(subValue) && (
                  <ul className="space-y-2 m-0 p-0 list-none">
                    {subValue.map((item: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs"
                      >
                        <span className="text-accent font-bold">›</span>{" "}
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <article className="w-full">
      {/* Intro Paragraph */}
      <div className="mb-10 max-w-3xl v2-glass p-8 rounded-3xl border border-glass-border">
        <p className="text-sm md:text-base font-medium text-primary leading-relaxed m-0">
          {privacyPolicy.sections.intro}{" "}
          <a
            href={privacyPolicy.website}
            className="text-accent underline hover:opacity-80 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {privacyPolicy.website}
          </a>
        </p>
      </div>

      {/* Sections */}
      <div className="flex flex-col">
        {Object.entries(privacyPolicy.sections).map(([key, value], idx) =>
          renderSection(key, value, idx),
        )}
      </div>
    </article>
  );
};

export default PrivacyPolicyContent;
