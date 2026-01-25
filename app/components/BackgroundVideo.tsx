"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

type BackgroundVideoProps = Omit<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  "children" | "src" | "muted" | "loop" | "playsInline" | "controls" | "preload"
> & {
  src: string;
  autoplayInWebView?: boolean;
};

export type BackgroundVideoHandle = {
  play: () => void;
  pause: () => void;
};

function isProbablyWebView() {
  if (typeof navigator === "undefined" || typeof window === "undefined") return false;
  const ua = navigator.userAgent ?? "";

  const isAndroidWebView = /\bwv\b/.test(ua) || /\bVersion\/\d+\.\d+\b/.test(ua);
  const isIOS = /iP(hone|od|ad)/.test(ua);
  const isIOSSafari = isIOS && /\bSafari\b/.test(ua) && !/\b(CriOS|FxiOS|EdgiOS)\b/.test(ua);
  const isIOSWebView = isIOS && !isIOSSafari;

  const hasRNWebView = typeof (window as any).ReactNativeWebView !== "undefined";
  const hasFlutterInAppWebView = typeof (window as any).flutter_inappwebview !== "undefined";
  const hasWKMessageHandlers =
    typeof (window as any).webkit !== "undefined" &&
    typeof (window as any).webkit.messageHandlers !== "undefined";

  return (
    isAndroidWebView ||
    isIOSWebView ||
    hasRNWebView ||
    hasFlutterInAppWebView ||
    hasWKMessageHandlers
  );
}

