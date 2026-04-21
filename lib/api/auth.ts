import apiClient from "../axios";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user?: {
      id: string;
      email: string;
      name?: string;
    };
  };
}

export const authAPI = {
  /**
   * Đăng nhập admin
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/user/login", credentials);
    return response as any;
  },

  /**
   * Logout: xóa token cookie
   */
  logout: () => {
    if (typeof window !== "undefined") {
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  },

  /**
   * Kiểm tra token có hợp lệ không (optional)
   */
  verifyToken: async (): Promise<{ valid: boolean; user?: any }> => {
    try {
      const response = await apiClient.get("/user/me");
      return { valid: true, user: response.data?.data };
    } catch {
      return { valid: false };
    }
  },
};