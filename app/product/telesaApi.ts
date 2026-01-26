export type TelesaCourseCategoryResponse = {
  success: boolean;
  message: string;
  error: unknown;
  data: {
    category: {
      id: number;
      name: string;
      slug: string;
      content: string;
    };
    courses: {
      lists: ApiCourse[];
    };
  };
};

export type ApiCourse = {
  id: number;
  name: string;
  price: number | null;
  banner: string | null;
  video: string | null;
  discount: number | null;
  description: string | null;
  will_receive: string | null;
  total_time: string | null;
  total_rate: number | null;
  updated_at: string | null;
};

import type { CourseProduct } from "./catalog";

const DEFAULT_API_BASE_URL = "https://dev-admin.telesaenglish.com";
const DEFAULT_COURSE_CATEGORY_SLUG = "khoa-giao-tiep-90-ngay";

export function getTelesaApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_TELESA_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export function stripHtmlToText(input: string) {
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatVnd(amount: number) {
  const digits = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  return `${new Intl.NumberFormat("vi-VN").format(digits)} VND`;
}

function computeOriginalPrice(price: number, discountPercent: number) {
  if (!Number.isFinite(price) || price <= 0) return 0;
  if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent >= 100) return price;
  return Math.round(price / (1 - discountPercent / 100));
}

export function mapApiCourseToViewModel(course: ApiCourse): CourseProductViewModel {
  const price = course.price ?? 0;
  const discount = course.discount ?? 0;
  const original = computeOriginalPrice(price, discount);
  const descriptionText = course.description ? stripHtmlToText(course.description) : "";

  return {
    id: String(course.id),
    image: course.banner || "/assets/course-1.jpg",
    title: course.name,
    subtitle: descriptionText ? `${descriptionText.slice(0, 92)}${descriptionText.length > 92 ? "…" : ""}` : "",
    students: "—",
    rating: course.total_rate && course.total_rate > 0 ? String(course.total_rate) : "—",
    price: formatVnd(price),
    originalPrice: formatVnd(original),
    duration: course.total_time ? String(course.total_time) : "—",
    include: discount > 0 ? `Giảm ${discount}%` : "—",
  };
}

export type CourseProductViewModel = CourseProduct;

export async function fetchCourseCatalog(
  init?: (RequestInit & { next?: { revalidate?: number } }) | undefined,
) {
  const baseUrl = getTelesaApiBaseUrl();
  const url = new URL("/api/v2/course", baseUrl);
  url.searchParams.set("type", "");
  url.searchParams.set("slug", DEFAULT_COURSE_CATEGORY_SLUG);

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `HTTP ${response.status}`);
  }

  const payload = (await response.json()) as TelesaCourseCategoryResponse;
  const lists = payload?.data?.courses?.lists;
  if (!Array.isArray(lists)) return [];
  // Only treat items that actually have a numeric price as products.
  return lists.filter((item) => typeof item?.price === "number");
}
