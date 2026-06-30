"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { VAULT_CATEGORIES } from "@/lib/vault/categories";
import { VAULT_FIELD_CONFIGS } from "@/lib/vault/field-configs";
import VaultAddEditSheet from "./VaultAddEditSheet";

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
          <div className="mb-6">
            <h2 className="font-poppins text-xl font-bold text-[#1A1A1A]">{item.title}</h2>
            {item.subtitle && (
              <p className="mt-1 font-poppins text-sm text-[#6B6B6B]">{item.subtitle}</p>
            )}
          </div>

          {/* Field display */}
          <div className="space-y-2.5">
            {fields.map((field) => {
              const display = displayValue(field, item.data?.[field.key]);
              if (!display) return null;
              return (
                <div
                  key={field.key}
                  className="rounded-2xl border border-[#E8E4DA] bg-white px-4 py-3.5"
                >
                  <p className="font-poppins text-[10px] font-medium uppercase tracking-wide text-[#8C8C8C]">
                    {field.label}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap font-poppins text-sm text-[#1A1A1A]">
                    {display}
                  </p>
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
