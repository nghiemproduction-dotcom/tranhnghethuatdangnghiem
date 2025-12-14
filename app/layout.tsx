import type { Metadata, Viewport } from "next"; // 👈 Nhớ import Viewport
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ArtSpace ERP",
  description: "Quản trị hệ thống",
};

// 🟢 ĐÂY LÀ ĐOẠN MÀY ĐANG THIẾU HOẶC SAI
// Nó bắt buộc phải nằm RIÊNG BIỆT, không được nhét vào trong metadata
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Chặn người dùng zoom bằng 2 ngón tay (tạo cảm giác App thật)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-[#121212] text-[#D4C4B7] overscroll-none`}>
        {children}
      </body>
    </html>
  );
}