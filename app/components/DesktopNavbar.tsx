"use client";

import Image from "next/image";

function ChevronDownIcon(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={props.className ?? "h-4 w-4"}
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const MENU_ITEMS = [
  { key: "home" as const, label: "Trang chủ", shortLabel: "Trang chủ", hasDropdown: true },
  { key: "products" as const, label: "Sản phẩm", shortLabel: "Sản phẩm", hasDropdown: true },
  {
    key: "tutoring" as const,
    label: "Học kèm với giáo viên",
    shortLabel: "Học kèm GV",
    hasDropdown: false,
  },
  { key: "about" as const, label: "Về Telesa", shortLabel: "Về Telesa", hasDropdown: false },
  { key: "library" as const, label: "Thư viện", shortLabel: "Thư viện", hasDropdown: true },
  { key: "careers" as const, label: "Tuyển dụng", shortLabel: "Tuyển dụng", hasDropdown: false },
];

export type DesktopNavbarKey = (typeof MENU_ITEMS)[number]["key"];

export default function DesktopNavbar(props: {
  logoSrc: string;
  activeKey: DesktopNavbarKey;
  onNavigate: (key: DesktopNavbarKey) => void;
}) {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 hidden lg:block">
      <div className="bg-[#3b3b3b]/90">
        <div className="mx-auto flex w-full items-center justify-between gap-4 px-[8vw] py-4 xl:gap-8">
          <div className="flex min-w-0 items-center gap-3 xl:gap-6">
            <div className="relative h-10 w-10 shrink-0 xl:h-11 xl:w-11">
              <Image
                src={props.logoSrc}
                alt="Telesa English logo"
                width={44}
                height={44}
                className="h-full w-full object-contain"
                priority
              />
            </div>

            <div className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-white xl:gap-7 xl:text-[16px]">
              {MENU_ITEMS.map((item) => {
                const isActive = item.key === props.activeKey;
                const isClickable = item.key === "home";
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      if (!isClickable) return;
                      props.onNavigate("home");
                    }}
                    className={`inline-flex items-center gap-1 transition-colors ${
                      isClickable ? "cursor-pointer" : "cursor-default"
                    } ${isActive ? "text-[#9e005a]" : "text-white/90 hover:text-white"}`}
                  >
                    <span className="whitespace-nowrap">
                      <span className="xl:hidden">{item.shortLabel}</span>
                      <span className="hidden xl:inline">{item.label}</span>
                    </span>
                    {item.hasDropdown && (
                      <ChevronDownIcon
                        className={`h-3 w-3 shrink-0 ${
                          isActive ? "text-[#9e005a]" : "text-white/80"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 xl:gap-4">
            <button
              type="button"
              className="rounded-[32px] border border-white/90 bg-white/0 px-3.5 py-2 text-[10px] font-semibold text-white shadow-sm transition-colors hover:bg-white/10 xl:px-8 xl:py-3 xl:text-sm"
            >
              <span className="xl:hidden">Làm bài</span>
              <span className="hidden xl:inline">Làm bài kiểm tra</span>
            </button>
            <button
              type="button"
              className="rounded-[32px] border border-white/90 bg-white/0 px-3.5 py-2 text-[10px] font-semibold text-white shadow-sm transition-colors hover:bg-white/10 xl:px-8 xl:py-3 xl:text-sm"
            >
              <span className="xl:hidden">Góc học</span>
              <span className="hidden xl:inline">Góc học tập</span>
            </button>

            <button
              type="button"
              aria-label="Account menu"
              className="flex items-center gap-2 rounded-full py-1 pl-2 pr-1 text-white/90 hover:text-white"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 ring-2 ring-white/70" />
              <ChevronDownIcon className="h-4 w-4 text-white/80" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

