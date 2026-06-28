"use client";

import { ArrowRight, MapPin } from "lucide-react";
import { useAdvisorDisplayProfile } from "@/hooks/use-advisor-display-profile";
import { useResolvedPublicAdvisorPayload } from "@/hooks/use-resolved-public-advisor-payload";
import { googleMapsDirectionsUrl, hasOfficeLocation } from "@/lib/advisor-office-location";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReachOutToAdvisorSection() {
  const advisorProfile = useAdvisorDisplayProfile();
  // Read location directly from the server-provided advisor payload so it always
  // reflects the viewed advisor's data, not the logged-in session user's settings.
  const publicPayload = useResolvedPublicAdvisorPayload();

  const officeAddressFromPayload = publicPayload?.officeAddress?.trim() ?? "";
  const mapsLinkFromPayload = publicPayload?.mapsLink?.trim() ?? "";

  // Prefer explicit office address from the advisor's payload; fall back to city/state from profile
  const officeLabel =
    officeAddressFromPayload || advisorProfile.officeLocation?.label || "";

  const office = officeLabel
    ? {
        label: officeLabel,
        mapsLink: mapsLinkFromPayload || undefined,
      }
    : advisorProfile.officeLocation
      ? { ...advisorProfile.officeLocation, mapsLink: mapsLinkFromPayload || undefined }
      : null;

  if (!hasOfficeLocation(office)) return null;

  const mapsUrl = googleMapsDirectionsUrl(office!);

  return (
    <section className="w-full" aria-labelledby="reach-out-heading">
      <article
        className={cn(
          "relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10",
          "glass-strong p-5 sm:p-6 md:p-7",
          "text-center sm:text-left",
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-12 top-1/2 size-32 -translate-y-1/2 rounded-full bg-[oklch(0.82_0.13_205/0.1)] blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h2
              id="reach-out-heading"
              className="text-lg sm:text-xl font-bold tracking-tight text-foreground"
            >
              Reach Out To Advisor
            </h2>
            <div className="mt-3 flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:gap-3">
              <span
                className={cn(
                  "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
                  "bg-gradient-to-br from-[oklch(0.82_0.13_205)] to-primary text-white shadow-md ring-1 ring-[oklch(0.82_0.13_205/0.35)]",
                )}
              >
                <MapPin className="size-5" strokeWidth={2.25} aria-hidden />
              </span>
              <div className="min-w-0 text-center sm:text-left">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Office Location
                </p>
                <p className="mt-0.5 text-base sm:text-lg font-semibold text-foreground leading-snug">
                  {office!.label}
                </p>
              </div>
            </div>
          </div>

          <Button
            asChild
            className={cn(
              "h-11 shrink-0 rounded-full px-6 text-sm font-semibold gap-2 w-full sm:w-auto",
              "bg-gradient-to-r from-[oklch(0.88_0.16_78)] to-[oklch(0.82_0.15_72)]",
              "text-primary shadow-[oklch(0.85_0.16_78/0.3)] hover:opacity-95",
            )}
          >
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Get directions to ${office!.label}`}
            >
              Get Directions
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </article>
    </section>
  );
}
