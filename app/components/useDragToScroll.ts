import { useRef } from "react";

export function useDragToScroll<T extends HTMLElement>(options?: {
  enabled?: boolean;
  thresholdPx?: number;
}): Pick<
  React.HTMLAttributes<T>,
  "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel" | "onPointerLeave"
> {
  const enabled = options?.enabled ?? true;
  const thresholdPx = options?.thresholdPx ?? 4;

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const movedRef = useRef(false);

  const stop = () => {
    isDraggingRef.current = false;
    movedRef.current = false;
  };

  return {
    onPointerDown: (event) => {
      if (!enabled) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      const element = event.currentTarget as unknown as HTMLElement;
      isDraggingRef.current = true;
      movedRef.current = false;
      startXRef.current = event.clientX;
      startScrollLeftRef.current = element.scrollLeft;

      element.setPointerCapture?.(event.pointerId);
    },
    onPointerMove: (event) => {
      if (!enabled) return;
      if (!isDraggingRef.current) return;

      const element = event.currentTarget as unknown as HTMLElement;
      const deltaX = event.clientX - startXRef.current;
      if (!movedRef.current && Math.abs(deltaX) >= thresholdPx) movedRef.current = true;

      element.scrollLeft = startScrollLeftRef.current - deltaX;
      if (movedRef.current) event.preventDefault();
    },
    onPointerUp: (event) => {
      if (!enabled) return;
      stop();
      const element = event.currentTarget as unknown as HTMLElement;
      element.releasePointerCapture?.(event.pointerId);
    },
    onPointerCancel: (event) => {
      if (!enabled) return;
      stop();
      const element = event.currentTarget as unknown as HTMLElement;
      element.releasePointerCapture?.(event.pointerId);
    },
    onPointerLeave: () => {
      if (!enabled) return;
      stop();
    },
  };
}
