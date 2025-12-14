import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ArtSpace ERP",
  description: "Hệ thống quản trị ArtSpace",
  manifest: "/manifest.json", // Nếu ông có file manifest
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ArtSpace",
  },
};

// 🟢 QUAN TRỌNG: Cấu hình Viewport chuẩn Mobile App
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Chặn zoom bằng 2 ngón tay
  viewportFit: "cover", // Tràn viền (xử lý tai thỏ)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-[#12100E] text-[#D4C4B7] overscroll-none`}>
        {children}
      </body>
    </html>
  );
}