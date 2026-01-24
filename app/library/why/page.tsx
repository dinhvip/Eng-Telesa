"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import DesktopNavbar from "../../components/DesktopNavbar";
import FooterContactView from "../../components/FooterContactView";
import MobileHeader from "../../components/MobileHeader";
import MobileMenuDrawer from "../../components/MobileMenuDrawer";
import MobileFloatingActions from "../../components/MobileFloatingActions";

const DESKTOP_SUMMARY_ITEMS = [
  "Con được rèn luyện đủ 4 kỹ năng, đặc biệt là nghe – nói chuẩn ngay từ nhỏ.",
  "Con tự tin tập nói, giao tiếp với giáo viên và bạn bè hoàn toàn bằng tiếng Anh.",
  "Mỗi buổi học giống như một buổi vui chơi – kết nối – thư giãn sau giờ học trên trường, nhưng vẫn tràn đầy kiến thức.",
  "Quan trọng hơn, con sẽ hình thành đam mê thật sự với tiếng Anh, chứ không chỉ học để làm bài kiểm tra.",
] as const;

type WhyDirection = "forward" | "back";

function useWhyTextDeck(options: {
  itemCount: number;
  onOverflowForward?: () => void;
  onOverflowBack?: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [textPhase, setTextPhase] = useState<{
    state: "leaving" | "entering";
    direction: WhyDirection;
  } | null>(null);
  const isTransitioningRef = useRef(false);
  const animTimerRef = useRef<number | null>(null);
  const textTimerRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const clearAnimTimer = () => {
    if (animTimerRef.current == null) return;
    window.clearTimeout(animTimerRef.current);
    animTimerRef.current = null;
  };

  const clearTextTimer = () => {
    if (textTimerRef.current == null) return;
    window.clearTimeout(textTimerRef.current);
    textTimerRef.current = null;
  };

  useEffect(() => {
    return () => {
      clearAnimTimer();
      clearTextTimer();
    };
  }, []);

  const startTransition = (direction: WhyDirection) => {
    if (isTransitioningRef.current) return;
    const to = direction === "forward" ? activeIndex + 1 : activeIndex - 1;

    if (to < 0) {
      options.onOverflowBack?.();
      return;
    }
    if (to >= options.itemCount) {
      options.onOverflowForward?.();
      return;
    }

    isTransitioningRef.current = true;
    setTextPhase({ state: "leaving", direction });
    clearTextTimer();

    clearAnimTimer();
    animTimerRef.current = window.setTimeout(() => {
      setActiveIndex(to);
      isTransitioningRef.current = false;
      animTimerRef.current = null;

      setTextPhase({ state: "entering", direction });
      clearTextTimer();
      textTimerRef.current = window.setTimeout(() => {
        setTextPhase(null);
        textTimerRef.current = null;
      }, 220);
    }, 320);
  };

  const onWheelNonPassive = (e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTransitioningRef.current) return;
    if (e.deltaY > 12) startTransition("forward");
    else if (e.deltaY < -12) startTransition("back");
  };

  const onTouchStart: React.TouchEventHandler<HTMLElement> = (e) => {
    const t = e.touches[0];
    if (!t) return;
    touchStartYRef.current = t.clientY;
  };

  const onTouchEnd: React.TouchEventHandler<HTMLElement> = (e) => {
    const startY = touchStartYRef.current;
    touchStartYRef.current = null;
    if (startY == null) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dy = t.clientY - startY;
    if (Math.abs(dy) < 42) return;
    if (dy < 0) startTransition("forward");
    else startTransition("back");
  };

  return {
    activeIndex,
    textPhase,
    onWheelNonPassive,
    gestureHandlers: {
      onTouchStart,
      onTouchEnd,
      onTouchCancel: () => {
        touchStartYRef.current = null;
      },
    },
  };
}

