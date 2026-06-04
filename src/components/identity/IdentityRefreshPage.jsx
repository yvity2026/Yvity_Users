"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { IDENTITY_COPY } from "@/lib/identity/messages";
import { StepWhy } from "@/components/auth/registration/registrationUi";

export default function IdentityRefreshPage() {
  const router = useRouter();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [phase, setPhase] = useState("intro");
  const [previewUrl, setPreviewUrl] = useState("");
  const [updateProfilePhoto, setUpdateProfilePhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPhase("camera");
    } catch {
      toast.error("Allow camera access to refresh your identity");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    stopCamera();
    setPreviewUrl(canvas.toDataURL("image/jpeg", 0.92));
    setPhase("preview");
  };

  const uploadAndRefresh = async () => {
    if (!previewUrl || submitting) return;
    setSubmitting(true);
    try {
      const blob = await (await fetch(previewUrl)).blob();
      const formData = new FormData();
      formData.append("image", blob, "identity-refresh.jpg");

      const uploadRes = await fetch("/api/auth/upload-selfie", {
        method: "POST",
        body: formData,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.url) {
        throw new Error(uploadJson.error || "Upload failed");
      }

      const refreshRes = await fetch("/api/auth/identity-refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationSelfieUrl: uploadJson.url,
          updateProfilePhoto,
        }),
      });
      const refreshJson = await refreshRes.json();
      if (!refreshRes.ok) {
        throw new Error(refreshJson.error || "Refresh failed");
      }

      toast.success(refreshJson.message || "Identity refreshed for another year");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not refresh identity");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link
        href="/dashboard/activity"
        className="mb-4 inline-flex items-center gap-1.5 font-poppins text-xs font-medium text-[#6B7280] hover:text-[#F59E0B]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to activity
      </Link>

      <div className="rounded-2xl border border-[#E6E6E6] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-[#0A4A4A]">
          <ShieldCheck className="h-5 w-5 text-[#F59E0B]" />
          <h1 className="font-cormorant text-2xl font-semibold">
            {IDENTITY_COPY.refreshPage.title}
          </h1>
        </div>
        <p className="font-poppins text-[13px] leading-snug text-[#6B7280]">
          {IDENTITY_COPY.refreshPage.subtitle}
        </p>
        <StepWhy className="mt-4">{IDENTITY_COPY.refreshPage.why}</StepWhy>

        {phase === "intro" && (
          <button
            type="button"
            onClick={() => void startCamera()}
            className="mt-5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#0A4A4A] font-poppins text-[13px] font-bold text-[#F59E0B]"
          >
            <Camera className="h-4 w-4" /> Start live selfie
          </button>
        )}

        {phase === "camera" && (
          <div className="mt-5 space-y-3">
            <div className="mx-auto h-56 w-56 overflow-hidden rounded-full bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
            </div>
            <button
              type="button"
              onClick={capturePhoto}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#0A4A4A] font-poppins text-[13px] font-bold text-[#F59E0B]"
            >
              <Camera className="h-4 w-4" /> Capture
            </button>
          </div>
        )}

        {phase === "preview" && (
          <div className="mt-5 space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="mx-auto h-56 w-56 rounded-full object-cover ring-2 ring-[#F59E0B]/40"
            />
            <label className="flex items-start gap-2 rounded-xl border border-[#E6E6E6] bg-[#F8F6F1] p-3 font-poppins text-[12px] text-[#374151]">
              <input
                type="checkbox"
                checked={updateProfilePhoto}
                onChange={(e) => setUpdateProfilePhoto(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                Also update my public profile photo with this selfie. Leave unchecked to
                refresh verification only.
              </span>
            </label>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void uploadAndRefresh()}
              className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#0A4A4A] font-poppins text-[13px] font-bold text-[#F59E0B] disabled:opacity-60"
            >
              {submitting ? "Securing your account…" : "Confirm refresh"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
