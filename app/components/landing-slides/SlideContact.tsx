import Image from "next/image";
import MobileHeader from "../MobileHeader";
import ArrowUpIcon from "../ArrowUpIcon";

export const MESSENGER_URL = "https://m.me/telesaenglish";
export const ZALO_URL = "https://zalo.me/422204559560377038";

interface SlideContactProps {
  variant: "kid" | "adult";
  onMenuOpen: () => void;
  onScrollToTop: () => void;
}

export default function SlideContact({
  variant,
  onMenuOpen,
  onScrollToTop,
}: SlideContactProps) {
  const isKid = variant === "kid";
  const logoSrc = isKid ? "/assets/logo.png" : "/assets/svg/logo.png";

  const titleMobile = isKid ? (
    <>
      Hoặc kết nối qua...
      <br />
      để nhận tư vấn
    </>
  ) : (
    <>
      Hoặc Liên Hệ Ngay Để
      <br />
      Nhận Tư Vấn
    </>
  );

  const titleDesktop = isKid
    ? "Hoặc kết nối qua... để nhận tư vấn"
    : "Hoặc Liên Hệ Ngay Để Nhận Tư Vấn";

  const subtitle = isKid
    ? "Chúng tôi sẽ liên hệ lại ngay để tư vấn tận tình"
    : "Chúng tôi sẽ liên hệ lại ngay để tư vấn tận tình";

  return (
    <section className="relative flex telesa-vh-100 w-full snap-start items-stretch justify-center bg-white text-slate-900">
      {/* ─── MOBILE ─── */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col px-4 pb-6 pt-8 lg:hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="relative h-16 w-16">
            <Image
              src={logoSrc}
              alt="Telesa English logo"
              width={64}
              height={64}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <button
            type="button"
            aria-label="Open menu"
            onClick={onMenuOpen}
            className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-transparent text-slate-700"
          >
            <span className="block h-[2px] w-4 rounded-full bg-slate-800" />
            <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-800" />
            <span className="mt-[3px] block h-[2px] w-4 rounded-full bg-slate-800" />
          </button>
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-[28px] font-extrabold leading-[1.1] tracking-tight text-slate-700">
            {titleMobile}
          </h2>
          <p className="mt-3 text-[14px] font-medium leading-snug text-slate-500">
            {isKid ? (
              <>
                Chúng tôi sẽ liên hệ lại ngay để
                <br />
                tư vấn tận tình
              </>
            ) : (
              <>
                Chúng tôi sẽ liên hệ lại ngay để
                <br />
                tư vấn tận tình
              </>
            )}
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
              onClick={onScrollToTop}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md"
              aria-label="Lên đầu trang"
            >
              <ArrowUpIcon size={20} className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── DESKTOP ─── */}
      <div className="relative z-10 mt-[80px] hidden h-[calc(100dvh-80px)] w-full flex-col items-center justify-center px-[8vw] py-[min(4.8vh,45px)] lg:flex">
        <div className="w-full max-w-[1100px] text-center">
          <h2 data-gsap-heading className="text-[48px] font-extrabold tracking-tight text-slate-700">
            {titleDesktop}
          </h2>
          <p className="mx-auto mt-4 max-w-[760px] text-[20px] font-medium text-slate-500">
            {subtitle}
          </p>
        </div>

        <div className="mt-[min(5.6vh,51px)] w-full max-w-[1180px]">
          <div className="grid grid-cols-3 gap-12">
            <a
              href={ZALO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Mở Zalo"
              data-gsap-card
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
              data-gsap-card
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

            <div data-gsap-card className="rounded-[40px] bg-[#F4FCE8] p-10">
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
    </section>
  );
}
