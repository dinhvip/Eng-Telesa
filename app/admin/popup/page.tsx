"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Banner } from "../_types";
import Button from "../_components/Button";
import Modal from "../_components/Modal";
import { fetchBannersList, createBanner, updateBanner, deleteBanner } from "../../../lib/api/setting";

// ─── Types ────────────────────────────────────────────────────────────────────
type SlideForm = {
  title: string;
  description: string;
  link: string;
  image: string;       // URL hiện tại (từ server)
  image_file?: File;   // File mới (nếu người dùng chọn)
  position: number;
  is_active: boolean;
};

const emptyForm: SlideForm = {
  title: "",
  description: "",
  link: "",
  image: "",
  image_file: undefined,
  position: 0,
  is_active: true,
};

const SECTIONS = [
  { key: "home_section_a", label: "Section A" },
  { key: "home_section_b", label: "Section B" },
];

// ─── ImagePicker ──────────────────────────────────────────────────────────────
function ImagePicker({
  previewUrl,
  onFileChange,
  onClear,
}: {
  previewUrl: string;
  onFileChange: (file: File) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
      <div className="flex items-center gap-4">
        <div
          className="relative h-32 w-48 shrink-0 overflow-hidden rounded-lg border border-gray-300 bg-gray-100 cursor-pointer group"
          onClick={() => ref.current?.click()}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="h-full w-full object-cover transition-opacity group-hover:opacity-80" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-gray-400 text-xs gap-1">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span>Chọn ảnh</span>
            </div>
          )}
        </div>
        {previewUrl && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-700 hover:underline"
          >
            Xóa ảnh
          </button>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileChange(file);
          }}
        />
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function ToastMsg({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all animate-in slide-in-from-bottom-4 duration-300 ${
        type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      {type === "success" ? (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {message}
    </div>
  );
}

// ─── SlideCard ────────────────────────────────────────────────────────────────
function SlideCard({
  slide,
  onEdit,
  onDelete,
}: {
  slide: Banner;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`relative group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow w-44 shrink-0 ${!slide.is_active ? 'opacity-60 grayscale-[0.5]' : ''}`}>
      {/* Image */}
      <div className="h-24 bg-gray-100 flex items-center justify-center overflow-hidden">
        {slide.image ? (
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="px-3 py-2 flex-1">
        <div className="flex items-center justify-between gap-1 mb-1">
          <p className="text-xs font-bold text-gray-900 truncate flex-1">
            {slide.title || <span className="text-gray-400 font-normal italic">No title</span>}
          </p>
          <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded">#{slide.position}</span>
        </div>
        <p className="text-[10px] text-gray-500 line-clamp-2 min-h-[1.5rem]">
          {slide.description || <span className="text-gray-400 italic">No description</span>}
        </p>
        {slide.link && (
          <p className="text-[10px] text-blue-500 truncate mt-1">{slide.link}</p>
        )}
      </div>

      {!slide.is_active && (
        <div className="absolute top-2 left-2 bg-gray-800/80 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Inactive
        </div>
      )}

      {/* Actions overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          onClick={onEdit}
          className="bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors shadow"
        >
          Sửa
        </button>
        <button
          onClick={onDelete}
          className="bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors shadow"
        >
          Xóa
        </button>
      </div>
    </div>
  );
}

// ─── AddSlideButton ───────────────────────────────────────────────────────────
function AddSlideButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center w-44 h-[156px] shrink-0 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-[#9e005a] hover:text-[#9e005a] hover:bg-[#9e005a]/5 transition-all group"
    >
      <div className="w-10 h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </div>
      <span className="text-xs font-medium">Thêm slide</span>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PopupPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<string>("");
  const [form, setForm] = useState<SlideForm>(emptyForm);
  const [formPreview, setFormPreview] = useState<string>("");
  const [errors, setErrors] = useState<Partial<Record<keyof SlideForm, string>>>({});

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch banners ──────────────────────────────────────────────────────────
  async function fetchBanners() {
    setLoading(true);
    try {
      const res = await fetchBannersList();
      // fetchBannersList đã trả về res.data (là mảng banners) do axios interceptor và xử lý ở api layer
      const rawSlides: Banner[] = Array.isArray(res) ? res : (res?.data ?? []);
      setBanners(rawSlides);
    } catch {
      showToast("Không thể tải dữ liệu banner.", "error");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBanners(); }, []);

  // ── Open modal to add slide for a section ─────────────────────────────────
  function handleAddSlide(sectionKey: string) {
    setEditingId(null);
    setActiveSection(sectionKey);
    setForm(emptyForm);
    setFormPreview("");
    setErrors({});
    setModalOpen(true);
  }

  // ── Open modal to edit existing slide ─────────────────────────────────────
  function handleEdit(banner: Banner) {
    setEditingId(banner.id);
    setActiveSection(banner.section);
    setForm({
      title: banner.title,
      description: banner.description,
      link: banner.link,
      image: banner.image,
      position: banner.position,
      is_active: banner.is_active,
    });
    setFormPreview(banner.image);
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: Partial<Record<keyof SlideForm, string>> = {};
    if (!form.title.trim()) e.title = "Tiêu đề không được để trống";
    // Có thể thêm validate cho image nếu cần khi tạo mới
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("section", activeSection);
      formData.append("link", form.link);
      formData.append("position", String(form.position));
      formData.append("is_active", form.is_active ? "1" : "0");

      if (form.image_file) {
        formData.append("image", form.image_file);
      }

      if (editingId !== null) {
        await updateBanner(editingId, formData);
        showToast("Đã cập nhật slide thành công!", "success");
      } else {
        await createBanner(formData);
        showToast("Đã thêm slide mới thành công!", "success");
      }

      setModalOpen(false);
      await fetchBanners();
    } catch {
      showToast("Lưu thất bại. Vui lòng thử lại.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setSaving(true);
    try {
      await deleteBanner(id);
      showToast("Đã xóa slide thành công!", "success");
      setDeleteConfirmId(null);
      await fetchBanners();
    } catch {
      showToast("Xóa thất bại. Vui lòng thử lại.", "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && <ToastMsg message={toast.message} type={toast.type} />}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý banner hiển thị trên các trang của website.
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <svg className="w-6 h-6 animate-spin mr-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Đang tải...
        </div>
      ) : (
        <div className="space-y-4">
          {SECTIONS.map((sec) => {
            const slides = banners.filter((b) => b.section === sec.key);
            return (
              <div key={sec.key} className="bg-white rounded-2xl border border-gray-200 p-5">
                {/* Section header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#9e005a]/10 text-[#9e005a] text-xs font-semibold">
                      {sec.label}
                    </span>
                    <code className="text-xs text-gray-400 font-mono">{sec.key}</code>
                    <span className="text-xs text-gray-400">
                      {slides.length} slide{slides.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Slides row */}
                <div className="flex items-start gap-3 overflow-x-auto pb-2">
                  {slides.map((slide) => (
                    <SlideCard
                      key={slide.id}
                      slide={slide}
                      onEdit={() => handleEdit(slide)}
                      onDelete={() => setDeleteConfirmId(slide.id)}
                    />
                  ))}

                  {/* Add button */}
                  <AddSlideButton onClick={() => handleAddSlide(sec.key)} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId !== null ? "Chỉnh sửa Slide" : `Thêm Slide — ${SECTIONS.find((s) => s.key === activeSection)?.label ?? activeSection}`}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
          {/* Image picker */}
          <ImagePicker
            previewUrl={formPreview}
            onFileChange={(file) => {
              const preview = URL.createObjectURL(file);
              setFormPreview(preview);
              setForm((f) => ({ ...f, image_file: file, image: preview }));
            }}
            onClear={() => {
              setFormPreview("");
              setForm((f) => ({ ...f, image_file: undefined, image: "" }));
            }}
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề <span className="text-red-400">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 ${
                  errors.title ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="Tiêu đề banner"
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40"
                placeholder="Mô tả ngắn"
              />
            </div>

            {/* Link */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
              <input
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40"
                placeholder="https://..."
              />
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí (Position)</label>
              <input
                type="number"
                value={form.position}
                onChange={(e) => setForm((f) => ({ ...f, position: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40"
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="w-4 h-4 text-[#9e005a] border-gray-300 rounded focus:ring-[#9e005a]"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                Kích hoạt (Active)
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : editingId !== null ? "Lưu thay đổi" : "Thêm Slide"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Xóa Slide"
      >
        <p className="text-sm text-gray-600 mb-5">
          Bạn có chắc muốn xóa slide này? Hành động này không thể hoàn tác.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            disabled={saving}
            onClick={() => deleteConfirmId !== null && handleDelete(deleteConfirmId)}
          >
            {saving ? "Đang xóa..." : "Xóa"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
