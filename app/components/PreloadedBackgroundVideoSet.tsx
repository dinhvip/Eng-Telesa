"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

type VariantKey = "default" | "kid" | "adult";

type PreloadedBackgroundVideoSetProps = Omit<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  "children" | "src" | "muted" | "loop" | "playsInline" | "controls" | "preload" | "autoPlay"
> & {
  sources: Record<VariantKey, string>;
  active: VariantKey;
  autoplayInWebView?: boolean;
  transitionMs?: number;
  onVisibleChange?: (key: VariantKey) => void;
};

export type PreloadedBackgroundVideoSetHandle = {
  play: (key: VariantKey) => void;
  pauseAll: () => void;
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

const variantOrder: VariantKey[] = ["default", "kid", "adult"];

const PreloadedBackgroundVideoSet = forwardRef<
  PreloadedBackgroundVideoSetHandle,
  PreloadedBackgroundVideoSetProps
>(function PreloadedBackgroundVideoSet(
  {
    sources,
    active,
    autoplayInWebView,
    transitionMs = 320,
    onVisibleChange,
    className,
    style,
    onLoadedData,
    onCanPlay,
    onError,
    ...rest
  },
  ref,
) {
  const [isWebView, setIsWebView] = useState(false);
  const frameReadyRef = useRef<Record<VariantKey, boolean>>({
    default: false,
    kid: false,
    adult: false,
  });
  const [visible, setVisible] = useState<VariantKey>(active);
  const refs = useRef<Record<VariantKey, HTMLVideoElement | null>>({
    default: null,
    kid: null,
    adult: null,
  });

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

  const markFrameReady = (key: VariantKey) => {
    if (frameReadyRef.current[key]) return;
    frameReadyRef.current[key] = true;
  };

  const waitForFirstFrame = (key: VariantKey, el: HTMLVideoElement) =>
    new Promise<void>((resolve) => {
      if (frameReadyRef.current[key]) {
        resolve();
        return;
      }

      let settled = false;
      let frameCbId: number | null = null;

      const settle = () => {
        if (settled) return;
        settled = true;
        markFrameReady(key);
        cleanup();
        resolve();
      };

      const onPlaying = () => settle();
      const onTimeUpdate = () => {
        if (el.currentTime > 0) settle();
      };
      const onLoadedDataLocal = () => settle();

      const cleanup = () => {
        el.removeEventListener("playing", onPlaying);
        el.removeEventListener("timeupdate", onTimeUpdate);
        el.removeEventListener("loadeddata", onLoadedDataLocal);
        if (frameCbId != null && "cancelVideoFrameCallback" in el) {
          try {
            (el as any).cancelVideoFrameCallback(frameCbId);
          } catch {}
        }
      };

      el.addEventListener("playing", onPlaying, { once: true });
      el.addEventListener("timeupdate", onTimeUpdate);
      el.addEventListener("loadeddata", onLoadedDataLocal, { once: true });

      if ("requestVideoFrameCallback" in el) {
        try {
          frameCbId = (el as any).requestVideoFrameCallback(() => settle());
        } catch {}
      }

      window.setTimeout(settle, 1800);
    });

  useImperativeHandle(
    ref,
    () => ({
      play: (key: VariantKey) => {
        const el = refs.current[key];
        if (!el) return;
        try {
          el.muted = true;
          el.playsInline = true;
          el.setAttribute("playsinline", "");
          el.setAttribute("webkit-playsinline", "true");
        } catch {}
        el.play().catch(() => {});
      },
      pauseAll: () => {
        for (const key of variantOrder) {
          const el = refs.current[key];
          el?.pause?.();
        }
      },
    }),
    [],
  );

  useEffect(() => {
    for (const key of variantOrder) {
      const el = refs.current[key];
      el?.load?.();
    }
  }, [sources.default, sources.kid, sources.adult]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (active === visible) return;
    const nextKey = active;
    const el = refs.current[nextKey];
    if (!el) return;

    let cancelled = false;

    const run = async () => {
      if (shouldAutoplay) {
        try {
          el.muted = true;
          el.playsInline = true;
          el.setAttribute("playsinline", "");
          el.setAttribute("webkit-playsinline", "true");
          await el.play();
        } catch {}
      }

      await waitForFirstFrame(nextKey, el);
      if (cancelled) return;
      setVisible(nextKey);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [active, shouldAutoplay, visible]);

  useEffect(() => {
    const activeEl = refs.current[visible];
    if (!activeEl) return;
    if (!shouldAutoplay) return;
    const timer = window.setTimeout(() => {
      activeEl.play().catch(() => {});
    }, 0);
    return () => window.clearTimeout(timer);
  }, [shouldAutoplay, visible]);

  useEffect(() => {
    onVisibleChange?.(visible);
  }, [onVisibleChange, visible]);

  useEffect(() => {
    for (const key of variantOrder) {
      const el = refs.current[key];
      if (!el) continue;
      if (key === visible) continue;
      el.pause?.();
    }
  }, [visible]);

  const preload: "none" | "auto" = isWebView ? "none" : "auto";

  return (
    <>
      {variantOrder.map((key) => {
        const isVisible = key === visible;
        return (
          <video
            key={key}
            {...(webViewInlineAttrs as any)}
            className={[
              "pointer-events-none transition-opacity ease-out",
              isVisible ? "opacity-100" : "opacity-0",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              ...(style ?? {}),
              transitionDuration: `${transitionMs}ms`,
            }}
            ref={(el) => {
              refs.current[key] = el;
            }}
            src={sources[key]}
            autoPlay={shouldAutoplay && isVisible}
            muted
            loop
            playsInline
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload noplaybackrate noremoteplayback"
            preload={preload}
            aria-hidden="true"
            tabIndex={-1}
            onContextMenu={(e) => e.preventDefault()}
            onLoadedData={(event) => {
              markFrameReady(key);
              onLoadedData?.(event);
            }}
            onCanPlay={(event) => {
              markFrameReady(key);
              onCanPlay?.(event);
            }}
            onError={(event) => {
              if (key === active) setVisible((v) => (v === key ? "default" : v));
              onError?.(event);
            }}
            {...rest}
          />
        );
      })}
    </>
  );
});

export default PreloadedBackgroundVideoSet;
