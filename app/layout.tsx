import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ArtSpace ERP",
  description: "Quản trị ArtSpace",
  manifest: "/manifest.json",
};

// 🟢 CHÌA KHÓA QUAN TRỌNG NHẤT:
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Chặn zoom -> Giống App thật
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-[#12100E] text-[#D4C4B7] overscroll-none`}>
        {children}
      </body>
    </html>
  );
}