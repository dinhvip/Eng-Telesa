export type ProductCategory = "course" | "book" | "audio";

export const CATEGORIES: Array<{ key: ProductCategory; label: string }> = [
  { key: "course", label: "Khóa học Online" },
  { key: "book", label: "Sách" },
  { key: "audio", label: "Audio" },
];

export type Teacher = {
  id: number;
  name: string;
  photo: string | null;
  description: string | null;
};

// Interface cho CourseProduct khớp với dữ liệu API
export type CourseProduct = {
  id: any; // API trả về số
  banner: string; // banner
  title: string; // name
  description: string; // Chứa HTML từ description API
  introducing?: string; // Hỗ trợ đi kèm
  will_receive?: string; // Kết quả đạt được

  // Các thông số định lượng
  price: any;
  discount: number;
  originalPrice?: any; // Có thể tính toán: price / (1 - discount/100)

  // Metadata
  total_sold: any; // total_sold
  rating: any; // total_rate

  // Thông tin bổ sung
  total_video: number;
  total_document: number;
  total_article: number;

  teacher: Teacher;

  // Nếu bạn cần render danh sách bài học ngay tại card
  chapters?: any[];
  total_rate: number;
  total_star: number;
  reviews?: any[];
  total_time: string;
  subtitle: any;
  include?: any;
  rates: any[];
};

export type ListCourseProduct = {
  id: string;
  banner: string;
  title: string;
  subtitle: string;
  total_sold: string;
  rating: string;
  price: string;
  originalPrice: string;
  total_time: string;
  include: string;
};

export type BookProduct = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  author: string;
  format: string;
  price: string;
  originalPrice: string;
  language: string;
};

export type AudioProduct = {
  id: string;
  image: string;
  imageLabel: string;
  title: string;
  subtitle: any;
  author: string;
  rating: string;
  reviewCount: string;
  format: string;
  price: any;
  originalPrice: any;
  language: string;
};
