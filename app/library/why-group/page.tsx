"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import MobileFloatingActions from "../../components/MobileFloatingActions";
import MobileHeader from "../../components/MobileHeader";
import MobileMenuDrawer from "../../components/MobileMenuDrawer";

type Benefit = {
  title: string;
  description: string;
};

const BENEFITS: Benefit[] = [
  {
    title: "Cam kết đầu ra – Học đến khi vững thì thôi",
    description: "Học lại miễn phí đến khi vững.\nChỉ cần tham gia ≥70% số buổi.",
  },
  {
    title: "Học nhóm – nhưng vẫn được đánh giá cá nhân",
    description:
      "• Lớp nhóm nhưng theo dõi năng lực từng học viên.\n• App Telesa English có tính năng chấm bài, sửa phát âm, phản hồi cá nhân.\n• Ghi âm – gửi bài – nhận góp ý chi tiết như học 1 kèm 1.",
  },
  {
    title: "Linh hoạt học mọi lúc, mọi nơi",
    description:
      "• Có video ghi hình đồng bộ cho mọi buổi học.\n• Xem lại bài, học bù, ôn tập trên app không giới hạn.\n• Không sợ nghỉ buổi – không sợ mất kiến thức.",
  },
  {
    title: "Ưu đãi đặc quyền dành riêng cho học viên Telesa",
    description:
      "• Nhiều ưu đãi học phí cho học viên đang theo học.\n• Quà tặng, chương trình nâng cấp khóa học ưu tiên.\n• Gắn bó càng lâu – quyền lợi càng nhiều.",
  },
];

function ChevronIcon(props: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={[
        "h-5 w-5 text-white/90 transition-transform duration-200",
        props.open ? "rotate-180" : "rotate-0",
      ].join(" ")}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function WhyGroupPage() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const bgSrc =
    openIndex === 3
      ? "/assets/group3.jpg"
      : openIndex === 2
        ? "/assets/group2.jpg"
        : openIndex === 1
          ? "/assets/group1.jpg"
          : "/assets/group.jpg";

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

  return (
    <main className="relative min-h-[100dvh] bg-white text-slate-900">
      <MobileMenuDrawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        variant="adult"
        logoSrc="/assets/svg/logo.png"
        activeKey="library-why-group"
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
      <section className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-6 pt-8 lg:hidden">
        <MobileHeader
          logoSrc="/assets/svg/logo.png"
          logoAlt="Telesa English logo"
          logoWrapperClassName="relative h-[50px] w-[50px] shrink-0"
          logoImageSize={50}
          logoPriority
          ctaClassName="rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm"
          menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-slate-900"
          menuLineClassName="bg-slate-900"
          onMenuOpen={() => setIsMenuOpen(true)}
        />

        <div className="relative mt-8 h-[75vh] w-screen -translate-x-1/2 left-1/2 overflow-hidden">
          <Image
            src={bgSrc}
            alt="Chương trình học nhóm"
            fill
            sizes="100vw"
            className="object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-[#3B002566]" />

          <div className="relative z-10 flex h-full w-full flex-col items-center justify-start overflow-y-auto px-6 pb-10 pt-10 text-center text-white">
            <h1 className="text-[24px] font-semibold leading-tight tracking-tight">
              Chương trình học nhóm
            </h1>

            <div className="mt-8 w-full max-w-[320px] space-y-7">
              {BENEFITS.map((benefit, idx) => {
                const open = idx === openIndex;
                return (
                  <div key={benefit.title} className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/80 text-[16px] font-semibold">
                      {idx + 1}
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpenIndex((current) => (current === idx ? -1 : idx))}
                      className="mt-4 inline-flex items-center justify-center gap-2 text-center text-[16px] font-semibold leading-snug"
                    >
                      {benefit.title}
                      <ChevronIcon open={open} />
                    </button>

                    {open && (
                      <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-white/90">
                        {benefit.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-6 right-6">
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
      </section>

      {/* Desktop fallback */}
      <section className="hidden lg:block">
        <div className="mx-auto max-w-6xl px-[8vw] py-16">
          <h1 className="text-[44px] font-semibold leading-[1.05] tracking-tight text-[#2F3A4C]">
            Chương trình học nhóm
          </h1>
          <p className="mt-6 text-[18px] leading-relaxed text-slate-600">
            Xem trên mobile để trải nghiệm giao diện tối ưu.
          </p>
        </div>
      </section>
    </main>
  );
}
