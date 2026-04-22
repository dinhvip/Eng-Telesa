import React from "react";
import MobileHeader from "../MobileHeader";
import MobileFloatingActions from "../MobileFloatingActions";
import { useDragToScroll } from "../useDragToScroll";
import Image from "next/image";

export const testimonialsData = [
  {
    avatar: "/assets/avatar/Rectangle13.svg",
    content:
      "Ngay từ những ngày đầu, mình đã cảm thấy ấn tượng với môi trường học tập tuyệt vời nơi đây. Các giáo viên không chỉ có chuyên môn cao mà còn rất tâm huyết. Các bạn học nhóm cùng mình cũng rất dễ thương ạ!",
    name: "Võ Minh Khôi",
    date: "14/03/2025",
  },
  {
    avatar: "/assets/avatar/Rectangle14.svg",
    content:
      "Trung tâm anh ngữ Telesa mang đến trải nghiệm học vừa nghiêm túc nhưng cũng rất thoải mái. Giáo viên luôn tận tâm trong việc dạy học và rất thân thiện với học viên.",
    name: "Thy",
    date: "14/03/2025",
  },
  {
    avatar: "/assets/avatar/Rectangle15.svg",
    content:
      "Mình đã học ở Telesa được 2 khóa, mọi thứ ở đây thực sự rất tuyệt vời. Lộ trình học chi tiết, được tích hợp trên app học tập để mình có thể chủ động theo dõi, làm bài tập và chấm chữa bài ngay trên APP.",
    name: "Lộc Đoàn",
    date: "14/03/2025",
  },
  {
    avatar: "/assets/avatar/Rectangle16.svg",
    content:
      "Em đã học tại Telesa và đang trên hành trình nâng band 6.5. Em cảm thấy học tại Telesa có nhiều yếu tố phát triển toàn diện, học vui mà vẫn tiến bộ rõ rệt.",
    name: "Thảo",
    date: "14/03/2025",
  },
];

interface SlideTestimonialsProps {
  variant: "kid" | "adult";
  onMenuOpen: () => void;
  onCtaClick: () => void;
  onScrollToTop: () => void;
}

export default function SlideTestimonials({
  variant,
  onMenuOpen,
  onCtaClick,
  onScrollToTop,
}: SlideTestimonialsProps) {
  const isKid = variant === "kid";
  const logoSrc = isKid ? "/assets/logo.png" : "/assets/svg/logo.png";
  const logoAlt = isKid ? "Telesa English Kids logo" : "Telesa English logo";

  const starColorDesktop = isKid ? "text-[#FEA933]" : "text-[#C1077B]";
  const starColorMobile = isKid ? "text-amber-400" : "text-[#C1077B]";

  const dragHandlers = useDragToScroll<HTMLDivElement>();

  return (
    <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-[#273143] text-white lg:bg-[#F8F9FA] lg:text-slate-900">
      {/* ─── MOBILE ─── */}
      <div className="relative z-10 flex w-full max-w-md flex-col px-4 pb-6 pt-8 lg:hidden">
        <MobileHeader
          logoSrc={logoSrc}
          logoAlt={logoAlt}
          logoPriority
          onMenuOpen={onMenuOpen}
          onCtaClick={onCtaClick}
          {...(!isKid && { logoWrapperClassName: "relative h-[50px] w-[50px] shrink-0", logoImageSize: 50 })}
          ctaClassName="rounded-full border border-white bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm"
          menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-white"
          menuLineClassName="bg-white"
        />

        <div className="mt-6 text-center">
          <h2 className="text-[24px] font-extrabold leading-snug">
            Cảm Nhận Học Viên
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-100">
            Đánh giá và chia sẻ thực tế từ học viên, phụ huynh, giáo viên
            giảng dạy tại trung tâm
          </p>
        </div>

        {/* Testimonial cards (Hardcoded to match original mobile layout) */}
        <div className="mt-5 flex flex-1 flex-col gap-4">
          {testimonialsData.slice(0, 2).map((t, idx) => (
            <div key={idx} className="rounded-[26px] bg-white px-4 py-4 text-slate-700 shadow-md">
              <p className="text-[13px] leading-relaxed text-slate-700">
                {t.content}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="rounded-full bg-slate-200" >
                  <Image src={t.avatar} alt="avatar" width={56} height={56} />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-[11px] text-slate-500">Học viên</p>
                  <div className={`mt-1 text-[12px] ${starColorMobile}`}>
                    {"★★★★★"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating actions */}
        <div className="pointer-events-none absolute bottom-6 right-6">
          <div className="pointer-events-auto">
            <MobileFloatingActions variant={variant} tone="slate" onScrollToTop={onScrollToTop} />
          </div>
        </div>
      </div>

      {/* ─── DESKTOP ─── */}
      <div className="relative z-10 hidden h-full w-full flex-col lg:flex">
        <div className="w-full px-[8vw] pt-[12vh] text-center">
          <h2 data-gsap-heading className="text-[44px] font-extrabold tracking-tight text-slate-700">
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
          {...dragHandlers}
        >
          <div className="flex w-max items-stretch gap-10 px-[8vw] snap-x snap-mandatory">
            {testimonialsData.map((t, index) => (
              <article
                key={`testimonial-${t.name}-${index}`}
                data-gsap-testimonial
                className="grid h-[55vh] max-h-[55vh] w-[23vw] grid-rows-[1fr_auto] rounded-[32px] border border-slate-100 bg-white p-[clamp(28px,3.2vh,40px)] shadow-sm snap-center"
              >
                <p className="self-center text-[clamp(16px,2vh,22px)] leading-relaxed text-slate-700">
                  {t.content}
                </p>

                <div className="flex items-center gap-5">
                  <div className="rounded-full bg-slate-200" >
                    <Image src={t.avatar} alt="avatar" width={96} height={96} />
                  </div>
                  <div className="text-left">
                    <p className="text-[clamp(18px,2.4vh,26px)] font-bold text-slate-700">
                      {t.name}
                    </p>
                    <p className="mt-1 text-[clamp(12px,1.4vh,14px)] text-[#667085]">
                      {t.date}
                    </p>
                    <div className={`mt-2 text-[clamp(12px,1.6vh,16px)] ${starColorDesktop}`}>
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
  );
}
