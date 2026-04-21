"use client";

import React, { useState, useMemo } from "react";
import type { Course, TableColumn } from "../_types";
import { MOCK_COURSES } from "../_data/mock";
import Table from "../_components/Table";
import Button from "../_components/Button";
import Modal from "../_components/Modal";
import StatusBadge from "../_components/StatusBadge";
import ImageUpload from "../_components/ImageUpload";

type CourseForm = Omit<Course, "id" | "createdAt">;
// Thêm vào đầu file, sau các imports
function mapToFrontendToBackend(data: Partial<CourseForm>) {
  const {
    title,
    category,
    courseCategory,
    teacher,
    image,
    price,
    salePrice,
    description,
    introduction,
    benefits,
    purchaseNotes,
    ...rest
  } = data;

  return {
    ...rest,
    name: title?.trim(),
    category_person: category,
    category: courseCategory,
    teacher_id: teacher,
    banner: image, // File hoặc URL string
    price: Number(price) || 0,
    discount: Number(salePrice) || 0,
    description: description?.trim(),
    introducing: introduction?.trim(),
    will_receive: benefits?.trim(),
    note_buy: purchaseNotes?.trim(),
  };
}

// Map Backend → Frontend (khi load data từ API)
function mapBackendToFrontend(data: any): CourseForm {
  return {
    title: data.name || "",
    slug: data.slug || "",
    level: data.level || "Beginner",
    duration: data.duration || "",
    students: Number(data.students) || 0,
    price: Number(data.price) || 0,
    salePrice: Number(data.discount) || 0,
    status: data.status || "Draft",
    image: data.banner || "",
    category: data.category_person || "",
    courseCategory: data.category || "",
    teacher: data.teacher_id || "",
    description: data.description || "",
    introduction: data.introducing || "",
    benefits: data.will_receive || "",
    purchaseNotes: data.note_buy || "",
  };
}

const emptyForm: CourseForm = {
  title: "",
  slug: "",
  level: "Beginner",
  duration: "",
  students: 0,
  price: 0,
  salePrice: 0,
  status: "Draft",
  image: "",
  category: "",
  courseCategory: "",
  teacher: "",
  description: "",
  introduction: "",
  benefits: "",
  purchaseNotes: "",
};

// Mock data for dropdowns
const CATEGORIES = ["Người lớn", "Trẻ em", "Nguời lớn & trẻ em", "Khoá học 90 ngày", "Collocations C2 Level", "Vocabulary B1", "The Oxford 3000 từ", "Người mất gốc & Trẻ em"];
const COURSE_CATEGORIES = ["Khóa Học Online"];
const TEACHERS = ["Nguyễn Thị Lan", "Trần Văn Minh", "Lê Thị Hương", "Phạm Đức Anh", "Hoàng Thị Mai"];

function statusVariant(s: Course["status"]) {
  if (s === "Active") return "success" as const;
  if (s === "Draft") return "warning" as const;
  return "neutral" as const;
}

