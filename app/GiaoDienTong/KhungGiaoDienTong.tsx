// FILE: app/GiaoDienTong/KhungGiaoDienTong.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '../ThuVien/ketNoiSupabase'; 
import { Loader2 } from 'lucide-react';

// --- IMPORT TỪ FOLDER MỚI (Nó sẽ tự tìm file index.tsx) ---
 
import MenuDuoi from './MenuDuoi'; 

const ADMIN_CUNG = {
    id: 'hardcode_tommy_vip',
    email: 'admin@artspace.vn', 
    ho_ten: 'Tommy Nghiêm',
    vi_tri: 'System Admin',
    role: 'admin_system',
    avatar_url: null
};

export default function KhungGiaoDienTong({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Danh sách trang login/public
  const cacTrangCongKhai = ['/GiaoDienTong/CongDangNhap', '/phongtrungbay'];
  const laTrangCongKhai = cacTrangCongKhai.some(path => pathname?.startsWith(path));

  useEffect(() => {
    const checkUser = async () => {
      if (laTrangCongKhai) { setIsLoading(false); return; }
      try {
        const laAdminCung = typeof window !== 'undefined' && localStorage.getItem('LA_ADMIN_CUNG') === 'true';
        if (laAdminCung) { setCurrentUser(ADMIN_CUNG); setIsLoading(false); return; }
        const { data: { session } } = await supabase.auth.getSession();
        if (session) setCurrentUser(session.user);
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    checkUser();
  }, [pathname, laTrangCongKhai]);

  if (isLoading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-[#5D4037]"/></div>;
  if (laTrangCongKhai) return <main>{children}</main>;

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-gray-200 font-sans relative">
        
    

        {/* 2. NỘI DUNG CHÍNH */}
        {/* pb-20 là đủ cho menu 60px + khoảng hở */}
        <main className="flex-1 w-full max-w-[1920px] mx-auto p-3 pb-20 md:p-6 md:pb-20">
            {children}
        </main>

        {/* 3. MENU DƯỚI (FOOTER) */}
        <MenuDuoi onAdd={() => console.log('Mở Modal thêm nhanh')} />

    </div>
  );
}