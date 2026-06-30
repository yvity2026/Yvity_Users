"use client";

import { useEffect, useRef, useState } from "react";
import { Building2 } from "lucide-react";
import { INSURANCE_COMPANIES } from "@/lib/data/insurance-companies";

export function InsuranceCompanyCombobox({
  id,
  serviceId = "",
  value = "",
  onChange,
  onBlur,
  className = "",
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const companyList = INSURANCE_COMPANIES[serviceId] || [];

  const suggestions = query.trim()
    ? companyList.filter((c) =>
        c.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : companyList;

  // Sync when form resets
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handle = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      listRef.current.children[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const select = (company) => {
    setQuery(company);
    onChange(company);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setOpen(true);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!open && suggestions.length > 0 && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      setActiveIndex(0);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      onBlur?.();
    }, 150);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className={`flex overflow-hidden rounded-xl border bg-[#F8F6F1] transition focus-within:border-[#F59E0B] focus-within:ring-2 focus-within:ring-[#F59E0B]/20 border-[#E6E6E6] ${className}`}>
        <span className="flex items-center pl-3 text-[#9CA3AF]">
          <Building2 size={14} />
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Type to search company…"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-haspopup="listbox"
          className="min-h-[38px] flex-1 bg-transparent px-2 py-2 text-[13px] text-[#374151] outline-none placeholder:text-[#9CA3AF]"
        />
      </div>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1 max-h-[220px] overflow-y-auto rounded-xl border border-[#E4E2DB] bg-white py-1 shadow-[0_4px_16px_rgba(10,74,74,0.12)]"
        >
          {suggestions.length === 0 ? (
            <li className="px-3 py-2.5 text-center font-poppins text-[12px] text-[#9CA3AF]">
              No match — you can still type the company name
            </li>
          ) : (
            suggestions.map((company, i) => (
              <li
                key={company}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(company);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`cursor-pointer px-3 py-2 font-poppins text-[12px] transition-colors ${
                  i === activeIndex
                    ? "bg-[#E8F4F4] font-semibold text-[#0A4A4A]"
                    : "text-[#374151] hover:bg-[#F8F6F1]"
                }`}
              >
                {company}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
