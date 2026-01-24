"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

import DesktopNavbar from "../../components/DesktopNavbar";
import MobileHeader from "../../components/MobileHeader";
import MobileFloatingActions from "../../components/MobileFloatingActions";
import MobileMenuDrawer from "../../components/MobileMenuDrawer";
import BackgroundVideo from "../../components/BackgroundVideo";

type TesDirection = "forward" | "back";

type TesSlide = { src: string; alt: string };

type TesTransition = {
  from: number;
  to: number;
  direction: TesDirection;
  phase: "prepare" | "animate";
};

type ModelNode = { x: number; y: number; rx: number; ry: number };
type ModelBox = { x: number; y: number; w: number; h: number };

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
    <div className={["mt-6 flex w-full justify-center overflow-visible", props.wrapperClassName ?? ""].join(" ")}>
      <div
        className={[
          "relative aspect-[360/520] select-none overflow-visible",
          props.frameClassName ?? "h-[36vh] max-h-[480px]",
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
  const [modelStep, setModelStep] = useState(0);
  const MODEL_LINE_ANIM_MS = 520;
  const modelStepRef = useRef(modelStep);
  const modelStepTargetRef = useRef(modelStep);
  const modelStepTimerRef = useRef<number | null>(null);
  const desktopModelOverlayRef = useRef<HTMLDivElement | null>(null);
  const desktopModelStep0Ref = useRef<HTMLButtonElement | null>(null);
  const desktopModelStep1Ref = useRef<HTMLButtonElement | null>(null);
  const desktopModelStep2Ref = useRef<HTMLButtonElement | null>(null);
  const desktopModelStep3Ref = useRef<HTMLButtonElement | null>(null);
  const desktopModelText0Ref = useRef<HTMLDivElement | null>(null);
  const desktopModelText1Ref = useRef<HTMLDivElement | null>(null);
  const desktopModelText2Ref = useRef<HTMLDivElement | null>(null);
  const desktopModelText3Ref = useRef<HTMLDivElement | null>(null);
  const mobileModelOverlayRef = useRef<HTMLDivElement | null>(null);
  const mobileModelStep0Ref = useRef<HTMLButtonElement | null>(null);
  const mobileModelStep1Ref = useRef<HTMLButtonElement | null>(null);
  const mobileModelStep2Ref = useRef<HTMLButtonElement | null>(null);
  const mobileModelStep3Ref = useRef<HTMLButtonElement | null>(null);
  const mobileModelText0Ref = useRef<HTMLDivElement | null>(null);
  const mobileModelText1Ref = useRef<HTMLDivElement | null>(null);
  const mobileModelText2Ref = useRef<HTMLDivElement | null>(null);
  const mobileModelText3Ref = useRef<HTMLDivElement | null>(null);
  const [desktopModelNodes, setDesktopModelNodes] = useState<ModelNode[] | null>(null);
  const [mobileModelNodes, setMobileModelNodes] = useState<ModelNode[] | null>(null);
  const [desktopModelTextBoxes, setDesktopModelTextBoxes] = useState<ModelBox[] | null>(null);
  const [mobileModelTextBoxes, setMobileModelTextBoxes] = useState<ModelBox[] | null>(null);
  const desktopModelMaskId = useId().replaceAll(":", "");
  const mobileModelMaskId = useId().replaceAll(":", "");
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

  useEffect(() => {
    modelStepRef.current = modelStep;
  }, [modelStep]);

  const getNodeInViewBox = (container: HTMLElement, target: HTMLElement): ModelNode => {
    const containerRect = container.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = ((cx - containerRect.left) / containerRect.width) * 100;
    const y = ((cy - containerRect.top) / containerRect.height) * 100;
    const rx = (rect.width / containerRect.width) * 50;
    const ry = (rect.height / containerRect.height) * 50;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      rx,
      ry,
    };
  };

  const getBoxInViewBox = (container: HTMLElement, target: HTMLElement): ModelBox => {
    const containerRect = container.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const x = ((rect.left - containerRect.left) / containerRect.width) * 100;
    const y = ((rect.top - containerRect.top) / containerRect.height) * 100;
    const w = (rect.width / containerRect.width) * 100;
    const h = (rect.height / containerRect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      w: Math.max(0, Math.min(100, w)),
      h: Math.max(0, Math.min(100, h)),
    };
  };

  useLayoutEffect(() => {
    const updateDesktop = () => {
      const container = desktopModelOverlayRef.current;
      const n0 = desktopModelStep0Ref.current;
      const n1 = desktopModelStep1Ref.current;
      const n2 = desktopModelStep2Ref.current;
      const n3 = desktopModelStep3Ref.current;
      const t0 = desktopModelText0Ref.current;
      const t1 = desktopModelText1Ref.current;
      const t2 = desktopModelText2Ref.current;
      const t3 = desktopModelText3Ref.current;
      if (!container || !n0 || !n1 || !n2 || !n3) return;
      setDesktopModelNodes([
        getNodeInViewBox(container, n0),
        getNodeInViewBox(container, n1),
        getNodeInViewBox(container, n2),
        getNodeInViewBox(container, n3),
      ]);
      if (t0 && t1 && t2 && t3) {
        setDesktopModelTextBoxes([
          getBoxInViewBox(container, t0),
          getBoxInViewBox(container, t1),
          getBoxInViewBox(container, t2),
          getBoxInViewBox(container, t3),
        ]);
      }
    };

    const updateMobile = () => {
      const container = mobileModelOverlayRef.current;
      const n0 = mobileModelStep0Ref.current;
      const n1 = mobileModelStep1Ref.current;
      const n2 = mobileModelStep2Ref.current;
      const n3 = mobileModelStep3Ref.current;
      const t0 = mobileModelText0Ref.current;
      const t1 = mobileModelText1Ref.current;
      const t2 = mobileModelText2Ref.current;
      const t3 = mobileModelText3Ref.current;
      if (!container || !n0 || !n1 || !n2 || !n3) return;
      setMobileModelNodes([
        getNodeInViewBox(container, n0),
        getNodeInViewBox(container, n1),
        getNodeInViewBox(container, n2),
        getNodeInViewBox(container, n3),
      ]);
      if (t0 && t1 && t2 && t3) {
        setMobileModelTextBoxes([
          getBoxInViewBox(container, t0),
          getBoxInViewBox(container, t1),
          getBoxInViewBox(container, t2),
          getBoxInViewBox(container, t3),
        ]);
      }
    };

    const raf = window.requestAnimationFrame(() => {
      updateDesktop();
      updateMobile();
    });

    window.addEventListener("resize", updateDesktop);
    window.addEventListener("resize", updateMobile);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateDesktop);
      window.removeEventListener("resize", updateMobile);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (modelStepTimerRef.current == null) return;
      window.clearTimeout(modelStepTimerRef.current);
      modelStepTimerRef.current = null;
    };
  }, []);

  const highlightLetter: "T" | "E" | "S" | "ALL" =
    activeIndex === 0 ? "ALL" : activeIndex === 1 ? "T" : activeIndex === 2 ? "E" : "S";

  const tesOverviewText =
    "T.E.S – Telesa English Speaking là phương pháp học tiếng Anh thực hành, được thiết kế đặc biệt cho người mất gốc đến trung cấp, giúp học viên nói đúng – nhanh – tự nhiên thông qua 3 trụ cột chính.";

  const descriptionText =
    activeIndex === 0
      ? tesOverviewText
      : activeIndex === 1
      ? "T – Từ vựng: Học từ theo hệ thống Leitner Flashcards qua 5 cấp độ ghi nhớ dài hạn, theo cụm và ngữ cảnh thực tế, kèm âm thanh – hình ảnh – ví dụ, giúp kích hoạt trí nhớ và phản xạ tự nhiên."
      : activeIndex === 2
        ? "E – Ghép câu phản xạ: Nắm vững cấu trúc câu đơn, luyện ghép cụm – chọn thì – phản xạ qua 4 bước (nhìn tranh, nghe tình huống, trả lời, đóng vai), giúp nói tự tin và giảm lỗi ngữ pháp mà không cần học lý thuyết khó khăn."
        : activeIndex === 3
          ? "S – Phát âm: Luyện phát âm theo IPA và khẩu hình, sửa âm khó, rèn ngữ điệu – nối âm bằng kỹ thuật Shadowing & Repetition, giúp nói chuẩn và tự nhiên như người bản xứ."
        : "";

  const desktopHighlightLetter: "T" | "E" | "S" | "ALL" =
    desktopActiveIndex === 0 ? "ALL" : desktopActiveIndex === 1 ? "T" : desktopActiveIndex === 2 ? "E" : "S";

  const desktopDescriptionText =
    desktopActiveIndex === 1
      ? "T – Từ vựng: Học từ theo hệ thống Leitner Flashcards qua 5 cấp độ ghi nhớ dài hạn, theo cụm và ngữ cảnh thực tế, kèm âm thanh – hình ảnh – ví dụ, giúp kích hoạt trí nhớ và phản xạ tự nhiên."
      : desktopActiveIndex === 2
        ? "E – Ghép câu phản xạ: Nắm vững cấu trúc câu đơn, luyện ghép cụm – chọn thì – phản xạ qua 4 bước (nhìn tranh, nghe tình huống, trả lời, đóng vai), giúp nói tự tin và giảm lỗi ngữ pháp mà không cần học lý thuyết khó khăn."
        : desktopActiveIndex === 3
          ? "S – Phát âm: Luyện phát âm theo IPA và khẩu hình, sửa âm khó, rèn ngữ điệu – nối âm bằng kỹ thuật Shadowing & Repetition, giúp nói chuẩn và tự nhiên như người bản xứ."
        : "";

  const desktopBodyText = desktopActiveIndex === 0 ? tesOverviewText : desktopDescriptionText;

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

  const goToModelStep = (target: number) => {
    const clampedTarget = Math.max(0, Math.min(3, target));
    modelStepTargetRef.current = clampedTarget;

    if (modelStepTimerRef.current != null) return;
    const current = modelStepRef.current;
    if (current === clampedTarget) return;

    const stepOnce = () => {
      modelStepTimerRef.current = window.setTimeout(() => {
        modelStepTimerRef.current = null;
        const currentStep = modelStepRef.current;
        const targetStep = modelStepTargetRef.current;
        if (currentStep === targetStep) return;

        const direction = targetStep > currentStep ? 1 : -1;
        setModelStep(currentStep + direction);
        stepOnce();
      }, MODEL_LINE_ANIM_MS);
    };

    const direction = clampedTarget > current ? 1 : -1;
    setModelStep(current + direction);
    stepOnce();
  };

  const desktopSegments = useMemo(() => {
    if (!desktopModelNodes) {
      return ["M24 40 L21 74", "M21 74 L56 50", "M56 50 L80 60"];
    }
    const [p0, p1, p2, p3] = desktopModelNodes;
    if (!p0 || !p1 || !p2 || !p3) return ["M24 40 L21 74", "M21 74 L56 50", "M56 50 L80 60"];
    return [`M${p0.x} ${p0.y} L${p1.x} ${p1.y}`, `M${p1.x} ${p1.y} L${p2.x} ${p2.y}`, `M${p2.x} ${p2.y} L${p3.x} ${p3.y}`];
  }, [desktopModelNodes]);

  const mobileSegments = useMemo(() => {
    if (!mobileModelNodes) {
      return ["M22 42 L18 70", "M18 70 L52 52", "M52 52 L78 58"];
    }
    const [p0, p1, p2, p3] = mobileModelNodes;
    if (!p0 || !p1 || !p2 || !p3) return ["M22 42 L18 70", "M18 70 L52 52", "M52 52 L78 58"];
    return [`M${p0.x} ${p0.y} L${p1.x} ${p1.y}`, `M${p1.x} ${p1.y} L${p2.x} ${p2.y}`, `M${p2.x} ${p2.y} L${p3.x} ${p3.y}`];
  }, [mobileModelNodes]);

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
            <BackgroundVideo
              className="bg-video absolute inset-0 h-full w-full object-cover object-center"
              src="/assets/library-adult.mp4"
            />
            <div aria-hidden="true" className="absolute inset-0" />
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
                  <h2 className="text-[clamp(34px,2.6vw,48px)] font-semibold leading-[1.12] tracking-tight text-slate-700">
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

                  {desktopBodyText && (
                    <p
                      className={[
                        "mt-6 text-[clamp(16px,1.05vw,18px)] leading-relaxed text-slate-700",
                        textBaseClass,
                      ].join(" ")}
                      style={desktopTextMotion}
                    >
                      {desktopBodyText}
                    </p>
                  )}
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
                    <BackgroundVideo
                      className="bg-video absolute inset-0 h-full w-full object-cover"
                      src="/assets/tes5.mp4"
                    />
                    <div aria-hidden="true" className="absolute inset-0" />
	                    <div className="pointer-events-none absolute inset-0 bg-[#3D002680]" />

                    <div ref={desktopModelOverlayRef} className="absolute inset-0 text-white">
                      <svg
                        className="pointer-events-none absolute inset-0 h-full w-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <defs>
                          <mask id={desktopModelMaskId} maskUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="100" height="100" fill="white" />
                            {desktopModelNodes?.map((node, idx) => {
                              const padX = Math.max(0.6, Math.min(2.4, node.rx * 0.18));
                              const padY = Math.max(0.6, Math.min(2.4, node.ry * 0.18));
                              return (
                                <ellipse
                                  key={`desktop-mask-${idx}`}
                                  cx={node.x}
                                  cy={node.y}
                                  rx={node.rx + padX}
                                  ry={node.ry + padY}
                                  fill="black"
                                />
                              );
                            })}
                            {desktopModelTextBoxes?.map((box, idx) => {
                              const padX = Math.max(0.8, Math.min(2.8, box.w * 0.06));
                              const padY = Math.max(0.8, Math.min(2.8, box.h * 0.14));
                              return (
                                <rect
                                  key={`desktop-text-mask-${idx}`}
                                  x={Math.max(0, box.x - padX)}
                                  y={Math.max(0, box.y - padY)}
                                  width={Math.min(100, box.w + padX * 2)}
                                  height={Math.min(100, box.h + padY * 2)}
                                  rx={Math.max(1.2, Math.min(3.2, box.h * 0.18))}
                                  ry={Math.max(1.2, Math.min(3.2, box.h * 0.18))}
                                  fill="black"
                                />
                              );
                            })}
                          </mask>

                          <mask id={`${desktopModelMaskId}-r1`} maskUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="100" height="100" fill="black" />
                            <path
                              d={desktopSegments[0]}
                              fill="none"
                              stroke="white"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              pathLength={100}
                              style={{
                                strokeDasharray: 100,
                                strokeDashoffset: modelStep >= 1 ? 0 : 100,
                                transition: `stroke-dashoffset ${MODEL_LINE_ANIM_MS}ms ease`,
                              }}
                            />
                          </mask>
                          <mask id={`${desktopModelMaskId}-r2`} maskUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="100" height="100" fill="black" />
                            <path
                              d={desktopSegments[1]}
                              fill="none"
                              stroke="white"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              pathLength={100}
                              style={{
                                strokeDasharray: 100,
                                strokeDashoffset: modelStep >= 2 ? 0 : 100,
                                transition: `stroke-dashoffset ${MODEL_LINE_ANIM_MS}ms ease`,
                              }}
                            />
                          </mask>
                          <mask id={`${desktopModelMaskId}-r3`} maskUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="100" height="100" fill="black" />
                            <path
                              d={desktopSegments[2]}
                              fill="none"
                              stroke="white"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              pathLength={100}
                              style={{
                                strokeDasharray: 100,
                                strokeDashoffset: modelStep >= 3 ? 0 : 100,
                                transition: `stroke-dashoffset ${MODEL_LINE_ANIM_MS}ms ease`,
                              }}
                            />
                          </mask>
                        </defs>

                        <g mask={`url(#${desktopModelMaskId})`}>
                          <path
                            d={desktopSegments[0]}
                            fill="none"
                            stroke="rgba(255,255,255,0.65)"
                            strokeWidth="0.55"
                            strokeDasharray="2 3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d={desktopSegments[1]}
                            fill="none"
                            stroke="rgba(255,255,255,0.65)"
                            strokeWidth="0.55"
                            strokeDasharray="2 3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d={desktopSegments[2]}
                            fill="none"
                            stroke="rgba(255,255,255,0.65)"
                            strokeWidth="0.55"
                            strokeDasharray="2 3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <g mask={`url(#${desktopModelMaskId}-r1)`}>
                            <path
                              d={desktopSegments[0]}
                              fill="none"
                              stroke="rgba(255,255,255,0.95)"
                              strokeWidth="0.95"
                              strokeDasharray="2 3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <g mask={`url(#${desktopModelMaskId}-r2)`}>
                            <path
                              d={desktopSegments[1]}
                              fill="none"
                              stroke="rgba(255,255,255,0.95)"
                              strokeWidth="0.95"
                              strokeDasharray="2 3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <g mask={`url(#${desktopModelMaskId}-r3)`}>
                            <path
                              d={desktopSegments[2]}
                              fill="none"
                              stroke="rgba(255,255,255,0.95)"
                              strokeWidth="0.95"
                              strokeDasharray="2 3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                        </g>
                      </svg>

                      <div className="absolute left-[12%] top-[10%] flex flex-col items-start gap-4">
                        <button
                          ref={desktopModelStep0Ref}
                          type="button"
                          aria-pressed={modelStep === 0}
                          onClick={() => goToModelStep(0)}
                          className={[
                            "flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border text-[14px] font-semibold transition-colors duration-300",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                            modelStep === 0 ? "border-white/80 text-white" : "border-white/60 text-white/70 hover:text-white",
                          ].join(" ")}
                        >
                          5 phút
                        </button>
                        <div
                          ref={desktopModelText0Ref}
                          className={[
                            "text-left text-[18px] font-semibold leading-snug transition-colors duration-300",
                            modelStep === 0 ? "text-white" : "text-white/60",
                          ].join(" ")}
                        >
                          Ôn từ bằng
                          <br />
                          Flashcards Leitner
                        </div>
                      </div>

                      <div className="absolute left-[56%] top-[18%] flex items-center gap-4">
                        <button
                          ref={desktopModelStep2Ref}
                          type="button"
                          aria-pressed={modelStep === 2}
                          onClick={() => goToModelStep(2)}
                          className={[
                            "flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border text-[14px] font-semibold transition-colors duration-300",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                            modelStep === 2 ? "border-white/80 text-white" : "border-white/60 text-white/70 hover:text-white",
                          ].join(" ")}
                        >
                          15 phút
                        </button>
                      </div>
                      <div
                        ref={desktopModelText2Ref}
                        style={{ left: `${desktopModelNodes?.[2]?.x ?? 50}%` }}
                        className={[
                          "absolute top-[36%] -translate-x-1/2 text-center text-[18px] font-semibold leading-snug transition-colors duration-300",
                          modelStep === 2 ? "text-white" : "text-white/55",
                        ].join(" ")}
                      >
                        Ghép câu phản xạ
                        <br />
                        theo tình huống
                      </div>

                      <div className="absolute left-[14%] top-[74%] flex items-center gap-3">
                        <button
                          ref={desktopModelStep1Ref}
                          type="button"
                          aria-pressed={modelStep === 1}
                          onClick={() => goToModelStep(1)}
                          className={[
                            "flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border text-[14px] font-semibold transition-colors duration-300",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                            modelStep === 1 ? "border-white/80 text-white" : "border-white/60 text-white/70 hover:text-white",
                          ].join(" ")}
                        >
                          10 phút
                        </button>
                      </div>
                      <div
                        ref={desktopModelText1Ref}
                        style={{ left: `${desktopModelNodes?.[1]?.x ?? 20}%` }}
                        className={[
                          "absolute top-[86%] -translate-x-1/2 text-center text-[18px] font-semibold leading-snug transition-colors duration-300",
                          modelStep === 1 ? "text-white" : "text-white/60",
                        ].join(" ")}
                      >
                        Luyện phát âm &
                        <br />
                        Đánh vần
                      </div>

                      <div className="absolute left-[74%] top-[56%] flex items-center gap-3">
                        <button
                          ref={desktopModelStep3Ref}
                          type="button"
                          aria-pressed={modelStep === 3}
                          onClick={() => goToModelStep(3)}
                          className={[
                            "flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border text-[14px] font-semibold transition-colors duration-300",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                            modelStep === 3 ? "border-white/80 text-white" : "border-white/60 text-white/70 hover:text-white",
                          ].join(" ")}
                        >
                          10 phút
                        </button>
                      </div>
                      <div
                        ref={desktopModelText3Ref}
                        style={{ left: `${desktopModelNodes?.[3]?.x ?? 64}%` }}
                        className={[
                          "absolute top-[72%] -translate-x-1/2 text-center text-[18px] font-semibold leading-snug transition-colors duration-300",
                          modelStep === 3 ? "text-white" : "text-white/60",
                        ].join(" ")}
                      >
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
            <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-6 pt-6">
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

              <div className="mt-6 flex flex-1 flex-col items-center text-center">
                <h1 className="text-[31px] font-semibold leading-[1.1] tracking-tight">
                  T.E.S Method –
                  <br />
                  Speak English Naturally
                </h1>

                <div className="mt-5 flex w-full justify-center">
                  <div className="flex items-center justify-center gap-5 text-[40px] font-extrabold text-[#D40887]">
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

                {descriptionText && (
                  <p
                    className={["mt-5 px-2 text-[15px] leading-relaxed text-white/90", textBaseClass].join(" ")}
                    style={textMotion}
                  >
                    {descriptionText}
                  </p>
                )}
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
                    <BackgroundVideo
                      className="bg-video absolute inset-0 h-full w-full object-cover"
                      src="/assets/tes5.mp4"
                    />
                    <div aria-hidden="true" className="absolute inset-0" />
                    <div className="pointer-events-none absolute inset-0 bg-[#3D002680]" />

                    <div ref={mobileModelOverlayRef} className="absolute inset-0 text-white">
                      <svg
                        className="pointer-events-none absolute inset-0 h-full w-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        {/* 1) Bottom of "Ôn từ..." -> top of "10 phút" (Luyện phát âm) */}
                        <defs>
                          <mask id={mobileModelMaskId} maskUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="100" height="100" fill="white" />
                            {mobileModelNodes?.map((node, idx) => {
                              const padX = Math.max(0.8, Math.min(3.0, node.rx * 0.2));
                              const padY = Math.max(0.8, Math.min(3.0, node.ry * 0.2));
                              return (
                                <ellipse
                                  key={`mobile-mask-${idx}`}
                                  cx={node.x}
                                  cy={node.y}
                                  rx={node.rx + padX}
                                  ry={node.ry + padY}
                                  fill="black"
                                />
                              );
                            })}
                            {mobileModelTextBoxes?.map((box, idx) => {
                              const padX = Math.max(0.9, Math.min(3.2, box.w * 0.07));
                              const padY = Math.max(0.9, Math.min(3.2, box.h * 0.16));
                              return (
                                <rect
                                  key={`mobile-text-mask-${idx}`}
                                  x={Math.max(0, box.x - padX)}
                                  y={Math.max(0, box.y - padY)}
                                  width={Math.min(100, box.w + padX * 2)}
                                  height={Math.min(100, box.h + padY * 2)}
                                  rx={Math.max(1.4, Math.min(3.4, box.h * 0.2))}
                                  ry={Math.max(1.4, Math.min(3.4, box.h * 0.2))}
                                  fill="black"
                                />
                              );
                            })}
                          </mask>

                          <mask id={`${mobileModelMaskId}-r1`} maskUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="100" height="100" fill="black" />
                            <path
                              d={mobileSegments[0]}
                              fill="none"
                              stroke="white"
                              strokeWidth="2.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              pathLength={100}
                              style={{
                                strokeDasharray: 100,
                                strokeDashoffset: modelStep >= 1 ? 0 : 100,
                                transition: `stroke-dashoffset ${MODEL_LINE_ANIM_MS}ms ease`,
                              }}
                            />
                          </mask>
                          <mask id={`${mobileModelMaskId}-r2`} maskUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="100" height="100" fill="black" />
                            <path
                              d={mobileSegments[1]}
                              fill="none"
                              stroke="white"
                              strokeWidth="2.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              pathLength={100}
                              style={{
                                strokeDasharray: 100,
                                strokeDashoffset: modelStep >= 2 ? 0 : 100,
                                transition: `stroke-dashoffset ${MODEL_LINE_ANIM_MS}ms ease`,
                              }}
                            />
                          </mask>
                          <mask id={`${mobileModelMaskId}-r3`} maskUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="100" height="100" fill="black" />
                            <path
                              d={mobileSegments[2]}
                              fill="none"
                              stroke="white"
                              strokeWidth="2.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              pathLength={100}
                              style={{
                                strokeDasharray: 100,
                                strokeDashoffset: modelStep >= 3 ? 0 : 100,
                                transition: `stroke-dashoffset ${MODEL_LINE_ANIM_MS}ms ease`,
                              }}
                            />
                          </mask>
                        </defs>

                        <g mask={`url(#${mobileModelMaskId})`}>
                          <path
                            d={mobileSegments[0]}
                            fill="none"
                            stroke="rgba(255,255,255,0.65)"
                            strokeWidth="0.6"
                            strokeDasharray="2 3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        {/* 2) Top of "10 phút" (Luyện phát âm) -> bottom of "Ghép câu..." */}
                          <path
                            d={mobileSegments[1]}
                            fill="none"
                            stroke="rgba(255,255,255,0.65)"
                            strokeWidth="0.6"
                            strokeDasharray="2 3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        {/* 3) Bottom of "Ghép câu..." -> top of "10 phút" (Thực hành) */}
                          <path
                            d={mobileSegments[2]}
                            fill="none"
                            stroke="rgba(255,255,255,0.65)"
                            strokeWidth="0.6"
                            strokeDasharray="2 3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <g mask={`url(#${mobileModelMaskId}-r1)`}>
                            <path
                              d={mobileSegments[0]}
                              fill="none"
                              stroke="rgba(255,255,255,0.95)"
                              strokeWidth="1.0"
                              strokeDasharray="2 3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <g mask={`url(#${mobileModelMaskId}-r2)`}>
                            <path
                              d={mobileSegments[1]}
                              fill="none"
                              stroke="rgba(255,255,255,0.95)"
                              strokeWidth="1.0"
                              strokeDasharray="2 3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <g mask={`url(#${mobileModelMaskId}-r3)`}>
                            <path
                              d={mobileSegments[2]}
                              fill="none"
                              stroke="rgba(255,255,255,0.95)"
                              strokeWidth="1.0"
                              strokeDasharray="2 3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                        </g>
                      </svg>

                      <div className="absolute left-[10%] top-[14%] flex flex-col items-start gap-3">
                        <button
                          ref={mobileModelStep0Ref}
                          type="button"
                          aria-pressed={modelStep === 0}
                          onClick={() => goToModelStep(0)}
                          className={[
                            "flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border text-[12px] font-semibold transition-colors duration-300",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                            modelStep === 0 ? "border-white/80 text-white" : "border-white/60 text-white/70 hover:text-white",
                          ].join(" ")}
                        >
                          5 phút
                        </button>
                        <div
                          ref={mobileModelText0Ref}
                          className={[
                            "text-left text-[14px] font-semibold leading-snug transition-colors duration-300",
                            modelStep === 0 ? "text-white" : "text-white/60",
                          ].join(" ")}
                        >
                          Ôn từ bằng
                          <br />
                          Flashcards Leitner
                        </div>
                      </div>

                      <div className="absolute left-[52%] top-[22%] flex items-center gap-4">
                        <button
                          ref={mobileModelStep2Ref}
                          type="button"
                          aria-pressed={modelStep === 2}
                          onClick={() => goToModelStep(2)}
                          className={[
                            "flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border text-[12px] font-semibold transition-colors duration-300",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                            modelStep === 2 ? "border-white/80 text-white" : "border-white/60 text-white/70 hover:text-white",
                          ].join(" ")}
                        >
                          15 phút
                        </button>
                      </div>
                      <div
                        ref={mobileModelText2Ref}
                        style={{ left: `${mobileModelNodes?.[2]?.x ?? 46}%` }}
                        className={[
                          "absolute top-[40%] -translate-x-1/2 text-center text-[14px] font-semibold leading-snug transition-colors duration-300",
                          modelStep === 2 ? "text-white" : "text-white/55",
                        ].join(" ")}
                      >
                        Ghép câu phản xạ
                        <br />
                        theo tình huống
                      </div>

                      <div className="absolute left-[11%] top-[70%] flex items-center gap-3">
                        <button
                          ref={mobileModelStep1Ref}
                          type="button"
                          aria-pressed={modelStep === 1}
                          onClick={() => goToModelStep(1)}
                          className={[
                            "flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border text-[12px] font-semibold transition-colors duration-300",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                            modelStep === 1 ? "border-white/80 text-white" : "border-white/60 text-white/70 hover:text-white",
                          ].join(" ")}
                        >
                          10 phút
                        </button>
                      </div>
                      <div
                        ref={mobileModelText1Ref}
                        style={{ left: `${mobileModelNodes?.[1]?.x ?? 18}%` }}
                        className={[
                          "absolute top-[84%] -translate-x-1/2 text-center text-[14px] font-semibold leading-snug transition-colors duration-300",
                          modelStep === 1 ? "text-white" : "text-white/60",
                        ].join(" ")}
                      >
                        Luyện phát âm &
                        <br />
                        Đánh vần
                      </div>

                      <div className="absolute left-[72%] top-[58%] flex items-center gap-3">
                        <button
                          ref={mobileModelStep3Ref}
                          type="button"
                          aria-pressed={modelStep === 3}
                          onClick={() => goToModelStep(3)}
                          className={[
                            "flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border text-[12px] font-semibold transition-colors duration-300",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                            modelStep === 3 ? "border-white/80 text-white" : "border-white/60 text-white/70 hover:text-white",
                          ].join(" ")}
                        >
                          10 phút
                        </button>
                      </div>
                      <div
                        ref={mobileModelText3Ref}
                        style={{ left: `${mobileModelNodes?.[3]?.x ?? 62}%` }}
                        className={[
                          "absolute top-[74%] -translate-x-1/2 text-center text-[14px] font-semibold leading-snug transition-colors duration-300",
                          modelStep === 3 ? "text-white" : "text-white/60",
                        ].join(" ")}
                      >
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
