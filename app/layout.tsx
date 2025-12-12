import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import KhungGiaoDienTong from './GiaoDienTong/KhungGiaoDienTong';

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
      {/* Thêm suppressHydrationWarning để tránh lỗi khớp giao diện */}
      <body className={`${inter.className} bg-black text-white`} suppressHydrationWarning={true}>
        <KhungGiaoDienTong>
            {children}
        </KhungGiaoDienTong>
      </body>
    </html>
  );
}