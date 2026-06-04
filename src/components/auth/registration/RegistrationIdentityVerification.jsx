"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import {
  PrimaryButton,
  StepHero,
  StepWhy,
} from "@/components/auth/registration/registrationUi";
import { getLivenessStatusMessage } from "@/lib/registration/faceLiveness";

function LivenessStepPills({ actions, activeIndex, completedThrough }) {
  return (
    <div className="mb-4 flex items-center justify-center gap-2">
      {actions.map((action, index) => {
        const done = index < activeIndex;
        const active = index === activeIndex;
        return (
          <div key={action.id} className="flex flex-col items-center gap-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300 ${
                done
                  ? "bg-[#0A4A4A] text-[#F59E0B] shadow-sm"
                  : active
                    ? "bg-[#F59E0B] text-white ring-4 ring-[#F59E0B]/25 scale-110"
                    : "border border-[#E4E2DB] bg-[#F8F6F1] text-[#9CA3AF]"
              }`}
            >
              {done ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
            </div>
            <span
              className={`text-[9px] font-semibold ${
                active ? "text-[#0A4A4A]" : done ? "text-[#0A4A4A]/70" : "text-[#9CA3AF]"
              }`}
            >
              {action.shortLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CameraRing({ progress, success }) {
  const circumference = 301.59;
  const offset = circumference - progress * circumference;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
      viewBox="0 0 100 100"
      aria-hidden
    >
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="transparent"
        stroke="#E4E2DB"
        strokeWidth="3"
      />
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="transparent"
        stroke={success ? "#22c55e" : "#F59E0B"}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-150 ease-out"
      />
    </svg>
  );
}

function CameraViewport({
  setVideoRef,
  countdown = 0,
  ringProgress = 0,
  ringSuccess = false,
  label,
  showRing = true,
}) {
  return (
    <div className="relative mx-auto flex h-[15rem] w-[15rem] items-center justify-center sm:h-[16.5rem] sm:w-[16.5rem]">
      {showRing ? <CameraRing progress={ringProgress} success={ringSuccess} /> : null}
      <div className="relative z-10 h-[12.5rem] w-[12.5rem] overflow-hidden rounded-full bg-[#0A4A4A] shadow-[0_8px_32px_rgba(10,74,74,0.2)] ring-2 ring-white/80 sm:h-[13.5rem] sm:w-[13.5rem]">
        <video
          ref={setVideoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full min-h-full min-w-full object-cover"
          style={{ transform: "scaleX(-1)" }}
          onLoadedMetadata={(e) => {
            const el = e.target;
            el.width = el.videoWidth;
            el.height = el.videoHeight;
            void el.play().catch(() => {});
          }}
        />
        {countdown > 0 ? (
          <motion.div
            key={countdown}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 backdrop-blur-[2px]"
          >
            <span className="font-cormorant text-5xl font-bold tabular-nums text-white">
              {countdown}
            </span>
          </motion.div>
        ) : null}
      </div>
      {label ? (
        <p className="absolute -bottom-1 left-0 right-0 text-center text-[10px] font-medium text-[#6B7280]">
          {label}
        </p>
      ) : null}
    </div>
  );
}

function StatusBanner({ flags, matched }) {
  const message = getLivenessStatusMessage({ ...flags, matched });
  const isError = flags.multipleFaces || flags.sideView || flags.eyesClosed || flags.mask;
  const isSuccess = matched && !isError && !flags.noFace;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className={`mb-3 min-h-[44px] rounded-xl px-3 py-2.5 text-center text-[12px] font-semibold leading-snug ${
          isSuccess
            ? "bg-emerald-50 text-emerald-800"
            : isError
              ? "bg-red-50 text-red-700"
              : flags.noFace
                ? "bg-amber-50 text-amber-900"
                : "bg-[#F8F6F1] text-[#374151]"
        }`}
      >
        {message}
      </motion.div>
    </AnimatePresence>
  );
}

function LoadingCard({ title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-[#E4E2DB] bg-white p-8 text-center shadow-sm"
    >
      <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#F59E0B]" aria-hidden />
      <p className="mt-4 text-sm font-semibold text-[#0A4A4A]">{title}</p>
      <p className="mt-1 text-xs text-[#6B7280]">{subtitle}</p>
    </motion.div>
  );
}

export default function RegistrationIdentityVerification({
  onBack,
  identity,
  isSubmittingRegistration = false,
}) {
  const {
    selfieState,
    setSelfieState,
    livenessStepIndex,
    holdProgress,
    selfieCountdown,
    isUploadingSelfie,
    multipleFacesDetected,
    sideViewDetected,
    eyesClosedDetected,
    maskDetected,
    isFaceModelLoading,
    isFaceModelReady,
    faceModelError,
    poseSuccessPulse,
    setVideoElement,
    canvasRef,
    beginGuidedLiveness,
    loadFaceDetectionModel,
    captureImageAndUpload,
    resetIdentity,
    LIVENESS_ACTIONS,
  } = identity;

  const flags = {
    multipleFaces: multipleFacesDetected,
    sideView: sideViewDetected,
    eyesClosed: eyesClosedDetected,
    mask: maskDetected,
    noFace:
      !multipleFacesDetected &&
      !sideViewDetected &&
      !eyesClosedDetected &&
      !maskDetected &&
      holdProgress === 0 &&
      selfieState === "liveness",
    matched: holdProgress > 0 && holdProgress < 1,
  };

  const cancelLiveness = () => {
    resetIdentity();
    setSelfieState("instructions");
  };

  return (
    <div className="space-y-1">
      <canvas ref={canvasRef} className="hidden" aria-hidden />

      <AnimatePresence mode="wait">
        {selfieState === "instructions" && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              onClick={onBack}
              className="mb-3 flex items-center gap-1.5 text-[11px] font-medium text-[#6B7280] transition hover:text-[#F59E0B]"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <StepHero
              icon={ShieldCheck}
              title="Prove it's really you"
              subtitle="A quick live check and one selfie — this protects your account from fake profiles."
              why="We never sell your data. This one-time check matches your face to your account so only you can use it."
            />
            <StepWhy title="Before you start" className="mb-4">
              Good lighting, no mask or cap, one person in frame. Takes about 30
              seconds.
            </StepWhy>
            {(isFaceModelLoading || !isFaceModelReady) && !faceModelError ? (
              <p className="mb-3 flex items-center justify-center gap-2 text-[11px] text-[#6B7280]">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F59E0B]" />
                Preparing secure face check…
              </p>
            ) : null}
            {faceModelError ? (
              <div className="mb-3 space-y-2 rounded-lg bg-red-50 px-3 py-2 text-[11px] text-red-700">
                <p>{faceModelError}</p>
                <button
                  type="button"
                  onClick={() => void loadFaceDetectionModel()}
                  className="font-semibold text-[#0A4A4A] underline underline-offset-2"
                >
                  Retry face detection
                </button>
              </div>
            ) : null}
            <PrimaryButton
              onClick={() => void beginGuidedLiveness()}
              disabled={isFaceModelLoading || Boolean(faceModelError)}
            >
              <ArrowRight className="h-4 w-4" /> Start live verification
            </PrimaryButton>
          </motion.div>
        )}

        {selfieState === "starting" && (
          <motion.div key="starting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LoadingCard
              title="Starting camera"
              subtitle="Allow camera access when your browser asks."
            />
          </motion.div>
        )}

        {(selfieState === "liveness" ||
          selfieState === "livenessPassed" ||
          selfieState === "selfieCapture") && (
          <motion.div
            key="camera-session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative rounded-2xl border border-[#E4E2DB] bg-white p-4 shadow-sm"
          >
            <button
              type="button"
              onClick={cancelLiveness}
              className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-[#6B7280] hover:text-[#F59E0B]"
            >
              <ArrowLeft className="h-4 w-4" /> Cancel
            </button>

            {selfieState === "liveness" ? (
              <>
                <LivenessStepPills
                  actions={LIVENESS_ACTIONS}
                  activeIndex={livenessStepIndex}
                />
                <p className="mb-1 text-center font-cormorant text-lg font-bold text-[#0A4A4A]">
                  {LIVENESS_ACTIONS[livenessStepIndex]?.label}
                </p>
                <p className="mb-3 text-center text-[10px] text-[#6B7280]">
                  Step {livenessStepIndex + 1} of {LIVENESS_ACTIONS.length}
                </p>
                <StatusBanner flags={flags} matched={holdProgress > 0.2} />
              </>
            ) : null}

            {selfieState === "livenessPassed" ? (
              <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-3 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-5 w-5 text-emerald-600" strokeWidth={3} />
                </div>
                <p className="font-cormorant text-lg font-bold text-emerald-900">
                  Live check passed
                </p>
                <p className="mt-1 text-[11px] text-emerald-800">
                  Hold still — this becomes your profile photo.
                </p>
              </div>
            ) : null}

            {selfieState === "selfieCapture" ? (
              <>
                <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[#F59E0B]">
                  Verification selfie
                </p>
                <p className="mb-3 text-center text-[12px] text-[#374151]">
                  {selfieCountdown > 0
                    ? "Hold still — smile naturally"
                    : "Preparing camera…"}
                </p>
              </>
            ) : null}

            <CameraViewport
              setVideoRef={setVideoElement}
              ringProgress={selfieState === "liveness" ? holdProgress : 0}
              ringSuccess={
                selfieState === "liveness" &&
                (poseSuccessPulse || holdProgress >= 1)
              }
              showRing={selfieState === "liveness"}
              countdown={selfieState === "selfieCapture" ? selfieCountdown : 0}
              label={
                selfieState === "selfieCapture" ? "Look at the camera" : undefined
              }
            />

            {selfieState === "selfieCapture" ? (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={cancelLiveness}
                  className="min-h-[44px] flex-1 rounded-xl border border-[#E4E2DB] bg-white text-[12px] font-semibold text-[#374151]"
                >
                  Restart
                </button>
                <PrimaryButton
                  onClick={() => void captureImageAndUpload()}
                  disabled={isUploadingSelfie}
                >
                  <Camera className="h-4 w-4" />
                  {selfieCountdown > 0 ? "Capture now" : "Capture"}
                </PrimaryButton>
              </div>
            ) : null}
          </motion.div>
        )}

        {(selfieState === "uploading" ||
          selfieState === "submitting" ||
          isSubmittingRegistration) && (
          <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LoadingCard
              title={
                isSubmittingRegistration || selfieState === "submitting"
                  ? "Creating your account"
                  : "Saving your photo"
              }
              subtitle={
                isSubmittingRegistration || selfieState === "submitting"
                  ? "Opening your YVITY dashboard…"
                  : "Encrypted and stored securely."
              }
            />
          </motion.div>
        )}

        {selfieState === "readyToSubmit" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-center"
          >
            <p className="text-sm font-semibold text-emerald-800">
              Photo saved — tap below if you are not redirected automatically.
            </p>
            <PrimaryButton
              className="mt-3"
              disabled={isSubmittingRegistration}
              onClick={() => void captureImageAndUpload()}
            >
              Continue
            </PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
