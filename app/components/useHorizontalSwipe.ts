import { useRef } from "react";

export type HorizontalSwipeHandlers<T extends HTMLElement> = Pick<
  React.HTMLAttributes<T>,
  | "onTouchStart"
  | "onTouchMove"
  | "onTouchEnd"
  | "onTouchCancel"
  | "onMouseDown"
  | "onMouseUp"
  | "onPointerDown"
  | "onPointerMove"
  | "onPointerUp"
  | "onPointerCancel"
>;

export function useHorizontalSwipe<T extends HTMLElement>(options: {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  thresholdPx?: number;
  restraintPx?: number;
}): HorizontalSwipeHandlers<T> {
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const triggeredRef = useRef(false);

  const thresholdPx = options.thresholdPx ?? 40;
  const restraintPx = options.restraintPx ?? 80;

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (typeof Element === "undefined") return false;
    if (!(target instanceof Element)) return false;
    return Boolean(
      target.closest(
        'button,a,input,textarea,select,summary,[role="button"],[role="link"],[data-no-swipe]',
      ),
    );
  };

  const reset = () => {
    startXRef.current = null;
    startYRef.current = null;
    triggeredRef.current = false;
  };

  const onTouchStart: React.TouchEventHandler<T> = (e) => {
    if (isInteractiveTarget(e.target)) return;
    const t = e.touches[0];
    if (!t) return;
    startXRef.current = t.clientX;
    startYRef.current = t.clientY;
    triggeredRef.current = false;
  };

  const onTouchMove: React.TouchEventHandler<T> = (e) => {
    if (triggeredRef.current) return;
    if (startXRef.current == null || startYRef.current == null) return;
    const t = e.touches[0];
    if (!t) return;

    const dx = t.clientX - startXRef.current;
    const dy = t.clientY - startYRef.current;

    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dy) > restraintPx) return;
    if (Math.abs(dx) < thresholdPx) return;

    triggeredRef.current = true;
    if (dx < 0) options.onSwipeLeft();
    else options.onSwipeRight();
  };

  const onTouchEnd: React.TouchEventHandler<T> = () => reset();
  const onTouchCancel: React.TouchEventHandler<T> = () => reset();

  const onMouseDown: React.MouseEventHandler<T> = (e) => {
    if (isInteractiveTarget(e.target)) return;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    triggeredRef.current = false;
  };

  const onMouseUp: React.MouseEventHandler<T> = (e) => {
    if (startXRef.current == null || startYRef.current == null) return;
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;
    reset();

    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dy) > restraintPx) return;
    if (Math.abs(dx) < thresholdPx) return;

    if (dx < 0) options.onSwipeLeft();
    else options.onSwipeRight();
  };

  const onPointerDown: React.PointerEventHandler<T> = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (isInteractiveTarget(e.target)) return;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    triggeredRef.current = false;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove: React.PointerEventHandler<T> = (e) => {
    if (triggeredRef.current) return;
    if (startXRef.current == null || startYRef.current == null) return;

    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dy) > restraintPx) return;
    if (Math.abs(dx) < thresholdPx) return;

    e.preventDefault();
    triggeredRef.current = true;
    if (dx < 0) options.onSwipeLeft();
    else options.onSwipeRight();
  };

  const onPointerUp: React.PointerEventHandler<T> = () => reset();
  const onPointerCancel: React.PointerEventHandler<T> = () => reset();

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    onMouseDown,
    onMouseUp,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };
}
