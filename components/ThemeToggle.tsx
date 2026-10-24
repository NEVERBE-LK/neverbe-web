"use client";

import { useEffect } from "react";
import { Sun, Moon } from "lucide-react";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.classList.toggle("light", theme === "light");
}

export default function ThemeToggle({
  className = "",
}: {
  className?: string;
} = {}) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const followSystem = () => {
      try {
        if (localStorage.getItem("neverbe_theme")) return;
      } catch {
        /* Follow system when storage is unavailable. */
      }
      applyTheme(media.matches ? "dark" : "light");
    };
    media.addEventListener("change", followSystem);
    return () => media.removeEventListener("change", followSystem);
  }, []);
  const toggle = () => {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem("neverbe_theme", next);
    } catch {
      /* The selected theme still applies without storage. */
    }
  };
  return (
    <button
      type="button"
      onClick={toggle}
      className={`sport-icon sport-theme-toggle ${className}`.trim()}
      aria-label="Toggle light and dark mode"
      title="Toggle light and dark mode"
    >
      <Sun className="sport-theme-sun" size={20} />
      <Moon className="sport-theme-moon" size={20} />
    </button>
  );
}
