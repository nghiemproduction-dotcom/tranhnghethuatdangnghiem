'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import MenuDuoi from './MenuDuoi'; 
import CongDangNhap from '../CongDangNhap/CongDangNhap'; // Import Component Đăng nhập để làm Cổng rào

export default function KhungGiaoDienTong({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Trạng thái: Có được phép xem nội dung không?
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkSecurity = async () => {
      // 1. Nếu là trang chủ (Sảnh) -> Cho qua luôn (Vùng xanh)
      if (pathname === '/') {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
      }

      // 2. CHECK USER TỪ STORAGE
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('USER_INFO') : null;
      
      if (!storedUser) {
          // CHƯA ĐĂNG NHẬP -> Chặn lại, hiện cổng đăng nhập
          setIsAuthorized(false);
          setIsLoading(false);
          return;
      }

      // 3. ĐÃ ĐĂNG NHẬP -> CHECK QUYỀN VÀO PHÒNG
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      const role = user.role || 'khach';

      // Admin hệ thống -> Đi đâu cũng được
      if (role === 'admin_system' || role.includes('admin')) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
      }

      // Logic phân quyền phòng ban
      let isAllowed = false;
      if (pathname === '/ca-nhan' || pathname === '/modules') isAllowed = true;
      else if (role.includes('quanly') && (pathname.startsWith('/phongquanly') || pathname.startsWith('/phongtho') || pathname.startsWith('/phongsales'))) isAllowed = true;
      else if (role.includes('sales') && (pathname.startsWith('/phongsales'))) isAllowed = true;
      else if (role.includes('tho') && (pathname.startsWith('/phongtho'))) isAllowed = true;
      else if (role.includes('parttime') && (pathname.startsWith('/phongparttime'))) isAllowed = true;
      else if (role.includes('ctv') && (pathname.startsWith('/phongctv'))) isAllowed = true;

      if (!isAllowed) {
          // Đi sai phòng -> Đá về phòng đúng của mình
          let homeBase = '/';
          if (role.includes('quanly')) homeBase = '/phongquanly';
          else if (role.includes('sales')) homeBase = '/phongsales';
          else if (role.includes('tho')) homeBase = '/phongtho';
          else if (role.includes('parttime')) homeBase = '/phongparttime';
          else if (role.includes('ctv')) homeBase = '/phongctv';
          
          if (pathname !== homeBase) {
              router.replace(homeBase);
          }
          // Tạm thời cho hiện nội dung trong lúc chuyển trang
          setIsAuthorized(true); 
      } else {
          // Đi đúng phòng
          setIsAuthorized(true);
      }
      
      setIsLoading(false);
    };

    checkSecurity();
  }, [pathname, router]);

  if (isLoading) return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-[#C69C6D]" size={40}/>
      </div>
  );

  // 🛑 CỔNG RÀO BẢO MẬT
  // Nếu chưa được phép (chưa login) -> Hiển thị Form Đăng nhập đè lên
  if (!isAuthorized) {
      return (
          <CongDangNhap 
            isOpen={true} 
            isGateKeeper={true} // Chế độ Cổng rào: Không cho đóng, bắt buộc login
            onClose={() => router.push('/')} // Nếu cố thoát thì về trang chủ
          />
      );
  }

  // ✅ VÙNG AN TOÀN -> Hiển thị nội dung trang
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-gray-200 font-sans relative">
        <main className="flex-1 w-full max-w-[1920px] mx-auto p-3 pb-20 md:p-6 md:pb-20">
            {children}
        </main>

        <MenuDuoi 
            currentUser={currentUser} 
            onAdd={(currentUser?.role?.includes('admin') || currentUser?.role?.includes('quanly')) 
                ? () => console.log('Mở Modal thêm nhanh') 
                : undefined
            } 
        />
    </div>
  );
}