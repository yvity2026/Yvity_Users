import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { VAULT_CATEGORIES } from "@/lib/vault/categories";

export default function VaultSearchResult({ item }) {
  const catMeta = VAULT_CATEGORIES.find((c) => c.id === item.category);
  if (!catMeta) return null;

  return (
    <Link
      href={`/dashboard/vault/${item.category}/${item.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-[#E8E4DA] bg-white px-4 py-4 transition-all active:scale-[0.98] hover:border-[#B8A165] hover:shadow-sm"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F7F5EF] text-xl">
        {catMeta.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-poppins text-sm font-semibold text-[#1A1A1A]">
          {item.title}
        </p>
        {item.subtitle && (
          <p className="mt-0.5 truncate font-poppins text-[11px] text-[#8C8C8C]">
            {item.subtitle}
          </p>
        )}
        <span className="mt-1.5 inline-block rounded-full bg-[#F0EDE6] px-2 py-0.5 font-poppins text-[9px] font-medium text-[#6B6B6B]">
          {catMeta.label}
        </span>
      </div>
      <ChevronRight
        size={16}
        className="shrink-0 text-[#C4BFB3] transition-colors group-hover:text-[#B8A165]"
      />
    </Link>
  );
}
