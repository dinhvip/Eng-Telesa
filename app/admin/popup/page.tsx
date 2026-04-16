"use client";

import React, { useState, useMemo } from "react";
import type { Popup, TableColumn } from "../_types";
import { MOCK_POPUPS } from "../_data/mock";
import Table from "../_components/Table";
import Button from "../_components/Button";
import Modal from "../_components/Modal";
import StatusBadge from "../_components/StatusBadge";

type PopupForm = Omit<Popup, "id">;

const emptyForm: PopupForm = {
  title: "",
  content: "",
  type: "Modal",
  targetPage: "",
  isActive: false,
  startDate: "",
  endDate: "",
};

export default function PopupPage() {
  const [popups, setPopups] = useState<Popup[]>(MOCK_POPUPS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PopupForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof PopupForm, string>>>({});
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      popups.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.type.toLowerCase().includes(search.toLowerCase())
      ),
    [popups, search]
  );

  function handleCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function handleEdit(popup: Popup) {
    setEditingId(popup.id);
    setForm({
      title: popup.title,
      content: popup.content,
      type: popup.type,
      targetPage: popup.targetPage,
      isActive: popup.isActive,
      startDate: popup.startDate,
      endDate: popup.endDate,
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.content.trim()) e.content = "Content is required";
    if (!form.targetPage.trim()) e.targetPage = "Target page is required";
    if (!form.startDate) e.startDate = "Start date is required";
    if (!form.endDate) e.endDate = "End date is required";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      e.endDate = "End date must be after start date";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    if (editingId) {
      setPopups((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...form } : p))
      );
    } else {
      const newPopup: Popup = {
        ...form,
        id: `p${Date.now()}`,
      };
      setPopups((prev) => [newPopup, ...prev]);
    }
    setModalOpen(false);
  }

  function handleToggleActive(id: string) {
    setPopups((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  }

  function handleDelete(id: string) {
    setPopups((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  }

  const columns: TableColumn<Popup>[] = [
    {
      key: "title",
      label: "Popup",
      render: (p) => (
        <div>
          <p className="font-medium text-gray-900">{p.title}</p>
          <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{p.content}</p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (p) => (
        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
          {p.type}
        </span>
      ),
    },
    { key: "targetPage", label: "Target" },
    {
      key: "startDate",
      label: "Period",
      render: (p) => (
        <span className="text-xs tabular-nums text-gray-600">
          {p.startDate} → {p.endDate}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (p) => (
        <StatusBadge
          label={p.isActive ? "Active" : "Inactive"}
          variant={p.isActive ? "success" : "neutral"}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      width: "180px",
      render: (p) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleActive(p.id)}
            className={p.isActive ? "!text-amber-600 hover:!bg-amber-50" : "!text-emerald-600 hover:!bg-emerald-50"}
          >
            {p.isActive ? "Disable" : "Enable"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="!text-red-500 hover:!bg-red-50" onClick={() => setDeleteConfirm(p.id)}>
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
          <h1 className="text-2xl font-bold text-gray-900">Popups</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage promotional popups, banners, and toasts.
          </p>
        </div>
        {/* <Button
          onClick={handleCreate}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          }
        >
          Add Popup
        </Button> */}
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
          placeholder="Search popups..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 transition-shadow"
        />
      </div>

      {/* Table */}
      {/* <Table
        columns={columns}
        data={filtered}
        emptyTitle="No popups yet"
        emptyDescription="Create your first popup to engage visitors."
        onAdd={handleCreate}
      /> */}

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Popup" : "New Popup"}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 ${errors.title ? "border-red-300" : "border-gray-200"}`}
              placeholder="Popup title"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 resize-none ${errors.content ? "border-red-300" : "border-gray-200"}`}
              placeholder="Popup content / message"
            />
            {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
          </div>

          {/* Type + Target Page */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Popup["type"] }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 bg-white"
              >
                <option>Banner</option>
                <option>Modal</option>
                <option>Toast</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Page</label>
              <input
                value={form.targetPage}
                onChange={(e) => setForm((f) => ({ ...f, targetPage: e.target.value }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 ${errors.targetPage ? "border-red-300" : "border-gray-200"}`}
                placeholder="e.g. Homepage, All Pages"
              />
              {errors.targetPage && <p className="text-xs text-red-500 mt-1">{errors.targetPage}</p>}
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 ${errors.startDate ? "border-red-300" : "border-gray-200"}`}
              />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 ${errors.endDate ? "border-red-300" : "border-gray-200"}`}
              />
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3 py-1">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className={`
                relative w-10 h-[22px] rounded-full transition-colors duration-200 cursor-pointer
                ${form.isActive ? "bg-[#9e005a]" : "bg-gray-300"}
              `}
            >
              <span
                className={`
                  absolute top-[2px] left-[2px] w-[18px] h-[18px] bg-white rounded-full shadow-sm
                  transition-transform duration-200
                  ${form.isActive ? "translate-x-[18px]" : "translate-x-0"}
                `}
              />
            </button>
            <span className="text-sm text-gray-700">
              {form.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingId ? "Save Changes" : "Create Popup"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Popup"
      >
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete this popup? This action cannot be undone.
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
