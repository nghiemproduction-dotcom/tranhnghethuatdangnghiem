'use client';
import React from 'react';
import { Home, LayoutGrid, Plus, Bell, User } from 'lucide-react';
import NutMenu from './NutMenu';

export default function MenuDuoi({ onAdd }: any) {
  return (
    // Mobile cao 80px, Desktop cao 60px -> Mobile to dễ bấm
    <nav className="fixed bottom-0 left-0 right-0 z-[999] bg-[#1A1A1A] border-t border-white/10 h-20 md:h-[60px] pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="h-full max-w-lg md:max-w-2xl mx-auto px-4 flex justify-between items-center relative">
        
        <NutMenu href="/" icon={<Home size={26} className="md:w-5 md:h-5"/>} label="Trang chủ" active />
        <NutMenu href="/modules" icon={<LayoutGrid size={26} className="md:w-5 md:h-5"/>} label="Chức năng" />

        {/* NÚT CỘNG TO (Điểm nhấn) */}
        <div className="relative -top-6 md:-top-5 w-16 md:w-14 flex justify-center">
           <button 
             onClick={onAdd}
             className="w-16 h-16 md:w-12 md:h-12 bg-gradient-to-b from-[#5D4037] to-[#3E2723] rounded-full border-[4px] border-[#121212] flex items-center justify-center shadow-lg shadow-[#3E2723]/40 hover:scale-110 active:scale-95 transition-all text-white group"
           >
              <Plus size={32} className="md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
           </button>
        </div>

        <NutMenu href="/thong-bao" icon={<Bell size={26} className="md:w-5 md:h-5"/>} label="Tin báo" />
        <NutMenu href="/ca-nhan" icon={<User size={26} className="md:w-5 md:h-5"/>} label="Tôi" />

      </div>
    </nav>
  );
}