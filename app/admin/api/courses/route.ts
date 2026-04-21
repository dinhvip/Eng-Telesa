import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const baseUrl = process.env.TELESA_API_BASE_URL || "https://dev-admin.telesaenglish.com";
    
    // SỬA TẠI ĐÂY: Dùng đúng path từ curl thành công
    const targetUrl = `${baseUrl}/admin/product/course`;

    console.log("Proxying POST to:", targetUrl); // Kiểm tra log ở terminal

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "X-Requested-With": "XMLHttpRequest",
        // Laravel yêu cầu Cookie hoặc Token. Nếu curl dùng Cookie, 
        // bạn có thể cần forward cookie từ trình duyệt sang:
        "Cookie":  "_ga=GA1.1.1233974753.1776163566; _ga_K96D8J7FZQ=GS2.1.s1776681067$o8$g1$t1776681723$j60$l0$h0; XSRF-TOKEN=eyJpdiI6InU3bmx2ZGN4VENyd1NSdG9XTmVmSXc9PSIsInZhbHVlIjoib1YvUFVBZGtkc3ozQUpJY3NIQ2k5N00yRFJQVGdGbEdVVW5MdkxONjlMRVJtaStLdlZCUGcrMVJlZTJFOGR6YXN1THE2eXZ2Rk5oRHhuSGxBbWRtMHZWNkthYnJJbjQxSXBVQmU4SUxuOXY3OXFXbmY3ZUpwNC96andFWU95UWMiLCJtYWMiOiJjNjM0MWE5ODcwOTMwZWRkYjczYTY1MjgzNDE3MTg3OGI4Nzk0NjY1NTcwNjBlN2Y4ZGU1ZmE1MmFiMzMzZjM4IiwidGFnIjoiIn0%3D; laravel_session=eyJpdiI6IjV3M2ZOTUVyOU9nOUN0SEpLY1VOS2c9PSIsInZhbHVlIjoiNjdFUGJkRE5pM1FRVi9rMFRiQ2ZpOVJlcGVQa0wrUmpiRzNyZVVMWTBaSktoTG1PNG9UeXJOY282QXVQcXd4Qmx6NFhOb25Ic2pmaGZyMmFsWExHOVgxUkkrUnovaDUzSXFKY3QzUzZIMnBEUGdabWptNitTZDlteW1IWFFnK2siLCJtYWMiOiI5MTFmNjY5ZTBmMjU2N2IzY2JkYzEyZTc0ODQ5ZjZjMTgyZWY3ZDJhMjIxYTliNjAwZWQ2NzczMjNiNTAyYTExIiwidGFnIjoiIn0%3D",  
      },
      body: formData,
    });

    const result = await response.json().catch(() => ({}));
    return NextResponse.json(result, { status: response.status });
    
  } catch (error) {
    console.error("Lỗi Proxy:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}