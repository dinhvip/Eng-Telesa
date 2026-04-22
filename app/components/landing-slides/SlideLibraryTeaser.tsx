import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MobileHeader from "../MobileHeader";
import MobileFloatingActions from "../MobileFloatingActions";
import { useHorizontalSwipe } from "../useHorizontalSwipe";

export const kidLibraryTeaserSlides = [
  {
    image: "/assets/8-1-kid.jpg",
    title:
      "Tại sao nhiều bố mẹ đã\ncho con học tiếng Anh\nở trường nhưng vẫn\nđăng ký thêm khóa học\ntại Telesa English?",
    href: "/library/why",
    objectClassName: "object-[75%_center]",
    desktopTitleClassName: "not-italic font-medium",
  },
  {
    image: "/assets/8-2-kid.jpg",
    title: "Chương trình tiếng Anh\ncho trẻ em tại\nTelesa English",
    href: "/library/program-for-kid",
    objectClassName: "object-center",
    desktopTitleClassName: "",
  },
];

export const adultLibraryTeaserSlides = [
  {
    image: "/assets/8-1-adult.jpg",
    title: "T.E.S là gì ? Hiệu quả\nnhư thế nào ?",
    href: "/library/what-is-tes",
  },
  {
    image: "/assets/8-2-adult.jpg",
    title: "Lộ trình học Tiếng Anh\ntại Telesa – Tiến bộ từng\nbước vững chắc",
    href: "/library/roadmap",
  },
  {
    image: "/assets/8-3-adult.jpg",
    title: "Tại sao nên học Giao\ntiếp nhóm tại\nTelesa English",
    href: "/library/why-group",
  },
  {
    image: "/assets/8-4-adult.jpg",
    title:
      "Vì sao nên chọn học\nkèm 1-1 tại Telesa\nEnglish thay vì tự tìm\ngiáo viên?",
    href: "/library/1-1",
  },
  {
    image: "/assets/8-5-adult.jpg",
    title: "Có được đóng học phí trả góp không",
    href: "/library/payment-method",
  },
];

interface SlideLibraryTeaserProps {
  variant: "kid" | "adult";
  onMenuOpen: () => void;
  onCtaClick: () => void;
  onScrollToTop: () => void;
}

