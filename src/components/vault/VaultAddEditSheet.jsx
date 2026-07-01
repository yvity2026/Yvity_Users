"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Eye, EyeOff, Phone, X } from "lucide-react";
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
          "fixed bottom-0 left-0 right-0 z-50 flex max-h-[92dvh] flex-col rounded-t-3xl bg-white shadow-xl transition-transform duration-300 lg:left-1/4 lg:right-1/4 lg:rounded-3xl",
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
            {fields.map((field) => {
              if (field.type === "advisor-picker") {
                return (
                  <AdvisorPickerField
                    key={field.key}
                    field={field}
                    formData={formData}
                    setFormData={setFormData}
                  />
                );
              }
              if (field.type === "vault-link") {
                return (
                  <LinkedVaultItemsField
                    key={field.key}
                    field={field}
                    value={formData[field.key] ?? []}
                    onChange={(v) => setValue(field.key, v)}
                  />
                );
              }
              return (
                <FormField
                  key={field.key}
                  field={field}
                  value={formData[field.key] ?? ""}
                  onChange={(v) => setValue(field.key, v)}
                />
              );
            })}
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
  const [showSensitive, setShowSensitive] = useState(false);

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
      ) : field.sensitive ? (
        <div className="relative">
          <input
            type={showSensitive ? "text" : "password"}
            autoComplete="off"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? ""}
            className={cn(baseClass, "pr-11")}
          />
          <button
            type="button"
            onClick={() => setShowSensitive((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AEAAA0] hover:text-[#6B6B6B]"
            aria-label={showSensitive ? "Hide" : "Show"}
          >
            {showSensitive ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
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

function AdvisorPickerField({ field, formData, setFormData }) {
  const [query, setQuery] = useState(formData.advisor_name ?? "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef(null);

  const isYvityLinked = Boolean(formData.advisor_yvity_id);
  const mobile = formData.advisor_mobile ?? "";
  const cleanMobile = mobile.replace(/\D/g, "");
  const mobileValid = cleanMobile.length >= 10;
  const hasName = query.trim().length > 0;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (isYvityLinked || !query.trim() || query.length < 2) {
      setResults([]);
      setSearched(false);
      setShowResults(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/advisors/search?name=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const json = await res.json();
          setResults(json.advisors ?? []);
          setSearched(true);
          setShowResults(true);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [query, isYvityLinked]);

  function selectAdvisor(advisor) {
    setFormData((prev) => ({
      ...prev,
      advisor_name: advisor.name,
      advisor_yvity_id: advisor.id,
      advisor_yvity_slug: advisor.profileSlug ?? null,
    }));
    setQuery(advisor.name);
    setShowResults(false);
    setResults([]);
  }

  function clearAdvisor() {
    setFormData((prev) => ({
      ...prev,
      advisor_name: "",
      advisor_yvity_id: null,
      advisor_yvity_slug: null,
    }));
    setQuery("");
    setResults([]);
    setSearched(false);
    setShowResults(false);
  }

  function handleNameInput(val) {
    setQuery(val);
    setFormData((prev) => ({
      ...prev,
      advisor_name: val,
      advisor_yvity_id: null,
      advisor_yvity_slug: null,
    }));
  }

  function handleInvite() {
    const name = formData.advisor_name || "there";
    const msg = `Hi ${name}! I've noted you as my advisor in my financial vault on YVITY — India's credibility platform for insurance advisors. Join YVITY to build your verified profile and get recognised for your work.\n\nRegister here: https://www.yvity.in/register`;
    if (mobileValid) {
      const num = cleanMobile.startsWith("91") ? cleanMobile : `91${cleanMobile.slice(-10)}`;
      window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
    } else if (navigator.share) {
      navigator.share({ text: msg }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#E0DBD1] bg-[#FAFAF8] px-4 py-3 font-poppins text-sm text-[#1A1A1A] placeholder:text-[#AEAAA0] focus:border-[#B8A165] focus:outline-none transition-colors";

  return (
    <div className="space-y-2.5">
      <label className="block font-poppins text-xs font-medium text-[#4A4A4A]">
        {field.label}
      </label>

      {/* ── YVITY-linked advisor card ── */}
      {isYvityLinked ? (
        <div className="rounded-xl border border-[#0A4A4A]/20 bg-[#E8F7F7] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0A4A4A] font-poppins text-xs font-bold text-white">
              {(formData.advisor_name ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-poppins text-sm font-semibold text-[#1A1A1A]">
                {formData.advisor_name}
              </p>
              <p className="font-poppins text-[10px] text-[#0A4A4A]">✓ Verified YVITY profile linked</p>
            </div>
            <button
              type="button"
              onClick={clearAdvisor}
              className="shrink-0 rounded-full p-1 text-[#6B6B6B] hover:text-[#1A1A1A]"
              aria-label="Remove advisor"
            >
              <X size={15} />
            </button>
          </div>
          {formData.advisor_yvity_slug && (
            <a
              href={`/advisor/${formData.advisor_yvity_slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-poppins text-[11px] font-medium text-[#0A4A4A] underline underline-offset-2"
            >
              View YVITY profile →
            </a>
          )}
        </div>
      ) : (
        /* ── Name search ── */
        <div>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => handleNameInput(e.target.value)}
              placeholder={field.placeholder ?? "Search advisor on YVITY…"}
              className={cn(inputClass, loading ? "pr-10" : "")}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0A4A4A] border-t-transparent" />
              </div>
            )}
          </div>

          {showResults && (
            <div className="mt-1 overflow-hidden rounded-xl border border-[#E0DBD1] bg-white shadow-sm">
              {results.length > 0 ? (
                results.slice(0, 5).map((advisor) => (
                  <button
                    key={advisor.id}
                    type="button"
                    onClick={() => selectAdvisor(advisor)}
                    className="flex w-full items-center gap-3 border-b border-[#F0EDE6] px-4 py-3 text-left transition-colors last:border-0 hover:bg-[#F0EDE6]"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A4A4A] font-poppins text-xs font-bold text-white">
                      {advisor.name?.charAt(0) ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-poppins text-sm font-semibold text-[#1A1A1A]">
                        {advisor.name}
                      </p>
                      <p className="truncate font-poppins text-[10px] text-[#6B6B6B]">
                        {advisor.location}
                        {advisor.companies?.[0] ? ` · ${advisor.companies[0]}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#0A4A4A]/10 px-2 py-0.5 font-poppins text-[9px] font-semibold text-[#0A4A4A]">
                      YVITY ✓
                    </span>
                  </button>
                ))
              ) : (
                searched && (
                  <p className="px-4 py-3 font-poppins text-xs text-[#6B6B6B]">
                    &ldquo;{query}&rdquo; isn&apos;t on YVITY yet — enter their mobile below to call or invite them.
                  </p>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Mobile number (optional, shown once name is entered) ── */}
      {(hasName || isYvityLinked) && (
        <div>
          <label className="mb-1.5 block font-poppins text-xs font-medium text-[#4A4A4A]">
            Advisor Mobile{" "}
            <span className="font-normal text-[#AEAAA0]">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              inputMode="numeric"
              value={mobile}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, advisor_mobile: e.target.value }))
              }
              placeholder="10-digit mobile number"
              maxLength={13}
              className={cn(inputClass, "flex-1")}
            />
            {mobileValid && (
              <a
                href={`tel:+91${cleanMobile.slice(-10)}`}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#0A4A4A] px-4 py-3 font-poppins text-xs font-semibold text-white"
              >
                <Phone size={14} />
                Call
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Invite button ── */}
      {!isYvityLinked && hasName && (
        <button
          type="button"
          onClick={handleInvite}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#0A4A4A]/25 bg-white py-2.5 font-poppins text-xs font-semibold text-[#0A4A4A] transition-colors hover:bg-[#E8F7F7]"
        >
          <span>📩</span>
          {mobileValid
            ? `Send YVITY invite on WhatsApp (+91 ${cleanMobile.slice(-10)})`
            : "Invite advisor to YVITY"}
        </button>
      )}

      {field.hint && (
        <p className="font-poppins text-[10px] text-[#8B8175]">{field.hint}</p>
      )}
    </div>
  );
}

function LinkedVaultItemsField({ field, value, onChange }) {
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const selected = Array.isArray(value) ? value : [];
  const selectedIds = new Set(selected.map((s) => s.id));

  async function openAndLoad() {
    if (expanded) { setExpanded(false); return; }
    if (items.length > 0) { setExpanded(true); return; }
    setLoadingItems(true);
    try {
      const [insRes, invRes] = await Promise.all([
        fetch("/api/vault?category=insurance").then((r) => r.json()),
        fetch("/api/vault?category=investments").then((r) => r.json()),
      ]);
      const all = [
        ...(insRes.items ?? []).map((i) => ({ ...i, _catLabel: "Insurance" })),
        ...(invRes.items ?? []).map((i) => ({ ...i, _catLabel: "Investment" })),
      ];
      setItems(all);
      setExpanded(true);
    } finally {
      setLoadingItems(false);
    }
  }

  function toggle(item) {
    if (selectedIds.has(item.id)) {
      onChange(selected.filter((s) => s.id !== item.id));
    } else {
      onChange([
        ...selected,
        { id: item.id, title: item.title, subtitle: item.subtitle ?? null, category: item.category },
      ]);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block font-poppins text-xs font-medium text-[#4A4A4A]">
        {field.label}
      </label>

      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((s) => (
            <span
              key={s.id}
              className="flex items-center gap-1 rounded-full bg-[#E8F7F7] px-3 py-1 font-poppins text-[11px] text-[#0A4A4A]"
            >
              {s.title}
              <button
                type="button"
                onClick={() => toggle(s)}
                className="text-[#0A4A4A]/50 hover:text-[#0A4A4A]"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={openAndLoad}
        disabled={loadingItems}
        className="flex w-full items-center justify-between rounded-xl border border-dashed border-[#E0DBD1] bg-[#FAFAF8] px-4 py-3 font-poppins text-xs text-[#6B6B6B] transition-colors hover:bg-[#F0EDE6]"
      >
        <span>
          {loadingItems ? "Loading…" : expanded ? "Close list" : selected.length > 0 ? "Change selection" : "+ Link policy or investment"}
        </span>
        {loadingItems && (
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0A4A4A] border-t-transparent" />
        )}
      </button>

      {expanded && (
        <div className="mt-1 overflow-hidden rounded-xl border border-[#E0DBD1]">
          {items.length === 0 ? (
            <p className="px-4 py-3 font-poppins text-xs text-[#AEAAA0]">
              No insurance or investment items in your vault yet. Add some first.
            </p>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item)}
                className={cn(
                  "flex w-full items-center gap-3 border-b border-[#F0EDE6] px-4 py-3 text-left transition-colors last:border-0",
                  selectedIds.has(item.id) ? "bg-[#E8F7F7]" : "bg-white hover:bg-[#F0EDE6]",
                )}
              >
                <div
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    selectedIds.has(item.id)
                      ? "border-[#0A4A4A] bg-[#0A4A4A]"
                      : "border-[#AEAAA0] bg-white",
                  )}
                >
                  {selectedIds.has(item.id) && <Check size={10} className="text-white" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-poppins text-xs font-semibold text-[#1A1A1A]">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="truncate font-poppins text-[10px] text-[#6B6B6B]">{item.subtitle}</p>
                  )}
                </div>
                <span className="shrink-0 font-poppins text-[10px] text-[#AEAAA0]">
                  {item._catLabel}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      {field.hint && (
        <p className="mt-1 font-poppins text-[10px] text-[#8B8175]">{field.hint}</p>
      )}
    </div>
  );
}
