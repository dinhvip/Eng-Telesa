"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { KidWorldMap } from "./components/KidWorldMap";
import MobileMenuDrawer from "./components/MobileMenuDrawer";

type HorizontalSwipeHandlers<T extends HTMLElement> = Pick<
  React.HTMLAttributes<T>,
  "onTouchStart" | "onTouchMove" | "onTouchEnd" | "onTouchCancel" | "onMouseDown" | "onMouseUp"
>;

function useHorizontalSwipe<T extends HTMLElement>(options: {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  thresholdPx?: number;
  restraintPx?: number;
}): HorizontalSwipeHandlers<T> {
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const triggeredRef = useRef(false);

  const thresholdPx = options.thresholdPx ?? 40;
  const restraintPx = options.restraintPx ?? 80;

  const reset = () => {
    startXRef.current = null;
    startYRef.current = null;
    triggeredRef.current = false;
  };

  const onTouchStart: React.TouchEventHandler<T> = (e) => {
    const t = e.touches[0];
    if (!t) return;
    startXRef.current = t.clientX;
    startYRef.current = t.clientY;
    triggeredRef.current = false;
  };

  const onTouchMove: React.TouchEventHandler<T> = (e) => {
    if (triggeredRef.current) return;
    if (startXRef.current == null || startYRef.current == null) return;
    const t = e.touches[0];
    if (!t) return;

    const dx = t.clientX - startXRef.current;
    const dy = t.clientY - startYRef.current;

    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dy) > restraintPx) return;
    if (Math.abs(dx) < thresholdPx) return;

    triggeredRef.current = true;
    if (dx < 0) options.onSwipeLeft();
    else options.onSwipeRight();
  };

  const onTouchEnd: React.TouchEventHandler<T> = () => reset();
  const onTouchCancel: React.TouchEventHandler<T> = () => reset();

  const onMouseDown: React.MouseEventHandler<T> = (e) => {
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    triggeredRef.current = false;
  };

  const onMouseUp: React.MouseEventHandler<T> = (e) => {
    if (startXRef.current == null || startYRef.current == null) return;
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;
    reset();

    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dy) > restraintPx) return;
    if (Math.abs(dx) < thresholdPx) return;

    if (dx < 0) options.onSwipeLeft();
    else options.onSwipeRight();
  };

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel, onMouseDown, onMouseUp };
}

