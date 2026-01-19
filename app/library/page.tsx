"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import Group3ShapeCard from "../components/Group3ShapeCard";
import MobileFloatingActions from "../components/MobileFloatingActions";

type HorizontalSwipeHandlers<T extends HTMLElement> = Pick<
  React.HTMLAttributes<T>,
  "onTouchStart" | "onTouchMove" | "onTouchEnd" | "onTouchCancel"
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

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel };
}

type LibraryShape = {
  key: string;
  level: string;
  title: string;
  subtitle: string;
  descriptionLines: string[];
  badgeText: string;
  topColor: string;
  bodyColor: string;
  bottomColor?: string;
  detail?: {
    duration?: string;
    tuitionLines?: string[];
    book?: string;
    teacherLines?: string[];
    goals?: string[];
    suitable?: string;
  };
};

const SHAPES: LibraryShape[] = [
  {
    key: "level-1",
    level: "LEVEL 1",
    title: "Happy English",
    subtitle: "Starter (4–5 tuổi)",
    descriptionLines: ["Trẻ lần đầu học", "tiếng Anh hoặc", "cần tạo nền tảng", "ngôn ngữ tự", "nhiên."],
    badgeText: "1",
    topColor: "#FFC000",
    bodyColor: "#FFCD33",
    detail: {
      duration: "12 tháng",
      tuitionLines: ["Liên hệ để nhận học phí"],
      book: "Kid's Box (Starter)",
      teacherLines: ["GV Việt Nam + GV nước ngoài"],
      goals: ["Làm quen tiếng Anh tự nhiên", "Phát âm và từ vựng cơ bản", "Nghe – nói theo chủ đề gần gũi"],
      suitable: "Trẻ 4–5 tuổi lần đầu học tiếng Anh",
    },
  },
  {
    key: "level-2",
    level: "LEVEL 2",
    title: "Little Talker",
    subtitle: "(5–6 tuổi)",
    descriptionLines: ["Bé hoàn thành", "Level 1 hoặc", "trẻ 5–6 tuổi có", "khả năng tiếp", "thu tốt."],
    badgeText: "2",
    topColor: "#017FAA",
    bodyColor: "#02A3DA",
    detail: {
      duration: "12 tháng",
      tuitionLines: ["Liên hệ để nhận học phí"],
      book: "Kid's Box 1",
      teacherLines: ["GV Việt Nam + GV nước ngoài"],
      goals: ["Tăng vốn từ theo chủ đề", "Hình thành phản xạ giao tiếp", "Nghe hiểu câu ngắn"],
      suitable: "Trẻ 5–6 tuổi đã có nền tảng Level 1",
    },
  },
  {
    key: "level-3",
    level: "LEVEL 3",
    title: "Confident Kid",
    subtitle: "1 (6–7 tuổi)",
    descriptionLines: ["Bé đã có nền", "tảng cơ bản,", "cần phát triển", "giao tiếp câu", "đơn."],
    badgeText: "3",
    topColor: "#02B3F0",
    bodyColor: "#35C2F3",
    bottomColor: "#02A3DA",
    detail: {
      duration: "12 tháng",
      tuitionLines: ["Liên hệ để nhận học phí"],
      book: "Kid's Box 2",
      teacherLines: ["GV Việt Nam + GV nước ngoài"],
      goals: ["Giao tiếp câu đơn", "Tăng phản xạ nghe – nói", "Làm quen Cambridge Movers"],
      suitable: "Trẻ 6–7 tuổi đã hoàn thành Level 2",
    },
  },
  {
    key: "level-4",
    level: "LEVEL 4",
    title: "Confident Kid 2",
    subtitle: "(7–8 tuổi)",
    descriptionLines: ["Bé đã học Level 3,", "cần mở rộng câu dài", "và tăng kỹ năng", "nghe hiểu."],
    badgeText: "4",
    topColor: "#69A010",
    bodyColor: "#87CE14",
    detail: {
      duration: "12 tháng",
      tuitionLines: ["Năm: 15.900.000", "6 tháng: 9.500.000", "3 tháng: 6.700.000", "1 tháng: 3.900.000"],
      book: "Kid's Box 2",
      teacherLines: ["GV Việt Nam + GV nước ngoài", "20–30% học phần"],
      goals: [
        "Mở rộng câu dài, câu mô tả",
        "Biết kể lại hoạt động hằng ngày",
        "Làm quen thì hiện tại đơn – quá khứ đơn",
        "Nghe hiểu tốt hơn qua đoạn hội thoại",
        "Chuẩn Cambridge Movers",
      ],
      suitable: "Trẻ 7–8 tuổi đã hoàn thành Level 3",
    },
  },
  {
    key: "level-5",
    level: "LEVEL 5",
    title: "Young Explorer 1",
    subtitle: "& 2 (8–9 tuổi)",
    descriptionLines: ["Bé có nền tảng", "Movers cơ bản,", "cần phát triển 4 kỹ", "năng và khả năng", "mô tả – kể chuyện."],
    badgeText: "5",
    topColor: "#94E216",
    bodyColor: "#A9E845",
    detail: {
      duration: "12 tháng",
      tuitionLines: ["Liên hệ để nhận học phí"],
      book: "Kid's Box 3",
      teacherLines: ["GV Việt Nam + GV nước ngoài"],
      goals: ["Phát triển 4 kỹ năng", "Mô tả – kể chuyện", "Chuẩn bị Cambridge Flyers"],
      suitable: "Trẻ 8–9 tuổi có nền tảng Movers",
    },
  },
  {
    key: "level-6",
    level: "LEVEL 6",
    title: "Smart Talker 1",
    subtitle: "& 2 (10–11 tuổi)",
    descriptionLines: [
      "Bé giao tiếp tốt, cần",
      "nâng cấp phản xạ",
      "– học thuật và",
      "hướng Cambridge",
      "Flyers/KET.",
    ],
    badgeText: "6",
    topColor: "#D40887",
    bodyColor: "#DD399F",
    bottomColor: "#C1077B",
    detail: {
      duration: "12 tháng",
      tuitionLines: ["Liên hệ để nhận học phí"],
      book: "Flyers/KET prep",
      teacherLines: ["GV Việt Nam + GV nước ngoài"],
      goals: ["Nâng cấp phản xạ giao tiếp", "Tăng học thuật", "Hướng Cambridge Flyers/KET"],
      suitable: "Học viên 10–11 tuổi, giao tiếp tốt",
    },
  },
];

