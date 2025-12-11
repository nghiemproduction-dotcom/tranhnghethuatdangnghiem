import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// 1. IMPORT CÁC THÀNH PHẦN CŨ (GIỮ NGUYÊN)
import KhungGiaoDienTong from './GiaoDienTong/KhungGiaoDienTong';

// 2. IMPORT THÊM BỘ NÃO NGÔN NGỮ (MỚI)
import { NgonNguProvider } from './context/NgonNguContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Art Space - Tranh Nghệ Thuật Đăng Nghiêm',
  description: 'Hệ thống quản lý và trưng bày',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-black text-white`}>
        
        {/* 🟢 BỌC THÊM LỚP NGÔN NGỮ Ở NGOÀI CÙNG */}
        <NgonNguProvider>
            
            {/* Giữ nguyên Khung Giao Diện Tổng của ông */}
            <KhungGiaoDienTong>
                {children}
            </KhungGiaoDienTong>

        </NgonNguProvider>

      </body>
    </html>
  );
}