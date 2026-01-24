"use client";

import Image from "next/image";
import type { SVGProps } from "react";
import MobileFloatingActions from "./MobileFloatingActions";
import MobileHeader from "./MobileHeader";

type FooterVariant = "kid" | "adult";

const EmailIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M4 6.5C4 5.12 5.12 4 6.5 4h11C18.88 4 20 5.12 20 6.5v11c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 20 4 18.88 4 17.5v-11Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M6.5 7.5 12 11.5 17.5 7.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const BuildingIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path d="M7 2h10v20H7V2Z" stroke="currentColor" strokeWidth="2" />
    <path
      d="M9 6h6M9 10h6M9 14h6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M5 22h14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const PhoneIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.2 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.55 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.07a2 2 0 0 1 2.11-.45c.8.25 1.64.43 2.5.55A2 2 0 0 1 22 16.92Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const NAV_ITEMS = [
  { key: "home", label: "Trang chủ" },
  { key: "product", label: "Sản Phẩm" },
  { key: "teacher", label: "Học kèm với giáo viên" },
  { key: "about", label: "Về Telesa" },
  { key: "library", label: "Thư viện" },
  { key: "career", label: "Tuyển dụng" },
] as const;

type FooterContactViewProps = {
  variant: FooterVariant;
  logoSrc: string;
  onMenuOpen: () => void;
  onScrollToTop: () => void;
  onCtaClick?: () => void;
  onNavigate?: (
    key:
      | (typeof NAV_ITEMS)[number]["key"]
      | "library-why"
      | "library-program-for-kid"
      | "library-what-is-tes"
      | "library-roadmap"
      | "library-why-group"
      | "library-1-1"
      | "library-payment-method"
  ) => void;
  showFloatingActions?: boolean;
  mobileFullHeight?: boolean;
  showMobileHeader?: boolean;
  desktopFullHeight?: boolean;
  desktopSnap?: boolean;
  snapStart?: boolean;
};

