"use client";

import Image from "next/image";

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
  const phoneIconSrc = variant === "adult" ? "/assets/svg/phone-pink.svg" : "/assets/svg/phone.svg";

  const navigationLeftStroke = tone === "soft" || tone === "light" ? "#313A4C" : "white";

  const buttonClassName =
    tone === "light"
      ? "bg-white text-slate-800"
      : tone === "glass"
        ? "bg-white/15 text-white"
        : tone === "darkGlass"
          ? "bg-black/30 text-white backdrop-blur-sm"
          : tone === "soft"
            ? "bg-[#f4f4f4] text-slate-700"
            : "bg-[#323c4f] text-white";

  const sizeClassName = size === "sm" ? "h-10 w-10" : "h-11 w-11";
  const arrowClassName = size === "sm" ? "text-lg" : tone === "soft" ? "text-xl" : "text-lg";

  const resolvedNavigationAriaLabel =
    navigationAriaLabel ?? (navigationIcon === "left" ? "Về trang chủ" : "Lên đầu trang");

  return (
    <div className={["flex flex-col items-center gap-3", className].filter(Boolean).join(" ")}>
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
        <Image src={phoneIconSrc} alt="" width={20} height={20} className="h-5 w-5" />
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
          <span className={arrowClassName}>↑</span>
        )}
      </button>
    </div>
  );
}
