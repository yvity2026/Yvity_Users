"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Link2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { isHostedGalleryUrl } from "@/lib/media-urls";

export function GalleryImageUpload({
  imageUrl,
  onImageUrlChange,
  title,
  showPreview = true,
}: {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  title?: string;
  /** Set false when a larger preview is shown elsewhere (e.g. editor split layout). */
  showPreview?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "url">(
    isHostedGalleryUrl(imageUrl) ? "upload" : "url",
  );

  const uploadFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/gallery/photos", { method: "POST", body: formData });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Upload failed");
      }
      onImageUrlChange(json.url);
      setMode("upload");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
    e.target.value = "";
  };

  const isLocal = imageUrl.startsWith("/api/") || imageUrl.includes("/storage/v1/object/public/");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium border transition",
            mode === "upload"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-white/12 text-muted-foreground",
          )}
        >
          <Upload className="size-3.5 inline mr-1" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium border transition",
            mode === "url"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-white/12 text-muted-foreground",
          )}
        >
          <Link2 className="size-3.5 inline mr-1" />
          Image URL
        </button>
      </div>

      {mode === "upload" ? (
        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={onFileChange}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 rounded-xl border-dashed border-white/20 h-11"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Uploading…
              </>
            ) : (
              <>
                <ImagePlus className="size-4" /> Choose image from device
              </>
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground">JPEG, PNG, WebP, or GIF · max 5 MB</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Image URL</Label>
          <Input
            value={imageUrl}
            onChange={(e) => {
              const val = e.target.value.trim();
              onImageUrlChange(val);
              // Validate on blur via onError on the preview Image below
            }}
            onBlur={(e) => {
              const val = e.target.value.trim();
              if (val && !val.startsWith("http://") && !val.startsWith("https://")) {
                setError("Please enter a valid URL starting with https://");
              } else {
                setError(null);
              }
            }}
            placeholder="https://…"
          />
          <p className="text-[10px] text-muted-foreground">Must be a publicly accessible image URL</p>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {showPreview && imageUrl && (
        <div className="relative aspect-[4/3] w-full max-h-48 overflow-hidden rounded-xl border border-white/10 bg-black/30">
          <Image
            src={imageUrl}
            alt={title ?? "Preview"}
            fill
            className="object-cover"
            sizes="400px"
            unoptimized={isLocal}
          />
        </div>
      )}
    </div>
  );
}
