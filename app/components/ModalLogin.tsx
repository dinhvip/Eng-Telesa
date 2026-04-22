"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { authAPI } from "../../lib/api/auth";

interface ModalLoginProps {
  open: boolean;
  onClose: () => void;
}

export default function ModalLogin({ open, onClose }: ModalLoginProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollbarWidth = useRef<number>(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!open) {
      setEmail("");
      setPassword("");
      setErrorMsg("");
      return;
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // Calculate scrollbar width to prevent layout shift
    scrollbarWidth.current = window.innerWidth - document.documentElement.clientWidth;

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth.current}px`;

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });

      // Since response wrapper types might differ, handle flexibly
      const responseData: any = res;

      if (responseData.error) {
        setErrorMsg(responseData.error || "Đăng nhập thất bại");
      } else if (responseData.data?.token) {
        // Success: save token
        document.cookie = `auth_token=${responseData.data.token}; path=/; max-age=604800`; // 7 days
        localStorage.setItem("telesa_user_info", JSON.stringify(responseData.data));

        // Save scroll intent
        sessionStorage.setItem("telesa:scrollToSection2", "1");

        onClose();
        window.location.reload(); // Refresh the page to load authenticated state
      } else {
        setErrorMsg(responseData.message || "Đăng nhập thất bại");
      }
    } catch (err: any) {
      console.error("Login error: ", err);
      setErrorMsg(
        err.response?.data?.message || err.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại sau"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

      {/* Modal Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-[24px] bg-white text-slate-800 shadow-[0_32px_64px_rgba(0,0,0,0.3)] animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] border border-white/20">

        {/* Header Decor (Optional Graphic element) */}
        <div className="h-24 w-full bg-gradient-to-br from-rose-500 to-pink-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/hero-pattern.svg')] opacity-20 mix-blend-overlay"></div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/40"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 pt-6 sm:px-8">
          <div className="text-center -mt-16 mb-6 relative z-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl ring-4 ring-white">
              <div className="relative h-12 w-12 text-rose-500">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-full h-full drop-shadow-sm">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z" />
                </svg>
              </div>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Đăng nhập tài khoản</h2>
            <p className="mt-1 text-sm text-slate-500">Chào mừng bạn quay lại Telesa English</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-100 flex items-start gap-2 animate-[fadeIn_0.2s_ease-out]">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email / Số điện thoại</label>
              <input
                type="text"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email hoặc số điện thoại..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
              />
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input type="checkbox" className="peer w-5 h-5 opacity-0 absolute cursor-pointer" />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded-[6px] bg-white group-hover:border-rose-400 peer-checked:bg-rose-500 peer-checked:border-rose-500 transition-colors flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 placeholder-transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="text-sm font-semibold text-rose-600 hover:text-rose-700 hover:underline">Quên mật khẩu?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative mt-6 flex w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-3.5 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(225,29,72,0.3)] transition-all hover:shadow-[0_12px_25px_rgba(225,29,72,0.4)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                "Đăng nhập ngay"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Bạn chưa có tài khoản?{" "}
            <a href="#" className="font-semibold text-rose-600 hover:underline hover:text-rose-700 cursor-pointer">
              Đăng ký ngay
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
