"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ModalLogin from "./ModalLogin";

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
  onTestClick?: () => void;
  accountName?: string;
  accountEmail?: string;
  accountAvatarSrc?: string;
  onAccountUpdate?: () => void;
  onLogout?: () => void;
  activeColor?: string;
  backgroundClassName?: string;
}) {
  const activeColor = props.activeColor ?? "#9e005a";
  const backgroundClassName = props.backgroundClassName ?? "bg-[#3b3b3b]/90";
  const variant = props.variant ?? "adult";
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAccountMounted, setIsAccountMounted] = useState(false);
  const [isAccountVisible, setIsAccountVisible] = useState(false);
  const libraryCloseTimerRef = useRef<number | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const [isModalLoginOpen, setIsModalLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    name?: string;
    email?: string;
    photo?: string | null;
  } | null>(null);

  useEffect(() => {
    setIsLoggedIn(document.cookie.includes("auth_token="));
    try {
      const stored = localStorage.getItem("telesa_user_info");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserInfo({
          name: parsed.username || (parsed.last_name ? `${parsed.last_name} ${parsed.first_name}` : parsed.first_name),
          email: parsed.email,
          photo: parsed.photo,
        });
      }
    } catch (e) { }
  }, []);

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
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsAccountOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!isAccountOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = accountRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setIsAccountOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [isAccountOpen]);

  useEffect(() => {
    if (isAccountOpen) {
      setIsAccountMounted(true);
      const raf = window.requestAnimationFrame(() => setIsAccountVisible(true));
      return () => window.cancelAnimationFrame(raf);
    }

    setIsAccountVisible(false);
    const t = window.setTimeout(() => setIsAccountMounted(false), 180);
    return () => window.clearTimeout(t);
  }, [isAccountOpen]);

  useEffect(() => {
    return () => {
      if (libraryCloseTimerRef.current != null) {
        window.clearTimeout(libraryCloseTimerRef.current);
        libraryCloseTimerRef.current = null;
      }
    };
  }, []);

  const accountName = userInfo?.name || "No Name";
  const accountEmail = userInfo?.email || "No Email";
  const finalAccountAvatarSrc = userInfo?.photo;
  const accountInitials = accountName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 hidden lg:block">
        <div className={backgroundClassName}>
          <div className="mx-auto flex w-full items-start justify-between gap-2 px-2 py-4 lg:px-4 xl:gap-8 xl:px-[8vw]">
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

              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-[clamp(6px,1vw,18px)] gap-y-2 pr-2 text-[clamp(9px,0.9vw,14px)] font-semibold leading-tight text-white xl:gap-x-7 xl:pr-0 xl:text-[clamp(12px,1.05vw,16px)]">
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
                        className={`inline-flex items-center gap-1 transition-colors ${isActive ? "" : "text-white/90 hover:text-pink-500"
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
                            className={`h-3 w-3 shrink-0 ${isActive ? "" : "text-white/80"
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
                onClick={props.onTestClick}
                disabled={!props.onTestClick}
                aria-disabled={!props.onTestClick || undefined}
                className="rounded-[32px] border border-white/90 bg-white/0 px-2.5 py-2 text-[clamp(9px,0.75vw,12px)] font-semibold text-white shadow-sm transition-colors hover:bg-white/10 xl:px-3.5 xl:py-2 xl:text-[clamp(12px,0.9vw,14px)]"
              >
                <span className="xl:hidden">Làm bài</span>
                <span className="hidden xl:inline">Làm bài kiểm tra</span>
              </button>
              <button
                type="button"
                className="rounded-[32px] border border-white/90 bg-white/0 px-2.5 py-2 text-[clamp(9px,0.75vw,12px)] font-semibold text-white shadow-sm transition-colors hover:bg-white/10 xl:px-3.5 xl:py-2 xl:text-[clamp(12px,0.9vw,14px)]"
              >
                <span className="xl:hidden">Góc học</span>
                <span className="hidden xl:inline">Góc học tập</span>
              </button>
              <button
                onClick={() => router.push("/admin")}
                type="button"
                className="cursor-pointer rounded-[32px] border border-white/90 bg-white/0 px-2.5 py-2 text-[clamp(9px,0.75vw,12px)] font-semibold text-white shadow-sm transition-colors hover:bg-white/10 xl:px-3.5 xl:py-2 xl:text-[clamp(12px,0.9vw,14px)]"
              >
                <span className="xl:hidden">Admin</span>
                <span className="hidden xl:inline">Admin</span>
              </button>

              {/* đăng ký/đăng nhập */}
              {!isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => setIsModalLoginOpen(true)}
                  className="cursor-pointer rounded-[32px] border border-white/90 bg-white/0 px-2.5 py-2 text-[clamp(9px,0.75vw,12px)] font-semibold text-white shadow-sm transition-colors hover:bg-white/10 xl:px-3.5 xl:py-2 xl:text-[clamp(12px,0.9vw,14px)]"
                >
                  <span className="xl:hidden">Đăng ký/Đăng nhập</span>
                  <span className="hidden xl:inline">Đăng ký/Đăng nhập</span>
                </button>
              ) : (
                <div ref={accountRef} className="relative">
                  <button
                    type="button"
                    aria-label="Account menu"
                    aria-expanded={isAccountOpen}
                    className="flex items-center gap-2 rounded-full py-1 pl-2 pr-1 text-white/90 hover:text-white"
                    onClick={() => setIsAccountOpen((prev) => !prev)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-500 text-[14px] font-semibold text-slate-900 ring-2 ring-white/70">
                      {accountInitials || "NAME"}
                    </div>
                    <ChevronDownIcon className="h-4 w-4 text-white/80" />
                  </button>

                  {isAccountMounted && (
                    <div
                      className={[
                        "absolute right-0 top-full z-50 mt-3 w-[230px] origin-top-right",
                        "transition-[transform,opacity,filter] duration-200 ease-out will-change-transform will-change-opacity",
                        "motion-reduce:transition-none motion-reduce:transform-none motion-reduce:filter-none",
                        isAccountVisible
                          ? "opacity-100 translate-y-0 scale-100 blur-0"
                          : "pointer-events-none opacity-0 -translate-y-1 scale-[0.98] blur-[1px]",
                      ].join(" ")}
                    >
                      <div
                        role="menu"
                        className="overflow-hidden rounded-[28px] bg-white shadow-[0_22px_60px_rgba(0,0,0,0.22)] ring-1 ring-black/5"
                      >
                        <div className="flex items-center gap-3 px-4 pb-3 pt-4">
                          <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-500 text-[16px] font-semibold text-slate-900">
                            {accountInitials || "NAME"}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-normal leading-tight text-slate-800">
                              {accountName}
                            </p>
                            <p className="truncate text-[12px] font-normal text-slate-600">{accountEmail}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          role="menuitem"
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] font-normal text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                          onClick={() => {
                            setIsAccountOpen(false);
                            props.onAccountUpdate?.();
                          }}
                        >
                          <Image
                            src="/assets/svg/user-pen-alt.svg"
                            alt=""
                            width={20}
                            height={20}
                            className="h-5 w-5"
                            unoptimized
                          />
                          <span>Cập nhật thông tin cá nhân</span>
                        </button>

                        <div className="px-4 pb-4 pt-3">
                          <button
                            type="button"
                            role="menuitem"
                            className="flex w-full items-center justify-center gap-3 rounded-[16px] border-2 border-red-500 px-4 py-3 text-[13px] font-bold text-red-500 hover:bg-red-50 active:bg-red-100"
                            onClick={() => {
                              setIsAccountOpen(false);
                              document.cookie = "auth_token=; path=/; max-age=0";
                              localStorage.removeItem("telesa_user_info");
                              setIsLoggedIn(false);
                              window.location.reload();
                              props.onLogout?.();
                            }}
                          >
                            <Image
                              src="/assets/svg/logout.svg"
                              alt=""
                              width={20}
                              height={20}
                              className="h-5 w-5"
                              unoptimized
                            />
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <ModalLogin open={isModalLoginOpen} onClose={() => setIsModalLoginOpen(false)} />
    </>
  );
}
