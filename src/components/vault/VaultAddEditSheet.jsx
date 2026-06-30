"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { VAULT_FIELD_CONFIGS } from "@/lib/vault/field-configs";
import { autoTitle, autoSubtitle } from "@/lib/vault/auto-title";
import { VAULT_CATEGORIES } from "@/lib/vault/categories";
import { cn } from "@/lib/utils";

export default function VaultAddEditSheet({ category, item, open, onClose, onSave }) {
  const catMeta = VAULT_CATEGORIES.find((c) => c.id === category);
  const fields = VAULT_FIELD_CONFIGS[category] ?? [];

  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setFormData(item?.data ?? {});
      setError(null);
    }
  }, [open, item]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleSave() {
    const requiredMissing = fields.filter(
      (f) => f.required && !String(formData[f.key] ?? "").trim(),
    );
    if (requiredMissing.length > 0) {
      setError(`Please fill in: ${requiredMissing.map((f) => f.label).join(", ")}`);
      return;
    }

    setSaving(true);
    setError(null);

    const title = autoTitle(category, formData);
    const subtitle = autoSubtitle(category, formData);
    const payload = { category, title, subtitle, data: formData };

    const url = item ? `/api/vault/${item.id}` : "/api/vault";
    const method = item ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      onSave(json.item);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function setValue(key, value) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-3xl bg-white shadow-xl transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E8E4DA] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{catMeta?.emoji}</span>
            <h2 className="font-poppins text-base font-semibold text-[#1A1A1A]">
              {item ? `Edit ${catMeta?.label}` : `Add ${catMeta?.label}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0EDE6] text-[#6B6B6B]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-4 pb-2">
            {fields.map((field) => (
              <FormField
                key={field.key}
                field={field}
                value={formData[field.key] ?? ""}
                onChange={(v) => setValue(field.key, v)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="shrink-0 border-t border-[#E8E4DA] px-5 py-4"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
        >
          {error && (
            <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 font-poppins text-xs text-red-600">
              {error}
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-12 w-full rounded-2xl bg-[#1A1A1A] font-poppins text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving…" : item ? "Save Changes" : "Add to Vault"}
          </button>
        </div>
      </div>
    </>
  );
}

function FormField({ field, value, onChange }) {
  const baseClass =
    "w-full rounded-xl border border-[#E0DBD1] bg-[#FAFAF8] px-4 py-3 font-poppins text-sm text-[#1A1A1A] placeholder:text-[#AEAAA0] focus:border-[#B8A165] focus:outline-none transition-colors";

  return (
    <div>
      <label className="mb-1.5 block font-poppins text-xs font-medium text-[#4A4A4A]">
        {field.label}
        {field.required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      {field.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(baseClass, "appearance-none")}
        >
          <option value="">Select…</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? ""}
          rows={3}
          className={cn(baseClass, "resize-none")}
        />
      ) : (
        <input
          type={field.type === "number" ? "text" : field.type}
          inputMode={field.type === "number" ? "numeric" : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? ""}
          maxLength={field.maxLength}
          className={baseClass}
        />
      )}

      {field.hint && (
        <p className="mt-1 font-poppins text-[10px] text-[#8B8175]">{field.hint}</p>
      )}
    </div>
  );
}
