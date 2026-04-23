// src/app/product/telesaApi.ts

import apiClient from "../axios";

export async function fetchCourseCatalog(options?: { signal?: AbortSignal }): Promise<any[]> {
    try {
        // axios.ts đã có interceptor trả về response.data nên biến 'res' chính là toàn bộ JSON
        const res = await apiClient.get('/course/list', { signal: options?.signal });

        // Cấu trúc JSON trả về là: { message: "...", data: { courses: [...] }, error: null }
        // Ta chỉ cần truy cập vào đường dẫn data.courses
        if (res?.data?.courses) {
            return res.data.courses;
        }

        console.warn("API trả về không đúng định dạng hoặc rỗng:", res);
        return [];
    } catch (error) {
        // Nếu người dùng tắt tab khi đang load -> ignore
        if ((error as any).name === 'CanceledError') return [];

        console.error("❌ Lỗi gọi API Course Catalog:", error);
        throw error;
    }
}

export async function createCourse(formData: FormData): Promise<any> {
    try {
        return await apiClient.post('/course', formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true
        });
    } catch (error: any) {
        console.error("❌ Lỗi khi tạo khóa học:", error);
        throw new Error(error?.response?.data?.message || error.message || "Tạo thất bại từ server");
    }
}

export async function editCourse(id: string | number, formData: FormData): Promise<any> {
    try {
        return await apiClient.put(`/course/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true
        });
    } catch (error: any) {
        console.error("❌ Lỗi khi cập nhật khóa học:", error);
        throw new Error(error?.response?.data?.message || error.message || "Cập nhật thất bại từ server");
    }
}

export async function deleteCourse(id: string | number): Promise<any> {
    try {
        const res = await apiClient.delete(`/course/${id}`, {
            withCredentials: true
        });
        return res;
    } catch (error: any) {
        console.error("❌ Lỗi khi xóa khóa học:", error);
        throw new Error(error?.response?.data?.message || error.message || "Xóa thất bại từ server");
    }
}