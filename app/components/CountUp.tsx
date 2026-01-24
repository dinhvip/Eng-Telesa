"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type CountUpProps = {
  to: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  startOnView?: boolean;
  once?: boolean;
  className?: string;
};

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function CountUp({
  to,
  durationMs = 1500,
  prefix = "",
  suffix = "",
  decimals = 0,
  startOnView = true,
  once = true,
  className,
}: CountUpProps) {
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const hasAnimatedRef = useRef(false);
  const [shouldStart, setShouldStart] = useState(!startOnView);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!startOnView) return;
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setShouldStart(true);
          if (once) observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once, startOnView]);

  useEffect(() => {
    if (!shouldStart) return;
    if (once && hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    let rafId = 0;
    const startAt = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - startAt) / Math.max(1, durationMs));
      const eased = easeOutCubic(t);
      setValue(to * eased);
      if (t < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [durationMs, once, shouldStart, to]);

  const display = useMemo(() => {
    const clamped = Math.min(to, Math.max(0, value));
    if (decimals > 0) return clamped.toFixed(decimals);
    return String(Math.round(clamped));
  }, [decimals, to, value]);

  return (
    <span ref={elementRef} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

