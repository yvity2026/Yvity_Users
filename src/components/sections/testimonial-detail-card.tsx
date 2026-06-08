"use client";

import { useMemo } from "react";
import {
  BadgeCheck,
  Briefcase,
  Calendar,
  Headphones,
  MapPin,
  MessageSquare,
  Lock,
  MessageSquareReply,
  Pencil,
  Play,
  Quote,
  Shield,
  Star,
  Trash2,
  Video,
} from "lucide-react";
import { TestimonialAdvisorResponse } from "@/components/sections/testimonial-advisor-response";
import {
  testimonialTypeAccents,
  testimonialTypeLabels,
} from "@/lib/sections/testimonials-config";
import { isCustomerTestimonial } from "@/lib/sections/normalize-testimonials";
import { labelForTestimonialService } from "@/lib/sections/testimonial-service-options";
import { useServicesData } from "@/lib/sections/stores";
import type { PublicVisibility } from "@/lib/advisor-membership/content-visibility";
import type { TestimonialItem } from "@/lib/sections/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const typeIcons = {
  text: MessageSquare,
  audio: Headphones,
  video: Video,
} as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const avatarTones = [
  "from-primary to-brand-soft",
  "from-[oklch(0.38_0.09_185)] to-[oklch(0.82_0.16_162)]",
  "from-[oklch(0.55_0.13_260)] to-[oklch(0.82_0.13_205)]",
  "from-[oklch(0.32_0.06_232)] to-[oklch(0.78_0.15_295)]",
];

export function TestimonialDetailCard({
  item,
  index = 0,
  manageReplies = false,
  publicVisibility = "published",
  onReply,
  onEditReply,
  onDeleteReply,
  replyBusy = false,
}: {
  item: TestimonialItem;
  index?: number;
  manageReplies?: boolean;
  publicVisibility?: PublicVisibility;
  onReply?: () => void;
  onEditReply?: () => void;
  onDeleteReply?: () => void;
  replyBusy?: boolean;
}) {
  const [services] = useServicesData();
  const serviceLabel = useMemo(
    () => labelForTestimonialService(item.service, services, { publicOnly: false }),
    [item.service, services],
  );
  const accent = testimonialTypeAccents[item.type];
  const TypeIcon = typeIcons[item.type];
  const avatarTone = avatarTones[index % avatarTones.length];
  const customerSubmitted = isCustomerTestimonial(item);
  const isHeld = publicVisibility === "held";

  return (
    <article
      className={cn(
        "group relative flex flex-col h-full rounded-2xl sm:rounded-3xl border border-white/10 glass-strong overflow-hidden",
        "transition-all duration-500 ease-out motion-reduce:transition-none",
        "hover:border-white/20 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5",
        "animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both motion-reduce:animate-none",
        isHeld && "border-[oklch(0.85_0.16_78/0.35)]",
      )}
      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
    >
      {isHeld ? (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute inset-0 backdrop-blur-[6px] bg-background/35" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-center px-4 pt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.85_0.16_78/0.45)] bg-[oklch(0.85_0.16_78/0.15)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[oklch(0.92_0.14_78)]">
              <Lock className="size-3.5" />
              Not on public profile
            </span>
          </div>
        </div>
      ) : null}
      <header className="flex items-center justify-between gap-2 px-4 sm:px-5 pt-4 sm:pt-5">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
            accent.chip,
            accent.border,
            accent.text,
          )}
        >
          <TypeIcon className="size-3.5" />
          {testimonialTypeLabels[item.type]}
        </span>
        <div className="flex items-center gap-1.5">
          {customerSubmitted && manageReplies && (
            <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.06] px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
              Customer
            </span>
          )}
          {item.verified !== false && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.82_0.13_205/0.35)] bg-[oklch(0.82_0.13_205/0.1)] px-2 py-0.5 text-[10px] font-semibold text-[oklch(0.82_0.13_205)]">
              <BadgeCheck className="size-3" /> Verified
            </span>
          )}
        </div>
      </header>

      <div className="px-4 sm:px-5 pt-3 pb-2 flex-1 flex flex-col">
        <Quote className={cn("size-5 mb-2", accent.text)} />
        <p className="text-sm leading-relaxed text-foreground/90">&ldquo;{item.quote}&rdquo;</p>

        {item.type === "audio" && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
            {item.mediaUrl ? (
              <audio
                controls
                className="w-full h-9 accent-primary"
                src={item.mediaUrl}
                preload="metadata"
              >
                <track kind="captions" />
              </audio>
            ) : (
              <div className="flex items-center gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                  <Play className="size-4 ml-0.5" />
                </span>
                <div className="flex-1 flex items-center gap-0.5 h-6">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-0.5 rounded-full bg-white/25"
                      style={{ height: `${20 + ((i * 7) % 80)}%` }}
                    />
                  ))}
                </div>
                {item.audioDuration && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {item.audioDuration}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {item.type === "video" && (
          <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-muted/40 to-primary/30">
            {item.mediaUrl ? (
              <video
                controls
                className="absolute inset-0 size-full object-cover"
                src={item.mediaUrl}
                preload="metadata"
              >
                <track kind="captions" />
              </video>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                  <Play className="size-6 text-foreground ml-0.5" />
                </span>
              </div>
            )}
            {item.videoDuration && (
              <span className="absolute bottom-2 right-2 z-10 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] text-white pointer-events-none">
                {item.videoDuration}
              </span>
            )}
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <div
            className={cn(
              "flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-primary-foreground",
              avatarTone,
            )}
          >
            {initials(item.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">{item.name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="size-3" /> {item.profession}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3" /> {item.location}
                  </span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center justify-end gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-3.5",
                        i < item.rating
                          ? "fill-[oklch(0.82_0.16_78)] text-[oklch(0.82_0.16_78)]"
                          : "text-white/20",
                      )}
                    />
                  ))}
                </div>
                <p className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="size-3" /> {item.date}
                </p>
              </div>
            </div>
          </div>
        </div>

        {item.advisorReply && <TestimonialAdvisorResponse reply={item.advisorReply} />}
      </div>

      <footer className="mt-auto border-t border-white/10 px-4 sm:px-5 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Shield className="size-3.5 text-[oklch(0.82_0.13_205)]" />
          <span className="text-xs font-medium text-muted-foreground">
            {serviceLabel}
          </span>
        </div>

        {manageReplies && (
          <div className="flex flex-wrap gap-2 pt-1">
            {item.advisorReply ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full border-white/15 text-xs"
                  disabled={replyBusy}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditReply?.();
                  }}
                >
                  <Pencil className="size-3.5" />
                  Edit Reply
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full border-white/15 text-xs text-destructive hover:text-destructive"
                  disabled={replyBusy}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteReply?.();
                  }}
                >
                  <Trash2 className="size-3.5" />
                  Delete Reply
                </Button>
              </>
            ) : (
              <Button
                type="button"
                size="sm"
                className="h-8 rounded-full text-xs gap-1.5"
                disabled={replyBusy}
                onClick={(e) => {
                  e.stopPropagation();
                  onReply?.();
                }}
              >
                <MessageSquareReply className="size-3.5" />
                Reply
              </Button>
            )}
          </div>
        )}
      </footer>
    </article>
  );
}
