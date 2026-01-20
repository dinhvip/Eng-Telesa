"use client";

import Image from "next/image";

type MobileHeaderProps = {
  className?: string;

  logoSrc: string;
  logoAlt: string;
  logoWrapperClassName?: string;
  logoImageSize?: number;
  logoPriority?: boolean;
  onLogoClick?: () => void;
  logoAriaLabel?: string;

  showCta?: boolean;
  ctaLabel?: string;
  onCtaClick?: () => void;
  ctaClassName?: string;

  showMenu?: boolean;
  menuDisabled?: boolean;
  onMenuOpen?: () => void;
  menuAriaLabel?: string;
  menuButtonClassName?: string;
  menuLineClassName?: string;
};

export default function MobileHeader({
  className,
  logoSrc,
  logoAlt,
  logoWrapperClassName = "relative h-16 w-16 shrink-0",
  logoImageSize = 64,
  logoPriority = false,
  onLogoClick,
  logoAriaLabel,
  showCta = true,
  ctaLabel = "Làm bài kiểm tra ngay",
  onCtaClick,
  ctaClassName = "shrink-0 rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm",
  showMenu = true,
  menuDisabled,
  onMenuOpen,
  menuAriaLabel = "Open menu",
  menuButtonClassName = "flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-slate-900",
  menuLineClassName = "bg-slate-900",
}: MobileHeaderProps) {
  return (
    <header
      className={[
        "flex items-center justify-between gap-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {onLogoClick ? (
        <button
          type="button"
          aria-label={logoAriaLabel ?? logoAlt}
          onClick={onLogoClick}
          className={logoWrapperClassName}
        >
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={logoImageSize}
            height={logoImageSize}
            className="h-full w-full object-contain"
            priority={logoPriority}
          />
        </button>
      ) : (
        <div className={logoWrapperClassName}>
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={logoImageSize}
            height={logoImageSize}
            className="h-full w-full object-contain"
            priority={logoPriority}
          />
        </div>
      )}

      {showCta ? (
        <button type="button" onClick={onCtaClick} className={ctaClassName}>
          {ctaLabel}
        </button>
      ) : (
        <span />
      )}

      {showMenu ? (
        <button
          type="button"
          aria-label={menuAriaLabel}
          onClick={onMenuOpen}
          disabled={menuDisabled}
          aria-disabled={menuDisabled || undefined}
          className={[menuButtonClassName, menuDisabled ? "opacity-60" : null]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={["block h-[2px] w-4 rounded-full", menuLineClassName].join(" ")} />
          <span className={["mt-[3px] block h-[2px] w-4 rounded-full", menuLineClassName].join(" ")} />
          <span className={["mt-[3px] block h-[2px] w-4 rounded-full", menuLineClassName].join(" ")} />
        </button>
      ) : (
        <span />
      )}
    </header>
  );
}
