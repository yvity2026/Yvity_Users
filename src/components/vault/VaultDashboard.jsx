"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Lock, Search, X } from "lucide-react";
import { VAULT_CATEGORIES } from "@/lib/vault/categories";
import VaultSearchResult from "./VaultSearchResult";
import { cn } from "@/lib/utils";

export default function VaultDashboard() {
  const [counts, setCounts] = useState({});
  const [countsLoading, setCountsLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const inputRef = useRef(null);

  // Fetch counts on mount
  useEffect(() => {
    fetch("/api/vault")
      .then((r) => r.json())
      .then((d) => { if (d.counts) setCounts(d.counts); })
      .catch(() => {})
      .finally(() => setCountsLoading(false));
  }, []);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/vault?q=${encodeURIComponent(trimmed)}`);
        const json = await res.json();
        setResults(json.results ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const isSearching = query.trim().length > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <Lock size={18} className="text-[#B8A165]" />
        <h1 className="font-poppins text-xl font-semibold text-[#1A1A1A]">
          My Financial Vault
        </h1>
      </div>
      <p className="mb-1 font-poppins text-sm text-[#6B6B6B]">
        Your personal record of financial assets and documents — organised in one place.
      </p>

      {/* Security notice */}
      <div className="mb-5 mt-3 rounded-2xl border border-[#F5E6C8] bg-[#FFFBF2] px-4 py-3">
        <p className="font-poppins text-xs leading-relaxed text-[#8B6914]">
          🔒 <strong>Keep it safe.</strong> Do not store passwords, ATM PINs, UPI PINs, OTPs, CVV
          numbers, or internet banking credentials here.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#AEAAA0]"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your vault…"
          className="w-full rounded-2xl border border-[#E0DBD1] bg-[#FAFAF8] py-3 pl-10 pr-10 font-poppins text-sm text-[#1A1A1A] placeholder:text-[#AEAAA0] focus:border-[#B8A165] focus:outline-none transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-[#E8E4DA] text-[#6B6B6B]"
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Search results */}
      {isSearching ? (
        <>
          {searching ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[80px] animate-pulse rounded-2xl bg-[#E8E4DA]" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="mt-16 flex flex-col items-center text-center">
              <span className="text-4xl">🔍</span>
              <p className="mt-4 font-poppins text-sm font-semibold text-[#1A1A1A]">
                No results for &ldquo;{query.trim()}&rdquo;
              </p>
              <p className="mt-1 font-poppins text-xs text-[#8C8C8C]">
                Try searching by company name, policy number, or bank name
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="mb-1 font-poppins text-xs text-[#8C8C8C]">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              {results.map((item) => (
                <VaultSearchResult key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      ) : (
        /* Category grid */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {VAULT_CATEGORIES.map((cat) => {
            const count = counts[cat.id] ?? 0;
            return (
              <Link
                key={cat.id}
                href={`/dashboard/vault/${cat.id}`}
                className={cn(
                  "group flex items-center gap-4 rounded-2xl border border-[#E8E4DA] bg-white px-4 py-4 transition-all duration-150",
                  "hover:border-[#B8A165] hover:shadow-sm active:scale-[0.98]",
                )}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F7F5EF] text-2xl">
                  {cat.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-poppins text-sm font-semibold text-[#1A1A1A]">
                      {cat.label}
                    </span>
                    {countsLoading ? (
                      <div className="h-5 w-8 animate-pulse rounded bg-[#E8E4DA]" />
                    ) : count > 0 ? (
                      <span className="shrink-0 rounded-full bg-[#F5E6C8] px-2 py-0.5 font-poppins text-[10px] font-semibold text-[#8B6914]">
                        {count}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 font-poppins text-[11px] leading-tight text-[#8C8C8C]">
                    {cat.description}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="shrink-0 text-[#C4BFB3] transition-colors group-hover:text-[#B8A165]"
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
