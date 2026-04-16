"use client";

import React, { useState } from "react";
import type { Settings } from "../_types";
import { MOCK_SETTINGS } from "../_data/mock";
import Button from "../_components/Button";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(MOCK_SETTINGS);
  const [form, setForm] = useState<Settings>(MOCK_SETTINGS);
  const [errors, setErrors] = useState<Partial<Record<keyof Settings, string>>>({});
  const [saved, setSaved] = useState(false);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Please enter a valid email address";
    }
    if (!form.hotline.trim()) {
      e.hotline = "Hotline is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    setSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    setForm(settings);
    setErrors({});
  }

  const hasChanges = form.email !== settings.email || form.hotline !== settings.hotline;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your contact information and general preferences.
        </p>
      </div>

      {/* Success toast */}
      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 animate-[fadeIn_200ms_ease-out]">
          <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Settings saved successfully!
        </div>
      )}

      {/* Settings form */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Section header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <h2 className="text-sm font-semibold text-gray-800">Contact Information</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            This information will be displayed on your public website.
          </p>
        </div>

        {/* Form body */}
        <div className="px-6 py-5 space-y-5">
          {/* Email */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 items-start">
            <label className="text-sm font-medium text-gray-700 sm:pt-2">
              Email Address
            </label>
            <div className="sm:col-span-2">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, email: e.target.value }));
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 transition-shadow ${errors.email ? "border-red-300" : "border-gray-200"}`}
                  placeholder="contact@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
              <p className="text-xs text-gray-400 mt-1.5">
                Public contact email shown in the footer.
              </p>
            </div>
          </div>

          {/* Hotline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 items-start">
            <label className="text-sm font-medium text-gray-700 sm:pt-2">
              Hotline
            </label>
            <div className="sm:col-span-2">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <input
                  type="text"
                  value={form.hotline}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, hotline: e.target.value }));
                    setErrors((prev) => ({ ...prev, hotline: undefined }));
                  }}
                  className={`w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 transition-shadow ${errors.hotline ? "border-red-300" : "border-gray-200"}`}
                  placeholder="1900-XXXX"
                />
              </div>
              {errors.hotline && (
                <p className="text-xs text-red-500 mt-1">{errors.hotline}</p>
              )}
              <p className="text-xs text-gray-400 mt-1.5">
                Customer support phone number.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/60 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            {hasChanges ? "You have unsaved changes" : "All changes saved"}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleReset} disabled={!hasChanges}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
