"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import DesktopFloatingActions from "./components/DesktopFloatingActions";
import DesktopNavbar from "./components/DesktopNavbar";
import { KidWorldMap } from "./components/KidWorldMap";
import FooterContactView from "./components/FooterContactView";
import MobileHeader from "./components/MobileHeader";
import MobileFloatingActions from "./components/MobileFloatingActions";
import MobileMenuDrawer from "./components/MobileMenuDrawer";
import CountUp from "./components/CountUp";
import ArrowUpIcon from "./components/ArrowUpIcon";
import BackgroundVideo from "./components/BackgroundVideo";
import type { BackgroundVideoHandle } from "./components/BackgroundVideo";
import PreloadedBackgroundVideoSet from "./components/PreloadedBackgroundVideoSet";
import type { PreloadedBackgroundVideoSetHandle } from "./components/PreloadedBackgroundVideoSet";
import { useWheelStepSnap } from "./components/useWheelStepSnap";
import { sendConsultationMail } from "./lib/sendConsultationMail";
import Toast from "./components/Toast";

type HorizontalSwipeHandlers<T extends HTMLElement> = Pick<
  React.HTMLAttributes<T>,
  | "onTouchStart"
  | "onTouchMove"
  | "onTouchEnd"
  | "onTouchCancel"
  | "onMouseDown"
  | "onMouseUp"
  | "onPointerDown"
  | "onPointerMove"
  | "onPointerUp"
  | "onPointerCancel"
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

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (typeof Element === "undefined") return false;
    if (!(target instanceof Element)) return false;
    return Boolean(
      target.closest(
        'button,a,input,textarea,select,summary,[role="button"],[role="link"],[data-no-swipe]',
      ),
    );
  };

  const reset = () => {
    startXRef.current = null;
    startYRef.current = null;
    triggeredRef.current = false;
  };

  const onTouchStart: React.TouchEventHandler<T> = (e) => {
    if (isInteractiveTarget(e.target)) return;
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
    if (isInteractiveTarget(e.target)) return;
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

  const onPointerDown: React.PointerEventHandler<T> = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (isInteractiveTarget(e.target)) return;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    triggeredRef.current = false;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove: React.PointerEventHandler<T> = (e) => {
    if (triggeredRef.current) return;
    if (startXRef.current == null || startYRef.current == null) return;

    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dy) > restraintPx) return;
    if (Math.abs(dx) < thresholdPx) return;

    e.preventDefault();
    triggeredRef.current = true;
    if (dx < 0) options.onSwipeLeft();
    else options.onSwipeRight();
  };

  const onPointerUp: React.PointerEventHandler<T> = () => reset();
  const onPointerCancel: React.PointerEventHandler<T> = () => reset();

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    onMouseDown,
    onMouseUp,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };
}

function useDragToScroll<T extends HTMLElement>(options?: {
  enabled?: boolean;
  thresholdPx?: number;
}): Pick<
  React.HTMLAttributes<T>,
  "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel" | "onPointerLeave"
> {
  const enabled = options?.enabled ?? true;
  const thresholdPx = options?.thresholdPx ?? 4;

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const movedRef = useRef(false);

  const stop = () => {
    isDraggingRef.current = false;
    movedRef.current = false;
  };

  return {
    onPointerDown: (event) => {
      if (!enabled) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      const element = event.currentTarget as unknown as HTMLElement;
      isDraggingRef.current = true;
      movedRef.current = false;
      startXRef.current = event.clientX;
      startScrollLeftRef.current = element.scrollLeft;

      element.setPointerCapture?.(event.pointerId);
    },
    onPointerMove: (event) => {
      if (!enabled) return;
      if (!isDraggingRef.current) return;

      const element = event.currentTarget as unknown as HTMLElement;
      const deltaX = event.clientX - startXRef.current;
      if (!movedRef.current && Math.abs(deltaX) >= thresholdPx) movedRef.current = true;

      element.scrollLeft = startScrollLeftRef.current - deltaX;
      if (movedRef.current) event.preventDefault();
    },
    onPointerUp: (event) => {
      if (!enabled) return;
      stop();
      const element = event.currentTarget as unknown as HTMLElement;
      element.releasePointerCapture?.(event.pointerId);
    },
    onPointerCancel: (event) => {
      if (!enabled) return;
      stop();
      const element = event.currentTarget as unknown as HTMLElement;
      element.releasePointerCapture?.(event.pointerId);
    },
    onPointerLeave: () => {
      if (!enabled) return;
      stop();
    },
  };
}

