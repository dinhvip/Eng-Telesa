import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { productDetailAPI } from "../../../lib/api/productDetail";

export default async function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const course = await productDetailAPI.getProductDetail(id);
  if (!course) notFound();
  
  // Map API fields to match CourseProduct interface expected by Client Component
  const courseData = {
    ...course,
    title: course.name,
  };

  return <ProductDetailClient course={courseData as any} />;
}
