"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import MobileFloatingActions from "../../components/MobileFloatingActions";
import MobileHeader from "../../components/MobileHeader";
import MobileMenuDrawer from "../../components/MobileMenuDrawer";

export default function PaymentMethodPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <section className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-6 pt-8 lg:hidden">
        <MobileHeader
          logoSrc="/assets/svg/logo.png"
          logoAlt="Telesa English logo"
          logoWrapperClassName="relative h-[50px] w-[50px] shrink-0"
          logoImageSize={50}
          logoPriority
          ctaClassName="rounded-full border border-slate-400 bg-white px-5 py-2 text-xs font-medium text-slate-800 shadow-sm"
          menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-transparent text-slate-900"
          menuLineClassName="bg-slate-900"
          onMenuOpen={() => setIsMenuOpen(true)}
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
                <span className="font-semibold">
                  không chỉ được cam kết về chất lượng giảng dạy
                </span>{" "}
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
                src="/assets/8-2-adult.jpg"
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
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D40887] px-5 py-3 text-[12px] font-semibold text-white shadow-[0_20px_45px_rgba(0,0,0,0.55),0_0_0_8px_rgba(255,255,255,0.06)]"
            >
              <span>Xem các hình thức thanh toán</span>
              <Image src="/assets/svg/arrow-down.svg" alt="" width={16} height={16} />
            </button>
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
          <h1 className="text-[44px] font-semibold leading-[1.05] tracking-tight">
            Phương thức thanh toán
          </h1>
          <p className="mt-6 text-[18px] leading-relaxed text-white/80">
            Xem trên mobile để trải nghiệm giao diện tối ưu.
          </p>
        </div>
      </section>
    </main>
  );
}
