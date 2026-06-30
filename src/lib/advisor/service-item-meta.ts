import { decodeCapacityMetadata, encodeCapacityMetadata } from "@/lib/advisor/serviceCapacity";
import {
  mergeCardDisplay,
  normalizeCardDisplay,
} from "@/lib/advisor/service-card-display";
import { normalizeLicenseHolder } from "@/lib/advisor/service-license-holder";
import { embedGoldMeta } from "@/lib/server/supabase/gold-meta";
import type { ServiceItem } from "@/lib/sections/types";

export function parseKeyServices(raw: unknown): { roleLabel: string; capacityId: string } {
  const arr = Array.isArray(raw)
    ? raw.map(String)
    : raw != null && String(raw).trim()
      ? [String(raw)]
      : [];
  const capacityId = decodeCapacityMetadata(arr);
  const roleLabel = arr.find((entry) => !entry.startsWith("role:"))?.trim() ?? "";
  return { roleLabel, capacityId };
}

export function buildKeyServicesPayload(item: ServiceItem): string[] {
  const tags: string[] = [];
  if (item.roleLabel?.trim()) tags.push(item.roleLabel.trim());
  const roleTag = encodeCapacityMetadata(item.capacityId ?? "");
  if (roleTag) tags.push(roleTag);
  return tags;
}

export function buildServiceGoldMeta(item: ServiceItem): Record<string, unknown> {
  const meta: Record<string, unknown> = {};
  if (item.licenseHolder) meta.licenseHolder = item.licenseHolder;
  if (item.capacityId) meta.capacityId = item.capacityId;
  if (item.cardDisplay) meta.cardDisplay = item.cardDisplay;
  if (typeof item.teamSize === "number" && item.teamSize > 0) meta.teamSize = item.teamSize;
  if (typeof item.activeAgents === "number" && item.activeAgents > 0) {
    meta.activeAgents = item.activeAgents;
  }
  if (typeof item.branchCount === "number" && item.branchCount > 0) {
    meta.branchCount = item.branchCount;
  }
  if (item.areas && item.areas.length > 0) meta.areas = item.areas;
  if (typeof item.claimRatio === "number") meta.claimRatio = item.claimRatio;
  if (item.claimSettled && item.claimSettled.trim() && item.claimSettled !== "—") {
    meta.claimSettled = item.claimSettled.trim();
  }
  if (item.sumInsured && item.sumInsured.trim() && item.sumInsured !== "—") {
    meta.sumInsured = item.sumInsured.trim();
  }
  return meta;
}

export function parseServiceGoldMeta(meta: Record<string, unknown>, capacityFallback = "") {
  const fromMeta = String(meta.capacityId ?? "").trim();
  const resolvedCapacity = fromMeta || capacityFallback || "individual_agent";

  return {
    licenseHolder: normalizeLicenseHolder(meta.licenseHolder),
    capacityId: resolvedCapacity,
    cardDisplay: mergeCardDisplay(resolvedCapacity, normalizeCardDisplay(meta.cardDisplay)),
    teamSize: typeof meta.teamSize === "number" ? meta.teamSize : undefined,
    activeAgents: typeof meta.activeAgents === "number" ? meta.activeAgents : undefined,
    branchCount: typeof meta.branchCount === "number" ? meta.branchCount : undefined,
    claimRatio: typeof meta.claimRatio === "number" ? meta.claimRatio : undefined,
    claimSettled: typeof meta.claimSettled === "string" ? meta.claimSettled : undefined,
    sumInsured: typeof meta.sumInsured === "string" ? meta.sumInsured : undefined,
  };
}

export function serviceShortSummaryForDb(item: ServiceItem): string | null {
  const base = item.statusMessage?.trim() || "";
  const meta = buildServiceGoldMeta(item);
  if (!Object.keys(meta).length) return base || null;
  return embedGoldMeta(base, meta);
}
