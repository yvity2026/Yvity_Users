"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Info, Loader2, XCircle } from "lucide-react";
import { normalizeHandle, validateHandle, HANDLE_MIN, HANDLE_MAX } from "@/lib/advisor/handle";
import { cn } from "@/lib/utils";

type CheckState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available"; handle: string }
  | { status: "taken"; handle: string; suggestions: string[] }
  | { status: "invalid"; reason: string };

type HandlePickerProps = {
  /** Pre-filled suggested handle (derived from advisor name). */
  defaultHandle?: string;
  /** Called whenever a valid, available handle is confirmed. */
  onChange: (handle: string | null) => void;
  className?: string;
};

const ROOT_DOMAIN =
  process.env.NEXT_PUBLIC_SITE_URL?.includes("localhost")
    ? null
    : (process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] ?? "yvity.com");

export function HandlePicker({ defaultHandle = "", onChange, className }: HandlePickerProps) {
  const [raw, setRaw] = useState(defaultHandle);
  const [check, setCheck] = useState<CheckState>({ status: "idle" });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Run availability check whenever raw input settles
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const handle = normalizeHandle(raw);

    if (!handle) {
      setCheck({ status: "idle" });
      onChange(null);
      return;
    }

    const validation = validateHandle(handle);
    if (!validation.ok) {
      setCheck({ status: "invalid", reason: validation.reason });
      onChange(null);
      return;
    }

    setCheck({ status: "checking" });

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/advisor/check-handle?handle=${encodeURIComponent(handle)}`,
        );
        const json = await res.json();

        if (!res.ok) {
          setCheck({ status: "invalid", reason: json.error ?? "Invalid handle." });
          onChange(null);
          return;
        }

        if (json.available) {
          setCheck({ status: "available", handle: json.handle });
          onChange(json.handle);
        } else {
          setCheck({ status: "taken", handle: json.handle, suggestions: json.suggestions ?? [] });
          onChange(null);
        }
      } catch {
        setCheck({ status: "idle" });
        onChange(null);
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [raw]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = (value: string) => {
    // Strip invalid chars live so the field always shows clean input
    setRaw(value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, HANDLE_MAX));
  };

  const normalizedRaw = normalizeHandle(raw) || "yourname";
  const previewUrl = ROOT_DOMAIN
    ? `${ROOT_DOMAIN}/${normalizedRaw}`
    : `yvity.com/${normalizedRaw}`;
  const hasNoHyphens = normalizedRaw !== "yourname" && !normalizedRaw.includes("-");

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold text-[#374151]">
          Your YVITY handle <span className="text-[#F59E0B]">*</span>
        </label>

        {/* Input with status icon */}
        <div
          className={cn(
            "flex overflow-hidden rounded-xl border bg-[#F8F6F1] transition focus-within:ring-2",
            check.status === "available"
              ? "border-emerald-400 focus-within:border-emerald-400 focus-within:ring-emerald-400/20"
              : check.status === "taken" || check.status === "invalid"
                ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-400/20"
                : "border-[#E6E6E6] focus-within:border-[#F59E0B] focus-within:ring-[#F59E0B]/20",
          )}
        >
          <input
            type="text"
            value={raw}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="yourname"
            minLength={HANDLE_MIN}
            maxLength={HANDLE_MAX}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            className="min-h-[42px] flex-1 bg-transparent px-3 py-2 text-[13px] text-[#374151] outline-none placeholder:text-[#9CA3AF]"
          />
          <span className="flex items-center pr-3">
            {check.status === "checking" && (
              <Loader2 className="size-4 animate-spin text-[#9CA3AF]" />
            )}
            {check.status === "available" && (
              <CheckCircle2 className="size-4 text-emerald-500" />
            )}
            {(check.status === "taken" || check.status === "invalid") && (
              <XCircle className="size-4 text-red-400" />
            )}
          </span>
        </div>

        {/* Live URL preview */}
        <p className="mt-1.5 text-[11px] text-[#6B7280]">
          Your public profile URL:{" "}
          <span className="font-semibold text-[#0A4A4A]">{previewUrl}</span>
        </p>

        {/* Hyphen tip — shown when user types without hyphens */}
        {hasNoHyphens && (
          <div className="mt-2 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <Info className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
            <p className="text-[11px] leading-snug text-amber-800">
              <span className="font-semibold">Tip: add hyphens between your name parts</span>
              {" — e.g. "}
              <span className="font-semibold">krishna-mohan-noti</span>
              {" instead of "}
              <span className="font-semibold">krishnamohannoti</span>
              {". Hyphenated URLs are easier to read, share on WhatsApp, and rank higher on Google Search."}
            </p>
          </div>
        )}
      </div>

      {/* Status messages */}
      {check.status === "available" && (
        <p className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600">
          <CheckCircle2 className="size-3.5" />
          <span>{check.handle} is available!</span>
        </p>
      )}

      {check.status === "invalid" && (
        <p className="text-[12px] text-red-500">{check.reason}</p>
      )}

      {check.status === "taken" && (
        <div className="space-y-2">
          <p className="text-[12px] text-red-500">
            <strong>{check.handle}</strong> is already taken.
          </p>
          {check.suggestions.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-[#374151]">Try one of these:</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {check.suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRaw(s)}
                    className="rounded-full border border-[#E6E6E6] bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#0A4A4A] transition hover:border-[#F59E0B] hover:bg-[#FFFBEB]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] leading-snug text-[#9CA3AF]">
        {HANDLE_MIN}–{HANDLE_MAX} characters · lowercase letters, numbers and hyphens only ·
        cannot be changed later without contacting support
      </p>
    </div>
  );
}
