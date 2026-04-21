import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api", 
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor: gắn token vào header nếu có
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? document.cookie
      .split("; ")
      .find(row => row.startsWith("auth_token="))
      ?.split("=")[1] : undefined;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: xử lý lỗi chung
apiClient.interceptors.response.use(
  (response) => response.data, // Trả về luôn data, không cần res.json()
  (error) => {
    // Xử lý lỗi 401: token hết hạn → xóa cookie
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;