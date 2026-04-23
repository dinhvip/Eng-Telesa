"use client";

import Image from "next/image";
import { Open_Sans } from "next/font/google";
import { useEffect, useMemo, useState } from "react";
import ModalLogin from "./ModalLogin";

type MenuVariant = "kid" | "adult";

type MobileMenuDrawerProps = {
  open: boolean;
  variant: MenuVariant;
  logoSrc: string;
  activeKey?: string;
  onClose: () => void;
  onNavigate?: (key: string) => void;
};

type MenuItem =
  | { key: string; label: string }
  | { key: string; label: string; children: { key: string; label: string }[] };

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M6 6l12 12M18 6L6 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M4 7h16M4 12h16M4 17h16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const openSans = Open_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
  display: "swap",
});

export const MobileMenuButton = ({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Open menu"
    className={
      className ??
      "fixed right-4 top-4 z-40 rounded-full bg-white/85 p-2 text-slate-900 shadow-sm ring-1 ring-black/5 backdrop-blur md:hidden"
    }
  >
    <MenuIcon className="h-6 w-6" />
  </button>
);

export default function MobileMenuDrawer({
  open,
  variant,
  logoSrc,
  activeKey,
  onClose,
  onNavigate,
}: MobileMenuDrawerProps) {
  const [language, setLanguage] = useState<"vi" | "en">("vi");
  const [isAccountExpanded, setIsAccountExpanded] = useState(true);
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isModalLoginOpen, setIsModalLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    name?: string;
    email?: string;
    photo?: string | null;
  } | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);
  const items = useMemo<MenuItem[]>(
    () => {
      const baseItems: MenuItem[] = [
        { key: "home", label: "Trang chủ" },
        { key: "product", label: "Sản phẩm" },
        { key: "teacher", label: "Học kèm với giáo viên" },
        { key: "about", label: "Về Telesa" },
        {
          key: "library",
          label: "Thư viện",
          children:
            variant === "adult"
              ? [
                { key: "library-what-is-tes", label: "T.E.S là gì?" },
                { key: "library-1-1", label: "Học kèm 1-1" },
                { key: "library-payment-method", label: "Phương thức thanh toán" },
                { key: "library-why-group", label: "Chương trình học nhóm" },
                { key: "library-roadmap", label: "Lộ trình học" },
              ]
              : [
                { key: "library-why", label: "Vì sao chọn Telesa" },
                { key: "library-program-for-kid", label: "Chương trình cho bé" },
              ],
        },
        { key: "career", label: "Tuyển dụng" },
      ];

      if (roleId === 1) {
        baseItems.push({ key: "admin", label: "Admin" });
      }

      return baseItems;
    },
    [variant, roleId]
  );
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
        if (parsed.role_id) {
          setRoleId(Number(parsed.role_id));
        }
      }
      const directRoleId = localStorage.getItem("role_id");
      if (directRoleId) {
        setRoleId(Number(directRoleId));
      }
    } catch (e) { }
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      const raf = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    setIsVisible(false);
    const t = window.setTimeout(() => setIsMounted(false), 420);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!isMounted) return null;

  const accountName = userInfo?.name || "No Name";
  const accountEmail = userInfo?.email || "No Email";
  const accountInitials = accountName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden transition-opacity duration-400 ${isVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className={`absolute inset-0 bg-black/20 transition-opacity duration-400 ${isVisible ? "opacity-100" : "opacity-0"
          }`}
        aria-label="Close menu"
        onClick={onClose}
      />

      <div
        className={`absolute inset-0 bg-white transition-[transform,opacity] duration-400 ease-out ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"
          }`}
      >
        <div className="mx-auto flex h-full max-w-md flex-col">
          <header className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+12px)]">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12">
                <Image
                  src={logoSrc}
                  alt={variant === "kid" ? "Telesa English Kids" : "Telesa English"}
                  fill
                  sizes="48px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="rounded-full p-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-5 pb-24 pt-6">
            <nav className="space-y-4">
              {items.map((item) => {
                const hasChildren = "children" in item;
                const isActive =
                  item.key === activeKey ||
                  (hasChildren && item.children.some((child) => child.key === activeKey));

                if (!hasChildren) {
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        onNavigate?.(item.key);
                        onClose();
                      }}
                      className={`block w-full text-left text-[18px] ${item.key === "home" ? "font-[700]" : "font-[400]"
                        } leading-snug tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D40887]/40 ${isActive
                          ? "text-[#D40887]"
                          : "text-slate-900 hover:text-[#D40887]"
                        }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </button>
                  );
                }

                return (
                  <div key={item.key} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsLibraryExpanded((prev) => !prev)}
                      className={`flex w-full items-center justify-between text-left text-[18px] font-[400] leading-snug tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D40887]/40 ${isActive
                        ? "text-[#D40887]"
                        : "text-slate-900 hover:text-[#D40887]"
                        }`}
                      aria-expanded={isLibraryExpanded}
                    >
                      <span>{item.label}</span>
                      <ChevronDownIcon
                        className={`h-5 w-5 transition-transform ${isLibraryExpanded ? "rotate-0" : "-rotate-90"
                          }`}
                      />
                    </button>

                    <div
                      className={`space-y-1 overflow-hidden pl-4 transition-[max-height,opacity] duration-200 ease-out ${isLibraryExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                    >
                      {item.children.map((child) => {
                        const isChildActive = child.key === activeKey;
                        return (
                          <button
                            key={child.key}
                            type="button"
                            onClick={() => {
                              if (
                                child.key === "library-why" ||
                                child.key === "library-program-for-kid" ||
                                child.key === "library-what-is-tes" ||
                                child.key === "library-roadmap" ||
                                child.key === "library-why-group" ||
                                child.key === "library-1-1" ||
                                child.key === "library-payment-method"
                              ) {
                                try {
                                  sessionStorage.setItem("telesa:openMenuOnBack", "1");
                                  sessionStorage.setItem(
                                    "telesa:openMenuOnBack:returnTo",
                                    `${window.location.pathname}${window.location.search}`,
                                  );
                                } catch { }
                              }
                              onNavigate?.(child.key);
                              onClose();
                            }}
                            className={`block w-full rounded-xl px-3 py-2 text-left text-[15px] font-[400] leading-snug tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D40887]/40 ${isChildActive
                              ? "bg-[#D40887]/10 text-[#D40887]"
                              : "text-slate-700 hover:bg-slate-50 hover:text-[#D40887]"
                              }`}
                            aria-current={isChildActive ? "page" : undefined}
                          >
                            {child.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            {isLoggedIn && <div className="mt-6 border-t border-slate-200 pt-4">
              <button
                type="button"
                className="flex w-full items-center gap-3 text-left"
                aria-expanded={isAccountExpanded}
                aria-controls="mobile-menu-account"
                onClick={() => setIsAccountExpanded((prev) => !prev)}
              >
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-[12px] font-[400] text-slate-700">
                  {accountInitials || "NAME"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-slate-700">
                    {accountName}
                  </p>
                  <p className="truncate text-[12px] text-slate-500">
                    {accountEmail}
                  </p>
                </div>
                <ChevronDownIcon
                  className={`h-4 w-4 text-slate-500 transition-transform ${isAccountExpanded ? "rotate-0" : "-rotate-90"
                    }`}
                />
              </button>

              <div
                id="mobile-menu-account"
                className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${isAccountExpanded ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                  }`}
              >
                <button
                  type="button"
                  className="mt-3 flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left text-[14px] font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                >
                  <Image
                    src="/assets/svg/user-pen-alt.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4"
                    unoptimized
                  />
                  <span>Cập nhật thông tin cá nhân</span>
                </button>

                <div
                  className="mt-3 flex gap-4"
                  role="radiogroup"
                  aria-label="Language"
                >
                  <label className="flex flex-1 cursor-pointer items-center justify-between rounded-[16px] border border-slate-200 bg-white px-4 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <input
                      type="radio"
                      name="language"
                      value="vi"
                      checked={language === "vi"}
                      onChange={() => setLanguage("vi")}
                      className="sr-only"
                    />
                    <span className="relative h-9 w-9 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                      <Image
                        src="/assets/svg/vn.svg"
                        alt="Vietnamese"
                        fill
                        sizes="36px"
                        className="object-cover"
                        unoptimized
                      />
                    </span>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full ring-2 ${language === "vi"
                        ? "bg-[var(--primary)] ring-[var(--primary)]"
                        : "bg-white ring-slate-400/70"
                        }`}
                      aria-hidden="true"
                    >
                      {language === "vi" && (
                        <span className="h-2.5 w-2.5 rounded-full bg-white" />
                      )}
                    </span>
                  </label>

                  <label className="flex flex-1 cursor-pointer items-center justify-between rounded-[16px] border border-slate-200 bg-white px-4 py-3 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <input
                      type="radio"
                      name="language"
                      value="en"
                      checked={language === "en"}
                      onChange={() => setLanguage("en")}
                      className="sr-only"
                    />
                    <span className="relative h-9 w-9 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                      <Image
                        src="/assets/svg/en.svg"
                        alt="English"
                        fill
                        sizes="36px"
                        className="object-cover"
                        unoptimized
                      />
                    </span>
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full ring-2 ${language === "en"
                        ? "bg-[var(--primary)] ring-[var(--primary)]"
                        : "bg-white ring-slate-400/70"
                        }`}
                      aria-hidden="true"
                    >
                      {language === "en" && (
                        <span className="h-2.5 w-2.5 rounded-full bg-white" />
                      )}
                    </span>
                  </label>
                </div>
              </div>
            </div>}
          </div>

          <footer className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-4">
            <button
              type="button"
              className={`${openSans.className} w-full rounded-[16px] bg-[#D40887] px-6 py-3 text-center text-[14px] font-[700] text-white shadow-[0_12px_28px_rgba(212,8,135,0.35)] active:opacity-90`}
            >
              Góc học tập
            </button>

            {!isLoggedIn ? (
              <button
                type="button"
                onClick={() => setIsModalLoginOpen(true)}
                className={`${openSans.className} mt-3 flex w-full items-center justify-center gap-3 rounded-[16px] border-2 border-red-500 px-6 py-3 text-center text-[14px] font-[700] text-red-500 active:bg-red-50`}
              >
                <span className="xl:hidden">Đăng ký/Đăng nhập</span>
                <span className="hidden xl:inline">Đăng ký/Đăng nhập</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  document.cookie = "auth_token=; path=/; max-age=0";
                  localStorage.removeItem("telesa_user_info");
                  setIsLoggedIn(false);
                  window.location.reload();
                }}
                type="button"
                className={`${openSans.className} mt-3 flex w-full items-center justify-center gap-3 rounded-[16px] border-2 border-red-500 px-6 py-3 text-center text-[14px] font-[700] text-red-500 active:bg-red-50`}
              >
                <Image
                  src="/assets/svg/logout.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="h-4 w-4"
                  unoptimized
                />
                Đăng xuất
              </button>
            )}
          </footer>
        </div>
      </div>
      <ModalLogin open={isModalLoginOpen} onClose={() => setIsModalLoginOpen(false)} />
    </div>
  );
}
