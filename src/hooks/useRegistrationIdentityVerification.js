"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  evaluateLivenessFrame,
  LIVENESS_ACTIONS,
  LIVENESS_HOLD_TARGET,
} from "@/lib/registration/faceLiveness";

const CAMERA_STATES = new Set([
  "starting",
  "liveness",
  "livenessPassed",
  "selfieCapture",
]);

const SELFIE_COUNTDOWN_SECONDS = 3;

export function useRegistrationIdentityVerification({
  isOpen,
  step,
  phoneValue,
  onSelfieUploaded,
}) {
  const [selfieState, setSelfieState] = useState("instructions");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [livenessStepIndex, setLivenessStepIndex] = useState(0);
  const [livenessHoldFrames, setLivenessHoldFrames] = useState(0);
  const [selfieCountdown, setSelfieCountdown] = useState(0);
  const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);
  const [multipleFacesDetected, setMultipleFacesDetected] = useState(false);
  const [sideViewDetected, setSideViewDetected] = useState(false);
  const [eyesClosedDetected, setEyesClosedDetected] = useState(false);
  const [maskDetected, setMaskDetected] = useState(false);
  const [isFaceModelLoading, setIsFaceModelLoading] = useState(false);
  const [isFaceModelReady, setIsFaceModelReady] = useState(false);
  const [faceModelError, setFaceModelError] = useState("");
  const [poseSuccessPulse, setPoseSuccessPulse] = useState(false);
  const [cameraPreviewReady, setCameraPreviewReady] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const modelRef = useRef(null);
  const modelLoadPromiseRef = useRef(null);
  const animationFrameRef = useRef(null);
  const faceLoopLastTsRef = useRef(0);
  const maskWarningFramesRef = useRef(0);
  const selfieCountdownRef = useRef(null);
  const triggerSelfieCaptureRef = useRef(() => {});
  const livenessAdvanceToastRef = useRef(false);

  const resetIdentity = useCallback(() => {
    setSelfieState("instructions");
    setSelfieUrl("");
    setLivenessStepIndex(0);
    setLivenessHoldFrames(0);
    setSelfieCountdown(0);
    setIsUploadingSelfie(false);
    setMultipleFacesDetected(false);
    setSideViewDetected(false);
    setEyesClosedDetected(false);
    setMaskDetected(false);
    setPoseSuccessPulse(false);
    setCameraPreviewReady(false);
    maskWarningFramesRef.current = 0;
    faceLoopLastTsRef.current = 0;
    livenessAdvanceToastRef.current = false;
    if (selfieCountdownRef.current) {
      window.clearInterval(selfieCountdownRef.current);
      selfieCountdownRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const createFaceDetector = useCallback(async (faceLandmarksDetection, tf) => {
    const meshModel = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;

    try {
      return await faceLandmarksDetection.createDetector(meshModel, {
        runtime: "mediapipe",
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
        refineLandmarks: true,
        maxFaces: 2,
      });
    } catch (mediapipeError) {
      console.warn("MediaPipe face runtime unavailable, trying tfjs", mediapipeError);
    }

    await import("@tensorflow/tfjs-backend-webgl");

    for (const backend of ["webgl", "cpu"]) {
      try {
        await tf.setBackend(backend);
        await tf.ready();

        return await faceLandmarksDetection.createDetector(meshModel, {
          runtime: "tfjs",
          refineLandmarks: true,
          maxFaces: 2,
        });
      } catch (backendError) {
        console.warn(`Face detection tfjs backend "${backend}" failed`, backendError);
      }
    }

    throw new Error("No face detection backend available");
  }, []);

  const loadFaceDetectionModel = useCallback(async () => {
    if (modelRef.current) {
      setIsFaceModelReady(true);
      setFaceModelError("");
      return true;
    }

    if (modelLoadPromiseRef.current) {
      return modelLoadPromiseRef.current;
    }

    setIsFaceModelLoading(true);
    setFaceModelError("");

    modelLoadPromiseRef.current = (async () => {
      try {
        const [tf, faceLandmarksDetection] = await Promise.all([
          import("@tensorflow/tfjs"),
          import("@tensorflow-models/face-landmarks-detection"),
        ]);

        await tf.ready();

        const loadedModel = await createFaceDetector(faceLandmarksDetection, tf);

        modelRef.current = loadedModel;
        setIsFaceModelReady(true);
        setFaceModelError("");
        return true;
      } catch (err) {
        console.error("Failed to load face detection model:", err);
        modelRef.current = null;
        setIsFaceModelReady(false);
        setFaceModelError(
          "Could not load face detection. Check your connection and tap Retry.",
        );
        return false;
      } finally {
        setIsFaceModelLoading(false);
        modelLoadPromiseRef.current = null;
      }
    })();

    return modelLoadPromiseRef.current;
  }, [createFaceDetector]);

  const attachStreamToVideo = useCallback(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) {
      setCameraPreviewReady(false);
      return false;
    }

    stream.getTracks().forEach((track) => {
      if (!track.enabled) track.enabled = true;
    });

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    void video.play().catch(() => {});

    const ready =
      video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0;
    setCameraPreviewReady(ready);
    return ready;
  }, []);

  /** Re-attach stream whenever the <video> node mounts (AnimatePresence swaps). */
  const setVideoElement = useCallback(
    (node) => {
      videoRef.current = node;
      if (!node || !streamRef.current) return;

      if (node.srcObject !== streamRef.current) {
        node.srcObject = streamRef.current;
      }

      const ensurePlaying = () => {
        void node.play().catch(() => {});
      };

      const markReady = () => {
        ensurePlaying();
        if (node.videoWidth > 0 && node.videoHeight > 0) {
          setCameraPreviewReady(true);
        }
      };

      markReady();
      node.addEventListener("loadedmetadata", markReady, { once: true });
      node.addEventListener("loadeddata", markReady, { once: true });
      node.addEventListener("playing", markReady, { once: true });
    },
    [],
  );

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const modelLoaded = await loadFaceDetectionModel();
      if (!modelLoaded) {
        toast.error("Face detection is still loading. Please try again.");
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 24, max: 30 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setLivenessHoldFrames(0);
      setMultipleFacesDetected(false);
      setSideViewDetected(false);
      setEyesClosedDetected(false);
      setMaskDetected(false);
      maskWarningFramesRef.current = 0;

      requestAnimationFrame(() => attachStreamToVideo());
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Allow camera access to continue identity verification.");
      return false;
    }
  }, [attachStreamToVideo, loadFaceDetectionModel]);

  const beginGuidedLiveness = useCallback(async () => {
    setSelfieState("starting");
    const started = await startCamera();
    if (!started) {
      setSelfieState("instructions");
      return;
    }
    setLivenessStepIndex(0);
    setLivenessHoldFrames(0);
    setSelfieState("liveness");
  }, [startCamera]);

  const beginSelfieCapture = useCallback(async () => {
    if (!streamRef.current) {
      const started = await startCamera();
      if (!started) {
        setSelfieState("livenessPassed");
        return;
      }
    } else {
      attachStreamToVideo();
    }
    setSelfieCountdown(0);
    setSelfieState("selfieCapture");
  }, [attachStreamToVideo, startCamera]);

  const captureImageAndUpload = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isUploadingSelfie) return;

    if (selfieCountdownRef.current) {
      window.clearInterval(selfieCountdownRef.current);
      selfieCountdownRef.current = null;
    }
    setSelfieCountdown(0);

    const video = videoRef.current;
    if (!video.videoWidth) {
      window.setTimeout(() => void captureImageAndUpload(), 100);
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setSelfieState("uploading");
    setIsUploadingSelfie(true);

    try {
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (!result) reject(new Error("Selfie capture failed"));
            else resolve(result);
          },
          "image/jpeg",
          0.9,
        );
      });

      const formData = new FormData();
      formData.append("image", blob, "selfie.jpg");
      formData.append("mobile", phoneValue || "");

      const res = await fetch("/api/auth/selfie", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        setSelfieUrl(data.url);
        if (onSelfieUploaded) {
          await onSelfieUploaded(data.url);
        } else {
          setSelfieState("readyToSubmit");
        }
      } else {
        toast.error(data.error || "Could not save your selfie. Please try again.");
        setSelfieState("instructions");
        setLivenessStepIndex(0);
      }
    } catch {
      toast.error("Network error — check your connection and try again.");
      setSelfieState("instructions");
      setLivenessStepIndex(0);
    } finally {
      setIsUploadingSelfie(false);
    }
  }, [isUploadingSelfie, onSelfieUploaded, phoneValue]);

  triggerSelfieCaptureRef.current = () => {
    void captureImageAndUpload();
  };

  useEffect(() => {
    if (!isOpen) return;
    if (step >= 3) {
      void loadFaceDetectionModel();
    }
  }, [isOpen, step, loadFaceDetectionModel]);

  useLayoutEffect(() => {
    if (!CAMERA_STATES.has(selfieState)) {
      setCameraPreviewReady(false);
      return;
    }

    attachStreamToVideo();
    const retryTimers = [0, 16, 50, 150, 300, 500, 1000].map((delay) =>
      window.setTimeout(() => attachStreamToVideo(), delay),
    );

    return () => {
      retryTimers.forEach((id) => window.clearTimeout(id));
    };
  }, [selfieState, attachStreamToVideo]);

  useEffect(() => {
    if (selfieState !== "selfieCapture") return undefined;

    let cancelled = false;

    const startCountdown = () => {
      if (cancelled || selfieCountdownRef.current) return;

      setSelfieCountdown(SELFIE_COUNTDOWN_SECONDS);
      let remaining = SELFIE_COUNTDOWN_SECONDS;

      selfieCountdownRef.current = window.setInterval(() => {
        remaining -= 1;
        setSelfieCountdown(remaining);
        if (remaining <= 0) {
          window.clearInterval(selfieCountdownRef.current);
          selfieCountdownRef.current = null;
          triggerSelfieCaptureRef.current();
        }
      }, 1000);
    };

    const waitForPreview = async () => {
      for (let attempt = 0; attempt < 50 && !cancelled; attempt += 1) {
        attachStreamToVideo();
        const video = videoRef.current;
        if (
          video?.srcObject &&
          video.readyState >= 2 &&
          video.videoWidth > 0 &&
          video.videoHeight > 0
        ) {
          startCountdown();
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 100));
      }

      if (!cancelled) {
        setSelfieCountdown(0);
        toast.error(
          "Camera preview is not ready. Allow camera access, then tap Capture.",
        );
      }
    };

    void waitForPreview();

    return () => {
      cancelled = true;
      if (selfieCountdownRef.current) {
        window.clearInterval(selfieCountdownRef.current);
        selfieCountdownRef.current = null;
      }
    };
  }, [selfieState, attachStreamToVideo]);

  useEffect(() => {
    if (selfieState !== "livenessPassed") return undefined;
    const timer = window.setTimeout(() => {
      void beginSelfieCapture();
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [selfieState, beginSelfieCapture]);

  useEffect(() => {
    let isCapturing = true;

    if (selfieState !== "liveness" || !streamRef.current) {
      return () => {
        isCapturing = false;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }

    const checkFace = async () => {
      if (!isCapturing) return;

      const now = performance.now();
      if (now - faceLoopLastTsRef.current < 50) {
        if (isCapturing) {
          animationFrameRef.current = requestAnimationFrame(checkFace);
        }
        return;
      }
      faceLoopLastTsRef.current = now;

      const video = videoRef.current;
      if (
        video &&
        video.readyState === 4 &&
        video.videoWidth > 0 &&
        modelRef.current
      ) {
        try {
          const predictions = await modelRef.current.estimateFaces(video, {
            flipHorizontal: true,
          });

          const currentActionId = LIVENESS_ACTIONS[livenessStepIndex]?.id;
          const result = evaluateLivenessFrame(
            predictions,
            currentActionId,
            maskWarningFramesRef.current,
          );

          maskWarningFramesRef.current = result.nextMaskFrames;
          setMultipleFacesDetected(result.multipleFaces);
          setSideViewDetected(result.sideView);
          setEyesClosedDetected(result.eyesClosed);
          setMaskDetected(result.mask);

          if (result.noFace) {
            setLivenessHoldFrames(0);
          } else if (result.matched) {
            setLivenessHoldFrames((prev) => {
              const next = prev + 1;
              if (next >= LIVENESS_HOLD_TARGET) {
                setPoseSuccessPulse(true);
                window.setTimeout(() => setPoseSuccessPulse(false), 600);

                if (livenessStepIndex >= LIVENESS_ACTIONS.length - 1) {
                  isCapturing = false;
                  if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                  }
                  setSelfieState("livenessPassed");
                } else {
                  setLivenessStepIndex((idx) => idx + 1);
                }
                return 0;
              }
              return next;
            });
          } else {
            setLivenessHoldFrames(0);
          }
        } catch (e) {
          console.error("Frame read error:", e);
        }
      }

      if (isCapturing) {
        animationFrameRef.current = requestAnimationFrame(checkFace);
      }
    };

    checkFace();

    return () => {
      isCapturing = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [selfieState, livenessStepIndex]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const holdProgress = Math.min(livenessHoldFrames / LIVENESS_HOLD_TARGET, 1);

  return {
    selfieState,
    setSelfieState,
    selfieUrl,
    livenessStepIndex,
    livenessHoldFrames,
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
    cameraPreviewReady,
    videoRef,
    setVideoElement,
    canvasRef,
    isCameraSessionActive: CAMERA_STATES.has(selfieState),
    resetIdentity,
    beginGuidedLiveness,
    beginSelfieCapture,
    captureImageAndUpload,
    loadFaceDetectionModel,
    LIVENESS_ACTIONS,
    LIVENESS_HOLD_TARGET,
  };
}