export default function FooterContactView({
  variant,
  logoSrc,
  onMenuOpen,
  onScrollToTop,
  onCtaClick,
  onNavigate,
  showFloatingActions = true,
  mobileFullHeight = true,
  showMobileHeader = true,
  desktopFullHeight = false,
  desktopSnap = false,
  snapStart = true,
}: FooterContactViewProps) {
  const brandAlt = variant === "kid" ? "Telesa English Kids logo" : "Telesa English logo";
  const desktopFullHeightClass = desktopFullHeight ? "lg:h-[100dvh]" : "lg:h-auto";
  const desktopSnapClass = desktopSnap ? "lg:snap-start" : "lg:snap-none";
  return (
    <section
      className={[
        "relative flex w-full items-stretch justify-center bg-white text-slate-900 lg:justify-start",
        snapStart ? "snap-start" : null,
        desktopFullHeightClass,
        desktopSnapClass,
        mobileFullHeight ? "h-[100dvh]" : "h-auto",
      ].filter(Boolean).join(" ")}
    >
      {/* Mobile */}
      <div
        className={[
          "relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-[calc(env(safe-area-inset-top)+18px)] lg:hidden",
          mobileFullHeight ? "h-full" : "h-auto",
        ].join(" ")}
      >
        {showMobileHeader && (
          <MobileHeader
            logoSrc={logoSrc}
            logoAlt={brandAlt}
            logoPriority
            ctaClassName="rounded-full border border-slate-700 bg-white px-6 py-2 text-xs font-medium text-slate-700 shadow-sm"
            onCtaClick={onCtaClick}
            onMenuOpen={onMenuOpen}
            menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-slate-700"
            menuLineClassName="bg-slate-800"
          />
        )}

        <div className={showMobileHeader ? "mt-8 space-y-5" : "space-y-5"}>
          <section>
            <h2 className="text-[22px] font-extrabold text-slate-700">Thông tin liên hệ</h2>
            <div className="mt-3 space-y-3 text-[16px] font-medium text-slate-500">
              <div className="flex items-center gap-3">
                <EmailIcon className="h-5 w-5" />
                <span>team1@telesaenglish.com</span>
              </div>
              <div className="flex items-center gap-3">
                <BuildingIcon className="h-5 w-5" />
                <span>0318591266</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-5 w-5" />
                <span>0932639259</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[22px] font-extrabold text-slate-700">Mạng xã hội</h2>
            <div className="mt-3 flex items-center gap-3">
              <a
                href="https://www.facebook.com/TelesaEnglish"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center"
              >
                <Image
                  src="/assets/svg/facebook.svg"
                  alt="Facebook"
                  width={36}
                  height={36}
                  className="h-9 w-9"
                />
              </a>
              <a
                href="https://www.tiktok.com/@telesaenglishofficial"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="flex h-9 w-9 items-center justify-center"
              >
                <Image
                  src="/assets/svg/tiktok.svg"
                  alt="TikTok"
                  width={36}
                  height={36}
                  className="h-9 w-9"
                />
              </a>
              <a
                href="https://www.instagram.com/hoctienganhcungtelesa/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center"
              >
                <Image
                  src="/assets/svg/instagram.svg"
                  alt="Instagram"
                  width={36}
                  height={36}
                  className="h-9 w-9"
                />
              </a>
              <a
                href="https://www.youtube.com/@Telesaenglish"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center"
              >
                <Image
                  src="/assets/svg/youtube.svg"
                  alt="YouTube"
                  width={36}
                  height={36}
                  className="h-9 w-9"
                />
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-[22px] font-extrabold text-slate-700">Tải ngay</h2>
            <div className="mt-3 flex items-center gap-0">
              <a href="#" className="flex flex-1 items-center justify-start">
                <Image
                  src="/assets/svg/apple-button.svg"
                  alt="Download on the App Store"
                  width={190}
                  height={56}
                  className="h-12 w-full object-contain object-left"
                />
              </a>
              <a href="#" className="flex flex-1 items-center justify-start">
                <Image
                  src="/assets/svg/google-play-button.svg"
                  alt="Get it on Google Play"
                  width={190}
                  height={56}
                  className="h-12 w-full object-contain object-left"
                />
              </a>
            </div>
          </section>
        </div>

        <div className="mt-auto">
          <div className="border-t border-slate-200" />
          <p className="py-4 text-center text-[14px] font-medium text-slate-500">
            © TelesaEnglish. All rights reserved.
          </p>
        </div>

        {showFloatingActions && (
          <div className="pointer-events-none absolute bottom-24 right-6">
            <div className="pointer-events-auto">
              <MobileFloatingActions variant={variant} tone="soft" onScrollToTop={onScrollToTop} />
            </div>
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="relative z-10 hidden w-full max-w-none flex-col px-[8vw] pb-10 pt-20 lg:flex">
        <div className="grid grid-cols-12 gap-10 xl:gap-16">
          <div className="col-span-4">
            <div className="relative h-[110px] w-[110px]">
              <Image
                src={logoSrc}
                alt={brandAlt}
                width={110}
                height={110}
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <div className="mt-10">
              <h3 className="text-[20px] font-extrabold text-slate-700">Tải ngay</h3>
              <div className="mt-4 flex items-center gap-4">
                <a href="#" className="inline-flex">
                  <Image
                    src="/assets/svg/apple-button.svg"
                    alt="Download on the App Store"
                    width={180}
                    height={56}
                    className="h-12 w-auto object-contain"
                  />
                </a>
                <a href="#" className="inline-flex">
                  <Image
                    src="/assets/svg/google-play-button.svg"
                    alt="Get it on Google Play"
                    width={180}
                    height={56}
                    className="h-12 w-auto object-contain"
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="col-span-4">
            <nav className="pt-1">
              <ul className="space-y-5 text-[18px] font-semibold text-slate-700">
                {NAV_ITEMS.map((item) => (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => onNavigate?.(item.key)}
                      className="transition-colors hover:text-slate-900"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="col-span-4">
            <h3 className="text-[20px] font-extrabold text-slate-700">Thông tin liên hệ</h3>
            <div className="mt-4 space-y-4 text-[16px] font-medium text-slate-500">
              <div className="flex items-center gap-3">
                <EmailIcon className="h-5 w-5" />
                <span>team1@telesaenglish.com</span>
              </div>
              <div className="flex items-center gap-3">
                <BuildingIcon className="h-5 w-5" />
                <span>0318591266</span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-5 w-5" />
                <span>0932639259</span>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="text-[20px] font-extrabold text-slate-700">Mạng xã hội</h3>
              <div className="mt-4 flex items-center gap-4">
                <a
                  href="https://www.facebook.com/TelesaEnglish"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="inline-flex h-10 w-10 items-center justify-center"
                >
                  <Image src="/assets/svg/facebook.svg" alt="Facebook" width={40} height={40} className="h-10 w-10" />
                </a>
                <a
                  href="https://www.tiktok.com/@telesaenglishofficial"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                  className="inline-flex h-10 w-10 items-center justify-center"
                >
                  <Image src="/assets/svg/tiktok.svg" alt="TikTok" width={40} height={40} className="h-10 w-10" />
                </a>
                <a
                  href="https://www.instagram.com/hoctienganhcungtelesa/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="inline-flex h-10 w-10 items-center justify-center"
                >
                  <Image src="/assets/svg/instagram.svg" alt="Instagram" width={40} height={40} className="h-10 w-10" />
                </a>
                <a
                  href="https://www.youtube.com/@Telesaenglish"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="inline-flex h-10 w-10 items-center justify-center"
                >
                  <Image src="/assets/svg/youtube.svg" alt="YouTube" width={40} height={40} className="h-10 w-10" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14">
          <div className="border-t border-slate-200" />
          <p className="py-4 text-center text-[16px] font-medium text-slate-500">
            © TelesaEnglish. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
}
