"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./_components/Sidebar";
import Topbar from "./_components/Topbar";
import Cookies from "js-cookie";
import { authAPI, LoginCredentials } from "../../lib/api/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: ""
  });
  const [error, setError] = useState<string>(""); // State hiển thị lỗi

  // Kiểm tra token khi load trang
  useEffect(() => {
    const token = Cookies.get("auth_token");
    setIsAuthenticated(!!token);
  }, []);

  // Xử lý login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authAPI.login(credentials);

      // ✅ Kiểm tra đúng cấu trúc: có message thành công VÀ có token
      if (result.message === "Đăng nhập thành công" && result.data?.token) {

        // Lưu token vào cookie với options bảo mật
        Cookies.set("auth_token", result.data.token, {
          expires: 7,
          secure: process.env.NODE_ENV === "production", // Chỉ gửi qua HTTPS ở production
          sameSite: "strict" // Chống CSRF
        });

        setIsAuthenticated(true);

        // Optional: Lưu user info vào state/localStorage nếu cần
        // const { token, ...userInfo } = result.data;
        // localStorage.setItem("user", JSON.stringify(userInfo));

      } else {
        // Hiển thị lỗi từ API hoặc default message
        setError(result.message || "Đăng nhập thất bại");
      }

    } catch (err: any) {
      console.error("Login error:", err);

      // Xử lý lỗi axios: lấy message từ nhiều vị trí có thể
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Lỗi kết nối server";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state khi check auth
  if (isAuthenticated === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9e005a]"></div>
      </div>
    );
  }

  // 🔐 Chưa đăng nhập: Hiển thị Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">Admin Login</h2>
            <p className="mt-2 text-center text-sm text-gray-600">Vui lòng đăng nhập để tiếp tục</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#9e005a] focus:border-[#9e005a] sm:text-sm"
                  value={credentials.email}
                  onChange={(e) => {
                    setCredentials({ ...credentials, email: e.target.value });
                    setError(""); // Clear error khi user nhập lại
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                <input
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#9e005a] focus:border-[#9e005a] sm:text-sm"
                  value={credentials.password}
                  onChange={(e) => {
                    setCredentials({ ...credentials, password: e.target.value });
                    setError("");
                  }}
                />
              </div>
            </div>

            {/* Hiển thị lỗi nếu có */}
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#9e005a] hover:bg-[#800048] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9e005a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Đang xử lý...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ✅ Đã đăng nhập: Hiển thị Admin Layout
  return (
    <div className="flex min-h-screen bg-[#f8f9fb]">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuToggle={() => setMobileMenuOpen((v) => !v)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}