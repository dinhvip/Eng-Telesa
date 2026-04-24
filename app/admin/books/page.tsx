"use client";

import React, { useState, useMemo } from "react";
import type { Book, TableColumn } from "../_types";
import { MOCK_BOOKS } from "../_data/mock";
import Table from "../_components/Table";
import Button from "../_components/Button";
import Modal from "../_components/Modal";
import StatusBadge from "../_components/StatusBadge";
import ImageUpload from "../_components/ImageUpload";

type BookForm = Omit<Book, "id" | "publishedAt"> & { image?: string };

const emptyForm: BookForm = {
  title: "",
  author: "",
  isbn: "",
  category: "",
  price: 0,
  stock: 0,
  status: "In Stock",
  image: "",
};

function stockVariant(s: Book["status"]) {
  if (s === "In Stock") return "success" as const;
  if (s === "Low Stock") return "warning" as const;
  return "danger" as const;
}

function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BookForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof BookForm, string>>>({});
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      books.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.author.toLowerCase().includes(search.toLowerCase()) ||
          b.category.toLowerCase().includes(search.toLowerCase())
      ),
    [books, search]
  );

  function handleCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function handleEdit(book: Book & { image?: string }) {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      price: book.price,
      stock: book.stock,
      status: book.status,
      image: book.image || "",
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.author.trim()) e.author = "Author is required";
    if (!form.isbn.trim()) e.isbn = "ISBN is required";
    if (!form.category.trim()) e.category = "Category is required";
    if (form.price <= 0) e.price = "Price must be greater than 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function resolveStatus(stock: number): Book["status"] {
    if (stock === 0) return "Out of Stock";
    if (stock <= 10) return "Low Stock";
    return "In Stock";
  }

  function handleSave() {
    if (!validate()) return;

    const withStatus = { ...form, status: resolveStatus(form.stock) };

    if (editingId) {
      setBooks((prev) =>
        prev.map((b) => (b.id === editingId ? { ...b, ...withStatus } : b))
      );
    } else {
      const newBook: Book = {
        ...withStatus,
        id: `b${Date.now()}`,
        publishedAt: new Date().toISOString().split("T")[0],
      } as Book;
      setBooks((prev) => [newBook, ...prev]);
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    setDeleteConfirm(null);
  }

  const columns: TableColumn<Book & { image?: string }>[] = [
    {
      key: "title",
      label: "Book",
      render: (b) => (
        <div className="flex items-center gap-3">
          {/* Cập nhật Table để hiển thị Thumbnail ảnh */}
          {b.image ? (
            <img src={b.image} alt={b.title} className="w-10 h-10 rounded-md object-cover bg-gray-100 border border-gray-200" />
          ) : (
            <div className="w-10 h-10 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{b.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{b.author}</p>
          </div>
        </div>
      ),
    },
    { key: "isbn", label: "ISBN" },
    {
      key: "category",
      label: "Category",
      render: (b) => (
        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
          {b.category}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (b) => <span className="tabular-nums">{formatVND(b.price)}</span>,
    },
    {
      key: "stock",
      label: "Stock",
      render: (b) => <span className="font-medium tabular-nums">{b.stock}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (b) => <StatusBadge label={b.status} variant={stockVariant(b.status)} />,
    },
    {
      key: "actions",
      label: "",
      width: "120px",
      render: (b) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(b)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="!text-red-500 hover:!bg-red-50" onClick={() => setDeleteConfirm(b.id)}>
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
          <h1 className="text-2xl font-bold text-gray-900">Books</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your book inventory and catalog.
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
          Add Book
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
          placeholder="Search books..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 transition-shadow"
        />
      </div>

      {/* Table */}
      {/* <Table
        columns={columns}
        data={filtered}
        emptyTitle="No books yet"
        emptyDescription="Start building your library by adding the first book."
        onAdd={handleCreate}
      /> */}

      {/* Create / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Book" : "New Book"}
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
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 ${errors.title ? "border-red-300" : "border-gray-200"}`}
              placeholder="Enter book title"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Author + ISBN */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 ${errors.author ? "border-red-300" : "border-gray-200"}`}
                placeholder="Author name"
              />
              {errors.author && <p className="text-xs text-red-500 mt-1">{errors.author}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
              <input
                value={form.isbn}
                onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 ${errors.isbn ? "border-red-300" : "border-gray-200"}`}
                placeholder="978-XXXXXXXXXX"
              />
              {errors.isbn && <p className="text-xs text-red-500 mt-1">{errors.isbn}</p>}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40 ${errors.category ? "border-red-300" : "border-gray-200"}`}
              placeholder="e.g. Grammar, IELTS, Vocabulary"
            />
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          {/* Price + Stock */}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e005a]/20 focus:border-[#9e005a]/40"
                placeholder="0"
                min={0}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingId ? "Save Changes" : "Add Book"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Book"
      >
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to remove this book from your catalog? This action cannot be undone.
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
