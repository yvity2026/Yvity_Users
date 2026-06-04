"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { TestimonialItem } from "@/lib/sections/types";

type TestimonialSubmitContextValue = {
  giveOpen: boolean;
  requestOpen: boolean;
  openGiveTestimonial: () => void;
  closeGiveTestimonial: () => void;
  openRequestTestimonial: () => void;
  closeRequestTestimonial: () => void;
  onPublished: (item: TestimonialItem) => void;
  registerOnPublished: (handler: (item: TestimonialItem) => void) => void;
};

const TestimonialSubmitContext = createContext<TestimonialSubmitContextValue | null>(null);

export function TestimonialSubmitProvider({ children }: { children: ReactNode }) {
  const [giveOpen, setGiveOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [publishedHandler, setPublishedHandler] = useState<
    ((item: TestimonialItem) => void) | null
  >(null);

  const openGiveTestimonial = useCallback(() => setGiveOpen(true), []);
  const closeGiveTestimonial = useCallback(() => setGiveOpen(false), []);
  const openRequestTestimonial = useCallback(() => setRequestOpen(true), []);
  const closeRequestTestimonial = useCallback(() => setRequestOpen(false), []);

  const registerOnPublished = useCallback((handler: (item: TestimonialItem) => void) => {
    setPublishedHandler(() => handler);
  }, []);

  const onPublished = useCallback(
    (item: TestimonialItem) => {
      publishedHandler?.(item);
      window.dispatchEvent(new CustomEvent("testimonials-data-updated"));
    },
    [publishedHandler],
  );

  useEffect(() => {
    if (!giveOpen && !requestOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setGiveOpen(false);
        setRequestOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [giveOpen, requestOpen]);

  const value = useMemo(
    () => ({
      giveOpen,
      requestOpen,
      openGiveTestimonial,
      closeGiveTestimonial,
      openRequestTestimonial,
      closeRequestTestimonial,
      onPublished,
      registerOnPublished,
    }),
    [
      giveOpen,
      requestOpen,
      openGiveTestimonial,
      closeGiveTestimonial,
      openRequestTestimonial,
      closeRequestTestimonial,
      onPublished,
      registerOnPublished,
    ],
  );

  return (
    <TestimonialSubmitContext.Provider value={value}>{children}</TestimonialSubmitContext.Provider>
  );
}

export function useTestimonialSubmit() {
  const ctx = useContext(TestimonialSubmitContext);
  if (!ctx) {
    throw new Error("useTestimonialSubmit must be used within TestimonialSubmitProvider");
  }
  return ctx;
}