function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CourseForm, string>>>({});
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filter
  const filtered = useMemo(
    () =>
      courses.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.level.toLowerCase().includes(search.toLowerCase())
      ),
    [courses, search]
  );

  // Open create
  function handleCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  // Open edit
  function handleEdit(course: Course) {
    setEditingId(course.id);
    setForm({
      title: course.title,
      slug: course.slug,
      level: course.level,
      duration: course.duration,
      students: course.students,
      price: course.price,
      salePrice: course.salePrice,
      status: course.status,
      image: course.image || "",
      category: course.category,
      courseCategory: course.courseCategory,
      teacher: course.teacher,
      description: course.description,
      introduction: course.introduction,
      benefits: course.benefits,
      purchaseNotes: course.purchaseNotes,
    });
    setErrors({});
    setModalOpen(true);
  }

  // Validate
  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.slug.trim()) e.slug = "Slug is required";
    if (!form.duration.trim()) e.duration = "Duration is required";
    if (form.price <= 0) e.price = "Price must be greater than 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Save
 async function handleSave() {
  console.log(process.env.NEXT_PUBLIC_TELESA_API_BASE_URL);
  
  try {
    const formData = new FormData();
    
    // 1. Thêm các trường Text khớp hoàn toàn với ảnh Form Data
    formData.append("_token", "4GxVS6tLyVgYsK2E3Y7SiGO7Wxhw2HgUMRKuv2F0"); // Token từ ảnh của bạn
    formData.append("name", form.title.trim());
    formData.append("category_person", form.category || "1"); 
    formData.append("category", form.courseCategory || "1");
    formData.append("teacher_id", form.teacher || "512");
    formData.append("price", String(form.price));
    formData.append("discount", String(form.salePrice));
    formData.append("description", form.description);
    formData.append("introducing", form.introduction);
    formData.append("will_receive", form.benefits);
    formData.append("note_buy", form.purchaseNotes);

    // 2. Xử lý File (Banner, Video, Document)
    if (form.image && form.image.startsWith("blob:")) {
      const res = await fetch(form.image);
      const blob = await res.blob();
      formData.append("banner", blob, "banner.jpg");
    }
    
    // Thêm các trường file trống như trong ảnh để tránh lỗi validation của backend
    formData.append("banner", new Blob([]), ""); 
    formData.append("video", new Blob([]), ""); 
    formData.append("document", new Blob([]), "");

    // 3. Gửi qua Proxy Route
    const url = editingId ? `/api/courses?id=${editingId}` : "/api/courses";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(process.env.NEXT_PUBLIC_TELESA_API_BASE_URL + url, {
      method,
      body: formData, // Browser sẽ tự set Content-Type: multipart/form-data
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Lưu thất bại");

    alert("Thành công!");
    setModalOpen(false);
    // Cập nhật state list...
  } catch (err) {
    alert("Lỗi: " + (err as Error).message);
  }
}

  // Delete
  function handleDelete(id: string) {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
  }

  const columns: TableColumn<Course & { image?: string }>[] = [
    {
      key: "title",
      label: "Course",
      render: (c) => (
        <div className="flex items-center gap-3">
          {/* Cập nhật Table để hiển thị Thumbnail ảnh */}
          {c.image ? (
            <img src={c.image} alt={c.title} className="w-10 h-10 rounded-md object-cover bg-gray-100 border border-gray-200" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{c.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "level",
      label: "Level",
      render: (c) => (
        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
          {c.level}
        </span>
      ),
    },
    { key: "duration", label: "Duration" },
    {
      key: "students",
      label: "Students",
      render: (c) => <span className="font-medium tabular-nums">{c.students.toLocaleString()}</span>,
    },
    {
      key: "price",
      label: "Price",
      render: (c) => <span className="tabular-nums">{formatVND(c.price)}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (c) => <StatusBadge label={c.status} variant={statusVariant(c.status)} />,
    },
    {
      key: "actions",
      label: "",
      width: "120px",
      render: (c) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="!text-red-500 hover:!bg-red-50" onClick={() => setDeleteConfirm(c.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your course catalog and curriculum.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          }
        >
          Add Course
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 transition-shadow"
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filtered}
        emptyTitle="No courses yet"
        emptyDescription="Get started by adding your first course."
        onAdd={handleCreate}
      />

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">

          {/* Banner Image */}
          <ImageUpload
            label="Banner"
            value={form.image}
            onChange={(url) => setForm(f => ({ ...f, image: url }))}
          />

          {/* Tên khóa học */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 ${errors.title ? "border-red-300" : "border-gray-200"}`}
              placeholder="Nhập tên khóa học"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Danh mục + Danh mục khóa học */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 bg-white"
              >
                <option value="">-- Chọn danh mục --</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục khóa học</label>
              <select
                value={form.courseCategory}
                onChange={(e) => setForm((f) => ({ ...f, courseCategory: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 bg-white"
              >
                <option value="">-- Chọn danh mục khóa học --</option>
                {COURSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Giáo viên phụ trách + Level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giáo viên phụ trách</label>
              <select
                value={form.teacher}
                onChange={(e) => setForm((f) => ({ ...f, teacher: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 bg-white"
              >
                <option value="">-- Chọn giáo viên --</option>
                {TEACHERS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
               <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 ${errors.price ? "border-red-300" : "border-gray-200"}`}
                placeholder="0"
              />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá khuyến mãi (VND)</label>
              <input
                type="number"
                value={form.salePrice}
                onChange={(e) => setForm((f) => ({ ...f, salePrice: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40"
                placeholder="0"
              />
            </div>
          </div>
            </div>
          </div>

          {/* Giá + Giá khuyến mãi */}
         

          {/* Mô tả khóa học */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả khóa học</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 resize-none"
              placeholder="Nhập mô tả ngắn về khóa học"
            />
          </div>

          {/* Giới thiệu khóa học */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu khóa học</label>
            <textarea
              value={form.introduction}
              onChange={(e) => setForm((f) => ({ ...f, introduction: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 resize-none"
              placeholder="Nhập giới thiệu chi tiết về khóa học"
            />
          </div>

          {/* Tham gia khóa học bạn sẽ thu được */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tham gia khóa học bạn sẽ thu được</label>
            <textarea
              value={form.benefits}
              onChange={(e) => setForm((f) => ({ ...f, benefits: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 resize-none"
              placeholder="Nhập những gì học viên sẽ đạt được sau khóa học"
            />
          </div>

          {/* Lưu ý khi mua khóa học */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lưu ý khi mua khóa học</label>
            <textarea
              value={form.purchaseNotes}
              onChange={(e) => setForm((f) => ({ ...f, purchaseNotes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 resize-none"
              placeholder="Nhập các lưu ý quan trọng khi đăng ký khóa học"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>
              {editingId ? "Lưu thay đổi" : "Tạo khóa học"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Course"
      >
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete this course? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}