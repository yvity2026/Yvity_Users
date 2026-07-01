"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { VAULT_CATEGORIES } from "@/lib/vault/categories";
import { VAULT_FIELD_CONFIGS } from "@/lib/vault/field-configs";
import VaultAddEditSheet from "./VaultAddEditSheet";

const AUTO_HIDE_MS = 60_000; // 60 seconds

function displayValue(field, raw) {
  if (raw === "" || raw === null || raw === undefined) return null;
  const str = String(raw).trim();
  if (!str) return null;

  if (field.type === "date") {
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (field.type === "number") {
    const n = Number(str);
    if (isNaN(n)) return str;
    if (field.label.includes("(₹)")) return "₹" + n.toLocaleString("en-IN");
    if (field.label.includes("(%)")) return n + "%";
    return str;
  }

  return str;
}

export default function VaultItemDetail() {
  const router = useRouter();
  const params = useParams();
  const category = params?.category;
  const id = params?.id;

  const catMeta = VAULT_CATEGORIES.find((c) => c.id === category);
  const fields = VAULT_FIELD_CONFIGS[category] ?? [];

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sensitive field reveal state
  const [revealed, setRevealed] = useState(new Set());
  const timerRef = useRef(null);

  const startOrResetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setRevealed(new Set());
    }, AUTO_HIDE_MS);
  }, []);

  // Listen for any user activity to reset the auto-hide timer
  useEffect(() => {
    if (revealed.size === 0) return;
    document.addEventListener("click", startOrResetTimer);
    document.addEventListener("scroll", startOrResetTimer, true);
    document.addEventListener("touchstart", startOrResetTimer);
    return () => {
      document.removeEventListener("click", startOrResetTimer);
      document.removeEventListener("scroll", startOrResetTimer, true);
      document.removeEventListener("touchstart", startOrResetTimer);
    };
  }, [revealed.size, startOrResetTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function toggleReveal(key) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        if (next.size === 0 && timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      } else {
        next.add(key);
        startOrResetTimer();
      }
      return next;
    });
  }

  const fetchItem = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/vault/${id}`);
      const json = await res.json();
      if (json.item) setItem(json.item);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  function handleSave(savedItem) {
    setItem(savedItem);
    setSheetOpen(false);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/vault/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push(`/dashboard/vault/${category}`);
      }
    } catch {
      setDeleting(false);
    }
  }

  if (!catMeta) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-32 pt-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0EDE6] text-[#4A4A4A]"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-xl">{catMeta.emoji}</span>
          <h1 className="font-poppins text-base font-semibold text-[#1A1A1A]">
            {catMeta.label}
          </h1>
        </div>
        {item && (
          <button
            onClick={() => setSheetOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0EDE6] text-[#4A4A4A]"
            aria-label="Edit"
          >
            <Pencil size={16} />
          </button>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-7 w-2/3 animate-pulse rounded-xl bg-[#E8E4DA]" />
          <div className="h-4 w-1/3 animate-pulse rounded-xl bg-[#E8E4DA]" />
          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-[#E8E4DA]" />
            ))}
          </div>
        </div>
      ) : !item ? (
        <div className="mt-20 text-center font-poppins text-sm text-[#8C8C8C]">
          Item not found.
        </div>
      ) : (
        <>
          {/* Title block */}
          <div className="mb-5">
            <h2 className="font-poppins text-xl font-bold text-[#1A1A1A]">{item.title}</h2>
            {item.subtitle && (
              <p className="mt-1 font-poppins text-sm text-[#6B6B6B]">{item.subtitle}</p>
            )}
          </div>

          {/* Auto-hide notice */}
          {revealed.size > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#FFFBF2] border border-[#F5E6C8] px-3 py-2">
              <EyeOff size={13} className="shrink-0 text-[#8B6914]" />
              <p className="font-poppins text-[11px] text-[#8B6914]">
                Sensitive fields will auto-hide after 60 seconds of inactivity.
              </p>
            </div>
          )}

          {/* Field display */}
          <div className="space-y-2.5">
            {fields.map((field) => {
              // vault-link: show linked policy chips
              if (field.type === "vault-link") {
                const linked = Array.isArray(item.data?.[field.key]) ? item.data[field.key] : [];
                if (linked.length === 0) return null;
                return (
                  <div key={field.key} className="rounded-2xl border border-[#E8E4DA] bg-white px-4 py-3.5">
                    <p className="mb-2 font-poppins text-[10px] font-medium uppercase tracking-wide text-[#8C8C8C]">
                      {field.label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {linked.map((p) => (
                        <span key={p.id} className="rounded-full bg-[#E8F7F7] px-3 py-1 font-poppins text-xs text-[#0A4A4A]">
                          {p.title}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }

              // advisor-picker: show name + YVITY badge if linked
              if (field.type === "advisor-picker") {
                const name = item.data?.advisor_name;
                const yvityId = item.data?.advisor_yvity_id;
                if (!name) return null;
                return (
                  <div key={field.key} className="rounded-2xl border border-[#E8E4DA] bg-white px-4 py-3.5">
                    <p className="font-poppins text-[10px] font-medium uppercase tracking-wide text-[#8C8C8C]">
                      {field.label}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="font-poppins text-sm text-[#1A1A1A]">{name}</p>
                      {yvityId && (
                        <span className="rounded-full bg-[#0A4A4A] px-2 py-0.5 font-poppins text-[10px] font-semibold text-white">
                          YVITY ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              const display = displayValue(field, item.data?.[field.key]);
              if (!display) return null;
              const isRevealed = revealed.has(field.key);

              return (
                <div
                  key={field.key}
                  className="rounded-2xl border border-[#E8E4DA] bg-white px-4 py-3.5"
                >
                  <p className="font-poppins text-[10px] font-medium uppercase tracking-wide text-[#8C8C8C]">
                    {field.label}
                  </p>
                  {field.sensitive ? (
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="font-poppins text-sm text-[#1A1A1A]">
                        {isRevealed ? display : "••••••••••••"}
                      </p>
                      <button
                        onClick={() => toggleReveal(field.key)}
                        className="flex shrink-0 items-center gap-1 rounded-lg bg-[#F0EDE6] px-2.5 py-1 font-poppins text-[11px] font-medium text-[#6B6B6B] transition-colors hover:bg-[#E8E4DA]"
                        aria-label={isRevealed ? "Hide" : "Show"}
                      >
                        {isRevealed ? (
                          <><EyeOff size={12} /> Hide</>
                        ) : (
                          <><Eye size={12} /> Show</>
                        )}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 whitespace-pre-wrap font-poppins text-sm text-[#1A1A1A]">
                      {display}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Delete */}
          <div className="mt-10">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 py-3 font-poppins text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                <Trash2 size={15} />
                Delete this entry
              </button>
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="mb-3 text-center font-poppins text-sm font-medium text-red-700">
                  Permanently delete this entry?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 rounded-xl border border-[#E0DBD1] bg-white py-2.5 font-poppins text-sm font-medium text-[#4A4A4A]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 rounded-xl bg-red-600 py-2.5 font-poppins text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {deleting ? "Deleting…" : "Yes, Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit sheet */}
      {item && (
        <VaultAddEditSheet
          category={category}
          item={item}
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
