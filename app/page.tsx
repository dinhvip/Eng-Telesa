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

// GSAP – loaded dynamically to avoid SSR issues
type GsapModule = typeof import("gsap");
type ScrollTriggerModule = typeof import("gsap/ScrollTrigger");

import Slide2FollowUp from "./components/landing-slides/Slide2FollowUp";
import Slide3Carousel from "./components/landing-slides/Slide3Carousel";
import SlideStats from "./components/landing-slides/SlideStats";
import SlideLibraryTeaser from "./components/landing-slides/SlideLibraryTeaser";
import SlideTestimonials from "./components/landing-slides/SlideTestimonials";
import SlideMap from "./components/landing-slides/SlideMap";
import SlideConsultation from "./components/landing-slides/SlideConsultation";
import SlideContact from "./components/landing-slides/SlideContact";
import SlideTelesaReveal from "./components/landing-slides/SlideTelesaReveal";

export default function LandingPage() {
  const router = useRouter();
  const mainRef = useRef<HTMLElement | null>(null);
  const slide1VideoRef = useRef<PreloadedBackgroundVideoSetHandle | null>(null);
  const slide2VideoRef = useRef<BackgroundVideoHandle | null>(null);
  const preloadedVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [selectedAge, setSelectedAge] = useState<"kid" | "adult" | null>(null);
  const [isAgeSwitchLocked, setIsAgeSwitchLocked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const isLogged = document.cookie.includes("auth_token=");
    setIsLoggedIn(isLogged);
    if (isLogged) {
      try {
        const stored = localStorage.getItem("telesa_user_info");
        if (stored) {
          const parsed = JSON.parse(stored);
          let ageMode: "kid" | "adult" = "adult";
          if (parsed.birthday) {
            const ageYear = new Date().getFullYear() - new Date(parsed.birthday).getFullYear();
            ageMode = ageYear < 16 ? "kid" : "adult";
          }
          setSelectedAge(ageMode);
          preloadVideo(ageMode === "kid" ? "/assets/2-kid.mp4" : "/assets/2-adult.mp4");
        }
      } catch (e) { }
    }
    setIsAuthChecking(false);
  }, []);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSnapIndex, setActiveSnapIndex] = useState(0);
  ;
  const [adultView8Index, setAdultView8Index] = useState(0);
  const [adultWhyMobileIndex, setAdultWhyMobileIndex] = useState(0);
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

  const teleSaDesktopTextRef = useRef<HTMLDivElement | null>(null);
  const [teleSaDesktopOffsetPx, setTeleSaDesktopOffsetPx] = useState(0);
  const [teleSaDesktopMaxOffsetPx, setTeleSaDesktopMaxOffsetPx] = useState(0);

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

  const logoSrc =
    selectedAge === "kid"
      ? "/assets/logo.png"
      : "/assets/svg/logo.png";

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

  // ── GSAP scroll animations ────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const scroller = mainRef.current;
    if (!scroller) return;

    let killed = false;
    let cleanupFns: Array<() => void> = [];

    Promise.all([
      import("gsap").then((m) => m.gsap ?? (m as any).default),
      import("gsap/ScrollTrigger").then((m) => m.ScrollTrigger ?? (m as any).default),
    ]).then(([gsap, ScrollTrigger]) => {
      if (killed) return;

      gsap.registerPlugin(ScrollTrigger);

      // Kill any stale triggers from a previous run
      ScrollTrigger.getAll().forEach((t: any) => t.kill());

      const sections = Array.from(
        scroller.querySelectorAll<HTMLElement>(":scope > section"),
      );

      // ── Hero (Slide 1): staggered entrance on load ──────────────────────
      const hero = sections[0];
      if (hero) {
        const tl = gsap.timeline({ delay: 0.15 });
        const heroH1 = hero.querySelectorAll("h1");
        const heroP = hero.querySelectorAll("p");
        const heroButtons = hero.querySelectorAll("button");
        const heroImgs = hero.querySelectorAll('[class*="aspect-"]');

        if (heroH1.length) {
          tl.from(heroH1, { opacity: 0, y: 36, duration: 0.9, ease: "power3.out" });
        }
        if (heroP.length) {
          tl.from(heroP, { opacity: 0, y: 22, duration: 0.7, stagger: 0.08, ease: "power3.out", clearProps: "all" }, "-=0.6");
        }
        if (heroButtons.length) {
          tl.from(heroButtons, { opacity: 0, y: 18, scale: 0.95, duration: 0.6, stagger: 0.1, ease: "back.out(1.4)", clearProps: "all" }, "-=0.5");
        }
        if (heroImgs.length) {
          tl.from(heroImgs, { opacity: 0, y: 40, scale: 0.94, duration: 0.85, stagger: 0.14, ease: "power3.out", clearProps: "all" }, "-=0.6");
        }
      }

      // ── Remaining sections: fade + slide up on scroll ───────────────────
      sections.slice(1).forEach((section) => {
        gsap.from(section, {
          opacity: 0,
          y: 44,
          duration: 0.72,
          ease: "power3.out",
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: section,
            scroller,
            start: "top 88%",
            once: true,
          },
        });
      });

      // ── Stats cards: scale + bounce in ──────────────────────────────────
      const statItems = scroller.querySelectorAll<HTMLElement>("[data-gsap-stat]");
      statItems.forEach((item, i) => {
        gsap.from(item, {
          opacity: 0,
          y: 55,
          scale: 0.86,
          duration: 0.78,
          delay: i * 0.13,
          ease: "back.out(1.5)",
          clearProps: "all",
          scrollTrigger: {
            trigger: item.closest("section"),
            scroller,
            start: "top 78%",
            once: true,
          },
        });
      });

      // ── Contact cards: slide up with scale ──────────────────────────────
      const contactCards = scroller.querySelectorAll<HTMLElement>("[data-gsap-card]");
      contactCards.forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 64,
          scale: 0.93,
          duration: 0.72,
          delay: i * 0.14,
          ease: "power4.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: card.closest("section"),
            scroller,
            start: "top 76%",
            once: true,
          },
        });
      });

      // ── Testimonial cards: slide from right ─────────────────────────────
      const testimonials = scroller.querySelectorAll<HTMLElement>("[data-gsap-testimonial]");
      testimonials.forEach((item, i) => {
        gsap.from(item, {
          opacity: 0,
          x: 56,
          scale: 0.96,
          duration: 0.68,
          delay: i * 0.11,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: item.closest("section"),
            scroller,
            start: "top 80%",
            once: true,
          },
        });
      });

      // ── Section headings: clip + rise ───────────────────────────────────
      const headings = scroller.querySelectorAll<HTMLElement>("[data-gsap-heading]");
      headings.forEach((h) => {
        gsap.from(h, {
          opacity: 0,
          y: 34,
          duration: 0.78,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: h.closest("section"),
            scroller,
            start: "top 82%",
            once: true,
          },
        });
      });

      cleanupFns.push(() => {
        ScrollTrigger.getAll().forEach((t: any) => t.kill());
      });
    });

    return () => {
      killed = true;
      cleanupFns.forEach((fn) => fn());
    };
  }, [selectedAge]);

  const shouldShowMenu = selectedAge != null && (isLoggedIn || activeSnapIndex > 0);

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

    const measureDesktop = () => {
      const el = teleSaDesktopTextRef.current;
      if (!el) return;
      const height = el.offsetHeight;
      if (!Number.isFinite(height) || height <= 0) return;

      const viewportHeight = window.innerHeight || 0;
      const max = Math.max(0, Math.round(height * (2 / 3)));
      setTeleSaDesktopMaxOffsetPx(max);
      setTeleSaDesktopOffsetPx((prev) => Math.max(-max, Math.min(0, prev)));

    };

    const raf = requestAnimationFrame(measureDesktop);
    window.addEventListener("resize", measureDesktop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measureDesktop);
    };
  }, [selectedAge]);


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
        {isAuthChecking && (
          <section className="relative flex telesa-vh-100 w-full snap-start items-center justify-center overflow-hidden bg-black">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </section>
        )}

        {/* Slide 1: Age selection */}
        {!isAuthChecking && !isLoggedIn && (
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
                <div></div>
              </div>
            </div>
          </section>
        )}

        {/* Slides 2-10 (extracted components) */}
        {selectedAge && (
          <>
            <Slide2FollowUp
              variant={selectedAge}
              videoRef={slide2VideoRef}
              onMenuOpen={() => setIsMenuOpen(true)}
              onCtaClick={goToTest}
              openConsultOverlay={openConsultOverlay}
            />
            <Slide3Carousel
              variant={selectedAge}
              onMenuOpen={() => setIsMenuOpen(true)}
              onCtaClick={goToTest}
              onScrollToTop={scrollToTop}
            />
            <SlideStats
              variant={selectedAge}
              onMenuOpen={() => setIsMenuOpen(true)}
              onCtaClick={goToTest}
              onScrollToTop={scrollToTop}
            />
            <SlideLibraryTeaser
              variant={selectedAge}
              onMenuOpen={() => setIsMenuOpen(true)}
              onCtaClick={goToTest}
              onScrollToTop={scrollToTop}
            />
            <SlideTestimonials
              variant={selectedAge}
              onMenuOpen={() => setIsMenuOpen(true)}
              onCtaClick={goToTest}
              onScrollToTop={scrollToTop}
            />
            <SlideMap
              variant={selectedAge}
              onMenuOpen={() => setIsMenuOpen(true)}
              onCtaClick={goToTest}
              onScrollToTop={scrollToTop}
            />
            <SlideConsultation
              variant={selectedAge}
              onMenuOpen={() => setIsMenuOpen(true)}
              onCtaClick={goToTest}
              onScrollToTop={scrollToTop}
              openConsultOverlay={openConsultOverlay}
              formState={{
                name: kidConsultName,
                setName: setKidConsultName,
                email: kidConsultEmail,
                setEmail: setKidConsultEmail,
                contactMethod: kidConsultContactMethod,
                setContactMethod: setKidConsultContactMethod,
                zaloCountry: kidConsultZaloCountry,
                setZaloCountry: setKidConsultZaloCountry,
                zaloNumber: kidConsultZaloNumber,
                setZaloNumber: setKidConsultZaloNumber,
                topic: kidConsultTopic,
                setTopic: setKidConsultTopic,
                agree: kidConsultAgree,
                setAgree: setKidConsultAgree,
                isSubmitting: isConsultSubmitting,
                onSubmit: onSubmitConsultation,
              }}
            />
            <SlideContact
              variant={selectedAge}
              onMenuOpen={() => setIsMenuOpen(true)}
              onScrollToTop={scrollToTop}
            />
            <SlideTelesaReveal
              onScrollToTop={scrollToTop}
            />
            <FooterContactView
              variant={selectedAge}
              logoSrc={logoSrc}
              onMenuOpen={() => setIsMenuOpen(true)}
              onScrollToTop={scrollToTop}
              onCtaClick={goToTest}
              onNavigate={(key) => {
                if (key === "home") scrollToTop();
                // if (key === "products") router.push(`/product?variant=${selectedAge ?? "kid"}`);
              }}
            />
          </>
        )}

      </main>
    </>
  );
}