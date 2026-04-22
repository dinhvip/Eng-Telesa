import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ArrowUpIcon from "../ArrowUpIcon";

interface SlideTelesaRevealProps {
  onScrollToTop: () => void;
}

export default function SlideTelesaReveal({ onScrollToTop }: SlideTelesaRevealProps) {
  // Mobile states
  const [offsetPx, setOffsetPx] = useState(0);
  const [maxOffsetPx, setMaxOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [maskBaseHeightPx, setMaskBaseHeightPx] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDragging: false, startY: 0, startOffset: 0, pointerId: null as number | null });

  // Desktop states
  const [desktopOffsetPx, setDesktopOffsetPx] = useState(0);
  const [desktopMaxOffsetPx, setDesktopMaxOffsetPx] = useState(0);
  const [desktopIsDragging, setDesktopIsDragging] = useState(false);
  const [desktopMaskBaseHeightPx, setDesktopMaskBaseHeightPx] = useState(0);
  const desktopTextRef = useRef<HTMLDivElement>(null);
  const desktopDragRef = useRef({ isDragging: false, startY: 0, startOffset: 0, pointerId: null as number | null });

  // Measure Mobile
  useEffect(() => {
    const measure = () => {
      const el = textRef.current;
      if (!el) return;
      const height = el.offsetHeight;
      if (!Number.isFinite(height) || height <= 0) return;

      const max = Math.max(0, Math.round(height * (2 / 3)));
      setMaxOffsetPx(max);
      setOffsetPx((prev) => Math.max(-max, Math.min(0, prev)));

      const viewportHeight = window.innerHeight || 0;
      if (viewportHeight > 0) {
        const minHeight = Math.round(viewportHeight * 0.35);
        const coverHeight = Math.round(viewportHeight * 0.3 + height * 0.8);
        setMaskBaseHeightPx(
          Math.max(minHeight, Math.max(0, Math.min(viewportHeight, coverHeight))),
        );
      }
    };

    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Measure Desktop
  useEffect(() => {
    const measureDesktop = () => {
      const el = desktopTextRef.current;
      if (!el) return;
      const height = el.offsetHeight;
      if (!Number.isFinite(height) || height <= 0) return;

      const viewportHeight = window.innerHeight || 0;
      const max = Math.max(0, Math.round(height * (2 / 3)));
      setDesktopMaxOffsetPx(max);
      setDesktopOffsetPx((prev) => Math.max(-max, Math.min(0, prev)));

      if (viewportHeight > 0) {
        const minHeight = Math.round(viewportHeight * 0.35);
        const coverHeight = Math.round(viewportHeight * 0.1 + height * 0.8);
        setDesktopMaskBaseHeightPx(
          Math.max(minHeight, Math.max(0, Math.min(viewportHeight, coverHeight))),
        );
      }
    };

    const raf = requestAnimationFrame(measureDesktop);
    window.addEventListener("resize", measureDesktop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measureDesktop);
    };
  }, []);

  const startDrag: React.PointerEventHandler<HTMLElement> = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (dragRef.current.isDragging) return;

    e.preventDefault();
    const pointerTarget = e.currentTarget as HTMLElement;
    const pointerId = e.pointerId;
    const startY = e.clientY;
    const startOffset = offsetPx;

    const measuredHeight = textRef.current?.offsetHeight ?? 0;
    const max = Math.max(
      maxOffsetPx,
      Math.max(0, Math.round(measuredHeight * (2 / 3))),
    );
    if (max !== maxOffsetPx) setMaxOffsetPx(max);

    dragRef.current = { isDragging: true, startY, startOffset, pointerId };
    setIsDragging(true);

    const cleanup = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onCancel);
      pointerTarget.releasePointerCapture?.(pointerId);
    };

    const onMove = (ev: PointerEvent) => {
      if (dragRef.current.pointerId !== ev.pointerId) return;
      ev.preventDefault();
      const delta = ev.clientY - startY;
      const next = Math.max(-max, Math.min(0, startOffset + delta));
      setOffsetPx(next);
    };

    const finish = (ev: PointerEvent, resetToZero: boolean) => {
      if (dragRef.current.pointerId !== ev.pointerId) return;
      cleanup();
      dragRef.current.isDragging = false;
      dragRef.current.pointerId = null;
      setIsDragging(false);
      if (resetToZero) setOffsetPx(0);
      else setOffsetPx((current) => Math.max(-max, Math.min(0, current)));
    };

    const onEnd = (ev: PointerEvent) => finish(ev, false);
    const onCancel = (ev: PointerEvent) => finish(ev, true);

    pointerTarget.setPointerCapture?.(pointerId);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onCancel);
  };

  const startDesktopDrag: React.PointerEventHandler<HTMLElement> = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (desktopDragRef.current.isDragging) return;

    e.preventDefault();
    const pointerTarget = e.currentTarget as HTMLElement;
    const pointerId = e.pointerId;
    const startY = e.clientY;
    const startOffset = desktopOffsetPx;

    const measuredHeight = desktopTextRef.current?.offsetHeight ?? 0;
    const max = Math.max(
      desktopMaxOffsetPx,
      Math.max(0, Math.round(measuredHeight * (2 / 3))),
    );
    if (max !== desktopMaxOffsetPx) setDesktopMaxOffsetPx(max);

    desktopDragRef.current = { isDragging: true, startY, startOffset, pointerId };
    setDesktopIsDragging(true);

    const cleanup = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onCancel);
      pointerTarget.releasePointerCapture?.(pointerId);
    };

    const onMove = (ev: PointerEvent) => {
      if (desktopDragRef.current.pointerId !== ev.pointerId) return;
      ev.preventDefault();
      const delta = ev.clientY - startY;
      const next = Math.max(-max, Math.min(0, startOffset + delta));
      setDesktopOffsetPx(next);
    };

    const finish = (ev: PointerEvent, resetToZero: boolean) => {
      if (desktopDragRef.current.pointerId !== ev.pointerId) return;
      cleanup();
      desktopDragRef.current.isDragging = false;
      desktopDragRef.current.pointerId = null;
      setDesktopIsDragging(false);
      if (resetToZero) setDesktopOffsetPx(0);
      else setDesktopOffsetPx((current) => Math.max(-max, Math.min(0, current)));
    };

    const onEnd = (ev: PointerEvent) => finish(ev, false);
    const onCancel = (ev: PointerEvent) => finish(ev, true);

    pointerTarget.setPointerCapture?.(pointerId);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onCancel);
  };

  const toggleReveal = () => {
    const measuredHeight = textRef.current?.offsetHeight ?? 0;
    const max = Math.max(maxOffsetPx, Math.max(0, Math.round(measuredHeight * (2 / 3))));
    setOffsetPx(offsetPx < 0 ? 0 : -max);
  };

  const toggleDesktopReveal = () => {
    const measuredHeight = desktopTextRef.current?.offsetHeight ?? 0;
    const max = Math.max(desktopMaxOffsetPx, Math.max(0, Math.round(measuredHeight * (2 / 3))));
    setDesktopOffsetPx(desktopOffsetPx < 0 ? 0 : -max);
  };

  return (
    <>
      {/* ─── DESKTOP ─── */}
      <section className="relative hidden telesa-vh-100 w-full snap-start items-stretch justify-center overflow-hidden bg-black lg:flex">
        <Image
          src="/assets/11-top.jpg"
          alt="Telesa background"
          fill
          priority
          quality={100}
          sizes="100vw"
          unoptimized
          className="pointer-events-none select-none object-cover"
        />

        <div
          className="absolute inset-x-0 bottom-0 top-[80px] z-10"
          onPointerDown={startDesktopDrag}
          style={{ touchAction: "none" }}
        >
          {desktopMaskBaseHeightPx > 0 && (
            <div
              className={`pointer-events-none absolute bottom-0 left-0 right-0 z-30 ${desktopIsDragging ? "" : "transition-[height] duration-600 ease-out"
                }`}
              style={{
                height: Math.max(0, desktopMaskBaseHeightPx + desktopOffsetPx / 2),
              }}
            >
              <Image
                src="/assets/11-top.jpg"
                alt="Telesa background mask"
                fill
                priority
                quality={100}
                sizes="100vw"
                unoptimized
                className="select-none object-cover object-center"
              />
            </div>
          )}

          <div
            className={`absolute left-0 right-0 ${desktopIsDragging ? "" : "transition-transform duration-600 ease-out"
              }`}
            style={{
              bottom: "10vh",
              transform: `translateY(${desktopOffsetPx}px)`,
              zIndex: 20,
            }}
          >
            <div className="flex w-full items-end justify-center pb-2">
              <div
                ref={desktopTextRef}
                role="button"
                tabIndex={0}
                onPointerDown={startDesktopDrag}
                onClick={toggleDesktopReveal}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  e.preventDefault();
                  toggleDesktopReveal();
                }}
                className="w-[80vw] max-w-full cursor-grab select-none whitespace-nowrap text-center text-[clamp(72px,17vw,300px)] font-extrabold leading-none tracking-[0.22em] text-white drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)] active:cursor-grabbing"
                style={{ touchAction: "none" }}
              >
                TELESA
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MOBILE ─── */}
      <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center overflow-hidden bg-black lg:hidden">
        <Image
          src="/assets/11-top.jpg"
          alt="Telesa background"
          fill
          priority
          quality={100}
          sizes="100vw"
          unoptimized
          className="pointer-events-none select-none object-cover"
        />

        <div className="absolute inset-0 z-10 lg:pointer-events-none">
          {maskBaseHeightPx > 0 && (
            <div
              className={`pointer-events-none absolute bottom-0 left-0 right-0 z-30 ${isDragging ? "" : "transition-[height] duration-600 ease-out"
                }`}
              style={{
                height: Math.max(0, maskBaseHeightPx + offsetPx / 2),
              }}
            >
              <Image
                src="/assets/11-top.jpg"
                alt="Telesa background mask"
                fill
                priority
                quality={100}
                sizes="100vw"
                unoptimized
                className="select-none object-cover object-center"
              />
            </div>
          )}

          <div
            className={`absolute left-0 right-0 ${isDragging ? "" : "transition-transform duration-600 ease-out"
              }`}
            style={{
              bottom: "30vh",
              transform: `translateY(${offsetPx}px)`,
              zIndex: 20,
            }}
          >
            <div className="flex w-full items-end justify-center pb-2">
              <div
                ref={textRef}
                role="button"
                tabIndex={0}
                onPointerDown={startDrag}
                onClick={toggleReveal}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  e.preventDefault();
                  toggleReveal();
                }}
                className="w-[90vw] max-w-full cursor-grab select-none whitespace-nowrap text-center text-[72px] font-extrabold leading-none tracking-[0.22em] text-white drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)] active:cursor-grabbing"
                style={{ touchAction: "none" }}
              >
                TELESA
              </div>
            </div>
          </div>
        </div>

        {/* Floating up button */}
        <div className="pointer-events-none absolute bottom-6 right-6 z-20">
          <div className="pointer-events-auto">
            <button
              type="button"
              onClick={onScrollToTop}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md"
              aria-label="Lên đầu trang"
            >
              <ArrowUpIcon size={20} className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
