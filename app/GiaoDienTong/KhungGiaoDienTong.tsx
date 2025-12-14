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

  // 1. CÁC TRANG CÔNG KHAI (Login, Public)
  const cacTrangCongKhai = ['/', linkDangNhap, '/phongtrungbay'];
  const laTrangCongKhai = cacTrangCongKhai.includes(pathname);

  // 🟢 2. CÁC TRANG "ZALO MODE" (FULL MÀN HÌNH)
  // 👉 QUAN TRỌNG: Mày điền đúng cái đường dẫn trang Zalo của mày vào đây
  // Nếu trang Zalo là trang chủ (localhost:3000) thì điền '/'
  // Nếu trang Zalo là localhost:3000/phongdemo thì điền '/phongdemo'
  const cacTrangFullApp = ['/phongdemo', '/mobile-app', '/zalo']; 
  
  // Kiểm tra xem pathname hiện tại có bắt đầu bằng một trong các trang trên không
  const laTrangFullApp = cacTrangFullApp.some(path => pathname === path || pathname.startsWith(path + '/'));

  useEffect(() => {
    const checkUser = async () => {
      // Nếu là trang Full App hoặc Công khai thì tắt Loading luôn cho nhanh
      if (laTrangCongKhai || laTrangFullApp) {
          setIsLoading(false);
          // Vẫn check user ngầm nếu cần, nhưng không chặn giao diện
          if(laTrangFullApp) {
             const laAdminCung = typeof window !== 'undefined' && localStorage.getItem('LA_ADMIN_CUNG') === 'true';
             if(laAdminCung) setCurrentUser(ADMIN_CUNG);
             else {
                 const { data: { session } } = await supabase.auth.getSession();
                 if (session?.user) setCurrentUser(session.user);
             }
          }
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
        router.replace(linkDangNhap); 
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [pathname, router, laTrangCongKhai, laTrangFullApp]);

  if (isLoading) {
      return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#A0522D] w-10 h-10" />
        </div>
      );
  }

  // TRƯỜNG HỢP 1: TRANG CÔNG KHAI
  if (laTrangCongKhai) {
      return <div className="min-h-screen bg-black text-white">{children}</div>;
  }

  // 🟢 TRƯỜNG HỢP 2: TRANG ZALO (FULL APP)
  // Trả về children trần trụi, không bọc gì cả -> Để BangChinh.tsx tự quản lý
  if (laTrangFullApp) {
      return <>{children}</>;
  }

  // TRƯỜNG HỢP 3: GIAO DIỆN ADMIN CŨ
  return (
    <div className="flex min-h-screen bg-black text-gray-200">
        <ThanhBen isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} currentUser={currentUser} />
        <LopPhu isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 flex flex-col min-w-0 relative">
            <ThanhHeaderMobile onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} /> 
            
            {/* Đây là thủ phạm padding làm hỏng giao diện mobile của mày trước đó */}
            <div className="flex-1 overflow-auto p-0">
                <div className="pb-32 max-lg:pb-24"> 
                  {children} 
                </div>
            </div>
        </main>
    </div>
  );
}