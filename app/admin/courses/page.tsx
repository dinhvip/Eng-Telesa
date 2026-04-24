"use client";
import { CloseOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Divider, Input, Modal, Select, Space, Table, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { createCourse, deleteCourse, editCourse, fetchCourseCatalog } from "../../../lib/api/productPage";
import apiClient from "../../../lib/axios";
import DocumentUpload from "../_components/DocumentUpload";
import ImageUpload from "../_components/ImageUpload";
import Toast from "../_components/Toast";
import VideoUpload from "../_components/VideoUpload";
import useListCategories, { useListCourseCategories } from "./UseListcategories";

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
  const { categories, loadingCategories, fetchCategories } = useListCategories();
  const { courseCategories, fetchCourseCategories } = useListCourseCategories();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Thêm danh mục mới (category_person)
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [newCategoryStatus, setNewCategoryStatus] = useState<number>(1);
  const [addingCategory, setAddingCategory] = useState(false);

  // Thêm danh mục khóa học mới (category_id)
  const [isAddCourseCatModalOpen, setIsAddCourseCatModalOpen] = useState(false);
  const [newCourseCatName, setNewCourseCatName] = useState("");
  const [newCourseCatSlug, setNewCourseCatSlug] = useState("");
  const [newCourseCatStatus, setNewCourseCatStatus] = useState<number>(1);
  const [addingCourseCat, setAddingCourseCat] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      showToast("Tên danh mục không được để trống", "error");
      return;
    }
    setAddingCategory(true);
    try {
      const urlencoded = new URLSearchParams();
      urlencoded.append("name", newCategoryName);
      urlencoded.append("slug", newCategorySlug);
      urlencoded.append("status", String(newCategoryStatus));

      await apiClient.post('/categories', urlencoded, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      showToast("Thêm danh mục thành công!", "success");
      setIsAddCategoryModalOpen(false);
      setNewCategoryName("");
      setNewCategorySlug("");
      setNewCategoryStatus(1);
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || "Lỗi khi thêm danh mục", "error");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleAddCourseCategory = async () => {
    if (!newCourseCatName.trim()) {
      showToast("Tên danh mục không được để trống", "error");
      return;
    }
    setAddingCourseCat(true);
    try {
      const urlencoded = new URLSearchParams();
      urlencoded.append("name", newCourseCatName);
      urlencoded.append("slug", newCourseCatSlug);
      urlencoded.append("status", String(newCourseCatStatus));

      await apiClient.post('/course/categories', urlencoded, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      showToast("Thêm danh mục khóa học thành công!", "success");
      setIsAddCourseCatModalOpen(false);
      setNewCourseCatName("");
      setNewCourseCatSlug("");
      setNewCourseCatStatus(1);
      fetchCourseCategories();
    } catch (err: any) {
      showToast(err.message || "Lỗi khi thêm danh mục khóa học", "error");
    } finally {
      setAddingCourseCat(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await apiClient.delete(`/categories/${id}`);
      showToast("Xóa danh mục thành công!", "success");
      fetchCategories();
      if (form.category_person === id) {
        setForm(prev => ({ ...prev, category_person: undefined }));
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi khi xóa danh mục", "error");
    }
  };

  const handleDeleteCourseCategory = async (id: number) => {
    try {
      await apiClient.delete(`/course/categories/${id}`);
      showToast("Xóa danh mục khóa học thành công!", "success");
      fetchCourseCategories();
      if (form.category_id === id) {
        setForm(prev => ({ ...prev, category_id: undefined }));
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi khi xóa danh mục khóa học", "error");
    }
  };

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
    // {
    //   title: "Thể Loại", dataIndex: "category_id", width: 150, render: (val: number) => {
    //     const opt = courseCategories.find(o => o.id === val);
    //     return <Tag color="blue">{opt ? opt.name : 'Unset'}</Tag>;
    //   }
    // },
    // {
    //   title: "Đối Tượng", dataIndex: "category_person", width: 150, render: (val: number) => {
    //     const opt = categories.find(o => o.id === val);
    //     return <Tag color="green">{opt ? opt.name : 'Unset'}</Tag>;
    //   }
    // },
    // {
    //   title: "Giáo Viên",
    //   dataIndex: "teacher_id",
    //   render: (val: string) => <Text>{TEACHER_OPTIONS.find(t => t.id === val)?.label || val || '-'}</Text>
    // },
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
    <div className="space-y-6  mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <Input
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  size="large"
                  status={errors.name ? 'error' : ''}
                  placeholder="Nhập tên khóa học"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục*</label>
                  <Select
                    value={form.category_person}
                    onChange={(val) => setForm(f => ({ ...f, category_person: val }))}
                    className="w-full h-[42px]"
                    popupRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <Space style={{ padding: '0 8px 4px' }}>
                          <Button type="text" icon={<PlusOutlined />} onClick={() => setIsAddCategoryModalOpen(true)}>
                            Thêm danh mục mới
                          </Button>
                        </Space>
                      </>
                    )}
                    options={categories.map(opt => ({
                      label: (
                        <div className="flex items-center justify-between group">
                          <span>{opt.name}</span>
                          <CloseOutlined
                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              Modal.confirm({
                                title: "Xác nhận xóa",
                                content: `Bạn có chắc chắn muốn xóa danh mục "${opt.name}" này không?`,
                                okText: "Xóa",
                                okType: "danger",
                                cancelText: "Hủy",
                                onOk: () => handleDeleteCategory(opt.id),
                              });
                            }}
                          />
                        </div>
                      ),
                      value: opt.id,
                    }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục khóa học*</label>
                  <Select
                    value={form.category_id}
                    onChange={(val) => setForm(f => ({ ...f, category_id: val }))}
                    className="w-full h-[42px]"
                    popupRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <Space style={{ padding: '0 8px 4px' }}>
                          <Button type="text" icon={<PlusOutlined />} onClick={() => setIsAddCourseCatModalOpen(true)}>
                            Thêm danh mục khóa học mới
                          </Button>
                        </Space>
                      </>
                    )}
                    options={courseCategories.map(opt => ({
                      label: (
                        <div className="flex items-center justify-between group">
                          <span>{opt.name}</span>
                          <CloseOutlined
                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              Modal.confirm({
                                title: "Xác nhận xóa",
                                content: `Bạn có chắc chắn muốn xóa danh mục "${opt.name}" này không?`,
                                okText: "Xóa",
                                okType: "danger",
                                cancelText: "Hủy",
                                onOk: () => handleDeleteCourseCategory(opt.id),
                              });
                            }}
                          />
                        </div>
                      ),
                      value: opt.id,
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giáo viên phụ trách</label>
                  <Select
                    value={form.teacher_id}
                    onChange={(val) => setForm(f => ({ ...f, teacher_id: val }))}
                    className="w-full h-[42px]"
                    options={[
                      ...TEACHER_OPTIONS.map(t => ({ label: t.label, value: t.id }))
                    ]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc (VND) *</label>
                    <Input
                      type="number"
                      value={form.price ?? ""}
                      onChange={(e) => setForm(f => ({ ...f, price: e.target.value === "" ? undefined : Number(e.target.value) }))}
                      size="large"
                      status={errors.price ? 'error' : ''}
                      placeholder="Giá gốc"
                    />
                    {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá (%)</label>
                    <Input
                      type="number"
                      value={form.discount ?? ""}
                      onChange={(e) => setForm(f => ({ ...f, discount: e.target.value === "" ? undefined : Number(e.target.value) }))}
                      size="large"
                      placeholder="Giảm giá"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                <Input.TextArea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả ngắn"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chương trình học (Introducing)</label>
                <Input.TextArea rows={3} value={form.introducing} onChange={(e) => setForm(f => ({ ...f, introducing: e.target.value }))} placeholder="Chương trình học" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Học viên đạt được (Will Receive)</label>
                <Input.TextArea rows={3} value={form.will_receive} onChange={(e) => setForm(f => ({ ...f, will_receive: e.target.value }))} placeholder="Học viên đạt được" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lưu ý khi mua (Note Buy)</label>
                <Input.TextArea rows={3} value={form.note_buy} onChange={(e) => setForm(f => ({ ...f, note_buy: e.target.value }))} placeholder="Lưu ý khi mua" />
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

      {/* 🟢 MODAL THÊM DANH MỤC */}
      <Modal
        title="Thêm danh mục mới"
        open={isAddCategoryModalOpen}
        onCancel={() => setIsAddCategoryModalOpen(false)}
        onOk={handleAddCategory}
        okText="Thêm mới"
        cancelText="Hủy bỏ"
        confirmLoading={addingCategory}
      >
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
            <Input
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
              }}
              placeholder="Nhập tên danh mục"
              size="large"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <Input
              value={newCategorySlug}
              onChange={(e) => setNewCategorySlug(e.target.value)}
              placeholder="Nhập slug danh mục"
              size="large"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <Select
              value={newCategoryStatus}
              onChange={(val) => setNewCategoryStatus(val)}
              className="w-full h-[40px]"
              options={[
                { label: "Hoạt động (1)", value: 1 },
                { label: "Ngừng hoạt động (0)", value: 0 },
              ]}
            />
          </div>
        </div>
      </Modal>

      {/* 🟢 MODAL THÊM DANH MỤC KHÓA HỌC */}
      <Modal
        title="Thêm danh mục khóa học mới"
        open={isAddCourseCatModalOpen}
        onCancel={() => setIsAddCourseCatModalOpen(false)}
        onOk={handleAddCourseCategory}
        okText="Thêm mới"
        cancelText="Hủy bỏ"
        confirmLoading={addingCourseCat}
      >
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục khóa học *</label>
            <Input
              value={newCourseCatName}
              onChange={(e) => {
                setNewCourseCatName(e.target.value);
              }}
              placeholder="Nhập tên danh mục khóa học"
              size="large"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <Input
              value={newCourseCatSlug}
              onChange={(e) => setNewCourseCatSlug(e.target.value)}
              placeholder="Nhập slug danh mục khóa học"
              size="large"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <Select
              value={newCourseCatStatus}
              onChange={(val) => setNewCourseCatStatus(val)}
              className="w-full h-[40px]"
              options={[
                { label: "Hoạt động (1)", value: 1 },
                { label: "Ngừng hoạt động (0)", value: 0 },
              ]}
            />
          </div>
        </div>
      </Modal>
    </div>

  );
}