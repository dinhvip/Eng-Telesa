import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Telesa English - Học Tiếng Anh Trực Tuyến Cho Người Đi Làm",
  description: "Telesa English - Nâng tầm kỹ năng giao tiếp tiếng Anh cho người đi làm với lộ trình học trực tuyến linh hoạt.",
  icons: {
    icon: "/assets/svg/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
