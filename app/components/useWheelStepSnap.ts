"use client";

import { useEffect, useRef } from "react";

type Direction = 1 | -1;

type Options = {
  enabled?: boolean;
  lockMs?: number;
  thresholdDelta?: number;
  sectionSelector?: string;
};

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isFinePointer() {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(pointer: fine)").matches;
}

function isVerticallyScrollable(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  const overflowY = style.overflowY;
  if (overflowY !== "auto" && overflowY !== "scroll") return false;
  return element.scrollHeight > element.clientHeight + 1;
}

function canScrollFurther(element: HTMLElement, direction: Direction) {
  if (!isVerticallyScrollable(element)) return false;
  if (direction === 1) {
    return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
  }
  return element.scrollTop > 0;
}

function shouldLetNestedScroll(container: HTMLElement, target: EventTarget | null, direction: Direction) {
  let node = target instanceof HTMLElement ? target : null;
  while (node && node !== container) {
    if (canScrollFurther(node, direction)) return true;
    node = node.parentElement;
  }
  return false;
}

function getSnapSections(container: HTMLElement, selector?: string) {
  const chosen = selector?.trim();
  const all = chosen
    ? Array.from(container.querySelectorAll<HTMLElement>(chosen))
    : Array.from(container.children).filter(
        (el): el is HTMLElement => el instanceof HTMLElement && el.tagName === "SECTION",
      );

  return all.filter((el) => el.offsetParent !== null && el.offsetHeight > 0);
}

function closestSectionIndex(container: HTMLElement, sections: HTMLElement[]) {
  const scrollTop = container.scrollTop;
  let bestIndex = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < sections.length; i++) {
    const dist = Math.abs(sections[i]!.offsetTop - scrollTop);
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = i;
    }
  }
  return bestIndex;
}

export function useWheelStepSnap(
  containerRef: React.RefObject<HTMLElement | null>,
  options: Options = {},
) {
  const enabledRef = useRef<boolean>(options.enabled ?? true);
  enabledRef.current = options.enabled ?? true;

  const lockMs = options.lockMs ?? 750;
  const thresholdDelta = options.thresholdDelta ?? 70;
  const sectionSelector = options.sectionSelector;

  const wheelAccumRef = useRef(0);
  const wheelLockedRef = useRef(false);
  const wheelUnlockTimerRef = useRef<number | null>(null);
  const wheelLastTimeRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!enabledRef.current) return;
    if (!isFinePointer()) return;

    const unlock = () => {
      wheelLockedRef.current = false;
      wheelAccumRef.current = 0;
      if (wheelUnlockTimerRef.current != null) {
        window.clearTimeout(wheelUnlockTimerRef.current);
        wheelUnlockTimerRef.current = null;
      }
    };

    const scheduleUnlock = () => {
      if (wheelUnlockTimerRef.current != null) window.clearTimeout(wheelUnlockTimerRef.current);
      wheelUnlockTimerRef.current = window.setTimeout(unlock, lockMs);
    };

    const scrollStep = (direction: Direction) => {
      const sections = getSnapSections(container, sectionSelector);
      if (sections.length === 0) return;
      const currentIndex = closestSectionIndex(container, sections);
      const nextIndex = Math.max(0, Math.min(sections.length - 1, currentIndex + direction));
      const next = sections[nextIndex];
      if (!next) return;

      container.scrollTo({
        top: next.offsetTop,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    };

    const onWheel = (e: WheelEvent) => {
      if (!enabledRef.current) return;
      if (e.defaultPrevented) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (Math.abs(e.deltaY) < 1) return;

      const direction: Direction = e.deltaY > 0 ? 1 : -1;
      if (shouldLetNestedScroll(container, e.target, direction)) return;

      const now = Date.now();
      if (now - wheelLastTimeRef.current > 240) wheelAccumRef.current = 0;
      wheelLastTimeRef.current = now;

      wheelAccumRef.current += e.deltaY;
      e.preventDefault();

      if (wheelLockedRef.current) return;
      if (Math.abs(wheelAccumRef.current) < thresholdDelta) return;

      wheelLockedRef.current = true;
      wheelAccumRef.current = 0;
      scheduleUnlock();
      scrollStep(direction);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
      unlock();
    };
    // Intentionally attach once per container instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, lockMs, sectionSelector, thresholdDelta]);
}
