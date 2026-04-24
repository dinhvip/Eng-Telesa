"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSiteSettings, updateSiteSettings } from '../../../lib/api/setting';

export default function SettingsPage() {
  interface LocalSettings {
    email: string;
    phone: string;
  }

  const initialSettings: LocalSettings = { email: '', phone: '' };

  const [settings, setSettings] = useState<LocalSettings>(initialSettings);
  const [form, setForm] = useState<LocalSettings>(initialSettings);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Toast states
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Loading states
  const [loadingData, setLoadingData] = useState(true); // Đang load lúc mở trang
  const [isSaving, setIsSaving] = useState(false);       // Đang nhấn nút Lưu

  useEffect(() => {
    let isSubscribed = true;

    const loadData = async () => {
      try {
        const rawData = await fetchSiteSettings();
        if (isSubscribed && rawData) {
          setSettings(rawData);
          setForm(rawData);
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        if (isSubscribed) setLoadingData(false);
      }
    };

    loadData();
    return () => { isSubscribed = false; };
  }, []);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Please enter a valid email address";
    }

    if (!form.phone.trim()) {
      e.phone = "Phone number is required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // 2. Xử lý Save (POST)
  async function handleSave() {
    if (!validate()) return;

    // Kiểm tra xem có thay đổi không trước khi submit (optional tốt UX)
    const hasChanges = form.email !== settings.email || form.phone !== settings.phone;
    if (!hasChanges) return;

    setIsSaving(true);
    setErrorMessage("");

    try {
      // Gọi API lưu
      await updateSiteSettings(form);

      // Thành công
      setSettings(form); // Cập nhật state "mặc định" thành giá trị mới
      setSaved(true);

      // Tắt toast sau 3 giây
      setTimeout(() => setSaved(false), 3000);

    } catch (err: any) {
      // Xử lý lỗi
      setErrorMessage(err || "Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.");

      // Tự tắt thông báo lỗi sau 3-5 giây nếu muốn
      setTimeout(() => setErrorMessage(""), 5000);

    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    setForm(settings);
    setErrors({});
  }

  const hasChanges = form.email !== settings.email || form.phone !== settings.phone;

  if (loadingData) {
    return <div className="p-10 text-center">Đang tải thiết lập...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Website Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your contact information.</p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Success Toast */}
      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 animate-[fadeIn_200ms_ease-out]">
          <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Settings saved successfully!
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Contact Information</h2>
            <p className="text-xs text-gray-500 mt-0.5">Public display details.</p>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Email Field */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 items-start">
            <label className="text-sm font-medium text-gray-700 sm:pt-2">Email Address</label>
            <div className="sm:col-span-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">✉️</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, email: e.target.value }));
                  }}
                  className={`w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 ${errors.email ? "border-red-300" : "border-gray-200"}`}
                  placeholder="contact@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Phone Field */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 items-start">
            <label className="text-sm font-medium text-gray-700 sm:pt-2">Phone Number</label>
            <div className="sm:col-span-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📞</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, phone: e.target.value }));
                  }}
                  className={`w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 ${errors.phone ? "border-red-300" : "border-gray-200"}`}
                  placeholder="0932-XXX-XXX"
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/60 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            {hasChanges ? "You have unsaved changes" : "All changes saved"}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={handleReset} disabled={!hasChanges} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#9e005a] rounded-lg hover:bg-[#7d004a] disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}