export default function LandingPage() {
  const ZALO_URL = "https://zalo.me/407812786777792624";
  const MESSENGER_URL =
    "https://www.messenger.com/t/101413051393124/?messaging_source=source%3Apages%3Amessage_shortlink&source_id=1441792&recurring_notification=0";

  const router = useRouter();
  const mainRef = useRef<HTMLElement | null>(null);
  const slide1VideoRef = useRef<PreloadedBackgroundVideoSetHandle | null>(null);
  const slide2VideoRef = useRef<BackgroundVideoHandle | null>(null);
  const preloadedVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [selectedAge, setSelectedAge] = useState<"kid" | "adult" | null>(null);
  const [isAgeSwitchLocked, setIsAgeSwitchLocked] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSnapIndex, setActiveSnapIndex] = useState(0);
  const [kidSlideIndex, setKidSlideIndex] = useState(0);
  const [kidTextVisible, setKidTextVisible] = useState(true);
  const [kidView8Index, setKidView8Index] = useState(0);
  const [kidView8TextVisible, setKidView8TextVisible] = useState(true);
  const [adultView8Index, setAdultView8Index] = useState(0);
  const [adultView8TextVisible, setAdultView8TextVisible] = useState(true);
  const [adultWhyMobileIndex, setAdultWhyMobileIndex] = useState(0);
  const [adultWhyMobileTextVisible, setAdultWhyMobileTextVisible] = useState(true);
  const [kidConsultName, setKidConsultName] = useState("");
  const [kidConsultEmail, setKidConsultEmail] = useState("");
  const [kidConsultContactMethod, setKidConsultContactMethod] = useState<
    "zalo" | "phone" | "email"
  >("zalo");
  const [kidConsultZaloCountry, setKidConsultZaloCountry] = useState<"VN">("VN");
  const [kidConsultZaloNumber, setKidConsultZaloNumber] = useState("");
  const [kidConsultTopic, setKidConsultTopic] = useState("");
  const [kidConsultAgree, setKidConsultAgree] = useState(false);
  const [isConsultSubmitting, setIsConsultSubmitting] = useState(false);
  const [isConsultOverlayOpen, setIsConsultOverlayOpen] = useState(false);
  const [consultToast, setConsultToast] = useState<{
    open: boolean;
    message: string;
    variant: "success" | "error";
  }>({ open: false, message: "", variant: "success" });
  const consultOverlayRestoreRef = useRef<{
    scrollTop: number;
    snapIndex: number;
    overflowY: string;
    scrollSnapType: string;
  } | null>(null);
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
  const teleSaDesktopTextRef = useRef<HTMLDivElement | null>(null);
  const [teleSaDesktopOffsetPx, setTeleSaDesktopOffsetPx] = useState(0);
  const [teleSaDesktopMaxOffsetPx, setTeleSaDesktopMaxOffsetPx] = useState(0);
  const [teleSaDesktopMaskBaseHeightPx, setTeleSaDesktopMaskBaseHeightPx] = useState(0);
  const [teleSaDesktopIsDragging, setTeleSaDesktopIsDragging] = useState(false);

  useWheelStepSnap(mainRef, { enabled: false });
  const teleSaDesktopDragRef = useRef<{
    isDragging: boolean;
    startY: number;
    startOffset: number;
    pointerId: number | null;
  }>({ isDragging: false, startY: 0, startOffset: 0, pointerId: null });
  const restoreAnchorIdRef = useRef<string | null>(null);
  const restoreScrollTopRef = useRef<number | null>(null);
  const restoreShouldOpenMenuRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const previousBodyBg = document.body.style.backgroundColor;
    const previousHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = "#000";
    document.documentElement.style.backgroundColor = "#000";

    const baselineHeightRef = { current: 0 };
    let pendingTimeouts: number[] = [];

    const clearPendingTimeouts = () => {
      pendingTimeouts.forEach((id) => window.clearTimeout(id));
      pendingTimeouts = [];
    };

    const isTextFieldFocused = () => {
      const active = document.activeElement;
      if (!active) return false;
      if (!(active instanceof HTMLElement)) return false;
      if (active.isContentEditable) return true;

      if (active instanceof HTMLTextAreaElement) return true;
      if (active instanceof HTMLSelectElement) return true;

      if (active instanceof HTMLInputElement) {
        const type = active.type?.toLowerCase?.() ?? "";
        if (["checkbox", "radio", "button", "submit", "reset", "range", "color", "file", "image"].includes(type)) {
          return false;
        }
        return true;
      }

      return false;
    };

    const setVh = () => {
      const vvHeight = window.visualViewport?.height;
      const innerHeight = window.innerHeight;
      const candidate = vvHeight ?? innerHeight;

      const largeDelta = vvHeight != null ? innerHeight - vvHeight > 150 : false;
      const keyboardLikelyOpen = isTextFieldFocused() && largeDelta;

      if (baselineHeightRef.current === 0) baselineHeightRef.current = candidate;

      if (keyboardLikelyOpen) {
        baselineHeightRef.current = Math.max(baselineHeightRef.current, candidate);
      } else {
        baselineHeightRef.current = largeDelta ? innerHeight : candidate;
      }

      document.documentElement.style.setProperty("--vh", `${baselineHeightRef.current * 0.01}px`);
    };

    const refreshVh = () => {
      clearPendingTimeouts();
      setVh();
      window.requestAnimationFrame(setVh);
      [50, 150, 300, 600, 1000, 1500].forEach((ms) => {
        pendingTimeouts.push(window.setTimeout(setVh, ms));
      });
    };

    refreshVh();

    window.addEventListener("resize", refreshVh);
    window.addEventListener("orientationchange", refreshVh);
    window.addEventListener("pageshow", refreshVh);
    document.addEventListener("focusin", refreshVh, true);
    document.addEventListener("focusout", refreshVh, true);
    window.visualViewport?.addEventListener("resize", refreshVh);
    window.visualViewport?.addEventListener("scroll", refreshVh);

    return () => {
      clearPendingTimeouts();
      document.body.style.backgroundColor = previousBodyBg;
      document.documentElement.style.backgroundColor = previousHtmlBg;
      window.removeEventListener("resize", refreshVh);
      window.removeEventListener("orientationchange", refreshVh);
      window.removeEventListener("pageshow", refreshVh);
      document.removeEventListener("focusin", refreshVh, true);
      document.removeEventListener("focusout", refreshVh, true);
      window.visualViewport?.removeEventListener("resize", refreshVh);
      window.visualViewport?.removeEventListener("scroll", refreshVh);
    };
  }, []);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    if (isConsultOverlayOpen) {
      const clientHeight = Math.max(1, main.clientHeight);
      const snapIndex = Math.round(main.scrollTop / clientHeight);
      consultOverlayRestoreRef.current = {
        scrollTop: main.scrollTop,
        snapIndex,
        overflowY: main.style.overflowY,
        scrollSnapType: main.style.scrollSnapType,
      };
      main.style.overflowY = "hidden";
      main.style.scrollSnapType = "none";
      return;
    }

    const restore = consultOverlayRestoreRef.current;
    if (!restore) return;

    const computeTargetTop = () => {
      const clientHeight = Math.max(1, main.clientHeight);
      const maxScrollTop = Math.max(0, main.scrollHeight - clientHeight);
      const rawTop = restore.snapIndex * clientHeight;
      return Math.max(0, Math.min(rawTop, maxScrollTop));
    };

    const restoreScroll = () => {
      main.scrollTo({ top: computeTargetTop(), behavior: "auto" });
    };

    const setVh = () => {
      const vvHeight = window.visualViewport?.height;
      const innerHeight = window.innerHeight;
      const largeDelta = vvHeight != null ? innerHeight - vvHeight > 150 : false;
      const viewportHeight = largeDelta ? innerHeight : (vvHeight ?? innerHeight);
      document.documentElement.style.setProperty("--vh", `${viewportHeight * 0.01}px`);
    };

    const forceLayoutRefresh = () => {
      void main.offsetHeight;
      const maxScrollTop = Math.max(0, main.scrollHeight - main.clientHeight);
      if (maxScrollTop <= 0) return;
      const current = main.scrollTop;
      const bumped = Math.min(maxScrollTop, current + 1);
      main.scrollTo({ top: bumped, behavior: "auto" });
      main.scrollTo({ top: current, behavior: "auto" });
    };

    restoreScroll();
    requestAnimationFrame(restoreScroll);
    window.setTimeout(restoreScroll, 50);
    window.setTimeout(restoreScroll, 150);

    setVh();
    requestAnimationFrame(setVh);
    window.setTimeout(setVh, 50);
    window.setTimeout(setVh, 150);
    window.setTimeout(setVh, 300);

    requestAnimationFrame(forceLayoutRefresh);
    window.setTimeout(forceLayoutRefresh, 80);
    window.setTimeout(forceLayoutRefresh, 200);

    window.setTimeout(() => {
      main.style.overflowY = restore.overflowY;
      main.style.scrollSnapType = restore.scrollSnapType;
      consultOverlayRestoreRef.current = null;
      restoreScroll();
      requestAnimationFrame(restoreScroll);
    }, 220);
  }, [isConsultOverlayOpen, selectedAge]);

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

  const kidTestimonials = [
    {
      content:
        "Ngay từ những ngày đầu, mình đã cảm thấy ấn tượng với môi trường học tập tuyệt vời nơi đây. Các giáo viên không chỉ có chuyên môn cao mà còn rất tâm huyết. Các bạn học nhóm cùng mình cũng rất dễ thương ạ!",
      name: "Võ Minh Khôi",
      date: "14/03/2025",
    },
    {
      content:
        "Trung tâm anh ngữ Telesa mang đến trải nghiệm học vừa nghiêm túc nhưng cũng rất thoải mái. Giáo viên ở Telesa là những người vừa tận tâm trong việc dạy học cũng rất thân thiện với học viên.",
      name: "Thy",
      date: "14/03/2025",
    },
    {
      content:
        "Mình đã học ở Telesa được 2 khóa, mọi thứ ở đây thực sự rất tuyệt vời. Lộ trình học chi tiết, được tích hợp trên app học tập để mình có thể chủ động theo dõi, làm bài tập và chấm chữa bài ngay trên APP.",
      name: "Lộc Đoàn",
      date: "14/03/2025",
    },
    {
      content:
        "Em đã học tại Telesa và đang trên hành trình nâng band 6.5. Em cảm thấy học tại Telesa có nhiều yếu tố phát triển toàn diện, học vui mà vẫn tiến bộ rõ rệt.",
      name: "Thảo",
      date: "14/03/2025",
    },
  ] as const;

  const kidLibraryTeaserSlides = [
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
    }, 220);
  };

  const kidCarouselSwipe = useHorizontalSwipe<HTMLDivElement>({
    onSwipeLeft: () => changeKidSlide(kidSlideIndex + 1),
    onSwipeRight: () => changeKidSlide(kidSlideIndex - 1),
  });

  const changeKidView8Slide = (nextIndex: number) => {
    if (nextIndex === kidView8Index) return;
    if (nextIndex < 0 || nextIndex >= kidLibraryTeaserSlides.length) return;
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

  const kidTestimonialsDrag = useDragToScroll<HTMLDivElement>();

  const adultWhySlidesMobile = [
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
  ] as const;

  const adultView8Slides = adultWhySlidesMobile;

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

  const changeAdultWhyMobileSlide = (nextIndex: number) => {
    if (nextIndex === adultWhyMobileIndex) return;
    if (nextIndex < 0 || nextIndex >= adultWhySlidesMobile.length) return;
    setAdultWhyMobileTextVisible(false);
    setTimeout(() => {
      setAdultWhyMobileIndex(nextIndex);
      setAdultWhyMobileTextVisible(true);
    }, 150);
  };

  const adultWhyMobileSwipe = useHorizontalSwipe<HTMLElement>({
    onSwipeLeft: () => changeAdultWhyMobileSlide(adultWhyMobileIndex + 1),
    onSwipeRight: () => changeAdultWhyMobileSlide(adultWhyMobileIndex - 1),
  });

  const adultTestimonialsDrag = useDragToScroll<HTMLDivElement>();

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

  const slide1ActiveVideo: "default" | "kid" | "adult" =
    selectedAge === "kid" ? "kid" : selectedAge === "adult" ? "adult" : "default";

  const preloadVideo = (src: string) => {
    if (typeof window === "undefined") return;
    if (preloadedVideosRef.current.has(src)) return;
    try {
      const el = document.createElement("video");
      el.muted = true;
      el.playsInline = true;
      el.setAttribute("playsinline", "");
      el.setAttribute("webkit-playsinline", "true");
      el.preload = "auto";
      el.src = src;
      el.load?.();
      preloadedVideosRef.current.set(src, el);
    } catch { }
  };

  const handleSelectAge = (age: "kid" | "adult") => {
    if (isAgeSwitchLocked) return;
    if (selectedAge === age) return;
    setIsAgeSwitchLocked(true);
    flushSync(() => {
      setSelectedAge(age);
    });
    slide1VideoRef.current?.play(age);
    preloadVideo(age === "kid" ? "/assets/2-kid.mp4" : "/assets/2-adult.mp4");
    slide2VideoRef.current?.play();

    setTimeout(() => {
      mainRef.current?.scrollTo({
        top: mainRef.current.clientHeight,
        behavior: "smooth",
      });
    }, 600);
  };

  useEffect(() => {
    if (activeSnapIndex === 0) {
      slide1VideoRef.current?.play(slide1ActiveVideo);
    } else {
      slide1VideoRef.current?.pauseAll();
    }

    if (activeSnapIndex === 1) {
      slide2VideoRef.current?.play();
    } else {
      slide2VideoRef.current?.pause();
    }
  }, [activeSnapIndex, slide1ActiveVideo]);

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
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem("telesa:returnContext");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        kind?: string;
        selectedAge?: "kid" | "adult";
        anchorId?: string;
        scrollTop?: number;
        openMenu?: boolean;
      };

      if (!parsed?.selectedAge) return;

      if (parsed.kind === "landing" && parsed.anchorId) {
        restoreAnchorIdRef.current = parsed.anchorId;
        setSelectedAge(parsed.selectedAge);
        return;
      }

      if (parsed.kind === "landing-scroll" && typeof parsed.scrollTop === "number") {
        restoreScrollTopRef.current = parsed.scrollTop;
        restoreShouldOpenMenuRef.current = !!parsed.openMenu;
        setSelectedAge(parsed.selectedAge);
      }
    } catch {
      return;
    } finally {
      sessionStorage.removeItem("telesa:returnContext");
    }
  }, []);

  useEffect(() => {
    if (selectedAge == null) return;

    const scrollTop = restoreScrollTopRef.current;
    if (scrollTop != null) {
      restoreScrollTopRef.current = null;
      const shouldOpenMenu = restoreShouldOpenMenuRef.current;
      restoreShouldOpenMenuRef.current = false;
      mainRef.current?.scrollTo({ top: scrollTop, behavior: "auto" });
      if (shouldOpenMenu) setIsMenuOpen(true);
      return;
    }

    const anchorId = restoreAnchorIdRef.current;
    if (!anchorId) return;
    restoreAnchorIdRef.current = null;

    const t = window.setTimeout(() => {
      document.getElementById(anchorId)?.scrollIntoView({ behavior: "auto", block: "start" });
    }, 0);
    return () => window.clearTimeout(t);
  }, [selectedAge]);

  const navigateToLibraryFromMenu = (
    pathname:
      | "/library"
      | "/library/why"
      | "/library/program-for-kid"
      | "/library/what-is-tes"
      | "/library/1-1"
      | "/library/payment-method"
      | "/library/why-group"
      | "/library/roadmap",
  ) => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("telesa:openMenuOnBack", "1");
        sessionStorage.setItem(
          "telesa:openMenuOnBack:returnTo",
          `${window.location.pathname}${window.location.search}`,
        );
        sessionStorage.setItem(
          "telesa:returnContext",
          JSON.stringify({
            kind: "landing-scroll",
            selectedAge: selectedAge ?? "kid",
            scrollTop: mainRef.current?.scrollTop ?? 0,
            openMenu: true,
          }),
        );
      } catch { }
    }
    router.push(pathname);
  };

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

  // Scroll-reveal animation: observe each section and add 'in-view' when visible
  useEffect(() => {
    const main = mainRef.current;
    if (typeof window === "undefined" || !main) return;

    const sections = Array.from(main.querySelectorAll<HTMLElement>(":scope > section"));

    // Mark the first section as always visible (no flash on load)
    if (sections[0]) sections[0].classList.add("in-view");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { root: main, threshold: 0.15 },
    );

    sections.slice(1).forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, [selectedAge]); // re-run when age changes so new sections get observed

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

  useEffect(() => {
    if (selectedAge == null) return;

    const measureDesktop = () => {
      const el = teleSaDesktopTextRef.current;
      if (!el) return;
      const height = el.offsetHeight;
      if (!Number.isFinite(height) || height <= 0) return;

      const viewportHeight = window.innerHeight || 0;
      const max = Math.max(0, Math.round(height * (2 / 3)));
      setTeleSaDesktopMaxOffsetPx(max);
      setTeleSaDesktopOffsetPx((prev) => Math.max(-max, Math.min(0, prev)));

      if (viewportHeight > 0) {
        // Desktop: same ratio as mobile, but pushed down by 20vh => base cover includes `10vh` + ~80% of text height.
        const minHeight = Math.round(viewportHeight * 0.35);
        const coverHeight = Math.round(viewportHeight * 0.1 + height * 0.8);
        setTeleSaDesktopMaskBaseHeightPx(
          Math.max(minHeight, Math.max(0, Math.min(viewportHeight, coverHeight))),
        );
      }
    };

    const raf = requestAnimationFrame(measureDesktop);
    window.addEventListener("resize", measureDesktop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measureDesktop);
    };
  }, [selectedAge]);

  const startTeleSaDrag: React.PointerEventHandler<HTMLElement> = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (teleSaDragRef.current.isDragging) return;

    e.preventDefault();
    const pointerTarget = e.currentTarget as HTMLElement;
    const pointerId = e.pointerId;
    const startY = e.clientY;
    const startOffset = teleSaOffsetPx;

    const measuredHeight = teleSaTextRef.current?.offsetHeight ?? 0;
    const max = Math.max(
      teleSaMaxOffsetPx,
      Math.max(0, Math.round(measuredHeight * (2 / 3))),
    );
    if (max !== teleSaMaxOffsetPx) setTeleSaMaxOffsetPx(max);

    teleSaDragRef.current.isDragging = true;
    teleSaDragRef.current.startY = startY;
    teleSaDragRef.current.startOffset = startOffset;
    teleSaDragRef.current.pointerId = pointerId;
    setTeleSaIsDragging(true);

    const cleanup = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onCancel);
      pointerTarget.releasePointerCapture?.(pointerId);
    };

    const onMove = (ev: PointerEvent) => {
      if (teleSaDragRef.current.pointerId !== ev.pointerId) return;
      ev.preventDefault();
      const delta = ev.clientY - startY;
      const next = Math.max(-max, Math.min(0, startOffset + delta));
      setTeleSaOffsetPx(next);
    };

    const finish = (ev: PointerEvent, resetToZero: boolean) => {
      if (teleSaDragRef.current.pointerId !== ev.pointerId) return;
      cleanup();
      teleSaDragRef.current.isDragging = false;
      teleSaDragRef.current.pointerId = null;
      setTeleSaIsDragging(false);
      if (resetToZero) setTeleSaOffsetPx(0);
      else setTeleSaOffsetPx((current) => Math.max(-max, Math.min(0, current)));
    };

    const onEnd = (ev: PointerEvent) => finish(ev, false);
    const onCancel = (ev: PointerEvent) => finish(ev, true);

    pointerTarget.setPointerCapture?.(pointerId);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onCancel);
  };

  const startTeleSaDesktopDrag: React.PointerEventHandler<HTMLElement> = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (teleSaDesktopDragRef.current.isDragging) return;

    e.preventDefault();
    const pointerTarget = e.currentTarget as HTMLElement;
    const pointerId = e.pointerId;
    const startY = e.clientY;
    const startOffset = teleSaDesktopOffsetPx;

    const measuredHeight = teleSaDesktopTextRef.current?.offsetHeight ?? 0;
    const max = Math.max(
      teleSaDesktopMaxOffsetPx,
      Math.max(0, Math.round(measuredHeight * (2 / 3))),
    );
    if (max !== teleSaDesktopMaxOffsetPx) setTeleSaDesktopMaxOffsetPx(max);

    teleSaDesktopDragRef.current.isDragging = true;
    teleSaDesktopDragRef.current.startY = startY;
    teleSaDesktopDragRef.current.startOffset = startOffset;
    teleSaDesktopDragRef.current.pointerId = pointerId;
    setTeleSaDesktopIsDragging(true);

    const cleanup = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onCancel);
      pointerTarget.releasePointerCapture?.(pointerId);
    };

    const onMove = (ev: PointerEvent) => {
      if (teleSaDesktopDragRef.current.pointerId !== ev.pointerId) return;
      ev.preventDefault();
      const delta = ev.clientY - startY;
      const next = Math.max(-max, Math.min(0, startOffset + delta));
      setTeleSaDesktopOffsetPx(next);
    };

    const finish = (ev: PointerEvent, resetToZero: boolean) => {
      if (teleSaDesktopDragRef.current.pointerId !== ev.pointerId) return;
      cleanup();
      teleSaDesktopDragRef.current.isDragging = false;
      teleSaDesktopDragRef.current.pointerId = null;
      setTeleSaDesktopIsDragging(false);
      if (resetToZero) setTeleSaDesktopOffsetPx(0);
      else setTeleSaDesktopOffsetPx((current) => Math.max(-max, Math.min(0, current)));
    };

    const onEnd = (ev: PointerEvent) => finish(ev, false);
    const onCancel = (ev: PointerEvent) => finish(ev, true);

    pointerTarget.setPointerCapture?.(pointerId);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onCancel);
  };

  const toggleTeleSaReveal = () => {
    const measuredHeight = teleSaTextRef.current?.offsetHeight ?? 0;
    const max = Math.max(
      teleSaMaxOffsetPx,
      Math.max(0, Math.round(measuredHeight * (2 / 3))),
    );
    const next = teleSaOffsetPx < 0 ? 0 : -max;
    setTeleSaOffsetPx(next);
  };

  const toggleTeleSaDesktopReveal = () => {
    const measuredHeight = teleSaDesktopTextRef.current?.offsetHeight ?? 0;
    const max = Math.max(
      teleSaDesktopMaxOffsetPx,
      Math.max(0, Math.round(measuredHeight * (2 / 3))),
    );
    const next = teleSaDesktopOffsetPx < 0 ? 0 : -max;
    setTeleSaDesktopOffsetPx(next);
  };

  const goToTest = () => {
    router.push(selectedAge === "adult" ? "/test?variant=adult" : "/test");
  };

  const closeConsultOverlay = () => {
    setIsConsultOverlayOpen(false);
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  };

  const openConsultOverlay = () => {
    setIsConsultOverlayOpen(true);
  };

  const onSubmitConsultation: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (isConsultSubmitting) return;
    if (!kidConsultAgree) return;

    const variant = selectedAge === "adult" ? "adult" : "kid";
    const pageUrl = typeof window === "undefined" ? "" : window.location.href;
    const name = kidConsultName.trim();
    const email = kidConsultEmail.trim();
    const phoneOrZalo = kidConsultZaloNumber.trim();

    if (!name) {
      setConsultToast({ open: true, variant: "error", message: "Vui lòng nhập họ tên." });
      return;
    }
    if (!email && !phoneOrZalo) {
      setConsultToast({ open: true, variant: "error", message: "Vui lòng nhập Email hoặc SĐT/Zalo." });
      return;
    }

    setIsConsultSubmitting(true);
    try {
      await sendConsultationMail({
        name,
        phone: phoneOrZalo,
        email,
        job: `landing-${variant}`,
        contact_channel: kidConsultContactMethod,
        consult_topic: kidConsultTopic || "Tư vấn khóa học",
        notes: [
          `source=landing`,
          `variant=${variant}`,
          `contact_method=${kidConsultContactMethod}`,
          `zalo_country=${kidConsultZaloCountry}`,
          `page_url=${pageUrl}`,
        ].join("\n"),
      });

      setConsultToast({
        open: true,
        variant: "success",
        message: "Gửi thông tin tư vấn thành công. Telesa sẽ liên hệ với bạn sớm nhất!",
      });
      setKidConsultAgree(false);
      setKidConsultName("");
      setKidConsultEmail("");
      setKidConsultZaloNumber("");
      setKidConsultTopic("");
      setIsConsultOverlayOpen(false);
    } catch (err) {
      console.error("consultation submit error:", err);
      setConsultToast({
        open: true,
        variant: "error",
        message: "Gửi tư vấn thất bại. Vui lòng thử lại sau.",
      });
    } finally {
      setIsConsultSubmitting(false);
    }
  };

  return (
    <>
      <Toast
        open={consultToast.open}
        message={consultToast.message}
        variant={consultToast.variant}
        onClose={() => setConsultToast((prev) => ({ ...prev, open: false }))}
      />
      {shouldShowMenu && (
        <>
          <DesktopNavbar
            logoSrc={logoSrc}
            variant={selectedAge === "kid" ? "kid" : "adult"}
            activeKey="home"
            onTestClick={goToTest}
            onNavigate={(key) => {
              if (key === "home") scrollToTop();
              if (key === "products") router.push(`/product?variant=${selectedAge ?? "kid"}`);
              if (key === "library") navigateToLibraryFromMenu("/library");
              if (key === "library-why") navigateToLibraryFromMenu("/library/why");
              if (key === "library-program-for-kid") navigateToLibraryFromMenu("/library/program-for-kid");
              if (key === "library-what-is-tes") navigateToLibraryFromMenu("/library/what-is-tes");
              if (key === "library-1-1") navigateToLibraryFromMenu("/library/1-1");
              if (key === "library-payment-method") navigateToLibraryFromMenu("/library/payment-method");
              if (key === "library-why-group") navigateToLibraryFromMenu("/library/why-group");
              if (key === "library-roadmap") navigateToLibraryFromMenu("/library/roadmap");
            }}
          />
          <DesktopFloatingActions
            variant={selectedAge === "adult" ? "adult" : "kid"}
            onScrollToTop={scrollToTop}
          />
          <MobileMenuDrawer
            open={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            variant={selectedAge === "kid" ? "kid" : "adult"}
            logoSrc={logoSrc}
            activeKey={activeMenuKey}
            onNavigate={(key) => {
              if (key === "home") scrollToTop();
              if (key === "product") router.push(`/product?variant=${selectedAge ?? "kid"}`);
              if (key === "library") navigateToLibraryFromMenu("/library");
              if (key === "library-why") navigateToLibraryFromMenu("/library/why");
              if (key === "library-program-for-kid") navigateToLibraryFromMenu("/library/program-for-kid");
              if (key === "library-what-is-tes") navigateToLibraryFromMenu("/library/what-is-tes");
              if (key === "library-1-1") navigateToLibraryFromMenu("/library/1-1");
              if (key === "library-payment-method") navigateToLibraryFromMenu("/library/payment-method");
              if (key === "library-why-group") navigateToLibraryFromMenu("/library/why-group");
              if (key === "library-roadmap") navigateToLibraryFromMenu("/library/roadmap");
            }}
          />
        </>
      )}

      {isConsultOverlayOpen && (
        <div
          className="fixed inset-0 z-[200] overflow-y-auto bg-black text-white"
          style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          <Image
            src={selectedAge === "adult" ? "/assets/10-2.jpg" : "/assets/10-1.jpg"}
            alt="Telesa English consultation"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="pointer-events-none select-none object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundColor: selectedAge === "adult" ? "#59033955" : "#6B510055",
            }}
          />

          <div className="relative z-10 flex w-full flex-col">
            <div className="flex items-center justify-between gap-4 px-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0">
                  <Image
                    src={logoSrc}
                    alt="Telesa English logo"
                    fill
                    sizes="48px"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="text-left">
                  <p className="text-[14px] font-semibold leading-tight">Form đăng ký tư vấn</p>
                  <p className="mt-0.5 text-[12px] text-white/85">Điền nhanh trong 30 giây</p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeConsultOverlay}
                className="rounded-full border border-white/50 bg-black/20 px-4 py-2 text-[13px] font-medium text-white backdrop-blur-md"
              >
                Đóng
              </button>
            </div>

            <div
              className="mt-4 px-4 pb-[calc(env(safe-area-inset-bottom)+32px)]"
            >
              <form className="mx-auto flex w-full max-w-md flex-col gap-3" onSubmit={onSubmitConsultation}>
                <div className="space-y-1 text-left">
                  <label className="block text-[13px] font-semibold text-white">Tên</label>
                  <input
                    value={kidConsultName}
                    onChange={(e) => setKidConsultName(e.target.value)}
                    placeholder="Nhập tên của bạn"
                    className="h-11 w-full rounded-[14px] bg-white/75 px-4 text-left text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.20)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/90"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[13px] font-semibold text-white">Email</label>
                  <input
                    value={kidConsultEmail}
                    onChange={(e) => setKidConsultEmail(e.target.value)}
                    placeholder="you@company.com"
                    inputMode="email"
                    className="h-11 w-full rounded-[14px] bg-white/75 px-4 text-left text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.20)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/90"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[13px] font-semibold text-white">Hình thức liên hệ</label>
                  <div className="relative">
                    <select
                      value={kidConsultContactMethod}
                      onChange={(e) => setKidConsultContactMethod(e.target.value as any)}
                      className="h-11 w-full appearance-none rounded-[14px] bg-white/75 px-4 pr-10 text-left text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.20)] outline-none backdrop-blur-md focus:bg-white/90"
                    >
                      <option value="zalo">Zalo</option>
                      <option value="phone">Điện thoại</option>
                      <option value="email">Email</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                      <span className="text-[13px] text-slate-600">⌄</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[13px] font-semibold text-white">
                    {kidConsultContactMethod === "phone" ? "Số điện thoại" : "Số Zalo"}
                  </label>
                  <div className="flex h-11 w-full overflow-hidden rounded-[14px] bg-white/75 shadow-[0_10px_24px_rgba(0,0,0,0.20)] backdrop-blur-md">
                    <div className="flex items-center gap-2 px-4 text-[14px] text-slate-700">
                      <select
                        value={kidConsultZaloCountry}
                        onChange={(e) => setKidConsultZaloCountry(e.target.value as any)}
                        className="appearance-none bg-transparent font-semibold outline-none"
                      >
                        <option value="VN">VN</option>
                      </select>
                      <span className="text-slate-500">⌄</span>
                    </div>
                    <div className="my-2 w-px bg-white/60" />
                    <div className="flex flex-1 items-center px-4">
                      <span className="mr-2 text-[14px] text-slate-500">+84</span>
                      <input
                        value={kidConsultZaloNumber}
                        onChange={(e) => setKidConsultZaloNumber(e.target.value)}
                        placeholder="(555) 000-0000"
                        inputMode="tel"
                        className="h-full w-full bg-transparent text-left text-[14px] text-slate-700 outline-none placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[13px] font-semibold text-white">Vấn đề cần tư vấn</label>
                  <textarea
                    value={kidConsultTopic}
                    onChange={(e) => setKidConsultTopic(e.target.value)}
                    placeholder="Bạn muốn chúng tôi hỗ trợ thêm về vấn đề gì"
                    rows={3}
                    className="w-full resize-none rounded-[14px] bg-white/75 px-4 py-3 text-left text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.20)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/90"
                  />
                </div>

                <label className="mt-1 flex items-start gap-3 text-left text-[13px] text-white/90">
                  <input
                    type="checkbox"
                    checked={kidConsultAgree}
                    onChange={(e) => setKidConsultAgree(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded-md border-2 border-white/80 bg-transparent accent-white"
                  />
                  <span className="leading-snug">Bạn đồng ý với tất cả điều khoản bảo mật của Telesa</span>
                </label>

                <button
                  type="submit"
                  disabled={!kidConsultAgree || isConsultSubmitting}
                  className="mt-2 h-11 w-full rounded-[14px] bg-[#FFC000] text-center text-[15px] font-extrabold text-white shadow-[0_14px_28px_rgba(0,0,0,0.22)] disabled:cursor-not-allowed disabled:opacity-100 disabled:brightness-95"
                >
                  {isConsultSubmitting ? "Đang gửi..." : "Gửi"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <main
        ref={mainRef}
        className="relative telesa-vh-100 w-full overflow-y-scroll overscroll-y-none bg-black text-foreground"
      >
        {/* Slide 1: Age selection */}
        <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center overflow-hidden">
          <PreloadedBackgroundVideoSet
            ref={slide1VideoRef}
            className="bg-video absolute inset-0 h-full w-full object-cover object-center"
            sources={{
              default: "/assets/1.mp4",
              kid: "/assets/1-kid.mp4",
              adult: "/assets/1-adult.mp4",
            }}
            active={slide1ActiveVideo}
            onVisibleChange={(key) => {
              if (key === slide1ActiveVideo || key === "default") setIsAgeSwitchLocked(false);
            }}
          />
          <div aria-hidden="true" className="absolute inset-0" />

          <div className="pointer-events-none absolute inset-0 bg-black/40 lg:bg-gradient-to-r lg:from-black/55 lg:via-black/35 lg:to-black/10" />

          <div className="relative z-10 flex h-full w-full items-stretch justify-center px-4 pb-6 pt-8 lg:px-[8vw] lg:py-14">
            <div className="flex w-full max-w-md flex-col justify-between lg:max-w-6xl lg:flex-row lg:items-center lg:justify-between lg:gap-10">
              {/* Mobile */}
              <div className="flex w-full flex-col justify-between lg:hidden">
                <div className="h-8" />

                <section className="mt-4 rounded-[32px] bg-[linear-gradient(174deg,rgba(0,0,0,0.20)_6.38%,rgba(0,0,0,0)_95.47%)] px-5 pb-6 pt-5 text-white shadow-[0_2px_4px_rgba(0,0,0,0.10)]">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="relative h-16 w-16">
                      <Image
                        src={logoSrc}
                        alt="Telesa English logo"
                        width={64}
                        height={64}
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

                  <p className="mt-4 text-sm text-white/85">Chọn độ tuổi để bắt đầu nhé</p>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      disabled={isAgeSwitchLocked}
                      onClick={() => handleSelectAge("kid")}
                      className={`flex-1 rounded-full border px-3 py-2 text-center text-xs font-medium shadow-sm backdrop-blur-sm transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-90 disabled:active:scale-100 ${selectedAge === "kid"
                          ? "border-white bg-white text-black shadow-lg scale-[1.02]"
                          : "border-white/80 bg-black/20 text-white hover:bg-white/10 hover:scale-[1.02] active:scale-95"
                        }`}
                    >
                      Trẻ em {"<"} 16 tuổi
                    </button>
                    <button
                      type="button"
                      disabled={isAgeSwitchLocked}
                      onClick={() => handleSelectAge("adult")}
                      className={`flex-1 rounded-full border px-3 py-2 text-center text-xs font-medium shadow-sm backdrop-blur-sm transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-90 disabled:active:scale-100 ${selectedAge === "adult"
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

              {/* Desktop */}
              <div className="hidden w-full items-center justify-between gap-10 lg:flex">
                s
                <section className="w-[62%] rounded-[32px] bg-[linear-gradient(174deg,rgba(0,0,0,0.20)_6.38%,rgba(0,0,0,0)_95.47%)] px-12 py-12 text-white shadow-[0_2px_4px_rgba(0,0,0,0.10)]">
                  <div className="flex items-center gap-3">
                    <div className="relative h-[56px] w-[56px]">
                      <Image
                        src={logoSrc}
                        alt="Telesa English logo"
                        width={56}
                        height={56}
                        className="h-full w-full object-contain"
                        priority
                      />
                    </div>
                    <p className="text-lg font-medium">Telesa English</p>
                  </div>

                  <h1 className="mt-6 text-[44px] font-semibold leading-[1.04] tracking-wide xl:text-[58px]">
                    Nâng tầm kỹ năng
                    <br />
                    giao tiếp tiếng Anh
                    <br />
                    với Telesa English
                  </h1>

                  <p className="mt-6 max-w-[56ch] text-base text-white/85 xl:text-lg">
                    Chọn độ tuổi để bắt đầu nhé
                  </p>

                  <div className="mt-10 flex max-w-xl gap-5">
                    <button
                      type="button"
                      disabled={isAgeSwitchLocked}
                      onClick={() => handleSelectAge("kid")}
                      className={`flex-1 rounded-full border px-6 py-3 text-center text-sm font-medium shadow-sm backdrop-blur-sm transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-90 disabled:active:scale-100 ${selectedAge === "kid"
                          ? "border-white bg-white text-black shadow-lg scale-[1.01]"
                          : "border-white/80 bg-black/15 text-white hover:bg-white/10 hover:scale-[1.01] active:scale-[0.98]"
                        }`}
                    >
                      Trẻ em {"<"} 16 tuổi
                    </button>
                    <button
                      type="button"
                      disabled={isAgeSwitchLocked}
                      onClick={() => handleSelectAge("adult")}
                      className={`flex-1 rounded-full border px-6 py-3 text-center text-sm font-medium shadow-sm backdrop-blur-sm transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-90 disabled:active:scale-100 ${selectedAge === "adult"
                          ? "border-white bg-white text-black shadow-lg scale-[1.01]"
                          : "border-white/80 bg-black/15 text-white hover:bg-white/10 hover:scale-[1.01] active:scale-[0.98]"
                        }`}
                    >
                      Người lớn {">="} 16 tuổi
                    </button>
                  </div>
                </section>

                <aside className="flex shrink-0 flex-col gap-7">
                  <div className="relative h-[40vh] aspect-[2/3] overflow-hidden rounded-[24px] shadow-2xl">
                    <Image
                      src={leftImageSrc}
                      alt="Telesa English class preview"
                      fill
                      sizes="(min-width: 1024px) 40vh, 44vw"
                      quality={100}
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="relative h-[40vh] aspect-[2/3] overflow-hidden rounded-[24px] shadow-2xl">
                    <Image
                      src={rightImageSrc}
                      alt="Telesa English learning session"
                      fill
                      sizes="(min-width: 1024px) 40vh, 44vw"
                      quality={100}
                      className="object-cover"
                      priority
                    />
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 2: Kid follow-up view */}
        {selectedAge === "kid" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center overflow-hidden">
            <BackgroundVideo
              ref={slide2VideoRef}
              className="bg-video absolute inset-0 h-full w-full object-cover object-center"
              src="/assets/2-kid.mp4"
              poster="/assets/2-kid-library.jpg"
            />
            <div aria-hidden="true" className="absolute inset-0" />

            <div className="pointer-events-none absolute inset-0 bg-black/30 lg:bg-gradient-to-r lg:from-black/55 lg:via-black/25 lg:to-black/5" />

            <div className="relative z-10 flex h-full w-full max-w-md flex-col justify-between px-4 pb-6 pt-8 text-white lg:max-w-none lg:px-0 lg:pb-0 lg:pt-0">
              {/* Top bar (mobile) */}
              <MobileHeader
                className="lg:hidden"
                logoSrc="/assets/logo.png"
                logoAlt="Telesa English Kids logo"
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-white/80 bg-black/25 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-black/30 text-white shadow-sm backdrop-blur-md"
                menuLineClassName="bg-white"
              />

              {/* Desktop hero content */}
              <div className="hidden lg:block absolute inset-x-0 bottom-[15vh]">
                <div className="px-[8vw]">
                  <div className="max-w-[880px] text-left">
                    <h1 className="text-[60px] font-semibold leading-[1.04] tracking-tight xl:text-[72px]">
                      Telesa English –
                      <br />
                      Nói tự tin, giao tiếp tự nhiên
                    </h1>

                    <p className="mt-6 text-lg leading-relaxed text-white/90 xl:text-xl">
                      Chọn chương trình để bắt đầu hành trình của bạn
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
        )}

        {/* Slide 3 (kid): Horizontal feature carousel with 4 slides */}
        {selectedAge === "kid" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-white">
            {/* Mobile */}
            <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8 text-slate-900 lg:hidden">
              {/* Top bar (same as kid) */}
              <MobileHeader
                logoSrc="/assets/logo.png"
                logoAlt="Telesa English Kids logo"
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
                menuLineClassName="bg-white"
              />

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
                      className={`h-1 rounded-full transition-all ${index === kidSlideIndex
                          ? "w-6 bg-amber-400"
                          : "w-4 bg-slate-300"
                        }`}
                    />
                  ))}
                </div>

                {/* Text content + floating actions side-by-side */}
                <div
                  className={`mt-6 flex w-full items-start justify-between gap-4 transform-gpu transition-all duration-300 ease-out ${kidTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
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
                  <MobileFloatingActions variant="kid" tone="light" size="sm" onScrollToTop={scrollToTop} />
                </div>
              </div>
            </div>

            {/* Desktop */}
            <div className="relative z-10 hidden h-full w-full items-center justify-between px-[8vw] lg:flex">
              <div className="flex w-[56%] flex-col items-center">
                <div className="relative w-full max-w-[760px]">
                  <div
                    className="relative h-[64vh] max-h-[680px] w-full select-none cursor-grab active:cursor-grabbing"
                    style={{ touchAction: "pan-y" }}
                    {...kidCarouselSwipe}
                  >
                    <div
                      className={`relative mx-auto h-full w-full max-w-[560px] transform-gpu transition-all duration-300 ease-out ${kidTextVisible
                          ? "opacity-100 translate-x-0 scale-100"
                          : "opacity-0 -translate-x-2 scale-[0.99]"
                        }`}
                    >
                      <Image
                        src={kidSlides[kidSlideIndex].image}
                        alt={kidSlides[kidSlideIndex].alt}
                        fill
                        sizes="(min-width: 1024px) 560px, 90vw"
                        quality={100}
                        className="object-contain"
                        draggable={false}
                        priority
                      />
                    </div>
                  </div>

                  <div className="mt-10 flex items-center justify-center gap-4">
                    {kidSlides.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => changeKidSlide(index)}
                        className={`h-1.5 rounded-full transition-all ${index === kidSlideIndex ? "w-10 bg-amber-400" : "w-7 bg-slate-300"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div
                className={`w-[40%] max-w-[560px] text-left transform-gpu transition-all duration-300 ease-out ${kidTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
              >
                <h2 className="text-[44px] font-semibold leading-tight text-slate-900">
                  {kidSlides[kidSlideIndex].title}
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-slate-500">
                  {kidSlides[kidSlideIndex].description}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Slide 4 (kid): Stats view */}
        {selectedAge === "kid" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-[#273143] text-white lg:bg-white lg:text-slate-900">
            {/* Mobile */}
            <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8 lg:hidden">
              {/* Top bar */}
              <MobileHeader
                logoSrc="/assets/logo.png"
                logoAlt="Telesa English Kids logo"
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-white/80 bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-white"
                menuLineClassName="bg-white"
              />

              {/* Center stats */}
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <p className="text-base font-medium tracking-wide">Tiếng anh giao tiếp</p>
                <p className="mt-3 text-[64px] font-extrabold leading-none text-amber-400">
                  <CountUp to={3000} suffix="+" durationMs={1500} />
                </p>
                <p className="mt-4 text-base font-medium">Học viên đang học</p>
              </div>

              {/* Floating actions */}
              <div className="mt-auto flex items-end justify-end pb-1">
                <MobileFloatingActions variant="kid" tone="slate" onScrollToTop={scrollToTop} />
              </div>
            </div>

            {/* Desktop */}
            <div className="relative z-10 hidden h-full w-full items-center justify-center px-[8vw] lg:flex">
              <div className="w-full">
                <div className="grid w-full grid-cols-2 items-start gap-8 text-center 2xl:grid-cols-4 2xl:gap-12">
                  <div>
                    <p className="text-[clamp(16px,1.7vw,24px)] font-semibold text-slate-700">Tiếng anh giao tiếp</p>
                    <p className="mt-6 text-[clamp(56px,6vw,96px)] font-extrabold leading-none text-[#FEA933]">
                      <CountUp to={1000} suffix="+" durationMs={1500} />
                    </p>
                    <p className="mt-6 text-[clamp(13px,1.2vw,18px)] text-[#667085]">Học viên đang học</p>
                  </div>
                  <div>
                    <p className="text-[clamp(16px,1.7vw,24px)] font-semibold text-slate-700">Giáo viên chuyên môn</p>
                    <p className="mt-6 text-[clamp(56px,6vw,96px)] font-extrabold leading-none text-[#FEA933]">
                      <CountUp to={25} suffix="+" durationMs={1500} />
                    </p>
                    <p className="mt-6 text-[clamp(13px,1.2vw,18px)] text-[#667085]">Giáo viên có từ 5 năm kinh nghiệm</p>
                  </div>
                  <div>
                    <p className="text-[clamp(16px,1.7vw,24px)] font-semibold text-slate-700">Tiến bộ rõ rệt</p>
                    <p className="mt-6 text-[clamp(56px,6vw,96px)] font-extrabold leading-none text-[#FEA933]">
                      <CountUp to={98} suffix="%" durationMs={1500} />
                    </p>
                    <p className="mt-6 text-[clamp(13px,1.2vw,18px)] text-[#667085]">Học viên cảm nhận thực tế</p>
                  </div>
                  <div>
                    <p className="text-[clamp(16px,1.7vw,24px)] font-semibold text-slate-700">Ứng dụng công nghệ</p>
                    <p className="mt-6 text-[clamp(56px,6vw,96px)] font-extrabold leading-none text-[#FEA933]">
                      <CountUp to={90} suffix="%" durationMs={1500} />
                    </p>
                    <p className="mt-6 text-[clamp(13px,1.2vw,18px)] text-[#667085]">Áp dụng công nghệ mới trong dạy học</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Slide 5 (kid desktop): Library teaser slider */}
        {selectedAge === "kid" && (
          <section
            id="kid-library-teaser-desktop"
            className="relative hidden telesa-vh-100 w-full snap-start items-stretch justify-center overflow-hidden bg-black text-white lg:flex"
            style={{ touchAction: "pan-y" }}
            {...kidView8Swipe}
          >
            <Image
              src={kidLibraryTeaserSlides[kidView8Index].image}
              alt="Telesa English Kids learning"
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
                  className={`whitespace-pre-line text-[34px] font-semibold leading-[1.05] tracking-tight sm:text-[44px] lg:text-[56px] transform-gpu transition-all duration-300 ease-out ${kidView8TextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    } ${kidLibraryTeaserSlides[kidView8Index].desktopTitleClassName}`}
                >
                  {kidLibraryTeaserSlides[kidView8Index].title}
                </h2>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        sessionStorage.setItem(
                          "telesa:returnContext",
                          JSON.stringify({
                            kind: "landing",
                            selectedAge: "kid",
                            anchorId: "kid-library-teaser-desktop",
                          }),
                        );
                      } catch { }
                      router.push(kidLibraryTeaserSlides[kidView8Index].href);
                    }}
                    className="inline-flex items-center justify-center gap-1 rounded-[36px] border-2 border-white bg-white/5 px-4 py-2 text-[14px] font-medium text-white shadow-[0_2px_4px_rgba(0,0,0,0.10)] transition-colors hover:bg-white/10"
                  >
                    Chi tiết
                  </button>
                </div>

                <div className="mt-10 flex items-center gap-4 lg:mt-12">
                  {kidLibraryTeaserSlides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => changeKidView8Slide(index)}
                      className={`h-1.5 rounded-full transition-all ${index === kidView8Index ? "w-12 bg-[#FEA933]" : "w-12 bg-white/70"
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Slide 6 (kid desktop): Testimonials */}
        {selectedAge === "kid" && (
          <section className="relative hidden telesa-vh-100 w-full snap-start items-stretch justify-center bg-[#F8F9FA] text-slate-900 lg:flex">
            <div className="relative z-10 flex h-full w-full flex-col">
              <div className="w-full px-[8vw] pt-[12vh] text-center">
                <h2 className="text-[44px] font-extrabold tracking-tight text-slate-700">
                  Cảm Nhận Học Viên
                </h2>
                <p className="mt-3 text-lg text-[#667085]">
                  Đánh giá và chia sẻ thực tế từ học viên
                </p>
              </div>

              <div
                className="mt-14 w-full flex-1 select-none overflow-x-auto pb-[10vh] cursor-grab active:cursor-grabbing"
                style={
                  {
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    touchAction: "pan-y",
                  } as React.CSSProperties
                }
                {...kidTestimonialsDrag}
              >
                <div className="flex w-max items-stretch gap-10 px-[8vw] snap-x snap-mandatory">
                  {kidTestimonials.map((t, index) => (
                    <article
                      key={`${t.name}-${index}`}
                      className="grid h-[55vh] max-h-[55vh] w-[23vw] grid-rows-[1fr_auto] rounded-[32px] border border-slate-100 bg-white p-[clamp(28px,3.2vh,40px)] shadow-sm snap-center"
                    >
                      <p className="self-center text-[clamp(16px,2vh,22px)] leading-relaxed text-slate-700">
                        {t.content}
                      </p>

                      <div className="flex items-center gap-5">
                        <div className="h-[clamp(52px,6vh,72px)] w-[clamp(52px,6vh,72px)] rounded-full bg-slate-200" />
                        <div className="text-left">
                          <p className="text-[clamp(18px,2.4vh,26px)] font-bold text-slate-700">
                            {t.name}
                          </p>
                          <p className="mt-1 text-[clamp(12px,1.4vh,14px)] text-[#667085]">
                            {t.date}
                          </p>
                          <div className="mt-2 text-[clamp(12px,1.6vh,16px)] text-[#FEA933]">
                            {"★★★★★"}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Slide 7 (kid desktop): Global connections view */}
        {selectedAge === "kid" && (
          <section className="relative hidden telesa-vh-100 w-full snap-start items-stretch justify-center bg-[#273143] text-white lg:flex">
            <div className="relative z-10 flex h-full w-full flex-col">
              <div className="w-full px-[8vw] pt-[10vh] text-center">
                <h2 className="text-[45px] font-extrabold leading-[1.05] tracking-tight">
                  Kết nối học viên trên toàn thế giới cùng Telesa English!
                </h2>
                <p className="mx-auto mt-5 max-w-[820px] text-[20px] leading-relaxed text-slate-100">
                  Dù bạn ở đâu, Telesa English luôn đồng hành cùng bạn trên hành trình
                  chinh phục tiếng Anh.
                </p>
              </div>

              <div className="mt-12 flex min-h-0 flex-1 items-center justify-center px-[8vw] pb-[10vh]">
                <div className="h-full max-h-[70vh] w-full max-w-[1200px]">
                  <KidWorldMap variant="desktop" className="h-full" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Slide 8 (kid desktop): Consultation form view */}
        {selectedAge === "kid" && (
          <section className="relative hidden telesa-vh-100 w-full snap-start items-stretch justify-center overflow-hidden bg-black text-white lg:flex">
            <Image
              src="/assets/10-1.jpg"
              alt="Telesa English Kids consultation"
              fill
              priority
              quality={100}
              sizes="100vw"
              className="pointer-events-none select-none object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/35" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.10)_0%,rgba(0,0,0,0.55)_70%,rgba(0,0,0,0.78)_100%)]" />

            <div className="relative z-10 mt-[80px] flex h-[calc(100dvh-80px)] w-full flex-col items-center justify-center px-[8vw] py-[min(4vh,32px)]">
              <div className="w-full max-w-[920px] text-center">
                <h2 className="text-[clamp(29px,4vh,37px)] font-extrabold leading-[1.05] tracking-tight text-white">
                  Form Đăng Ký Tư Vấn
                </h2>
                <p className="mx-auto mt-[min(1.45vh,9px)] max-w-[760px] text-[clamp(12px,1.75vh,14px)] font-medium leading-relaxed text-white/90">
                  Để lại thông tin của bạn, chúng tôi sẽ liên hệ để tư vấn ngay!
                </p>
              </div>

              <form
                className="mt-[min(2.9vh,22px)] flex w-full max-w-[920px] flex-col gap-[min(1.7vh,14px)]"
                onSubmit={onSubmitConsultation}
              >
                <div className="space-y-2 text-left">
                  <label className="block text-[13px] font-semibold text-white">Tên</label>
                  <input
                    value={kidConsultName}
                    onChange={(e) => setKidConsultName(e.target.value)}
                    placeholder="Nhập tên của bạn"
                    className="h-[clamp(35px,4.2vh,40px)] w-full rounded-[16px] bg-white/55 px-4 text-left text-[13px] text-slate-700 shadow-[0_12px_28px_rgba(0,0,0,0.22)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/70"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-[13px] font-semibold text-white">Email</label>
                  <input
                    value={kidConsultEmail}
                    onChange={(e) => setKidConsultEmail(e.target.value)}
                    placeholder="you@company.com"
                    inputMode="email"
                    className="h-[clamp(35px,4.2vh,40px)] w-full rounded-[16px] bg-white/55 px-4 text-left text-[13px] text-slate-700 shadow-[0_12px_28px_rgba(0,0,0,0.22)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/70"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-[13px] font-semibold text-white">
                    Hình thức liên hệ
                  </label>
                  <div className="relative">
                    <select
                      value={kidConsultContactMethod}
                      onChange={(e) => setKidConsultContactMethod(e.target.value as any)}
                      className="h-[clamp(35px,4.2vh,40px)] w-full appearance-none rounded-[16px] bg-white/55 px-4 pr-9 text-left text-[13px] text-slate-700 shadow-[0_12px_28px_rgba(0,0,0,0.22)] outline-none backdrop-blur-md focus:bg-white/70"
                    >
                      <option value="zalo">Zalo</option>
                      <option value="phone">Điện thoại</option>
                      <option value="email">Email</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                      <span className="text-[13px] text-slate-600">⌄</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-[13px] font-semibold text-white">Số Zalo</label>
                  <div className="flex h-[clamp(35px,4.2vh,40px)] w-full overflow-hidden rounded-[16px] bg-white/55 shadow-[0_12px_28px_rgba(0,0,0,0.22)] backdrop-blur-md">
                    <div className="flex items-center gap-2 px-4 text-[13px] text-slate-700">
                      <select
                        value={kidConsultZaloCountry}
                        onChange={(e) => setKidConsultZaloCountry(e.target.value as any)}
                        className="appearance-none bg-transparent font-semibold outline-none"
                      >
                        <option value="VN">VN</option>
                      </select>
                      <span className="text-slate-600">⌄</span>
                    </div>
                    <div className="my-2 w-px bg-white/55" />
                    <div className="flex flex-1 items-center px-4">
                      <span className="mr-2 text-[13px] text-slate-600">+84</span>
                      <input
                        value={kidConsultZaloNumber}
                        onChange={(e) => setKidConsultZaloNumber(e.target.value)}
                        placeholder="(555) 000-0000"
                        inputMode="tel"
                        className="h-full w-full bg-transparent text-left text-[13px] text-slate-700 outline-none placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[13px] font-semibold text-white">
                    Vấn đề cần tư vấn
                  </label>
                  <textarea
                    value={kidConsultTopic}
                    onChange={(e) => setKidConsultTopic(e.target.value)}
                    placeholder="Bạn muốn chúng tôi hỗ trợ thêm về vấn đề gì"
                    rows={3}
                    className="h-[clamp(64px,12.5vh,92px)] w-full resize-none rounded-[16px] bg-white/55 px-4 py-2.5 text-left text-[13px] text-slate-700 shadow-[0_12px_28px_rgba(0,0,0,0.22)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/70"
                  />
                </div>

                <label className="mt-1 flex items-start gap-3 text-left text-[13px] text-white/90">
                  <input
                    type="checkbox"
                    checked={kidConsultAgree}
                    onChange={(e) => setKidConsultAgree(e.target.checked)}
                    className="mt-1 h-[18px] w-[18px] rounded-md border-2 border-white/80 bg-transparent accent-white"
                  />
                  <span className="leading-snug">
                    Bạn đồng ý với tất cả điều khoản bảo mật của Telesa
                  </span>
                </label>

                <div className="mt-3 flex justify-center">
                  <button
                    type="submit"
                    disabled={!kidConsultAgree || isConsultSubmitting}
                    className="h-[clamp(40px,5.3vh,44px)] w-full max-w-[506px] rounded-[16px] bg-[#FFC000] text-center text-[15px] font-extrabold text-white shadow-[0_14px_34px_rgba(0,0,0,0.24)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-100 disabled:brightness-95"
                  >
                    {isConsultSubmitting ? "Đang gửi..." : "Gửi"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Slide 9 (kid desktop): Contact options view */}
        {selectedAge === "kid" && (
          <section className="relative hidden telesa-vh-100 w-full snap-start items-stretch justify-center bg-white text-slate-900 lg:flex">
            <div className="relative z-10 mt-[80px] flex h-[calc(100dvh-80px)] w-full flex-col items-center justify-center px-[8vw] py-[min(4.8vh,45px)]">
              <div className="w-full max-w-[1100px] text-center">
                <h2 className="text-[48px] font-extrabold tracking-tight text-slate-700">
                  Hoặc Liên Hệ Ngay Để Nhận Tư Vấn
                </h2>
                <p className="mx-auto mt-4 max-w-[760px] text-[20px] font-medium text-slate-500">
                  Chúng tôi sẽ liên hệ lại ngay để tư vấn tận tình
                </p>
              </div>

              <div className="mt-[min(5.6vh,51px)] w-full max-w-[1180px]">
                <div className="grid grid-cols-3 gap-12">
                  <a
                    href={ZALO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Mở Zalo"
                    className="rounded-[40px] bg-[#E6F7FE] p-10 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex h-14 w-14 items-center justify-center bg-transparent shadow-none">
                      <Image
                        src="/assets/svg/zalo.svg"
                        alt="Zalo"
                        width={44}
                        height={44}
                        className="h-10 w-10"
                      />
                    </div>
                    <h3 className="mt-8 text-[34px] font-extrabold text-slate-700">
                      Zalo
                    </h3>
                    <p className="mt-3 text-[18px] font-medium text-slate-600">
                      Liên hệ với chúng tôi qua Zalo
                    </p>
                  </a>

                  <a
                    href={MESSENGER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Mở Messenger"
                    className="rounded-[40px] bg-[#FFF5FB] p-10 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex h-14 w-14 items-center justify-center bg-transparent shadow-none">
                      <Image
                        src="/assets/svg/messenger.svg"
                        alt="Messenger"
                        width={44}
                        height={44}
                        className="h-10 w-10"
                      />
                    </div>
                    <h3 className="mt-8 text-[34px] font-extrabold text-slate-700">
                      Messenger
                    </h3>
                    <p className="mt-3 text-[18px] font-medium text-slate-600">
                      Nhắn tin với chúng tôi ngay
                    </p>
                  </a>

                  <div className="rounded-[40px] bg-[#F4FCE8] p-10">
                    <div className="flex h-14 w-14 items-center justify-center bg-transparent shadow-none">
                      <Image
                        src="/assets/svg/whatsapp.svg"
                        alt="Whatsapp"
                        width={44}
                        height={44}
                        className="h-10 w-10"
                      />
                    </div>
                    <h3 className="mt-8 text-[34px] font-extrabold text-slate-700">
                      Whatsapp
                    </h3>
                    <p className="mt-3 text-[18px] font-medium text-slate-600">
                      Liên hệ với chúng tôi qua Whatsapp
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* Slide 10 (kid desktop): TELESA view */}
        {selectedAge === "kid" && (
          <section className="relative hidden telesa-vh-100 w-full snap-start items-stretch justify-center overflow-hidden bg-black lg:flex">
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
              className="absolute inset-x-0 bottom-0 top-[80px] z-10"
              onPointerDown={startTeleSaDesktopDrag}
              style={{ touchAction: "none" }}
            >
              {teleSaDesktopMaskBaseHeightPx > 0 && (
                <div
                  className={`pointer-events-none absolute bottom-0 left-0 right-0 z-30 ${teleSaDesktopIsDragging ? "" : "transition-[height] duration-600 ease-out"
                    }`}
                  style={{
                    height: Math.max(0, teleSaDesktopMaskBaseHeightPx + teleSaDesktopOffsetPx / 2),
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
                className={`absolute left-0 right-0 ${teleSaDesktopIsDragging ? "" : "transition-transform duration-600 ease-out"
                  }`}
                style={{
                  bottom: "10vh",
                  transform: `translateY(${teleSaDesktopOffsetPx}px)`,
                  zIndex: 20,
                }}
              >
                <div className="flex w-full items-end justify-center pb-2">
                  <div
                    ref={teleSaDesktopTextRef}
                    role="button"
                    tabIndex={0}
                    onPointerDown={startTeleSaDesktopDrag}
                    onClick={toggleTeleSaDesktopReveal}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== " ") return;
                      e.preventDefault();
                      toggleTeleSaDesktopReveal();
                    }}
                    className="w-[80vw] max-w-full cursor-grab select-none whitespace-nowrap text-center text-[clamp(72px,17vw,300px)] font-extrabold leading-none tracking-[0.22em] text-white drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)] active:cursor-grabbing"
                    style={{ touchAction: "none" }}
                  >
                    TELESA
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Slide 2 (adult): Adult follow-up view */}
        {selectedAge === "adult" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center overflow-hidden">
            <BackgroundVideo
              ref={slide2VideoRef}
              className="bg-video absolute inset-0 h-full w-full object-cover object-center"
              src="/assets/2-adult.mp4"
              poster="/assets/8-2-adult.jpg"
            />
            <div aria-hidden="true" className="absolute inset-0" />

            <div className="pointer-events-none absolute inset-0 bg-black/30 lg:bg-gradient-to-r lg:from-black/55 lg:via-black/25 lg:to-black/5" />

            <div className="relative z-10 flex h-full w-full max-w-md flex-col justify-between px-4 pb-6 pt-8 text-white lg:max-w-none lg:px-0 lg:pb-0 lg:pt-0">
              {/* Top bar */}
              <MobileHeader
                className="lg:hidden"
                logoSrc="/assets/svg/logo.png"
                logoAlt="Telesa English logo"
                logoWrapperClassName="relative h-[50px] w-[50px] shrink-0"
                logoImageSize={50}
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-white/80 bg-black/25 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-black/30 text-white shadow-sm backdrop-blur-md"
                menuLineClassName="bg-white"
              />

              {/* Desktop hero content */}
              <div className="hidden lg:block absolute inset-x-0 bottom-[15vh]">
                <div className="px-[8vw]">
                  <div className="max-w-[880px] text-left">
                    <h1 className="text-[60px] font-semibold leading-[1.04] tracking-tight xl:text-[72px]">
                      Telesa English –
                      <br />
                      Tự tin giao tiếp trong công việc
                    </h1>

                    <p className="mt-6 text-lg leading-relaxed text-white/90 xl:text-xl">
                      Chọn chương trình để bắt đầu nâng cấp kỹ năng tiếng Anh của bạn
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
        )}

        {/* Slide 3 (adult): Same structure as kid view 3 */}
        {selectedAge === "adult" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-white">
            {/* Mobile */}
            <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8 text-slate-900 lg:hidden">
              {/* Top bar */}
              <MobileHeader
                logoSrc={logoSrc}
                logoAlt="Telesa English logo"
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
                menuLineClassName="bg-white"
              />

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
                      className={`h-1 rounded-full transition-all ${index === kidSlideIndex
                          ? "w-6 bg-amber-400"
                          : "w-4 bg-slate-300"
                        }`}
                    />
                  ))}
                </div>

                {/* Text content + floating actions side-by-side */}
                <div
                  className={`mt-6 flex w-full items-start justify-between gap-4 transform-gpu transition-all duration-300 ease-out ${kidTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
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
                  <MobileFloatingActions variant="adult" tone="light" size="sm" onScrollToTop={scrollToTop} />
                </div>
              </div>
            </div>

            {/* Desktop */}
            <div className="relative z-10 hidden h-full w-full items-center justify-between px-[8vw] lg:flex">
              <div className="flex w-[56%] flex-col items-center">
                <div className="relative w-full max-w-[760px]">
                  <div
                    className="relative h-[64vh] max-h-[680px] w-full select-none cursor-grab active:cursor-grabbing"
                    style={{ touchAction: "pan-y" }}
                    {...kidCarouselSwipe}
                  >
                    <div
                      className={`relative mx-auto h-full w-full max-w-[560px] transform-gpu transition-all duration-300 ease-out ${kidTextVisible
                          ? "opacity-100 translate-x-0 scale-100"
                          : "opacity-0 -translate-x-2 scale-[0.99]"
                        }`}
                    >
                      <Image
                        src={adultSlides[kidSlideIndex].image}
                        alt={adultSlides[kidSlideIndex].alt}
                        fill
                        sizes="(min-width: 1024px) 560px, 90vw"
                        quality={100}
                        className="object-contain"
                        draggable={false}
                        priority
                      />
                    </div>
                  </div>

                  <div className="mt-10 flex items-center justify-center gap-4">
                    {adultSlides.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => changeKidSlide(index)}
                        className={`h-1.5 rounded-full transition-all ${index === kidSlideIndex ? "w-10 bg-amber-400" : "w-7 bg-slate-300"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div
                className={`w-[40%] max-w-[560px] text-left transform-gpu transition-all duration-300 ease-out ${kidTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
              >
                <h2 className="text-[44px] font-semibold leading-tight text-slate-900">
                  {adultSlides[kidSlideIndex].title}
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-slate-500">
                  {adultSlides[kidSlideIndex].description}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Slide 5 (kid): Stats view */}
        {selectedAge === "kid" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-white text-slate-900 lg:hidden">
            <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
              {/* Top bar */}
              <MobileHeader
                logoSrc="/assets/logo.png"
                logoAlt="Telesa English Kids logo"
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
                menuLineClassName="bg-white"
              />

              {/* Center stats */}
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <p className="text-base font-semibold tracking-wide text-slate-700">
                  Giảng viên chuyên môn
                </p>
                <p className="mt-4 text-[72px] font-extrabold leading-none text-[#ffb800]">
                  <CountUp to={100} suffix="+" durationMs={1500} />
                </p>
                <p className="mt-5 text-base font-medium text-slate-700">
                  Giảng viên có trên 5 năm kinh nghiệm
                </p>
              </div>

              {/* Floating actions */}
              <div className="mt-auto flex items-end justify-end pb-1">
                <MobileFloatingActions variant="kid" tone="light" onScrollToTop={scrollToTop} />
              </div>
            </div>
          </section>
        )}

        {/* Slide 6 (kid): Progress view */}
        {selectedAge === "kid" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-[#273143] text-white lg:hidden">
            <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
              {/* Top bar */}
              <MobileHeader
                logoSrc="/assets/logo.png"
                logoAlt="Telesa English Kids logo"
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-white bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-white"
                menuLineClassName="bg-white"
              />

              {/* Center stats */}
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <p className="text-base font-semibold tracking-wide text-white">
                  Tiến bộ rõ rệt
                </p>
                <p className="mt-4 text-[72px] font-extrabold leading-none text-[#ffb800]">
                  <CountUp to={98} suffix="%" durationMs={1500} />
                </p>
                <p className="mt-5 text-base font-medium text-white">
                  Học viên cảm nhận thực tế
                </p>
              </div>

              {/* Floating actions */}
              <div className="mt-auto flex items-end justify-end pb-1">
                <MobileFloatingActions variant="kid" tone="glass" onScrollToTop={scrollToTop} />
              </div>
            </div>
          </section>
        )}

        {/* Slide 7 (kid): Technology application view */}
        {selectedAge === "kid" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-white text-slate-900 lg:hidden">
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
                <p className="text-base font-semibold tracking-wide text-slate-700">
                  Ứng dụng công nghệ
                </p>
                <p className="mt-4 text-[72px] font-extrabold leading-none text-[#ffb800]">
                  <CountUp to={90} suffix="%" durationMs={1500} />
                </p>
                <p className="mt-5 text-base font-medium text-slate-700">
                  Áp dụng công nghệ mới trong dạy học
                </p>
              </div>

              {/* Floating actions */}
              <div className="mt-auto flex items-end justify-end pb-1">
                <MobileFloatingActions variant="kid" tone="light" onScrollToTop={scrollToTop} />
              </div>
            </div>
          </section>
        )}

        {/* Slide 8 (kid): Library teaser view (2 sub-slides) */}
        {selectedAge === "kid" && (
          <section
            id="kid-library-teaser"
            className="relative flex telesa-min-vh-100 w-full snap-start items-stretch justify-center overflow-hidden bg-black text-white lg:hidden"
            style={{ touchAction: "pan-y" }}
            {...kidView8Swipe}
          >
            {/* Background image */}
            <Image
              src={kidLibraryTeaserSlides[kidView8Index].image}
              alt="Telesa English Kids learning"
              fill
              priority
              quality={100}
              unoptimized
              sizes="100vw"
              className={`pointer-events-none select-none object-cover ${kidLibraryTeaserSlides[kidView8Index].objectClassName}`}
            />
            {/* Dark overlay for readability */}
            <div className="pointer-events-none absolute inset-0 bg-black/25" />

            <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
              {/* Top bar */}
              <MobileHeader
                className="gap-2"
                logoSrc="/assets/logo.png"
                logoAlt="Telesa English Kids logo"
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-white bg-black/30 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-sm"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-black/40 text-white shadow-sm backdrop-blur-sm"
                menuLineClassName="bg-white"
              />

              {/* Text + actions grouped near bottom */}
              <div
                className={`mt-12 flex flex-1 flex-col justify-end pb-10 transform-gpu transition-all duration-300 ease-out ${kidView8TextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
              >
                <p className="whitespace-pre-line text-left text-2xl font-medium leading-8 text-white">
                  {kidLibraryTeaserSlides[kidView8Index].title}
                </p>

                {/* Bottom actions */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        (() => {
                          try {
                            sessionStorage.setItem(
                              "telesa:returnContext",
                              JSON.stringify({
                                kind: "landing",
                                selectedAge: "kid",
                                anchorId: "kid-library-teaser",
                              }),
                            );
                          } catch { }
                          router.push(kidLibraryTeaserSlides[kidView8Index].href);
                        })()
                      }
                      className="inline-flex items-center justify-center gap-1 rounded-[36px] border-2 border-white bg-white/5 px-4 py-2 text-[14px] font-medium text-white shadow-[0_2px_4px_rgba(0,0,0,0.10)]"
                    >
                      Chi tiết
                    </button>
                    <div className="flex items-center gap-2">
                      {kidLibraryTeaserSlides.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => changeKidView8Slide(index)}
                          className={`h-1.5 rounded-full transition-all ${kidView8Index === index ? "w-4 bg-amber-400" : "w-3 bg-white/70"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <MobileFloatingActions variant="kid" tone="darkGlass" onScrollToTop={scrollToTop} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Slide 9 (kid): Testimonials view */}
        {selectedAge === "kid" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-[#273143] text-white lg:hidden">
            {/* Mobile */}
            <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8 lg:hidden">
              {/* Top bar */}
              <MobileHeader
                logoSrc="/assets/logo.png"
                logoAlt="Telesa English Kids logo"
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-white bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-white"
                menuLineClassName="bg-white"
              />

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
                <div className="rounded-[26px] bg-white px-4 py-4 text-slate-700 shadow-md">
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
                <div className="rounded-[26px] bg-white px-4 py-4 text-slate-700 shadow-md">
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
                <div className="pointer-events-auto">
                  <MobileFloatingActions variant="kid" tone="slate" onScrollToTop={scrollToTop} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Slide 10 (kid): Global connections view */}
        {selectedAge === "kid" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-[#273143] text-white lg:hidden">
            <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
              {/* Top bar */}
              <MobileHeader
                logoSrc="/assets/logo.png"
                logoAlt="Telesa English Kids logo"
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-white bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-white"
                menuLineClassName="bg-white"
              />

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
                <MobileFloatingActions variant="kid" tone="slate" onScrollToTop={scrollToTop} />
              </div>
            </div>
          </section>
        )}

        {/* Slide 11 (kid): Consultation form view */}
        {selectedAge === "kid" && (
          <section
            id="consultation-kid"
            className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center overflow-hidden bg-black text-white lg:hidden"
          >
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
              <MobileHeader
                className="w-full text-left gap-3"
                logoSrc="/assets/logo.png"
                logoAlt="Telesa English Kids logo"
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-white/80 bg-black/20 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-black/20 text-white shadow-sm backdrop-blur-md"
                menuLineClassName="bg-white"
              />

              <div className="flex w-full flex-1 flex-col items-center justify-center pb-16">
                <div className="mx-auto w-[80vw] max-w-full text-center">
                  <h2 className="text-[26px] font-extrabold leading-[1.05] tracking-tight text-white">
                    Form Đăng Ký Tư Vấn
                  </h2>
                  <p className="mt-2 text-[13px] font-medium leading-snug text-white/90">
                    Mở form để nhập thông tin tư vấn
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openConsultOverlay}
                  className="mt-6 w-[80vw] max-w-full rounded-[14px] bg-[#FFC000] px-4 py-3 text-center text-[15px] font-extrabold text-white shadow-[0_14px_28px_rgba(0,0,0,0.22)] active:scale-[0.99]"
                >
                  Mở form tư vấn
                </button>
              </div>

              <button
                type="button"
                onClick={scrollToTop}
                className="absolute bottom-5 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md"
                aria-label="Lên đầu trang"
              >
                <ArrowUpIcon size={20} className="h-5 w-5" />
              </button>
            </div>
          </section>
        )}

        {/* Slide 12 (kid): Contact options view */}
        {selectedAge === "kid" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-white text-slate-900 lg:hidden">
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
                <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-slate-700">
                  <span className="block h-[2px] w-4 rounded-full bg-slate-800" />
                  <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-800" />
                  <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-800" />
                </button>
              </div>

              {/* Heading */}
              <div className="mt-6 text-center">
                <h2 className="text-[28px] font-extrabold leading-[1.1] tracking-tight text-slate-700">
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
              <div className="mt-5 flex flex-1 flex-col justify-center gap-2 pb-5">
                <a
                  href={ZALO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Mở Zalo"
                  className="rounded-[24px] bg-[#E6F7FE] px-5 py-3 transition-transform active:scale-[0.99]"
                >
                  <Image
                    src="/assets/svg/zalo.svg"
                    alt="Zalo"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                  <h3 className="mt-2 text-[22px] font-extrabold text-slate-700">
                    Zalo
                  </h3>
                  <p className="mt-1 text-[14px] font-medium leading-snug text-slate-500">
                    Liên hệ với chúng tôi qua Zalo
                  </p>
                </a>

                <a
                  href={MESSENGER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Mở Messenger"
                  className="rounded-[24px] bg-[#FFF5FB] px-5 py-3 transition-transform active:scale-[0.99]"
                >
                  <Image
                    src="/assets/svg/messenger.svg"
                    alt="Messenger"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                  <h3 className="mt-2 text-[22px] font-extrabold text-slate-700">
                    Messenger
                  </h3>
                  <p className="mt-1 text-[14px] font-medium leading-snug text-slate-500">
                    Nhắn tin với chúng tôi ngay
                  </p>
                </a>

                <div className="rounded-[24px] bg-[#F4FCE8] px-5 py-3">
                  <Image
                    src="/assets/svg/whatsapp.svg"
                    alt="Whatsapp"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                  <h3 className="mt-2 text-[22px] font-extrabold text-slate-700">
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
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md"
                    aria-label="Lên đầu trang"
                  >
                    <ArrowUpIcon size={20} className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Slide 13 (kid): TELESA reveal view */}
        {selectedAge === "kid" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center overflow-hidden bg-black lg:hidden">
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
              className="absolute inset-0 z-10 lg:pointer-events-none"
            >
              {teleSaMaskBaseHeightPx > 0 && (
                <div
                  className={`pointer-events-none absolute bottom-0 left-0 right-0 z-30 ${teleSaIsDragging ? "" : "transition-[height] duration-600 ease-out"
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
                className={`absolute left-0 right-0 ${teleSaIsDragging ? "" : "transition-transform duration-600 ease-out"
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
                    role="button"
                    tabIndex={0}
                    onPointerDown={startTeleSaDrag}
                    onClick={toggleTeleSaReveal}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== " ") return;
                      e.preventDefault();
                      toggleTeleSaReveal();
                    }}
                    className="w-[90vw] max-w-full cursor-grab select-none whitespace-nowrap text-center text-[72px] font-extrabold leading-none tracking-[0.22em] text-white drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)] active:cursor-grabbing"
                    style={{ touchAction: "none" }}
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
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md"
                  aria-label="Lên đầu trang"
                >
                  <ArrowUpIcon size={20} className="h-5 w-5" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Slide 14 (kid): Footer contact view */}
        {selectedAge === "kid" && (
          <FooterContactView
            variant="kid"
            logoSrc={logoSrc}
            onMenuOpen={() => setIsMenuOpen(true)}
            onScrollToTop={scrollToTop}
            onCtaClick={goToTest}
            onNavigate={(key) => {
              if (key === "home") scrollToTop();
            }}
          />
        )}

        {/* Slide 4 (adult): Stats view */}
        {selectedAge === "adult" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-[#273143] text-white lg:bg-white lg:text-slate-900">
            {/* Mobile */}
            <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8 lg:hidden">
              {/* Top bar */}
              <MobileHeader
                logoSrc="/assets/svg/logo.png"
                logoAlt="Telesa English logo"
                logoWrapperClassName="relative h-[50px] w-[50px] shrink-0"
                logoImageSize={50}
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-white/80 bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-white"
                menuLineClassName="bg-white"
              />

              {/* Center stats */}
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <p className="text-base font-medium tracking-wide">
                  Tiếng anh giao tiếp
                </p>
                <p className="mt-3 text-[64px] font-extrabold leading-none text-[#C1077B]">
                  <CountUp to={1000} suffix="+" durationMs={1500} />
                </p>
                <p className="mt-4 text-base font-medium">Học viên đang học</p>
              </div>

              {/* Floating actions */}
              <div className="mt-auto flex items-end justify-end pb-1">
                <MobileFloatingActions variant="adult" tone="slate" onScrollToTop={scrollToTop} />
              </div>
            </div>

            {/* Desktop */}
            <div className="relative z-10 hidden h-full w-full items-center justify-center px-[8vw] lg:flex">
              <div className="w-full">
                <div className="grid w-full grid-cols-2 items-start gap-8 text-center 2xl:grid-cols-4 2xl:gap-12">
                  <div>
                    <p className="text-[clamp(16px,1.7vw,24px)] font-semibold text-slate-700">Tiếng anh giao tiếp</p>
                    <p className="mt-6 text-[clamp(56px,6vw,96px)] font-extrabold leading-none text-[#C1077B]">
                      <CountUp to={1000} suffix="+" durationMs={1500} />
                    </p>
                    <p className="mt-6 text-[clamp(13px,1.2vw,18px)] text-[#667085]">Học viên đang học</p>
                  </div>
                  <div>
                    <p className="text-[clamp(16px,1.7vw,24px)] font-semibold text-slate-700">Giáo viên chuyên môn</p>
                    <p className="mt-6 text-[clamp(56px,6vw,96px)] font-extrabold leading-none text-[#C1077B]">
                      <CountUp to={25} suffix="+" durationMs={1500} />
                    </p>
                    <p className="mt-6 text-[clamp(13px,1.2vw,18px)] text-[#667085]">Giáo viên có từ 5 năm kinh nghiệm</p>
                  </div>
                  <div>
                    <p className="text-[clamp(16px,1.7vw,24px)] font-semibold text-slate-700">Tiến bộ rõ rệt</p>
                    <p className="mt-6 text-[clamp(56px,6vw,96px)] font-extrabold leading-none text-[#C1077B]">
                      <CountUp to={98} suffix="%" durationMs={1500} />
                    </p>
                    <p className="mt-6 text-[clamp(13px,1.2vw,18px)] text-[#667085]">Học viên cảm nhận thực tế</p>
                  </div>
                  <div>
                    <p className="text-[clamp(16px,1.7vw,24px)] font-semibold text-slate-700">Ứng dụng công nghệ</p>
                    <p className="mt-6 text-[clamp(56px,6vw,96px)] font-extrabold leading-none text-[#C1077B]">
                      <CountUp to={90} suffix="%" durationMs={1500} />
                    </p>
                    <p className="mt-6 text-[clamp(13px,1.2vw,18px)] text-[#667085]">Áp dụng công nghệ mới trong dạy học</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Slide 5 (adult): Teacher stats view */}
        {selectedAge === "adult" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-white text-slate-900 lg:hidden">
            <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
              {/* Top bar */}
              <MobileHeader
                logoSrc="/assets/svg/logo.png"
                logoAlt="Telesa English logo"
                logoWrapperClassName="relative h-[50px] w-[50px] shrink-0"
                logoImageSize={50}
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
                menuLineClassName="bg-white"
              />

              {/* Center stats */}
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <p className="text-base font-semibold tracking-wide text-slate-700">
                  Giảng viên chuyên môn
                </p>
                <p className="mt-4 text-[72px] font-extrabold leading-none text-[#C1077B]">
                  <CountUp to={25} suffix="+" durationMs={1500} />
                </p>
                <p className="mt-5 text-base font-medium text-slate-700">
                  Giảng viên có trên 5 năm kinh nghiệm
                </p>
              </div>

              {/* Floating actions */}
              <div className="mt-auto flex items-end justify-end pb-1">
                <MobileFloatingActions variant="adult" tone="soft" onScrollToTop={scrollToTop} />
              </div>
            </div>
          </section>
        )}

        {/* Slide 6 (adult): Progress view */}
        {selectedAge === "adult" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-[#273143] text-white lg:hidden">
            <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
              {/* Top bar */}
              <MobileHeader
                logoSrc="/assets/svg/logo.png"
                logoAlt="Telesa English logo"
                logoWrapperClassName="relative h-[50px] w-[50px] shrink-0"
                logoImageSize={50}
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-white bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-white"
                menuLineClassName="bg-white"
              />

              {/* Center stats */}
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <p className="text-base font-semibold tracking-wide text-white">
                  Tiến bộ rõ rệt
                </p>
                <p className="mt-4 text-[72px] font-extrabold leading-none text-[#C1077B]">
                  <CountUp to={98} suffix="%" durationMs={1500} />
                </p>
                <p className="mt-5 text-base font-medium text-white">
                  Học viên cảm nhận thực tế
                </p>
              </div>

              {/* Floating actions */}
              <div className="mt-auto flex items-end justify-end pb-1">
                <MobileFloatingActions variant="adult" tone="slate" onScrollToTop={scrollToTop} />
              </div>
            </div>
          </section>
        )}

        {/* Slide 7 (adult): Technology application view */}
        {selectedAge === "adult" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-white text-slate-900 lg:hidden">
            <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
              {/* Top bar */}
              <MobileHeader
                logoSrc="/assets/svg/logo.png"
                logoAlt="Telesa English logo"
                logoWrapperClassName="relative h-[50px] w-[50px] shrink-0"
                logoImageSize={50}
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
                menuLineClassName="bg-white"
              />

              {/* Center stats */}
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <p className="text-base font-semibold tracking-wide text-slate-700">
                  Ứng dụng công nghệ
                </p>
                <p className="mt-4 text-[72px] font-extrabold leading-none text-[#C1077B]">
                  <CountUp to={90} suffix="%" durationMs={1500} />
                </p>
                <p className="mt-5 text-base font-medium text-slate-700">
                  Áp dụng công nghệ mới trong dạy học
                </p>
              </div>

              {/* Floating actions */}
              <div className="mt-auto flex items-end justify-end pb-1">
                <MobileFloatingActions variant="adult" tone="soft" onScrollToTop={scrollToTop} />
              </div>
            </div>
          </section>
        )}

        {/* Slide 8 (adult mobile): Library teaser view (5 sub-slides) */}
        {selectedAge === "adult" && (
          <section
            id="adult-library-teaser"
            className="relative flex telesa-min-vh-100 w-full snap-start items-stretch justify-center overflow-hidden bg-black text-white lg:hidden"
            style={{ touchAction: "pan-y" }}
            {...adultWhyMobileSwipe}
          >
            <Image
              src={adultWhySlidesMobile[adultWhyMobileIndex].image}
              alt="Telesa English Adult learning"
              fill
              priority
              quality={100}
              unoptimized
              sizes="100vw"
              className="pointer-events-none select-none object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/25" />

            <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8">
              {/* Top bar */}
              <MobileHeader
                className="gap-2"
                logoSrc="/assets/svg/logo.png"
                logoAlt="Telesa English logo"
                logoWrapperClassName="relative h-[50px] w-[50px] shrink-0"
                logoImageSize={50}
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-white bg-black/30 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-sm"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-black/40 text-white shadow-sm backdrop-blur-sm"
                menuLineClassName="bg-white"
              />

              <div
                className={`mt-12 flex flex-1 flex-col justify-end pb-10 transform-gpu transition-all duration-300 ease-out ${adultWhyMobileTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}
              >
                <p className="whitespace-pre-line text-left text-2xl font-medium leading-8 text-white">
                  {adultWhySlidesMobile[adultWhyMobileIndex].title}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          sessionStorage.setItem(
                            "telesa:returnContext",
                            JSON.stringify({
                              kind: "landing",
                              selectedAge: "adult",
                              anchorId: "adult-library-teaser",
                            }),
                          );
                        } catch { }
                        router.push(adultWhySlidesMobile[adultWhyMobileIndex].href);
                      }}
                      className="inline-flex items-center justify-center gap-1 rounded-[36px] border-2 border-white bg-white/5 px-4 py-2 text-[14px] font-medium text-white shadow-[0_2px_4px_rgba(0,0,0,0.10)]"
                    >
                      Chi tiết
                    </button>
                    <div className="flex items-center gap-2">
                      {adultWhySlidesMobile.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => changeAdultWhyMobileSlide(index)}
                          className={`h-1.5 rounded-full transition-all ${adultWhyMobileIndex === index
                              ? "w-4 bg-[#C1077B]"
                              : "w-3 bg-white/70"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <MobileFloatingActions variant="adult" tone="darkGlass" onScrollToTop={scrollToTop} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Slide 8 (adult): FAQ slider view */}
        {selectedAge === "adult" && (
          <section
            id="adult-library-teaser-desktop"
            className="relative hidden telesa-vh-100 w-full snap-start items-stretch justify-center overflow-hidden lg:flex"
            style={{ touchAction: "pan-y" }}
            {...adultView8Swipe}
          >
            <Image
              src={adultView8Slides[adultView8Index].image}
              alt="Telesa English background"
              fill
              priority
              quality={100}
              unoptimized
              sizes="100vw"
              className="pointer-events-none select-none object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/30 lg:bg-black/20" />

            <div className="relative z-10 h-full w-full">
              <div className="absolute bottom-[18vh] left-4 right-4 text-white lg:left-[8vw] lg:right-auto lg:bottom-[18vh]">
                <h2
                  className={`whitespace-pre-line text-[34px] font-semibold leading-[1.05] tracking-tight sm:text-[44px] lg:text-[56px] transform-gpu transition-all duration-300 ease-out ${adultView8TextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}
                >
                  {adultView8Slides[adultView8Index].title}
                </h2>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        sessionStorage.setItem(
                          "telesa:returnContext",
                          JSON.stringify({
                            kind: "landing",
                            selectedAge: "adult",
                            anchorId: "adult-library-teaser-desktop",
                          }),
                        );
                      } catch { }
                      router.push(adultView8Slides[adultView8Index].href);
                    }}
                    className="inline-flex items-center justify-center gap-1 rounded-[36px] border-2 border-white bg-white/5 px-4 py-2 text-[14px] font-medium text-white shadow-[0_2px_4px_rgba(0,0,0,0.10)] transition-colors hover:bg-white/10"
                  >
                    Chi tiết
                  </button>
                </div>

                <div className="mt-10 flex items-center gap-4 lg:mt-12">
                  {adultView8Slides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => changeAdultView8Slide(index)}
                      className={`h-1.5 rounded-full transition-all ${index === adultView8Index ? "w-12 bg-[#C1077B]" : "w-12 bg-white/70"
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Slide 9 (adult): Testimonials view */}
        {selectedAge === "adult" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-[#273143] text-white lg:bg-[#F8F9FA] lg:text-slate-900">
            {/* Mobile */}
            <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8 lg:hidden">
              {/* Top bar */}
              <MobileHeader
                logoSrc="/assets/svg/logo.png"
                logoAlt="Telesa English logo"
                logoWrapperClassName="relative h-[50px] w-[50px] shrink-0"
                logoImageSize={50}
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-white/80 bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-white"
                menuLineClassName="bg-white"
              />

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
                <div className="rounded-[26px] bg-white px-4 py-4 text-slate-700 shadow-md">
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
                      <div className="mt-1 text-[12px] text-[#C1077B]">
                        {"★★★★★"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[26px] bg-white px-4 py-4 text-slate-700 shadow-md">
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
                      <div className="mt-1 text-[12px] text-[#C1077B]">
                        {"★★★★★"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating actions */}
              <div className="pointer-events-none absolute bottom-6 right-6">
                <div className="pointer-events-auto">
                  <MobileFloatingActions variant="adult" tone="slate" onScrollToTop={scrollToTop} />
                </div>
              </div>
            </div>

            {/* Desktop */}
            <div className="relative z-10 hidden h-full w-full flex-col lg:flex">
              <div className="w-full px-[8vw] pt-[12vh] text-center">
                <h2 className="text-[44px] font-extrabold tracking-tight text-slate-700">
                  Cảm Nhận Học Viên
                </h2>
                <p className="mt-3 text-lg text-[#667085]">
                  Đánh giá và chia sẻ thực tế từ học viên
                </p>
              </div>

              <div
                className="mt-14 w-full flex-1 select-none overflow-x-auto pb-[10vh] cursor-grab active:cursor-grabbing"
                style={
                  {
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    touchAction: "pan-y",
                  } as React.CSSProperties
                }
                {...adultTestimonialsDrag}
              >
                <div className="flex w-max items-stretch gap-10 px-[8vw] snap-x snap-mandatory">
                  {kidTestimonials.map((t, index) => (
                    <article
                      key={`adult-${t.name}-${index}`}
                      className="grid h-[55vh] max-h-[55vh] w-[23vw] grid-rows-[1fr_auto] rounded-[32px] border border-slate-100 bg-white p-[clamp(28px,3.2vh,40px)] shadow-sm snap-center"
                    >
                      <p className="self-center text-[clamp(16px,2vh,22px)] leading-relaxed text-slate-700">
                        {t.content}
                      </p>

                      <div className="flex items-center gap-5">
                        <div className="h-[clamp(52px,6vh,72px)] w-[clamp(52px,6vh,72px)] rounded-full bg-slate-200" />
                        <div className="text-left">
                          <p className="text-[clamp(18px,2.4vh,26px)] font-bold text-slate-700">
                            {t.name}
                          </p>
                          <p className="mt-1 text-[clamp(12px,1.4vh,14px)] text-[#667085]">
                            {t.date}
                          </p>
                          <div className="mt-2 text-[clamp(12px,1.6vh,16px)] text-[#C1077B]">
                            {"★★★★★"}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Slide 10 (adult): Global connections view */}
        {selectedAge === "adult" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-[#273143] text-white">
            {/* Mobile */}
            <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8 lg:hidden">
              {/* Top bar */}
              <MobileHeader
                logoSrc="/assets/svg/logo.png"
                logoAlt="Telesa English logo"
                logoWrapperClassName="relative h-[50px] w-[50px] shrink-0"
                logoImageSize={50}
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-white/80 bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-white"
                menuLineClassName="bg-white"
              />

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
                <MobileFloatingActions variant="adult" tone="slate" onScrollToTop={scrollToTop} />
              </div>
            </div>

            {/* Desktop */}
            <div className="relative z-10 hidden h-full w-full flex-col lg:flex">
              <div className="w-full px-[8vw] pt-[10vh] text-center">
                <h2 className="text-[45px] font-extrabold leading-[1.05] tracking-tight">
                  Kết nối học viên trên toàn thế giới cùng Telesa English!
                </h2>
                <p className="mx-auto mt-5 max-w-[820px] text-[20px] leading-relaxed text-slate-100">
                  Dù bạn ở đâu, Telesa English luôn đồng hành cùng bạn trên hành trình
                  chinh phục tiếng Anh.
                </p>
              </div>

              <div className="mt-12 flex min-h-0 flex-1 items-center justify-center px-[8vw] pb-[10vh]">
                <div className="h-full max-h-[70vh] w-full max-w-[1200px]">
                  <KidWorldMap variant="desktop" className="h-full" highlightColor="#C1077B" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Slide 11 (adult): Consultation form view */}
        {selectedAge === "adult" && (
          <section
            id="consultation-adult"
            className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center overflow-hidden bg-black text-white"
          >
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

            {/* Mobile */}
            <div className="relative z-10 flex h-full w-full max-w-md flex-col items-center px-4 pb-3 pt-5 lg:hidden">
              {/* Top bar */}
              <MobileHeader
                className="w-full text-left gap-3"
                logoSrc="/assets/svg/logo.png"
                logoAlt="Telesa English logo"
                logoWrapperClassName="relative h-[50px] w-[50px] shrink-0"
                logoImageSize={50}
                logoPriority
                onMenuOpen={() => setIsMenuOpen(true)}
                onCtaClick={goToTest}
                ctaClassName="rounded-full border border-white/80 bg-black/20 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md"
                menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-black/20 text-white shadow-sm backdrop-blur-md"
                menuLineClassName="bg-white"
              />

              <div className="flex w-full flex-1 flex-col items-center justify-center pb-16">
                <div className="mx-auto w-[80vw] max-w-full text-center">
                  <h2 className="text-[26px] font-extrabold leading-[1.05] tracking-tight text-white">
                    Form Đăng Ký Tư Vấn
                  </h2>
                  <p className="mt-2 text-[13px] font-medium leading-snug text-white/90">
                    Mở form để nhập thông tin tư vấn
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openConsultOverlay}
                  className="mt-6 w-[80vw] max-w-full rounded-[14px] bg-[#D40887] px-4 py-3 text-center text-[15px] font-extrabold text-white shadow-[0_14px_28px_rgba(0,0,0,0.22)] active:scale-[0.99]"
                >
                  Mở form tư vấn
                </button>
              </div>

              <button
                type="button"
                onClick={scrollToTop}
                className="absolute bottom-5 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md"
                aria-label="Lên đầu trang"
              >
                <ArrowUpIcon size={20} className="h-5 w-5" />
              </button>
            </div>

            {/* Desktop */}
            <div className="relative z-10 mt-[80px] hidden h-[calc(100dvh-80px)] w-full flex-col items-center justify-center px-[8vw] py-[min(4vh,32px)] lg:flex">
              <div className="w-full max-w-[920px] text-center">
                <h2 className="text-[clamp(29px,4vh,37px)] font-extrabold leading-[1.05] tracking-tight text-white">
                  Form Đăng Ký Tư Vấn
                </h2>
                <p className="mx-auto mt-[min(1.45vh,9px)] max-w-[760px] text-[clamp(12px,1.75vh,14px)] font-medium leading-relaxed text-white/90">
                  Để lại thông tin của bạn, chúng tôi sẽ liên hệ để tư vấn ngay!
                </p>
              </div>

              <form
                className="mt-[min(2.9vh,22px)] flex w-full max-w-[920px] flex-col gap-[min(1.7vh,14px)]"
                onSubmit={onSubmitConsultation}
              >
                <div className="space-y-2 text-left">
                  <label className="block text-[13px] font-semibold text-white">Tên</label>
                  <input
                    value={kidConsultName}
                    onChange={(e) => setKidConsultName(e.target.value)}
                    placeholder="Nhập tên của bạn"
                    className="h-[clamp(35px,4.2vh,40px)] w-full rounded-[16px] bg-white/55 px-4 text-left text-[13px] text-slate-700 shadow-[0_12px_28px_rgba(0,0,0,0.22)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/70"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-[13px] font-semibold text-white">Email</label>
                  <input
                    value={kidConsultEmail}
                    onChange={(e) => setKidConsultEmail(e.target.value)}
                    placeholder="you@company.com"
                    inputMode="email"
                    className="h-[clamp(35px,4.2vh,40px)] w-full rounded-[16px] bg-white/55 px-4 text-left text-[13px] text-slate-700 shadow-[0_12px_28px_rgba(0,0,0,0.22)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/70"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-[13px] font-semibold text-white">
                    Hình thức liên hệ
                  </label>
                  <div className="relative">
                    <select
                      value={kidConsultContactMethod}
                      onChange={(e) => setKidConsultContactMethod(e.target.value as any)}
                      className="h-[clamp(35px,4.2vh,40px)] w-full appearance-none rounded-[16px] bg-white/55 px-4 pr-9 text-left text-[13px] text-slate-700 shadow-[0_12px_28px_rgba(0,0,0,0.22)] outline-none backdrop-blur-md focus:bg-white/70"
                    >
                      <option value="zalo">Zalo</option>
                      <option value="phone">Điện thoại</option>
                      <option value="email">Email</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                      <span className="text-[13px] text-slate-600">⌄</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-[13px] font-semibold text-white">Số Zalo</label>
                  <div className="flex h-[clamp(35px,4.2vh,40px)] w-full overflow-hidden rounded-[16px] bg-white/55 shadow-[0_12px_28px_rgba(0,0,0,0.22)] backdrop-blur-md">
                    <div className="flex items-center gap-2 px-4 text-[13px] text-slate-700">
                      <select
                        value={kidConsultZaloCountry}
                        onChange={(e) => setKidConsultZaloCountry(e.target.value as any)}
                        className="appearance-none bg-transparent font-semibold outline-none"
                      >
                        <option value="VN">VN</option>
                      </select>
                      <span className="text-slate-600">⌄</span>
                    </div>
                    <div className="my-2 w-px bg-white/55" />
                    <div className="flex flex-1 items-center px-4">
                      <span className="mr-2 text-[13px] text-slate-600">+84</span>
                      <input
                        value={kidConsultZaloNumber}
                        onChange={(e) => setKidConsultZaloNumber(e.target.value)}
                        placeholder="(555) 000-0000"
                        inputMode="tel"
                        className="h-full w-full bg-transparent text-left text-[13px] text-slate-700 outline-none placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[13px] font-semibold text-white">
                    Vấn đề cần tư vấn
                  </label>
                  <textarea
                    value={kidConsultTopic}
                    onChange={(e) => setKidConsultTopic(e.target.value)}
                    placeholder="Bạn muốn chúng tôi hỗ trợ thêm về vấn đề gì"
                    rows={3}
                    className="h-[clamp(64px,12.5vh,92px)] w-full resize-none rounded-[16px] bg-white/55 px-4 py-2.5 text-left text-[13px] text-slate-700 shadow-[0_12px_28px_rgba(0,0,0,0.22)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/70"
                  />
                </div>

                <label className="mt-1 flex items-start gap-3 text-left text-[13px] text-white/90">
                  <input
                    type="checkbox"
                    checked={kidConsultAgree}
                    onChange={(e) => setKidConsultAgree(e.target.checked)}
                    className="mt-1 h-[18px] w-[18px] rounded-md border-2 border-white/80 bg-transparent accent-white"
                  />
                  <span className="leading-snug">
                    Bạn đồng ý với tất cả điều khoản bảo mật của Telesa
                  </span>
                </label>

                <div className="mt-3 flex justify-center">
                  <button
                    type="submit"
                    disabled={!kidConsultAgree || isConsultSubmitting}
                    className="h-[clamp(40px,5.3vh,44px)] w-full max-w-[506px] rounded-[16px] bg-[#C1077B] text-center text-[15px] font-extrabold text-white shadow-[0_14px_34px_rgba(0,0,0,0.24)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-100 disabled:brightness-95"
                  >
                    {isConsultSubmitting ? "Đang gửi..." : "Gửi"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Slide 12 (adult): Contact options view */}
        {selectedAge === "adult" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-white text-slate-900">
            {/* Mobile */}
            <div className="relative z-10 flex h-full w-full max-w-md flex-col px-4 pb-6 pt-8 lg:hidden">
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
                <button type="button" aria-label="Open menu" onClick={() => setIsMenuOpen(true)} className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-slate-700">
                  <span className="block h-[2px] w-4 rounded-full bg-slate-800" />
                  <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-800" />
                  <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-800" />
                </button>
              </div>

              {/* Heading */}
              <div className="mt-6 text-center">
                <h2 className="text-[28px] font-extrabold leading-[1.1] tracking-tight text-slate-700">
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
              <div className="mt-5 flex flex-1 flex-col justify-center gap-2 pb-5">
                <a
                  href={ZALO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Mở Zalo"
                  className="rounded-[24px] bg-[#E6F7FE] px-5 py-3 transition-transform active:scale-[0.99]"
                >
                  <Image
                    src="/assets/svg/zalo.svg"
                    alt="Zalo"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                  <h3 className="mt-2 text-[22px] font-extrabold text-slate-700">
                    Zalo
                  </h3>
                  <p className="mt-1 text-[14px] font-medium leading-snug text-slate-500">
                    Liên hệ với chúng tôi qua Zalo
                  </p>
                </a>

                <a
                  href={MESSENGER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Mở Messenger"
                  className="rounded-[24px] bg-[#FFF5FB] px-5 py-3 transition-transform active:scale-[0.99]"
                >
                  <Image
                    src="/assets/svg/messenger.svg"
                    alt="Messenger"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                  <h3 className="mt-2 text-[22px] font-extrabold text-slate-700">
                    Messenger
                  </h3>
                  <p className="mt-1 text-[14px] font-medium leading-snug text-slate-500">
                    Nhắn tin với chúng tôi ngay
                  </p>
                </a>

                <div className="rounded-[24px] bg-[#F4FCE8] px-5 py-3">
                  <Image
                    src="/assets/svg/whatsapp.svg"
                    alt="Whatsapp"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                  />
                  <h3 className="mt-2 text-[22px] font-extrabold text-slate-700">
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
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md"
                    aria-label="Lên đầu trang"
                  >
                    <ArrowUpIcon size={20} className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop */}
            <div className="relative z-10 mt-[80px] hidden h-[calc(100dvh-80px)] w-full flex-col items-center justify-center px-[8vw] py-[min(4.8vh,45px)] lg:flex">
              <div className="w-full max-w-[1100px] text-center">
                <h2 className="text-[48px] font-extrabold tracking-tight text-slate-700">
                  Hoặc Liên Hệ Ngay Để Nhận Tư Vấn
                </h2>
                <p className="mx-auto mt-4 max-w-[760px] text-[20px] font-medium text-slate-500">
                  Chúng tôi sẽ liên hệ lại ngay để tư vấn tận tình
                </p>
              </div>

              <div className="mt-[min(5.6vh,51px)] w-full max-w-[1180px]">
                <div className="grid grid-cols-3 gap-12">
                  <a
                    href={ZALO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Mở Zalo"
                    className="rounded-[40px] bg-[#E6F7FE] p-10 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex h-14 w-14 items-center justify-center bg-transparent shadow-none">
                      <Image
                        src="/assets/svg/zalo.svg"
                        alt="Zalo"
                        width={44}
                        height={44}
                        className="h-10 w-10"
                      />
                    </div>
                    <h3 className="mt-8 text-[34px] font-extrabold text-slate-700">
                      Zalo
                    </h3>
                    <p className="mt-3 text-[18px] font-medium text-slate-600">
                      Liên hệ với chúng tôi qua Zalo
                    </p>
                  </a>

                  <a
                    href={MESSENGER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Mở Messenger"
                    className="rounded-[40px] bg-[#FFF5FB] p-10 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="flex h-14 w-14 items-center justify-center bg-transparent shadow-none">
                      <Image
                        src="/assets/svg/messenger.svg"
                        alt="Messenger"
                        width={44}
                        height={44}
                        className="h-10 w-10"
                      />
                    </div>
                    <h3 className="mt-8 text-[34px] font-extrabold text-slate-700">
                      Messenger
                    </h3>
                    <p className="mt-3 text-[18px] font-medium text-slate-600">
                      Nhắn tin với chúng tôi ngay
                    </p>
                  </a>

                  <div className="rounded-[40px] bg-[#F4FCE8] p-10">
                    <div className="flex h-14 w-14 items-center justify-center bg-transparent shadow-none">
                      <Image
                        src="/assets/svg/whatsapp.svg"
                        alt="Whatsapp"
                        width={44}
                        height={44}
                        className="h-10 w-10"
                      />
                    </div>
                    <h3 className="mt-8 text-[34px] font-extrabold text-slate-700">
                      Whatsapp
                    </h3>
                    <p className="mt-3 text-[18px] font-medium text-slate-600">
                      Liên hệ với chúng tôi qua Whatsapp
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* Slide 13 (adult desktop): TELESA view */}
        {selectedAge === "adult" && (
          <section className="relative hidden telesa-vh-100 w-full snap-start items-stretch justify-center overflow-hidden bg-black lg:flex">
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
              className="absolute inset-x-0 bottom-0 top-[80px] z-10"
              onPointerDown={startTeleSaDesktopDrag}
              style={{ touchAction: "none" }}
            >
              {teleSaDesktopMaskBaseHeightPx > 0 && (
                <div
                  className={`pointer-events-none absolute bottom-0 left-0 right-0 z-30 ${teleSaDesktopIsDragging ? "" : "transition-[height] duration-600 ease-out"
                    }`}
                  style={{
                    height: Math.max(0, teleSaDesktopMaskBaseHeightPx + teleSaDesktopOffsetPx / 2),
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
                className={`absolute left-0 right-0 ${teleSaDesktopIsDragging ? "" : "transition-transform duration-600 ease-out"
                  }`}
                style={{
                  bottom: "10vh",
                  transform: `translateY(${teleSaDesktopOffsetPx}px)`,
                  zIndex: 20,
                }}
              >
                <div className="flex w-full items-end justify-center pb-2">
                  <div
                    ref={teleSaDesktopTextRef}
                    role="button"
                    tabIndex={0}
                    onPointerDown={startTeleSaDesktopDrag}
                    onClick={toggleTeleSaDesktopReveal}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== " ") return;
                      e.preventDefault();
                      toggleTeleSaDesktopReveal();
                    }}
                    className="w-[80vw] max-w-full cursor-grab select-none whitespace-nowrap text-center text-[clamp(72px,17vw,300px)] font-extrabold leading-none tracking-[0.22em] text-white drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)] active:cursor-grabbing"
                    style={{ touchAction: "none" }}
                  >
                    TELESA
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Slide 13 (adult): TELESA reveal view */}
        {selectedAge === "adult" && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center overflow-hidden bg-black lg:hidden">
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
              className="absolute inset-0 z-10 lg:pointer-events-none"
            >
              {teleSaMaskBaseHeightPx > 0 && (
                <div
                  className={`pointer-events-none absolute bottom-0 left-0 right-0 z-30 ${teleSaIsDragging ? "" : "transition-[height] duration-600 ease-out"
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
                className={`absolute left-0 right-0 ${teleSaIsDragging ? "" : "transition-transform duration-600 ease-out"
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
                    role="button"
                    tabIndex={0}
                    onPointerDown={startTeleSaDrag}
                    onClick={toggleTeleSaReveal}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== " ") return;
                      e.preventDefault();
                      toggleTeleSaReveal();
                    }}
                    className="w-[90vw] max-w-full cursor-grab select-none whitespace-nowrap text-center text-[72px] font-extrabold leading-none tracking-[0.22em] text-white drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)] active:cursor-grabbing"
                    style={{ touchAction: "none" }}
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
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md"
                  aria-label="Lên đầu trang"
                >
                  <ArrowUpIcon size={20} className="h-5 w-5" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Slide 14 (adult): Footer contact view */}
        {selectedAge === "adult" && (
          <FooterContactView
            variant="adult"
            logoSrc={logoSrc}
            onMenuOpen={() => setIsMenuOpen(true)}
            onScrollToTop={scrollToTop}
            onCtaClick={goToTest}
            onNavigate={(key) => {
              if (key === "home") scrollToTop();
            }}
          />
        )}
      </main>
    </>
  );
}