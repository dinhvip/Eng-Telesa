import apiClient from "../axios";

export const productDetailAPI = {
    getProductDetail: async (id: string) => {
        const response = await apiClient.get(`/v2/course/${id}`);
        return response.data;
    },
};