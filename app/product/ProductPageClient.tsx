"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DesktopNavbar from "../components/DesktopNavbar";
import FooterContactView from "../components/FooterContactView";
import MobileHeader from "../components/MobileHeader";
import MobileMenuDrawer from "../components/MobileMenuDrawer";
import {
  AUDIO_PRODUCTS,
  BOOK_PRODUCTS,
  CATEGORIES,
  COURSE_PRODUCTS,
  type AudioProduct,
  type BookProduct,
  type CourseProduct,
  type ProductCategory,
} from "./catalog";

function PersonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M16 8a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4 20c1.6-4.2 5.2-6 8-6s6.4 1.8 8 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3l2.9 6.2 6.8.6-5.1 4.4 1.6 6.6L12 17.4 5.8 20.8l1.6-6.6-5.1-4.4 6.8-.6L12 3z"
        fill="currentColor"
      />
    </svg>
  );
}

function DocumentIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7 3h7l3 3v15a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M14 3v4a2 2 0 002 2h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8 12h8M8 16h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CoinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 21c5 0 9-4 9-9s-4-9-9-9-9 4-9 9 4 9 9 9z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M14.6 9.2c-.3-1-1.2-1.7-2.6-1.7-1.6 0-2.6.8-2.6 2 0 1.2.9 1.7 2.6 2 1.7.3 2.6.8 2.6 2 0 1.2-1 2-2.6 2-1.4 0-2.3-.7-2.6-1.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 21c5 0 9-4 9-9s-4-9-9-9-9 4-9 9 4 9 9 9z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M12 3c2.4 2.6 3.8 5.6 3.8 9s-1.4 6.4-3.8 9c-2.4-2.6-3.8-5.6-3.8-9S9.6 5.6 12 3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 21c5 0 9-4 9-9s-4-9-9-9-9 4-9 9 4 9 9 9z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 7v6l4 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function parseVnd(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function isDiscounted(price: string, originalPrice: string) {
  const current = parseVnd(price);
  const original = parseVnd(originalPrice);
  return current > 0 && original > 0 && current < original;
}

export default function ProductPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mainRef = useRef<HTMLElement | null>(null);
  const mobileFilterRef = useRef<HTMLDivElement | null>(null);
  const desktopFilterRef = useRef<HTMLDivElement | null>(null);
  const variant = searchParams.get("variant") === "adult" ? "adult" : "kid";
  const logoSrc = variant === "adult" ? "/assets/svg/logo.png" : "/assets/logo.png";
  const primaryBgClass = variant === "adult" ? "bg-[#D40887]" : "bg-[#FFC000]";
  const primaryBorderClass = variant === "adult" ? "border-[#D40887]" : "border-[#FFC000]";
  const phoneIconSrc = variant === "adult" ? "/assets/svg/phone-pink.svg" : "/assets/svg/phone.svg";
  const heroVideoSrc =
    variant === "adult" ? "/assets/1-product-adult.mp4" : "/assets/1-product-kid.mp4";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [category, setCategory] = useState<ProductCategory>("course");
  const [isPaid, setIsPaid] = useState(true);
  const [isDiscount, setIsDiscount] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shouldOpen = sessionStorage.getItem("telesa:openMenuOnBack") === "1";
    if (!shouldOpen) return;
    sessionStorage.removeItem("telesa:openMenuOnBack");
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
    if (!isFilterOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (mobileFilterRef.current?.contains(target)) return;
      if (desktopFilterRef.current?.contains(target)) return;
      setIsFilterOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFilterOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFilterOpen]);

  return (
    <>
      <DesktopNavbar
        variant={variant}
        logoSrc={logoSrc}
        activeKey="products"
        activeColor="#D40887"
        onNavigate={(key) => {
          if (
            key === "library-why" ||
            key === "library-program-for-kid" ||
            key === "library-what-is-tes" ||
            key === "library-1-1" ||
            key === "library-payment-method" ||
            key === "library-why-group" ||
            key === "library-roadmap"
          ) {
            try {
              sessionStorage.setItem("telesa:openMenuOnBack", "1");
            } catch {}
          }
          if (key === "home") router.push("/");
          if (key === "products") router.push(`/product?variant=${variant}`);
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
        variant={variant}
        logoSrc={logoSrc}
        activeKey="product"
        onNavigate={(key) => {
          if (key === "home") router.push("/");
          if (key === "product") router.push(`/product?variant=${variant}`);
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
        ref={mainRef}
        className="relative h-[100dvh] w-full overflow-y-scroll bg-black"
      >
        <section className="relative h-[100dvh] w-full snap-start overflow-hidden bg-black text-white lg:snap-none">
          <video
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
            src={heroVideoSrc}
            autoPlay
            muted
            loop
            playsInline
          />
          <div aria-hidden="true" className="absolute inset-0" />

          <div className="pointer-events-none absolute inset-0 bg-white/5" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gold/75 via-yellow-600/35 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-yellow-300/25 via-yellow-100/12 to-transparent" />

          <div className="relative z-10 mx-auto flex h-full w-full max-w-md flex-col px-4 pt-[calc(env(safe-area-inset-top)+18px)] lg:max-w-5xl lg:px-[8vw] lg:pt-12">
            <MobileHeader
              className="lg:hidden"
              logoSrc={logoSrc}
              logoAlt={variant === "kid" ? "Telesa English Kids logo" : "Telesa English logo"}
              logoPriority
              onMenuOpen={() => setIsMenuOpen(true)}
              ctaClassName="rounded-full border border-white/80 bg-black/25 px-4 py-2 text-center text-xs font-medium text-white shadow-sm backdrop-blur-md"
              menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-black/30 text-white shadow-sm backdrop-blur-md"
              menuLineClassName="bg-white"
            />

            <div className="mt-auto mb-[calc(env(safe-area-inset-bottom)+10vh)] lg:hidden">
              <h1 className="text-[36px] font-semibold leading-[1.08] tracking-tight lg:text-[56px]">
                Telesa English –
                <br />
                Khám phá tri thức trực tuyến từ các khóa học ngay
              </h1>
              <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-white/90 lg:mt-5 lg:text-lg">
                Telesa cung cấp đa dạng khóa học trực tuyến và sách học tiếng anh bổ ích
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-[14vh] left-[8vw] z-20 hidden max-w-[780px] lg:block">
            {variant === "adult" ? (
              <>
                <h1 className="text-[44px] font-semibold leading-[1.08] tracking-tight xl:text-[56px]">
                  Telesa English –
                  <br />
                  Khám phá tri thức trực tuyến từ các khóa học ngay
                </h1>
                <p className="mt-5 text-[16px] leading-relaxed text-white/90">
                  Telesa cung cấp đa dạng khóa học trực tuyến và sách học tiếng anh bổ ích
                </p>
              </>
            ) : (
              <>
                <h1 className="text-[44px] font-semibold leading-[1.08] tracking-tight xl:text-[56px]">
                  Giáo trình chuẩn Cambridge
                  <br />– Học theo cấp độ quốc tế
                </h1>
                <p className="mt-5 text-[16px] leading-relaxed text-white/90">
                  Các khóa học gồm 6 lộ trình liên tiếp từ mẫu giáo đến tiền thiếu niên, bám sát hệ
                  thống Cambridge Young Learners và được thiết kế theo từng độ tuổi cùng mục tiêu
                  ngôn ngữ phù hợp
                </p>
              </>
            )}
          </div>
        </section>

        <section className="relative w-full bg-[#F8F9FA] text-slate-900 lg:h-auto lg:snap-none">
          <div className="mx-auto flex w-full max-w-md flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+18px)] pt-[calc(env(safe-area-inset-top)+18px)] lg:hidden">
            <MobileHeader
              logoSrc={logoSrc}
              logoAlt={variant === "kid" ? "Telesa English Kids logo" : "Telesa English logo"}
              onMenuOpen={() => setIsMenuOpen(true)}
              ctaClassName="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm"
              menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
              menuLineClassName="bg-white"
            />

            <div className="mt-6">
              <div className="relative">
                <input
                  className="h-10 w-full rounded-full border border-slate-200 bg-white px-4 pr-11 text-[13px] text-slate-800 shadow-sm placeholder:text-slate-500 focus:outline-none"
                  placeholder="Bạn muốn tìm sản phẩm gì"
                />
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                    <path
                      d="M11 19a8 8 0 100-16 8 8 0 000 16z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M21 21l-4.3-4.3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                {CATEGORIES.map((item) => {
                  const isActive = item.key === category;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setCategory(item.key)}
                      className={[
                        "h-10 flex-1 rounded-full border text-center text-sm font-semibold shadow-sm transition-colors",
                        isActive
                          ? [primaryBorderClass, primaryBgClass, "text-white"].join(" ")
                          : "border-slate-200 bg-white text-slate-700",
                      ].join(" ")}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div ref={mobileFilterRef} className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                  className={[
                    "rounded-full border px-4 py-2 text-[13px] font-medium shadow-sm transition-colors",
                    isFilterOpen
                      ? [primaryBorderClass, primaryBgClass, "text-white"].join(" ")
                      : "border-slate-200 bg-white text-slate-700",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-2">
                    Bộ lọc
                    <svg
                      viewBox="0 0 20 20"
                      width="14"
                      height="14"
                      fill="none"
                      aria-hidden="true"
                      className={isFilterOpen ? "rotate-180" : undefined}
                    >
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>

                {isPaid && (
                  <button
                    type="button"
                    onClick={() => setIsPaid(false)}
                    className="rounded-full bg-[#EAECF0] px-4 py-2 text-[13px] font-semibold text-slate-700"
                  >
                    <span className="inline-flex items-center gap-2">
                      Có phí
                      <span className="text-slate-400">×</span>
                    </span>
                  </button>
                )}

                {isDiscount && (
                  <button
                    type="button"
                    onClick={() => setIsDiscount(false)}
                    className="rounded-full bg-[#EAECF0] px-4 py-2 text-[13px] font-semibold text-slate-700"
                  >
                    <span className="inline-flex items-center gap-2">
                      Giảm giá
                      <span className="text-slate-400">×</span>
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6">
              <div
                className={[
                  "flex w-full gap-5 overflow-x-auto px-1 pb-1",
                  "snap-x snap-mandatory",
                  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                ].join(" ")}
              >
                {(
                  category === "book"
                    ? BOOK_PRODUCTS
                    : category === "audio"
                      ? AUDIO_PRODUCTS
                      : COURSE_PRODUCTS
                ).map((product) => {
                  if (category === "book") {
                    const book = product as BookProduct;
                    const bookImageSrc = variant === "adult" ? "/assets/book-adult.jpg" : book.image;
                    return (
                      <article
                        key={book.id}
                        className="flex w-[86%] shrink-0 snap-start flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_18px_36px_rgba(15,23,42,0.12)]"
                      >
                        <div className="relative h-[30vh] w-full shrink-0 overflow-hidden bg-white">
                          <Image
                            src={bookImageSrc}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 86vw, 420px"
                            className="object-contain"
                            priority={false}
                          />
                        </div>

                        <div
                          className={[
                            "flex-1 px-4 pb-3 pt-3.5",
                          ].join(" ")}
                        >
                          <h3 className="text-[16px] font-semibold leading-[1.15] tracking-tight text-slate-800">
                            {book.title}
                          </h3>
                          <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                            {book.subtitle}
                          </p>

                          <div className="mt-3.5 space-y-2 text-[14px] text-slate-700">
                            <div className="flex items-center gap-3">
                              <PersonIcon className="h-4 w-4 text-slate-500" />
                              <span>{book.author}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <DocumentIcon className="h-4 w-4 text-slate-500" />
                              <span>{book.format}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <CoinIcon className="h-4 w-4 text-slate-500" />
                              <div className="flex items-baseline gap-3">
                                <span className="font-semibold text-red-500">{book.price}</span>
                                <span className="text-slate-400 line-through">{book.originalPrice}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <GlobeIcon className="h-4 w-4 text-slate-500" />
                              <span>{book.language}</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 bg-white px-4 pb-4">
                          <div className="flex flex-wrap items-center justify-start gap-3">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700"
                            >
                              <Image src="/assets/svg/heart.svg" alt="" width={14} height={14} unoptimized />
                              Thích
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700"
                            >
                              <Image src="/assets/svg/cart.svg" alt="" width={14} height={14} unoptimized />
                              Thêm vào giỏ
                            </button>
                          </div>

                          <div className="mt-2.5 flex items-center justify-center">
                            <button
                              type="button"
                              className={[
                                "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-5 py-1.5 text-[10px] font-semibold text-white shadow-sm",
                                primaryBgClass,
                              ].join(" ")}
                            >
                              <Image src="/assets/svg/buy-all.svg" alt="" width={14} height={14} unoptimized />
                              Mua ngay
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  }

                  if (category === "audio") {
                    const audio = product as AudioProduct;
                    return (
                      <article
                        key={audio.id}
                        className="flex w-[86%] shrink-0 snap-start flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_18px_36px_rgba(15,23,42,0.12)]"
                      >
                        <div className="relative h-[20vh] w-full shrink-0 overflow-hidden bg-white">
                          <Image
                            src={audio.image}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 86vw, 420px"
                            className="object-contain"
                            priority={false}
                          />
                        </div>

                        <div
                          className={[
                            "flex-1 px-4 pb-3 pt-3.5",
                          ].join(" ")}
                        >
                          <h3 className="text-[16px] font-semibold leading-[1.15] tracking-tight text-slate-800">
                            {audio.title}
                          </h3>
                          <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                            {audio.subtitle}
                          </p>

                          <div className="mt-3.5 space-y-2 text-[14px] text-slate-700">
                            <div className="flex items-center gap-3">
                              <PersonIcon className="h-4 w-4 text-slate-500" />
                              <span>{audio.author}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <StarIcon className="h-4 w-4 text-slate-500" />
                              <span className="font-semibold text-red-500">{audio.rating}</span>
                              <span className="text-slate-700">({audio.reviewCount})</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <DocumentIcon className="h-4 w-4 text-slate-500" />
                              <span>{audio.format}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <CoinIcon className="h-4 w-4 text-slate-500" />
                              <div className="flex items-baseline gap-3">
                                <span className="font-semibold text-red-500">{audio.price}</span>
                                <span className="text-slate-400 line-through">{audio.originalPrice}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <GlobeIcon className="h-4 w-4 text-slate-500" />
                              <span>{audio.language}</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 bg-white px-4 pb-4">
                          <div className="flex flex-wrap items-center justify-start gap-3">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700"
                            >
                              <Image src="/assets/svg/heart.svg" alt="" width={14} height={14} unoptimized />
                              Thích
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700"
                            >
                              <Image src="/assets/svg/cart.svg" alt="" width={14} height={14} unoptimized />
                              Thêm vào giỏ
                            </button>
                          </div>

                          <div className="mt-2.5 flex items-center justify-center">
                            <button
                              type="button"
                              className={[
                                "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-6 py-1.5 text-[10px] font-semibold text-white shadow-sm",
                                primaryBgClass,
                              ].join(" ")}
                            >
                              <Image src="/assets/svg/month.svg" alt="" width={14} height={14} unoptimized />
                              Mua ngay
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  }

                  const course = product as CourseProduct;
                  return (
                    <article
                      key={course.id}
                      className="flex w-[86%] shrink-0 snap-start flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_18px_36px_rgba(15,23,42,0.12)]"
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(`/product/${course.id}?variant=${variant}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          router.push(`/product/${course.id}?variant=${variant}`);
                      }}
                    >
                      <div className="relative aspect-[40/27] w-full shrink-0 overflow-hidden bg-slate-100">
                        <Image
                          src={course.image}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 86vw, 420px"
                          className="object-cover"
                          priority={false}
                        />
                      </div>

                      <div
                        className={[
                          "flex-1 px-4 pb-3 pt-3.5",
                        ].join(" ")}
                      >
                        <h3 className="text-[16px] font-semibold leading-[1.15] tracking-tight text-slate-800">
                          {course.title}
                        </h3>
                        <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                          {course.subtitle}
                        </p>

                        <div className="mt-3.5 space-y-2 text-[14px] text-slate-700">
                          <div className="flex items-center gap-3">
                            <PersonIcon className="h-4 w-4 text-slate-500" />
                            <span>{course.students}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <StarIcon className="h-4 w-4 text-slate-500" />
                            <span>{course.rating}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CoinIcon className="h-4 w-4 text-slate-500" />
                            <div className="flex items-baseline gap-3">
                              <span className="font-semibold text-red-500">{course.price}</span>
                              <span className="text-slate-400 line-through">{course.originalPrice}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <ClockIcon className="h-4 w-4 text-slate-500" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Image src="/assets/svg/gift.svg" alt="" width={16} height={16} unoptimized />
                            <span>{course.include}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 bg-white px-4 pb-4">
                        <div className="flex flex-wrap items-center justify-start gap-3">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Image src="/assets/svg/heart.svg" alt="" width={14} height={14} unoptimized />
                            Thích
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Image src="/assets/svg/cart.svg" alt="" width={14} height={14} unoptimized />
                            Thêm vào giỏ
                          </button>
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-center justify-start gap-2.5">
                          <button
                            type="button"
                            className={[
                              "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm",
                              primaryBgClass,
                            ].join(" ")}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Image src="/assets/svg/month.svg" alt="" width={14} height={14} unoptimized />
                            Đăng ký theo tháng
                          </button>
                          <button
                            type="button"
                            className={[
                              "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm",
                              primaryBgClass,
                            ].join(" ")}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Image src="/assets/svg/buy-all.svg" alt="" width={14} height={14} unoptimized />
                            Mua trọn khóa
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative hidden w-full lg:flex lg:flex-col">
            <div className="mx-auto w-full max-w-[1600px] px-[6vw] pt-[110px]">
              <div className="mx-auto w-full max-w-[760px]">
                <div className="relative">
                  <input
                    className="h-11 w-full rounded-full border border-slate-200 bg-white px-5 pr-12 text-[14px] text-slate-800 shadow-sm placeholder:text-slate-500 focus:outline-none"
                    placeholder="Bạn muốn tìm sản phẩm gì"
                  />
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                      <path
                        d="M11 19a8 8 0 100-16 8 8 0 000 16z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M21 21l-4.3-4.3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  {CATEGORIES.map((item) => {
                    const isActive = item.key === category;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setCategory(item.key)}
                        className={[
                          "h-11 rounded-full border text-center text-[15px] font-semibold shadow-sm transition-colors",
                          isActive
                            ? [primaryBorderClass, primaryBgClass, "text-white"].join(" ")
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div ref={desktopFilterRef} className="relative mt-4 flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen((prev) => !prev)}
                      className={[
                        "rounded-full border px-4 py-2 text-[13px] font-medium shadow-sm transition-colors",
                        isFilterOpen
                          ? [primaryBorderClass, primaryBgClass, "text-white"].join(" ")
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <span className="inline-flex items-center gap-2">
                        Bộ lọc
                        <svg
                          viewBox="0 0 20 20"
                          width="14"
                          height="14"
                          fill="none"
                          aria-hidden="true"
                          className={isFilterOpen ? "rotate-180" : undefined}
                        >
                          <path
                            d="M5 7.5L10 12.5L15 7.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>

                    {isFilterOpen && (
                      <div className="absolute left-0 top-full z-30 mt-2 w-56 rounded-[18px] border border-slate-200 bg-white p-2 shadow-[0_18px_36px_rgba(15,23,42,0.14)]">
                        <button
                          type="button"
                          onClick={() => setIsPaid((prev) => !prev)}
                          className="flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Có phí
                          <span className="text-slate-400">{isPaid ? "✓" : ""}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDiscount((prev) => !prev)}
                          className="flex w-full items-center justify-between rounded-[14px] px-3 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Giảm giá
                          <span className="text-slate-400">{isDiscount ? "✓" : ""}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {isPaid && (
                    <button
                      type="button"
                      onClick={() => setIsPaid(false)}
                      className="rounded-full bg-[#EAECF0] px-4 py-2 text-[13px] font-semibold text-slate-700"
                    >
                      <span className="inline-flex items-center gap-2">
                        Có phí
                        <span className="text-slate-400">×</span>
                      </span>
                    </button>
                  )}

                  {isDiscount && (
                    <button
                      type="button"
                      onClick={() => setIsDiscount(false)}
                      className="rounded-full bg-[#EAECF0] px-4 py-2 text-[13px] font-semibold text-slate-700"
                    >
                      <span className="inline-flex items-center gap-2">
                        Giảm giá
                        <span className="text-slate-400">×</span>
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[1700px] px-[3vw] pb-16 pt-8">
              <div className="grid grid-cols-3 gap-7 2xl:grid-cols-4">
                {(() => {
                  const base =
                    category === "book"
                      ? BOOK_PRODUCTS
                      : category === "audio"
                        ? AUDIO_PRODUCTS
                        : COURSE_PRODUCTS;

                  const filteredBase = base.filter((product) => {
                    if (isPaid && parseVnd(product.price) <= 0) return false;
                    if (isDiscount && !isDiscounted(product.price, product.originalPrice)) return false;
                    return true;
                  });
                  return filteredBase.map((product) => {
                    if (category === "course") {
                      const course = product as CourseProduct;
                      return (
                        <article
                          key={`desktop-${course.id}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => router.push(`/product/${course.id}?variant=${variant}`)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              router.push(`/product/${course.id}?variant=${variant}`);
                          }}
                          className="flex flex-col overflow-hidden rounded-[22px] bg-white shadow-md ring-1 ring-slate-200 transition-transform hover:-translate-y-0.5"
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                            <Image
                              src={course.image}
                              alt=""
                              fill
                              sizes="(min-width: 1024px) 22vw, 420px"
                              className="object-cover"
                            />
                          </div>

                          <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                            <h3 className="text-[16px] font-semibold leading-snug text-slate-800">
                              {course.title}
                            </h3>
                            <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                              {course.subtitle}
                            </p>

                            <div className="mt-4 space-y-2 text-[13px] text-slate-700">
                              <div className="flex items-center gap-3">
                                <PersonIcon className="h-4 w-4 text-slate-500" />
                                <span>{course.students}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <StarIcon className="h-4 w-4 text-slate-500" />
                                <span>{course.rating}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <CoinIcon className="h-4 w-4 text-slate-500" />
                                <div className="flex items-baseline gap-3">
                                  <span className="font-semibold text-red-500">{course.price}</span>
                                  <span className="text-slate-400 line-through">
                                    {course.originalPrice}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <ClockIcon className="h-4 w-4 text-slate-500" />
                                <span>{course.duration}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Image src="/assets/svg/gift.svg" alt="" width={16} height={16} unoptimized />
                                <span>{course.include}</span>
                              </div>
                            </div>

                            <div className="mt-auto pt-4">
                              <div className="flex flex-wrap items-center justify-start gap-3">
                                <button
                                  type="button"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-700"
                                >
                                  <Image src="/assets/svg/heart.svg" alt="" width={16} height={16} unoptimized />
                                  Thích
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-700"
                                >
                                  <Image src="/assets/svg/cart.svg" alt="" width={16} height={16} unoptimized />
                                  Thêm vào giỏ
                                </button>
                              </div>

                              <div className="mt-3 flex flex-wrap items-center justify-start gap-3">
                                <button
                                  type="button"
                                  onClick={(e) => e.stopPropagation()}
                                  className={[
                                    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-semibold text-white shadow-sm",
                                    primaryBgClass,
                                  ].join(" ")}
                                >
                                  <Image src="/assets/svg/month.svg" alt="" width={16} height={16} unoptimized />
                                  Đăng ký theo tháng
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => e.stopPropagation()}
                                  className={[
                                    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-semibold text-white shadow-sm",
                                    primaryBgClass,
                                  ].join(" ")}
                                >
                                  <Image src="/assets/svg/buy-all.svg" alt="" width={16} height={16} unoptimized />
                                  Mua trọn khóa
                                </button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    }

                    if (category === "book") {
                      const book = product as BookProduct;
                      const bookImageSrc = variant === "adult" ? "/assets/book-adult.jpg" : book.image;
                      return (
                        <article
                          key={`desktop-${book.id}`}
                          className="flex flex-col overflow-hidden rounded-[22px] bg-white shadow-md ring-1 ring-slate-200"
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
                            <Image src={bookImageSrc} alt="" fill className="object-contain" />
                          </div>
                          <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                            <h3 className="text-[16px] font-semibold leading-snug text-slate-800">
                              {book.title}
                            </h3>
                            <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                              {book.subtitle}
                            </p>
                            <div className="mt-4 space-y-2 text-[13px] text-slate-700">
                              <div className="flex items-center gap-3">
                                <PersonIcon className="h-4 w-4 text-slate-500" />
                                <span>{book.author}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <DocumentIcon className="h-4 w-4 text-slate-500" />
                                <span>{book.format}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <CoinIcon className="h-4 w-4 text-slate-500" />
                                <div className="flex items-baseline gap-3">
                                  <span className="font-semibold text-red-500">{book.price}</span>
                                  <span className="text-slate-400 line-through">
                                    {book.originalPrice}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <GlobeIcon className="h-4 w-4 text-slate-500" />
                                <span>{book.language}</span>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    }

                    const audio = product as AudioProduct;
                    return (
                      <article
                        key={`desktop-${audio.id}`}
                        className="flex flex-col overflow-hidden rounded-[22px] bg-white shadow-md ring-1 ring-slate-200"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
                          <Image src={audio.image} alt="" fill className="object-contain" />
                        </div>
                        <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                          <h3 className="text-[16px] font-semibold leading-snug text-slate-800">
                            {audio.title}
                          </h3>
                          <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                            {audio.subtitle}
                          </p>
                          <div className="mt-4 space-y-2 text-[13px] text-slate-700">
                            <div className="flex items-center gap-3">
                              <PersonIcon className="h-4 w-4 text-slate-500" />
                              <span>{audio.author}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <StarIcon className="h-4 w-4 text-slate-500" />
                              <span className="font-semibold text-red-500">{audio.rating}</span>
                              <span className="text-slate-700">({audio.reviewCount})</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <DocumentIcon className="h-4 w-4 text-slate-500" />
                              <span>{audio.format}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <CoinIcon className="h-4 w-4 text-slate-500" />
                              <div className="flex items-baseline gap-3">
                                <span className="font-semibold text-red-500">{audio.price}</span>
                                <span className="text-slate-400 line-through">
                                  {audio.originalPrice}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <GlobeIcon className="h-4 w-4 text-slate-500" />
                              <span>{audio.language}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </section>

        <FooterContactView
          variant={variant}
          logoSrc={logoSrc}
          showFloatingActions={false}
          mobileFullHeight={false}
          showMobileHeader={false}
          onMenuOpen={() => setIsMenuOpen(true)}
          onScrollToTop={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          onNavigate={(key) => {
            if (key === "home") router.push("/");
            if (key === "product") router.push(`/product?variant=${variant}`);
            if (key === "library") router.push("/library");
            if (key === "library-why") router.push("/library/why");
            if (key === "library-program-for-kid") router.push("/library/program-for-kid");
            if (key === "library-what-is-tes") router.push("/library/what-is-tes");
            if (key === "teacher") router.push("/");
            if (key === "about") router.push("/");
            if (key === "career") router.push("/");
          }}
        />
      </main>

      <div className="pointer-events-none fixed bottom-6 right-6 z-40 lg:hidden">
        <button
          type="button"
          aria-label="Gọi tư vấn"
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#f4f4f4] text-slate-700 shadow-md"
        >
          <Image src={phoneIconSrc} alt="" width={20} height={20} className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}
