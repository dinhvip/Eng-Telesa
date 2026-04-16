import type { Course, Book, Popup, Settings } from "../_types";

// ─── Mock Courses ─────────────────────────────────────────────────────────────

export const MOCK_COURSES: Course[] = [
  {
    id: "c1",
    title: "Lớp Căn Bản 1 (Pre A1 - Pre A2)",
    slug: "lop-can-ban-1-pre-a1-pre-a2",
    level: "Beginner",
    duration: "8 tuần",
    students: 245,
    price: 2299000,
    status: "Active",
    createdAt: "2026-01-10",
  },
  {
    id: "c2",
    title: "Lớp Căn Bản 2 (A1 - A2)",
    slug: "lop-can-ban-2-a1-a2",
    level: "Beginner",
    duration: "8 tuần",
    students: 198,
    price: 2299000,
    status: "Active",
    createdAt: "2026-01-12",
  },
  {
    id: "c3",
    title: "Lớp Trung Cấp 1 (Pre B1 - Mid B1)",
    slug: "lop-trung-cap-1-pre-b1-mid-b1",
    level: "Intermediate",
    duration: "10 tuần",
    students: 156,
    price: 3093000,
    status: "Active",
    createdAt: "2026-01-15",
  },
  {
    id: "c4",
    title: "Lớp Trung Cấp 2 (Mid B1 - Upper B1)",
    slug: "lop-trung-cap-2-mid-b1-upper-b1",
    level: "Intermediate",
    duration: "10 tuần",
    students: 132,
    price: 3093000,
    status: "Active",
    createdAt: "2026-01-18",
  },
  {
    id: "c5",
    title: "Lớp Cận Bản 3 (Mid A2 - Upper A2)",
    slug: "lop-can-ban-3-mid-a2-upper-a2",
    level: "Beginner",
    duration: "8 tuần",
    students: 110,
    price: 2299000,
    status: "Active",
    createdAt: "2026-01-20",
  },
  {
    id: "c6",
    title: "IELTS Foundation Class",
    slug: "ielts-foundation-class",
    level: "Advanced",
    duration: "12 tuần",
    students: 85,
    price: 4500000,
    status: "Draft",
    createdAt: "2026-02-01",
  },
];

// ─── Mock Books ───────────────────────────────────────────────────────────────

export const MOCK_BOOKS: Book[] = [
  {
    id: "b1",
    title: "Fun English for Kids",
    author: "Telesa Academic Team",
    isbn: "978-0000000001",
    category: "Kids",
    price: 120000,
    stock: 120,
    status: "In Stock",
    publishedAt: "2025-09-01",
  },
  {
    id: "b2",
    title: "Cambridge English Fun for Starters",
    author: "Cambridge Press",
    isbn: "978-1108701657",
    category: "Kids",
    price: 180000,
    stock: 95,
    status: "In Stock",
    publishedAt: "2024-06-10",
  },
  {
    id: "b3",
    title: "Cambridge English Fun for Movers",
    author: "Cambridge Press",
    isbn: "978-1108701664",
    category: "Kids",
    price: 190000,
    stock: 60,
    status: "In Stock",
    publishedAt: "2024-06-10",
  },
  {
    id: "b4",
    title: "You Can Talk - TES Level 2 (Pre A1 - Pre A2)",
    author: "Telesa Academic Team",
    isbn: "978-0000000002",
    category: "Speaking",
    price: 150000,
    stock: 80,
    status: "In Stock",
    publishedAt: "2025-10-01",
  },
  {
    id: "b5",
    title: "You Can Talk - TES Level 2 (Pre A1 - Pre A2) - Audio",
    author: "Telesa Academic Team",
    isbn: "978-0000000003",
    category: "Speaking",
    price: 90000,
    stock: 200,
    status: "In Stock",
    publishedAt: "2025-10-01",
  },
];

// ─── Mock Popups ──────────────────────────────────────────────────────────────

export const MOCK_POPUPS: Popup[] = [
  {
    id: "p1",
    title: "Giảm học phí tháng 6",
    content: "Ưu đãi lên đến 13% cho tất cả lớp học tiếng Anh!",
    type: "Modal",
    targetPage: "Homepage",
    isActive: true,
    startDate: "2026-06-01",
    endDate: "2026-06-30",
  },
  {
    id: "p2",
    title: "Đăng ký học thử miễn phí",
    content: "Trải nghiệm lớp học 1-1 miễn phí 7 ngày.",
    type: "Banner",
    targetPage: "All Pages",
    isActive: true,
    startDate: "2026-04-01",
    endDate: "2026-12-31",
  },
  {
    id: "p3",
    title: "Khóa học mới",
    content: "IELTS & Communication class vừa mở đăng ký!",
    type: "Toast",
    targetPage: "Courses Page",
    isActive: false,
    startDate: "2026-03-01",
    endDate: "2026-04-01",
  },
];

// ─── Mock Settings ────────────────────────────────────────────────────────────

export const MOCK_SETTINGS: Settings = {
  email: "team1@telesaenglish.com",
  hotline: "0932639259",
};