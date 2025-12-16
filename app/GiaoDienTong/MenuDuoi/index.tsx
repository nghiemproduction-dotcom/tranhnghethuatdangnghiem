'use client';
import React from 'react';
import { usePathname } from 'next/navigation'; // 🟢 1. Import hook lấy đường dẫn
import { Home, LayoutGrid, Plus, Bell, User } from 'lucide-react';
import NutMenu from './NutMenu';

export default function MenuDuoi({ onAdd }: any) {
  const pathname = usePathname(); // 🟢 2. Lấy đường dẫn hiện tại

  // 🟢 3. Kiểm tra: Nếu là trang chủ ('/') thì ẩn luôn (return null)
  if (pathname === '/') {
    return null;
  }

  return (
    // Mobile cao 80px, Desktop cao 60px -> Mobile to dễ bấm
    <nav className="fixed bottom-0 left-0 right-0 z-[990] bg-[#1A1A1A] border-t border-white/10 h-20 md:h-[60px] pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="h-full max-w-lg md:max-w-2xl mx-auto px-4 flex justify-between items-center relative">
        
        {/* Lưu ý: Nếu trang chủ ẩn menu thì nút Home này nên trỏ về Dashboard hoặc trang khác, 
            hoặc giữ nguyên nếu bạn muốn người dùng quay lại trang chủ rồi mất menu */}
        <NutMenu href="/" icon={<Home size={26} className="md:w-5 md:h-5"/>} label="Trang chủ" active={pathname === '/'} />
        <NutMenu href="/modules" icon={<LayoutGrid size={26} className="md:w-5 md:h-5"/>} label="Chức năng" active={pathname === '/modules'} />

        {/* NÚT CỘNG TO */}
        <div className="relative -top-6 md:-top-5 w-16 md:w-14 flex justify-center">
           <button 
             onClick={onAdd}
             className="w-16 h-16 md:w-12 md:h-12 bg-gradient-to-b from-[#5D4037] to-[#3E2723] rounded-full border-[4px] border-[#121212] flex items-center justify-center shadow-lg shadow-[#3E2723]/40 hover:scale-110 active:scale-95 transition-all text-white group"
           >
              <Plus size={32} className="md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
           </button>
        </div>

        <NutMenu href="/thong-bao" icon={<Bell size={26} className="md:w-5 md:h-5"/>} label="Tin báo" active={pathname === '/thong-bao'} />
        <NutMenu href="/ca-nhan" icon={<User size={26} className="md:w-5 md:h-5"/>} label="Tôi" active={pathname === '/ca-nhan'} />

      </div>
    </nav>
  );
}