"use client";

import { Check, Palette } from "lucide-react";
import { toast } from "sonner";
import { SettingsGroup } from "@/components/advisor/settings/settings-ui";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { PROFILE_THEMES, type ProfileThemeId } from "@/lib/profile-themes";
import { useAdvisorSettings } from "@/lib/advisor-settings-store";
import { cn } from "@/lib/utils";

function ThemePreviewThumbnail({
  themeId,
  preview,
}: {
  themeId: ProfileThemeId;
  preview: (typeof PROFILE_THEMES)[number]["preview"];
}) {
  const isDark = themeId === "signature-dark";

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-black/8 shadow-inner"
      style={{ background: preview.background }}
      aria-hidden
    >
      <div
        className="absolute inset-x-3 top-3 h-2 rounded-full opacity-80"
        style={{
          background: isDark
            ? "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.2), transparent)"
            : "linear-gradient(90deg, transparent, oklch(0 0 0 / 0.08), transparent)",
        }}
      />
      <div
        className="absolute inset-x-3 top-6 bottom-3 rounded-lg border shadow-sm"
        style={{
          background: preview.card,
          borderColor: isDark ? "oklch(1 0 0 / 12%)" : "oklch(0 0 0 / 8%)",
        }}
      >
        <div className="flex items-center gap-2 p-2.5">
          <span
            className={cn(
              "size-5 shrink-0 rounded-full ring-2",
              isDark ? "ring-white/20" : "ring-black/10",
            )}
            style={{
              background: `linear-gradient(135deg, ${preview.accent}, ${preview.gold})`,
              boxShadow: isDark ? `0 0 12px ${preview.accent}` : "none",
            }}
          />
          <div className="min-w-0 flex-1 space-y-1">
            <div
              className="h-1.5 w-3/4 rounded-full"
              style={{ background: preview.text, opacity: 0.85 }}
            />
            <div
              className="h-1 w-1/2 rounded-full"
              style={{ background: preview.text, opacity: 0.35 }}
            />
          </div>
        </div>
        <div className="flex gap-1.5 px-2.5 pb-2.5">
          <span
            className="h-4 flex-1 rounded-md"
            style={{ background: preview.accent, opacity: isDark ? 0.35 : 0.2 }}
          />
          <span
            className="h-4 w-8 rounded-md"
            style={{ background: preview.gold, opacity: isDark ? 0.45 : 0.35 }}
          />
        </div>
      </div>
      {isDark && (
        <div
          className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full blur-2xl"
          style={{ background: preview.accent, opacity: 0.25 }}
        />
      )}
    </div>
  );
}

export function ProfileAppearanceSection() {
  const { settings, updateSettings } = useAdvisorSettings();
  const { themes: allowedThemes, limits } = usePlanLimits();
  const activeTheme = settings.appearance.theme;
  const allowedSet = new Set<ProfileThemeId>(allowedThemes);

  return (
    <SettingsGroup
      icon={Palette}
      title="Profile Appearance"
      description="Choose the visual theme for your public profile and advisor workspace. Layout and content stay the same — only colors and styling change."
      defaultOpen
    >
      <div className="py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          {PROFILE_THEMES.map((theme) => {
            const selected = activeTheme === theme.id;
            const locked = !allowedSet.has(theme.id);
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  if (selected || locked) return;
                  updateSettings({ appearance: { theme: theme.id } });
                  // Confirmation toast — without it the change feels
                  // silent on the light themes where the selected ring
                  // is hard to spot against an already-pale card.
                  toast.success(`${theme.name} theme applied`, {
                    description: "Your public profile updates instantly.",
                  });
                }}
                className={cn(
                  "group relative flex flex-col rounded-2xl border p-3 text-left transition-all duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  locked && "opacity-45 cursor-not-allowed",
                  selected
                    ? cn(
                        // Stronger ring + tint so the selected state
                        // is still clearly visible on warm-ivory and
                        // clean-white where `bg-primary/8` was nearly
                        // invisible against the already-pale surface.
                        "border-primary bg-primary/12 ring-2 ring-primary/40",
                        "shadow-[0_12px_32px_-16px_oklch(0.78_0.13_200/0.45)]",
                      )
                    : "border-border bg-card/40 hover:border-primary/30 hover:bg-card/60",
                )}
                aria-pressed={selected}
                aria-label={`${theme.name} theme${theme.isDefault ? " (default)" : ""}`}
              >
                <ThemePreviewThumbnail themeId={theme.id} preview={theme.preview} />
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold tracking-tight">{theme.name}</p>
                    {theme.isDefault && (
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                        Default
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                      {theme.tagline}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                      selected
                        ? "border-primary bg-primary text-primary-foreground scale-100 opacity-100"
                        : "border-border bg-transparent scale-90 opacity-0 group-hover:opacity-40",
                    )}
                    aria-hidden
                  >
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
          Your selection saves automatically and applies instantly across your public profile and
          advisor dashboard.
          {limits.profileThemes !== null ? (
            <> Your plan includes {limits.profileThemes} theme{limits.profileThemes === 1 ? "" : "s"}.</>
          ) : null}
        </p>
      </div>
    </SettingsGroup>
  );
}
