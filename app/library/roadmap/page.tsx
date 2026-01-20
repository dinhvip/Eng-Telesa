"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import DesktopNavbar from "../../components/DesktopNavbar";
import MobileFloatingActions from "../../components/MobileFloatingActions";
import MobileHeader from "../../components/MobileHeader";
import MobileMenuDrawer from "../../components/MobileMenuDrawer";

const STAIR_VIEW_W = 322;
const STAIR_VIEW_H = 429;

type StairHitbox = { xMin: number; xMax: number; yMin: number; yMax: number };
type RoadmapCard = { label: string; imgSrc: string; hitbox: StairHitbox };

const ROADMAP_CARDS: RoadmapCard[] = [
  {
    label: "B2",
    imgSrc: "/assets/lotrinh1.png",
    hitbox: { xMin: 207.356, xMax: 303.766, yMin: 13.2822, yMax: 61.1816 },
  },
  {
    label: "B1+",
    imgSrc: "/assets/lotrinh2.png",
    hitbox: { xMin: 181.108, xMax: 303.766, yMin: 61.1816, yMax: 109.081 },
  },
  {
    label: "Mid B1 – Upper B1",
    imgSrc: "/assets/lotrinh3.png",
    hitbox: { xMin: 155.018, xMax: 303.766, yMin: 109.081, yMax: 156.983 },
  },
  {
    label: "Pre B1 – Mid B1",
    imgSrc: "/assets/lotrinh4.png",
    hitbox: { xMin: 129.884, xMax: 303.769, yMin: 156.983, yMax: 204.882 },
  },
  {
    label: "Mid A2 – Upper A2",
    imgSrc: "/assets/lotrinh5.png",
    hitbox: { xMin: 104.107, xMax: 303.766, yMin: 204.885, yMax: 252.784 },
  },
  {
    label: "Pre A2 – Mid A2",
    imgSrc: "/assets/lotrinh6.png",
    hitbox: { xMin: 80.5635, xMax: 303.766, yMin: 252.784, yMax: 303.876 },
  },
  {
    label: "Pre A1 – Pre A2",
    imgSrc: "/assets/lotrinh7.png",
    hitbox: { xMin: 52, xMax: 304, yMin: 304, yMax: 356 },
  },
  {
    label: "A0 – Pre A1",
    imgSrc: "/assets/lotrinh8.png",
    hitbox: { xMin: 24, xMax: 304, yMin: 356, yMax: 418 },
  },
];

function pct(value: number, total: number) {
  return `${(value / total) * 100}%`;
}

