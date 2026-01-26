"use client";

import { useEffect } from "react";

export type ToastVariant = "success" | "error";

export type ToastState = {
  open: boolean;
  message: string;
  variant: ToastVariant;
};

export default function Toast({
  open,
  message,
  variant,
  onClose,
  durationMs = 3500,
}: {
  open: boolean;
  message: string;
  variant: ToastVariant;
  onClose: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(id);
  }, [open, onClose, durationMs]);

  if (!open) return null;

  const baseClass =
    variant === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-rose-200 bg-rose-50 text-rose-900";

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 px-4">
      <div className={["rounded-2xl border px-4 py-3 shadow-lg", baseClass].join(" ")}>
        <p className="text-[14px] font-semibold leading-snug">{message}</p>
      </div>
    </div>
  );
}

