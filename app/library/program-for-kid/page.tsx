"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import DesktopNavbar from "../../components/DesktopNavbar";
import FooterContactView from "../../components/FooterContactView";
import Group3ShapeCard from "../../components/Group3ShapeCard";
import MobileHeader from "../../components/MobileHeader";
import MobileFloatingActions from "../../components/MobileFloatingActions";
import MobileMenuDrawer from "../../components/MobileMenuDrawer";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [modalPhase, setModalPhase] = useState<"opening" | "open" | "closing" | "closed">("closed");
  const [activeSlide, setActiveSlide] = useState(0);
  const [tiltKey, setTiltKey] = useState<string | null>(null);

  const progressStep1SectionRef = useRef<HTMLElement | null>(null);
  const progressStep2SectionRef = useRef<HTMLElement | null>(null);
  const progressStep3SectionRef = useRef<HTMLElement | null>(null);

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

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };

  const mainScrollRef = useRef<HTMLElement | null>(null);
  const scrollToTop = () => {
    mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <DesktopNavbar
        variant="kid"
        logoSrc="/assets/logo.png"
        activeKey="library"
        activeColor="#FFC000"
        backgroundClassName="bg-[#B6B6B6]"
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
        activeKey="library-program-for-kid"
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
        }}
      />

      <main
        ref={mainScrollRef}
        className={[
          "h-[100dvh] bg-background",
          isModalVisible ? "overflow-hidden" : "overflow-y-auto",
          "snap-y snap-mandatory",
        ].join(" ")}
      >
        <section className="relative h-[100dvh] snap-start overflow-hidden bg-[#F8F9FA] text-slate-900">
          {/* Desktop hero (do not affect mobile) */}
          <div className="mx-auto hidden h-full w-full max-w-6xl items-center gap-12 px-[4vw] pt-[120px] lg:flex">
            <div className="w-[46%]">
              <h1 className="text-[clamp(2.2rem,2.8vw,3.2rem)] font-semibold leading-[1.14] tracking-tight text-[#343B4A]">
                Giáo trình chuẩn <span className="text-[#F4B000]">Cambridge</span>
                <br />– Học theo cấp độ quốc tế
              </h1>
              <p className="mt-7 max-w-[58ch] text-[clamp(1rem,1.15vw,1.125rem)] leading-relaxed text-slate-500">
                Các khóa học gồm 6 lộ trình liên tiếp từ mẫu giáo đến tiền thiếu niên, bám sát hệ
                thống Cambridge Young Learners và được thiết kế theo từng độ tuổi cùng mục tiêu ngôn
                ngữ phù hợp
              </p>
            </div>

            <div className="flex flex-1 flex-col items-end gap-12">
              <div className="flex items-end justify-end">
                {SHAPES.slice(0, 3).map((shape, idx) => (
                  <div
                    key={shape.key}
                    className={[
                      "h-[30vh] max-h-[30vh] shrink-0 aspect-[133/222]",
                      idx === 0 ? "" : "-ml-[6vh]",
                    ].join(" ")}
                    style={{ zIndex: idx + 1 }}
                  >
                    <button
                      type="button"
                      className="block w-full select-none transition-transform duration-150 hover:-translate-y-1"
                      onClick={() => openModal(shape.key)}
                    >
                      <Group3ShapeCard
                        className="h-full w-full"
                        title={shape.title}
                        subtitle={shape.subtitle}
                        descriptionLines={shape.descriptionLines}
                        badgeText={shape.badgeText}
                        topColor={shape.topColor}
                        bottomColor={shape.bottomColor}
                        bodyColor={shape.bodyColor}
                        textColor="#FFFFFF"
                        textOffsetY={28}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mr-[clamp(2.5rem,6vw,6.25rem)] flex items-end justify-end">
                {SHAPES.slice(3, 6).map((shape, idx) => (
                  <div
                    key={shape.key}
                    className={[
                      "h-[30vh] max-h-[30vh] shrink-0 aspect-[133/222]",
                      idx === 0 ? "" : "-ml-[6vh]",
                    ].join(" ")}
                    style={{ zIndex: idx + 1 }}
                  >
                    <button
                      type="button"
                      className="block w-full select-none transition-transform duration-150 hover:-translate-y-1"
                      onClick={() => openModal(shape.key)}
                    >
                      <Group3ShapeCard
                        className="h-full w-full"
                        title={shape.title}
                        subtitle={shape.subtitle}
                        descriptionLines={shape.descriptionLines}
                        badgeText={shape.badgeText}
                        topColor={shape.topColor}
                        bottomColor={shape.bottomColor}
                        bodyColor={shape.bodyColor}
                        textColor="#FFFFFF"
                        textOffsetY={28}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile hero (unchanged) */}
          <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-6 pt-8 text-slate-900 lg:hidden">
	            <MobileHeader
	              logoSrc="/assets/logo.png"
	              logoAlt="Telesa English Kids logo"
	              logoPriority
	              ctaClassName="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm"
	              menuAriaLabel="Menu"
	              menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
	              menuLineClassName="bg-white"
	              onMenuOpen={() => setIsMenuOpen(true)}
	            />

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
        </section>

      <section className="relative h-[100dvh] snap-start bg-[#2F3A4C] text-white">
        {/* Desktop */}
        <div className="mx-auto hidden h-full w-full max-w-7xl px-[min(7.5vw,120px)] pt-[120px] lg:grid lg:grid-cols-2 lg:items-center lg:gap-[clamp(2.5rem,5vw,6rem)]">
          <div className="max-w-[560px] text-left">
            <h2 className="text-[clamp(1.92rem,2.56vw,2.88rem)] font-semibold leading-[1.12] tracking-tight">
              Nội dung học sinh động –
              <br />
              Gắn liền với đời sống
            </h2>

            <p className="mt-10 max-w-[62ch] text-[clamp(1rem,1.2vw,1.15rem)] leading-relaxed text-white/90">
              {SLIDES[activeSlide]?.description.prefix}{" "}
              <span className="font-semibold text-[#FFC000]">
                {SLIDES[activeSlide]?.description.highlight}
              </span>
            </p>
          </div>

          <div className="flex items-center justify-end">
            <div className="w-[min(680px,40vw)]">
              <div className="grid grid-cols-2 gap-8">
                {(SLIDES[activeSlide]?.images ?? []).map((img) => (
                  <button
                    key={img.src}
                    type="button"
                    className="relative w-full aspect-[0.88/1] min-h-[25vh] max-h-[30vh] overflow-hidden rounded-[28px]"
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
                        tiltKey === img.src ? "rotate-[2deg] scale-[1.02]" : "rotate-0 scale-100",
                      ].join(" ")}
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes="(max-width: 1024px) 40vw, 340px"
                        className="object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-10 left-1/2 hidden -translate-x-1/2 lg:block">
          <div className="pointer-events-auto flex items-center justify-center gap-3">
            {SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Slide ${idx + 1}`}
                className={[
                  "h-[6px] w-12 rounded-full transition-all duration-200",
                  idx === activeSlide ? "bg-[#FFC000]" : "bg-white/40",
                ].join(" ")}
                onClick={() => setActiveSlide(idx)}
              />
            ))}
          </div>
        </div>

        {/* Mobile */}
        <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8 lg:hidden">
	          <MobileHeader
	            logoSrc="/assets/logo.png"
	            logoAlt="Telesa English Kids logo"
	            ctaClassName="rounded-full border border-white/80 bg-white/10 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md"
	            menuAriaLabel="Menu"
	            menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-white/10 text-white shadow-sm backdrop-blur-md"
	            menuLineClassName="bg-white"
	            onMenuOpen={() => setIsMenuOpen(true)}
	          />

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

        <div className="pointer-events-none absolute bottom-6 right-6 lg:hidden">
          <div className="pointer-events-auto">
            <MobileFloatingActions
              variant="kid"
              tone="slate"
              navigationIcon="left"
              navigationAriaLabel="Về trang chủ"
              onScrollToTop={goBack}
            />
          </div>
        </div>
      </section>

      <section className="relative h-[100dvh] snap-start overflow-hidden bg-[#2F3A4C] text-white">
        {/* Desktop */}
        <div className="mx-auto hidden h-full w-full max-w-7xl px-[min(7.5vw,120px)] pt-[120px] lg:grid lg:grid-cols-2 lg:items-center lg:gap-[clamp(2.5rem,5vw,6rem)]">
          <div className="max-w-[560px] text-left">
            <h2 className="text-[clamp(2.6rem,3.4vw,3.8rem)] font-semibold leading-[1.1] tracking-tight">
              Tập trung kỹ năng Nghe –
              <br />
              Nói – Phản xạ tự nhiên
            </h2>

            <p className="mt-10 max-w-[62ch] text-[clamp(1rem,1.2vw,1.15rem)] leading-relaxed text-white/85">
              Khác với mô hình học truyền thống, Telesa English đặt trọng tâm vào{" "}
              <span className="font-semibold text-[#FFC000]">giao tiếp và phản xạ ngôn ngữ</span>
            </p>
          </div>

          <div className="flex items-center justify-end">
            <div className="w-[min(760px,42vw)]">
              <div className="h-[min(78vh,760px)] overflow-hidden bg-[#556070]">
                <div className="grid h-full grid-rows-[2.6fr_1.4fr]">
                  <div className="grid min-h-0 grid-cols-[42%_58%]">
                    <div className="flex min-w-0 items-center px-8 py-10 text-[clamp(1.05rem,1.25vw,1.3rem)] font-semibold leading-relaxed text-white">
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
                        sizes="(max-width: 1024px) 50vw, 520px"
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
                        sizes="(max-width: 1024px) 50vw, 520px"
                        className="object-cover object-left"
                      />
                    </div>
                    <div className="flex min-w-0 items-center px-8 py-10 text-[clamp(1rem,1.15vw,1.2rem)] leading-relaxed text-white/95">
                      Mỗi học viên có hồ sơ phát âm riêng trên hệ thống Telesa App, được giáo viên
                      chấm giọng – sửa lỗi – hướng dẫn chi tiết
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8 lg:hidden">
	          <MobileHeader
	            className="relative z-10"
	            logoSrc="/assets/logo.png"
	            logoAlt="Telesa English Kids logo"
	            ctaClassName="rounded-full border border-white/80 bg-white/10 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md"
	            menuAriaLabel="Menu"
	            menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-white/10 text-white shadow-sm backdrop-blur-md"
	            menuLineClassName="bg-white"
	            onMenuOpen={() => setIsMenuOpen(true)}
	          />

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

            <div className="relative z-10 -mx-4 mt-8 h-[clamp(380px,52vh,620px)] overflow-hidden bg-[#556070] pb-0">
              <div className="grid h-full grid-rows-[2.6fr_1.4fr]">
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

        <div className="pointer-events-none absolute bottom-6 right-6 lg:hidden">
          <div className="pointer-events-auto">
            <MobileFloatingActions
              variant="kid"
              tone="slate"
              navigationIcon="left"
              navigationAriaLabel="Về trang chủ"
              onScrollToTop={goBack}
            />
          </div>
        </div>
      </section>

      {/* Desktop: combine progress steps 1-3 into one view */}
      <section className="relative hidden min-h-[100dvh] snap-start bg-[#F8F9FA] text-slate-900 lg:block">
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col px-[min(7.5vw,120px)]">
          <div className="flex flex-1 flex-col justify-center py-20">
            <h2 className="text-center text-[clamp(2.1rem,2.6vw,2.9rem)] font-semibold leading-[1.15] tracking-tight text-[#313A4C]">
              Đánh giá định kỳ &<br />
              Báo cáo tiến bộ minh bạch
            </h2>

            <div className="mt-[clamp(3rem,8vh,5.5rem)] grid grid-cols-[1fr_1fr_1.25fr] gap-[clamp(1.5rem,4vw,4rem)]">
              <div className="flex min-w-0 flex-col items-center text-center">
                <div className="flex h-[90px] w-[90px] items-center justify-center rounded-full border-2 border-[#FFC000]">
                  <span className="text-[40px] font-semibold leading-none text-[#FFC000]">1</span>
                </div>
                <p className="mt-6 text-[clamp(0.95rem,1.15vw,1.15rem)] font-semibold leading-relaxed text-[#313A4C]">
                  Bé được kiểm tra định kỳ với
                  <br />
                  giáo viên bản xứ
                </p>
              </div>

              <div className="flex min-w-0 flex-col items-center text-center">
                <div className="flex h-[90px] w-[90px] items-center justify-center rounded-full border-2 border-[#FFC000]">
                  <span className="text-[40px] font-semibold leading-none text-[#FFC000]">2</span>
                </div>
                <p className="mt-6 text-[clamp(0.95rem,1.15vw,1.15rem)] font-semibold leading-relaxed text-[#313A4C]">
                  Trung tâm gửi sổ liên lạc học tập cho
                  <br />
                  phụ huynh mỗi tháng
                </p>
              </div>

              <div className="flex min-w-0 flex-col items-center text-center">
                <div className="flex h-[90px] w-[90px] items-center justify-center rounded-full border-2 border-[#FFC000]">
                  <span className="text-[40px] font-semibold leading-none text-[#FFC000]">3</span>
                </div>
                <p className="mt-6 text-[clamp(0.95rem,1.15vw,1.15rem)] font-semibold leading-relaxed text-[#313A4C]">
                  Giáo viên chủ nhiệm trao đổi trực tiếp với phụ huynh, cùng đồng hành để giúp bé
                  tiến bộ rõ rệt sau từng giai đoạn.
                </p>
              </div>
            </div>
          </div>
        </div>

        <FooterContactView
          variant="kid"
          logoSrc="/assets/logo.png"
          snapStart={false}
          showFloatingActions={false}
          showMobileHeader={false}
          onMenuOpen={() => {}}
          onScrollToTop={scrollToTop}
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
      </section>

      <section
        ref={progressStep1SectionRef}
        className="relative h-[100dvh] snap-start bg-[#F8F9FA] text-slate-900 lg:hidden"
      >
        <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8">
          <MobileHeader
            logoSrc="/assets/logo.png"
            logoAlt="Telesa English Kids logo"
            ctaClassName="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm"
            menuAriaLabel="Menu"
            menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
            menuLineClassName="bg-white"
            onMenuOpen={() => setIsMenuOpen(true)}
          />

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
                onScrollToTop={goBack}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        ref={progressStep2SectionRef}
        className="relative h-[100dvh] snap-start bg-[#F8F9FA] text-slate-900 lg:hidden"
      >
        <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8">
          <MobileHeader
            logoSrc="/assets/logo.png"
            logoAlt="Telesa English Kids logo"
            ctaClassName="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm"
            menuAriaLabel="Menu"
            menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
            menuLineClassName="bg-white"
            onMenuOpen={() => setIsMenuOpen(true)}
          />

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
                onScrollToTop={goBack}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        ref={progressStep3SectionRef}
        className="relative h-[100dvh] snap-start bg-[#F8F9FA] text-slate-900 lg:hidden"
      >
        <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8">
          <MobileHeader
            logoSrc="/assets/logo.png"
            logoAlt="Telesa English Kids logo"
            ctaClassName="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm"
            menuAriaLabel="Menu"
            menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
            menuLineClassName="bg-white"
            onMenuOpen={() => setIsMenuOpen(true)}
          />

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
                onScrollToTop={goBack}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="lg:hidden">
        <FooterContactView
          variant="kid"
          logoSrc="/assets/logo.png"
          showFloatingActions={false}
          showMobileHeader={false}
          onMenuOpen={() => {}}
          onScrollToTop={scrollToTop}
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

      {active && (
        <div
          className={[
            "fixed inset-0 z-50 flex items-center justify-center px-5 py-8 transition-opacity duration-200 ease-out",
            modalPhase === "open" ? "opacity-100" : "opacity-0",
            "bg-[#313A4C]/90",
          ].join(" ")}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="Chương trình học"
        >
          <div
            className={[
              "relative w-[min(92vw,520px)] aspect-[2/3] overflow-hidden rounded-[32px] lg:h-[60vh] lg:w-auto lg:max-w-[80vw]",
              "transition-[transform,opacity] duration-200 ease-out",
              modalPhase === "open" ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-[0.98]",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src="/assets/chuongtrinhhoc.png"
              alt="Chương trình học"
              fill
              sizes="(max-width: 1024px) 92vw, 720px"
              className="object-contain"
              priority={false}
            />
          </div>
        </div>
      )}
      </main>
    </>
  );
}
