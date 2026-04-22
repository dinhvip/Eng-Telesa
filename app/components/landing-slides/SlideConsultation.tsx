import Image from "next/image";
import MobileHeader from "../MobileHeader";
import ArrowUpIcon from "../ArrowUpIcon";

export interface ConsultationFormState {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  contactMethod: "zalo" | "phone" | "email";
  setContactMethod: (v: "zalo" | "phone" | "email") => void;
  zaloCountry: "VN";
  setZaloCountry: (v: "VN") => void;
  zaloNumber: string;
  setZaloNumber: (v: string) => void;
  topic: string;
  setTopic: (v: string) => void;
  agree: boolean;
  setAgree: (v: boolean) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

interface SlideConsultationProps {
  variant: "kid" | "adult";
  onMenuOpen: () => void;
  onCtaClick: () => void;
  onScrollToTop: () => void;
  openConsultOverlay: () => void;
  formState: ConsultationFormState;
}

export default function SlideConsultation({
  variant,
  onMenuOpen,
  onCtaClick,
  onScrollToTop,
  openConsultOverlay,
  formState,
}: SlideConsultationProps) {
  const isKid = variant === "kid";
  const logoSrc = isKid ? "/assets/logo.png" : "/assets/svg/logo.png";
  const logoAlt = isKid ? "Telesa English Kids logo" : "Telesa English logo";

  const {
    name,
    setName,
    email,
    setEmail,
    contactMethod,
    setContactMethod,
    zaloCountry,
    setZaloCountry,
    zaloNumber,
    setZaloNumber,
    topic,
    setTopic,
    agree,
    setAgree,
    isSubmitting,
    onSubmit,
  } = formState;

  const mobileBg = isKid ? "bg-[#FFF6ED]" : "bg-black text-white";
  const mobileInputBg = isKid ? "bg-white" : "bg-white/20 backdrop-blur-md";
  const mobileInputText = isKid ? "text-[#986400]" : "text-white placeholder:text-white/70";
  const mobileLabel = isKid ? "text-[#FEA933]" : "text-white";
  const overlayBg = isKid ? "#6B510033" : "#59033933";

  return (
    <section
      id={`consultation-${variant}`}
      className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center overflow-hidden bg-black text-white"
    >
      <Image
        src={isKid ? "/assets/10-1.jpg" : "/assets/10-2.jpg"}
        alt="Telesa English consultation"
        fill
        priority
        quality={100}
        unoptimized
        sizes="100vw"
        className="pointer-events-none select-none object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundColor: overlayBg }}
      />

      {/* ─── MOBILE ─── */}
      <div className={`relative z-10 flex h-full w-full max-w-md flex-col items-center px-4 pb-3 pt-5 lg:hidden`}>
        <MobileHeader
          className="w-full text-left gap-3"
          logoSrc={logoSrc}
          logoAlt={logoAlt}
          logoPriority
          onMenuOpen={onMenuOpen}
          onCtaClick={onCtaClick}
          {...(!isKid && { logoWrapperClassName: "relative h-[50px] w-[50px] shrink-0", logoImageSize: 50 })}
          ctaClassName={`rounded-full border px-4 py-2 text-xs font-medium shadow-sm backdrop-blur-md ${isKid ? "border-white/80 bg-black/20 text-white" : "border-white/80 bg-black/20 text-white"}`}
          menuButtonClassName={`flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-full shadow-sm backdrop-blur-md ${isKid ? "bg-black/20 text-white" : "bg-black/20 text-white"}`}
          menuLineClassName="bg-white"
        />

        <div className="flex w-full flex-1 flex-col items-center justify-center pb-16">
          <div className="mx-auto w-[80vw] max-w-full text-center">
            <h2 className="text-[26px] font-extrabold leading-[1.05] tracking-tight text-white">
              Form Đăng Ký Tư Vấn
            </h2>
            <p className="mt-2 text-[13px] font-medium leading-snug text-white/90">
              Mở form để nhập thông tin tư vấn
            </p>
          </div>

          <button
            type="button"
            onClick={openConsultOverlay}
            className={`mt-6 w-[80vw] max-w-full rounded-[14px] px-4 py-3 text-center text-[15px] font-extrabold text-white shadow-[0_14px_28px_rgba(0,0,0,0.22)] active:scale-[0.99] ${isKid ? "bg-[#FFC000]" : "bg-[#D40887]"}`}
          >
            Mở form tư vấn
          </button>
        </div>

        <button
          type="button"
          onClick={onScrollToTop}
          className="absolute bottom-5 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md"
          aria-label="Lên đầu trang"
        >
          <ArrowUpIcon size={20} className="h-5 w-5" />
        </button>
      </div>

      {/* ─── DESKTOP ─── */}
      <div className="relative z-10 mt-[80px] hidden h-[calc(100dvh-80px)] w-full flex-col items-center justify-center px-[8vw] py-[min(4vh,32px)] lg:flex">
        <div className="w-full max-w-[920px] text-center">
          <h2 className="text-[clamp(29px,4vh,37px)] font-extrabold leading-[1.05] tracking-tight text-white">
            Form Đăng Ký Tư Vấn
          </h2>
          <p className="mx-auto mt-[min(1.45vh,9px)] max-w-[760px] text-[clamp(12px,1.75vh,14px)] font-medium leading-relaxed text-white/90">
            Để lại thông tin của bạn, chúng tôi sẽ liên hệ để tư vấn ngay!
          </p>
        </div>

        <form
          className="mt-[min(2.9vh,22px)] flex w-full max-w-[920px] flex-col gap-[min(1.7vh,14px)]"
          onSubmit={onSubmit}
        >
          <div className="space-y-2 text-left">
            <label className="block text-[13px] font-semibold text-white">Tên</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên của bạn"
              className="h-[clamp(35px,4.2vh,40px)] w-full rounded-[16px] bg-white/55 px-4 text-left text-[13px] text-slate-700 shadow-[0_12px_28px_rgba(0,0,0,0.22)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/70"
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="block text-[13px] font-semibold text-white">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              inputMode="email"
              className="h-[clamp(35px,4.2vh,40px)] w-full rounded-[16px] bg-white/55 px-4 text-left text-[13px] text-slate-700 shadow-[0_12px_28px_rgba(0,0,0,0.22)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/70"
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="block text-[13px] font-semibold text-white">Hình thức liên hệ</label>
            <div className="relative">
              <select
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value as any)}
                className="h-[clamp(35px,4.2vh,40px)] w-full appearance-none rounded-[16px] bg-white/55 px-4 pr-9 text-left text-[13px] text-slate-700 shadow-[0_12px_28px_rgba(0,0,0,0.22)] outline-none backdrop-blur-md focus:bg-white/70"
              >
                <option value="zalo">Zalo</option>
                <option value="phone">Điện thoại</option>
                <option value="email">Email</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                <span className="text-[13px] text-slate-600">⌄</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="block text-[13px] font-semibold text-white">Số Zalo</label>
            <div className="flex h-[clamp(35px,4.2vh,40px)] w-full overflow-hidden rounded-[16px] bg-white/55 shadow-[0_12px_28px_rgba(0,0,0,0.22)] backdrop-blur-md">
              <div className="flex items-center gap-2 px-4 text-[13px] text-slate-700">
                <select
                  value={zaloCountry}
                  onChange={(e) => setZaloCountry(e.target.value as any)}
                  className="appearance-none bg-transparent font-semibold outline-none"
                >
                  <option value="VN">VN</option>
                </select>
                <span className="text-slate-600">⌄</span>
              </div>
              <div className="my-2 w-px bg-white/55" />
              <div className="flex flex-1 items-center px-4">
                <span className="mr-2 text-[13px] text-slate-600">+84</span>
                <input
                  value={zaloNumber}
                  onChange={(e) => setZaloNumber(e.target.value)}
                  placeholder="(555) 000-0000"
                  inputMode="tel"
                  className="h-full w-full bg-transparent text-left text-[13px] text-slate-700 outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[13px] font-semibold text-white">Vấn đề cần tư vấn</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Bạn muốn chúng tôi hỗ trợ thêm về vấn đề gì"
              rows={3}
              className="h-[clamp(64px,12.5vh,92px)] w-full resize-none rounded-[16px] bg-white/55 px-4 py-2.5 text-left text-[13px] text-slate-700 shadow-[0_12px_28px_rgba(0,0,0,0.22)] outline-none backdrop-blur-md placeholder:text-slate-500 focus:bg-white/70"
            />
          </div>

          <label className="mt-1 flex items-start gap-3 text-left text-[13px] text-white/90">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 h-[18px] w-[18px] rounded-md border-2 border-white/80 bg-transparent accent-white"
            />
            <span className="leading-snug">Bạn đồng ý với tất cả điều khoản bảo mật của Telesa</span>
          </label>

          <div className="mt-3 flex justify-center">
            <button
              type="submit"
              disabled={!agree || isSubmitting}
              className={`h-[clamp(40px,5.3vh,44px)] w-full max-w-[506px] rounded-[16px] text-center text-[15px] font-extrabold text-white shadow-[0_14px_34px_rgba(0,0,0,0.24)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-100 disabled:brightness-95 ${isKid ? "bg-[#FFC000]" : "bg-[#C1077B]"}`}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
