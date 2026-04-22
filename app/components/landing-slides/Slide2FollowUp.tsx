import BackgroundVideo from "../BackgroundVideo";
import type { BackgroundVideoHandle } from "../BackgroundVideo";
import MobileHeader from "../MobileHeader";

interface Slide2FollowUpProps {
  variant: "kid" | "adult";
  videoRef: React.RefObject<BackgroundVideoHandle | null>;
  onMenuOpen: () => void;
  onCtaClick: () => void;
  openConsultOverlay: () => void;
}

export default function Slide2FollowUp({
  variant,
  videoRef,
  onMenuOpen,
  onCtaClick,
  openConsultOverlay,
}: Slide2FollowUpProps) {
  const isKid = variant === "kid";

  const videoSrc = isKid ? "/assets/2-kid.mp4" : "/assets/2-adult.mp4";
  const posterSrc = isKid ? "/assets/2-kid-library.jpg" : "/assets/8-2-adult.jpg";
  const logoSrc = isKid ? "/assets/logo.png" : "/assets/svg/logo.png";
  const logoAlt = isKid ? "Telesa English Kids logo" : "Telesa English logo";
  
  const title = isKid ? (
    <>
      Telesa English –<br />
      Nói tự tin, giao tiếp tự nhiên
    </>
  ) : (
    <>
      Telesa English –<br />
      Tự tin giao tiếp trong công việc
    </>
  );

  const subtitle = isKid 
    ? "Chọn chương trình để bắt đầu hành trình của bạn" 
    : "Chọn chương trình để bắt đầu nâng cấp kỹ năng tiếng Anh của bạn";

  return (
    <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center overflow-hidden">
      <BackgroundVideo
        ref={videoRef}
        className="bg-video absolute inset-0 h-full w-full object-cover object-center"
        src={videoSrc}
        poster={posterSrc}
      />
      <div aria-hidden="true" className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-0 bg-black/30 lg:bg-gradient-to-r lg:from-black/55 lg:via-black/25 lg:to-black/5" />

      <div className="relative z-10 flex h-full w-full max-w-md flex-col justify-between px-4 pb-6 pt-8 text-white lg:max-w-none lg:px-0 lg:pb-0 lg:pt-0">
        {/* Top bar (mobile) */}
        <MobileHeader
          className="lg:hidden"
          logoSrc={logoSrc}
          logoAlt={logoAlt}
          logoPriority
          onMenuOpen={onMenuOpen}
          onCtaClick={onCtaClick}
          {...(!isKid && { logoWrapperClassName: "relative h-[50px] w-[50px] shrink-0", logoImageSize: 50 })}
          ctaClassName="rounded-full border border-white/80 bg-black/25 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md"
          menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-black/30 text-white shadow-sm backdrop-blur-md"
          menuLineClassName="bg-white"
        />

        {/* Desktop hero content */}
        <div className="hidden lg:block absolute inset-x-0 bottom-[15vh]">
          <div className="px-[8vw]">
            <div className="max-w-[880px] text-left">
              <h1 className="text-[60px] font-semibold leading-[1.04] tracking-tight xl:text-[72px]">
                {title}
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-white/90 xl:text-xl">
                {subtitle}
              </p>

              <div className="mt-10 flex max-w-[440px] gap-5">
                <button
                  type="button"
                  className="flex-1 rounded-full bg-white px-7 py-3 text-center text-sm font-semibold text-black shadow-sm transition-transform hover:scale-[1.01] active:scale-[0.98]"
                >
                  Học thử
                </button>
                <button
                  type="button"
                  onClick={openConsultOverlay}
                  className="flex-1 rounded-full border border-white/80 bg-black/10 px-7 py-3 text-center text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-transform hover:scale-[1.01] active:scale-[0.98]"
                >
                  Tư vấn ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom content */}
        <div className="mt-auto pb-2 lg:hidden">
          <h2 className="text-[22px] font-semibold leading-snug">
            {title}
          </h2>
          <p className="mt-3 text-sm text-white/90">
            {subtitle}
          </p>
          <div className="mt-5 flex gap-3">
            <button className="flex-1 rounded-full bg-white px-4 py-2 text-center text-xs font-semibold text-black shadow-sm">
              Học thử
            </button>
            <button
              type="button"
              onClick={openConsultOverlay}
              className="flex-1 rounded-full border border-white/80 bg-black/20 px-4 py-2 text-center text-xs font-semibold text-white shadow-sm"
            >
              Tư vấn ngay
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
