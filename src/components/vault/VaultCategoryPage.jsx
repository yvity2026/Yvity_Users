"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { VAULT_CATEGORIES } from "@/lib/vault/categories";
import VaultItemCard from "./VaultItemCard";
import VaultAddEditSheet from "./VaultAddEditSheet";

export default function VaultCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const category = params?.category;

  const catMeta = VAULT_CATEGORIES.find((c) => c.id === category);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!category) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/vault?category=${encodeURIComponent(category)}`);
      const json = await res.json();
      setItems(json.items ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function handleAdd(savedItem) {
    setSheetOpen(false);
    setItems((prev) => [savedItem, ...prev]);
  }

  if (!catMeta) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-36 pt-4">
      {/* Back header */}
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0EDE6] text-[#4A4A4A]"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-xl">{catMeta.emoji}</span>
        <h1 className="font-poppins text-lg font-semibold text-[#1A1A1A]">
          {catMeta.label}
        </h1>
        {!loading && items.length > 0 && (
          <span className="ml-1 rounded-full bg-[#F5E6C8] px-2 py-0.5 font-poppins text-[10px] font-semibold text-[#8B6914]">
            {items.length}
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-2xl bg-[#E8E4DA]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <span className="text-5xl">{catMeta.emoji}</span>
          <p className="mt-4 font-poppins text-sm font-semibold text-[#1A1A1A]">
            No {catMeta.label} added yet
          </p>
          <p className="mt-1 font-poppins text-xs text-[#8C8C8C]">
            Tap + to add your first entry
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <VaultItemCard key={item.id} item={item} catMeta={catMeta} />
          ))}
        </div>
      )}

      {/* FAB — add new item */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-28 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#1A1A1A] text-white shadow-lg transition-transform active:scale-95"
        aria-label={`Add ${catMeta.label}`}
      >
        <Plus size={24} />
      </button>

      {/* Add sheet */}
      <VaultAddEditSheet
        category={category}
        item={null}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={handleAdd}
      />
    </div>
  );
}
