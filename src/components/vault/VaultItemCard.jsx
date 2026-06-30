import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function VaultItemCard({ item, catMeta }) {
  return (
    <Link
      href={`/dashboard/vault/${catMeta.id}/${item.id}`}
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
      </div>
      <ChevronRight
        size={16}
        className="shrink-0 text-[#C4BFB3] transition-colors group-hover:text-[#B8A165]"
      />
    </Link>
  );
}
