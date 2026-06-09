"use client";

import { useCallback, useEffect, useState } from "react";
import { Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRegisteredTestimonialServices } from "@/hooks/use-registered-testimonial-services";
import { AnimatedModalShell } from "@/components/ui/animated-modal-shell";
import type {
  TestimonialItem,
  TestimonialMemberBadge,
  TestimonialService,
  TestimonialType,
} from "@/lib/sections/types";

type TestimonialsEditorModalProps = {
  item: TestimonialItem;
  onClose: () => void;
  onSave: (item: TestimonialItem) => void;
  onDelete: (id: string) => void;
};

export function TestimonialsEditorModal({
  item,
  onClose,
  onSave,
  onDelete,
}: TestimonialsEditorModalProps) {
  const { serviceOptions } = useRegisteredTestimonialServices("all");
  const [draft, setDraft] = useState<TestimonialItem>(item);
  const [replyText, setReplyText] = useState(item.advisorReply?.text ?? "");
  const [replyDate, setReplyDate] = useState(item.advisorReply?.repliedOn ?? "");
  const [issueResolved, setIssueResolved] = useState(item.advisorReply?.issueResolved ?? false);

  useEffect(() => {
    setDraft(item);
    setReplyText(item.advisorReply?.text ?? "");
    setReplyDate(item.advisorReply?.repliedOn ?? "");
    setIssueResolved(item.advisorReply?.issueResolved ?? false);
  }, [item]);

  const patch = useCallback(
    <K extends keyof TestimonialItem>(key: K, value: TestimonialItem[K]) => {
      setDraft((d) => ({ ...d, [key]: value }));
    },
    [],
  );

  const save = () => {
    const advisorReply =
      replyText.trim().length > 0
        ? { text: replyText.trim(), repliedOn: replyDate || draft.date, issueResolved }
        : undefined;
    onSave({ ...draft, advisorReply });
    onClose();
  };

  return (
    <AnimatedModalShell
      className="z-[100]"
      onClose={onClose}
      backdropTone="heavy"
      panelClassName="w-full sm:max-w-lg glass-strong rounded-t-3xl sm:rounded-3xl border border-white/15 shadow-2xl p-5 sm:p-6 md:p-8 space-y-4 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto"
    >
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Edit testimonial
            </p>
            <p className="font-semibold">{draft.name || "Untitled"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-full glass border border-white/10"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
              value={draft.type}
              onChange={(e) => patch("type", e.target.value as TestimonialType)}
            >
              <option value="text">Text</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>
          </Field>
          <Field label="Service">
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
              value={draft.service}
              onChange={(e) => patch("service", e.target.value as TestimonialService)}
            >
              {serviceOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Name">
          <Input value={draft.name} onChange={(e) => patch("name", e.target.value)} />
        </Field>
        <Field label="Profession">
          <Input value={draft.profession} onChange={(e) => patch("profession", e.target.value)} />
        </Field>
        <Field label="Location">
          <Input value={draft.location} onChange={(e) => patch("location", e.target.value)} />
        </Field>
        <Field label="Quote">
          <Textarea rows={4} value={draft.quote} onChange={(e) => patch("quote", e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Rating (1–5)">
            <Input
              type="number"
              min={1}
              max={5}
              value={draft.rating}
              onChange={(e) =>
                patch("rating", Math.min(5, Math.max(1, Number(e.target.value) || 5)))
              }
            />
          </Field>
          <Field label="Date">
            <Input
              value={draft.date}
              onChange={(e) => patch("date", e.target.value)}
              placeholder="Jan 2026"
            />
          </Field>
        </div>

        <Field label="Member badge">
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
            value={draft.memberBadge}
            onChange={(e) => patch("memberBadge", e.target.value as TestimonialMemberBadge)}
          >
            <option value="yvity-member">YVITY Member</option>
            <option value="mobile-verified">Mobile Verified</option>
          </select>
        </Field>

        {draft.type === "audio" && (
          <Field label="Audio duration">
            <Input
              value={draft.audioDuration ?? ""}
              onChange={(e) => patch("audioDuration", e.target.value)}
              placeholder="0:45"
            />
          </Field>
        )}
        {draft.type === "video" && (
          <Field label="Video duration">
            <Input
              value={draft.videoDuration ?? ""}
              onChange={(e) => patch("videoDuration", e.target.value)}
              placeholder="1:12"
            />
          </Field>
        )}

        <div className="space-y-2 pt-2 border-t border-white/10">
          <p className="text-xs font-medium text-muted-foreground">Advisor reply (optional)</p>
          <Textarea rows={2} value={replyText} onChange={(e) => setReplyText(e.target.value)} />
          <Input
            value={replyDate}
            onChange={(e) => setReplyDate(e.target.value)}
            placeholder="Replied on"
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={issueResolved}
              onChange={(e) => setIssueResolved(e.target.checked)}
            />
            Issue resolved
          </label>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={save} className="gap-2">
            <Save className="size-4" /> Save
          </Button>
          <Button variant="destructive" onClick={() => onDelete(draft.id)} className="gap-2">
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
    </AnimatedModalShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
