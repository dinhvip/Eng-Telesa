"use client";

import React from "react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20",
  info: "bg-blue-50 text-blue-700 ring-blue-600/20",
  neutral: "bg-gray-100 text-gray-600 ring-gray-500/20",
};

export default function StatusBadge({ label, variant = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-0.5
        rounded-full text-xs font-medium ring-1 ring-inset
        ${variantStyles[variant]}
      `}
    >
      <span
        className={`
          w-1.5 h-1.5 rounded-full
          ${variant === "success" ? "bg-emerald-500" : ""}
          ${variant === "warning" ? "bg-amber-500" : ""}
          ${variant === "danger" ? "bg-red-500" : ""}
          ${variant === "info" ? "bg-blue-500" : ""}
          ${variant === "neutral" ? "bg-gray-400" : ""}
        `}
      />
      {label}
    </span>
  );
}
