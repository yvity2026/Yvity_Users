"use client";

import { useCallback, useState } from "react";
import { Check, Copy, ExternalLink, Globe, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthUserContext";
import { SettingsGroup } from "@/components/advisor/settings/settings-ui";
import { HandlePicker } from "@/components/advisor/handle-picker";
import { buildPublicProfileUrl, toPublicProfileSlugSegment } from "@/lib/advisor/public-profile-slug";
import { handleFromName } from "@/lib/advisor/handle";
import { Button } from "@/components/ui/button";

export function AdvisorHandleSection() {
  const { advisor, setAdvisor, user } = useAuth();
  const slug = advisor?.profile_slug?.trim() ?? "";
  const segment = toPublicProfileSlugSegment(slug);
  // Hyphenated suggestion derived from full name — shown as default in edit mode
  const nameSuggestion = user?.name ? handleFromName(user.name) : segment;

  const siteUrl =
    typeof window !== "undefined" ? window.location.origin : "https://yvity.com";
  const profileUrl = segment ? buildPublicProfileUrl(segment, siteUrl) : null;
  const displayUrl = profileUrl ? profileUrl.replace(/^https?:\/\//, "") : null;

  const [editing, setEditing] = useState(false);
  const [pendingHandle, setPendingHandle] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!pendingHandle) return;
    setSaving(true);
    try {
      const res = await fetch("/api/advisor/handle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: pendingHandle }),
      });
      const data = (await res.json()) as { error?: string; handle?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Could not update handle");
        return;
      }
      setAdvisor(advisor ? { ...advisor, profile_slug: data.handle ?? pendingHandle } : advisor);
      toast.success("Profile URL updated!");
      setEditing(false);
      setPendingHandle(null);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [pendingHandle, advisor, setAdvisor]);

  return (
    <SettingsGroup
      icon={Globe}
      title="Your profile URL"
      description="This is your unique YVITY link. Share it with clients to take them directly to your profile."
    >
      <div className="px-1 py-2 space-y-3">
        {editing ? (
          <>
            <p className="text-[11px] leading-snug text-muted-foreground pb-1">
              We recommend using hyphens between your name parts — e.g.{" "}
              <span className="font-semibold text-foreground">krishna-mohan-noti</span>.
              Hyphenated URLs are easier to read, share, and rank higher on Google Search.
            </p>
            <HandlePicker
              defaultHandle={nameSuggestion || segment || undefined}
              onChange={setPendingHandle}
            />
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                disabled={!pendingHandle || saving}
                onClick={handleSave}
                className="gap-1.5 rounded-full"
              >
                <Check className="size-3.5" />
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={() => { setEditing(false); setPendingHandle(null); }}
                className="gap-1.5 rounded-full border-white/15"
              >
                <X className="size-3.5" />
                Cancel
              </Button>
            </div>
          </>
        ) : segment && profileUrl ? (
          <>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5">
              <span className="flex-1 truncate text-[13px] font-semibold text-[oklch(0.82_0.13_205)]">
                {displayUrl}
              </span>
              <button
                type="button"
                aria-label="Copy profile URL"
                onClick={() => {
                  navigator.clipboard.writeText(profileUrl);
                  toast.success("Profile URL copied!");
                }}
                className="flex items-center justify-center rounded-lg p-1.5 transition hover:bg-white/10"
              >
                <Copy className="size-3.5 text-muted-foreground" />
              </button>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open profile in new tab"
                className="flex items-center justify-center rounded-lg p-1.5 transition hover:bg-white/10"
              >
                <ExternalLink className="size-3.5 text-muted-foreground" />
              </a>
              <button
                type="button"
                aria-label="Edit handle"
                onClick={() => setEditing(true)}
                className="flex items-center justify-center rounded-lg p-1.5 transition hover:bg-white/10"
              >
                <Pencil className="size-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-[11px] leading-snug text-muted-foreground">
              Your handle is <strong className="text-foreground">{segment}</strong>.{" "}
              {!segment.includes("-") && (
                <span className="text-amber-600">
                  Consider switching to a hyphenated format like{" "}
                  <strong>{nameSuggestion}</strong> for better readability and SEO.{" "}
                </span>
              )}
              Click the pencil to change it.
            </p>
          </>
        ) : (
          <>
            <p className="text-[13px] text-muted-foreground">
              You haven&apos;t claimed a personal URL yet. Pick one to make your profile easy to share.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
              className="gap-1.5 rounded-full border-white/15"
            >
              <Pencil className="size-3.5" />
              Claim your handle
            </Button>
          </>
        )}
      </div>
    </SettingsGroup>
  );
}
