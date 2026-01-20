"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DesktopNavbar from "../../components/DesktopNavbar";
import MobileFloatingActions from "../../components/MobileFloatingActions";
import MobileHeader from "../../components/MobileHeader";
import MobileMenuDrawer from "../../components/MobileMenuDrawer";
import type { CourseProduct } from "../catalog";

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

export default function ProductDetailClient(props: { course: CourseProduct }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const variant = searchParams.get("variant") === "adult" ? "adult" : "kid";
  const logoSrc = variant === "adult" ? "/assets/svg/logo.png" : "/assets/logo.png";
  const primaryBgClass = variant === "adult" ? "bg-[#D40887]" : "bg-[#FFC000]";
  const starColorClass = variant === "adult" ? "text-[#C1077B]" : "text-[#FEA933]";
  const navbarActiveColor = variant === "adult" ? "#D40887" : "#FFC000";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const slideCount = 4;
  const slideImages = Array.from({ length: slideCount }, () => props.course.image);

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
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleSliderScroll = () => {
    if (!sliderRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const node = sliderRef.current;
      if (!node) return;
      const width = node.clientWidth || 1;
      const next = Math.max(0, Math.min(slideCount - 1, Math.round(node.scrollLeft / width)));
      setActiveSlide(next);
    });
  };

  return (
    <>
      <DesktopNavbar
        variant={variant}
        logoSrc={logoSrc}
        activeKey="products"
        activeColor={navbarActiveColor}
        backgroundClassName="bg-[#36363666] backdrop-blur-md"
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

      <main className="relative min-h-[100dvh] bg-[#2F3A4C] text-white">
        <div
          ref={scrollRef}
          className="h-[100dvh] w-full overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="mx-auto w-full max-w-md px-4 pb-[calc(env(safe-area-inset-bottom)+28px)] pt-[calc(env(safe-area-inset-top)+18px)] lg:max-w-5xl lg:px-[6vw] lg:pt-[110px]">
            <MobileHeader
              className="lg:hidden"
              logoSrc={logoSrc}
              logoAlt={variant === "kid" ? "Telesa English Kids logo" : "Telesa English logo"}
              logoAriaLabel="Back to products"
              onLogoClick={() => router.push(`/product?variant=${variant}`)}
              onMenuOpen={() => setIsMenuOpen(true)}
              ctaClassName="rounded-full border border-white/80 bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm"
              menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-white"
              menuLineClassName="bg-white"
            />

            <div className="mt-5 overflow-hidden rounded-[18px] bg-white">
              <div
                ref={sliderRef}
                onScroll={handleSliderScroll}
                className={[
                  "flex w-full overflow-x-auto",
                  "snap-x snap-mandatory",
                  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                ].join(" ")}
              >
                {slideImages.map((src, idx) => (
                  <div key={`${props.course.id}-slide-${idx}`} className="relative aspect-[40/27] w-full flex-none snap-start">
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 92vw, 720px"
                      className="object-cover"
                      priority={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2">
              {Array.from({ length: slideCount }).map((_, idx) => (
                <span
                  key={idx}
                  className={[
                    "h-1.5 rounded-full",
                    idx === activeSlide ? ["w-5", primaryBgClass].join(" ") : "w-1.5 bg-white/35",
                  ].join(" ")}
                />
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {["Speaking", "Presentation", "Communication"].map((tag) => (
                <span
                  key={tag}
                  className={[
                    "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold",
                    variant === "adult"
                      ? "border-[#970660] bg-[#FFCAEB] text-[#970660]"
                      : "border-[#B58800] bg-[#FFEBB0] text-[#B58800]",
                  ].join(" ")}
                >
                  {tag}
                </span>
              ))}
            </div>

            <h2 className="mt-4 text-[18px] font-semibold leading-snug">{props.course.title}</h2>

            <div className="mt-3 space-y-3 text-[13px] leading-relaxed text-white/90">
              <div>
                <p className="font-semibold text-white">Đối tượng phù hợp</p>
                <p>Học viên đã có kiến thức cơ bản (phát âm, cấu trúc câu đơn giản)</p>
              </div>
              <div>
                <p>Người đi làm mong muốn nâng cao phản xạ và giao tiếp tiếng Anh lưu loát</p>
              </div>
              <ul className="space-y-2">
                {[
                  "Điểm nổi bật",
                  "270+ video chuyên sâu, hệ thống 4 giai đoạn theo lộ trình khóa học",
                  "Phát âm qua bảng IPA, luyện từ vựng và ghép câu thực tế",
                  "Luyện nghe từ ngắn đến dài; tăng phản xạ qua trò chơi nhập vai",
                  "Hệ thống flashcards & bài tập luyện ngữ pháp, từ vựng, phản xạ",
                ].map((line, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-[2px] inline-flex h-4 w-4 items-center justify-center rounded bg-white/10">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className={idx === 0 ? "font-semibold text-white" : undefined}>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="text-[16px] font-semibold">Nội dung khóa học</h3>
              <div className="mt-3 space-y-3 text-[13px] text-white/90">
                {[
                  "Kick-off",
                  "Project Objectives",
                  "Slide 0",
                  "Tips on Choosing a suitable word",
                  "Week 1: Pronunciation like a native speaker",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
                        <path
                          d="M7 12h10M7 7h10M7 17h7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span className="flex-1">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-2 text-[13px] text-white/90">
              <div className="flex items-center gap-3">
                <PersonIcon className="h-4 w-4 text-white/70" />
                <span>{props.course.students}</span>
              </div>
              <div className="flex items-center gap-3">
                <CoinIcon className="h-4 w-4 text-white/70" />
                <span className="font-semibold text-red-300">{props.course.price}</span>
                <span className="text-white/50 line-through">{props.course.originalPrice}</span>
              </div>
              <div className="flex items-center gap-3">
                <ClockIcon className="h-4 w-4 text-white/70" />
                <span>{props.course.duration}</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-semibold">Đánh giá của học viên</h3>
                <button type="button" className="text-[12px] text-white/70">
                  Xem tất cả →
                </button>
              </div>
              <div className="mt-4 flex flex-col gap-4">
                {[
                  {
                    name: "Võ Minh Khôi",
                    role: "Học viên",
                    content:
                      "Ngay từ những ngày đầu, mình đã cảm thấy ấn tượng với môi trường học tập tuyệt vời nơi đây. Các giáo viên không chỉ có chuyên môn cao mà còn rất tâm huyết. Các bạn học nhóm cùng mình cũng rất dễ thương ạ!",
                  },
                  {
                    name: "Thy",
                    role: "Học viên",
                    content:
                      "Trung tâm anh ngữ Telesa mang đến trải nghiệm học vừa nghiêm túc nhưng cũng rất thoải mái. Giáo viên luôn tận tâm trong việc dạy học và rất thân thiện với học viên.",
                  },
                ].map((review) => (
                  <div
                    key={review.name}
                    className="rounded-[26px] bg-white px-4 py-4 text-slate-800 shadow-md"
                  >
                    <p className="text-[13px] leading-relaxed text-slate-700">{review.content}</p>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200" />
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                        <p className="text-[11px] text-slate-500">{review.role}</p>
                        <div className={["mt-1 text-[12px]", starColorClass].join(" ")}>
                          {"★★★★★"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-[16px] font-semibold">Giảng viên</h3>
              <div className="mt-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0">
                    <Image
                      src={logoSrc}
                      alt="Telesa English Kids logo"
                      width={40}
                      height={40}
                      className="h-full w-full object-contain"
                      priority={false}
                    />
                  </div>
                  <p className="text-[18px] font-semibold text-white">Telesa Teacher</p>
                </div>

                <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-white/90">
                  <li>Trung tâm đào tạo & ôn luyện chứng chỉ tiếng Anh Quốc Tế dành cho mọi đối tượng</li>
                  <li>4.8 điểm đánh giá</li>
                  <li>998 đánh giá</li>
                  <li>346,618 học viên</li>
                  <li>101 khóa học</li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-[22px] font-semibold leading-snug">Chứng chỉ</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-white/90">
                Bạn sẽ được cấp chứng chỉ hoàn thành khóa học uy tín và giá trị từ trung tâm Telesa
                English
              </p>

              <div className="mt-5 bg-white">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/assets/certificate-kid.png"
                    alt="Telesa certificate"
                    fill
                    sizes="(max-width: 768px) 92vw, 420px"
                    className="object-contain"
                    priority={false}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex flex-wrap items-center justify-start gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-700"
                >
                  <Image src="/assets/svg/cart.svg" alt="" width={18} height={18} unoptimized />
                  Thêm vào giỏ
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-700"
                >
                  <Image src="/assets/svg/heart.svg" alt="" width={18} height={18} unoptimized />
                  Thích
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-start gap-3">
                <button
                  type="button"
                  className={[
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm",
                    primaryBgClass,
                  ].join(" ")}
                >
                  <Image src="/assets/svg/buy-all.svg" alt="" width={18} height={18} unoptimized />
                  Mua khóa học
                </button>
                <button
                  type="button"
                  className={[
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm",
                    primaryBgClass,
                  ].join(" ")}
                >
                  <Image src="/assets/svg/month.svg" alt="" width={18} height={18} unoptimized />
                  Đăng ký theo tháng
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none fixed bottom-6 right-6 z-40">
          <div className="pointer-events-auto">
            <MobileFloatingActions
              variant={variant}
              tone="slate"
              onScrollToTop={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
            />
          </div>
        </div>
      </main>
    </>
  );
}
