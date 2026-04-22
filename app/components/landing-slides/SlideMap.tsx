import React from "react";
import MobileHeader from "../MobileHeader";
import MobileFloatingActions from "../MobileFloatingActions";
import { KidWorldMap } from "../KidWorldMap";

interface SlideMapProps {
  variant: "kid" | "adult";
  onMenuOpen: () => void;
  onCtaClick: () => void;
  onScrollToTop: () => void;
}

export default function SlideMap({
  variant,
  onMenuOpen,
  onCtaClick,
  onScrollToTop,
}: SlideMapProps) {
  const isKid = variant === "kid";
  const logoSrc = isKid ? "/assets/logo.png" : "/assets/svg/logo.png";
  const logoAlt = isKid ? "Telesa English Kids logo" : "Telesa English logo";

  const highlightColor = isKid ? undefined : "#C1077B"; // Default (undefined) uses kid color natively

  return (
    <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-[#273143] text-white">
      {/* ─── MOBILE ─── */}
      <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8 lg:hidden">
        <MobileHeader
          logoSrc={logoSrc}
          logoAlt={logoAlt}
          logoPriority
          onMenuOpen={onMenuOpen}
          onCtaClick={onCtaClick}
          {...(!isKid && { logoWrapperClassName: "relative h-[50px] w-[50px] shrink-0", logoImageSize: 50 })}
          ctaClassName="rounded-full border border-white bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm"
          menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-white"
          menuLineClassName="bg-white"
        />

        <div className="mt-8 px-2 text-center">
          <h2 className="text-[24px] font-extrabold leading-snug">
            Kết nối học viên trên toàn thế
            <br />
            giới cùng Telesa English!
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-100">
            Dù bạn ở đâu, Telesa English luôn đồng hành cùng bạn trên hành
            trình chinh phục tiếng Anh.
          </p>
        </div>

        <div className="mt-6 flex w-full flex-1 flex-col items-center justify-center">
          <KidWorldMap highlightColor={highlightColor} />
        </div>

        <div className="mt-3 flex items-end justify-end pb-1">
          <MobileFloatingActions variant={variant} tone="slate" onScrollToTop={onScrollToTop} />
        </div>
      </div>

      {/* ─── DESKTOP ─── */}
      <div className="relative z-10 hidden h-full w-full flex-col lg:flex">
        <div className="w-full px-[8vw] pt-[10vh] text-center">
          <h2 data-gsap-heading className="text-[45px] font-extrabold leading-[1.05] tracking-tight">
            Kết nối học viên trên toàn thế giới cùng Telesa English!
          </h2>
          <p className="mx-auto mt-5 max-w-[820px] text-[20px] leading-relaxed text-slate-100">
            Dù bạn ở đâu, Telesa English luôn đồng hành cùng bạn trên hành trình
            chinh phục tiếng Anh.
          </p>
        </div>

        <div className="mt-12 flex min-h-0 flex-1 items-center justify-center px-[8vw] pb-[10vh]">
          <div className="h-full max-h-[70vh] w-full max-w-[1200px]">
            <KidWorldMap variant="desktop" className="h-full" highlightColor={highlightColor} />
          </div>
        </div>
      </div>
    </section>
  );
}
