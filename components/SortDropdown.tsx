"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { sortingOptions } from "@/constants";

export interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SortDropdown({
  value,
  onChange,
  className = "",
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const currentOption = sortingOptions.find((opt) => opt.value === value);
  const currentLabel =
    !currentOption || currentOption.value === "NO SELCT"
      ? "Recommended"
      : currentOption.name;

  return (
    <div
      ref={containerRef}
      className={`commerce-sort ${className}`.trim()}
    >
      <span className="commerce-sort-label">Sort by</span>

      <div className="commerce-sort-dropdown">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`commerce-sort-trigger ${isOpen ? "is-open" : ""}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Sort by: ${currentLabel}`}
        >
          <span className="commerce-sort-value">{currentLabel}</span>
          <ChevronDown
            size={14}
            className={`commerce-sort-chevron ${isOpen ? "is-flipped" : ""}`}
          />
        </button>

        {isOpen && (
          <div
            className="commerce-sort-menu"
            role="listbox"
            aria-label="Sort options"
          >
            {sortingOptions.map((option) => {
              const label =
                option.value === "NO SELCT" ? "Recommended" : option.name;
              const isSelected =
                value === option.value ||
                (!value && option.value === "NO SELCT");

              return (
                <button
                  type="button"
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`commerce-sort-option ${
                    isSelected ? "is-selected" : ""
                  }`}
                >
                  <span>{label}</span>
                  {isSelected && <Check size={14} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
