"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DesktopNavbar from "../components/DesktopNavbar";
import MobileHeader from "../components/MobileHeader";
import MobileMenuDrawer from "../components/MobileMenuDrawer";
import ArrowUpIcon from "../components/ArrowUpIcon";
import { useWheelStepSnap } from "../components/useWheelStepSnap";

export default function TestPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const variant = searchParams.get("variant") === "adult" ? "adult" : "kid";
  const ZALO_URL = "https://zalo.me/407812786777792624";
  const MESSENGER_URL =
    "https://www.messenger.com/t/101413051393124/?messaging_source=source%3Apages%3Amessage_shortlink&source_id=1441792&recurring_notification=0";
  const logoSrc = variant === "adult" ? "/assets/svg/logo.png" : "/assets/logo.png";
  const brandAlt = variant === "adult" ? "Telesa English logo" : "Telesa English Kids logo";
  const primaryBgClass = variant === "adult" ? "bg-[#D40887]" : "bg-[#FFC000]";
  const primaryTextClass = variant === "adult" ? "text-[#D40887]" : "text-[#FFC000]";
  const testVideoSrc = variant === "adult" ? "/assets/test-adult.mp4" : "/assets/test.mp4";
  const testFormUrl =
    variant === "adult"
      ? "https://docs.google.com/forms/d/e/1FAIpQLSfs1WE2JgmVRNPUqP0dowsK-54kme3GKkRH_sDtzyuKisI2pg/viewform?usp=dialog"
      : "https://docs.google.com/forms/d/e/1FAIpQLSdg__vgNH_5yGNGSjppreujeZJ87R6FuDfjglh2GWP_aBB56Q/viewform?usp=dialog";
  const phoneIconSrc = variant === "adult" ? "/assets/svg/consult-pink.svg" : "/assets/svg/consult.svg";
  const consultBgSrc = variant === "adult" ? "/assets/10-2.jpg" : "/assets/10-1.jpg";
  const consultOverlayStyle = variant === "adult" ? { backgroundColor: "#59033933" } : undefined;
  const consultOverlayClassName = variant === "adult" ? "" : "bg-[#6B510033]";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const uploadSectionRef = useRef<HTMLElement | null>(null);
  const resultSectionRef = useRef<HTMLElement | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const consultSectionRef = useRef<HTMLElement | null>(null);
  const contactSectionRef = useRef<HTMLElement | null>(null);

  const [consultContactMethod, setConsultContactMethod] = useState<
    "zalo" | "phone" | "email"
  >("zalo");
  const [consultZaloCountry, setConsultZaloCountry] = useState<"VN">("VN");
  const [consultZaloNumber, setConsultZaloNumber] = useState("");
  const [consultTimeSlot, setConsultTimeSlot] = useState("");
  const [consultTopic, setConsultTopic] = useState("");
  const [consultAgree, setConsultAgree] = useState(false);

  const onSubmitInfo: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.open(testFormUrl, "_blank", "noopener,noreferrer");
    }
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToResult = () => {
    resultSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToConsult = () => {
    consultSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    contactSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isSendModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSendModalOpen]);

  useWheelStepSnap(mainRef, { enabled: !isMenuOpen && !isSendModalOpen });

  return (
    <>
      <DesktopNavbar
        variant={variant}
        logoSrc={logoSrc}
        activeKey="home"
        backgroundClassName="bg-[#3b3b3b]/40 backdrop-blur-md"
        onTestClick={scrollToTop}
        onNavigate={(key) => {
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

      <main
        ref={mainRef}
        className="relative h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory bg-black text-white"
      >
        <MobileMenuDrawer
          open={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          variant={variant}
          logoSrc={logoSrc}
          activeKey="test"
          onNavigate={(key) => {
            setIsMenuOpen(false);
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

        {/* View 1 (desktop): Personal info */}
        <section className="relative hidden h-[100dvh] w-full snap-start items-stretch justify-center overflow-hidden bg-black text-white lg:flex">
          <video
            className="bg-video pointer-events-none absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            controlsList="nodownload noplaybackrate noremoteplayback"
            preload="metadata"
            poster="/assets/bg-question.jpg"
          >
            <source src={testVideoSrc} type="video/mp4" />
          </video>
          <div aria-hidden="true" className="absolute inset-0" />
          <div className="pointer-events-none absolute inset-0 bg-[#6B510033]" />

          <div className="relative z-10 flex h-full w-full items-center px-[8vw] pt-[96px]">
            <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-16">
              <div className="max-w-[560px]">
                <h1 className="text-[56px] font-extrabold leading-[1.05] tracking-tight text-white">
                  Thông tin cá nhân
                </h1>
                <p className="mt-5 text-[18px] font-medium leading-relaxed text-white/90">
                  Vui lòng để lại thông tin trước khi làm bài kiểm tra nhanh, chúng tôi sẽ liên hệ để
                  tư vấn lộ trình học phù hợp với kết quả bạn gửi về !
                </p>
              </div>

              <form className="w-full max-w-[440px] space-y-5" onSubmit={onSubmitInfo}>
                <div className="space-y-2">
                  <label htmlFor="name-desktop" className="text-[14px] font-semibold text-white">
                    Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name-desktop"
                    name="name"
                    placeholder="Nhập tên của bạn"
                    autoComplete="name"
                    required
                    className="h-[42px] w-full rounded-[14px] bg-white/80 px-5 text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/90"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone-desktop" className="text-[14px] font-semibold text-white">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone-desktop"
                    name="phone"
                    placeholder="Nhập số điện thoại"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    className="h-[42px] w-full rounded-[14px] bg-white/80 px-5 text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/90"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email-desktop" className="text-[14px] font-semibold text-white">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email-desktop"
                    name="email"
                    placeholder="Nhập email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    className="h-[42px] w-full rounded-[14px] bg-white/80 px-5 text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/90"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="country-desktop" className="text-[14px] font-semibold text-white">
                    Quốc gia sinh sống <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="country-desktop"
                      name="country"
                      defaultValue=""
                      required
                      className="h-[42px] w-full appearance-none rounded-[14px] bg-white/80 px-5 pr-12 text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md focus:bg-white/90"
                    >
                      <option value="" disabled>
                        Chọn quốc gia
                      </option>
                      <option value="VN">Việt Nam</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="SG">Singapore</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center">
                      <span className="text-[13px] text-slate-500">⌄</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="job-desktop" className="text-[14px] font-semibold text-white">
                    Nghề nghiệp
                  </label>
                  <input
                    id="job-desktop"
                    name="job"
                    placeholder="Bạn đang làm nghề gì"
                    className="h-[42px] w-full rounded-[14px] bg-white/80 px-5 text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/90"
                  />
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="submit"
                    className="rounded-full border border-white/90 bg-white/0 px-10 py-2.5 text-[14px] font-semibold text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-white/10 active:opacity-90"
                  >
                    Làm bài test
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* View 1 (mobile): Personal info */}
        <section className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center overflow-hidden bg-black text-white lg:hidden">
          <video
            className="bg-video pointer-events-none absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            controlsList="nodownload noplaybackrate noremoteplayback"
            preload="metadata"
            poster="/assets/bg-question.jpg"
          >
            <source src={testVideoSrc} type="video/mp4" />
          </video>
          <div aria-hidden="true" className="absolute inset-0" />
          <div className="pointer-events-none absolute inset-0 bg-[#6B510033]" />

          <div className="relative z-10 flex h-full w-full max-w-md flex-col items-center px-4 pb-6 pt-5">
            <MobileHeader
              className="w-full text-left gap-3"
              logoSrc={logoSrc}
              logoAlt={brandAlt}
              logoPriority
              onMenuOpen={() => setIsMenuOpen(true)}
              ctaClassName="rounded-full border border-white/80 bg-black/20 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md"
              menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-black/20 text-white shadow-sm backdrop-blur-md"
              menuLineClassName="bg-white"
            />

            <div className="flex w-full flex-1 flex-col items-center justify-center">
              <div className="mx-auto mt-4 w-[80vw] max-w-full text-center">
                <h1 className="text-[26px] font-extrabold leading-[1.05] tracking-tight text-white">
                  Thông tin cá nhân
                </h1>
                <p className="mt-1.5 text-[13px] font-medium leading-snug text-white/90">
                  Vui lòng để lại thông tin trước khi làm bài kiểm tra nhanh,
                  chúng tôi sẽ liên hệ để tư vấn lộ trình học phù hợp với kết
                  quả bạn gửi về !
                </p>
              </div>

              <form
                className="mt-3 flex w-full flex-col gap-2.5"
                onSubmit={onSubmitInfo}
              >
                <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
                  <label
                    htmlFor="name"
                    className="block text-[13px] font-semibold text-white"
                  >
                    Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    placeholder="Nhập tên của bạn"
                    autoComplete="name"
                    required
                    className="h-[40px] w-full rounded-[14px] bg-white/70 px-4 text-left text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/80"
                  />
                </div>

                <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
                  <label
                    htmlFor="phone"
                    className="block text-[13px] font-semibold text-white"
                  >
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    placeholder="Nhập số điện thoại"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    className="h-[40px] w-full rounded-[14px] bg-white/70 px-4 text-left text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/80"
                  />
                </div>

                <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
                  <label
                    htmlFor="email"
                    className="block text-[13px] font-semibold text-white"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="Nhập email"
                    id="email"
                    name="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    className="h-[40px] w-full rounded-[14px] bg-white/70 px-4 text-left text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/80"
                  />
                </div>

                <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
                  <label
                    htmlFor="country"
                    className="block text-[13px] font-semibold text-white"
                  >
                    Quốc gia sinh sống <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="country"
                      name="country"
                      defaultValue=""
                      required
                      className="h-[40px] w-full appearance-none rounded-[14px] bg-white/70 px-4 pr-10 text-left text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md focus:bg-white/80"
                    >
                      <option value="" disabled>
                        Chọn quốc gia
                      </option>
                      <option value="VN">Việt Nam</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="SG">Singapore</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                      <span className="text-[13px] text-slate-500">⌄</span>
                    </div>
                  </div>
                </div>

                <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
                  <label
                    htmlFor="job"
                    className="block text-[13px] font-semibold text-white"
                  >
                    Nghề nghiệp
                  </label>
                  <input
                    id="job"
                    name="job"
                    placeholder="Bạn đang làm nghề gì"
                    autoComplete="organization-title"
                    className="h-[40px] w-full rounded-[14px] bg-white/70 px-4 text-left text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/80"
                  />
                </div>

                <div className="mt-1 flex justify-center pb-1">
                  <button
                    type="submit"
                    className="mx-auto h-[44px] w-[80vw] max-w-full rounded-full border border-white/80 bg-black/20 text-center text-[14px] font-medium text-white shadow-sm backdrop-blur-md active:opacity-90"
                  >
                    Làm bài test
                  </button>
                </div>
              </form>

            </div>
          </div>
      </section>

      {/* View 2: Upload result */}
      <section
        ref={uploadSectionRef}
        className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-[#313A4C] text-white"
      >
        {/* Desktop */}
        <div className="relative z-10 hidden h-full w-full items-center justify-center px-[8vw] pt-[96px] lg:flex">
          <label
            htmlFor="test-result-upload-desktop"
            className="mx-auto flex min-h-[40vh] w-[min(920px,80vw)] max-w-full flex-col items-center justify-center rounded-[40px] border-[3px] border-dashed border-white/70 bg-white/5 px-8 py-16 text-center"
          >
            <input
              id="test-result-upload-desktop"
              name="test-result-upload-desktop"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                setUploadedFileName(file?.name ?? null);
                if (file) scrollToResult();
              }}
            />
            <Image
              src="/assets/svg/upload-cloud.svg"
              alt=""
              width={42}
              height={42}
              className="h-[42px] w-[42px]"
              unoptimized
            />
            <p className={["mt-6 text-[22px] font-extrabold", primaryTextClass].join(" ")}>
              Cập nhật kết quả bài kiểm tra
            </p>
            <p className="mt-2 max-w-[36rem] text-[15px] leading-relaxed text-white/85">
              Hãy nhấn vào đây để gửi lên hình ảnh kết quả bạn vừa làm bài kiểm tra
            </p>
            {uploadedFileName ? (
              <p className="mt-4 text-[13px] font-medium text-white/70">Đã chọn: {uploadedFileName}</p>
            ) : null}
          </label>

          <div className="pointer-events-none fixed bottom-10 right-10 z-40 hidden lg:block">
            <div className="pointer-events-auto">
              <button
                type="button"
                aria-label="Call"
                className="flex h-14 w-14 items-center justify-center rounded-full bg-black/20 shadow-lg backdrop-blur-md"
              >
                <Image
                  src={phoneIconSrc}
                  alt=""
                  width={26}
                  height={26}
                  className="h-[26px] w-[26px]"
                  unoptimized
                />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="relative z-10 flex h-full w-full max-w-md flex-col items-center px-4 pb-6 pt-5 lg:hidden">
          <MobileHeader
            className="w-full text-left gap-3"
            logoSrc={logoSrc}
            logoAlt={brandAlt}
            logoPriority
            onMenuOpen={() => setIsMenuOpen(true)}
            ctaClassName="rounded-full border border-white/80 bg-black/20 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md"
            menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-black/20 text-white shadow-sm backdrop-blur-md"
            menuLineClassName="bg-white"
          />

          <div className="flex w-full flex-1 flex-col items-center justify-center">
            <label
              htmlFor="test-result-upload"
              className="mx-auto flex w-[86vw] max-w-full flex-col items-center justify-center rounded-[48px] border-[4px] border-dashed border-white/85 bg-white/5 px-8 py-12 text-center active:opacity-95"
            >
              <input
                id="test-result-upload"
                name="test-result-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  setUploadedFileName(file?.name ?? null);
                  if (file) scrollToResult();
                }}
              />
              <Image
                src="/assets/svg/upload-cloud.svg"
                alt=""
                width={34}
                height={34}
                className="h-[34px] w-[34px]"
                unoptimized
              />

              <p className={["mt-6 text-[22px] font-extrabold", primaryTextClass].join(" ")}>
                Cập nhật kết quả bài kiểm tra
              </p>
              <p className="mt-3 max-w-[22rem] text-[16px] leading-relaxed text-white/90">
                Hãy nhấn vào đây để gửi lên hình ảnh kết quả bạn vừa làm bài
                kiểm tra
              </p>
              {uploadedFileName ? (
                <p className="mt-4 text-[13px] font-medium text-white/80">
                  Đã chọn: {uploadedFileName}
                </p>
              ) : null}
            </label>
          </div>

          <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+18px)] right-5 z-20 flex flex-col items-center gap-3">
            <button
              type="button"
              aria-label="Call"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/25 shadow-lg backdrop-blur-md"
            >
              <Image
                src={phoneIconSrc}
                alt=""
                width={22}
                height={22}
                className="h-[22px] w-[22px]"
                unoptimized
              />
            </button>
            <button
              type="button"
              aria-label="Scroll to top"
              onClick={scrollToTop}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/25 shadow-lg backdrop-blur-md"
            >
              <ArrowUpIcon size={22} color="white" className="h-[22px] w-[22px]" />
            </button>
          </div>
        </div>
      </section>

      {/* View 3: Result preview + actions */}
      <section
        ref={resultSectionRef}
        className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-[#313A4C] text-white"
      >
        {/* Desktop */}
        <div className="relative z-10 hidden h-full w-full flex-col items-center justify-center px-[8vw] pt-[96px] lg:flex">
          <div className="mx-auto w-full max-w-[920px]">
            <div className="mx-auto w-full max-w-[720px] overflow-hidden rounded-[8px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
              <Image
                src="/assets/test-desktop.png"
                alt="Test result"
                width={1440}
                height={900}
                className="h-auto w-full object-contain"
                priority={false}
              />
            </div>

            <div className="mx-auto mt-10 flex w-full max-w-[640px] items-center gap-6">
              <button
                type="button"
                onClick={() => {
                  setUploadedFileName(null);
                  scrollToUpload();
                }}
                className="h-[44px] flex-1 rounded-full bg-white text-center text-[14px] font-semibold text-[#313A4C] shadow-[0_12px_26px_rgba(0,0,0,0.15)] active:opacity-90"
              >
                Tải lại
              </button>
              <button
                type="button"
                onClick={() => setIsSendModalOpen(true)}
                className={[
                  "h-[44px] flex-1 rounded-full text-center text-[14px] font-extrabold text-white shadow-[0_12px_26px_rgba(0,0,0,0.15)] active:opacity-90",
                  primaryBgClass,
                ].join(" ")}
              >
                Gửi kết quả
              </button>
            </div>

            <button
              type="button"
              className="mx-auto mt-5 flex h-[44px] w-full max-w-[640px] items-center justify-center rounded-full bg-white text-center text-[14px] font-semibold text-[#313A4C] shadow-[0_12px_26px_rgba(0,0,0,0.15)] active:opacity-90"
            >
              AI tư vấn nhanh
            </button>
          </div>
        </div>

        {/* Mobile */}
        <div className="relative z-10 flex h-full w-full max-w-md flex-col items-center px-4 pb-6 pt-5 lg:hidden">
          <MobileHeader
            className="w-full text-left gap-3"
            logoSrc={logoSrc}
            logoAlt={brandAlt}
            logoPriority
            onMenuOpen={() => setIsMenuOpen(true)}
            ctaClassName="rounded-full border border-white/80 bg-black/20 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md"
            menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-black/20 text-white shadow-sm backdrop-blur-md"
            menuLineClassName="bg-white"
          />

          <div className="flex w-full flex-1 flex-col items-center justify-center">
            <div className="mx-auto mt-6 w-[78vw] max-w-[340px] overflow-hidden rounded-[10px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
              <Image
                src="/assets/test.png"
                alt="Test result"
                width={680}
                height={900}
                className="h-auto w-full object-contain"
                priority={false}
              />
            </div>

            <div className="mt-10 flex w-[80vw] max-w-full items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setUploadedFileName(null);
                  scrollToUpload();
                }}
                className="h-[42px] flex-1 rounded-full bg-white text-center text-[14px] font-semibold text-[#313A4C] shadow-[0_12px_26px_rgba(0,0,0,0.15)] active:opacity-90"
              >
                Tải lại
              </button>
              <button
                type="button"
                onClick={() => setIsSendModalOpen(true)}
                className={[
                  "h-[42px] flex-1 rounded-full text-center text-[14px] font-extrabold text-white shadow-[0_12px_26px_rgba(0,0,0,0.15)] active:opacity-90",
                  primaryBgClass,
                ].join(" ")}
              >
                Gửi kết quả
              </button>
            </div>

            <button
              type="button"
              className="mt-5 flex h-[42px] w-[80vw] max-w-full items-center justify-center rounded-full bg-white text-center text-[14px] font-semibold text-[#313A4C] shadow-[0_12px_26px_rgba(0,0,0,0.15)] active:opacity-90"
            >
              AI tư vấn nhanh
            </button>
          </div>
        </div>
      </section>

      {isSendModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#313A4C]/80 px-6"
          role="dialog"
          aria-modal="true"
          aria-label="Gửi kết quả"
          onMouseDown={(e) => {
            if (e.currentTarget === e.target) setIsSendModalOpen(false);
          }}
        >
          <div className="w-[88vw] max-w-[420px] rounded-[28px] bg-white px-6 py-6 text-[#313A4C] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE1B3]">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 26 26"
                  fill="none"
                  aria-hidden="true"
                >
                  {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i * Math.PI) / 4;
                    const x1 = 13 + Math.cos(angle) * 4.2;
                    const y1 = 13 + Math.sin(angle) * 4.2;
                    const x2 = 13 + Math.cos(angle) * 8.0;
                    const y2 = 13 + Math.sin(angle) * 8.0;
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#FF8A00"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={() => setIsSendModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 active:opacity-70"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-4">
              <h3 className="text-[20px] font-extrabold leading-[1.05] tracking-tight">
                Gửi kết quả
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-700">
                Sau khi nhận được kết quả, bạn muốn hẹn lịch tư vấn hay muốn tư
                vấn ngay với kết quả của mình ?
              </p>
            </div>

            <div className="mt-7 flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setIsSendModalOpen(false);
                  scrollToConsult();
                }}
                className="h-[52px] flex-1 rounded-full bg-white text-center text-[14px] font-semibold text-[#313A4C] shadow-[0_14px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5 active:opacity-90"
              >
                Hẹn tư vấn
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSendModalOpen(false);
                  scrollToContact();
                }}
                className={[
                  "h-[52px] flex-1 rounded-full text-center text-[14px] font-extrabold text-white shadow-[0_14px_30px_rgba(0,0,0,0.12)] active:opacity-90",
                  primaryBgClass,
                ].join(" ")}
              >
                Tư vấn ngay
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* View 4: Schedule consultation */}
      <section
        ref={consultSectionRef}
        className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center overflow-hidden bg-black text-white"
      >
        <Image
          src={consultBgSrc}
          alt="Telesa consultation"
          fill
          quality={100}
          sizes="100vw"
          className="pointer-events-none select-none object-cover"
        />
        <div
          className={["pointer-events-none absolute inset-0", consultOverlayClassName].filter(Boolean).join(" ")}
          style={consultOverlayStyle}
        />

        {/* Desktop */}
        <div className="relative z-10 hidden h-full w-full items-center justify-center px-[8vw] pt-[96px] lg:flex">
          <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-16">
            <div className="max-w-[560px]">
              <h2 className="text-[56px] font-extrabold leading-[1.05] tracking-tight text-white">
                Hẹn tư Vấn
              </h2>
              <p className="mt-5 text-[18px] font-medium leading-relaxed text-white/90">
                Để lại thông tin của bạn, chúng tôi sẽ liên hệ để tư vấn ngay khi xác thực điểm số!
              </p>

              <button
                type="button"
                onClick={scrollToTop}
                className="mt-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/10 text-white shadow-sm backdrop-blur-sm hover:bg-white/15 active:opacity-90"
                aria-label="Lên đầu trang"
              >
                <ArrowUpIcon size={18} color="white" className="h-[18px] w-[18px]" />
              </button>
            </div>

            <form className="w-full max-w-[440px] space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label className="block text-[14px] font-semibold text-white">Hình thức liên hệ</label>
                <div className="relative">
                  <select
                    value={consultContactMethod}
                    onChange={(e) => setConsultContactMethod(e.target.value as any)}
                    className="h-[42px] w-full appearance-none rounded-[14px] bg-white/80 px-5 pr-12 text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md focus:bg-white/90"
                  >
                    <option value="zalo">Chọn cách bạn muốn chúng tôi liên hệ</option>
                    <option value="phone">Điện thoại</option>
                    <option value="email">Email</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center">
                    <span className="text-[13px] text-slate-500">⌄</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[14px] font-semibold text-white">Số Zalo</label>
                <div className="flex h-[42px] w-full overflow-hidden rounded-[14px] bg-white/80 shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur-md">
                  <div className="flex items-center gap-2 px-5 text-[14px] text-slate-700">
                    <select
                      value={consultZaloCountry}
                      onChange={(e) => setConsultZaloCountry(e.target.value as any)}
                      className="appearance-none bg-transparent font-medium outline-none"
                    >
                      <option value="VN">VN</option>
                    </select>
                    <span className="text-slate-500">⌄</span>
                  </div>
                  <div className="my-2 w-px bg-slate-200/70" />
                  <div className="flex flex-1 items-center px-5">
                    <span className="mr-2 text-[14px] text-slate-500">+84</span>
                    <input
                      value={consultZaloNumber}
                      onChange={(e) => setConsultZaloNumber(e.target.value)}
                      placeholder="(555) 000-0000"
                      inputMode="tel"
                      className="h-full w-full bg-transparent text-left text-[14px] text-slate-700 outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[14px] font-semibold text-white">Thời gian</label>
                <div className="relative">
                  <select
                    value={consultTimeSlot}
                    onChange={(e) => setConsultTimeSlot(e.target.value)}
                    className="h-[42px] w-full appearance-none rounded-[14px] bg-white/80 px-5 pr-12 text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md focus:bg-white/90"
                  >
                    <option value="" disabled>
                      Chọn khung thời gian nhận tư vấn
                    </option>
                    <option value="morning">Buổi sáng</option>
                    <option value="afternoon">Buổi chiều</option>
                    <option value="evening">Buổi tối</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center">
                    <span className="text-[13px] text-slate-500">⌄</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[14px] font-semibold text-white">Ghi chú</label>
                <textarea
                  value={consultTopic}
                  onChange={(e) => setConsultTopic(e.target.value)}
                  placeholder="Bạn muốn chúng tôi hỗ trợ thêm vấn đề gì"
                  rows={4}
                  className="w-full resize-none rounded-[14px] bg-white/80 px-5 py-3 text-left text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/90"
                />
              </div>

              <label className="flex items-start gap-3 text-left text-[13px] text-white/90">
                <input
                  type="checkbox"
                  checked={consultAgree}
                  onChange={(e) => setConsultAgree(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-md border-2 border-white/80 bg-transparent accent-white"
                />
                <span className="leading-snug">Bạn đồng ý với tất cả điều khoản bảo mật của Telesa</span>
              </label>

              <button
                type="submit"
                disabled={!consultAgree}
                className={[
                  "flex h-[48px] w-full items-center justify-center rounded-full text-center text-[16px] font-extrabold text-white shadow-[0_14px_28px_rgba(0,0,0,0.20)] disabled:opacity-100 disabled:cursor-not-allowed disabled:brightness-95",
                  primaryBgClass,
                ].join(" ")}
              >
                Xác nhận
              </button>
            </form>
          </div>
        </div>

        {/* Mobile */}
        <div className="relative z-10 flex h-full w-full max-w-md flex-col items-center px-4 pb-3 pt-5 lg:hidden">
          <MobileHeader
            className="w-full text-left gap-3"
            logoSrc={logoSrc}
            logoAlt={brandAlt}
            logoPriority
            onMenuOpen={() => setIsMenuOpen(true)}
            ctaClassName="rounded-full border border-white/80 bg-black/20 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md"
            menuButtonClassName="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full bg-black/20 text-white shadow-sm backdrop-blur-md"
            menuLineClassName="bg-white"
          />

          <div className="mx-auto mt-4 w-[80vw] max-w-full text-center">
            <h2 className="text-[26px] font-extrabold leading-[1.05] tracking-tight text-white">
              Hẹn Tư Vấn
            </h2>
            <p className="mt-1.5 text-[13px] font-medium leading-snug text-white/90">
              Để lại thông tin của bạn, chúng tôi sẽ liên hệ để tư vấn ngay khi
              xác thực điểm số!
            </p>
          </div>

          <form
            className="mt-3 flex w-full flex-1 flex-col gap-2.5"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
              <label className="block text-[13px] font-semibold text-white">
                Hình thức liên hệ
              </label>
              <div className="relative">
                <select
                  value={consultContactMethod}
                  onChange={(e) =>
                    setConsultContactMethod(e.target.value as any)
                  }
                  className="h-[40px] w-full appearance-none rounded-[14px] bg-white/70 px-4 pr-10 text-left text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md focus:bg-white/80"
                >
                  <option value="zalo">Zalo</option>
                  <option value="phone">Điện thoại</option>
                  <option value="email">Email</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                  <span className="text-[13px] text-slate-500">⌄</span>
                </div>
              </div>
            </div>

            <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
              <label className="block text-[13px] font-semibold text-white">
                Số Zalo
              </label>
              <div className="flex h-[40px] w-full overflow-hidden rounded-[14px] bg-white/70 shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur-md">
                <div className="flex items-center gap-2 px-4 text-[14px] text-slate-700">
                  <select
                    value={consultZaloCountry}
                    onChange={(e) =>
                      setConsultZaloCountry(e.target.value as any)
                    }
                    className="appearance-none bg-transparent font-medium outline-none"
                  >
                    <option value="VN">VN</option>
                  </select>
                  <span className="text-slate-500">⌄</span>
                </div>
                <div className="my-2 w-px bg-white/50" />
                <div className="flex flex-1 items-center px-4">
                  <span className="mr-2 text-[14px] text-slate-500">+84</span>
                  <input
                    value={consultZaloNumber}
                    onChange={(e) => setConsultZaloNumber(e.target.value)}
                    placeholder="(555) 000-0000"
                    inputMode="tel"
                    className="h-full w-full bg-transparent text-left text-[14px] text-slate-700 outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
              <label className="block text-[13px] font-semibold text-white">
                Thời gian
              </label>
              <div className="relative">
                <select
                  value={consultTimeSlot}
                  onChange={(e) => setConsultTimeSlot(e.target.value)}
                  className="h-[40px] w-full appearance-none rounded-[14px] bg-white/70 px-4 pr-10 text-left text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md focus:bg-white/80"
                >
                  <option value="" disabled>
                    Chọn khung thời gian nhận tư vấn
                  </option>
                  <option value="morning">Buổi sáng</option>
                  <option value="afternoon">Buổi chiều</option>
                  <option value="evening">Buổi tối</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                  <span className="text-[13px] text-slate-500">⌄</span>
                </div>
              </div>
            </div>

            <div className="mx-auto w-[80vw] max-w-full space-y-1 text-left">
              <label className="text-[13px] font-semibold text-white">
                Ghi chú
              </label>
              <textarea
                value={consultTopic}
                onChange={(e) => setConsultTopic(e.target.value)}
                placeholder="Bạn muốn chúng tôi hỗ trợ thêm về vấn đề gì"
                rows={2}
                className="w-full resize-none rounded-[14px] bg-white/70 px-4 py-2.5 text-left text-[14px] text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/80"
              />
            </div>

            <label className="mx-auto mt-0.5 flex w-[80vw] max-w-full items-start gap-3 text-left text-[13px] text-white/90">
              <input
                type="checkbox"
                checked={consultAgree}
                onChange={(e) => setConsultAgree(e.target.checked)}
                className="mt-1 h-4 w-4 rounded-md border-2 border-white/80 bg-transparent accent-white"
              />
              <span className="leading-snug">
                Bạn đồng ý với tất cả điều khoản bảo mật của Telesa
              </span>
            </label>

            <div className="mt-1 flex justify-center pb-1">
              <button
                type="submit"
                disabled={!consultAgree}
                className={[
                  "mx-auto h-[44px] w-[80vw] max-w-full rounded-[14px] text-center text-[16px] font-extrabold text-white shadow-[0_14px_28px_rgba(0,0,0,0.20)] disabled:opacity-100 disabled:cursor-not-allowed disabled:brightness-95",
                  primaryBgClass,
                ].join(" ")}
              >
                Xác nhận
              </button>
            </div>
          </form>

          <button
            type="button"
            onClick={scrollToTop}
            className="absolute bottom-5 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md"
            aria-label="Lên đầu trang"
          >
            <ArrowUpIcon size={20} className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* View 5: Contact options */}
      <section
        ref={contactSectionRef}
        className="relative flex h-[100dvh] w-full snap-start items-stretch justify-center bg-white text-slate-900"
      >
        {/* Desktop */}
        <div className="relative z-10 hidden h-full w-full flex-col items-center justify-center px-[8vw] py-[min(4.8vh,45px)] pt-[96px] lg:flex">
          <div className="w-full max-w-[1100px] text-center">
            <h2 className="text-[48px] font-extrabold tracking-tight text-slate-700">
              Liên Hệ Ngay Để Nhận Tư Vấn
            </h2>
            <p className="mx-auto mt-4 max-w-[760px] text-[20px] font-medium text-slate-500">
              Chúng tôi sẽ liên hệ lại ngay để tư vấn tận tình
            </p>
          </div>

          <div className="mt-[min(5.6vh,51px)] w-full max-w-[1180px]">
            <div className="grid grid-cols-3 gap-12">
              <a
                href={ZALO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Mở Zalo"
                className="rounded-[40px] bg-[#E6F7FE] p-10 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex h-14 w-14 items-center justify-center bg-transparent shadow-none">
                  <Image
                    src="/assets/svg/zalo.svg"
                    alt="Zalo"
                    width={44}
                    height={44}
                    className="h-10 w-10"
                  />
                </div>
                <h3 className="mt-8 text-[34px] font-extrabold text-slate-700">Zalo</h3>
                <p className="mt-3 text-[18px] font-medium text-slate-600">
                  Liên hệ với chúng tôi qua Zalo
                </p>
              </a>

              <a
                href={MESSENGER_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Mở Messenger"
                className="rounded-[40px] bg-[#FFF5FB] p-10 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex h-14 w-14 items-center justify-center bg-transparent shadow-none">
                  <Image
                    src="/assets/svg/messenger.svg"
                    alt="Messenger"
                    width={44}
                    height={44}
                    className="h-10 w-10"
                  />
                </div>
                <h3 className="mt-8 text-[34px] font-extrabold text-slate-700">Messenger</h3>
                <p className="mt-3 text-[18px] font-medium text-slate-600">
                  Nhắn tin với chúng tôi ngay
                </p>
              </a>

              <div className="rounded-[40px] bg-[#F4FCE8] p-10">
                <div className="flex h-14 w-14 items-center justify-center bg-transparent shadow-none">
                  <Image
                    src="/assets/svg/whatsapp.svg"
                    alt="Whatsapp"
                    width={44}
                    height={44}
                    className="h-10 w-10"
                  />
                </div>
                <h3 className="mt-8 text-[34px] font-extrabold text-slate-700">Whatsapp</h3>
                <p className="mt-3 text-[18px] font-medium text-slate-600">
                  Liên hệ với chúng tôi qua Whatsapp
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="relative z-10 flex h-full w-full max-w-md flex-col px-4 pb-6 pt-8 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="relative h-16 w-16">
              <Image
                src={logoSrc}
                alt={brandAlt}
                width={64}
                height={64}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsMenuOpen(true)}
              className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-slate-700"
            >
              <span className="block h-[2px] w-4 rounded-full bg-slate-800" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-800" />
              <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-800" />
            </button>
          </div>

          <div className="mt-6 text-center">
            <h2 className="text-[28px] font-extrabold leading-[1.1] tracking-tight text-slate-700">
              Liên hệ ngay để
              <br />
              nhận tư vấn
            </h2>
            <p className="mt-3 text-[14px] font-medium leading-snug text-slate-500">
              Chúng tôi sẽ liên hệ lại ngay để
              <br />
              tư vấn tận tình
            </p>
          </div>

          <div className="mt-5 flex flex-1 flex-col justify-center gap-2 pb-5">
            <a
              href={ZALO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Mở Zalo"
              className="rounded-[24px] bg-[#E6F7FE] px-5 py-3 transition-transform active:scale-[0.99]"
            >
              <Image
                src="/assets/svg/zalo.svg"
                alt="Zalo"
                width={32}
                height={32}
                className="h-8 w-8"
                unoptimized
              />
              <h3 className="mt-2 text-[22px] font-extrabold text-slate-700">Zalo</h3>
              <p className="mt-1 text-[14px] font-medium leading-snug text-slate-500">
                Liên hệ với chúng tôi qua Zalo
              </p>
            </a>

            <a
              href={MESSENGER_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Mở Messenger"
              className="rounded-[24px] bg-[#FFF5FB] px-5 py-3 transition-transform active:scale-[0.99]"
            >
              <Image
                src="/assets/svg/messenger.svg"
                alt="Messenger"
                width={32}
                height={32}
                className="h-8 w-8"
                unoptimized
              />
              <h3 className="mt-2 text-[22px] font-extrabold text-slate-700">Messenger</h3>
              <p className="mt-1 text-[14px] font-medium leading-snug text-slate-500">
                Nhắn tin với chúng tôi ngay
              </p>
            </a>

            <div className="rounded-[24px] bg-[#F4FCE8] px-5 py-3">
              <Image
                src="/assets/svg/whatsapp.svg"
                alt="Whatsapp"
                width={32}
                height={32}
                className="h-8 w-8"
                unoptimized
              />
              <h3 className="mt-2 text-[22px] font-extrabold text-slate-700">Whatsapp</h3>
              <p className="mt-1 text-[14px] font-medium leading-snug text-slate-500">
                Liên hệ với chúng tôi qua Whatsapp
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-6 right-6">
            <div className="pointer-events-auto">
              <button
                type="button"
                onClick={scrollToTop}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md"
                aria-label="Lên đầu trang"
              >
                <ArrowUpIcon size={20} className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
