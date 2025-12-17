'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, BookUser, Clock, User, LayoutGrid } from 'lucide-react';
import NutMenu from '../NutMenu';

export default function MenuDuoi({ }: any) {
  const pathname = usePathname();

  // Menu Zalo Darkmode chuẩn
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[990] bg-[#1A1A1A] border-t border-white/5 h-[60px] pb-safe">
      <div className="h-full max-w-7xl mx-auto px-2 flex justify-between items-center">
        
        <NutMenu 
            href="/" 
            icon={<MessageCircle size={24} strokeWidth={1.5} />} 
            label="Tin nhắn" 
            active={pathname === '/'} 
        />
        
        <NutMenu 
            href="/danh-ba" 
            icon={<BookUser size={24} strokeWidth={1.5} />} 
            label="Danh bạ" 
            active={pathname === '/danh-ba'} 
        />

        {/* Nút ở giữa là Chức năng/Modules thay vì nút Add to đùng (Zalo style) */}
        {/* Nếu muốn nút Add to ở đây thì thay icon LayoutGrid bằng Plus */}
        <NutMenu 
            href="/modules" 
            icon={<LayoutGrid size={24} strokeWidth={1.5} />} 
            label="Khám phá" 
            active={pathname === '/modules'} 
        />

        <NutMenu 
            href="/nhat-ky" 
            icon={<Clock size={24} strokeWidth={1.5} />} 
            label="Nhật ký" 
            active={pathname === '/nhat-ky'} 
        />
        
        <NutMenu 
            href="/ca-nhan" 
            icon={<User size={24} strokeWidth={1.5} />} 
            label="Cá nhân" 
            active={pathname === '/ca-nhan'} 
        />

      </div>
    </nav>
  );
}