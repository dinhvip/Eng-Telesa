import axios from "axios";

export type SendConsultationMailPayload = {
  name: string;
  email?: string;
  contact_method?: string;
  phone?: string;
  consultation_content?: string;
};

export async function sendConsultationMail(payload: SendConsultationMailPayload) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_TELESA_API_BASE_URL || "https://dev-admin.telesaenglish.com";
    await axios.post(`${baseUrl}/api/submit-contact`, payload, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    });
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.response?.data;
      throw new Error(
        typeof message === "string" 
          ? message 
          : error.message || `HTTP ${error.response?.status || 500}`
      );
    }
    throw error;
  }
}


