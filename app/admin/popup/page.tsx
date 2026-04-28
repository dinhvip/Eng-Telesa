"use client";

import React, { useState, useEffect, useRef } from "react";
import type { Banner } from "../_types";
import Button from "../_components/Button";
import Modal from "../_components/Modal";
import { fetchSiteSettings, updateSiteSettingsRaw } from "../../../lib/api/setting";

// ─── Types ────────────────────────────────────────────────────────────────────
type SlideForm = {
  text: string;
  link: string;
  image: string;       // URL hiện tại (từ server)
  image_file?: File;   // File mới (nếu người dùng chọn)
};

const emptyForm: SlideForm = {
  text: "",
  link: "",
  image: "",
  image_file: undefined,
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
    <div className="relative group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow w-44 shrink-0">
      {/* Image */}
      <div className="h-24 bg-gray-100 flex items-center justify-center overflow-hidden">
        {slide.image ? (
          <img src={slide.image} alt={slide.text} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="px-3 py-2 flex-1">
        <p className="text-xs font-medium text-gray-800 line-clamp-2 min-h-[2rem]">
          {slide.text || <span className="text-gray-400 italic">Chưa có nội dung</span>}
        </p>
        {slide.link && (
          <p className="text-[10px] text-blue-500 truncate mt-1">{slide.link}</p>
        )}
      </div>

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
      className="flex flex-col items-center justify-center w-44 h-[136px] shrink-0 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-[#9e005a] hover:text-[#9e005a] hover:bg-[#9e005a]/5 transition-all group"
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<string>("");
  const [form, setForm] = useState<SlideForm>(emptyForm);
  const [formPreview, setFormPreview] = useState<string>("");
  const [errors, setErrors] = useState<Partial<Record<keyof SlideForm, string>>>({});

  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch banners ──────────────────────────────────────────────────────────
  async function fetchBanners() {
    setLoading(true);
    try {
      const data = await fetchSiteSettings();
      // API trả về: { data: { banner_slides: [...] } }
      const rawSlides: Banner[] = data?.banner_slides ?? [];
      setBanners(rawSlides.map((b, i) => ({ ...b, index: i })));
    } catch {
      showToast("Không thể tải dữ liệu banner.", "error");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBanners(); }, []);

  // ── Submit toàn bộ banners lên server ─────────────────────────────────────
  async function submitBanners(updatedList: (Banner & { _file?: File })[]) {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");

      updatedList.forEach((b, i) => {
        formData.append(`banner_slides[${i}][text]`, b.text);
        formData.append(`banner_slides[${i}][section]`, b.section);
        formData.append(`banner_slides[${i}][link]`, b.link ?? "");
        if (b._file) {
          formData.append(`banner_slides[${i}][image]`, b._file, b._file.name);
        } else if (b.image) {
          formData.append(`banner_slides[${i}][image]`, b.image);
        }
      });

      await updateSiteSettingsRaw(formData);
      showToast("Đã lưu banner thành công!", "success");
      await fetchBanners();
    } catch {
      showToast("Lưu thất bại. Vui lòng thử lại.", "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Open modal to add slide for a section ─────────────────────────────────
  function handleAddSlide(sectionKey: string) {
    setEditingIndex(null);
    setActiveSection(sectionKey);
    setForm(emptyForm);
    setFormPreview("");
    setErrors({});
    setModalOpen(true);
  }

  // ── Open modal to edit existing slide ─────────────────────────────────────
  function handleEdit(banner: Banner) {
    setEditingIndex(banner.index);
    setActiveSection(banner.section);
    setForm({ text: banner.text, link: banner.link, image: banner.image });
    setFormPreview(banner.image);
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: Partial<Record<keyof SlideForm, string>> = {};
    if (!form.text.trim()) e.text = "Nội dung không được để trống";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    let updatedList: (Banner & { _file?: File })[];

    if (editingIndex !== null) {
      updatedList = banners.map((b) =>
        b.index === editingIndex
          ? { ...b, text: form.text, link: form.link, image: form.image, _file: form.image_file }
          : b
      );
    } else {
      const newSlide: Banner & { _file?: File } = {
        index: banners.length,
        text: form.text,
        section: activeSection,
        link: form.link,
        image: form.image,
        _file: form.image_file,
      };
      updatedList = [...banners, newSlide];
    }

    setModalOpen(false);
    await submitBanners(updatedList);
  }

  async function handleDelete(index: number) {
    const updatedList = banners
      .filter((b) => b.index !== index)
      .map((b, i) => ({ ...b, index: i }));
    setDeleteConfirm(null);
    await submitBanners(updatedList);
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
                      key={slide.index}
                      slide={slide}
                      onEdit={() => handleEdit(slide)}
                      onDelete={() => setDeleteConfirm(slide.index)}
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
        title={editingIndex !== null ? "Chỉnh sửa Slide" : `Thêm Slide — ${SECTIONS.find((s) => s.key === activeSection)?.label ?? activeSection}`}
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

          {/* Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung <span className="text-red-400">*</span>
            </label>
            <input
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 ${
                errors.text ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="Nội dung hiển thị trên slide"
            />
            {errors.text && <p className="text-xs text-red-500 mt-1">{errors.text}</p>}
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
            <input
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40"
              placeholder="https://..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : editingIndex !== null ? "Lưu thay đổi" : "Thêm Slide"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Xóa Slide"
      >
        <p className="text-sm text-gray-600 mb-5">
          Bạn có chắc muốn xóa slide này? Hành động này không thể hoàn tác và sẽ cập nhật ngay lên server.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            disabled={saving}
            onClick={() => deleteConfirm !== null && handleDelete(deleteConfirm)}
          >
            {saving ? "Đang xóa..." : "Xóa"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
