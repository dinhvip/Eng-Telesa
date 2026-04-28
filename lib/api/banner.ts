import apiClient from "../axios";

export async function fetchPublicBanners(): Promise<any> {
    try {
        const res = await apiClient.get('/site-setting-banners');
        return res; // apiClient interceptor returns res.data
    } catch (error) {
        console.error("❌ Lỗi lấy danh sách banner công khai:", error);
        throw error;
    }
}
