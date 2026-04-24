import apiClient from "../axios";

export async function fetchAllSettings(options?: { signal?: AbortSignal }): Promise<any> {
    try {
        const res: any = await apiClient.get('/site-settings', { signal: options?.signal });

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