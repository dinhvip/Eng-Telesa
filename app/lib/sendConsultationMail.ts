export type SendConsultationMailPayload = {
  name: string;
  phone?: string;
  email?: string;
  job?: string;
  contact_channel?: "zalo" | "phone" | "email" | string;
  consult_topic?: string;
  notes?: string;
};

export async function sendConsultationMail(payload: SendConsultationMailPayload) {
  const response = await fetch("/api/telesa/send-mail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return;
  await response.json().catch(() => undefined);
}