export default function LibraryWhyPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const mobileHeroRef = useRef<HTMLElement | null>(null);
  const mobileFooterRef = useRef<HTMLDivElement | null>(null);
  const mobileDeckRef = useRef<HTMLDivElement | null>(null);
  const desktopSectionRef = useRef<HTMLElement | null>(null);
  const desktopFooterRef = useRef<HTMLDivElement | null>(null);
  const desktopDeckRef = useRef<HTMLDivElement | null>(null);
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };
  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const {
    activeIndex: desktopActiveIndex,
    textPhase: desktopTextPhase,
    onWheelNonPassive: desktopDeckWheel,
    gestureHandlers: desktopDeckHandlers,
  } = useWhyTextDeck({
    itemCount: DESKTOP_SUMMARY_ITEMS.length,
    onOverflowBack: () => {
      mobileHeroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    onOverflowForward: () => {
      desktopFooterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  });

  const {
    activeIndex: mobileActiveIndex,
    textPhase: mobileTextPhase,
    onWheelNonPassive: mobileDeckWheel,
    gestureHandlers: mobileDeckHandlers,
  } =
    useWhyTextDeck({
      itemCount: DESKTOP_SUMMARY_ITEMS.length,
      onOverflowBack: () => {
        mobileHeroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
      onOverflowForward: () => {
        mobileFooterRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    });

  useEffect(() => {
    const element = mobileDeckRef.current;
    if (!element) return;
    element.addEventListener("wheel", mobileDeckWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", mobileDeckWheel);
    };
  }, [mobileDeckWheel]);

  useEffect(() => {
    const element = desktopDeckRef.current;
    if (!element) return;
    element.addEventListener("wheel", desktopDeckWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", desktopDeckWheel);
    };
  }, [desktopDeckWheel]);

  const textBaseClass =
    "transition-[transform,opacity] duration-300 ease-out will-change-transform will-change-opacity";

  const mobileTextMotion =
    mobileTextPhase?.state === "leaving"
      ? {
          opacity: 0,
          transform: `translateY(${mobileTextPhase.direction === "forward" ? "-14px" : "14px"})`,
        }
      : mobileTextPhase?.state === "entering"
        ? { opacity: 1, transform: "translateY(0px)" }
        : { opacity: 1, transform: "translateY(0px)" };

  const desktopTextMotion =
    desktopTextPhase?.state === "leaving"
      ? {
          opacity: 0,
          transform: `translateY(${desktopTextPhase.direction === "forward" ? "-14px" : "14px"})`,
        }
      : desktopTextPhase?.state === "entering"
        ? { opacity: 1, transform: "translateY(0px)" }
        : { opacity: 1, transform: "translateY(0px)" };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shouldOpen = sessionStorage.getItem("telesa:openMenuOnBack") === "1";
    if (!shouldOpen) return;
    const returnTo = sessionStorage.getItem("telesa:openMenuOnBack:returnTo");
    const current = `${window.location.pathname}${window.location.search}`;
    if (!returnTo || returnTo !== current) return;
    sessionStorage.removeItem("telesa:openMenuOnBack");
    sessionStorage.removeItem("telesa:openMenuOnBack:returnTo");
    setIsMenuOpen(true);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  return (
    <>
      <DesktopNavbar
        variant="kid"
        logoSrc="/assets/logo.png"
        activeKey="library"
        activeColor="#FFC000"
        backgroundClassName="bg-[#36363666] backdrop-blur-md"
        onTestClick={() => router.push("/test")}
        onNavigate={(key) => {
          if (key === "home") router.push("/");
          if (key === "products") router.push("/product?variant=kid");
          if (key === "library") router.push("/library");
          if (key === "library-why") router.push("/library/why");
          if (key === "library-program-for-kid") router.push("/library/program-for-kid");
          if (key === "library-what-is-tes") router.push("/library/what-is-tes");
          if (key === "library-1-1") router.push("/library/1-1");
          if (key === "library-payment-method") router.push("/library/payment-method");
          if (key === "library-why-group") router.push("/library/why-group");
          if (key === "library-roadmap") router.push("/library/roadmap");
          if (key === "tutoring") router.push("/");
          if (key === "about") router.push("/");
          if (key === "careers") router.push("/");
        }}
      />

      <MobileMenuDrawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        variant="kid"
        logoSrc="/assets/logo.png"
        activeKey="library-why"
        onNavigate={(key) => {
          if (
            key === "library-why" ||
            key === "library-program-for-kid" ||
            key === "library-what-is-tes" ||
            key === "library-roadmap" ||
            key === "library-why-group" ||
            key === "library-1-1" ||
            key === "library-payment-method"
          ) {
            try {
              sessionStorage.setItem("telesa:openMenuOnBack", "1");
              sessionStorage.setItem(
                "telesa:openMenuOnBack:returnTo",
                `${window.location.pathname}${window.location.search}`,
              );
            } catch {}
          }
          if (key === "home") router.push("/");
          if (key === "product") router.push("/product?variant=kid");
          if (key === "library") router.push("/library");
          if (key === "library-why") router.push("/library/why");
          if (key === "library-program-for-kid") router.push("/library/program-for-kid");
          if (key === "library-what-is-tes") router.push("/library/what-is-tes");
          if (key === "library-1-1") router.push("/library/1-1");
          if (key === "library-payment-method") router.push("/library/payment-method");
          if (key === "library-why-group") router.push("/library/why-group");
          if (key === "library-roadmap") router.push("/library/roadmap");
          if (key === "teacher") router.push("/");
          if (key === "about") router.push("/");
          if (key === "career") router.push("/");
        }}
      />

      <main
        ref={scrollContainerRef}
        className={["h-[100dvh] bg-[#F8F9FA]", "overflow-y-auto", "snap-y snap-mandatory"].join(" ")}
      >
        <section ref={mobileHeroRef} className="relative h-[100dvh] snap-start bg-[#F8F9FA] text-slate-900">
          <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8 lg:max-w-5xl lg:px-8 lg:pt-[110px]">
            <MobileHeader
              className="lg:hidden"
              logoSrc="/assets/logo.png"
              logoAlt="Telesa English Kids logo"
              ctaClassName="shrink-0 rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm"
              menuAriaLabel="Menu"
              menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
              menuLineClassName="bg-white"
              onMenuOpen={() => setIsMenuOpen(true)}
              onCtaClick={() => router.push("/test")}
            />

            <div className="flex flex-1 items-center justify-center text-center">
              <p className="max-w-[20ch] text-[32px] font-medium leading-[1.25] tracking-tight text-[#343B4A] lg:max-w-[20ch] lg:text-[clamp(38px,3.2vw,46px)] lg:leading-[1.18]">
                Ở Telesa English, con được học tiếng Anh{" "}
                <span className="text-[#FFC000]">
                  theo cách khác biệt – lấy giao tiếp làm trong tâm thay vì áp lực điểm số.
                </span>
              </p>
            </div>

            <div className="pointer-events-none absolute bottom-6 right-6 lg:hidden">
              <div className="pointer-events-auto">
                <MobileFloatingActions
                  variant="kid"
                  tone="soft"
                  navigationIcon="left"
                  navigationAriaLabel="Về trang chủ"
                  onScrollToTop={goBack}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Desktop: combine slides 2-5 into one view (footer attached) */}
        <section
          ref={desktopSectionRef}
          className="relative hidden min-h-[100dvh] snap-start bg-[#F8F9FA] text-slate-900 lg:block"
        >
          <div className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col px-8 pt-[110px]">
            <div
              ref={desktopDeckRef}
              className="flex flex-1 items-center pb-16"
              style={{ touchAction: "none" }}
              {...desktopDeckHandlers}
            >
              <div className="grid w-full grid-cols-12 gap-6">
                <div className="col-span-5 flex items-center">
                  <div className="min-w-max whitespace-nowrap text-[clamp(32px,2.6vw,44px)] font-semibold leading-[1.1] tracking-tight text-[#343B4A]">
                    Ở Telesa English
                  </div>
                </div>

                <div className="col-span-7 flex">
                  <div className="flex w-full flex-col items-center justify-center gap-[clamp(28px,4vh,64px)]">
                    <p
                      className={[
                        "max-w-[40ch] text-center text-[clamp(22px,2vw,30px)] font-medium leading-[1.22] tracking-tight text-[#FFC000]",
                        textBaseClass,
                      ].join(" ")}
                      style={desktopTextMotion}
                    >
                      {DESKTOP_SUMMARY_ITEMS[desktopActiveIndex]}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pointer-events-none fixed bottom-6 right-6">
              <div className="pointer-events-auto">
                <MobileFloatingActions
                  variant="kid"
                  tone="soft"
                  navigationIcon="up"
                  navigationAriaLabel="Lên đầu trang"
                  onScrollToTop={scrollToTop}
                />
              </div>
            </div>
          </div>

          <div ref={desktopFooterRef}>
            <FooterContactView
              variant="kid"
              logoSrc="/assets/logo.png"
              snapStart={false}
              onMenuOpen={() => {}}
              onScrollToTop={scrollToTop}
              showFloatingActions={false}
              showMobileHeader={false}
              onNavigate={(key) => {
                if (key === "home") router.push("/");
                if (key === "product") router.push("/product?variant=kid");
                if (key === "library") router.push("/library");
                if (key === "library-why") router.push("/library/why");
                if (key === "library-program-for-kid") router.push("/library/program-for-kid");
                if (key === "library-what-is-tes") router.push("/library/what-is-tes");
                if (key === "library-1-1") router.push("/library/1-1");
                if (key === "library-payment-method") router.push("/library/payment-method");
                if (key === "library-why-group") router.push("/library/why-group");
                if (key === "library-roadmap") router.push("/library/roadmap");
                if (key === "teacher") router.push("/");
                if (key === "about") router.push("/");
                if (key === "career") router.push("/");
              }}
            />
          </div>
        </section>

        {/* Mobile slides */}
        <section
          className="relative h-[100dvh] snap-start bg-[#F8F9FA] text-slate-900 lg:hidden"
        >
          <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8 lg:max-w-5xl lg:px-8 lg:pt-[110px]">
            <MobileHeader
              logoSrc="/assets/logo.png"
              logoAlt="Telesa English Kids logo"
              ctaClassName="shrink-0 rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm"
              menuAriaLabel="Menu"
              menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
              menuLineClassName="bg-white"
              onMenuOpen={() => setIsMenuOpen(true)}
              onCtaClick={() => router.push("/test")}
            />

            <div
              ref={mobileDeckRef}
              className="relative flex flex-1 flex-col text-center"
              style={{ touchAction: "none" }}
              {...mobileDeckHandlers}
            >
              <div className="absolute left-0 right-0 top-[25vh]">
                <div className="text-[34px] font-medium leading-[1.2] tracking-tight text-[#343B4A] lg:text-[clamp(42px,3.6vw,52px)] lg:leading-[1.05]">
                  Ở Telesa English
                </div>
	                <div
	                  className={[
	                    "mt-10 text-[28px] font-medium leading-[1.25] tracking-tight text-[#FFC000] lg:text-[clamp(32px,2.9vw,42px)] lg:leading-[1.15]",
	                    textBaseClass,
	                  ].join(" ")}
	                  style={mobileTextMotion}
	                >
	                  {DESKTOP_SUMMARY_ITEMS[mobileActiveIndex]}
	                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-6 right-6">
              <div className="pointer-events-auto">
                <MobileFloatingActions
                  variant="kid"
                  tone="soft"
                  navigationIcon="left"
                  navigationAriaLabel="Về trang chủ"
                  onScrollToTop={goBack}
                />
              </div>
            </div>
          </div>
        </section>

        <div ref={mobileFooterRef} className="lg:hidden">
          <FooterContactView
            variant="kid"
            logoSrc="/assets/logo.png"
            onMenuOpen={() => {}}
            onScrollToTop={scrollToTop}
            showFloatingActions={false}
            showMobileHeader={false}
            onNavigate={(key) => {
              if (key === "home") router.push("/");
              if (key === "product") router.push("/product?variant=kid");
              if (key === "library") router.push("/library");
              if (key === "library-why") router.push("/library/why");
              if (key === "library-program-for-kid") router.push("/library/program-for-kid");
              if (key === "library-what-is-tes") router.push("/library/what-is-tes");
              if (key === "library-1-1") router.push("/library/1-1");
              if (key === "library-payment-method") router.push("/library/payment-method");
              if (key === "library-why-group") router.push("/library/why-group");
              if (key === "library-roadmap") router.push("/library/roadmap");
              if (key === "teacher") router.push("/");
              if (key === "about") router.push("/");
              if (key === "career") router.push("/");
            }}
          />
        </div>
      </main>
    </>
  );
}
