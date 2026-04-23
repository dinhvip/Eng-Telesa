"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Table, Button, Input, Modal, Popconfirm, Tag, Space, Typography } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import Toast from "../_components/Toast";
import { fetchCourseCatalog, createCourse, editCourse, deleteCourse } from "../../../lib/api/productPage";
import ImageUpload from "../_components/ImageUpload";
import VideoUpload from "../_components/VideoUpload";
import DocumentUpload from "../_components/DocumentUpload";

const { Text } = Typography;

// 🟢 ĐỔI TÊN STATE GIỐNG HẲT BACKEND API ĐỂ KHÔNG CẦN MAP
type CourseForm = {
  name?: string;
  category_id?: number;
  category_person?: number;
  teacher_id?: string;
  price?: number;
  discount?: number;
  description?: string;
  introducing?: string;
  will_receive?: string;
  note_buy?: string;
  banner?: string | File;
  video?: string | File;
  document?: string | File;
};

// Dữ liệu mặc định khi tạo mới
const emptyForm: CourseForm = {
  name: "",
  category_id: 1,
  category_person: 1,
  teacher_id: "",
  price: undefined,
  discount: undefined,
  description: "",
  introducing: "",
  will_receive: "",
  note_buy: "",
  banner: "",
  video: "",
  document: "",
};

// 📦 MẢNG TÙY CHỌN DROPDOWN
const PERSON_OPTIONS = [
  { label: "Người lớn", value: 1 },
  { label: "Trẻ em", value: 2 },
  { label: "Nguời lớn & trẻ em", value: 3 },
  { label: "Khoá học 90 ngày", value: 4 },
  { label: "Collocations C2 Level", value: 5 },
  { label: "Vocabulary B1", value: 6 },
  { label: "The Oxford 3000 từ", value: 7 },
  { label: "Người mất gốc & Trẻ em", value: 8 },
];
const CATEGORY_OPTIONS = [
  { label: "Khóa Học Online", value: 1 },
];
const TEACHER_OPTIONS = [
  { label: "Nguyễn Thị Lan", id: "512" },
  { label: "Trần Văn Minh", id: "513" },
  { label: "Lê Thị Hương", id: "514" },
];