export default function RoadmapPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalPhase, setModalPhase] = useState<"opening" | "open" | "closing" | "closed">(
    "closed",
  );
  const [activeModal, setActiveModal] = useState<RoadmapCard | null>(null);

  const isModalVisible = modalPhase !== "closed" && activeModal != null;

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };

  const openModal = (card: RoadmapCard) => {
    setActiveModal(card);
    if (modalPhase === "closed" || modalPhase === "closing") setModalPhase("opening");
  };

  const closeModal = () => {
    if (modalPhase === "closed" || modalPhase === "closing") return;
    setModalPhase("closing");
    window.setTimeout(() => {
      setActiveModal(null);
      setModalPhase("closed");
    }, 220);
  };

  useEffect(() => {
    if (modalPhase !== "opening") return;
    const raf = window.requestAnimationFrame(() => setModalPhase("open"));
    return () => window.cancelAnimationFrame(raf);
  }, [modalPhase]);

  useEffect(() => {
    if (!isModalVisible) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isModalVisible]);

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
        activeKey="library-roadmap"
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
          onCtaClick={() => router.push("/test?variant=adult")}
        />

        <div className="mt-10 flex flex-1 flex-col">
          <div className="text-center">
            <h1 className="font-semibold tracking-tight text-[#2F3A4C]">
              <span className="block text-[24px] leading-[1.15]">Lộ trình học Tiếng Anh tại Telesa</span>
              <span className="mt-2 block text-[16px] leading-[1.2] text-slate-600">
                Tiến bộ từng bước vững chắc
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-[44ch] text-[16px] leading-relaxed text-slate-500">
              Telesa English thiết kế chương trình gồm 8 cấp độ, tương ứng với khung CEFR quốc tế,
              giúp bạn phát triển từ nền tảng cơ bản đến giao tiếp lưu loát.
            </p>
          </div>

          <div className="relative mt-10 flex flex-1 justify-end">
            <div className="relative aspect-[322/429] w-[320px] max-w-full">
              <Image
                src="/assets/stair.svg"
                alt="Lộ trình học theo cấp độ"
                fill
                sizes="(max-width: 768px) 320px, 420px"
                className="object-contain"
                priority={false}
              />

              {ROADMAP_CARDS.map((card) => (
                <button
                  key={card.imgSrc}
                  type="button"
                  onClick={() => openModal(card)}
                  aria-label={`Xem chi tiết cấp độ ${card.label}`}
                  className="absolute rounded-md bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D40887]/40"
                  style={{
                    left: pct(card.hitbox.xMin, STAIR_VIEW_W),
                    top: pct(card.hitbox.yMin, STAIR_VIEW_H),
                    width: pct(card.hitbox.xMax - card.hitbox.xMin, STAIR_VIEW_W),
                    height: pct(card.hitbox.yMax - card.hitbox.yMin, STAIR_VIEW_H),
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-6 left-4">
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

      {isModalVisible && activeModal && (
        <div
          className={[
            "fixed inset-0 z-50 bg-[#313A4C]/90 transition-opacity duration-200 ease-out",
            modalPhase === "open" ? "opacity-100" : "opacity-0",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
          aria-label={activeModal.label}
          onClick={closeModal}
        >
          <div
            className="relative z-10 flex h-full w-full items-center justify-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              role="document"
              className={[
                "inline-block transition-[transform,opacity] duration-200 ease-out will-change-transform",
                modalPhase === "open"
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-2 scale-[0.98]",
              ].join(" ")}
            >
              <Image
                src={activeModal.imgSrc}
                alt={activeModal.label}
                width={900}
                height={1200}
                className="h-auto w-auto max-h-[90dvh] max-w-[90vw] object-contain lg:max-h-[75vh]"
                priority={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop */}
      <section className="hidden lg:flex h-[100dvh] w-full items-center bg-white">
        <div className="mx-auto w-full px-[8vw] pt-[92px]">
          <div className="grid w-full grid-cols-12 items-center gap-x-12">
            <div className="col-span-5">
              <h1 className="text-[clamp(38px,2.7vw,56px)] font-semibold leading-[1.12] tracking-tight text-[#2F3A4C]">
                Lộ trình học Tiếng Anh tại
                <br />
                Telesa – Tiến bộ từng bước
                <br />
                vững chắc
              </h1>

              <p className="mt-6 max-w-[560px] text-[clamp(16px,1.05vw,18px)] leading-relaxed text-slate-600">
                Telesa English thiết kế chương trình gồm 8 cấp độ, tương ứng với khung CEFR quốc tế,
                giúp bạn phát triển từ nền tảng cơ bản đến giao tiếp lưu loát.
              </p>
            </div>

            <div className="col-span-7">
              <div className="relative mx-auto flex w-full justify-end">
                <div className="relative aspect-[322/429] h-[75vh] max-h-[75vh] w-auto max-w-[min(44vw,720px)]">
                  <Image
                    src="/assets/stair.svg"
                    alt="Lộ trình học theo cấp độ"
                    fill
                    sizes="(min-width: 1024px) 720px, 0px"
                    className="object-contain"
                    priority={false}
                  />

                  {ROADMAP_CARDS.map((card) => (
                    <button
                      key={`desktop-${card.imgSrc}`}
                      type="button"
                      onClick={() => openModal(card)}
                      aria-label={`Xem chi tiết cấp độ ${card.label}`}
                      className="absolute rounded-md bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D40887]/40"
                      style={{
                        left: pct(card.hitbox.xMin, STAIR_VIEW_W),
                        top: pct(card.hitbox.yMin, STAIR_VIEW_H),
                        width: pct(card.hitbox.xMax - card.hitbox.xMin, STAIR_VIEW_W),
                        height: pct(card.hitbox.yMax - card.hitbox.yMin, STAIR_VIEW_H),
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
