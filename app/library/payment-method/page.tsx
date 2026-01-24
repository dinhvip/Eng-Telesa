"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import DesktopNavbar from "../../components/DesktopNavbar";
import FooterContactView from "../../components/FooterContactView";
import MobileFloatingActions from "../../components/MobileFloatingActions";
import MobileHeader from "../../components/MobileHeader";
import MobileMenuDrawer from "../../components/MobileMenuDrawer";

const PAYMENT_SLIDES = [
  { src: "/assets/payment1.png", alt: "Hình thức thanh toán 1" },
  { src: "/assets/payment2.png", alt: "Hình thức thanh toán 2" },
  { src: "/assets/payment3.png", alt: "Hình thức thanh toán 3" },
  { src: "/assets/payment4.png", alt: "Hình thức thanh toán 4" },
  { src: "/assets/payment5.png", alt: "Hình thức thanh toán 5" },
];

export default function PaymentMethodPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const introViewRef = useRef<HTMLElement | null>(null);
  const paymentSlidesViewRef = useRef<HTMLElement | null>(null);
  const desktopPaymentSlidesViewRef = useRef<HTMLElement | null>(null);
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);
  const desktopCarouselRef = useRef<HTMLDivElement | null>(null);
  const mobileUserInteractedAtRef = useRef<number>(0);
  const desktopUserInteractedAtRef = useRef<number>(0);
  const mobileIndexRef = useRef<number>(0);
  const desktopIndexRef = useRef<number>(0);
  const [isMobileSlidesInView, setIsMobileSlidesInView] = useState(false);
  const [isDesktopSlidesInView, setIsDesktopSlidesInView] = useState(false);

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };

  const scrollToTop = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    if (typeof window === "undefined") return;

    const mobileSection = paymentSlidesViewRef.current;
    const desktopSection = desktopPaymentSlidesViewRef.current;
    if (!mobileSection && !desktopSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === mobileSection) setIsMobileSlidesInView(entry.isIntersecting);
          if (entry.target === desktopSection) setIsDesktopSlidesInView(entry.isIntersecting);
        }
      },
      { threshold: 0.45 },
    );

    if (mobileSection) observer.observe(mobileSection);
    if (desktopSection) observer.observe(desktopSection);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isMobileSlidesInView) return;

    const container = mobileCarouselRef.current;
    if (!container) return;

    const intervalMs = 2000;
    const pauseAfterInteractionMs = 4000;

    const tick = () => {
      const now = Date.now();
      if (now - mobileUserInteractedAtRef.current < pauseAfterInteractionMs) return;
      const slides = Array.from(container.querySelectorAll<HTMLElement>("[data-payment-slide]"));
      if (slides.length === 0) return;
      mobileIndexRef.current = (mobileIndexRef.current + 1) % slides.length;
      slides[mobileIndexRef.current]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    };

    const t = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(t);
  }, [isMobileSlidesInView]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isDesktopSlidesInView) return;

    const container = desktopCarouselRef.current;
    if (!container) return;

    const intervalMs = 2000;
    const pauseAfterInteractionMs = 4000;

    const tick = () => {
      const now = Date.now();
      if (now - desktopUserInteractedAtRef.current < pauseAfterInteractionMs) return;
      const slides = Array.from(container.querySelectorAll<HTMLElement>("[data-payment-slide]"));
      if (slides.length === 0) return;
      desktopIndexRef.current = (desktopIndexRef.current + 1) % slides.length;
      slides[desktopIndexRef.current]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    };

    const t = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(t);
  }, [isDesktopSlidesInView]);

  return (
    <main className="relative min-h-[100dvh] bg-white text-slate-900">
      <DesktopNavbar
        variant="adult"
        logoSrc="/assets/svg/logo.png"
        activeKey="library"
        backgroundClassName="bg-[#273143]/70 backdrop-blur-md"
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
        activeKey="library-payment-method"
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
      <div className="lg:hidden">
        <section
          ref={introViewRef}
          className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-6 pt-8"
        >
          <MobileHeader
            logoSrc="/assets/svg/logo.png"
            logoAlt="Telesa English logo"
            logoWrapperClassName="relative h-[50px] w-[50px] shrink-0"
            logoImageSize={50}
            logoPriority
            ctaClassName="rounded-full border border-slate-400 bg-white px-5 py-2 text-xs font-medium text-slate-700 shadow-sm"
            menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-slate-900"
            menuLineClassName="bg-slate-900"
            onMenuOpen={() => setIsMenuOpen(true)}
            onCtaClick={() => router.push("/test?variant=adult")}
          />

          <div className="flex flex-1 flex-col">
            <h1 className="mt-10 text-center text-[24px] font-semibold leading-tight tracking-tight text-[#313A4C]">
              Phương thức thanh toán tại
              <br />
              Telesa English
            </h1>

            <ul className="mt-8 space-y-5 text-[16px] leading-snug text-[#313A4C]">
              <li className="flex gap-3">
                <span className="mt-[10px] inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-[#313A4C]" />
                <p>
                  Khi đăng ký học tại Telesa English, bạn{" "}
                  <span className="font-semibold">không chỉ được cam kết về chất lượng giảng dạy</span>{" "}
                  mà còn được hỗ trợ tối đa về phương thức thanh toán.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="mt-[10px] inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-[#313A4C]" />
                <p>Chúng tôi hiểu rằng học viên ở mỗi nơi, mỗi hoàn cảnh đều có nhu cầu khác nhau.</p>
              </li>
              <li className="flex gap-3">
                <span className="mt-[10px] inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-[#313A4C]" />
                <p>
                  Chính vì vậy, Telesa English cung cấp{" "}
                  <span className="font-semibold">nhiều hình thức thanh toán và trả góp linh hoạt.</span>
                </p>
              </li>
            </ul>

            <div className="mt-10 overflow-hidden rounded-[6px]">
              <div className="relative h-[25vh] w-full">
                <Image
                  src="/assets/payment.jpg"
                  alt="Học viên Telesa English"
                  fill
                  sizes="420px"
                  className="object-cover"
                  priority={false}
                />
              </div>
            </div>

	            <div className="mt-10 flex justify-center">
	              <button
	                type="button"
	                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D40887] px-5 py-3 text-[12px] font-semibold text-white shadow-[0_2px_4px_0_rgba(0,0,0,0.10)]"
	                onClick={() =>
	                  paymentSlidesViewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
	                }
	              >
                <span>Xem các hình thức thanh toán</span>
                <Image src="/assets/svg/arrow-down.svg" alt="" width={16} height={16} />
              </button>
            </div>
          </div>
        </section>

        <section
          ref={paymentSlidesViewRef}
          className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-6 pt-8"
        >
          <MobileHeader
            logoSrc="/assets/svg/logo.png"
            logoAlt="Telesa English logo"
            logoWrapperClassName="relative h-[50px] w-[50px] shrink-0"
            logoImageSize={50}
            logoPriority
            ctaClassName="rounded-full border border-slate-400 bg-white px-5 py-2 text-xs font-medium text-slate-700 shadow-sm"
            menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-slate-900"
            menuLineClassName="bg-slate-900"
            onMenuOpen={() => setIsMenuOpen(true)}
            onCtaClick={() => router.push("/test?variant=adult")}
          />

          <div className="flex flex-1 flex-col justify-center">
            <div
              ref={mobileCarouselRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              onPointerDown={() => {
                mobileUserInteractedAtRef.current = Date.now();
              }}
              onTouchStart={() => {
                mobileUserInteractedAtRef.current = Date.now();
              }}
              onWheel={() => {
                mobileUserInteractedAtRef.current = Date.now();
              }}
            >
              {PAYMENT_SLIDES.map((slide) => (
                <div key={slide.src} className="shrink-0 snap-start" data-payment-slide>
                  <div className="relative h-[60vh] aspect-[1536/1380] max-w-none overflow-hidden rounded-[28px]">
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      sizes="420px"
                      className="object-cover"
                      priority={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="pointer-events-none fixed bottom-6 right-6">
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
      </div>

      {/* Desktop */}
      <section className="hidden lg:flex h-[100dvh] w-full items-center bg-white">
        <div className="mx-auto w-full px-[8vw] pt-[92px]">
          <div className="grid w-full grid-cols-12 items-center gap-x-12">
            <div className="col-span-5">
              <h1 className="text-[clamp(38px,2.7vw,56px)] font-semibold leading-[1.12] tracking-tight text-[#313A4C]">
                Phương thức thanh toán tại
                <br />
                Telesa English
              </h1>

              <ul className="mt-8 space-y-5 text-[clamp(14px,1.05vw,16px)] leading-relaxed text-[#313A4C]">
                <li className="flex gap-3">
                  <span className="mt-[10px] inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-[#313A4C]" />
                  <p>
                    Khi đăng ký học tại Telesa English, bạn{" "}
                    <span className="font-semibold">không chỉ được cam kết về chất lượng giảng dạy</span>{" "}
                    mà còn được hỗ trợ tối đa về phương thức thanh toán.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="mt-[10px] inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-[#313A4C]" />
                  <p>Chúng tôi hiểu rằng học viên ở mỗi nơi, mỗi hoàn cảnh đều có nhu cầu khác nhau.</p>
                </li>
                <li className="flex gap-3">
                  <span className="mt-[10px] inline-block h-[7px] w-[7px] shrink-0 rounded-full bg-[#313A4C]" />
                  <p>
                    Chính vì vậy, Telesa English cung cấp{" "}
                    <span className="font-semibold">nhiều hình thức thanh toán và trả góp linh hoạt.</span>
                  </p>
                </li>
              </ul>

	              <div className="mt-10">
	                <button
	                  type="button"
	                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D40887] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_2px_4px_0_rgba(0,0,0,0.10)] transition-transform hover:scale-[1.01] active:scale-[0.98]"
	                  onClick={() => {
	                    desktopPaymentSlidesViewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	                    paymentSlidesViewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	                  }}
	                >
                  <span>Xem các hình thức thanh toán</span>
                  <Image src="/assets/svg/arrow-down.svg" alt="" width={18} height={18} />
                </button>
              </div>
            </div>

            <div className="col-span-7">
              <div className="flex w-full justify-end">
                <div className="relative w-[min(52vw,820px)] max-w-full overflow-hidden rounded-[10px] bg-slate-100">
                  <div className="relative aspect-[1120/694] w-full">
                    <Image
                      src="/assets/payment.jpg"
                      alt="Học viên Telesa English"
                      fill
                      sizes="(min-width: 1024px) 820px, 0px"
                      className="object-cover"
                      priority={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop view 2 */}
      <section
        ref={desktopPaymentSlidesViewRef}
        className="hidden lg:flex h-[100dvh] w-full flex-col items-center justify-center bg-white pt-[92px]"
      >
        <h2 className="text-center text-[clamp(34px,2.4vw,52px)] font-semibold leading-[1.12] tracking-tight text-[#313A4C]">
          Phương thức thanh toán
        </h2>

        <div className="mt-16 w-full">
          <div
            ref={desktopCarouselRef}
            className="flex snap-x snap-mandatory gap-10 overflow-x-auto pb-8 pr-[6vw] scroll-pl-[5vw] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            onPointerDown={() => {
              desktopUserInteractedAtRef.current = Date.now();
            }}
            onWheel={() => {
              desktopUserInteractedAtRef.current = Date.now();
            }}
          >
            {PAYMENT_SLIDES.map((slide) => (
              <div
                key={`desktop-${slide.src}`}
                className="shrink-0 snap-start first:ml-[5vw]"
                data-payment-slide
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  width={1536}
                  height={1380}
                  sizes="(min-width: 1024px) 460px, 0px"
                  className="h-[min(54vh,460px)] w-auto select-none object-contain"
                  priority={false}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none fixed bottom-10 right-10 z-40 hidden lg:block">
          <div className="pointer-events-auto">
            <MobileFloatingActions
              variant="adult"
              tone="soft"
              navigationIcon="up"
              navigationAriaLabel="Lên đầu trang"
              onScrollToTop={scrollToTop}
            />
          </div>
        </div>
      </section>

      <div className="hidden lg:block">
        <FooterContactView
          variant="adult"
          logoSrc="/assets/svg/logo.png"
          snapStart={false}
          onMenuOpen={() => {}}
          onScrollToTop={scrollToTop}
          showFloatingActions={false}
          showMobileHeader={false}
          onNavigate={(key) => {
            if (key === "home") router.push("/");
            if (key === "product") router.push("/product?variant=adult");
            if (key === "library") router.push("/library");
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

      <div className="lg:hidden">
        <FooterContactView
          variant="adult"
          logoSrc="/assets/svg/logo.png"
          mobileFullHeight={false}
          onMenuOpen={() => {}}
          onScrollToTop={scrollToTop}
          showFloatingActions={false}
          showMobileHeader={false}
          onNavigate={(key) => {
            if (key === "home") router.push("/");
            if (key === "product") router.push("/product?variant=adult");
            if (key === "library") router.push("/library");
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
  );
}
