"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import DesktopNavbar from "../../components/DesktopNavbar";
import MobileFloatingActions from "../../components/MobileFloatingActions";
import MobileHeader from "../../components/MobileHeader";
import MobileMenuDrawer from "../../components/MobileMenuDrawer";

type Benefit = {
  title: string;
  description: string;
};

const BENEFITS: Benefit[] = [
  {
    title: "Cam kết đầu ra – Học đến khi vững thì thôi",
    description: "Học lại miễn phí đến khi vững.\nChỉ cần tham gia ≥70% số buổi.",
  },
  {
    title: "Học nhóm – nhưng vẫn được đánh giá cá nhân",
    description:
      "• Lớp nhóm nhưng theo dõi năng lực từng học viên.\n• App Telesa English có tính năng chấm bài, sửa phát âm, phản hồi cá nhân.\n• Ghi âm – gửi bài – nhận góp ý chi tiết như học 1 kèm 1.",
  },
  {
    title: "Linh hoạt học mọi lúc, mọi nơi",
    description:
      "• Có video ghi hình đồng bộ cho mọi buổi học.\n• Xem lại bài, học bù, ôn tập trên app không giới hạn.\n• Không sợ nghỉ buổi – không sợ mất kiến thức.",
  },
  {
    title: "Ưu đãi đặc quyền dành riêng cho học viên Telesa",
    description:
      "• Nhiều ưu đãi học phí cho học viên đang theo học.\n• Quà tặng, chương trình nâng cấp khóa học ưu tiên.\n• Gắn bó càng lâu – quyền lợi càng nhiều.",
  },
];

type StepDirection = "forward" | "back";

