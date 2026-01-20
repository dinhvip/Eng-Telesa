"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import MobileFloatingActions from "../../components/MobileFloatingActions";
import MobileHeader from "../../components/MobileHeader";
import MobileMenuDrawer from "../../components/MobileMenuDrawer";

type CardContent = {
  title: string;
  bullets: ReactNode[];
  imageSrc: string;
  imageAlt: string;
};

const CARDS: CardContent[] = [
  {
    title: "Giáo trình đồng bộ\n& chuyên biệt",
    bullets: [
      <>
        Khi học qua trung tâm, bạn được sử dụng <span className="font-semibold">giáo trình riêng</span>{" "}
        do Telesa English biên soạn, <span className="font-semibold">phù hợp từng mục tiêu:</span>{" "}
        giao tiếp, luyện thi chứng chỉ quốc tế, hay tiếng Anh cho công việc.
      </>,
      <>
        Không lo “mạnh ai nấy dạy”,{" "}
        <span className="font-semibold">mọi buổi học đều có sự thống nhất và định hướng rõ ràng.</span>
      </>,
    ],
    imageSrc: "/assets/hockem.jpg",
    imageAlt: "Giáo trình",
  },
  {
    title: "Lộ trình cá nhân hoá\n& bám sát mục tiêu",
    bullets: [
      "Được test đầu vào và thiết kế lộ trình theo năng lực.",
      "Theo dõi tiến bộ, điều chỉnh nội dung theo từng giai đoạn.",
    ],
    imageSrc: "/assets/book.png",
    imageAlt: "Lộ trình",
  },
];

export default function OneOnOnePage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const rafRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const setCardRef = useMemo(
    () => (index: number) => (el: HTMLElement | null) => {
      cardRefs.current[index] = el;
    },
    [],
  );

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };

  const updateActiveIndex = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const rect = scroller.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    cardRefs.current.forEach((node, idx) => {
      if (!node) return;
      const r = node.getBoundingClientRect();
      const cardCenter = r.left + r.width / 2;
      const dist = Math.abs(cardCenter - centerX);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });

    setActiveIndex(bestIdx);
  };

  const onScroll: React.UIEventHandler<HTMLDivElement> = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updateActiveIndex();
    });
  };

  useEffect(() => {
    updateActiveIndex();
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <main className="relative min-h-[100dvh] bg-[#313A4C] text-white">
      <MobileMenuDrawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        variant="adult"
        logoSrc="/assets/svg/logo.png"
        activeKey="library-1-1"
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
          ctaClassName="rounded-full border border-white/90 bg-transparent px-4 py-2 text-xs font-medium text-white shadow-sm"
          menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-white"
          menuLineClassName="bg-white"
          onMenuOpen={() => setIsMenuOpen(true)}
        />

        <div className="mt-12 flex flex-1 flex-col">
          <h1 className="text-center text-[24px] font-semibold leading-none tracking-tight">
            Học kèm 1-1
          </h1>

          <div className="mt-10 flex-1">
            <div
              ref={scrollerRef}
              onScroll={onScroll}
              className="relative left-1/2 flex w-screen -translate-x-1/2 items-end gap-6 overflow-x-auto px-[11vw] pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
            >
              {CARDS.map((card, index) => {
                const isActive = index === activeIndex;
                return (
                  <article
                    key={card.title}
                    ref={setCardRef(index)}
                    className={[
                      "w-[78vw] max-w-[340px] shrink-0 snap-center rounded-[48px] bg-white p-5 text-[#313A4C] shadow-[0_18px_50px_rgba(0,0,0,0.25)]",
                      "transition-[transform,height,opacity] duration-200 ease-out",
                      isActive ? "h-[60vh] opacity-100" : "h-[52vh] opacity-90",
                      isActive ? "scale-100" : "scale-[0.96]",
                      "flex flex-col justify-center",
                    ].join(" ")}
                  >
                    <h2 className="text-center text-[16px] font-semibold leading-snug tracking-tight whitespace-pre-line">
                      {card.title}
                    </h2>

                    <ul className="mt-5 space-y-3 text-[12px] leading-relaxed">
                      {card.bullets.map((b, idx) => (
                        <li key={idx} className="flex gap-2.5">
                          <span className="mt-[7px] inline-block h-[5px] w-[5px] shrink-0 rounded-full bg-[#313A4C]" />
                          <div className="flex-1">
                            {b}
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 overflow-hidden rounded-[28px]">
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                          src={card.imageSrc}
                          alt={card.imageAlt}
                          fill
                          sizes="320px"
                          className="object-cover"
                          priority={false}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-6 right-6">
          <div className="pointer-events-auto">
            <MobileFloatingActions
              variant="adult"
              tone="darkGlass"
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
          <h1 className="text-[44px] font-semibold leading-[1.05] tracking-tight">Học kèm 1-1</h1>
          <p className="mt-6 text-[18px] leading-relaxed text-white/80">
            Xem trên mobile để trải nghiệm giao diện tối ưu.
          </p>
        </div>
      </section>
    </main>
  );
}
