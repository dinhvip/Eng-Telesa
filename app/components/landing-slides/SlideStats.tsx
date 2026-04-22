import Image from "next/image";
import MobileHeader from "../MobileHeader";
import MobileFloatingActions from "../MobileFloatingActions";
import CountUp from "../CountUp";
import React from "react";

interface SlideStatsProps {
  variant: "kid" | "adult";
  onMenuOpen: () => void;
  onCtaClick: () => void;
  onScrollToTop: () => void;
}

export default function SlideStats({
  variant,
  onMenuOpen,
  onCtaClick,
  onScrollToTop,
}: SlideStatsProps) {
  const isKid = variant === "kid";
  const logoSrc = isKid ? "/assets/logo.png" : "/assets/svg/logo.png";
  const logoAlt = isKid ? "Telesa English Kids logo" : "Telesa English logo";
  const primaryColorDesktop = isKid ? "text-[#FEA933]" : "text-[#C1077B]";
  const primaryColorMobile = isKid ? "text-[#ffb800]" : "text-[#C1077B]";

  const statsData = [
    {
      title: "Tiếng anh giao tiếp",
      to: isKid ? 3000 : 1000,
      suffix: "+",
      subtitle: "Học viên đang học",
      mobileBg: "bg-[#273143] text-white",
      mobileTone: "slate" as const,
      darkTheme: true,
    },
    {
      title: "Giáo viên chuyên môn",
      to: 25,
      suffix: "+",
      subtitle: "Giáo viên có từ 5 năm kinh nghiệm",
      mobileBg: "bg-white text-slate-900",
      mobileTone: "light" as const,
      darkTheme: false,
    },
    {
      title: "Tiến bộ rõ rệt",
      to: 98,
      suffix: "%",
      subtitle: "Học viên cảm nhận thực tế",
      mobileBg: "bg-[#273143] text-white",
      mobileTone: "glass" as const,
      darkTheme: true,
    },
    {
      title: "Ứng dụng công nghệ",
      to: 90,
      suffix: "%",
      subtitle: "Áp dụng công nghệ mới trong dạy học",
      mobileBg: "bg-white text-slate-900",
      mobileTone: "light" as const,
      darkTheme: false,
    },
  ];

  return (
    <>
      {/* ─── DESKTOP (Combined into 1 Section) ─── */}
      <section className="relative hidden telesa-vh-100 w-full snap-start items-center justify-center bg-white text-slate-900 lg:flex">
        <div className="relative z-10 h-full w-full items-center justify-center px-[8vw] flex">
          <div className="w-full">
            <div className="grid w-full grid-cols-2 items-start gap-8 text-center 2xl:grid-cols-4 2xl:gap-12">
              {statsData.map((stat, i) => (
                <div key={i} data-gsap-stat>
                  <p className="text-[clamp(16px,1.7vw,24px)] font-semibold text-slate-700">
                    {stat.title}
                  </p>
                  <p className={`mt-6 text-[clamp(56px,6vw,96px)] font-extrabold leading-none ${primaryColorDesktop}`}>
                    <CountUp to={stat.to} suffix={stat.suffix} durationMs={1500} />
                  </p>
                  <p className="mt-6 text-[clamp(13px,1.2vw,18px)] text-[#667085]">
                    {stat.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MOBILE (Split into 4 Sections) ─── */}
      {statsData.map((stat, i) => (
        <section
          key={`mobile-stat-${i}`}
          className={`relative flex telesa-vh-100 w-full snap-start items-stretch justify-center lg:hidden ${stat.mobileBg}`}
        >
          <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
            <MobileHeader
              logoSrc={logoSrc}
              logoAlt={logoAlt}
              logoPriority={i === 0}
              onMenuOpen={onMenuOpen}
              onCtaClick={onCtaClick}
              {...(!isKid && { logoWrapperClassName: "relative h-[50px] w-[50px] shrink-0", logoImageSize: 50 })}
              ctaClassName={`rounded-full border px-4 py-2 text-xs font-medium shadow-sm ${
                stat.darkTheme
                  ? "border-white/80 bg-transparent text-white"
                  : "border-slate-400 bg-white text-slate-700"
              }`}
              menuButtonClassName={`flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full ${
                stat.darkTheme ? "bg-transparent text-white" : "bg-slate-900 text-white shadow-sm"
              }`}
              menuLineClassName="bg-white"
            />

            {/* Center stats */}
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p
                className={`text-base font-semibold tracking-wide ${
                  stat.darkTheme ? "text-white" : "text-slate-700"
                }`}
              >
                {stat.title}
              </p>
              <p className={`mt-4 text-[72px] font-extrabold leading-none ${primaryColorMobile}`}>
                <CountUp to={stat.to} suffix={stat.suffix} durationMs={1500} />
              </p>
              <p
                className={`mt-5 text-base font-medium ${
                  stat.darkTheme ? "text-white" : "text-slate-700"
                }`}
              >
                {stat.subtitle}
              </p>
            </div>

            {/* Floating actions */}
            <div className="mt-auto flex items-end justify-end pb-1">
              <MobileFloatingActions
                variant={variant}
                tone={stat.darkTheme ? stat.mobileTone : (isKid ? "light" : "soft")}
                onScrollToTop={onScrollToTop}
              />
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
