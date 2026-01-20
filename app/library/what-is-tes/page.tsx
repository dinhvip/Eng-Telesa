"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import DesktopNavbar from "../../components/DesktopNavbar";
import MobileHeader from "../../components/MobileHeader";
import MobileFloatingActions from "../../components/MobileFloatingActions";
import MobileMenuDrawer from "../../components/MobileMenuDrawer";

type TesDirection = "forward" | "back";

type TesSlide = { src: string; alt: string };

type TesTransition = {
  from: number;
  to: number;
  direction: TesDirection;
  phase: "prepare" | "animate";
};

function useTesDeck(options: {
  slideCount: number;
  onOverflowForward?: () => void;
  onOverflowBack?: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [transition, setTransition] = useState<TesTransition | null>(null);
  const [textPhase, setTextPhase] = useState<{
    state: "leaving" | "entering";
    direction: TesDirection;
  } | null>(null);
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

  const startTransition = (direction: TesDirection) => {
    if (transition) return;
    const from = activeIndex;
    const to = direction === "forward" ? activeIndex + 1 : activeIndex - 1;
    if (to < 0) {
      options.onOverflowBack?.();
      return;
    }
    if (to >= options.slideCount) {
      options.onOverflowForward?.();
      return;
    }

    setTransition({ from, to, direction, phase: "prepare" });
    setTextPhase({ state: "leaving", direction });
    clearTextTimer();

    window.requestAnimationFrame(() => {
      setTransition((prev) => (prev ? { ...prev, phase: "animate" } : prev));
    });
    clearAnimTimer();
    animTimerRef.current = window.setTimeout(() => {
      setActiveIndex(to);
      setTransition(null);
      animTimerRef.current = null;

      setTextPhase({ state: "entering", direction });
      clearTextTimer();
      textTimerRef.current = window.setTimeout(() => {
        setTextPhase(null);
        textTimerRef.current = null;
      }, 220);
    }, 320);
  };

  const onWheel: React.WheelEventHandler<HTMLElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (transition) return;
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
    transition,
    textPhase,
    startTransition,
    gestureHandlers: {
      onWheel,
      onTouchStart,
      onTouchEnd,
      onTouchCancel: () => {
        touchStartYRef.current = null;
      },
    },
  };
}

function TesStack(props: {
  slides: TesSlide[];
  activeIndex: number;
  transition: TesTransition | null;
  wrapperClassName?: string;
  frameClassName?: string;
  cardContainerClassName?: string;
  cardInnerClassName?: string;
  imageClassName?: string;
  imageSizes?: string;
  gestureHandlers: {
    onWheel: React.WheelEventHandler<HTMLElement>;
    onTouchStart: React.TouchEventHandler<HTMLElement>;
    onTouchEnd: React.TouchEventHandler<HTMLElement>;
    onTouchCancel: React.TouchEventHandler<HTMLElement>;
  };
}) {
  const { slides, activeIndex, transition, gestureHandlers } = props;

  const renderCard = (index: number, options: { className?: string; style?: React.CSSProperties }) => {
    const slide = slides[index];
    if (!slide) return null;
    return (
      <div
        key={`card-${index}`}
        className={[
          "absolute inset-0",
          "will-change-transform will-change-opacity transition-[transform,opacity] duration-300 ease-out",
          options.className ?? "",
        ].join(" ")}
        style={options.style}
      >
        <div className={["relative aspect-[360/520] w-full", props.cardContainerClassName ?? ""].join(" ")}>
          <div className={["relative h-full w-full", props.cardInnerClassName ?? ""].join(" ")}>
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes={props.imageSizes ?? "320px"}
              className={props.imageClassName ?? "object-contain"}
              priority={index === 0}
            />
          </div>
        </div>
      </div>
    );
  };

  const baseCard = renderCard(activeIndex, {
    className: transition ? "z-30" : "z-20",
    style:
      transition && transition.phase === "animate"
        ? {
            transform: `translateY(${transition.direction === "forward" ? -140 : 140}px)`,
            opacity: 0,
          }
        : { transform: "translateY(0px)", opacity: 1 },
  });

  const enteringCard =
    transition && transition.direction === "back"
      ? renderCard(transition.to, {
          className: "z-20",
          style:
            transition.phase === "animate"
              ? { transform: "translateY(0px)", opacity: 1 }
              : { transform: "translateY(-140px)", opacity: 0 },
        })
      : null;

  const peekCards = Array.from({ length: 3 })
    .map((_, i) => activeIndex + 1 + i)
    .filter((idx) => idx < slides.length)
    .reverse()
    .map((idx, reverseIndex, arr) => {
      const depth = arr.length - 1 - reverseIndex;
      const translateX = 22 + depth * 18;
      const scaleY = 0.92 - depth * 0.06;
      const scaleX = 0.98 - depth * 0.05;
      const opacity = 0.9 - depth * 0.12;

      return renderCard(idx, {
        className: "z-0",
        style: {
          transform: `translateX(${translateX}px) translateY(${Math.max(0, 8 + depth * 12)}px) scaleX(${scaleX}) scaleY(${scaleY})`,
          opacity,
        },
      });
    });

  return (
    <div className={["mt-8 flex w-full justify-center overflow-visible", props.wrapperClassName ?? ""].join(" ")}>
      <div
        className={[
          "relative aspect-[360/520] select-none overflow-visible",
          props.frameClassName ?? "h-[40vh] max-h-[520px]",
        ].join(" ")}
        style={{ touchAction: "none" }}
        {...gestureHandlers}
      >
        {peekCards}
        {enteringCard}
        {baseCard}
      </div>
    </div>
  );
}

