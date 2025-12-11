'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../ThuVien/ketNoiSupabase'; 
import { Loader2 } from 'lucide-react';

import ThanhBen from './ThanhBen/ThanhBen';
import ThanhHeaderMobile from './ThanhBen/ThanhHeaderMobile';
import LopPhu from './ThanhBen/LopPhu';

const ADMIN_CUNG = {
    id: 'hardcode_tommy_vip',
    email: 'admin@artspace.vn', 
    ho_ten: 'Tommy Nghiêm (Chủ Hệ Thống)',
    vi_tri: 'System Admin',
    role: 'admin_system',
    avatar_url: null
};

export default function KhungGiaoDienTong({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null); 
  const [isLoading, setIsLoading] = useState(true);

  const linkDangNhap = '/GiaoDienTong/CongDangNhap'; 

  // Danh sách trang FULL MÀN HÌNH (Không hiện thanh bên)
  const cacTrangCongKhai = ['/', linkDangNhap, '/phongtrungbay'];
  const laTrangCongKhai = cacTrangCongKhai.includes(pathname);

  useEffect(() => {
    const checkUser = async () => {
      if (laTrangCongKhai) {
          setIsLoading(false);
          return;
      }
      try {
        const laAdminCung = typeof window !== 'undefined' && localStorage.getItem('LA_ADMIN_CUNG') === 'true';
        if (laAdminCung) {
            setCurrentUser(ADMIN_CUNG); 
            setIsLoading(false);        
            return;                     
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user.email) throw new Error('Chưa đăng nhập');

        const { data: staff } = await supabase.from('nhan_su').select('*').eq('email', session.user.email).maybeSingle();
        if (staff) setCurrentUser({ ...session.user, ...staff });
        else setCurrentUser(session.user);
      } catch (error) {
        if (!laTrangCongKhai) router.replace(linkDangNhap); 
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [pathname, router, laTrangCongKhai]);

  if (isLoading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
        </div>
      );
  }

  // TRƯỜNG HỢP 1: TRANG CÔNG KHAI -> KHÔNG CÓ THANH BÊN
  if (laTrangCongKhai) {
      return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {children}
        </div>
      );
  }

  // TRƯỜNG HỢP 2: CÁC TRANG QUẢN TRỊ
  return (
    <div className="flex min-h-screen bg-black text-gray-200 selection:bg-blue-500/30">
        
        {/* 1. THANH BÊN (Tự chiếm chỗ trên Desktop nhờ lg:static) */}
        <ThanhBen 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            currentUser={currentUser} 
        />

        {/* 2. LỚP PHỦ MOBILE */}
        <LopPhu 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
        />

        {/* ❌ ĐÃ XÓA: Cái div lg:w-64 giữ chỗ thừa thãi ở đây */}

        {/* 3. NỘI DUNG CHÍNH */}
        <main className="flex-1 flex flex-col min-w-0 relative">
            <ThanhHeaderMobile onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} /> 
            
            <div className="flex-1 overflow-auto p-0">
                <div className="pb-32 max-lg:pb-24"> 
                  {children} 
                </div>
            </div>
        </main>
    </div>
  );
}