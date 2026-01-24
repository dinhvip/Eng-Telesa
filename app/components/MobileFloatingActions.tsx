"use client";

import Image from "next/image";
import ArrowUpIcon from "./ArrowUpIcon";

type MobileFloatingActionsProps = {
  variant?: "kid" | "adult";
  tone?: "slate" | "light" | "glass" | "darkGlass" | "soft";
  size?: "sm" | "md";
  onScrollToTop: () => void;
  navigationIcon?: "up" | "left";
  navigationAriaLabel?: string;
  onPhoneClick?: () => void;
  className?: string;
};

export default function MobileFloatingActions({
  variant = "kid",
  tone = "slate",
  size = "md",
  onScrollToTop,
  navigationIcon = "up",
  navigationAriaLabel,
  onPhoneClick,
  className,
}: MobileFloatingActionsProps) {
  const phoneIconSrc = variant === "adult" ? "/assets/svg/consult-pink.svg" : "/assets/svg/consult.svg";

  const navigationLeftStroke = tone === "soft" || tone === "light" ? "#313A4C" : "white";
  const arrowUpColor = tone === "slate" || tone === "glass" || tone === "darkGlass" ? "white" : "default";

  const buttonClassName =
    tone === "light"
      ? "bg-white text-slate-700"
      : tone === "glass"
        ? "bg-white/15 text-white"
        : tone === "darkGlass"
          ? "bg-black/30 text-white backdrop-blur-sm"
          : tone === "soft"
            ? "bg-[#f4f4f4] text-slate-700"
            : "bg-[#323c4f] text-white";

  const sizeClassName = size === "sm" ? "h-10 w-10" : "h-11 w-11";
  const arrowUpSize = size === "sm" ? 18 : 20;

  const resolvedNavigationAriaLabel =
    navigationAriaLabel ?? (navigationIcon === "left" ? "Về trang chủ" : "Lên đầu trang");

  return (
    <div
      className={["relative z-[9999] flex flex-col items-center gap-3", className]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        onClick={onPhoneClick}
        className={[
          "flex items-center justify-center rounded-full shadow-md",
          sizeClassName,
          buttonClassName,
        ].join(" ")}
        aria-label="Gọi tư vấn"
      >
        <span className="telesa-wiggle inline-flex">
          <Image src={phoneIconSrc} alt="" width={20} height={20} className="h-5 w-5" />
        </span>
      </button>

      <button
        type="button"
        onClick={onScrollToTop}
        className={[
          "flex items-center justify-center rounded-full shadow-md",
          sizeClassName,
          buttonClassName,
        ].join(" ")}
        aria-label={resolvedNavigationAriaLabel}
      >
        {navigationIcon === "left" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="16"
            viewBox="0 0 18 16"
            fill="none"
            aria-hidden="true"
            className="telesa-nudge"
          >
            <path
              d="M1 8H17M1 8L7.85714 15M1 8L7.85714 1"
              stroke={navigationLeftStroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <span className="telesa-nudge inline-flex">
            <ArrowUpIcon
              size={arrowUpSize}
              color={arrowUpColor}
              className={size === "sm" ? "h-[18px] w-[18px]" : "h-5 w-5"}
            />
          </span>
        )}
      </button>
    </div>
  );
}