export default function LibraryWhatIsTesPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slides = useMemo<TesSlide[]>(
    () => [
      { src: "/assets/tes1.png", alt: "T.E.S Method overview" },
      { src: "/assets/tes2.png", alt: "T.E.S flashcards" },
      { src: "/assets/tes3.png", alt: "T.E.S slide 3" },
      { src: "/assets/tes4.png", alt: "T.E.S slide 4" },
    ],
    [],
  );

  const desktopSlides = useMemo<TesSlide[]>(
    () => [
      { src: "/assets/tes-1.png", alt: "T.E.S roadmap" },
      { src: "/assets/tes-2.jpg", alt: "Effective flashcards" },
      { src: "/assets/tes-3.jpg", alt: "T.E.S learners" },
      { src: "/assets/tes-4.png", alt: "T.E.S class photo" },
    ],
    [],
  );

  const [viewIndex, setViewIndex] = useState<0 | 1>(0);
  const [desktopViewIndex, setDesktopViewIndex] = useState<0 | 1 | 2>(0);

  const { activeIndex, transition, textPhase, gestureHandlers } = useTesDeck({
    slideCount: slides.length,
    onOverflowForward: () => {
      if (activeIndex !== slides.length - 1) return;
      setViewIndex(1);
    },
    onOverflowBack: () => {
      if (viewIndex !== 0) return;
      // At first slide, allow native back navigation via floating button only.
    },
  });

  const {
    activeIndex: desktopActiveIndex,
    transition: desktopTransition,
    textPhase: desktopTextPhase,
    gestureHandlers: desktopGestureHandlers,
  } = useTesDeck({
    slideCount: desktopSlides.length,
    onOverflowForward: () => {
      setDesktopViewIndex(2);
    },
    onOverflowBack: () => {
      setDesktopViewIndex(0);
    },
  });

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

  const highlightLetter: "T" | "E" | "S" | "ALL" =
    activeIndex === 0 ? "ALL" : activeIndex === 1 ? "T" : activeIndex === 2 ? "E" : "S";

  const descriptionText =
    activeIndex === 1
      ? "T – Từ vựng: Học từ theo hệ thống Leitner Flashcards qua 5 cấp độ ghi nhớ dài hạn, theo cụm và ngữ cảnh thực tế, kèm âm thanh – hình ảnh – ví dụ, giúp kích hoạt trí nhớ và phản xạ tự nhiên."
      : activeIndex === 2
        ? "E – Ghép câu phản xạ: Nắm vững cấu trúc câu đơn, luyện ghép cụm – chọn thì – phản xạ qua 4 bước (nhìn tranh, nghe tình huống, trả lời, đóng vai), giúp nói tự tin và giảm lỗi ngữ pháp mà không cần học lý thuyết khó khăn."
        : activeIndex === 3
          ? "S – Phát âm: Luyện phát âm theo IPA và khẩu hình, sửa âm khó, rèn ngữ điệu – nối âm bằng kỹ thuật Shadowing & Repetition, giúp nói chuẩn và tự nhiên như người bản xứ."
        : "T.E.S – Telesa English Speaking là phương pháp học tiếng Anh thực hành, được thiết kế đặc biệt cho người mất gốc đến trung cấp, giúp học viên nói đúng – nhanh – tự nhiên thông qua 3 trụ cột chính.";

  const desktopOverviewText =
    "T.E.S – Telesa English Speaking là phương pháp học tiếng Anh thực hành, được thiết kế đặc biệt cho người mất gốc đến trung cấp, giúp học viên nói đúng – nhanh – tự nhiên thông qua 3 trụ cột chính.";

  const desktopHighlightLetter: "T" | "E" | "S" | "ALL" =
    desktopActiveIndex === 0 ? "ALL" : desktopActiveIndex === 1 ? "T" : desktopActiveIndex === 2 ? "E" : "S";

  const desktopDescriptionText =
    desktopActiveIndex === 1
      ? "T – Từ vựng: Học từ theo hệ thống Leitner Flashcards qua 5 cấp độ ghi nhớ dài hạn, theo cụm và ngữ cảnh thực tế, kèm âm thanh – hình ảnh – ví dụ, giúp kích hoạt trí nhớ và phản xạ tự nhiên."
      : desktopActiveIndex === 2
        ? "E – Ghép câu phản xạ: Nắm vững cấu trúc câu đơn, luyện ghép cụm – chọn thì – phản xạ qua 4 bước (nhìn tranh, nghe tình huống, trả lời, đóng vai), giúp nói tự tin và giảm lỗi ngữ pháp mà không cần học lý thuyết khó khăn."
        : desktopActiveIndex === 3
          ? "S – Phát âm: Luyện phát âm theo IPA và khẩu hình, sửa âm khó, rèn ngữ điệu – nối âm bằng kỹ thuật Shadowing & Repetition, giúp nói chuẩn và tự nhiên như người bản xứ."
        : desktopOverviewText;

  const textMotion =
    textPhase?.state === "leaving"
      ? {
          opacity: 0,
          transform: `translateY(${textPhase.direction === "forward" ? "-14px" : "14px"})`,
        }
      : textPhase?.state === "entering"
        ? { opacity: 1, transform: "translateY(0px)" }
        : { opacity: 1, transform: "translateY(0px)" };

  const textBaseClass =
    "transition-[transform,opacity] duration-300 ease-out will-change-transform will-change-opacity";

  const desktopTextMotion =
    desktopTextPhase?.state === "leaving"
      ? {
          opacity: 0,
          transform: `translateY(${desktopTextPhase.direction === "forward" ? "-14px" : "14px"})`,
        }
      : desktopTextPhase?.state === "entering"
        ? { opacity: 1, transform: "translateY(0px)" }
        : { opacity: 1, transform: "translateY(0px)" };

  const view1TouchStartYRef = useRef<number | null>(null);
  const onView1TouchStart: React.TouchEventHandler<HTMLElement> = (e) => {
    const t = e.touches[0];
    if (!t) return;
    view1TouchStartYRef.current = t.clientY;
  };
  const onView1TouchEnd: React.TouchEventHandler<HTMLElement> = (e) => {
    const startY = view1TouchStartYRef.current;
    view1TouchStartYRef.current = null;
    if (startY == null) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dy = t.clientY - startY;
    if (Math.abs(dy) < 42) return;
    if (dy > 0) setViewIndex(0);
  };
  const onView1Wheel: React.WheelEventHandler<HTMLElement> = (e) => {
    if (e.deltaY < -12) setViewIndex(0);
  };

  const onDesktopHeroWheel: React.WheelEventHandler<HTMLElement> = (e) => {
    if (e.deltaY <= 12) return;
    e.preventDefault();
    setDesktopViewIndex(1);
  };

  const onDesktopTesWheel: React.WheelEventHandler<HTMLElement> = (e) => {
    e.preventDefault();
    if (e.deltaY > 12) setDesktopViewIndex(2);
    else if (e.deltaY < -12) setDesktopViewIndex(0);
  };

  const desktopModelTouchStartYRef = useRef<number | null>(null);
  const onDesktopModelTouchStart: React.TouchEventHandler<HTMLElement> = (e) => {
    const t = e.touches[0];
    if (!t) return;
    desktopModelTouchStartYRef.current = t.clientY;
  };
  const onDesktopModelTouchEnd: React.TouchEventHandler<HTMLElement> = (e) => {
    const startY = desktopModelTouchStartYRef.current;
    desktopModelTouchStartYRef.current = null;
    if (startY == null) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dy = t.clientY - startY;
    if (Math.abs(dy) < 42) return;
    if (dy > 0) setDesktopViewIndex(1);
  };

  const onDesktopModelWheel: React.WheelEventHandler<HTMLElement> = (e) => {
    if (e.deltaY >= -12) return;
    e.preventDefault();
    setDesktopViewIndex(1);
  };

  return (
    <>
      <DesktopNavbar
        variant="adult"
        logoSrc="/assets/svg/logo.png"
        activeKey="library"
        backgroundClassName="bg-[#3b3b3b]/40 backdrop-blur-md"
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
        activeKey="library-what-is-tes"
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
      <main className="hidden h-[100dvh] overflow-hidden bg-[#F8F9FA] lg:block">
        <div
          className="h-full w-full transform-gpu transition-transform duration-400 ease-out"
          style={{ transform: `translateY(-${desktopViewIndex * 100}dvh)` }}
        >
          <section
            className="relative flex h-[100dvh] w-full items-stretch justify-center overflow-hidden bg-black text-white"
            onWheel={onDesktopHeroWheel}
          >
            <video
              className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
              src="/assets/library-adult.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="pointer-events-none absolute inset-0 bg-black/30 lg:bg-gradient-to-r lg:from-black/55 lg:via-black/25 lg:to-black/5" />

            <div className="relative z-10 flex h-full w-full items-end">
              <div className="px-[8vw] pb-[12vh]">
                <div className="max-w-[880px] text-left">
                  <h1 className="text-[clamp(44px,3.8vw,64px)] font-semibold leading-[1.04] tracking-tight">
                    Kho dữ liệu và thông tin
                    <br />
                    bổ ích
                  </h1>

                  <p className="mt-6 text-[clamp(16px,1.15vw,20px)] leading-relaxed text-white/90">
                    Thư viện của Telesa English tổng hợp tất cả tài nguyên từ các nền tảng mạng xã hội của
                    Telesa đến các bài viết chia sẻ kiến thức chất lượng đến từ giảng viên và học viên của
                    trung tâm. Hãy khám phá kho tàng tri thức miễn phí ngay!
                  </p>

                  <div className="mt-10 flex max-w-[420px] gap-5">
                    <button
                      type="button"
                      className="flex-1 rounded-full bg-white px-7 py-3 text-center text-sm font-semibold text-black shadow-sm transition-transform hover:scale-[1.01] active:scale-[0.98]"
                    >
                      Học thử ngay
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-full border border-white/80 bg-black/10 px-7 py-3 text-center text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-transform hover:scale-[1.01] active:scale-[0.98]"
                    >
                      Tư vấn ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className="relative flex h-[100dvh] w-full items-center bg-[#F8F9FA] text-slate-900"
            onWheel={onDesktopTesWheel}
          >
            <div className="mx-auto w-full px-[8vw] pt-[92px]">
              <div className="grid w-full grid-cols-12 items-center gap-x-10">
                <div className="col-span-5">
                  <h2 className="text-[clamp(34px,2.6vw,48px)] font-semibold leading-[1.12] tracking-tight text-slate-800">
                    T.E.S Method –
                    <br />
                    Speak English Naturally
                  </h2>

                  <div className="mt-7 flex items-center gap-6 text-[clamp(46px,3.2vw,72px)] font-extrabold tracking-tight">
                    <span
                      className={
                        desktopHighlightLetter === "ALL" || desktopHighlightLetter === "T"
                          ? "text-[#D40887]"
                          : "text-slate-300"
                      }
                    >
                      T
                    </span>
                    <span
                      className={
                        desktopHighlightLetter === "ALL" || desktopHighlightLetter === "E"
                          ? "text-[#D40887]"
                          : "text-slate-300"
                      }
                    >
                      E
                    </span>
                    <span
                      className={
                        desktopHighlightLetter === "ALL" || desktopHighlightLetter === "S"
                          ? "text-[#D40887]"
                          : "text-slate-300"
                      }
                    >
                      S
                    </span>
                  </div>

                  <p className="mt-5 text-[clamp(16px,1.15vw,19px)] leading-relaxed text-slate-600">
                    {desktopOverviewText}
                  </p>

                  <p
                    className={["mt-6 text-[clamp(16px,1.05vw,18px)] leading-relaxed text-slate-700", textBaseClass].join(
                      " ",
                    )}
                    style={desktopTextMotion}
                  >
                    {desktopDescriptionText}
                  </p>
                </div>

                <div className="col-span-7">
                  <div className="flex w-full items-center justify-end">
                    <TesStack
                      slides={desktopSlides}
                      activeIndex={desktopActiveIndex}
                      transition={desktopTransition}
                      gestureHandlers={desktopGestureHandlers}
                      wrapperClassName="mt-0"
                      frameClassName="h-[72vh] max-h-[720px] min-h-[520px]"
                      cardContainerClassName="overflow-hidden rounded-[34px] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.18)] ring-1 ring-black/5"
                      cardInnerClassName="p-8"
                      imageClassName="object-contain"
                      imageSizes="(min-width: 1024px) 520px, 320px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className="relative flex h-[100dvh] w-full items-center bg-[#273143] text-white"
            onWheel={onDesktopModelWheel}
            onTouchStart={onDesktopModelTouchStart}
            onTouchEnd={onDesktopModelTouchEnd}
            onTouchCancel={() => {
              desktopModelTouchStartYRef.current = null;
            }}
          >
            <div className="mx-auto flex h-full w-full flex-col px-[8vw] pt-[92px]">
              <div className="flex flex-1 flex-col items-center justify-center">
                <h2 className="text-center text-[clamp(34px,2.6vw,52px)] font-semibold leading-[1.12] tracking-tight">
                  Mô hình lớp học ứng dụng T.E.S
                </h2>

                <div className="relative mt-12 w-full max-w-[980px] overflow-hidden rounded-[28px]">
                  <div className="relative aspect-[16/9] w-full">
                    <video
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                      src="/assets/tes5.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[#3D002680]" />

                    <div className="pointer-events-none absolute inset-0 text-white">
                      <svg
                        className="absolute inset-0 h-full w-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M24 40 L21 74"
                          fill="none"
                          stroke="rgba(255,255,255,0.65)"
                          strokeWidth="0.55"
                          strokeDasharray="2 3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M21 74 L56 50"
                          fill="none"
                          stroke="rgba(255,255,255,0.65)"
                          strokeWidth="0.55"
                          strokeDasharray="2 3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M56 50 L80 60"
                          fill="none"
                          stroke="rgba(255,255,255,0.65)"
                          strokeWidth="0.55"
                          strokeDasharray="2 3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <div className="absolute left-[12%] top-[10%] flex flex-col items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/80 text-[14px] font-semibold">
                          5 phút
                        </div>
                        <div className="text-left text-[18px] font-semibold leading-snug">
                          Ôn từ bằng
                          <br />
                          Flashcards Leitner
                        </div>
                      </div>

                      <div className="absolute left-[56%] top-[18%] flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/60 text-[14px] font-semibold text-white/70">
                          15 phút
                        </div>
                      </div>
                      <div className="absolute left-[50%] top-[36%] text-left text-[18px] font-semibold leading-snug text-white/55">
                        Ghép câu phản xạ
                        <br />
                        theo tình huống
                      </div>

                      <div className="absolute left-[14%] top-[74%] flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/60 text-[14px] font-semibold text-white/70">
                          10 phút
                        </div>
                      </div>
                      <div className="absolute left-[20%] top-[86%] text-left text-[18px] font-semibold leading-snug text-white/60">
                        Luyện phát âm &
                        <br />
                        Đánh vần
                      </div>

                      <div className="absolute left-[74%] top-[56%] flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/60 text-[14px] font-semibold text-white/70">
                          10 phút
                        </div>
                      </div>
                      <div className="absolute left-[64%] top-[72%] text-left text-[18px] font-semibold leading-snug text-white/60">
                        Thực hành đóng vai
                        <br />
                        Nói tự nhiên
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      <main className="h-[100dvh] overflow-hidden bg-[#273143] text-white lg:hidden">
        <div
          className="h-full w-full transform-gpu transition-transform duration-400 ease-out"
          style={{ transform: `translateY(-${viewIndex * 100}dvh)` }}
        >
          <section className="relative h-[100dvh]">
            <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8">
              <MobileHeader
                logoSrc="/assets/svg/logo.png"
                logoAlt="Telesa English logo"
                logoWrapperClassName="relative h-[50px] w-[50px] shrink-0"
                logoImageSize={50}
                ctaClassName="rounded-full border border-white/80 bg-transparent px-5 py-2 text-xs font-medium text-white shadow-sm"
                menuAriaLabel="Menu"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-white/10 text-white shadow-sm backdrop-blur-md"
                menuLineClassName="bg-white"
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={() => router.push("/test?variant=adult")}
              />

              <div className="mt-8 flex flex-1 flex-col items-center text-center">
                <h1 className="text-[34px] font-semibold leading-[1.1] tracking-tight">
                  T.E.S Method –
                  <br />
                  Speak English Naturally
                </h1>

                <div className="mt-6 flex w-full justify-center">
                  <div className="flex items-center justify-center gap-6 text-[44px] font-extrabold text-[#D40887]">
                    <span
                      className={
                        highlightLetter === "ALL" || highlightLetter === "T" ? "text-[#D40887]" : "text-white"
                      }
                    >
                      T
                    </span>
                    <span
                      className={
                        highlightLetter === "ALL" || highlightLetter === "E" ? "text-[#D40887]" : "text-white"
                      }
                    >
                      E
                    </span>
                    <span
                      className={
                        highlightLetter === "ALL" || highlightLetter === "S" ? "text-[#D40887]" : "text-white"
                      }
                    >
                      S
                    </span>
                  </div>
                </div>

                <TesStack
                  slides={slides}
                  activeIndex={activeIndex}
                  transition={transition}
                  gestureHandlers={gestureHandlers}
                />

                <p
                  className={["mt-6 px-2 text-[16px] leading-relaxed text-white/90", textBaseClass].join(" ")}
                  style={textMotion}
                >
                  {descriptionText}
                </p>
              </div>

              <div className="pointer-events-none fixed bottom-6 right-6 z-40">
                <div className="pointer-events-auto">
                  <MobileFloatingActions
                    variant="adult"
                    tone="darkGlass"
                    navigationIcon="left"
                    navigationAriaLabel="Quay lại"
                    onScrollToTop={goBack}
                  />
                </div>
              </div>
            </div>
          </section>

          <section
            className="relative h-[100dvh]"
            onWheel={onView1Wheel}
            onTouchStart={onView1TouchStart}
            onTouchEnd={onView1TouchEnd}
            onTouchCancel={() => {
              view1TouchStartYRef.current = null;
            }}
          >
            <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8">
              <MobileHeader
                logoSrc="/assets/svg/logo.png"
                logoAlt="Telesa English logo"
                logoWrapperClassName="relative h-[50px] w-[50px] shrink-0"
                logoImageSize={50}
                ctaClassName="rounded-full border border-white/80 bg-transparent px-5 py-2 text-xs font-medium text-white shadow-sm"
                menuAriaLabel="Menu"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-white/10 text-white shadow-sm backdrop-blur-md"
                menuLineClassName="bg-white"
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={() => router.push("/test?variant=adult")}
              />

              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <h2 className="text-[34px] font-semibold leading-[1.12] tracking-tight">
                  Mô hình lớp học
                  <br />
                  ứng dụng T.E.S
                </h2>

                <div className="relative mt-10 -mx-4 w-[calc(100%+2rem)] overflow-hidden">
                  <div className="relative h-[42vh] w-full">
                    <video
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                      src="/assets/tes5.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[#3D002680]" />

                    <div className="pointer-events-none absolute inset-0 text-white">
                      <svg
                        className="absolute inset-0 h-full w-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        {/* 1) Bottom of "Ôn từ..." -> top of "10 phút" (Luyện phát âm) */}
                        <path
                          d="M22 42 L18 70"
                          fill="none"
                          stroke="rgba(255,255,255,0.65)"
                          strokeWidth="0.6"
                          strokeDasharray="2 3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* 2) Top of "10 phút" (Luyện phát âm) -> bottom of "Ghép câu..." */}
                        <path
                          d="M18 70 L52 52"
                          fill="none"
                          stroke="rgba(255,255,255,0.65)"
                          strokeWidth="0.6"
                          strokeDasharray="2 3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* 3) Bottom of "Ghép câu..." -> top of "10 phút" (Thực hành) */}
                        <path
                          d="M52 52 L78 58"
                          fill="none"
                          stroke="rgba(255,255,255,0.65)"
                          strokeWidth="0.6"
                          strokeDasharray="2 3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <div className="absolute left-[10%] top-[14%] flex flex-col items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/80 text-[12px] font-semibold">
                          5 phút
                        </div>
                        <div className="text-left text-[14px] font-semibold leading-snug">
                          Ôn từ bằng
                          <br />
                          Flashcards Leitner
                        </div>
                      </div>

                      <div className="absolute left-[52%] top-[22%] flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/60 text-[12px] font-semibold text-white/70">
                          15 phút
                        </div>
                      </div>
                      <div className="absolute left-[46%] top-[40%] text-left text-[14px] font-semibold leading-snug text-white/55">
                        Ghép câu phản xạ
                        <br />
                        theo tình huống
                      </div>

                      <div className="absolute left-[11%] top-[70%] flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/60 text-[12px] font-semibold text-white/70">
                          10 phút
                        </div>
                      </div>
                      <div className="absolute left-[18%] top-[84%] text-left text-[14px] font-semibold leading-snug text-white/60">
                        Luyện phát âm &
                        <br />
                        Đánh vần
                      </div>

                      <div className="absolute left-[72%] top-[58%] flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/60 text-[12px] font-semibold text-white/70">
                          10 phút
                        </div>
                      </div>
                      <div className="absolute left-[62%] top-[74%] text-left text-[14px] font-semibold leading-snug text-white/60">
                        Thực hành đóng vai
                        <br />
                        Nói tự nhiên
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none fixed bottom-6 right-6 z-40">
                <div className="pointer-events-auto">
                  <MobileFloatingActions
                    variant="adult"
                    tone="darkGlass"
                    navigationIcon="left"
                    navigationAriaLabel="Quay lại"
                    onScrollToTop={goBack}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
