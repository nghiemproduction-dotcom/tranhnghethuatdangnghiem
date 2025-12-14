import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ArtSpace ERP",
  description: "Hệ thống quản trị ArtSpace",
  manifest: "/manifest.json",
};

// 🟢 CHÌA KHÓA ĐỂ MOBILE NHẬN DIỆN (Copy đoạn này)
export const viewport: Viewport = {
  width: "device-width",     // Chiều rộng bằng thiết bị
  initialScale: 1,           // Tỷ lệ ban đầu 1:1 (Không zoom out)
  maximumScale: 1,           // Không cho zoom to quá mức
  userScalable: false,       // Chặn ngón tay zoom (tạo cảm giác Native App)
  viewportFit: "cover",      // Tràn viền (cho iPhone tai thỏ)
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