import { NextResponse } from "next/server";

function getAdminApiBaseUrl() {
  const base = process.env.NEXT_PUBLIC_TELESA_API_BASE_URL || "https://dev-admin.telesaenglish.com";
  return base.replace(/\/+$/, "");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const url = `${getAdminApiBaseUrl()}/api/telesa/send-mail`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = await response.json().catch(() => null);
    return NextResponse.json(json, { status: response.status });
  }

  const text = await response.text().catch(() => "");
  return new NextResponse(text, {
    status: response.status,
    headers: { "content-type": contentType || "text/plain; charset=utf-8" },
  });
}
