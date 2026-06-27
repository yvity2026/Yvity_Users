"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";

const INDIA_STATES_AND_UTS = [
  // 28 States
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // 8 Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export function StateCombobox({ id, value = "", onChange, onBlur, error }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = query.trim()
    ? INDIA_STATES_AND_UTS.filter((s) =>
        s.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : INDIA_STATES_AND_UTS;

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

  const select = (state) => {
    setQuery(state);
    onChange(state);
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
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      setActiveIndex(0);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleBlur = () => {
    // Small delay so mousedown on a list item fires first
    setTimeout(() => {
      // If typed text is a case-insensitive exact match, normalize casing
      const match = INDIA_STATES_AND_UTS.find(
        (s) => s.toLowerCase() === query.trim().toLowerCase(),
      );
      if (match && match !== query) {
        setQuery(match);
        onChange(match);
      }
      onBlur?.();
    }, 150);
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex overflow-hidden rounded-xl border bg-[#F8F6F1] transition focus-within:border-[#F59E0B] focus-within:ring-2 focus-within:ring-[#F59E0B]/20 ${
          error ? "border-red-300" : "border-[#E6E6E6]"
        }`}
      >
        <span className="flex items-center pl-3 text-[#9CA3AF]">
          <MapPin size={14} />
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
          placeholder="Type to search state or UT…"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-haspopup="listbox"
          className="min-h-[42px] flex-1 bg-transparent px-2 py-2 text-[13px] text-[#374151] outline-none placeholder:text-[#9CA3AF]"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setOpen((o) => !o);
            inputRef.current?.focus();
          }}
          className="flex items-center px-2.5 text-[#9CA3AF] transition hover:text-[#374151]"
          aria-label="Toggle state list"
        >
          <ChevronDown
            size={15}
            className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label="Indian states and union territories"
          className="absolute left-0 right-0 z-50 mt-1 max-h-[200px] overflow-y-auto rounded-xl border border-[#E4E2DB] bg-white py-1 shadow-[0_4px_16px_rgba(10,74,74,0.12)]"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2.5 text-center font-poppins text-[12px] text-[#9CA3AF]">
              No state or UT found
            </li>
          ) : (
            filtered.map((state, i) => (
              <li
                key={state}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(state);
                }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`cursor-pointer px-3 py-2 font-poppins text-[12px] transition-colors ${
                  i === activeIndex
                    ? "bg-[#E8F4F4] font-semibold text-[#0A4A4A]"
                    : "text-[#374151] hover:bg-[#F8F6F1]"
                }`}
              >
                {state}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
