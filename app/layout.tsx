// FILE: app/layout.tsx
import './globals.css';
import KhungGiaoDienTong from './GiaoDienTong/KhungGiaoDienTong';

export const metadata = {
  title: 'ArtSpace Manager',
  description: 'Hệ thống quản lý',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      {/* THAY ĐỔI Ở ĐÂY:
         - text-lg: Trên Mobile chữ mặc định là 18px (To)
         - md:text-sm: Trên Desktop chữ về lại 14px (Gọn)
         - antialiased: Làm mượt phông chữ
      */}
      <body className="bg-[#0a0a0a] text-white text-lg md:text-sm antialiased leading-relaxed">
        <KhungGiaoDienTong>
            {children}
        </KhungGiaoDienTong>
      </body>
    </html>
  );
}