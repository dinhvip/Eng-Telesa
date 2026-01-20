"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={props.className ?? "h-4 w-4"}
      {...props}
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
export type DesktopNavbarActionKey =
  | DesktopNavbarKey
  | "library-why"
  | "library-program-for-kid"
  | "library-what-is-tes"
  | "library-roadmap"
  | "library-why-group"
  | "library-1-1"
  | "library-payment-method";

export default function DesktopNavbar(props: {
  variant?: "kid" | "adult";
  logoSrc: string;
  activeKey: DesktopNavbarKey;
  onNavigate: (key: DesktopNavbarActionKey) => void;
  activeColor?: string;
  backgroundClassName?: string;
}) {
  const activeColor = props.activeColor ?? "#9e005a";
  const backgroundClassName = props.backgroundClassName ?? "bg-[#3b3b3b]/90";
  const variant = props.variant ?? "adult";
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const libraryCloseTimerRef = useRef<number | null>(null);

  const openLibraryMenu = () => {
    if (libraryCloseTimerRef.current != null) {
      window.clearTimeout(libraryCloseTimerRef.current);
      libraryCloseTimerRef.current = null;
    }
    setIsLibraryOpen(true);
  };

  const scheduleCloseLibraryMenu = () => {
    if (libraryCloseTimerRef.current != null) window.clearTimeout(libraryCloseTimerRef.current);
    libraryCloseTimerRef.current = window.setTimeout(() => {
      setIsLibraryOpen(false);
      libraryCloseTimerRef.current = null;
    }, 200);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLibraryOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (libraryCloseTimerRef.current != null) {
        window.clearTimeout(libraryCloseTimerRef.current);
        libraryCloseTimerRef.current = null;
      }
    };
  }, []);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 hidden lg:block">
      <div className={backgroundClassName}>
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
                const isLibrary = item.key === "library";
                return (
                  <div
                    key={item.key}
                    className="relative"
                    onMouseEnter={() => {
                      if (isLibrary) openLibraryMenu();
                    }}
                    onMouseLeave={() => {
                      if (isLibrary) scheduleCloseLibraryMenu();
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (isLibrary) {
                          setIsLibraryOpen((prev) => !prev);
                          return;
                        }
                        props.onNavigate(item.key);
                      }}
                      className={`inline-flex items-center gap-1 transition-colors ${
                        isActive ? "" : "text-white/90 hover:text-white"
                      } cursor-pointer`}
                      style={isActive ? { color: activeColor } : undefined}
                      aria-haspopup={isLibrary ? "menu" : undefined}
                      aria-expanded={isLibrary ? isLibraryOpen : undefined}
                    >
                      <span className="whitespace-nowrap">
                        <span className="xl:hidden">{item.shortLabel}</span>
                        <span className="hidden xl:inline">{item.label}</span>
                      </span>
                      {item.hasDropdown && (
                        <ChevronDownIcon
                          className={`h-3 w-3 shrink-0 ${
                            isActive ? "" : "text-white/80"
                          }`}
                          style={isActive ? { color: activeColor } : undefined}
                        />
                      )}
                    </button>

                    {isLibrary && isLibraryOpen && (
                      <div
                        className="absolute left-0 top-full pt-3"
                        onMouseEnter={openLibraryMenu}
                        onMouseLeave={scheduleCloseLibraryMenu}
                      >
                        <div
                          role="menu"
                          className="w-[260px] overflow-hidden rounded-2xl bg-white shadow-[0_18px_48px_rgba(0,0,0,0.25)] ring-1 ring-black/5"
                        >
                          {variant === "adult" ? (
                            <>
                              <button
                                type="button"
                                role="menuitem"
                                className="block w-full px-4 py-3 text-left text-[14px] font-semibold text-slate-900 hover:bg-slate-50"
                                onClick={() => {
                                  setIsLibraryOpen(false);
                                  props.onNavigate("library-what-is-tes");
                                }}
                              >
                                T.E.S là gì?
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                className="block w-full px-4 py-3 text-left text-[14px] font-semibold text-slate-900 hover:bg-slate-50"
                                onClick={() => {
                                  setIsLibraryOpen(false);
                                  props.onNavigate("library-1-1");
                                }}
                              >
                                Học kèm 1-1
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                className="block w-full px-4 py-3 text-left text-[14px] font-semibold text-slate-900 hover:bg-slate-50"
                                onClick={() => {
                                  setIsLibraryOpen(false);
                                  props.onNavigate("library-payment-method");
                                }}
                              >
                                Phương thức thanh toán
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                className="block w-full px-4 py-3 text-left text-[14px] font-semibold text-slate-900 hover:bg-slate-50"
                                onClick={() => {
                                  setIsLibraryOpen(false);
                                  props.onNavigate("library-why-group");
                                }}
                              >
                                Chương trình học nhóm
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                className="block w-full px-4 py-3 text-left text-[14px] font-semibold text-slate-900 hover:bg-slate-50"
                                onClick={() => {
                                  setIsLibraryOpen(false);
                                  props.onNavigate("library-roadmap");
                                }}
                              >
                                Lộ trình học
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                role="menuitem"
                                className="block w-full px-4 py-3 text-left text-[14px] font-semibold text-slate-900 hover:bg-slate-50"
                                onClick={() => {
                                  setIsLibraryOpen(false);
                                  props.onNavigate("library-why");
                                }}
                              >
                                Vì sao chọn Telesa
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                className="block w-full px-4 py-3 text-left text-[14px] font-semibold text-slate-900 hover:bg-slate-50"
                                onClick={() => {
                                  setIsLibraryOpen(false);
                                  props.onNavigate("library-program-for-kid");
                                }}
                              >
                                Chương trình cho bé
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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
