"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import SensitiveActionOtpGate from "@/components/identity/SensitiveActionOtpGate";
import { useModalFocusTrap } from "@/hooks/use-modal-focus-trap";
import UserProfileAvatar from "@/components/user/UserProfileAvatar";
import {
  animatedModalOverlayClass,
  animatedModalPanelClass,
} from "@/components/ui/animated-modal-shell";
import { cn } from "@/lib/utils";

export default function ProfilePhotoModal({
  isOpen,
  onClose,
  user,
  onPhotoUpdated,
}) {
  const [otpVerified, setOtpVerified] = useState(false);
  const [preview, setPreview] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const panelRef = useRef(null);
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const resetSelection = useCallback(() => {
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setPendingFile(null);
  }, []);

  const handleClose = useCallback(() => {
    resetSelection();
    setOtpVerified(false);
    onClose();
  }, [onClose, resetSelection]);

  useModalFocusTrap({
    isOpen,
    panelRef,
    onEscape: handleClose,
  });

  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller");
      return;
    }
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setPendingFile(file);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", pendingFile);

      const res = await fetch("/api/auth/profile-photo", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to update photo");
      }

      toast.success(json.message || "Profile photo updated");
      onPhotoUpdated?.(json.data?.selfie_url);
      handleClose();
    } catch (error) {
      toast.error(error.message || "Could not update photo");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        animatedModalOverlayClass,
        "z-[250] bg-black/40 backdrop-blur-sm",
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-photo-title"
      onClick={handleClose}
    >
      <div
        ref={panelRef}
        className={cn(
          animatedModalPanelClass,
          "max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-white shadow-xl sm:max-w-md sm:rounded-2xl",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E4E2DB] px-5 py-4">
          <h2
            id="profile-photo-title"
            className="font-cormorant text-xl font-bold text-[#0A4A4A]"
          >
            Change profile photo
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F8F6F1]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex justify-center py-2">
            {preview ? (
              <img
                src={preview}
                alt="Selected photo preview"
                className="h-32 w-32 rounded-full object-cover ring-2 ring-[#F59E0B]"
              />
            ) : (
              <UserProfileAvatar
                src={user?.selfie_url}
                name={user?.name}
                size={128}
                className="ring-2 ring-[#F59E0B]"
              />
            )}
          </div>

          {!otpVerified ? (
            <SensitiveActionOtpGate
              compact
              onVerified={() => setOtpVerified(true)}
            />
          ) : pendingFile ? (
            <>
              <p className="text-center font-poppins text-sm leading-relaxed text-[#6B7280]">
                Happy with this photo? Confirm to update your profile picture.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={resetSelection}
                  disabled={uploading}
                  className="min-h-[48px] flex-1 rounded-full border border-[#E4E2DB] font-poppins text-sm font-semibold text-[#0A4A4A] transition hover:bg-[#F8F6F1] disabled:opacity-60"
                >
                  Choose another
                </button>
                <button
                  type="button"
                  onClick={() => void handleUpload()}
                  disabled={uploading}
                  className="min-h-[48px] flex-1 rounded-full bg-[#0A4A4A] font-poppins text-sm font-semibold text-[#F59E0B] transition hover:bg-[#083c3c] disabled:opacity-60"
                >
                  {uploading ? "Uploading…" : "Use this photo"}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="font-poppins text-sm leading-relaxed text-[#6B7280]">
                Your live verification selfie is already your profile photo. To
                replace it, verify mobile and email OTP, then upload a new image.
              </p>

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                className="hidden"
                onChange={(event) => {
                  handleFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={(event) => {
                  handleFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploading}
                className="flex min-h-[56px] w-full items-center gap-3 rounded-xl border border-[#E4E2DB] px-4 py-3 text-left transition hover:bg-[#F8F6F1] active:bg-[#F0EDE6] disabled:opacity-60"
              >
                <ImagePlus size={22} className="shrink-0 text-[#0A4A4A]" />
                <div>
                  <p className="font-poppins text-sm font-semibold text-[#0A4A4A]">
                    Choose from gallery
                  </p>
                  <p className="font-poppins text-xs text-[#6B7280]">
                    JPG, PNG, WEBP · Max 5MB
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
                className="flex min-h-[56px] w-full items-center gap-3 rounded-xl border border-[#E4E2DB] px-4 py-3 text-left transition hover:bg-[#F8F6F1] active:bg-[#F0EDE6] disabled:opacity-60"
              >
                <Camera size={22} className="shrink-0 text-[#0A4A4A]" />
                <div>
                  <p className="font-poppins text-sm font-semibold text-[#0A4A4A]">
                    Take a photo
                  </p>
                  <p className="font-poppins text-xs text-[#6B7280]">
                    Opens your device camera on supported phones
                  </p>
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
