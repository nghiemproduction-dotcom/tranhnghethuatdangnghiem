'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// 🟢 CẬP NHẬT IMPORT
 
import CongDangNhap from '../CongDangNhap/CongDangNhap'; 
import StaffPresence from '../components/StaffPresence';

export default function KhungGiaoDienTong({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = () => {
      // 1. Các trang tự quản lý auth -> Cho qua luôn
      if (pathname === '/' || pathname === '/admin' || pathname === '/phongquanly' || pathname === '/phongparttime' || pathname === '/trangchu') {
          setIsLoading(false);
          return;
      }

      // 2. Load user từ localStorage
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('USER_INFO') : null;
      
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
      
      setIsLoading(false);
    };

    loadUser();
  }, [pathname]);

  if (isLoading) return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-[#C69C6D]" size={40}/>
      </div>
  );
 
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-gray-200 font-sans relative">
        <main className="flex-1 w-full max-w-[1920px] mx-auto p-3 pb-20 md:p-6 md:pb-20">
            {children}
        </main>
 <StaffPresence />
 
    </div>
  );
}