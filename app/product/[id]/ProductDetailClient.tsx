"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DesktopNavbar from "../../components/DesktopNavbar";
import MobileFloatingActions from "../../components/MobileFloatingActions";
import MobileHeader from "../../components/MobileHeader";
import MobileMenuDrawer from "../../components/MobileMenuDrawer";
import type { CourseProduct } from "../catalog";
import { PlayCircleFilled } from "@ant-design/icons";
import { formatPrice, formatSalePrice } from "../../../lib/helper/until";

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
  const slideImages = Array.from({ length: slideCount }, () => props.course.banner);
  const [expandedChapters, setExpandedChapters] = useState<number[]>([]);
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

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  return (
    <>
      <DesktopNavbar
        variant={variant}
        logoSrc={logoSrc}
        activeKey="products"
        activeColor={navbarActiveColor}
        backgroundClassName="bg-[#36363666] backdrop-blur-md"
        onTestClick={() => router.push(variant === "adult" ? "/test?variant=adult" : "/test")}
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
              sessionStorage.setItem(
                "telesa:openMenuOnBack:returnTo",
                `${window.location.pathname}${window.location.search}`,
              );
            } catch { }
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
              onCtaClick={() => router.push(variant === "adult" ? "/test?variant=adult" : "/test")}
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
                  <div
                    key={`${props.course.id}-slide-${idx}`}
                    className="relative aspect-video w-full flex-none snap-start lg:aspect-[21/9]"
                  >
                    <Image
                      src={src || "/assets/avatar/default.svg"}
                      alt={`Banner khóa học ${idx + 1}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 1400px"
                      className="object-cover"
                      priority={idx === 0}
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

            {/* Tên khóa học */}
            <h2 className="mt-4 text-[48px] font-semibold leading-snug">
              {props.course.title}
            </h2>

            <div className="mt-3 space-y-3 text-[13px] leading-relaxed text-white/90">
              <div
                className="prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: props.course.description }}
              />

              {/* Phần hỗ trợ đi kèm (Introducing) */}
              <div
                className="mt-4 border-t border-white/10 pt-4"
                dangerouslySetInnerHTML={{ __html: props.course.introducing || "" }}
              />
            </div>

            {/* --- NỘI DUNG KHÓA HỌC (ACCORDION) --- */}
            <div className="mt-6 border-t border-gray-700 pt-6">
              <h3 className="text-[24px] font-semibold">Nội dung khóa học</h3>
              {props.course.chapters && props.course.chapters.length > 0 ? (
                <div className="space-y-3  pr-2 custom-scrollbar">
                  {props.course.chapters.map((chapter: any) => {
                    const isExpanded = expandedChapters.includes(chapter.id);

                    return (
                      <div
                        key={chapter.id}
                        className={`rounded-lg overflow-hidden transition-all duration-200 border ${isExpanded
                          ? "bg-[#1e232e] border-gray-600 shadow-lg" // Trạng thái mở
                          : "bg-[#171c26] border-gray-700 hover:border-gray-500" // Trạng thái đóng
                          }`}
                      >
                        {/* Header: Tên chương + Info + Toggle Button */}
                        <button
                          onClick={() => toggleChapter(chapter.id)}
                          className="w-full flex justify-between items-center p-4 text-left focus:outline-none cursor-pointer group"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                            <span className="font-semibold text-white text-[15px] group-hover:text-yellow-400 transition-colors">
                              {chapter.name}
                            </span>

                            {/* ⭐ BADGE SỐ LƯỢNG BÀI HỌC */}

                          </div>

                          <div className="flex items-center gap-4 ml-2">
                            <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wide text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-md border border-yellow-400/20 self-start sm:self-auto mt-1 sm:mt-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              {chapter.vendors?.length || 0} Bài học
                            </span>
                            {/* ⭐ TOTAL TIME CỦA CHƯƠNG */}
                            {chapter.total_time && (
                              <span className="flex items-center text-xs font-mono text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-md border border-yellow-400/20 min-w-[90px] justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {chapter.total_time}
                              </span>
                            )}

                            {/* Icon Mũi tên xoay */}
                            <span className={`text-gray-400 transform transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-180' : ''}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </span>
                          </div>
                        </button>

                        {/* Danh sách bài học (Hiển thị khi mở rộng) */}
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-1 pl-3 ">
                            {chapter.vendors?.map((lesson: any) => {
                              // Xác định loại file
                              const isVideo = lesson.video && !lesson.video.endsWith('.pdf');

                              return (
                                <a
                                  key={lesson.id}
                                  href={lesson.video || "#"}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                  {/* Icon */}
                                  <PlayCircleFilled className="w-5 h-5" />

                                  {/* Tên bài học */}
                                  <span className="flex-1 text-sm text-gray-300 group-hover:text-white truncate">
                                    {lesson.name}
                                  </span>

                                  {/* Thời lượng bài học */}
                                  {lesson.total_time && (
                                    <span className="text-xs text-gray-500 font-mono whitespace-nowrap bg-black/20 px-2 py-0.5 rounded">
                                      {lesson.total_time}
                                    </span>
                                  )}
                                </a>
                              );
                            })}

                            {/* Trường hợp không có bài học */}
                            {!chapter.vendors || chapter.vendors.length === 0 && (
                              <p className="text-xs text-gray-500 italic py-2">Đang cập nhật nội dung...</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm">Đang cập nhật nội dung khóa học...</p>
              )}
            </div>

            <div className="mt-6 space-y-2 text-[13px] text-white/90">
              <div className="flex items-center gap-2">
                <PersonIcon className="h-4 w-4 text-white/70" />
                {/* API chưa có field students, tạm thời dùng total_rate hoặc field phù hợp */}
                <span>{props.course.total_rate} học viên</span>
              </div>
              <div className="flex  items-start gap-2">
                <CoinIcon className="h-4 w-4 text-white/70" />
                <div className="flex flex-col items-center gap-3">
                  <span className="font-semibold text-red-500">
                    {formatPrice(props.course.price)}
                  </span>
                  {props.course.discount > 0 && (
                    <span className="text-white/50 line-through font-semibold">
                      {formatSalePrice(props.course.price, props.course.discount)}
                    </span>
                  )}
                </div>

                {/* Nếu có giá gốc (originalPrice), bạn có thể tính toán từ discount */}

              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-white/70" />
                <span>Tổng thời lượng: {props.course.total_time}</span>
              </div>
            </div>

            {/* Phần đánh giá học viên (Hiện tại API chưa trả về list review này nên giữ nguyên UI hoặc ẩn đi) */}
            <div className="mt-10 border-t border-gray-700 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[24px] font-semibold">Đánh giá của học viên</h3>
                <button type="button" className=" cursor-pointer text-[13px] transition-colors flex items-center gap-1 group">
                  Xem tất cả
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Grid hiển thị các bài review */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {props.course.rates && props.course.rates.length > 0 ? (
                  props.course.rates.slice(0, 3).map((rate: any) => {
                    // Helper nhỏ để render ngôi sao dựa trên số điểm
                    const renderStars = (count: number) => {
                      return (
                        <div className="flex gap-0.5 text-[#FFC000]">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill={i < count ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth={1.5}
                              className={`w-4 h-4 ${i < count ? "" : "text-slate-600"}`}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.545.044.77.77.326 1.163l-4.337 3.869a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.336-3.87a.562.562 0 01.326-1.163l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                          ))}
                        </div>
                      );
                    };

                    // Xử lý ảnh đại diện nếu backend trả về null
                    const avatarUrl = rate.user?.photo || "/assets/avatar/avatar-placeholder.svg";

                    return (
                      <div key={rate.id} className="bg-white rounded-3xl p-5 relative shadow-sm border-gray-100 flex flex-col transition-all hover:shadow-md">
                        {/* Icon trích dẫn trang trí */}
                        <div className="absolute top-4 right-4 text-gray-200 opacity-50">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
                          </svg>
                        </div>



                        {/* Nội dung đánh giá */}
                        <p className="text-[13px] leading-[1.5] text-slate-600 mb-5 flex-1 line-clamp-4">
                          "{rate.content}"
                        </p>

                        {/* Thông tin người dùng */}
                        <div className="flex items-center gap-3 border-t border-gray-100 pt-4 mt-auto">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <img src={avatarUrl} alt={rate.user?.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-slate-900 truncate">{rate.user?.name}</p>
                            <p className="text-[11px] text-slate-500">Học viên</p>
                            <div className="mb-3">
                              {renderStars(rate.star)}
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500 italic bg-white/5 rounded-lg border border-dashed border-gray-700">
                    Đang cập nhật nội dung đánh giá...
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-[24px] font-semibold">Giảng viên</h3>
              <div className="mt-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-500">
                    <div className="flex h-full w-full items-center justify-center text-xs text-white">TS</div>
                  </div>
                  <p className="text-[18px] font-semibold text-white">{props.course?.teacher?.name}</p>
                </div>

                <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-white/90">
                  <li>Trung tâm đào tạo & ôn luyện chứng chỉ tiếng Anh Quốc Tế</li>
                  <li>{props.course.total_rate} đánh giá </li>
                  <li>{props.course.total_video} học viên</li>
                  <li>{props.course.total_article} khóa học</li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-[24px] font-semibold">Chứng chỉ</h3>
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
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  className="cursor-pointer min-w-[300px] inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-700"
                >
                  <Image src="/assets/svg/heart.svg" alt="" width={18} height={18} unoptimized />
                  Thích
                </button>
                <button
                  type="button"
                  className="cursor-pointer min-w-[300px] inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-700"
                >
                  <Image src="/assets/svg/cart.svg" alt="" width={18} height={18} unoptimized />
                  Thêm vào giỏ
                </button>

              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="cursor-pointer w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm bg-[#FFC000] hover:bg-[#e6ad00]"
                >
                  <Image src="/assets/svg/buy-all.svg" alt="" width={18} height={18} unoptimized />
                  Mua khóa học
                </button>

                <button
                  type="button"
                  className="cursor-pointer w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm bg-[#FFC000] hover:bg-[#e6ad00]"
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
