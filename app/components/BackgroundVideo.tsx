"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type BackgroundVideoProps = Omit<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  "children" | "src" | "muted" | "loop" | "playsInline" | "controls" | "preload"
> & {
  src: string;
  autoplayInWebView?: boolean;
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

export default function BackgroundVideo({
  src,
  className,
  autoplayInWebView,
  ...rest
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isWebView, setIsWebView] = useState(false);

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

  useEffect(() => {
    if (!shouldAutoplay) return;
    const el = videoRef.current;
    if (!el) return;
    const timer = window.setTimeout(() => {
      el.play().catch(() => {});
    }, 0);
    return () => window.clearTimeout(timer);
  }, [shouldAutoplay]);

  return (
    <video
      {...(webViewInlineAttrs as any)}
      className={["pointer-events-none", className].filter(Boolean).join(" ")}
      ref={videoRef}
      src={src}
      autoPlay={shouldAutoplay}
      muted
      loop
      playsInline
      controls={false}
      disablePictureInPicture
      disableRemotePlayback
      controlsList="nodownload noplaybackrate noremoteplayback"
      preload={isWebView ? "none" : "metadata"}
      aria-hidden="true"
      tabIndex={-1}
      onContextMenu={(e) => e.preventDefault()}
      {...rest}
    />
  );
}
