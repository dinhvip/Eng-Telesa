export type ProductCategory = "course" | "book" | "audio";

export const CATEGORIES: Array<{ key: ProductCategory; label: string }> = [
  { key: "course", label: "Khóa học Online" },
  { key: "book", label: "Sách" },
  { key: "audio", label: "Audio" },
];

export type CourseProduct = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  students: string;
  rating: string;
  price: string;
  originalPrice: string;
  duration: string;
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
  subtitle: string;
  author: string;
  rating: string;
  reviewCount: string;
  format: string;
  price: string;
  originalPrice: string;
  language: string;
};

export const COURSE_PRODUCTS: CourseProduct[] = [
  {
    id: "course-a1a2-90",
    image: "/assets/course-1.jpg",
    title: "(A1-A2)/ Dành cho Hv có căn bản - 90 Ngày Giao Tiếp cùng Ms.Telesa",
    subtitle: "Khóa học: 90 Ngày Giao Tiếp cùng Ms. Telesa (A1 → A2)...",
    students: "78,255 học viên",
    rating: "4.75",
    price: "4.200.000 VND",
    originalPrice: "5.200.000 VND",
    duration: "15h 30m",
    include: "Bộ Flashcards + Bài tập",
  },
  {
    id: "course-a1a2-90-2",
    image: "/assets/course-1.jpg",
    title: "(A1-A2)/ Dành cho Hv có căn bản - 90 Ngày Giao Tiếp cùng Ms.Telesa",
    subtitle: "Khóa học: 90 Ngày Giao Tiếp cùng Ms. Telesa (A1 → A2)...",
    students: "78,255 học viên",
    rating: "4.75",
    price: "4.200.000 VND",
    originalPrice: "5.200.000 VND",
    duration: "15h 30m",
    include: "Bộ Flashcards + Bài tập",
  },
] as const;

export const BOOK_PRODUCTS: BookProduct[] = [
  {
    id: "book-fun-1",
    image: "/assets/book.png",
    title: "Fun English for Kids",
    subtitle: "Cuốn sách cung cấp nền tảng ngữ pháp vững chắc dành cho...",
    author: "Telesa Academic Team",
    format: "Sách PDF + File đọc Audio",
    price: "120.000 VND",
    originalPrice: "160.000 VND",
    language: "Tiếng Anh",
  },
  {
    id: "book-fun-2",
    image: "/assets/book.png",
    title: "Fun English for Kids",
    subtitle: "Cuốn sách cung cấp nền tảng ngữ pháp vững chắc dành cho...",
    author: "Telesa Academic Team",
    format: "Sách PDF + File đọc Audio",
    price: "120.000 VND",
    originalPrice: "160.000 VND",
    language: "Tiếng Anh",
  },
] as const;

export const AUDIO_PRODUCTS: AudioProduct[] = [
  {
    id: "audio-you-can-talk-1",
    image: "/assets/audio.png",
    imageLabel: "Audio",
    title: "YOU CAN TALK – TES Level 2 (Pre A1 - Pre A2)",
    subtitle:
      "Audio “You Can Talk – Level 2” được thiết kế song song với từng bài học trong sách, giúp người học luyện nghe – phát âm – phản xạ tại nhà như có giáo viên kèm.",
    author: "Telesa Academic Team",
    rating: "4.75",
    reviewCount: "780 đánh giá",
    format: "Audio",
    price: "60.000 VND",
    originalPrice: "100.000 VND",
    language: "Tiếng Anh",
  },
  {
    id: "audio-you-can-talk-2",
    image: "/assets/audio.png",
    imageLabel: "Audio",
    title: "YOU CAN TALK – TES Level 2 (Pre A1 - Pre A2)",
    subtitle:
      "Audio “You Can Talk – Level 2” được thiết kế song song với từng bài học trong sách, giúp người học luyện nghe – phát âm – phản xạ tại nhà như có giáo viên kèm.",
    author: "Telesa Academic Team",
    rating: "4.75",
    reviewCount: "780 đánh giá",
    format: "Audio",
    price: "60.000 VND",
    originalPrice: "100.000 VND",
    language: "Tiếng Anh",
  },
] as const;

export function getCourseById(id: string) {
  return COURSE_PRODUCTS.find((p) => p.id === id) ?? null;
}