export default function SlideLibraryTeaser({
  variant,
  onMenuOpen,
  onCtaClick,
  onScrollToTop,
}: SlideLibraryTeaserProps) {
  const router = useRouter();
  const isKid = variant === "kid";
  const slides = isKid ? kidLibraryTeaserSlides : adultLibraryTeaserSlides;
  const logoSrc = isKid ? "/assets/logo.png" : "/assets/svg/logo.png";
  const logoAlt = isKid ? "Telesa English Kids logo" : "Telesa English logo";

  const [slideIndex, setSlideIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(true);

  const changeSlide = (nextIndex: number) => {
    if (nextIndex === slideIndex) return;
    if (nextIndex < 0 || nextIndex >= slides.length) return;
    setTextVisible(false);
    setTimeout(() => {
      setSlideIndex(nextIndex);
      setTextVisible(true);
    }, 150);
  };

  const swipeHandlers = useHorizontalSwipe<HTMLElement>({
    onSwipeLeft: () => changeSlide(slideIndex + 1),
    onSwipeRight: () => changeSlide(slideIndex - 1),
  });

  const anchorIdDesktop = `${variant}-library-teaser-desktop`;
  const anchorIdMobile = `${variant}-library-teaser`;

  const handleNavigate = (href: string, anchorId: string) => {
    try {
      sessionStorage.setItem(
        "telesa:returnContext",
        JSON.stringify({
          kind: "landing",
          selectedAge: variant,
          anchorId: anchorId,
        }),
      );
    } catch { }
    router.push(href as any);
  };

  return (
    <>
      {/* ─── DESKTOP ─── */}
      <section
        id={anchorIdDesktop}
        className="relative hidden telesa-vh-100 w-full snap-start items-stretch justify-center overflow-hidden bg-black text-white lg:flex"
        style={{ touchAction: "pan-y" }}
        {...swipeHandlers}
      >
        <Image
          src={slides[slideIndex].image}
          alt={`Telesa English ${isKid ? "Kids" : ""} learning`}
          fill
          sizes="100vw"
          quality={100}
          unoptimized
          className="object-cover"
          priority
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-black/30 lg:bg-black/20" />

        <div className="relative z-10 h-full w-full">
          <div className="absolute bottom-[18vh] left-4 right-4 text-white lg:left-[8vw] lg:right-auto lg:bottom-[18vh]">
            <h2
              className={`whitespace-pre-line text-[34px] font-semibold leading-[1.05] tracking-tight sm:text-[44px] lg:text-[56px] transform-gpu transition-all duration-300 ease-out ${textVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                } ${(slides[slideIndex] as any).desktopTitleClassName ?? ""}`}
            >
              {slides[slideIndex].title}
            </h2>

            <div className="mt-8">
              <button
                type="button"
                onClick={() => handleNavigate(slides[slideIndex].href, anchorIdDesktop)}
                className="inline-flex items-center justify-center gap-1 rounded-[36px] border-2 border-white bg-white/5 px-4 py-2 text-[14px] font-medium text-white shadow-[0_2px_4px_rgba(0,0,0,0.10)] transition-colors hover:bg-white/10"
              >
                Chi tiết
              </button>
            </div>

            <div className="mt-10 flex items-center gap-4 lg:mt-12">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => changeSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${index === slideIndex
                      ? `w-12 ${isKid ? "bg-[#FEA933]" : "bg-[#C1077B]"}`
                      : "w-12 bg-white/70"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MOBILE ─── */}
      <section
        id={anchorIdMobile}
        className="relative flex telesa-min-vh-100 w-full snap-start items-stretch justify-center overflow-hidden bg-black text-white lg:hidden"
        style={{ touchAction: "pan-y" }}
        {...swipeHandlers}
      >
        <Image
          src={slides[slideIndex].image}
          alt={`Telesa English ${isKid ? "Kids" : "Adult"} learning`}
          fill
          priority
          quality={100}
          unoptimized
          sizes="100vw"
          className={`pointer-events-none select-none object-cover ${(slides[slideIndex] as any).objectClassName ?? "object-center"
            }`}
        />
        <div className="pointer-events-none absolute inset-0 bg-black/25" />

        <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
          <MobileHeader
            className="gap-2"
            logoSrc={logoSrc}
            logoAlt={logoAlt}
            logoPriority
            onMenuOpen={onMenuOpen}
            onCtaClick={onCtaClick}
            {...(!isKid && { logoWrapperClassName: "relative h-[50px] w-[50px] shrink-0", logoImageSize: 50 })}
            ctaClassName="rounded-full border border-white bg-black/30 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-sm"
            menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-black/40 text-white shadow-sm backdrop-blur-sm"
            menuLineClassName="bg-white"
          />

          <div
            className={`mt-12 flex flex-1 flex-col justify-end pb-10 transform-gpu transition-all duration-300 ease-out ${textVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
          >
            <p className="whitespace-pre-line text-left text-2xl font-medium leading-8 text-white">
              {slides[slideIndex].title}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleNavigate(slides[slideIndex].href, anchorIdMobile)}
                  className="inline-flex items-center justify-center gap-1 rounded-[36px] border-2 border-white bg-white/5 px-4 py-2 text-[14px] font-medium text-white shadow-[0_2px_4px_rgba(0,0,0,0.10)]"
                >
                  Chi tiết
                </button>
                <div className="flex items-center gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => changeSlide(index)}
                      className={`h-1.5 rounded-full transition-all ${index === slideIndex
                          ? `w-4 ${isKid ? "bg-amber-400" : "bg-[#C1077B]"}`
                          : "w-3 bg-white/70"
                        }`}
                    />
                  ))}
                </div>
              </div>
              <MobileFloatingActions variant={variant} tone="darkGlass" onScrollToTop={onScrollToTop} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
