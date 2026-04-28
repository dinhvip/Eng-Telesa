import apiClient from "../axios";

export async function fetchSiteSettings(options?: { signal?: AbortSignal }): Promise<any> {
    try {
        const res: any = await apiClient.get('/admin/site-settings', { signal: options?.signal });

        if (res?.data) {
            return res.data;
        }

        console.warn("API trả về không đúng định dạng hoặc rỗng:", res);
        return null;
    } catch (error) {
        if ((error as any).name === 'CanceledError') return null;

        console.error("❌ Lỗi gọi API Site Settings:", error);
        throw error;
    }
}

export async function updateSiteSettings(data: { email: string, phone: string }): Promise<any> {
    try {
        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("email", data.email);
        formData.append("phone", data.phone);

        return await apiClient.post('/admin/site-settings', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    } catch (error) {
        console.error("❌ Lỗi cập nhật API Site Settings:", error);
        throw error;
    }
}


export async function updateSiteSettingsRaw(formData: FormData): Promise<any> {
    try {
        return await apiClient.post('/admin/site-settings', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    } catch (error) {
        console.error("❌ Lỗi cập nhật API Site Settings (Raw):", error);
        throw error;
    }
}

// ─── Banner CRUD ─────────────────────────────────────────────────────────────

export async function fetchBannersList(): Promise<any> {
    try {
        const res = await apiClient.get('/admin/site-setting-banners');
        return res.data;
    } catch (error) {
        console.error("❌ Lỗi lấy danh sách banner:", error);
        throw error;
    }
}

export async function createBanner(formData: FormData): Promise<any> {
    try {
        return await apiClient.post('/admin/site-setting-banners', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    } catch (error) {
        console.error("❌ Lỗi tạo banner:", error);
        throw error;
    }
}

export async function updateBanner(id: number, formData: FormData): Promise<any> {
    try {
        // API yêu cầu dùng POST với _method=PUT cho multipart/form-data
        if (!formData.has("_method")) {
            formData.append("_method", "PUT");
        }
        return await apiClient.post(`/admin/site-setting-banners/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    } catch (error) {
        console.error("❌ Lỗi cập nhật banner:", error);
        throw error;
    }
}

export async function deleteBanner(id: number): Promise<any> {
    try {
        return await apiClient.delete(`/admin/site-setting-banners/${id}`);
    } catch (error) {
        console.error("❌ Lỗi xóa banner:", error);
        throw error;
    }
}

