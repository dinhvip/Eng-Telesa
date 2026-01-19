import { notFound } from "next/navigation";
import { getCourseById } from "../catalog";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const course = getCourseById(id);
  if (!course) notFound();
  return <ProductDetailClient course={course} />;
}
