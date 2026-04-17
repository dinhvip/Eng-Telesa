"use client";

import React, { useState, useMemo } from "react";
import type { Course, TableColumn } from "../_types";
import { MOCK_COURSES } from "../_data/mock";
import Table from "../_components/Table";
import Button from "../_components/Button";
import Modal from "../_components/Modal";
import StatusBadge from "../_components/StatusBadge";
import ImageUpload from "../_components/ImageUpload";

type CourseForm = Omit<Course, "id" | "createdAt"> & { image?: string };

const emptyForm: CourseForm = {
  title: "",
  slug: "",
  level: "Beginner",
  duration: "",
  students: 0,
  price: 0,
  status: "Draft",
  image: "",
};

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
  function handleEdit(course: Course & { image?: string }) {
    setEditingId(course.id);
    setForm({
      title: course.title,
      slug: course.slug,
      level: course.level,
      duration: course.duration,
      students: course.students,
      price: course.price,
      status: course.status,
      image: course.image || "", // Nạp dữ liệu hình ảnh cũ nếu có
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
  function handleSave() {
    if (!validate()) return;

    if (editingId) {
      setCourses((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...form } : c))
      );
    } else {
      const newCourse: Course = {
        ...form,
        id: `c${Date.now()}`,
        createdAt: new Date().toISOString().split("T")[0],
      } as Course; // Ép kiểu nếu Type Course chưa có trường image
      setCourses((prev) => [newCourse, ...prev]);
    }
    setModalOpen(false);
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
        title={editingId ? "Edit Course" : "New Course"}
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">

          <ImageUpload
            label="Course Image"
            value={form.image}
            onChange={(url) => setForm(f => ({ ...f, image: url }))}
          />

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => {
                setForm((f) => ({
                  ...f,
                  title: e.target.value,
                }));
              }}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 ${errors.title ? "border-red-300" : "border-gray-200"}`}
              placeholder="Enter course title"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 ${errors.slug ? "border-red-300" : "border-gray-200"}`}
              placeholder="course-slug"
            />
            {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
          </div>

          {/* Level + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as Course["level"] }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 bg-white"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 ${errors.duration ? "border-red-300" : "border-gray-200"}`}
                placeholder="e.g. 8 weeks"
              />
              {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}
            </div>
          </div>

          {/* Price + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (VND)</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Course["status"] }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 bg-white"
              >
                <option>Active</option>
                <option>Draft</option>
                <option>Archived</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingId ? "Save Changes" : "Create Course"}
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