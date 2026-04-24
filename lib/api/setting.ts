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

        const res = await apiClient.post('/admin/site-settings', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return res;
    } catch (error) {
        console.error("❌ Lỗi cập nhật API Site Settings:", error);
        throw error;
    }
}