type Slide = {
  id: string;
  description: { prefix: string; highlight: string };
  images: { src: string; alt: string }[];
};

const SLIDES: Slide[] = [
  {
    id: "topics-1",
    description: {
      prefix: "Học qua chủ đề gần gũi:",
      highlight: "Gia đình, trường học, bạn bè, động vật, ngày lễ...",
    },
    images: [
      { src: "/assets/1-kid-library.jpg", alt: "Gia đình" },
      { src: "/assets/2-kid-library.jpg", alt: "Bạn bè" },
      { src: "/assets/3-kid-library.jpg", alt: "Trường học" },
      { src: "/assets/4-kid-library.jpg", alt: "Động vật" },
    ],
  },
  {
    id: "topics-2",
    description: {
      prefix: "Ứng dụng phương pháp học qua tương tác (Interactive Learning):",
      highlight: "trò chơi ngôn ngữ, kể chuyện, đóng vai, video hoạt hình.",
    },
    images: [
      { src: "/assets/5-kid-library.jpg", alt: "Kể chuyện" },
      { src: "/assets/6-kid-library.jpg", alt: "Video hoạt hình" },
      { src: "/assets/7-kid-library.jpg", alt: "Đóng vai" },
      { src: "/assets/8-kid-library.jpg", alt: "Trò chơi ngôn ngữ" },
    ],
  },
  {
    id: "topics-3",
    description: {
      prefix: "Mỗi buổi học là một trải nghiệm ngôn ngữ tự nhiên,",
      highlight: 'giúp bé “nghe – hiểu – nói” mà không bị gò bó.',
    },
    images: [
      { src: "/assets/9-kid-library.jpg", alt: "Học trực tuyến 1" },
      { src: "/assets/10-kid-library.jpg", alt: "Học trực tuyến 2" },
      { src: "/assets/11-kid-library.jpg", alt: "Học tập 1" },
      { src: "/assets/12-kid-library.jpg", alt: "Học tập 2" },
    ],
  },
];

