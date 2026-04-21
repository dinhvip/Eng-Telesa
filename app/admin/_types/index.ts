// ─── Admin Module Types ───────────────────────────────────────────────────────

export interface Course {
  id: string;
  title: string;
  slug: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  students: number;
  price: number;
  salePrice: number;
  status: "Active" | "Draft" | "Archived";
  createdAt: string;
  image: string;
  category: string;
  courseCategory: string;
  teacher: string;
  description: string;
  introduction: string;
  benefits: string;
  purchaseNotes: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  price: number;
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  publishedAt: string;
}

export interface Popup {
  id: string;
  title: string;
  content: string;
  type: "Banner" | "Modal" | "Toast";
  targetPage: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface Settings {
  email: string;
  hotline: string;
}

// ─── Table Column Definition ──────────────────────────────────────────────────

export interface TableColumn<T> {
  key: keyof T | "actions";
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}