function useStepDeck(options: { itemCount: number }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<{
    state: "leaving" | "entering";
    direction: StepDirection;
  } | null>(null);
  const isTransitioningRef = useRef(false);
  const animTimerRef = useRef<number | null>(null);
  const phaseTimerRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const clearAnimTimer = () => {
    if (animTimerRef.current == null) return;
    window.clearTimeout(animTimerRef.current);
    animTimerRef.current = null;
  };

  const clearPhaseTimer = () => {
    if (phaseTimerRef.current == null) return;
    window.clearTimeout(phaseTimerRef.current);
    phaseTimerRef.current = null;
  };

  useEffect(() => {
    return () => {
      clearAnimTimer();
      clearPhaseTimer();
    };
  }, []);

  const startTransition = (direction: StepDirection) => {
    if (isTransitioningRef.current) return;
    const to = direction === "forward" ? activeIndex + 1 : activeIndex - 1;
    if (to < 0 || to >= options.itemCount) return;

    isTransitioningRef.current = true;
    setPhase({ state: "leaving", direction });
    clearPhaseTimer();

    clearAnimTimer();
    animTimerRef.current = window.setTimeout(() => {
      setActiveIndex(to);
      isTransitioningRef.current = false;
      animTimerRef.current = null;

      setPhase({ state: "entering", direction });
      clearPhaseTimer();
      phaseTimerRef.current = window.setTimeout(() => {
        setPhase(null);
        phaseTimerRef.current = null;
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

  const motion =
    phase?.state === "leaving"
      ? {
          opacity: 0,
          transform: `translateY(${phase.direction === "forward" ? "-14px" : "14px"})`,
        }
      : phase?.state === "entering"
        ? { opacity: 1, transform: "translateY(0px)" }
        : { opacity: 1, transform: "translateY(0px)" };

  const baseClass =
    "transition-[transform,opacity] duration-300 ease-out will-change-transform will-change-opacity";

  return {
    activeIndex,
    motion,
    baseClass,
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

function splitBenefitLines(description: string) {
  return description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith("•") ? line.replace(/^•\s?/, "") : line));
}

export default function WhyGroupPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const steps = useMemo(
    () => [
      { ...BENEFITS[0], bg: "/assets/group.jpg" },
      { ...BENEFITS[1], bg: "/assets/group1.jpg" },
      { ...BENEFITS[2], bg: "/assets/group2.jpg" },
      { ...BENEFITS[3], bg: "/assets/group3.jpg" },
    ],
    [],
  );

  const deckRef = useRef<HTMLDivElement | null>(null);
  const {
    activeIndex,
    motion,
    baseClass,
    onWheelNonPassive,
    gestureHandlers,
  } = useStepDeck({ itemCount: steps.length });

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };

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

  useEffect(() => {
    const element = deckRef.current;
    if (!element) return;
    element.addEventListener("wheel", onWheelNonPassive, { passive: false });
    return () => {
      element.removeEventListener("wheel", onWheelNonPassive);
    };
  }, [onWheelNonPassive]);

  return (
    <main className="relative min-h-[100dvh] bg-white text-slate-900">
      <DesktopNavbar
        variant="adult"
        logoSrc="/assets/svg/logo.png"
        activeKey="library"
        backgroundClassName="bg-[#3B0025]/40 backdrop-blur-md"
        onTestClick={() => router.push("/test?variant=adult")}
        onNavigate={(key) => {
          if (key === "home") router.push("/");
          if (key === "products") router.push("/product?variant=adult");
          if (key === "library") router.push("/library");
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
        variant="adult"
        logoSrc="/assets/svg/logo.png"
        activeKey="library-why-group"
        onNavigate={(key) => {
          if (key === "home") router.push("/");
          if (key === "product") router.push("/product?variant=adult");
          if (key === "library") router.push("/library");
          if (key === "library-what-is-tes") router.push("/library/what-is-tes");
          if (key === "library-1-1") router.push("/library/1-1");
          if (key === "library-payment-method") router.push("/library/payment-method");
          if (key === "library-why-group") router.push("/library/why-group");
          if (key === "library-roadmap") router.push("/library/roadmap");
        }}
      />

      {/* Mobile */}
      <section className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-6 pt-8 lg:hidden">
        <MobileHeader
          logoSrc="/assets/svg/logo.png"
          logoAlt="Telesa English logo"
          logoWrapperClassName="relative h-[50px] w-[50px] shrink-0"
          logoImageSize={50}
          logoPriority
          ctaClassName="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm"
          menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-slate-900"
          menuLineClassName="bg-slate-900"
          onMenuOpen={() => setIsMenuOpen(true)}
          onCtaClick={() => router.push("/test?variant=adult")}
        />

        <div className="relative mt-8 h-[75vh] w-screen -translate-x-1/2 left-1/2 overflow-hidden">
          {steps.map((step, idx) => (
            <Image
              key={step.bg}
              src={step.bg}
              alt="Chương trình học nhóm"
              fill
              sizes="100vw"
              className={[
                "object-cover transition-opacity duration-700 ease-out will-change-opacity",
                idx === activeIndex ? "opacity-100" : "opacity-0",
              ].join(" ")}
              priority={false}
            />
          ))}
          <div className="absolute inset-0 bg-[#3B002566]" />

          <div
            ref={deckRef}
            className="relative z-10 flex h-full w-full flex-col items-center px-6 pb-10 pt-10 text-center text-white"
            style={{ touchAction: "none" }}
            {...gestureHandlers}
          >
            <h1 className="text-[24px] font-semibold leading-tight tracking-tight">
              Chương trình học nhóm
            </h1>

            <div className="mt-10 flex flex-1 flex-col items-center justify-center">
              <div className={baseClass} style={motion}>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white/40 text-[16px] font-semibold">
                  {activeIndex + 1}
                </div>

                <h2 className="mt-4 max-w-[320px] text-center text-[16px] font-semibold leading-snug">
                  {steps[activeIndex]?.title}
                </h2>

                <p className="mt-3 max-w-[320px] whitespace-pre-line text-[14px] font-normal leading-relaxed text-white/90">
                  {steps[activeIndex]?.description}
                </p>
              </div>

            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-6 right-6">
          <div className="pointer-events-auto">
            <MobileFloatingActions
              variant="adult"
              tone="soft"
              navigationIcon="left"
              navigationAriaLabel="Về trang chủ"
              onScrollToTop={goBack}
            />
          </div>
        </div>
      </section>

      {/* Desktop fallback */}
      <section className="relative hidden h-[100dvh] w-full overflow-hidden bg-[#1F0A16] text-white lg:block">
        <Image
          src="/assets/group.jpg"
          alt="Chương trình học nhóm"
          fill
          sizes="100vw"
          className="object-cover"
          priority={false}
        />
        <div className="absolute inset-0 bg-[#3B002566]" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col px-[8vw] pb-16 pt-[110px]">
          <h1 className="text-center text-[clamp(34px,2.6vw,48px)] font-semibold leading-[1.12] tracking-tight">
            Chương trình học nhóm
          </h1>

          <div className="flex flex-1 items-center">
            <div className="grid w-full grid-cols-4 gap-x-[clamp(18px,2.8vw,56px)]">
              {BENEFITS.map((benefit, index) => {
                const lines = splitBenefitLines(benefit.description);
                const hasBullets = benefit.description.includes("•");
                return (
                  <div key={benefit.title} className="flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/80 bg-white/40 text-[28px] font-semibold leading-none">
                      {index + 1}
                    </div>
                    <h2 className="mt-5 text-[clamp(18px,1.35vw,22px)] font-semibold leading-snug tracking-tight">
                      {benefit.title}
                    </h2>

                    {hasBullets ? (
                      <ul className="mt-5 space-y-3 text-[clamp(14px,1vw,16px)] font-normal leading-relaxed text-white/90">
                        {lines.map((line) => (
                          <li key={line} className="flex items-start gap-3 text-left">
                            <span className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-white/80" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-5 whitespace-pre-line text-[clamp(14px,1vw,16px)] font-normal leading-relaxed text-white/90">
                        {lines.join("\n")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
