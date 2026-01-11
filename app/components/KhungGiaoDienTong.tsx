'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import StaffPresence from '../../components/StaffPresence';

export default function KhungGiaoDienTong({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Bypass ngay nếu là trang Admin (Tránh xung đột)
    if (pathname?.startsWith('/phongadmin')) {
        setIsLoading(false);
        return;
    }

    const checkAuth = () => {
      // 2. Bypass các trang public
      if (pathname === '/' || pathname === '/login' || pathname === '/trangchu') {
          setIsLoading(false);
          return;
      }

      // 3. Xử lý localStorage an toàn (Chống crash JSON)
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('USER_INFO');
        if (storedUser) {
          try {
             // 🟢 FIX: Kiểm tra kỹ chuỗi trước khi parse
             if (storedUser !== "undefined" && storedUser !== "null") {
                JSON.parse(storedUser);
             } else {
                localStorage.removeItem('USER_INFO'); 
             }
          } catch (e) {
            console.warn('Dữ liệu user lỗi, tự động reset.');
            localStorage.removeItem('USER_INFO');
          }
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname]);

  if (isLoading && !pathname?.startsWith('/phongadmin')) {
      return (
          <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-[#C69C6D]" size={40}/>
          </div>
      );
  }
 
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-gray-200 font-sans relative">
        <main className="flex-1 w-full max-w-[1920px] mx-auto p-0">
            {children}
        </main>
        {/* Chỉ hiện StaffPresence nếu KHÔNG phải trang admin */}
        {!pathname?.startsWith('/phongadmin') && <StaffPresence />}
    </div>
  );
}