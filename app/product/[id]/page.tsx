import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { fetchCourseCatalog, mapApiCourseToViewModel } from "../telesaApi";

export default async function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const courses = await fetchCourseCatalog({ next: { revalidate: 300 } });
  const course = courses.find((item) => String(item.id) === id);
  if (!course) notFound();
  return <ProductDetailClient course={mapApiCourseToViewModel(course)} />;
}