export default function LibraryPage() {
  const router = useRouter();

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [modalPhase, setModalPhase] = useState<"opening" | "open" | "closing" | "closed">("closed");
  const [activeSlide, setActiveSlide] = useState(0);
  const [tiltKey, setTiltKey] = useState<string | null>(null);

  const progressStep1SectionRef = useRef<HTMLElement | null>(null);
  const progressStep2SectionRef = useRef<HTMLElement | null>(null);
  const progressStep3SectionRef = useRef<HTMLElement | null>(null);
  const progressStep4SectionRef = useRef<HTMLElement | null>(null);
  const progressStep5SectionRef = useRef<HTMLElement | null>(null);
  const progressStep6SectionRef = useRef<HTMLElement | null>(null);
  const progressStep7SectionRef = useRef<HTMLElement | null>(null);
  const progressStep8SectionRef = useRef<HTMLElement | null>(null);

  const active = useMemo(
    () => (activeKey ? SHAPES.find((s) => s.key === activeKey) ?? null : null),
    [activeKey],
  );

  const isModalVisible = !!activeKey && modalPhase !== "closed";

  const openModal = (key: string) => {
    setActiveKey(key);
    setModalPhase("opening");
  };

  const closeModal = () => {
    if (!activeKey) return;
    setModalPhase("closing");
    window.setTimeout(() => {
      setActiveKey(null);
      setModalPhase("closed");
    }, 220);
  };

  useEffect(() => {
    if (!activeKey) return;
    if (modalPhase !== "opening") return;
    const raf = window.requestAnimationFrame(() => setModalPhase("open"));
    return () => window.cancelAnimationFrame(raf);
  }, [activeKey, modalPhase]);

  useEffect(() => {
    if (!active) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [active]);

  useEffect(() => {
    const pairs = [
      { from: progressStep1SectionRef.current, to: progressStep2SectionRef.current },
      { from: progressStep2SectionRef.current, to: progressStep3SectionRef.current },
    ].filter((pair): pair is { from: HTMLElement; to: HTMLElement } => !!pair.from && !!pair.to);

    if (!pairs.length) return;

    const nextByFrom = new Map<HTMLElement, HTMLElement>();
    pairs.forEach((pair) => nextByFrom.set(pair.from, pair.to));

    const timers = new Map<HTMLElement, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const fromEl = entry.target as HTMLElement;
          const toEl = nextByFrom.get(fromEl);
          if (!toEl) return;

          const existing = timers.get(fromEl);
          if (existing != null) window.clearTimeout(existing);

          if (!entry.isIntersecting) {
            timers.delete(fromEl);
            return;
          }

          const timer = window.setTimeout(() => {
            toEl.scrollIntoView({ behavior: "smooth" });
          }, 4000);
          timers.set(fromEl, timer);
        });
      },
      { threshold: 0.8, rootMargin: "-10% 0px -10% 0px" },
    );

    pairs.forEach((pair) => observer.observe(pair.from));
    return () => {
      observer.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
    };
  }, []);

  const swipeHandlers = useHorizontalSwipe<HTMLDivElement>({
    onSwipeLeft: () => setActiveSlide((i) => Math.min(i + 1, SLIDES.length - 1)),
    onSwipeRight: () => setActiveSlide((i) => Math.max(i - 1, 0)),
  });

  const goHome = () => router.push("/");

  return (
    <main
      className={[
        "h-[100dvh] bg-background",
        isModalVisible ? "overflow-hidden" : "overflow-y-auto",
        "snap-y snap-mandatory",
      ].join(" ")}
    >
      <section className="relative h-[100dvh] snap-start overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-6 pt-8 text-slate-900">
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
            <button
              type="button"
              aria-label="Menu"
              className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
            >
              <span className="block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-[26px] font-semibold leading-[1.18] tracking-tight text-slate-800">
                Giáo trình chuẩn <span className="text-[#F4B000]">Cambridge</span>
                <br />– Học theo cấp độ quốc tế
              </h1>
              <p className="mt-3 max-w-[44ch] text-[12px] leading-[1.55] text-slate-500">
                Các khóa học gồm 6 lộ trình liên tiếp từ mẫu giáo đến tiền thiếu niên, bám sát hệ
                thống Cambridge Young Learners và được thiết kế theo từng độ tuổi cùng mục tiêu ngôn
                ngữ phù hợp
              </p>
            </div>

            <div className="mt-4 flex flex-col items-center">
              <div className="flex items-end justify-center scale-[0.92] origin-center">
                {SHAPES.slice(0, 3).map((shape, idx) => (
                  <div
                    key={shape.key}
                    className={[idx === 0 ? "w-[128px]" : "w-[128px] -ml-[40px]"].join(" ")}
                    style={{ zIndex: idx + 1 }}
                  >
                    <button
                      type="button"
                      className="block w-full select-none"
                      onClick={() => openModal(shape.key)}
                    >
                      <Group3ShapeCard
                        className="h-auto w-full"
                        title={shape.title}
                        subtitle={shape.subtitle}
                        descriptionLines={shape.descriptionLines}
                        badgeText={shape.badgeText}
                        topColor={shape.topColor}
                        bottomColor={shape.bottomColor}
                        bodyColor={shape.bodyColor}
                        textColor="#FFFFFF"
                        textOffsetY={24}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex items-end justify-center scale-[0.92] origin-center">
                {SHAPES.slice(3, 6).map((shape, idx) => (
                  <div
                    key={shape.key}
                    className={[idx === 0 ? "w-[128px]" : "w-[128px] -ml-[40px]"].join(" ")}
                    style={{ zIndex: idx + 1 }}
                  >
                    <button
                      type="button"
                      className="block w-full select-none"
                      onClick={() => openModal(shape.key)}
                    >
                      <Group3ShapeCard
                        className="h-auto w-full"
                        title={shape.title}
                        subtitle={shape.subtitle}
                        descriptionLines={shape.descriptionLines}
                        badgeText={shape.badgeText}
                        topColor={shape.topColor}
                        bottomColor={shape.bottomColor}
                        bodyColor={shape.bodyColor}
                        textColor="#FFFFFF"
                        textOffsetY={24}
                      />
                    </button>
                  </div>
                ))}
              </div>
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
              onScrollToTop={goHome}
            />
          </div>
        </div>
      </section>

      <section className="relative h-[100dvh] snap-start bg-[#2F3A4C] text-white">
        <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8">
          <div className="flex items-center justify-between">
            <div className="relative h-16 w-16">
              <Image
                src="/assets/logo.png"
                alt="Telesa English Kids logo"
                width={64}
                height={64}
                className="h-full w-full object-contain"
                priority={false}
              />
            </div>
            <button className="rounded-full border border-white/80 bg-white/10 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md">
              Làm bài kiểm tra ngay
            </button>
            <button
              type="button"
              aria-label="Menu"
              className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-white/10 text-white shadow-sm backdrop-blur-md"
            >
              <span className="block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
            </button>
          </div>

          <div className="mt-10 flex flex-col items-center text-center">
            <div className="mx-auto w-full max-w-[80vw]">
              <h2 className="text-[27px] font-semibold leading-[1.12] tracking-tight">
                Nội dung học sinh động –<br />
                Gắn liền với đời sống
              </h2>

              <p
                className="mt-7 text-[14px] leading-relaxed text-white/90 text-justify"
                style={{ textAlignLast: "center" }}
              >
                {SLIDES[activeSlide]?.description.prefix}{" "}
                <span className="font-semibold text-[#FFC000]">
                  {SLIDES[activeSlide]?.description.highlight}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-1 flex-col justify-center" {...swipeHandlers}>
            <div className="relative overflow-hidden" style={{ touchAction: "pan-y" }}>
              <div
                className="flex w-full transform-gpu transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
              >
                {SLIDES.map((s) => (
                  <div key={s.id} className="w-full flex-shrink-0">
                    <div className="flex flex-wrap justify-center gap-4">
                      {s.images.map((img) => {
                        const isTilting = tiltKey === img.src;
                        return (
                          <button
                            key={`${s.id}-${img.src}`}
                            type="button"
                            className="relative overflow-hidden rounded-[32px] bg-white/5"
                            style={{ height: "21vh", width: "18.48vh" }}
                            onPointerDown={() => setTiltKey(img.src)}
                            onPointerUp={() => setTiltKey(null)}
                            onPointerCancel={() => setTiltKey(null)}
                            onClick={() => {
                              setTiltKey(img.src);
                              window.setTimeout(() => setTiltKey(null), 180);
                            }}
                          >
                            <div
                              className={[
                                "absolute inset-0 transition-transform duration-200 ease-out",
                                isTilting ? "rotate-[3deg] scale-[1.02]" : "rotate-0 scale-100",
                              ].join(" ")}
                            >
                              <Image
                                src={img.src}
                                alt={img.alt}
                                fill
                                sizes="(max-width: 430px) 45vw, 240px"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center gap-3">
              {SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Slide ${idx + 1}`}
                  className={[
                    "h-[6px] w-7 rounded-full transition-all duration-200",
                    idx === activeSlide ? "bg-[#FFC000]" : "bg-white/80",
                  ].join(" ")}
                  onClick={() => setActiveSlide(idx)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-6 right-6">
          <div className="pointer-events-auto">
            <MobileFloatingActions
              variant="kid"
              tone="slate"
              navigationIcon="left"
              navigationAriaLabel="Về trang chủ"
              onScrollToTop={goHome}
            />
          </div>
        </div>
      </section>

      <section className="relative h-[100dvh] snap-start overflow-hidden bg-[#2F3A4C] text-white">
        <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8">
          <div className="relative z-10 flex items-center justify-between">
            <div className="relative h-16 w-16">
              <Image
                src="/assets/logo.png"
                alt="Telesa English Kids logo"
                width={64}
                height={64}
                className="h-full w-full object-contain"
                priority={false}
              />
            </div>
            <button className="rounded-full border border-white/80 bg-white/10 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md">
              Làm bài kiểm tra ngay
            </button>
            <button
              type="button"
              aria-label="Menu"
              className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-white/10 text-white shadow-sm backdrop-blur-md"
            >
              <span className="block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
            </button>
          </div>

          <div className="flex flex-1 flex-col justify-center">
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mx-auto w-full max-w-[82vw]">
                <h2 className="text-[27px] font-semibold leading-[1.12] tracking-tight">
                  Tập trung kỹ năng Nghe –<br />
                  Nói - Phản xạ tự nhiên
                </h2>

                <p
                  className="mt-7 text-[14px] leading-relaxed text-white/90 text-justify"
                  style={{ textAlignLast: "center" }}
                >
                  Khác với mô hình học truyền thống, Telesa English tập trung tâm vào{" "}
                  <span className="font-semibold text-[#FFC000]">
                    giao tiếp và phản xạ ngôn ngữ
                  </span>
                </p>
              </div>
            </div>

            <div className="relative z-10 -mx-4 mt-8 h-[clamp(340px,46vh,560px)] overflow-hidden bg-[#556070] pb-0">
              <div className="grid h-full grid-rows-[2.8fr_1fr]">
                <div className="grid min-h-0 grid-cols-[42%_58%]">
                  <div className="flex min-w-0 items-center px-4 py-5 text-[14px] font-semibold leading-relaxed text-white">
                    <div>
                      Bé được luyện nói <span className="font-extrabold text-white">100%</span>{" "}
                      bằng tiếng Anh với giáo viên
                    </div>
                  </div>
                  <div className="relative min-h-0">
                    <Image
                      src="/assets/13-library-kid.jpg"
                      alt="Học viên luyện nói cùng giáo viên"
                      fill
                      sizes="(max-width: 430px) 60vw, 260px"
                      className="object-cover object-right"
                    />
                  </div>
                </div>

                <div className="grid min-h-0 grid-cols-[42%_58%]">
                  <div className="relative min-h-0">
                    <Image
                      src="/assets/14-library-kid.jpg"
                      alt="Giáo viên chấm phát âm"
                      fill
                      sizes="(max-width: 430px) 45vw, 220px"
                      className="object-cover object-left"
                    />
                  </div>
                  <div className="flex min-w-0 items-center px-4 py-5 text-[14px] leading-relaxed text-white/95">
                    Mỗi học viên có hồ sơ phát âm riêng trên hệ thống Telesa App, được giáo viên
                    chấm giọng – sửa lỗi – hướng dẫn chi tiết
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-6 right-6">
          <div className="pointer-events-auto">
            <MobileFloatingActions
              variant="kid"
              tone="slate"
              navigationIcon="left"
              navigationAriaLabel="Về trang chủ"
              onScrollToTop={goHome}
            />
          </div>
        </div>
      </section>

      <section
        ref={progressStep1SectionRef}
        className="relative h-[100dvh] snap-start bg-white text-slate-900"
      >
        <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8">
          <div className="flex items-center justify-between">
            <div className="relative h-16 w-16">
              <Image
                src="/assets/logo.png"
                alt="Telesa English Kids logo"
                width={64}
                height={64}
                className="h-full w-full object-contain"
                priority={false}
              />
            </div>
            <button className="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm">
              Làm bài kiểm tra ngay
            </button>
            <button
              type="button"
              aria-label="Menu"
              className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
            >
              <span className="block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h2 className="text-[28px] font-semibold leading-[1.12] tracking-tight text-slate-800">
              Đánh giá định kỳ &<br />
              Báo cáo tiến bộ minh bạch
            </h2>

            <div className="mt-14 flex h-[160px] w-[160px] items-center justify-center rounded-full border border-slate-900/60 bg-white ring-2 ring-[#FFC000] shadow-[0_18px_46px_rgba(0,0,0,0.16)]">
              <div className="flex h-[146px] w-[146px] items-center justify-center rounded-full border border-[#FFC000] bg-white">
                <span className="text-[64px] font-semibold leading-none text-[#FFC000]">1</span>
              </div>
            </div>

            <p className="mt-10 max-w-[28ch] text-[14px] font-semibold leading-relaxed text-slate-700">
              Bé được kiểm tra định kỳ với
              <br />
              giáo viên bản xứ
            </p>
          </div>

          <div className="pointer-events-none absolute bottom-6 right-6">
            <div className="pointer-events-auto">
              <MobileFloatingActions
                variant="kid"
                tone="soft"
                navigationIcon="left"
                navigationAriaLabel="Về trang chủ"
                onScrollToTop={goHome}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        ref={progressStep2SectionRef}
        className="relative h-[100dvh] snap-start bg-white text-slate-900"
      >
        <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8">
          <div className="flex items-center justify-between">
            <div className="relative h-16 w-16">
              <Image
                src="/assets/logo.png"
                alt="Telesa English Kids logo"
                width={64}
                height={64}
                className="h-full w-full object-contain"
                priority={false}
              />
            </div>
            <button className="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm">
              Làm bài kiểm tra ngay
            </button>
            <button
              type="button"
              aria-label="Menu"
              className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
            >
              <span className="block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h2 className="text-[28px] font-semibold leading-[1.12] tracking-tight text-slate-800">
              Đánh giá định kỳ &<br />
              Báo cáo tiến bộ minh bạch
            </h2>

            <div className="mt-14 flex h-[160px] w-[160px] items-center justify-center rounded-full border border-slate-900/60 bg-white ring-2 ring-[#FFC000] shadow-[0_18px_46px_rgba(0,0,0,0.16)]">
              <div className="flex h-[146px] w-[146px] items-center justify-center rounded-full border border-[#FFC000] bg-white">
                <span className="text-[64px] font-semibold leading-none text-[#FFC000]">2</span>
              </div>
            </div>

            <p className="mt-10 max-w-[34ch] text-[14px] font-semibold leading-relaxed text-slate-700">
              Trung tâm gửi sổ liên lạc học tập cho
              <br />
              phụ huynh mỗi tháng
            </p>
          </div>

          <div className="pointer-events-none absolute bottom-6 right-6">
            <div className="pointer-events-auto">
              <MobileFloatingActions
                variant="kid"
                tone="soft"
                navigationIcon="left"
                navigationAriaLabel="Về trang chủ"
                onScrollToTop={goHome}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        ref={progressStep3SectionRef}
        className="relative h-[100dvh] snap-start bg-white text-slate-900"
      >
        <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8">
          <div className="flex items-center justify-between">
            <div className="relative h-16 w-16">
              <Image
                src="/assets/logo.png"
                alt="Telesa English Kids logo"
                width={64}
                height={64}
                className="h-full w-full object-contain"
                priority={false}
              />
            </div>
            <button className="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm">
              Làm bài kiểm tra ngay
            </button>
            <button
              type="button"
              aria-label="Menu"
              className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
            >
              <span className="block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h2 className="text-[28px] font-semibold leading-[1.12] tracking-tight text-slate-800">
              Đánh giá định kỳ &<br />
              Báo cáo tiến bộ minh bạch
            </h2>

            <div className="mt-14 flex h-[160px] w-[160px] items-center justify-center rounded-full border border-slate-900/60 bg-white ring-2 ring-[#FFC000] shadow-[0_18px_46px_rgba(0,0,0,0.16)]">
              <div className="flex h-[146px] w-[146px] items-center justify-center rounded-full border border-[#FFC000] bg-white">
                <span className="text-[64px] font-semibold leading-none text-[#FFC000]">3</span>
              </div>
            </div>

            <p className="mt-10 max-w-[36ch] text-[14px] font-semibold leading-relaxed text-slate-700">
              Giáo viên chủ nhiệm trao đổi trực tiếp với phụ huynh, cùng đồng hành để giúp bé tiến
              bộ rõ rệt sau từng giai đoạn.
            </p>
          </div>

          <div className="pointer-events-none absolute bottom-6 right-6">
            <div className="pointer-events-auto">
              <MobileFloatingActions
                variant="kid"
                tone="soft"
                navigationIcon="left"
                navigationAriaLabel="Về trang chủ"
                onScrollToTop={goHome}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        ref={progressStep4SectionRef}
        className="relative h-[100dvh] snap-start bg-white text-slate-900"
      >
        <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8">
          <div className="flex items-center justify-between">
            <div className="relative h-16 w-16">
              <Image
                src="/assets/logo.png"
                alt="Telesa English Kids logo"
                width={64}
                height={64}
                className="h-full w-full object-contain"
                priority={false}
              />
            </div>
            <button className="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm">
              Làm bài kiểm tra ngay
            </button>
            <button
              type="button"
              aria-label="Menu"
              className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
            >
              <span className="block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center text-center">
            <p className="max-w-[26ch] text-[32px] font-medium leading-[1.25] tracking-tight text-[#343B4A]">
              Ở Telesa English, con được học tiếng Anh{" "}
              <span className="text-[#FFC000]">
                theo cách khác biệt – lấy giao tiếp làm trong tâm thay vì áp lực điểm số.
              </span>
            </p>
          </div>

          <div className="pointer-events-none absolute bottom-6 right-6">
            <div className="pointer-events-auto">
              <MobileFloatingActions
                variant="kid"
                tone="soft"
                navigationIcon="left"
                navigationAriaLabel="Về trang chủ"
                onScrollToTop={goHome}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        ref={progressStep5SectionRef}
        className="relative h-[100dvh] snap-start bg-white text-slate-900"
      >
        <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8">
          <div className="flex items-center justify-between">
            <div className="relative h-16 w-16">
              <Image
                src="/assets/logo.png"
                alt="Telesa English Kids logo"
                width={64}
                height={64}
                className="h-full w-full object-contain"
                priority={false}
              />
            </div>
            <button className="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm">
              Làm bài kiểm tra ngay
            </button>
            <button
              type="button"
              aria-label="Menu"
              className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
            >
              <span className="block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="w-full">
              <div className="text-[34px] font-medium leading-[1.2] tracking-tight text-[#343B4A]">
                Ở Telesa English
              </div>
              <div className="mt-10 text-[28px] font-medium leading-[1.25] tracking-tight text-[#FFC000]">
                Con được rèn luyện đủ 4 kỹ năng, đặc biệt là nghe – nói chuẩn ngay từ nhỏ.
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
                onScrollToTop={goHome}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        ref={progressStep6SectionRef}
        className="relative h-[100dvh] snap-start bg-white text-slate-900"
      >
        <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8">
          <div className="flex items-center justify-between">
            <div className="relative h-16 w-16">
              <Image
                src="/assets/logo.png"
                alt="Telesa English Kids logo"
                width={64}
                height={64}
                className="h-full w-full object-contain"
                priority={false}
              />
            </div>
            <button className="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm">
              Làm bài kiểm tra ngay
            </button>
            <button
              type="button"
              aria-label="Menu"
              className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
            >
              <span className="block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="w-full">
              <div className="text-[34px] font-medium leading-[1.2] tracking-tight text-[#343B4A]">
                Ở Telesa English
              </div>
              <div className="mt-10 text-[28px] font-medium leading-[1.25] tracking-tight text-[#FFC000]">
                Con tự tin tập nói, giao tiếp với giáo viên và bạn bè hoàn toàn bằng tiếng Anh.
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
                onScrollToTop={goHome}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        ref={progressStep7SectionRef}
        className="relative h-[100dvh] snap-start bg-white text-slate-900"
      >
        <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8">
          <div className="flex items-center justify-between">
            <div className="relative h-16 w-16">
              <Image
                src="/assets/logo.png"
                alt="Telesa English Kids logo"
                width={64}
                height={64}
                className="h-full w-full object-contain"
                priority={false}
              />
            </div>
            <button className="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm">
              Làm bài kiểm tra ngay
            </button>
            <button
              type="button"
              aria-label="Menu"
              className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
            >
              <span className="block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="w-full">
              <div className="text-[34px] font-medium leading-[1.2] tracking-tight text-[#343B4A]">
                Ở Telesa English
              </div>
              <div className="mt-10 text-[28px] font-medium leading-[1.25] tracking-tight text-[#FFC000]">
                Mỗi buổi học giống như một buổi vui chơi – kết nối – thư giãn sau giờ học trên
                trường, nhưng vẫn tràn đầy kiến thức.
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
                onScrollToTop={goHome}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        ref={progressStep8SectionRef}
        className="relative h-[100dvh] snap-start bg-white text-slate-900"
      >
        <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8">
          <div className="flex items-center justify-between">
            <div className="relative h-16 w-16">
              <Image
                src="/assets/logo.png"
                alt="Telesa English Kids logo"
                width={64}
                height={64}
                className="h-full w-full object-contain"
                priority={false}
              />
            </div>
            <button className="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm">
              Làm bài kiểm tra ngay
            </button>
            <button
              type="button"
              aria-label="Menu"
              className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
            >
              <span className="block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-white" />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="w-full">
              <div className="text-[34px] font-medium leading-[1.2] tracking-tight text-[#343B4A]">
                Ở Telesa English
              </div>
              <div className="mt-10 text-[28px] font-medium leading-[1.25] tracking-tight text-[#FFC000]">
                Quan trọng hơn, con sẽ hình thành đam mê thật sự với tiếng Anh, chứ không chỉ học để
                làm bài kiểm tra.
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
                onScrollToTop={goHome}
              />
            </div>
          </div>
        </div>
      </section>

      {active && (
        <div
          className={[
            "fixed inset-0 z-50 flex items-center justify-center px-5 py-8 transition-opacity duration-200 ease-out",
            modalPhase === "open" ? "opacity-100" : "opacity-0",
            "bg-black/45",
          ].join(" ")}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label={`${active.level} ${active.title}`}
        >
          <div
            className={[
              "w-full max-w-[420px] rounded-[28px] bg-[#FFF7EE] px-6 py-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]",
              "transition-[transform,opacity] duration-200 ease-out",
              modalPhase === "open" ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-[0.98]",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="relative h-14 w-14 shrink-0">
                <Image
                  src="/assets/logo.png"
                  alt="Telesa English Kids logo"
                  width={56}
                  height={56}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className="text-[26px] font-semibold leading-[1.05] tracking-tight"
                  style={{ color: "#D40887" }}
                >
                  {active.level} — {active.title}
                  <br />
                  {active.subtitle}
                </div>
              </div>
            </div>

            <div className="mt-5 max-h-[62vh] overflow-auto pr-1 font-serif text-[15px] leading-relaxed text-slate-900">
              <div className="space-y-4">
                {active.detail?.duration && (
                  <div>
                    <span className="font-semibold">Thời lượng:</span> {active.detail.duration}
                  </div>
                )}

                <div>
                  <div className="font-semibold">Học phí:</div>
                  <div className="mt-1 space-y-1">
                    {(active.detail?.tuitionLines?.length
                      ? active.detail.tuitionLines
                      : ["Đang cập nhật"]
                    ).map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </div>
                </div>

                {active.detail?.book && (
                  <div>
                    <span className="font-semibold">Bộ sách:</span> {active.detail.book}
                  </div>
                )}

                {active.detail?.teacherLines?.length && (
                  <div>
                    <div className="font-semibold">Giáo viên:</div>
                    <div className="mt-1 space-y-1">
                      {active.detail.teacherLines.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="font-semibold">Mục tiêu:</div>
                  <ul className="mt-1 list-disc space-y-1 pl-5 marker:text-[#B8D57A]">
                    {(active.detail?.goals?.length ? active.detail.goals : ["Đang cập nhật"]).map(
                      (goal) => (
                        <li key={goal}>{goal}</li>
                      ),
                    )}
                  </ul>
                </div>

                {active.detail?.suitable && (
                  <div>
                    <div className="font-semibold">Phù hợp cho:</div>
                    <div className="mt-2 flex items-end justify-between gap-4">
                      <div className="flex-1">{active.detail.suitable}</div>
                      <div className="flex items-end gap-3">
                        <div className="h-[54px] w-[34px] rounded-[8px] border border-slate-300 bg-white shadow-sm">
                          <div className="mx-auto mt-1 h-1 w-10 rounded bg-slate-200" />
                          <div className="mx-auto mt-2 h-[34px] w-[26px] rounded bg-slate-100" />
                        </div>
                        <div className="pb-2 text-lg font-semibold text-slate-400">+</div>
                        <div className="h-[54px] w-[42px] rounded-[6px] border border-slate-200 bg-white shadow-sm">
                          <div className="h-[16px] rounded-t-[6px] bg-[#F7C6B3]" />
                          <div className="p-1">
                            <div className="h-2 w-full rounded bg-slate-100" />
                            <div className="mt-1 h-2 w-3/4 rounded bg-slate-100" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
