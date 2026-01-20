"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import DesktopNavbar from "../../components/DesktopNavbar";
import FooterContactView from "../../components/FooterContactView";
import MobileHeader from "../../components/MobileHeader";
import MobileMenuDrawer from "../../components/MobileMenuDrawer";
import MobileFloatingActions from "../../components/MobileFloatingActions";

const DESKTOP_SUMMARY_ITEMS = [
  "Con được rèn luyện đủ 4 kỹ năng, đặc biệt là nghe – nói chuẩn ngay từ nhỏ.",
  "Con tự tin tập nói, giao tiếp với giáo viên và bạn bè hoàn toàn bằng tiếng Anh.",
  "Mỗi buổi học giống như một buổi vui chơi – kết nối – thư giãn sau giờ học trên trường, nhưng vẫn tràn đầy kiến thức.",
  "Quan trọng hơn, con sẽ hình thành đam mê thật sự với tiếng Anh, chứ không chỉ học để làm bài kiểm tra.",
] as const;

export default function LibraryWhyPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/");
  };
  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
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
    <>
      <DesktopNavbar
        variant="kid"
        logoSrc="/assets/logo.png"
        activeKey="library"
        activeColor="#FFC000"
        backgroundClassName="bg-[#36363666] backdrop-blur-md"
        onTestClick={() => router.push("/test")}
        onNavigate={(key) => {
          if (key === "home") router.push("/");
          if (key === "products") router.push("/product?variant=kid");
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
        variant="kid"
        logoSrc="/assets/logo.png"
        activeKey="library-why"
        onNavigate={(key) => {
          if (
            key === "library-why" ||
            key === "library-program-for-kid" ||
            key === "library-what-is-tes" ||
            key === "library-roadmap" ||
            key === "library-why-group" ||
            key === "library-1-1" ||
            key === "library-payment-method"
          ) {
            try {
              sessionStorage.setItem("telesa:openMenuOnBack", "1");
              sessionStorage.setItem(
                "telesa:openMenuOnBack:returnTo",
                `${window.location.pathname}${window.location.search}`,
              );
            } catch {}
          }
          if (key === "home") router.push("/");
          if (key === "product") router.push("/product?variant=kid");
          if (key === "library") router.push("/library");
          if (key === "library-why") router.push("/library/why");
          if (key === "library-program-for-kid") router.push("/library/program-for-kid");
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

      <main
        ref={scrollContainerRef}
        className={["h-[100dvh] bg-[#F8F9FA]", "overflow-y-auto", "snap-y snap-mandatory"].join(" ")}
      >
        <section className="relative h-[100dvh] snap-start bg-[#F8F9FA] text-slate-900">
          <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8 lg:max-w-5xl lg:px-8 lg:pt-[110px]">
            <MobileHeader
              className="lg:hidden"
              logoSrc="/assets/logo.png"
              logoAlt="Telesa English Kids logo"
              ctaClassName="shrink-0 rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm"
              menuAriaLabel="Menu"
              menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
              menuLineClassName="bg-white"
              onMenuOpen={() => setIsMenuOpen(true)}
              onCtaClick={() => router.push("/test")}
            />

            <div className="flex flex-1 items-center justify-center text-center">
              <p className="max-w-[20ch] text-[32px] font-medium leading-[1.25] tracking-tight text-[#343B4A] lg:max-w-[20ch] lg:text-[clamp(38px,3.2vw,46px)] lg:leading-[1.18]">
                Ở Telesa English, con được học tiếng Anh{" "}
                <span className="text-[#FFC000]">
                  theo cách khác biệt – lấy giao tiếp làm trong tâm thay vì áp lực điểm số.
                </span>
              </p>
            </div>

            <div className="pointer-events-none absolute bottom-6 right-6 lg:hidden">
              <div className="pointer-events-auto">
                <MobileFloatingActions
                  variant="kid"
                  tone="soft"
                  navigationIcon="left"
                  navigationAriaLabel="Về trang chủ"
                  onScrollToTop={goBack}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Desktop: combine slides 2-5 into one view (footer attached) */}
        <section className="relative hidden min-h-[100dvh] snap-start bg-[#F8F9FA] text-slate-900 lg:block">
          <div className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col px-8 pt-[110px]">
            <div className="flex flex-1 items-center pb-16">
              <div className="grid w-full grid-cols-12 gap-6">
                <div className="col-span-5 flex items-center">
                  <div className="min-w-max whitespace-nowrap text-[clamp(32px,2.6vw,44px)] font-semibold leading-[1.1] tracking-tight text-[#343B4A]">
                    Ở Telesa English
                  </div>
                </div>

                <div className="col-span-7 flex">
                  <div className="flex w-full flex-col items-center justify-center gap-[clamp(28px,4vh,64px)]">
                    {DESKTOP_SUMMARY_ITEMS.map((item) => (
                      <p
                        key={item}
                        className="max-w-[40ch] text-center text-[clamp(22px,2vw,30px)] font-medium leading-[1.22] tracking-tight text-[#FFC000]"
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pointer-events-none fixed bottom-6 right-6">
              <div className="pointer-events-auto">
                <MobileFloatingActions
                  variant="kid"
                  tone="soft"
                  navigationIcon="up"
                  navigationAriaLabel="Lên đầu trang"
                  onScrollToTop={scrollToTop}
                />
              </div>
            </div>
          </div>

          <FooterContactView
            variant="kid"
            logoSrc="/assets/logo.png"
            snapStart={false}
            onMenuOpen={() => {}}
            onScrollToTop={scrollToTop}
            showFloatingActions={false}
            showMobileHeader={false}
            onNavigate={(key) => {
              if (key === "home") router.push("/");
              if (key === "product") router.push("/product?variant=kid");
              if (key === "library") router.push("/library");
              if (key === "library-why") router.push("/library/why");
              if (key === "library-program-for-kid") router.push("/library/program-for-kid");
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
        </section>

        {/* Mobile slides */}
        <section className="relative h-[100dvh] snap-start bg-[#F8F9FA] text-slate-900 lg:hidden">
          <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8 lg:max-w-5xl lg:px-8 lg:pt-[110px]">
            <MobileHeader
              logoSrc="/assets/logo.png"
              logoAlt="Telesa English Kids logo"
              ctaClassName="shrink-0 rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm"
              menuAriaLabel="Menu"
              menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
              menuLineClassName="bg-white"
              onMenuOpen={() => setIsMenuOpen(true)}
              onCtaClick={() => router.push("/test")}
            />

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="w-full">
                <div className="text-[34px] font-medium leading-[1.2] tracking-tight text-[#343B4A] lg:text-[clamp(42px,3.6vw,52px)] lg:leading-[1.05]">
                  Ở Telesa English
                </div>
                <div className="mt-10 text-[28px] font-medium leading-[1.25] tracking-tight text-[#FFC000] lg:text-[clamp(32px,2.9vw,42px)] lg:leading-[1.15]">
                  Con được rèn luyện đủ 4 kỹ năng, đặc biệt là nghe – nói chuẩn ngay từ nhỏ.
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-6 right-6">
              <div className="pointer-events-auto">
                <MobileFloatingActions
                  variant="kid"
                  tone="soft"
                  navigationIcon="left"
                  navigationAriaLabel="Về trang chủ"
                  onScrollToTop={goBack}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="relative h-[100dvh] snap-start bg-[#F8F9FA] text-slate-900 lg:hidden">
          <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8 lg:max-w-5xl lg:px-8 lg:pt-[110px]">
            <MobileHeader
              logoSrc="/assets/logo.png"
              logoAlt="Telesa English Kids logo"
              ctaClassName="shrink-0 rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm"
              menuAriaLabel="Menu"
              menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
              menuLineClassName="bg-white"
              onMenuOpen={() => setIsMenuOpen(true)}
              onCtaClick={() => router.push("/test")}
            />

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="w-full">
                <div className="text-[34px] font-medium leading-[1.2] tracking-tight text-[#343B4A] lg:text-[clamp(42px,3.6vw,52px)] lg:leading-[1.05]">
                  Ở Telesa English
                </div>
                <div className="mt-10 text-[28px] font-medium leading-[1.25] tracking-tight text-[#FFC000] lg:text-[clamp(32px,2.9vw,42px)] lg:leading-[1.15]">
                  Con tự tin tập nói, giao tiếp với giáo viên và bạn bè hoàn toàn bằng tiếng Anh.
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-6 right-6">
              <div className="pointer-events-auto">
                <MobileFloatingActions
                  variant="kid"
                  tone="soft"
                  navigationIcon="left"
                  navigationAriaLabel="Về trang chủ"
                  onScrollToTop={goBack}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="relative h-[100dvh] snap-start bg-[#F8F9FA] text-slate-900 lg:hidden">
          <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8 lg:max-w-5xl lg:px-8 lg:pt-[110px]">
            <MobileHeader
              logoSrc="/assets/logo.png"
              logoAlt="Telesa English Kids logo"
              ctaClassName="shrink-0 rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm"
              menuAriaLabel="Menu"
              menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
              menuLineClassName="bg-white"
              onMenuOpen={() => setIsMenuOpen(true)}
              onCtaClick={() => router.push("/test")}
            />

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="w-full">
                <div className="text-[34px] font-medium leading-[1.2] tracking-tight text-[#343B4A] lg:text-[clamp(42px,3.6vw,52px)] lg:leading-[1.05]">
                  Ở Telesa English
                </div>
                <div className="mt-10 text-[28px] font-medium leading-[1.25] tracking-tight text-[#FFC000] lg:text-[clamp(32px,2.9vw,42px)] lg:leading-[1.15]">
                  Mỗi buổi học giống như một buổi vui chơi – kết nối – thư giãn sau giờ học trên
                  trường, nhưng vẫn tràn đầy kiến thức.
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-6 right-6">
              <div className="pointer-events-auto">
                <MobileFloatingActions
                  variant="kid"
                  tone="soft"
                  navigationIcon="left"
                  navigationAriaLabel="Về trang chủ"
                  onScrollToTop={goBack}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="relative h-[100dvh] snap-start bg-[#F8F9FA] text-slate-900 lg:hidden">
          <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-8 pt-8 lg:max-w-5xl lg:px-8 lg:pt-[110px]">
            <MobileHeader
              logoSrc="/assets/logo.png"
              logoAlt="Telesa English Kids logo"
              ctaClassName="shrink-0 rounded-full border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-800 shadow-sm"
              menuAriaLabel="Menu"
              menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-slate-900 text-white shadow-sm"
              menuLineClassName="bg-white"
              onMenuOpen={() => setIsMenuOpen(true)}
              onCtaClick={() => router.push("/test")}
            />

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="w-full">
                <div className="text-[34px] font-medium leading-[1.2] tracking-tight text-[#343B4A] lg:text-[clamp(42px,3.6vw,52px)] lg:leading-[1.05]">
                  Ở Telesa English
                </div>
                <div className="mt-10 text-[28px] font-medium leading-[1.25] tracking-tight text-[#FFC000] lg:text-[clamp(32px,2.9vw,42px)] lg:leading-[1.15]">
                  Quan trọng hơn, con sẽ hình thành đam mê thật sự với tiếng Anh, chứ không chỉ học để
                  làm bài kiểm tra.
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-6 right-6">
              <div className="pointer-events-auto">
                <MobileFloatingActions
                  variant="kid"
                  tone="soft"
                  navigationIcon="left"
                  navigationAriaLabel="Về trang chủ"
                  onScrollToTop={goBack}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="lg:hidden">
          <FooterContactView
            variant="kid"
            logoSrc="/assets/logo.png"
            onMenuOpen={() => {}}
            onScrollToTop={scrollToTop}
            showFloatingActions={false}
            showMobileHeader={false}
            onNavigate={(key) => {
              if (key === "home") router.push("/");
              if (key === "product") router.push("/product?variant=kid");
              if (key === "library") router.push("/library");
              if (key === "library-why") router.push("/library/why");
              if (key === "library-program-for-kid") router.push("/library/program-for-kid");
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
    </>
  );
}