function formatVND(n: number) {
  if (!n) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CourseForm, string>>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  // 👉 QUẢN LÝ TOAST THÔNG BÁO
  const [toastConfig, setToastConfig] = useState<{ show: boolean, msg: string, type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' });
  const showToast = (msg: string, type: 'success' | 'error') => setToastConfig({ show: true, msg, type });

  // 🚀 GỌI API DANH SÁCH KHI LOAD
  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    setLoading(true);
    try {
      const data = await fetchCourseCatalog();
      setCourses(data || []);
    } catch (err) {
      showToast("Không thể tải danh sách khóa học", "error");
    } finally {
      setLoading(false);
    }
  }

  // Lọc tìm kiếm
  const filteredData = useMemo(
    () => courses.filter((c) => c.name?.toLowerCase().includes(searchQuery.toLowerCase())),
    [courses, searchQuery]
  );

  // --- ACTIONS ---
  function handleCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function handleEdit(course: any) {
    setEditingId(course.id);
    setForm({
      name: course.name,
      category_id: course.category_id,
      category_person: course.category_person,
      teacher_id: course.teacher_id,
      price: course.price,
      discount: course.discount,
      description: course.description,
      introducing: course.introducing,
      will_receive: course.will_receive,
      note_buy: course.note_buy,
      banner: course.banner,
      video: course.video,
      document: course.document,
    });
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: Partial<typeof errors> = {};
    if (!form.name?.trim()) e.name = "Tên khóa học là bắt buộc";
    if ((form.price ?? 0) <= 0) e.price = "Giá phải lớn hơn 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(form)) {
        if (value === undefined || value === "" || value === null) continue;
        if (["banner", "video", "document"].includes(key)) {
          if (typeof value === "string" && value.startsWith("blob:")) {
            const res = await fetch(value);
            const blob = await res.blob();
            const ext = key === "banner" ? "jpg" : key === "video" ? "mp4" : "pdf";
            formData.append(key, blob, `${key}.${ext}`);
          } else if (value instanceof File) {
            formData.append(key, value);
          }
        } else {
          formData.append(key, String(value));
        }
      }

      // Placeholder rỗng nếu cần thiết
      if (!formData.has("banner")) formData.append("banner", new Blob([]), "");
      if (!formData.has("video")) formData.append("video", new Blob([]), "");
      if (!formData.has("document")) formData.append("document", new Blob([]), "");

      if (editingId) {
        await editCourse(editingId, formData);
      } else {
        await createCourse(formData);
      }

      showToast(editingId ? "Cập nhật thành công!" : "Tạo mới thành công!", "success");
      setModalOpen(false);
      window.location.reload();
    } catch (err) {
      showToast("Lỗi: " + (err as Error).message, "error");
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCourse(id);
      setCourses((prev) => prev.filter(c => c.id !== id));
      showToast("Xóa khóa học thành công!", "success");
    } catch (err: any) {
      showToast("Lỗi xóa khóa học: " + err.message, "error");
    }
  };

  // Định nghĩa CỘT TABLE ANTD
  const columns = [
    {
      title: "Thumbnail",
      dataIndex: "banner",
      width: 100,
      render: (text: string) => (
        <div className="w-12 h-12 relative overflow-hidden rounded-md border border-gray-200 shadow-sm">
          {text ? (
            <img src={text} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="bg-gray-100 w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
          )}
        </div>
      ),
    },
    {
      title: "Tên Khóa Học",
      dataIndex: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (text: string, record: any) => (
        <div className="font-medium text-slate-900">{text}</div>
      ),
    },
    {
      title: "Thể Loại", dataIndex: "category_id", width: 150, render: (val: number) => {
        const opt = CATEGORY_OPTIONS.find(o => o.value === val);
        return <Tag color="blue">{opt ? opt.label : 'Unset'}</Tag>;
      }
    },
    {
      title: "Đối Tượng", dataIndex: "category_person", width: 150, render: (val: number) => {
        const opt = PERSON_OPTIONS.find(o => o.value === val);
        return <Tag color="green">{opt ? opt.label : 'Unset'}</Tag>;
      }
    },
    {
      title: "Giáo Viên",
      dataIndex: "teacher_id",
      render: (val: string) => <Text>{TEACHER_OPTIONS.find(t => t.id === val)?.label || val || '-'}</Text>
    },
    {
      title: "Giá Gốc",
      dataIndex: "price",
      sorter: (a: any, b: any) => a.price - b.price,
      render: (val: number) => <span className="text-red-600 font-semibold">{formatVND(val)}</span>
    },
    {
      title: "Chiết Khấu",
      dataIndex: "discount",
      render: (val: number) => <Tag color="orange">{val}%</Tag>
    },
    {
      key: "actions",
      label: "", // Hoặc 'Hành động' nếu dùng custom table
      width: "120px",
      render: (record: any) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleEdit(record)}>
            Sửa
          </Button>

          {/* Nút này giờ chỉ gọi hàm mở Modal và gán ID */}
          <Button
            danger
            onClick={() => {
              setTargetDeleteId(record.id);
              setIsDeleteModalOpen(true);
            }}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản lý Khóa học</h2>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh mục, giá và nội dung khóa học.</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          className="bg-[#D40887] hover:bg-[#b00671] border-none text-white px-4 h-10"
        >
          Tạo mới
        </Button>
      </div>

      {/* Toolbar tìm kiếm */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm theo tên khóa học..."
            prefix={<SearchOutlined className="mr-2 text-gray-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="large"
            className="rounded-lg"
          />
        </div>
      </div>

      {/* TABLE COMPONENT */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table
          columns={columns as any}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trên tổng số ${total} sản phẩm`,
          }}
          scroll={{ x: 1000 }} // Enable horizontal scroll nếu có nhiều cột
        />
      </div>

      {modalOpen && (
        <Modal width={1000}
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          onOk={handleSave}
          okText={editingId ? "Cập nhật" : "Tạo mới"}
          cancelText="Hủy bỏ"
          title={editingId ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
        >
          <div className="space-y-6 pr-1 max-h-[75vh] overflow-y-auto mt-4">

            {/* 🎨 LƯỚI UPLOAD ĐỒNG BỘ KÍCH THƯỚC */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
              <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all duration-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">📷 Banner Hình ảnh</h3>
                <div className="w-full h-36 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                  <ImageUpload label="" value={typeof form.banner === 'string' ? form.banner : ''} onChange={(val) => setForm(f => ({ ...f, banner: val }))} />
                </div>
              </div>
              <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all duration-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">🎥 Video Giới thiệu</h3>
                <div className="w-full h-36 bg-slate-900/40 rounded-lg border-2 border-dashed border-slate-400 flex items-center justify-center overflow-hidden relative group">
                  <VideoUpload label="" value={typeof form.video === 'string' ? form.video : ''} onChange={(val) => setForm(f => ({ ...f, video: val }))} />
                </div>
              </div>
              <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all duration-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-100">📄 Tài liệu tham khảo</h3>
                <div className="w-full h-36 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                  <DocumentUpload label="" value={typeof form.document === 'string' ? form.document : ''} onChange={(val) => setForm(f => ({ ...f, document: val }))} />
                </div>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* TEXT FIELDS */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#D40887]/20 outline-none ${errors.name ? 'border-red-500' : 'border'}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục*</label>
                  <select
                    value={form.category_person}
                    onChange={(e) => setForm(f => ({ ...f, category_person: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg outline-none"
                  >
                    {PERSON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục khóa học*</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm(f => ({ ...f, category_id: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg outline-none"
                  >
                    {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giáo viên phụ trách</label>
                  <select
                    value={form.teacher_id}
                    onChange={(e) => setForm(f => ({ ...f, teacher_id: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg outline-none"
                  >
                    <option value="">-- Chọn GV --</option>
                    {TEACHER_OPTIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc (VND) *</label>
                    <input
                      type="number"
                      value={form.price ?? ""}
                      onChange={(e) => setForm(f => ({ ...f, price: e.target.value === "" ? undefined : Number(e.target.value) }))}
                      className={`w-full px-3 py-2 border rounded-lg outline-none ${errors.price ? 'border-red-500' : 'border'}`}
                    />
                    {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá (%)</label>
                    <input
                      type="number"
                      value={form.discount ?? ""}
                      onChange={(e) => setForm(f => ({ ...f, discount: e.target.value === "" ? undefined : Number(e.target.value) }))}
                      className="w-full px-3 py-2 border rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg outline-none resize-none" />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chương trình học (Introducing)</label>
                <textarea rows={3} value={form.introducing} onChange={(e) => setForm(f => ({ ...f, introducing: e.target.value }))} className="w-full px-3 py-2 border rounded-lg outline-none resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Học viên đạt được (Will Receive)</label>
                <textarea rows={3} value={form.will_receive} onChange={(e) => setForm(f => ({ ...f, will_receive: e.target.value }))} className="w-full px-3 py-2 border rounded-lg outline-none resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lưu ý khi mua (Note Buy)</label>
                <textarea rows={3} value={form.note_buy} onChange={(e) => setForm(f => ({ ...f, note_buy: e.target.value }))} className="w-full px-3 py-2 border rounded-lg outline-none resize-none" />
              </div> */}
            </div>
          </div>
        </Modal>
      )}

      {/* TOAST */}
      {toastConfig.show && (
        <Toast message={toastConfig.msg} type={toastConfig.type} onClose={() => setToastConfig(p => ({ ...p, show: false }))} />
      )}
      {/* 🟢 MODAL XÁC NHẬN XÓA */}
      <Modal
        title="Xác nhận xóa khóa học"
        open={isDeleteModalOpen}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setTargetDeleteId(null);
        }}
        footer={[
          <Button key="back" onClick={() => setIsDeleteModalOpen(false)}>
            Hủy bỏ
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            onClick={() => {
              if (targetDeleteId) {
                handleDelete(targetDeleteId); // Gọi hàm xử lý xóa
                setIsDeleteModalOpen(false);
              }
            }}
          >
            Xác nhận xóa
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <p>Bạn có chắc chắn muốn xóa khóa học này không?</p>
        </div>
      </Modal>
    </div>

  );
}