export default function LandingPage() {
  const mainRef = useRef<HTMLElement | null>(null);
  const [selectedAge, setSelectedAge] = useState<"kid" | "adult" | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSnapIndex, setActiveSnapIndex] = useState(0);
  const [kidSlideIndex, setKidSlideIndex] = useState(0);
  const [kidTextVisible, setKidTextVisible] = useState(true);
  const [kidView8Index, setKidView8Index] = useState(0);
  const [kidView8TextVisible, setKidView8TextVisible] = useState(true);
  const [adultView8Index, setAdultView8Index] = useState(0);
  const [adultView8TextVisible, setAdultView8TextVisible] = useState(true);
  const [kidConsultName, setKidConsultName] = useState("");
  const [kidConsultEmail, setKidConsultEmail] = useState("");
  const [kidConsultContactMethod, setKidConsultContactMethod] = useState<
    "zalo" | "phone" | "email"
  >("zalo");
  const [kidConsultZaloCountry, setKidConsultZaloCountry] = useState<"VN">("VN");
  const [kidConsultZaloNumber, setKidConsultZaloNumber] = useState("");
  const [kidConsultTopic, setKidConsultTopic] = useState("");
  const [kidConsultAgree, setKidConsultAgree] = useState(false);
  const teleSaTextRef = useRef<HTMLDivElement | null>(null);
  const [teleSaOffsetPx, setTeleSaOffsetPx] = useState(0);
  const [teleSaMaxOffsetPx, setTeleSaMaxOffsetPx] = useState(0);
  const [teleSaMaskBaseHeightPx, setTeleSaMaskBaseHeightPx] = useState(0);
  const [teleSaIsDragging, setTeleSaIsDragging] = useState(false);
  const teleSaDragRef = useRef<{
    isDragging: boolean;
    startY: number;
    startOffset: number;
    pointerId: number | null;
  }>({ isDragging: false, startY: 0, startOffset: 0, pointerId: null });

  const kidSlides = [
    {
      image: "/assets/3-kid.png",
      alt: "Telesa English Kids online learning",
      title: "Học tiếng anh trực tuyến",
      description:
        "Có thể học tiếng anh cùng Telesa bất cứ khi nào, ở bất kỳ đâu một cách hiệu quả",
    },
    {
      image: "/assets/3-2-kid.png",
      alt: "Chuẩn bị thiết bị học",
      title: "Chuẩn bị thiết bị học",
      description:
        "Chỉ cần chuẩn bị thiết bị có thể kết nối với internet và cùng học thôi!",
    },
    {
      image: "/assets/3-3-common.png",
      alt: "Truy cập vào website",
      title: "Truy cập vào website",
      description:
        "Khám phá những khóa học hoặc tiếp tục học những khóa học của bạn",
    },
    {
      image: "/assets/3-4-common.png",
      alt: "Nộp bài và sửa bài",
      title: "Nộp bài và sửa bài",
      description:
        "Giáo viên sẽ sửa bài chi tiết sau khi nhận được bài nộp của bạn. Nhớ làm bài tập đầy đủ nhé !",
    },
  ] as const;

  const adultSlides = [
    {
      image: "/assets/3-adult.png",
      alt: "Telesa English online learning",
      title: kidSlides[0].title,
      description: kidSlides[0].description,
    },
    kidSlides[1],
    kidSlides[2],
    kidSlides[3],
  ] as const;

  const changeKidSlide = (nextIndex: number) => {
    if (nextIndex === kidSlideIndex) return;
    if (nextIndex < 0 || nextIndex >= kidSlides.length) return;
    setKidTextVisible(false);
    setTimeout(() => {
      setKidSlideIndex(nextIndex);
      setKidTextVisible(true);
    }, 150);
  };

  const kidCarouselSwipe = useHorizontalSwipe<HTMLDivElement>({
    onSwipeLeft: () => changeKidSlide(kidSlideIndex + 1),
    onSwipeRight: () => changeKidSlide(kidSlideIndex - 1),
  });

  const changeKidView8Slide = (nextIndex: number) => {
    if (nextIndex === kidView8Index) return;
    if (nextIndex < 0 || nextIndex > 1) return;
    setKidView8TextVisible(false);
    setTimeout(() => {
      setKidView8Index(nextIndex);
      setKidView8TextVisible(true);
    }, 150);
  };

  const kidView8Swipe = useHorizontalSwipe<HTMLElement>({
    onSwipeLeft: () => changeKidView8Slide(kidView8Index + 1),
    onSwipeRight: () => changeKidView8Slide(kidView8Index - 1),
  });

  const adultView8Slides = [
    {
      image: "/assets/8-1-adult.jpg",
      objectPositionClass: "object-center",
      title: "Lộ trình tinh gọn",
      description: "Tập trung đúng mục tiêu để tiến bộ nhanh và bền vững.",
    },
    {
      image: "/assets/8-2-adult.jpg",
      objectPositionClass: "object-center",
      title: "Học linh hoạt",
      description: "Chủ động thời gian học phù hợp lịch làm việc bận rộn.",
    },
    {
      image: "/assets/8-3-adult.jpg",
      objectPositionClass: "object-center",
      title: "Giảng viên đồng hành",
      description: "Theo sát tiến độ và hỗ trợ cải thiện từng kỹ năng.",
    },
    {
      image: "/assets/8-4-adult.jpg",
      objectPositionClass: "object-center",
      title: "Tài liệu thực tế",
      description: "Tình huống giao tiếp ứng dụng ngay trong công việc.",
    },
    {
      image: "/assets/8-5-adult.jpg",
      objectPositionClass: "object-center",
      title: "Kết quả rõ ràng",
      description: "Đo lường tiến bộ và tối ưu lộ trình theo từng buổi.",
    },
  ] as const;

  const changeAdultView8Slide = (nextIndex: number) => {
    if (nextIndex === adultView8Index) return;
    if (nextIndex < 0 || nextIndex >= adultView8Slides.length) return;
    setAdultView8TextVisible(false);
    setTimeout(() => {
      setAdultView8Index(nextIndex);
      setAdultView8TextVisible(true);
    }, 150);
  };

  const adultView8Swipe = useHorizontalSwipe<HTMLElement>({
    onSwipeLeft: () => changeAdultView8Slide(adultView8Index + 1),
    onSwipeRight: () => changeAdultView8Slide(adultView8Index - 1),
  });

  const logoSrc =
    selectedAge === "kid"
      ? "/assets/logo.png"
      : "/assets/svg/logo.png";

  const videoSrc =
    selectedAge === "kid"
      ? "/assets/1-kid.mp4"
      : selectedAge === "adult"
        ? "/assets/1-adult.mp4"
        : "/assets/1.mp4";

  const leftImageSrc =
    selectedAge === "kid"
      ? "/assets/1-left-kid.png"
      : selectedAge === "adult"
        ? "/assets/1-left-adult.png"
        : "/assets/1-left.png";

  const rightImageSrc =
    selectedAge === "kid"
      ? "/assets/1-right-kid.png"
      : selectedAge === "adult"
        ? "/assets/1-right-adult.png"
        : "/assets/1-right.png";

  const scrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedAge == null) setIsMenuOpen(false);
  }, [selectedAge]);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = el.clientHeight || window.innerHeight || 1;
        const nextIndex = Math.round(el.scrollTop / h);
        setActiveSnapIndex(nextIndex);
      });
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  const shouldShowMenu = selectedAge != null && activeSnapIndex > 0;

  const activeMenuKey = "home";

  useEffect(() => {
    if (!shouldShowMenu) setIsMenuOpen(false);
  }, [shouldShowMenu]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (selectedAge == null) return;

    const measure = () => {
      const el = teleSaTextRef.current;
      if (!el) return;
      const height = el.offsetHeight;
      if (!Number.isFinite(height) || height <= 0) return;

      const max = Math.max(0, Math.round(height * (2 / 3)));
      setTeleSaMaxOffsetPx(max);
      setTeleSaOffsetPx((prev) => Math.max(-max, Math.min(0, prev)));

      const viewportHeight = window.innerHeight || 0;
      if (viewportHeight > 0) {
        const minHeight = Math.round(viewportHeight * 0.35);
        const coverHeight = Math.round(viewportHeight * 0.3 + height * 0.8);
        setTeleSaMaskBaseHeightPx(
          Math.max(minHeight, Math.max(0, Math.min(viewportHeight, coverHeight))),
        );
      }
    };

    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [selectedAge]);

  const startTeleSaDrag: React.PointerEventHandler<HTMLElement> = (e) => {
    if (teleSaDragRef.current.isDragging) return;
    teleSaDragRef.current.isDragging = true;
    setTeleSaIsDragging(true);
    teleSaDragRef.current.startY = e.clientY;
    teleSaDragRef.current.startOffset = teleSaOffsetPx;
    teleSaDragRef.current.pointerId = e.pointerId;
    const pointerId = e.pointerId;
    const startY = e.clientY;
    const startOffset = teleSaOffsetPx;
    const measuredHeight = teleSaTextRef.current?.offsetHeight ?? 0;
    const max = Math.max(
      teleSaMaxOffsetPx,
      Math.max(0, Math.round(measuredHeight * (2 / 3))),
    );
    if (max !== teleSaMaxOffsetPx) setTeleSaMaxOffsetPx(max);

    const cleanup = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onCancel);
    };

    const onMove = (ev: PointerEvent) => {
      if (teleSaDragRef.current.pointerId !== ev.pointerId) return;
      ev.preventDefault();
      const delta = ev.clientY - startY;
      const next = Math.max(-max, Math.min(0, startOffset + delta));
      setTeleSaOffsetPx(next);
    };

    const onEnd = (ev: PointerEvent) => {
      if (teleSaDragRef.current.pointerId !== ev.pointerId) return;
      cleanup();
      teleSaDragRef.current.isDragging = false;
      setTeleSaIsDragging(false);
      teleSaDragRef.current.pointerId = null;
      setTeleSaOffsetPx((current) => Math.max(-max, Math.min(0, current)));
    };

    const onCancel = (ev: PointerEvent) => {
      if (teleSaDragRef.current.pointerId !== ev.pointerId) return;
      cleanup();
      teleSaDragRef.current.isDragging = false;
      setTeleSaIsDragging(false);
      teleSaDragRef.current.pointerId = null;
      setTeleSaOffsetPx(0);
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onCancel);
  };

  return (
    <>
      {shouldShowMenu && (
        <>
          <MobileMenuDrawer
            open={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            variant={selectedAge === "kid" ? "kid" : "adult"}
            logoSrc={logoSrc}
            activeKey={activeMenuKey}
            onNavigate={(key) => {
              if (key === "home") scrollToTop();
            }}
          />
        </>
      )}

      <main
        ref={mainRef}
        className="relative h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory bg-black text-foreground"
      >
      {/* Slide 1: Age selection */}
      <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center overflow-hidden">
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
          key={videoSrc}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
        />

        <div className="pointer-events-none absolute inset-0 bg-black/40" />

        <div className="relative z-10 flex w-full max-w-md flex-col justify-between px-4 pb-6 pt-8">
          <div className="h-8" />

          <section className="mt-4 rounded-[32px] bg-black/30 px-5 pb-6 pt-5 text-white shadow-lg backdrop-blur-md">
            <div className="mb-6 flex items-center gap-3">
              <div
                className={`relative ${
                  selectedAge === "kid" ? "h-16 w-16" : "h-[50px] w-[50px]"
                }`}
              >
                <Image
                  src={logoSrc}
                  alt="Telesa English logo"
                  width={selectedAge === "kid" ? 64 : 50}
                  height={selectedAge === "kid" ? 64 : 50}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <p className="text-sm font-medium">Telesa English</p>
            </div>

            <h1 className="text-[24px] font-semibold leading-snug">
              Nâng tầm kỹ năng
              <br />
              giao tiếp tiếng Anh
              <br />
              với Telesa English
            </h1>

            <p className="mt-4 text-sm text-white/85">
              Chọn độ tuổi để bắt đầu nhé
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedAge("kid")}
                className={`flex-1 rounded-full border px-3 py-2 text-center text-xs font-medium shadow-sm backdrop-blur-sm transition-all duration-200 ease-out ${
                  selectedAge === "kid"
                    ? "border-white bg-white text-black shadow-lg scale-[1.02]"
                    : "border-white/80 bg-black/20 text-white hover:bg-white/10 hover:scale-[1.02] active:scale-95"
                }`}
              >
                Trẻ em {"<"} 16 tuổi
              </button>
              <button
                type="button"
                onClick={() => setSelectedAge("adult")}
                className={`flex-1 rounded-full border px-3 py-2 text-center text-xs font-medium shadow-sm backdrop-blur-sm transition-all duration-200 ease-out ${
                  selectedAge === "adult"
                    ? "border-white bg-white text-black shadow-lg scale-[1.02]"
                    : "border-white/80 bg-black/20 text-white hover:bg-white/10 hover:scale-[1.02] active:scale-95"
                }`}
              >
                Người lớn {">="} 16 tuổi
              </button>
            </div>
          </section>

          <section className="mt-6 flex flex-1 flex-col items-center justify-end gap-4 pb-3">
            <div className="flex w-full items-end justify-center gap-6">
              <div className="relative w-[44%] aspect-[155/186] overflow-hidden rounded-[28px]">
                <Image
                  src={leftImageSrc}
                  alt="Telesa English class preview"
                  fill
                  sizes="(max-width: 768px) 44vw, 200px"
                  quality={100}
                  className="object-cover"
                  priority
                />
              </div>
              <div className="relative w-[44%] aspect-[155/186] overflow-hidden rounded-[28px]">
                <Image
                  src={rightImageSrc}
                  alt="Telesa English learning session"
                  fill
                  sizes="(max-width: 768px) 44vw, 200px"
                  quality={100}
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* Slide 2: Kid follow-up view */}
      {selectedAge === "kid" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center overflow-hidden">
          <video
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
            src="/assets/2-kid.mp4"
            autoPlay
            muted
            loop
            playsInline
          />

          <div className="pointer-events-none absolute inset-0 bg-black/30" />

          <div className="relative z-10 flex w-full max-w-md flex-col justify-between px-4 pb-6 pt-8 text-white">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-16 w-16">
                <Image
                  src="/assets/logo.png"
                  alt="Telesa English Kids logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-white/80 bg-black/25 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-black/30 text-white shadow-sm backdrop-blur-md">
                <span className="block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              </button>
            </div>

            {/* Bottom content */}
            <div className="mt-auto pb-2">
              <h2 className="text-[22px] font-semibold leading-snug">
                Telesa English –
                <br />
                Nói tự tin, giao tiếp tự nhiên
              </h2>
              <p className="mt-3 text-sm text-white/90">
                Chọn chương trình để bắt đầu hành trình của bạn
              </p>
              <div className="mt-5 flex gap-3">
                <button className="flex-1 rounded-full bg-white px-4 py-2 text-center text-xs font-semibold text-black shadow-sm">
                  Học thử
                </button>
                <button className="flex-1 rounded-full border border-white/80 bg-black/20 px-4 py-2 text-center text-xs font-semibold text-white shadow-sm">
                  Tư vấn ngay
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

	      {/* Slide 3 (kid): Horizontal feature carousel with 4 slides */}
	      {selectedAge === "kid" && (
	        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-white">
	          <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8 text-slate-900">
	            {/* Top bar (same as kid) */}
	            <div className="flex items-center justify-between">
	              <div className="relative h-16 w-16">
	                <Image
	                  src="/assets/logo.png"
	                  alt="Telesa English Kids logo"
	                  width={64}
	                  height={64}
	                  className="h-full w-full object-contain"
	                  priority
	                />
	              </div>
	              <button className="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm">
	                Làm bài kiểm tra ngay
	              </button>
	              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
	                <span className="block h-[2px] w-4 rounded-full bg-white" />
	                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
	                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
	              </button>
	            </div>

            {/* Horizontal slides: animated, one visible at a time */}
            <div
              className="mt-4 flex flex-1 flex-col items-center justify-center"
              style={{ touchAction: "pan-y" }}
              {...kidCarouselSwipe}
            >
              <div className="relative h-[374px] w-full max-w-sm overflow-hidden">
                <div
                  className="flex h-full w-full transform-gpu transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${kidSlideIndex * 100}%)` }}
                >
                  {kidSlides.map((slide, index) => (
                    <div
                      key={index}
                      className="flex w-full flex-shrink-0 flex-col items-center justify-center"
                    >
                      <Image
                        src={slide.image}
                        alt={slide.alt}
                        width={368}
                        height={440}
                        sizes="(max-width: 768px) 90vw, 368px"
                        quality={100}
                        className="h-full w-full object-contain"
                        priority={index === 0}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dots indicator */}
              <div className="mt-4 flex items-center justify-center gap-3">
                {kidSlides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => changeKidSlide(index)}
                    className={`h-1 rounded-full transition-all ${
                      index === kidSlideIndex
                        ? "w-6 bg-amber-400"
                        : "w-4 bg-slate-300"
                    }`}
                  />
                ))}
              </div>

              {/* Text content + floating actions side-by-side */}
              <div
                className={`mt-6 flex w-full items-start justify-between gap-4 transform-gpu transition-all duration-300 ease-out ${
                  kidTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
              >
                <div className="flex-1 text-left">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {kidSlides[kidSlideIndex].title}
                  </h2>
                  <p className="mt-3 text-sm text-slate-600">
                    {kidSlides[kidSlideIndex].description}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-800 shadow-md">
                    <Image
                      src="/assets/svg/phone.svg"
                      alt="Gọi tư vấn Telesa"
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-800 shadow-md">
                    <span className="text-lg">↑</span>
                  </button>
                </div>
              </div>
            </div>
	          </div>
	        </section>
	      )}

      {/* Slide 4 (kid): Stats view */}
      {selectedAge === "kid" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-[#273143] text-white">
          <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-16 w-16">
                <Image
                  src="/assets/logo.png"
                  alt="Telesa English Kids logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-white/80 bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-white">
                <span className="block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              </button>
            </div>

            {/* Center stats */}
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-base font-medium tracking-wide">
                Tiếng anh giao tiếp
              </p>
              <p className="mt-3 text-[64px] font-extrabold leading-none text-amber-400">
                3000+
              </p>
              <p className="mt-4 text-base font-medium">Học viên đang học</p>
            </div>

            {/* Floating actions */}
            <div className="mt-auto flex items-end justify-end pb-1">
              <div className="flex flex-col items-center gap-3">
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#323c4f] text-white shadow-md">
                  <Image
                    src="/assets/svg/phone.svg"
                    alt="Gọi tư vấn Telesa"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#323c4f] text-white shadow-md">
                  <span className="text-lg">↑</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 2 (adult): Adult follow-up view */}
      {selectedAge === "adult" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center overflow-hidden">
          <video
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
            src="/assets/2-adult.mp4"
            autoPlay
            muted
            loop
            playsInline
          />

          <div className="pointer-events-none absolute inset-0 bg-black/30" />

          <div className="relative z-10 flex w-full max-w-md flex-col justify-between px-4 pb-6 pt-8 text-white">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-[50px] w-[50px]">
                <Image
                  src="/assets/svg/logo.png"
                  alt="Telesa English logo"
                  width={50}
                  height={50}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-white/80 bg-black/25 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-black/30 text-white shadow-sm backdrop-blur-md">
                <span className="block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              </button>
            </div>

            {/* Bottom content */}
            <div className="mt-auto pb-2">
              <h2 className="text-[22px] font-semibold leading-snug">
                Telesa English –
                <br />
                Tự tin giao tiếp trong công việc
              </h2>
              <p className="mt-3 text-sm text-white/90">
                Chọn chương trình để bắt đầu nâng cấp kỹ năng tiếng Anh của bạn
              </p>
              <div className="mt-5 flex gap-3">
                <button className="flex-1 rounded-full bg-white px-4 py-2 text-center text-xs font-semibold text-black shadow-sm">
                  Học thử
                </button>
                <button className="flex-1 rounded-full border border-white/80 bg-black/20 px-4 py-2 text-center text-xs font-semibold text-white shadow-sm">
                  Tư vấn ngay
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 3 (adult): Same structure as kid view 3 */}
      {selectedAge === "adult" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-white">
          <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8 text-slate-900">
            {/* Top bar (adult logo) */}
            <div className="flex items-center justify-between">
              <div className="relative h-[50px] w-[50px]">
                <Image
                  src="/assets/svg/logo.png"
                  alt="Telesa English logo"
                  width={50}
                  height={50}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
                <span className="block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              </button>
            </div>

            {/* Horizontal slides: reuse kid slider behaviour but with adult visuals */}
            <div
              className="mt-4 flex flex-1 flex-col items-center justify-center"
              style={{ touchAction: "pan-y" }}
              {...kidCarouselSwipe}
            >
              <div className="relative h-[374px] w-full max-w-sm overflow-hidden">
                <div
                  className="flex h-full w-full transform-gpu transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${kidSlideIndex * 100}%)` }}
                >
                  {adultSlides.map((slide, index) => (
                    <div
                      key={index}
                      className="flex w-full flex-shrink-0 flex-col items-center justify-center"
                    >
                      <Image
                        src={slide.image}
                        alt={slide.alt}
                        width={368}
                        height={440}
                        sizes="(max-width: 768px) 90vw, 368px"
                        quality={100}
                        className="h-full w-full object-contain"
                        priority={index === 0}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dots indicator */}
              <div className="mt-4 flex items-center justify-center gap-3">
                {adultSlides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => changeKidSlide(index)}
                    className={`h-1 rounded-full transition-all ${
                      index === kidSlideIndex
                        ? "w-6 bg-amber-400"
                        : "w-4 bg-slate-300"
                    }`}
                  />
                ))}
              </div>

              {/* Text content + floating actions side-by-side */}
              <div
                className={`mt-6 flex w-full items-start justify-between gap-4 transform-gpu transition-all duration-300 ease-out ${
                  kidTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
              >
                <div className="flex-1 text-left">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {adultSlides[kidSlideIndex].title}
                  </h2>
                  <p className="mt-3 text-sm text-slate-600">
                    {adultSlides[kidSlideIndex].description}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-800 shadow-md">
                    <Image
                      src="/assets/svg/phone-pink.svg"
                      alt="Gọi tư vấn Telesa"
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-800 shadow-md">
                    <span className="text-lg">↑</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 5 (kid): Stats view */}
      {selectedAge === "kid" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-white text-slate-900">
          <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-16 w-16">
                <Image
                  src="/assets/logo.png"
                  alt="Telesa English Kids logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-slate-900">
                <span className="block h-[2px] w-4 rounded-full bg-slate-900" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-900" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-900" />
              </button>
            </div>

            {/* Center stats */}
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-base font-semibold tracking-wide text-slate-800">
                Giảng viên chuyên môn
              </p>
              <p className="mt-4 text-[72px] font-extrabold leading-none text-[#ffb800]">
                100+
              </p>
              <p className="mt-5 text-base font-medium text-slate-700">
                Giảng viên có trên 5 năm kinh nghiệm
              </p>
            </div>

            {/* Floating actions */}
            <div className="mt-auto flex items-end justify-end pb-1">
              <div className="flex flex-col items-center gap-3">
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-md">
                  <Image
                    src="/assets/svg/phone.svg"
                    alt="Gọi tư vấn Telesa"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-md">
                  <span className="text-lg">↑</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 6 (kid): Progress view */}
      {selectedAge === "kid" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-[#273143] text-white">
          <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-16 w-16">
                <Image
                  src="/assets/logo.png"
                  alt="Telesa English Kids logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-white bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-white">
                <span className="block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              </button>
            </div>

            {/* Center stats */}
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-base font-semibold tracking-wide text-white">
                Tiến bộ rõ rệt
              </p>
              <p className="mt-4 text-[72px] font-extrabold leading-none text-[#ffb800]">
                98%
              </p>
              <p className="mt-5 text-base font-medium text-white">
                Học viên cảm nhận thực tế
              </p>
            </div>

            {/* Floating actions */}
            <div className="mt-auto flex items-end justify-end pb-1">
              <div className="flex flex-col items-center gap-3">
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white shadow-md">
                  <Image
                    src="/assets/svg/phone.svg"
                    alt="Gọi tư vấn Telesa"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white shadow-md">
                  <span className="text-lg">↑</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 7 (kid): Technology application view */}
      {selectedAge === "kid" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-white text-slate-900">
          <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-16 w-16">
                <Image
                  src="/assets/logo.png"
                  alt="Telesa English Kids logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-slate-900">
                <span className="block h-[2px] w-4 rounded-full bg-slate-900" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-900" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-900" />
              </button>
            </div>

            {/* Center stats */}
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-base font-semibold tracking-wide text-slate-800">
                Ứng dụng công nghệ
              </p>
              <p className="mt-4 text-[72px] font-extrabold leading-none text-[#ffb800]">
                90%
              </p>
              <p className="mt-5 text-base font-medium text-slate-700">
                Áp dụng công nghệ mới trong dạy học
              </p>
            </div>

            {/* Floating actions */}
            <div className="mt-auto flex items-end justify-end pb-1">
              <div className="flex flex-col items-center gap-3">
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-md">
                  <Image
                    src="/assets/svg/phone.svg"
                    alt="Gọi tư vấn Telesa"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-md">
                  <span className="text-lg">↑</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 8 (kid): Why choose Telesa view (2 sub-slides) */}
      {selectedAge === "kid" && (
        <section
          className="relative flex min-h-[100dvh] w-full snap-start items-stretch justify-center overflow-hidden bg-black text-white"
          style={{ touchAction: "pan-y" }}
          {...kidView8Swipe}
        >
          {/* Background image */}
          <Image
            src={kidView8Index === 0 ? "/assets/8-1-kid.jpg" : "/assets/8-2-kid.jpg"}
            alt="Telesa English Kids learning"
            fill
            priority
            quality={100}
            unoptimized
            sizes="100vw"
            className={`pointer-events-none select-none object-cover ${
              kidView8Index === 0 ? "object-[75%_center]" : "object-center"
            }`}
          />
          {/* Dark overlay for readability */}
          <div className="pointer-events-none absolute inset-0 bg-black/25" />

          <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-2">
              <div className="relative h-16 w-16">
                <Image
                  src="/assets/logo.png"
                  alt="Telesa English Kids logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-white bg-black/30 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-black/40 text-white shadow-sm backdrop-blur-sm">
                <span className="block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              </button>
            </div>

            {/* Text + actions grouped near bottom */}
            <div
              className={`mt-12 flex flex-1 flex-col justify-end pb-10 transform-gpu transition-all duration-300 ease-out ${
                kidView8TextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              {kidView8Index === 0 ? (
                <p className="text-left text-[22px] font-semibold leading-snug text-white">
                  Tại sao nhiều bố mẹ đã
                  <br />
                  cho con học tiếng Anh
                  <br />
                  ở trường nhưng vẫn
                  <br />
                  đăng ký thêm khóa học
                  <br />
                  tại Telesa English?
                </p>
              ) : (
                <p className="text-left text-[22px] font-semibold leading-snug text-white">
                  Chương trình tiếng Anh
                  <br />
                  cho trẻ em tại
                  <br />
                  Telesa English
                </p>
              )}

              {/* Bottom actions */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-col gap-3">
                  <button className="inline-flex items-center justify-center rounded-full border border-white bg-black/30 px-6 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
                    Chi tiết
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeKidView8Slide(0)}
                      className={`h-1.5 rounded-full transition-all ${
                        kidView8Index === 0
                          ? "w-4 bg-amber-400"
                          : "w-3 bg-white/70"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => changeKidView8Slide(1)}
                      className={`h-1.5 rounded-full transition-all ${
                        kidView8Index === 1
                          ? "w-4 bg-amber-400"
                          : "w-3 bg-white/70"
                      }`}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <button className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-white shadow-md backdrop-blur-sm">
                    <Image
                      src="/assets/svg/phone.svg"
                      alt="Gọi tư vấn Telesa"
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                  </button>
                  <button className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-white shadow-md backdrop-blur-sm">
                    <span className="text-lg">↑</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 9 (kid): Testimonials view */}
      {selectedAge === "kid" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-[#273143] text-white">
          <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-16 w-16">
                <Image
                  src="/assets/logo.png"
                  alt="Telesa English Kids logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-white bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-white">
                <span className="block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              </button>
            </div>

            {/* Heading */}
            <div className="mt-6 text-center">
              <h2 className="text-[24px] font-extrabold leading-snug">
                Cảm Nhận Học Viên
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-100">
                Đánh giá và chia sẻ thực tế từ học viên, phụ huynh, giáo viên
                giảng dạy tại trung tâm
              </p>
            </div>

            {/* Testimonial cards: two separate white cards */}
            <div className="mt-5 flex flex-1 flex-col gap-4">
              {/* Card 1 */}
              <div className="rounded-[26px] bg-white px-4 py-4 text-slate-800 shadow-md">
                <p className="text-[13px] leading-relaxed text-slate-700">
                  Ngay từ những ngày đầu, mình đã cảm thấy ấn tượng với môi
                  trường học tập tuyệt vời nơi đây. Các giáo viên không chỉ có
                  chuyên môn cao mà còn rất tâm huyết. Các bạn học nhóm cùng
                  mình cũng rất dễ thương ạ!
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200" />
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-slate-900">
                      Võ Minh Khôi
                    </p>
                    <p className="text-[11px] text-slate-500">Học viên</p>
                    <div className="mt-1 text-[12px] text-amber-400">
                      {"★★★★★"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-[26px] bg-white px-4 py-4 text-slate-800 shadow-md">
                <p className="text-[13px] leading-relaxed text-slate-700">
                  Trung tâm anh ngữ Telesa mang đến trải nghiệm học vừa nghiêm
                  túc nhưng cũng rất thoải mái. Giáo viên luôn tận tâm trong
                  việc dạy học và rất thân thiện với học viên.
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200" />
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-slate-900">
                      Thy
                    </p>
                    <p className="text-[11px] text-slate-500">Học viên</p>
                    <div className="mt-1 text-[12px] text-amber-400">
                      {"★★★★★"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating actions overlaying white block */}
            <div className="pointer-events-none absolute bottom-6 right-6">
              <div className="pointer-events-auto flex flex-col items-center gap-3">
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#323c4f] text-white shadow-md">
                  <Image
                    src="/assets/svg/phone.svg"
                    alt="Gọi tư vấn Telesa"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#323c4f] text-white shadow-md">
                  <span className="text-lg">↑</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 10 (kid): Global connections view */}
      {selectedAge === "kid" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-[#273143] text-white">
          <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-16 w-16">
                <Image
                  src="/assets/logo.png"
                  alt="Telesa English Kids logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-white bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-white">
                <span className="block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              </button>
            </div>

            {/* Heading */}
            <div className="mt-8 text-center px-2">
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

            {/* Map + country card */}
            <div className="mt-6 flex flex-1 w-full flex-col items-center justify-center">
              <KidWorldMap />
            </div>

            {/* Floating actions */}
            <div className="mt-3 flex items-end justify-end pb-1">
              <div className="flex flex-col items-center gap-3">
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#323c4f] text-white shadow-md">
                  <Image
                    src="/assets/svg/phone.svg"
                    alt="Gọi tư vấn Telesa"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#323c4f] text-white shadow-md">
                  <span className="text-lg">↑</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 11 (kid): Consultation form view */}
      {selectedAge === "kid" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center overflow-hidden bg-black text-white">
          <Image
            src="/assets/10-1.jpg"
            alt="Telesa English Kids consultation"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="pointer-events-none select-none object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-[#6B510033]" />

          <div className="relative z-10 flex h-full w-full max-w-md flex-col items-center px-4 pb-3 pt-5">
            {/* Top bar */}
            <div className="flex w-full items-center justify-between gap-3 text-left">
              <div className="relative h-16 w-16">
                <Image
                  src="/assets/logo.png"
                  alt="Telesa English Kids logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-white/80 bg-black/20 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-black/20 text-white shadow-sm backdrop-blur-md">
                <span className="block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              </button>
            </div>

            <div className="mx-auto mt-5 w-[80vw] max-w-full text-center">
              <h2 className="text-[30px] font-extrabold leading-[1.05] tracking-tight text-white">
                Form Đăng Ký Tư Vấn
              </h2>
              <p className="mt-2 text-[15px] font-medium leading-snug text-white/90">
                Để lại thông tin của bạn, chúng tôi sẽ
                <br />
                liên hệ để tư vấn ngay!
              </p>
            </div>

            <form
              className="mt-4 flex flex-1 w-full flex-col gap-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
                <label className="block text-[14px] font-semibold text-white">Tên</label>
                <input
                  value={kidConsultName}
                  onChange={(e) => setKidConsultName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  className="h-[44px] w-full rounded-[16px] bg-white/70 px-4 text-left text-[15px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/80"
                />
              </div>

              <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
                <label className="block text-[14px] font-semibold text-white">Email</label>
                <input
                  value={kidConsultEmail}
                  onChange={(e) => setKidConsultEmail(e.target.value)}
                  placeholder="you@company.com"
                  inputMode="email"
                  className="h-[44px] w-full rounded-[16px] bg-white/70 px-4 text-left text-[15px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/80"
                />
              </div>

              <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
                <label className="block text-[14px] font-semibold text-white">
                  Hình thức liên hệ
                </label>
                <div className="relative">
                  <select
                    value={kidConsultContactMethod}
                    onChange={(e) =>
                      setKidConsultContactMethod(e.target.value as any)
                    }
                    className="h-[44px] w-full appearance-none rounded-[16px] bg-white/70 px-4 pr-10 text-left text-[15px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md focus:bg-white/80"
                  >
                    <option value="zalo">Zalo</option>
                    <option value="phone">Điện thoại</option>
                    <option value="email">Email</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <span className="text-[14px] text-slate-500">⌄</span>
                  </div>
                </div>
              </div>

              <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
                <label className="block text-[14px] font-semibold text-white">Số Zalo</label>
                <div className="flex h-[44px] w-full overflow-hidden rounded-[16px] bg-white/70 shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur-md">
                  <div className="flex items-center gap-2 px-4 text-[15px] text-slate-700">
                    <select
                      value={kidConsultZaloCountry}
                      onChange={(e) => setKidConsultZaloCountry(e.target.value as any)}
                      className="appearance-none bg-transparent font-medium outline-none"
                    >
                      <option value="VN">VN</option>
                    </select>
                    <span className="text-slate-500">⌄</span>
                  </div>
                  <div className="my-2 w-px bg-white/50" />
                  <div className="flex flex-1 items-center px-4">
                    <span className="mr-2 text-[15px] text-slate-500">+84</span>
                    <input
                      value={kidConsultZaloNumber}
                      onChange={(e) => setKidConsultZaloNumber(e.target.value)}
                      placeholder="(555) 000-0000"
                      inputMode="tel"
                      className="h-full w-full bg-transparent text-left text-[15px] text-slate-700 outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
                <label className="text-[14px] font-semibold text-white">
                  Vấn đề cần tư vấn
                </label>
                <textarea
                  value={kidConsultTopic}
                  onChange={(e) => setKidConsultTopic(e.target.value)}
                  placeholder="Bạn muốn chúng tôi hỗ trợ thêm về vấn đề gì"
                  rows={2}
                  className="w-full resize-none rounded-[16px] bg-white/70 px-4 py-3 text-left text-[15px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/80"
                />
              </div>

              <label className="mx-auto mt-1 flex w-[80vw] max-w-full items-start gap-3 text-left text-[14px] text-white/90">
                <input
                  type="checkbox"
                  checked={kidConsultAgree}
                  onChange={(e) => setKidConsultAgree(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded-md border-2 border-white/80 bg-transparent accent-white"
                />
                <span className="leading-snug">
                  Bạn đồng ý với tất cả điều khoản bảo mật của Telesa
                </span>
              </label>

              <div className="mt-1 flex justify-center pb-1">
                  <button
                    type="submit"
                    disabled={!kidConsultAgree}
                    className="mx-auto h-[48px] w-[80vw] max-w-full rounded-[16px] bg-[#FFC000] text-center text-[18px] font-extrabold text-white shadow-[0_14px_28px_rgba(0,0,0,0.20)] disabled:opacity-100 disabled:cursor-not-allowed disabled:brightness-95"
                  >
                    Gửi
                  </button>
              </div>
            </form>

            <button
              type="button"
              onClick={scrollToTop}
              className="absolute bottom-5 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-md"
              aria-label="Lên đầu trang"
            >
              <span className="text-lg">↑</span>
            </button>
          </div>
        </section>
      )}

      {/* Slide 12 (kid): Contact options view */}
      {selectedAge === "kid" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-white text-slate-900">
          <div className="relative z-10 flex h-full w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-16 w-16">
                <Image
                  src="/assets/logo.png"
                  alt="Telesa English Kids logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-slate-800">
                <span className="block h-[2px] w-4 rounded-full bg-slate-800" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-800" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-800" />
              </button>
            </div>

            {/* Heading */}
            <div className="mt-6 text-center">
              <h2 className="text-[28px] font-extrabold leading-[1.1] tracking-tight text-slate-800">
                Hoặc Liên Hệ Ngay Để
                <br />
                Nhận Tư Vấn
              </h2>
              <p className="mt-3 text-[14px] font-medium leading-snug text-slate-500">
                Chúng tôi sẽ liên hệ lại ngay để
                <br />
                tư vấn tận tình
              </p>
            </div>

            {/* Cards */}
            <div className="mt-6 flex flex-1 flex-col justify-center gap-3 pb-7">
              <div className="rounded-[28px] bg-[#E6F7FE] px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Image
                    src="/assets/svg/zalo.svg"
                    alt="Zalo"
                    width={32}
                    height={32}
                    className="h-6 w-6"
                  />
                </div>
                <h3 className="mt-3 text-[24px] font-extrabold text-slate-800">
                  Zalo
                </h3>
                <p className="mt-1 text-[14px] font-medium leading-snug text-slate-500">
                  Liên hệ với chúng tôi qua Zalo
                </p>
              </div>

              <div className="rounded-[28px] bg-[#FFF5FB] px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Image
                    src="/assets/svg/messenger.svg"
                    alt="Messenger"
                    width={32}
                    height={32}
                    className="h-6 w-6"
                  />
                </div>
                <h3 className="mt-3 text-[24px] font-extrabold text-slate-800">
                  Messenger
                </h3>
                <p className="mt-1 text-[14px] font-medium leading-snug text-slate-500">
                  Nhắn tin với chúng tôi ngay
                </p>
              </div>

              <div className="rounded-[28px] bg-[#F4FCE8] px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Image
                    src="/assets/svg/whatsapp.svg"
                    alt="Whatsapp"
                    width={32}
                    height={32}
                    className="h-6 w-6"
                  />
                </div>
                <h3 className="mt-3 text-[24px] font-extrabold text-slate-800">
                  Whatsapp
                </h3>
                <p className="mt-1 text-[14px] font-medium leading-snug text-slate-500">
                  Liên hệ với chúng tôi qua Whatsapp
                </p>
              </div>
            </div>

            {/* Floating up button */}
            <div className="pointer-events-none absolute bottom-6 right-6">
              <div className="pointer-events-auto">
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-md"
                  aria-label="Lên đầu trang"
                >
                  <span className="text-lg">↑</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 13 (kid): TELESA reveal view */}
      {selectedAge === "kid" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center overflow-hidden bg-black">
          <Image
            src="/assets/11-top.jpg"
            alt="Telesa background"
            fill
            priority
            quality={100}
            sizes="100vw"
            unoptimized
            className="pointer-events-none select-none object-cover"
          />

          <div
            className="absolute inset-0 z-10"
            onPointerDown={startTeleSaDrag}
            style={{ touchAction: "none" }}
          >
            {teleSaMaskBaseHeightPx > 0 && (
              <div
                className={`pointer-events-none absolute bottom-0 left-0 right-0 z-30 ${
                  teleSaIsDragging ? "" : "transition-[height] duration-600 ease-out"
                }`}
                style={{
                  height: Math.max(0, teleSaMaskBaseHeightPx + teleSaOffsetPx / 2),
                }}
              >
                <Image
                  src="/assets/11-top.jpg"
                  alt="Telesa background mask"
                  fill
                  priority
                  quality={100}
                  sizes="100vw"
                  unoptimized
                  className="select-none object-cover object-center"
                />
              </div>
            )}

            <div
              className={`absolute left-0 right-0 ${
                teleSaIsDragging ? "" : "transition-transform duration-600 ease-out"
              }`}
              style={{
                bottom: "30vh",
                transform: `translateY(${teleSaOffsetPx}px)`,
                zIndex: 20,
              }}
            >
              <div className="flex w-full items-end justify-center pb-2">
                <div
                  ref={teleSaTextRef}
                  className="w-[90vw] max-w-full select-none whitespace-nowrap text-center text-[72px] font-extrabold leading-none tracking-[0.22em] text-white drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
                >
                  TELESA
                </div>
              </div>
            </div>
          </div>

          {/* Floating up button */}
          <div className="pointer-events-none absolute bottom-6 right-6 z-20">
            <div className="pointer-events-auto">
              <button
                type="button"
                onClick={scrollToTop}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-md"
                aria-label="Lên đầu trang"
              >
                <span className="text-lg">↑</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Slide 14 (kid): Footer contact view */}
      {selectedAge === "kid" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-white text-slate-900">
          <div className="relative z-10 flex h-full w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-16 w-16">
                <Image
                  src="/assets/logo.png"
                  alt="Telesa English Kids logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-slate-700 bg-white px-6 py-2 text-xs font-medium text-slate-700 shadow-sm">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-slate-800">
                <span className="block h-[2px] w-4 rounded-full bg-slate-800" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-800" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-800" />
              </button>
            </div>

            <div className="mt-8 space-y-5">
              {/* Contact info */}
              <section>
                <h2 className="text-[22px] font-extrabold text-slate-800">
                  Thông tin liên hệ
                </h2>
                <div className="mt-3 space-y-3 text-[16px] font-medium text-slate-500">
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M4 6.5C4 5.12 5.12 4 6.5 4h11C18.88 4 20 5.12 20 6.5v11c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 20 4 18.88 4 17.5v-11Z" stroke="currentColor" strokeWidth="2" />
                      <path d="M6.5 7.5 12 11.5 17.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    </svg>
                    <span>team1@telesaenglish.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M7 2h10v20H7V2Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 6h6M9 10h6M9 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M5 22h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>0318591266</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.2 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.55 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.07a2 2 0 0 1 2.11-.45c.8.25 1.64.43 2.5.55A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    </svg>
                    <span>0932639259</span>
                  </div>
                </div>
              </section>

              {/* Social */}
              <section>
                <h2 className="text-[22px] font-extrabold text-slate-800">
                  Mạng xã hội
                </h2>
                <div className="mt-3 flex items-center gap-3">
                  <a href="https://www.facebook.com/TelesaEnglish" target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center">
                    <Image src="/assets/svg/facebook.svg" alt="Facebook" width={36} height={36} className="h-9 w-9" />
                  </a>
                  <a href="https://www.tiktok.com/@telesaenglishofficial" target="_blank" rel="noreferrer" aria-label="TikTok" className="flex h-9 w-9 items-center justify-center">
                    <Image src="/assets/svg/tiktok.svg" alt="TikTok" width={36} height={36} className="h-9 w-9" />
                  </a>
                  <a href="https://www.instagram.com/hoctienganhcungtelesa/" target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center">
                    <Image src="/assets/svg/instagram.svg" alt="Instagram" width={36} height={36} className="h-9 w-9" />
                  </a>
                  <a href="https://www.youtube.com/@Telesaenglish" target="_blank" rel="noreferrer" aria-label="YouTube" className="flex h-9 w-9 items-center justify-center">
                    <Image src="/assets/svg/youtube.svg" alt="YouTube" width={36} height={36} className="h-9 w-9" />
                  </a>
                </div>
              </section>

              {/* Download */}
              <section>
                <h2 className="text-[22px] font-extrabold text-slate-800">
                  Tải ngay
                </h2>
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
                © 2025 Untitled UI. All rights reserved.
              </p>
            </div>

            {/* Floating actions */}
            <div className="pointer-events-none absolute bottom-24 right-6">
              <div className="pointer-events-auto flex flex-col items-center gap-4">
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3f3f3] shadow-md"
                  aria-label="Gọi tư vấn"
                >
                  <Image
                    src="/assets/svg/phone.svg"
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px]"
                  />
                </button>
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3f3f3] shadow-md"
                  aria-label="Lên đầu trang"
                >
                  <span className="text-xl text-slate-700">↑</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 4 (adult): Stats view */}
      {selectedAge === "adult" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-[#273143] text-white">
          <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-[50px] w-[50px]">
                <Image
                  src="/assets/svg/logo.png"
                  alt="Telesa English logo"
                  width={50}
                  height={50}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-white/80 bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-white">
                <span className="block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              </button>
            </div>

            {/* Center stats */}
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-base font-medium tracking-wide">
                Tiếng anh giao tiếp
              </p>
              <p className="mt-3 text-[64px] font-extrabold leading-none text-[#e0007a]">
                1000+
              </p>
              <p className="mt-4 text-base font-medium">Học viên đang học</p>
            </div>

            {/* Floating actions */}
            <div className="mt-auto flex items-end justify-end pb-1">
              <div className="flex flex-col items-center gap-3">
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#323c4f] text-white shadow-md">
                  <Image
                    src="/assets/svg/phone-pink.svg"
                    alt="Gọi tư vấn Telesa"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#323c4f] text-white shadow-md">
                  <span className="text-lg">↑</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 5 (adult): Teacher stats view */}
      {selectedAge === "adult" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-white text-slate-900">
          <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-[50px] w-[50px]">
                <Image
                  src="/assets/svg/logo.png"
                  alt="Telesa English logo"
                  width={50}
                  height={50}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-slate-900">
                <span className="block h-[2px] w-4 rounded-full bg-slate-900" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-900" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-900" />
              </button>
            </div>

            {/* Center stats */}
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-base font-semibold tracking-wide text-slate-800">
                Giảng viên chuyên môn
              </p>
              <p className="mt-4 text-[72px] font-extrabold leading-none text-[#e0007a]">
                25+
              </p>
              <p className="mt-5 text-base font-medium text-slate-700">
                Giảng viên có trên 5 năm kinh nghiệm
              </p>
            </div>

            {/* Floating actions */}
            <div className="mt-auto flex items-end justify-end pb-1">
              <div className="flex flex-col items-center gap-3">
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4f4f4] text-slate-800 shadow-md">
                  <Image
                    src="/assets/svg/phone-pink.svg"
                    alt="Gọi tư vấn Telesa"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4f4f4] text-slate-800 shadow-md">
                  <span className="text-lg">↑</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 6 (adult): Progress view */}
      {selectedAge === "adult" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-[#273143] text-white">
          <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-[50px] w-[50px]">
                <Image
                  src="/assets/svg/logo.png"
                  alt="Telesa English logo"
                  width={50}
                  height={50}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-white bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-white">
                <span className="block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              </button>
            </div>

            {/* Center stats */}
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-base font-semibold tracking-wide text-white">
                Tiến bộ rõ rệt
              </p>
              <p className="mt-4 text-[72px] font-extrabold leading-none text-[#e0007a]">
                98%
              </p>
              <p className="mt-5 text-base font-medium text-white">
                Học viên cảm nhận thực tế
              </p>
            </div>

            {/* Floating actions */}
            <div className="mt-auto flex items-end justify-end pb-1">
              <div className="flex flex-col items-center gap-3">
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#323c4f] text-white shadow-md">
                  <Image
                    src="/assets/svg/phone-pink.svg"
                    alt="Gọi tư vấn Telesa"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#323c4f] text-white shadow-md">
                  <span className="text-lg">↑</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 7 (adult): Technology application view */}
      {selectedAge === "adult" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-white text-slate-900">
          <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-[50px] w-[50px]">
                <Image
                  src="/assets/svg/logo.png"
                  alt="Telesa English logo"
                  width={50}
                  height={50}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-slate-900">
                <span className="block h-[2px] w-4 rounded-full bg-slate-900" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-900" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-900" />
              </button>
            </div>

            {/* Center stats */}
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-base font-semibold tracking-wide text-slate-800">
                Ứng dụng công nghệ
              </p>
              <p className="mt-4 text-[72px] font-extrabold leading-none text-[#e0007a]">
                90%
              </p>
              <p className="mt-5 text-base font-medium text-slate-700">
                Áp dụng công nghệ mới trong dạy học
              </p>
            </div>

            {/* Floating actions */}
            <div className="mt-auto flex items-end justify-end pb-1">
              <div className="flex flex-col items-center gap-3">
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4f4f4] text-slate-800 shadow-md">
                  <Image
                    src="/assets/svg/phone-pink.svg"
                    alt="Gọi tư vấn Telesa"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </button>
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4f4f4] text-slate-800 shadow-md">
                  <span className="text-lg">↑</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 8 (adult): Why choose Telesa view (5 sub-slides) */}
      {selectedAge === "adult" && (
        <section
          className="relative flex min-h-[100dvh] w-full snap-start items-stretch justify-center overflow-hidden bg-black text-white"
          style={{ touchAction: "pan-y" }}
          {...adultView8Swipe}
        >
          {/* Background image */}
          <Image
            src={adultView8Slides[adultView8Index].image}
            alt="Telesa English Adult learning"
            fill
            priority
            quality={100}
            unoptimized
            sizes="100vw"
            className={`pointer-events-none select-none object-cover ${adultView8Slides[adultView8Index].objectPositionClass}`}
          />
          <div className="pointer-events-none absolute inset-0 bg-black/25" />

          <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-2">
              <div className="relative h-[50px] w-[50px]">
                <Image
                  src="/assets/svg/logo.png"
                  alt="Telesa English logo"
                  width={50}
                  height={50}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-white bg-black/30 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-black/40 text-white shadow-sm backdrop-blur-sm">
                <span className="block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              </button>
            </div>

            {/* Text + actions grouped near bottom */}
            <div
              className={`mt-12 flex flex-1 flex-col justify-end pb-10 transform-gpu transition-all duration-300 ease-out ${
                adultView8TextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
            >
              <div className="max-w-[90vw]">
                <p className="text-left text-[22px] font-semibold leading-snug text-white">
                  {adultView8Slides[adultView8Index].title}
                </p>
                <p className="mt-2 text-left text-sm leading-relaxed text-white/90">
                  {adultView8Slides[adultView8Index].description}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-col gap-3">
                  <button className="inline-flex items-center justify-center rounded-full border border-white bg-black/30 px-6 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-sm">
                    Chi tiết
                  </button>
                  <div className="flex items-center gap-2">
                    {adultView8Slides.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => changeAdultView8Slide(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          adultView8Index === index
                            ? "w-4 bg-[#e0007a]"
                            : "w-3 bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <button className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-white shadow-md backdrop-blur-sm">
                    <Image
                      src="/assets/svg/phone-pink.svg"
                      alt="Gọi tư vấn Telesa"
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={scrollToTop}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-white shadow-md backdrop-blur-sm"
                    aria-label="Lên đầu trang"
                  >
                    <span className="text-lg">↑</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 9 (adult): Testimonials view */}
      {selectedAge === "adult" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-[#273143] text-white">
          <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-[50px] w-[50px]">
                <Image
                  src="/assets/svg/logo.png"
                  alt="Telesa English logo"
                  width={50}
                  height={50}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-white/80 bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-white">
                <span className="block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              </button>
            </div>

            {/* Heading */}
            <div className="mt-6 text-center">
              <h2 className="text-[24px] font-extrabold leading-snug">
                Cảm Nhận Học Viên
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-100">
                Đánh giá và chia sẻ thực tế từ học viên, phụ huynh, giáo viên
                giảng dạy tại trung tâm
              </p>
            </div>

            {/* Testimonial cards */}
            <div className="mt-5 flex flex-1 flex-col gap-4">
              <div className="rounded-[26px] bg-white px-4 py-4 text-slate-800 shadow-md">
                <p className="text-[13px] leading-relaxed text-slate-700">
                  Ngay từ những ngày đầu, mình đã cảm thấy ấn tượng với môi
                  trường học tập tuyệt vời nơi đây. Các giáo viên không chỉ có
                  chuyên môn cao mà còn rất tâm huyết. Các bạn học nhóm cùng
                  mình cũng rất dễ thương ạ!
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200" />
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-slate-900">
                      Võ Minh Khôi
                    </p>
                    <p className="text-[11px] text-slate-500">Học viên</p>
                    <div className="mt-1 text-[12px] text-[#D40887]">
                      {"★★★★★"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] bg-white px-4 py-4 text-slate-800 shadow-md">
                <p className="text-[13px] leading-relaxed text-slate-700">
                  Trung tâm anh ngữ Telesa mang đến trải nghiệm học vừa nghiêm
                  túc nhưng cũng rất thoải mái. Giáo viên luôn tận tâm trong
                  việc dạy học và rất thân thiện với học viên.
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200" />
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-slate-900">Thy</p>
                    <p className="text-[11px] text-slate-500">Học viên</p>
                    <div className="mt-1 text-[12px] text-[#D40887]">
                      {"★★★★★"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating actions */}
            <div className="pointer-events-none absolute bottom-6 right-6">
              <div className="pointer-events-auto flex flex-col items-center gap-3">
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#323c4f] text-white shadow-md">
                  <Image
                    src="/assets/svg/phone-pink.svg"
                    alt="Gọi tư vấn Telesa"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </button>
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#323c4f] text-white shadow-md"
                  aria-label="Lên đầu trang"
                >
                  <span className="text-lg">↑</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 10 (adult): Global connections view */}
      {selectedAge === "adult" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-[#273143] text-white">
          <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-[50px] w-[50px]">
                <Image
                  src="/assets/svg/logo.png"
                  alt="Telesa English logo"
                  width={50}
                  height={50}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-white/80 bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-white">
                <span className="block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              </button>
            </div>

            {/* Heading */}
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

            {/* Map */}
            <div className="mt-6 flex w-full flex-1 flex-col items-center justify-center">
              <KidWorldMap highlightColor="#D40887" />
            </div>

            {/* Floating actions */}
            <div className="mt-3 flex items-end justify-end pb-1">
              <div className="flex flex-col items-center gap-3">
                <button className="flex h-11 w-11 items-center justify-center rounded-full bg-[#323c4f] text-white shadow-md">
                  <Image
                    src="/assets/svg/phone-pink.svg"
                    alt="Gọi tư vấn Telesa"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </button>
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#323c4f] text-white shadow-md"
                  aria-label="Lên đầu trang"
                >
                  <span className="text-lg">↑</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 11 (adult): Consultation form view */}
      {selectedAge === "adult" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center overflow-hidden bg-black text-white">
          <Image
            src="/assets/10-2.jpg"
            alt="Telesa English consultation"
            fill
            priority
            quality={100}
            unoptimized
            sizes="100vw"
            className="pointer-events-none select-none object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: "#59033933" }}
          />

          <div className="relative z-10 flex h-full w-full max-w-md flex-col items-center px-4 pb-3 pt-5">
            {/* Top bar */}
            <div className="flex w-full items-center justify-between gap-3 text-left">
              <div className="relative h-[50px] w-[50px]">
                <Image
                  src="/assets/svg/logo.png"
                  alt="Telesa English logo"
                  width={50}
                  height={50}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-white/80 bg-black/20 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-black/20 text-white shadow-sm backdrop-blur-md">
                <span className="block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              </button>
            </div>

            <div className="mx-auto mt-5 w-[80vw] max-w-full text-center">
              <h2 className="text-[30px] font-extrabold leading-[1.05] tracking-tight text-white">
                Form Đăng Ký Tư Vấn
              </h2>
              <p className="mt-2 text-[15px] font-medium leading-snug text-white/90">
                Để lại thông tin của bạn, chúng tôi sẽ
                <br />
                liên hệ để tư vấn ngay!
              </p>
            </div>

            <form
              className="mt-4 flex w-full flex-1 flex-col gap-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
                <label className="block text-[14px] font-semibold text-white">
                  Tên
                </label>
                <input
                  value={kidConsultName}
                  onChange={(e) => setKidConsultName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  className="h-[44px] w-full rounded-[16px] bg-white/70 px-4 text-left text-[15px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/80"
                />
              </div>

              <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
                <label className="block text-[14px] font-semibold text-white">
                  Email
                </label>
                <input
                  value={kidConsultEmail}
                  onChange={(e) => setKidConsultEmail(e.target.value)}
                  placeholder="you@company.com"
                  inputMode="email"
                  className="h-[44px] w-full rounded-[16px] bg-white/70 px-4 text-left text-[15px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/80"
                />
              </div>

              <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
                <label className="block text-[14px] font-semibold text-white">
                  Hình thức liên hệ
                </label>
                <div className="relative">
                  <select
                    value={kidConsultContactMethod}
                    onChange={(e) =>
                      setKidConsultContactMethod(e.target.value as any)
                    }
                    className="h-[44px] w-full appearance-none rounded-[16px] bg-white/70 px-4 pr-10 text-left text-[15px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md focus:bg-white/80"
                  >
                    <option value="zalo">Zalo</option>
                    <option value="phone">Điện thoại</option>
                    <option value="email">Email</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <span className="text-[14px] text-slate-500">⌄</span>
                  </div>
                </div>
              </div>

              {kidConsultContactMethod === "zalo" && (
                <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
                  <label className="block text-[14px] font-semibold text-white">
                    Số Zalo
                  </label>
                  <div className="flex h-[44px] w-full items-center rounded-[16px] bg-white/70 px-3 shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur-md">
                    <select
                      value={kidConsultZaloCountry}
                      onChange={(e) =>
                        setKidConsultZaloCountry(e.target.value as any)
                      }
                      className="h-full w-16 bg-transparent text-[14px] text-slate-700 outline-none"
                    >
                      <option value="VN">VN</option>
                    </select>
                    <span className="mx-2 h-5 w-px bg-slate-300/70" />
                    <input
                      value={kidConsultZaloNumber}
                      onChange={(e) => setKidConsultZaloNumber(e.target.value)}
                      placeholder="+84 (555) 000-0000"
                      inputMode="tel"
                      className="h-full flex-1 bg-transparent text-left text-[15px] text-slate-700 outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>
              )}

              <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
                <label className="block text-[14px] font-semibold text-white">
                  Vấn đề cần tư vấn
                </label>
                <textarea
                  value={kidConsultTopic}
                  onChange={(e) => setKidConsultTopic(e.target.value)}
                  placeholder="Bạn muốn chúng tôi hỗ trợ thêm về vấn đề gì"
                  className="h-[72px] w-full resize-none rounded-[16px] bg-white/70 px-4 py-3 text-left text-[15px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/80"
                />
              </div>

              <label className="mx-auto flex w-[80vw] max-w-full items-start gap-3 text-left text-[14px] text-white/90">
                <input
                  type="checkbox"
                  checked={kidConsultAgree}
                  onChange={(e) => setKidConsultAgree(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded-md border-2 border-white/80 bg-transparent accent-white"
                />
                <span className="leading-snug">
                  Bạn đồng ý với tất cả điều khoản bảo mật của Telesa
                </span>
              </label>

              <div className="mt-1 flex justify-center pb-1">
                <button
                  type="submit"
                  disabled={!kidConsultAgree}
                  className="mx-auto h-[48px] w-[80vw] max-w-full rounded-[16px] bg-[#D40887] text-center text-[18px] font-extrabold text-white shadow-[0_14px_28px_rgba(0,0,0,0.20)] disabled:opacity-100 disabled:cursor-not-allowed disabled:brightness-95"
                >
                  Gửi
                </button>
              </div>
            </form>

            <button
              type="button"
              onClick={scrollToTop}
              className="absolute bottom-5 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-md"
              aria-label="Lên đầu trang"
            >
              <span className="text-lg">↑</span>
            </button>
          </div>
        </section>
      )}

      {/* Slide 12 (adult): Contact options view */}
      {selectedAge === "adult" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-white text-slate-900">
          <div className="relative z-10 flex h-full w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-16 w-16">
                <Image
                  src="/assets/svg/logo.png"
                  alt="Telesa English logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-slate-800">
                <span className="block h-[2px] w-4 rounded-full bg-slate-800" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-800" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-800" />
              </button>
            </div>

            {/* Heading */}
            <div className="mt-6 text-center">
              <h2 className="text-[28px] font-extrabold leading-[1.1] tracking-tight text-slate-800">
                Hoặc Liên Hệ Ngay Để
                <br />
                Nhận Tư Vấn
              </h2>
              <p className="mt-3 text-[14px] font-medium leading-snug text-slate-500">
                Chúng tôi sẽ liên hệ lại ngay để
                <br />
                tư vấn tận tình
              </p>
            </div>

            {/* Cards */}
            <div className="mt-6 flex flex-1 flex-col justify-center gap-3 pb-7">
              <div className="rounded-[28px] bg-[#E6F7FE] px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Image
                    src="/assets/svg/zalo.svg"
                    alt="Zalo"
                    width={32}
                    height={32}
                    className="h-6 w-6"
                  />
                </div>
                <h3 className="mt-3 text-[24px] font-extrabold text-slate-800">
                  Zalo
                </h3>
                <p className="mt-1 text-[14px] font-medium leading-snug text-slate-500">
                  Liên hệ với chúng tôi qua Zalo
                </p>
              </div>

              <div className="rounded-[28px] bg-[#FFF5FB] px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Image
                    src="/assets/svg/messenger.svg"
                    alt="Messenger"
                    width={32}
                    height={32}
                    className="h-6 w-6"
                  />
                </div>
                <h3 className="mt-3 text-[24px] font-extrabold text-slate-800">
                  Messenger
                </h3>
                <p className="mt-1 text-[14px] font-medium leading-snug text-slate-500">
                  Nhắn tin với chúng tôi ngay
                </p>
              </div>

              <div className="rounded-[28px] bg-[#F4FCE8] px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Image
                    src="/assets/svg/whatsapp.svg"
                    alt="Whatsapp"
                    width={32}
                    height={32}
                    className="h-6 w-6"
                  />
                </div>
                <h3 className="mt-3 text-[24px] font-extrabold text-slate-800">
                  Whatsapp
                </h3>
                <p className="mt-1 text-[14px] font-medium leading-snug text-slate-500">
                  Liên hệ với chúng tôi qua Whatsapp
                </p>
              </div>
            </div>

            {/* Floating up button */}
            <div className="pointer-events-none absolute bottom-6 right-6">
              <div className="pointer-events-auto">
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-md"
                  aria-label="Lên đầu trang"
                >
                  <span className="text-lg">↑</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Slide 13 (adult): TELESA reveal view */}
      {selectedAge === "adult" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center overflow-hidden bg-black">
          <Image
            src="/assets/11-top.jpg"
            alt="Telesa background"
            fill
            priority
            quality={100}
            sizes="100vw"
            unoptimized
            className="pointer-events-none select-none object-cover"
          />

          <div
            className="absolute inset-0 z-10"
            onPointerDown={startTeleSaDrag}
            style={{ touchAction: "none" }}
          >
            {teleSaMaskBaseHeightPx > 0 && (
              <div
                className={`pointer-events-none absolute bottom-0 left-0 right-0 z-30 ${
                  teleSaIsDragging ? "" : "transition-[height] duration-600 ease-out"
                }`}
                style={{
                  height: Math.max(0, teleSaMaskBaseHeightPx + teleSaOffsetPx / 2),
                }}
              >
                <Image
                  src="/assets/11-top.jpg"
                  alt="Telesa background mask"
                  fill
                  priority
                  quality={100}
                  sizes="100vw"
                  unoptimized
                  className="select-none object-cover object-center"
                />
              </div>
            )}

            <div
              className={`absolute left-0 right-0 ${
                teleSaIsDragging ? "" : "transition-transform duration-600 ease-out"
              }`}
              style={{
                bottom: "30vh",
                transform: `translateY(${teleSaOffsetPx}px)`,
                zIndex: 20,
              }}
            >
              <div className="flex w-full items-end justify-center pb-2">
                <div
                  ref={teleSaTextRef}
                  className="w-[90vw] max-w-full select-none whitespace-nowrap text-center text-[72px] font-extrabold leading-none tracking-[0.22em] text-white drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
                >
                  TELESA
                </div>
              </div>
            </div>
          </div>

          {/* Floating up button */}
          <div className="pointer-events-none absolute bottom-6 right-6 z-20">
            <div className="pointer-events-auto">
              <button
                type="button"
                onClick={scrollToTop}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-800 shadow-md"
                aria-label="Lên đầu trang"
              >
                <span className="text-lg">↑</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Slide 14 (adult): Footer contact view */}
      {selectedAge === "adult" && (
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-white text-slate-900">
          <div className="relative z-10 flex h-full w-full max-w-md flex-col px-4 pb-6 pt-8">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <div className="relative h-16 w-16">
                <Image
                  src="/assets/svg/logo.png"
                  alt="Telesa English logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <button className="rounded-full border border-slate-700 bg-white px-6 py-2 text-xs font-medium text-slate-700 shadow-sm">
                Làm bài kiểm tra ngay
              </button>
              <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-slate-800">
                <span className="block h-[2px] w-4 rounded-full bg-slate-800" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-800" />
                <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-800" />
              </button>
            </div>

            <div className="mt-8 space-y-5">
              {/* Contact info */}
              <section>
                <h2 className="text-[22px] font-extrabold text-slate-800">
                  Thông tin liên hệ
                </h2>
                <div className="mt-3 space-y-3 text-[16px] font-medium text-slate-500">
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M4 6.5C4 5.12 5.12 4 6.5 4h11C18.88 4 20 5.12 20 6.5v11c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 20 4 18.88 4 17.5v-11Z" stroke="currentColor" strokeWidth="2" />
                      <path d="M6.5 7.5 12 11.5 17.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    </svg>
                    <span>team1@telesaenglish.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M7 2h10v20H7V2Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 6h6M9 10h6M9 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M5 22h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>0318591266</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.2 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.55 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.07a2 2 0 0 1 2.11-.45c.8.25 1.64.43 2.5.55A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    </svg>
                    <span>0932639259</span>
                  </div>
                </div>
              </section>

              {/* Social */}
              <section>
                <h2 className="text-[22px] font-extrabold text-slate-800">
                  Mạng xã hội
                </h2>
                <div className="mt-3 flex items-center gap-3">
                  <a href="https://www.facebook.com/TelesaEnglish" target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center">
                    <Image src="/assets/svg/facebook.svg" alt="Facebook" width={36} height={36} className="h-9 w-9" />
                  </a>
                  <a href="https://www.tiktok.com/@telesaenglishofficial" target="_blank" rel="noreferrer" aria-label="TikTok" className="flex h-9 w-9 items-center justify-center">
                    <Image src="/assets/svg/tiktok.svg" alt="TikTok" width={36} height={36} className="h-9 w-9" />
                  </a>
                  <a href="https://www.instagram.com/hoctienganhcungtelesa/" target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center">
                    <Image src="/assets/svg/instagram.svg" alt="Instagram" width={36} height={36} className="h-9 w-9" />
                  </a>
                  <a href="https://www.youtube.com/@Telesaenglish" target="_blank" rel="noreferrer" aria-label="YouTube" className="flex h-9 w-9 items-center justify-center">
                    <Image src="/assets/svg/youtube.svg" alt="YouTube" width={36} height={36} className="h-9 w-9" />
                  </a>
                </div>
              </section>

              {/* Download */}
              <section>
                <h2 className="text-[22px] font-extrabold text-slate-800">
                  Tải ngay
                </h2>
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
                © 2025 Untitled UI. All rights reserved.
              </p>
            </div>

            {/* Floating actions */}
            <div className="pointer-events-none absolute bottom-24 right-6">
              <div className="pointer-events-auto flex flex-col items-center gap-4">
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3f3f3] shadow-md"
                  aria-label="Gọi tư vấn"
                >
                  <Image
                    src="/assets/svg/phone-pink.svg"
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px]"
                  />
                </button>
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3f3f3] shadow-md"
                  aria-label="Lên đầu trang"
                >
                  <span className="text-xl text-slate-700">↑</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
      </main>
    </>
  );
}
