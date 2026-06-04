"use client";

import { useRef, useState } from "react";
import { ExternalLink, FileText, Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  VERIFICATION_ACCEPTED_HUMAN,
  VERIFICATION_ACCEPTED_MIME,
} from "@/lib/verification/service-config";
import type { VerificationDocument } from "@/lib/verification/types";
import { cn } from "@/lib/utils";

const ACCEPT_ATTR = VERIFICATION_ACCEPTED_MIME.join(",");

function uid() {
  return `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Reusable verification document upload widget. Accepts PDF / JPG / JPEG / PNG.
 * Caller owns the list of documents and the persisted label per document.
 */
export function VerificationDocumentUpload({
  documents,
  onChange,
  suggestedLabels = [],
  disabled,
}: {
  documents: VerificationDocument[];
  onChange: (next: VerificationDocument[]) => void;
  /** Suggested document type labels for this category (used as label hints). */
  suggestedLabels?: string[];
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickedFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/verification/upload", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as {
        url?: string;
        filename?: string;
        mimeType?: string;
        error?: string;
      };
      if (!res.ok || !json.url || !json.filename) {
        throw new Error(json.error ?? "Upload failed");
      }
      const nextSuggested = suggestedLabels[documents.length];
      const newDoc: VerificationDocument = {
        id: uid(),
        url: json.url,
        filename: json.filename,
        mimeType: json.mimeType ?? "application/octet-stream",
        uploadedAt: new Date().toISOString(),
        label: nextSuggested,
      };
      onChange([...documents, newDoc]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handlePickedFile(file);
    e.target.value = "";
  };

  const updateLabel = (id: string, label: string) => {
    onChange(documents.map((d) => (d.id === id ? { ...d, label } : d)));
  };

  const removeDoc = (id: string) => {
    onChange(documents.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        onChange={onFileChange}
        disabled={disabled}
      />

      {documents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/20 bg-white/[0.03] p-4 text-center">
          <FileText className="mx-auto size-6 text-muted-foreground" aria-hidden />
          <p className="mt-2 text-xs text-muted-foreground">
            Upload one or more supporting documents.
          </p>
          {suggestedLabels.length > 0 && (
            <p className="mt-1 text-[11px] text-muted-foreground/80">
              Recommended: {suggestedLabels.join(" · ")}
            </p>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] p-3"
            >
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/25">
                {doc.mimeType.startsWith("image/") ? (
                  <ImageIcon className="size-4" aria-hidden />
                ) : (
                  <FileText className="size-4" aria-hidden />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <Input
                  value={doc.label ?? ""}
                  placeholder="Document label (e.g. IRDA License)"
                  onChange={(e) => updateLabel(doc.id, e.target.value)}
                  disabled={disabled}
                  className="h-8 rounded-lg border-white/12 bg-white/[0.04] text-xs"
                />
                <p className="mt-1 text-[10px] text-muted-foreground truncate">{doc.filename}</p>
              </div>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/12 text-muted-foreground hover:text-foreground hover:bg-white/10 transition"
                aria-label={`Open ${doc.filename}`}
              >
                <ExternalLink className="size-4" />
              </a>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeDoc(doc.id)}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/12 text-muted-foreground hover:text-[oklch(0.88_0.12_15)] hover:border-[oklch(0.72_0.18_15/0.5)] transition"
                  aria-label={`Remove ${doc.filename}`}
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className={cn(
            "gap-2 rounded-xl border-dashed border-white/20",
            uploading && "opacity-80",
          )}
          disabled={uploading || disabled}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <Upload className="size-4" /> Add document
            </>
          )}
        </Button>
        <p className="text-[10px] text-muted-foreground">
          {VERIFICATION_ACCEPTED_HUMAN} · max 8 MB
        </p>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