const BackgroundVideo = forwardRef<BackgroundVideoHandle, BackgroundVideoProps>(function BackgroundVideo(
  { src, className, autoplayInWebView, ...rest },
  ref,
) {
  const [isWebView, setIsWebView] = useState(false);
  const layerIdRef = useRef(0);
  const videoElementsRef = useRef<Map<number, HTMLVideoElement>>(new Map());
  const userActivatedRef = useRef(false);
  const [isInView, setIsInView] = useState(true);
  const [layers, setLayers] = useState<Array<{ id: number; src: string; ready: boolean }>>([
    { id: 0, src, ready: false },
  ]);

  useEffect(() => {
    setIsWebView(isProbablyWebView());
  }, []);

  const webViewInlineAttrs = useMemo(
    () =>
      ({
        "webkit-playsinline": "true",
        "x5-playsinline": "true",
        "x-webkit-airplay": "deny",
      }) as Record<string, string>,
    [],
  );

  const shouldAutoplay = isWebView ? Boolean(autoplayInWebView) : true;

  const getTopVideoElement = useCallback(() => {
    const top = layers[layers.length - 1];
    if (!top) return null;
    return videoElementsRef.current.get(top.id) ?? null;
  }, [layers]);

  const attemptPlayTop = useCallback(() => {
    if (!shouldAutoplay) return;
    if (!isInView) return;
    const el = getTopVideoElement();
    if (!el) return;

    try {
      el.muted = true;
      el.playsInline = true;
      el.setAttribute("playsinline", "");
      el.setAttribute("webkit-playsinline", "true");
    } catch {}

    el.play().catch(() => {});
  }, [getTopVideoElement, isInView, shouldAutoplay]);

  useImperativeHandle(
    ref,
    () => ({
      play: () => attemptPlayTop(),
      pause: () => {
        for (const el of videoElementsRef.current.values()) {
          el.pause?.();
        }
      },
    }),
    [attemptPlayTop],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onActivate = () => {
      if (userActivatedRef.current) return;
      userActivatedRef.current = true;
      attemptPlayTop();
    };

    window.addEventListener("pointerdown", onActivate, { once: true, passive: true });
    window.addEventListener("touchstart", onActivate, { once: true, passive: true });
    window.addEventListener("click", onActivate, { once: true, passive: true });

    return () => {
      window.removeEventListener("pointerdown", onActivate);
      window.removeEventListener("touchstart", onActivate);
      window.removeEventListener("click", onActivate);
    };
  }, [attemptPlayTop]);

  useEffect(() => {
    if (!shouldAutoplay) return;
    const timer = window.setTimeout(() => {
      for (const el of videoElementsRef.current.values()) {
        el.play().catch(() => {});
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [shouldAutoplay]);

  useEffect(() => {
    if (!shouldAutoplay) return;
    const timer = window.setTimeout(() => {
      attemptPlayTop();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [layers, shouldAutoplay]);

  useEffect(() => {
    setLayers((prev) => {
      const last = prev[prev.length - 1];
      if (last?.src === src) return prev;
      const nextId = (layerIdRef.current += 1);
      return [...prev, { id: nextId, src, ready: false }];
    });
  }, [src]);

  const transitionMs = 320;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = getTopVideoElement();
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const inView = Boolean(entry?.isIntersecting) && (entry?.intersectionRatio ?? 0) >= 0.15;
        setIsInView(inView);
        if (inView) attemptPlayTop();
      },
      { threshold: [0, 0.15, 0.5, 1] },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [attemptPlayTop, getTopVideoElement, layers.length]);

  useEffect(() => {
    if (!shouldAutoplay) return;
    if (!isInView) return;

    let retry = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      attemptPlayTop();
      retry += 1;
      if (retry >= 6) return;
      window.setTimeout(tick, 450);
    };

    window.setTimeout(tick, 0);
    return () => {
      cancelled = true;
    };
  }, [attemptPlayTop, isInView, shouldAutoplay]);

  useEffect(() => {
    const top = layers[layers.length - 1];
    if (!top?.ready) return;
    if (layers.length <= 1) return;

    const timer = window.setTimeout(() => {
      setLayers((prev) => {
        const newest = prev[prev.length - 1];
        if (!newest?.ready) return prev;
        return [newest];
      });
    }, transitionMs);
    return () => window.clearTimeout(timer);
  }, [layers]);

  const { style, onLoadedData, onCanPlay, onError, ...passthrough } = rest;

  return (
    <>
      {layers.map((layer, index) => {
        const isTop = index === layers.length - 1;
        const hasUnderLayer = layers.length > 1;
        const shouldShowTop = !hasUnderLayer || layer.ready;
        const opacityClass = isTop
          ? shouldShowTop
            ? "opacity-100"
            : "opacity-0"
          : layers[layers.length - 1]?.ready
            ? "opacity-0"
            : "opacity-100";

        return (
          <video
            key={layer.id}
            {...(webViewInlineAttrs as any)}
            className={[
              "pointer-events-none transition-opacity ease-out",
              opacityClass,
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              ...(style ?? {}),
              transitionDuration: `${transitionMs}ms`,
            }}
            ref={(el) => {
              if (!el) {
                videoElementsRef.current.delete(layer.id);
                return;
              }
              try {
                el.muted = true;
                el.playsInline = true;
                el.setAttribute("playsinline", "");
                el.setAttribute("webkit-playsinline", "true");
              } catch {}
              videoElementsRef.current.set(layer.id, el);
            }}
            src={layer.src}
            autoPlay={shouldAutoplay}
            muted
            loop
            playsInline
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload noplaybackrate noremoteplayback"
            preload={isWebView ? "none" : "auto"}
            aria-hidden="true"
            tabIndex={-1}
            onContextMenu={(e) => e.preventDefault()}
            onLoadedData={(event) => {
              if (isTop) {
                setLayers((prev) => {
                  const last = prev[prev.length - 1];
                  if (!last || last.id !== layer.id) return prev;
                  if (last.ready) return prev;
                  return [...prev.slice(0, -1), { ...last, ready: true }];
                });
                attemptPlayTop();
              }
              onLoadedData?.(event);
            }}
            onCanPlay={(event) => {
              if (isTop) {
                setLayers((prev) => {
                  const last = prev[prev.length - 1];
                  if (!last || last.id !== layer.id) return prev;
                  if (last.ready) return prev;
                  return [...prev.slice(0, -1), { ...last, ready: true }];
                });
                attemptPlayTop();
              }
              onCanPlay?.(event);
            }}
            onError={(event) => {
              if (isTop) {
                setLayers((prev) => {
                  if (prev.length <= 1) return prev;
                  const last = prev[prev.length - 1];
                  if (!last || last.id !== layer.id) return prev;
                  return prev.slice(0, -1);
                });
              }
              onError?.(event);
            }}
            {...passthrough}
          />
        );
      })}
    </>
  );
});

export default BackgroundVideo;
