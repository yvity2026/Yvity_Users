"use client";

import React, { useEffect, useRef, useState } from "react";

const numberFormatter = new Intl.NumberFormat("en-IN");

export default function AnimatedCounter({
  value = 0,
  className = "",
  suffix = "+",
  duration = 1600,
}) {
  const normalizedValue = Math.max(0, Number(value) || 0);
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const hasAnimatedRef = useRef(false);
  const previousValueRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) {
      previousValueRef.current = normalizedValue;
      return undefined;
    }

    const startValue = hasAnimatedRef.current ? previousValueRef.current : 0;
    const startTime = performance.now();
    hasAnimatedRef.current = true;
    previousValueRef.current = normalizedValue;

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(
        startValue + (normalizedValue - startValue) * easedProgress,
      );

      setDisplayValue(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [duration, isVisible, normalizedValue]);

  return (
    <span ref={containerRef} className={className}>
      {numberFormatter.format(isVisible ? displayValue : normalizedValue)}
      {suffix}
    </span>
  );
}
