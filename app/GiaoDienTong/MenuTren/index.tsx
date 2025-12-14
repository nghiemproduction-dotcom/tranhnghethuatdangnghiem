'use client';
import React from 'react';
import { Search, MessageCircle, Bell, PlusCircle, Menu as MenuIcon } from 'lucide-react';
import NutIcon from './NutIcon';

export default function MenuTren({ currentUser }: { currentUser: any }) {
  return (
    // Mobile: cao 64px (h-16). Desktop: cao 48px (md:h-12)
    <header className="sticky top-0 z-[999] bg-[#1A1A1A] border-b border-white/10 h-16 md:h-12 px-4 md:px-6 flex items-center justify-between shadow-lg transition-all">
      
      {/* 1. LOGO & TÊN (Bên trái) */}
      <div className="flex items-center gap-3">
        {/* Logo Mobile to hơn */}
        <div className="w-10 h-10 md:w-8 md:h-8 bg-gradient-to-br from-[#5D4037] to-[#3E2723] rounded-xl md:rounded-lg flex items-center justify-center font-black text-white text-base md:text-sm shadow-md border border-white/10">
          AS
        </div>
        
        {/* Tên App & Thanh tìm kiếm */}
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <span className="text-lg md:text-sm font-bold text-white leading-none hidden md:block">ArtSpace</span>
            
            {/* Thanh Search: Ẩn trên mobile nhỏ, hiện icon thay thế */}
            <div className="hidden md:flex items-center bg-[#252525] rounded-full px-3 py-1 h-8 border border-white/5 w-64 group focus-within:border-[#5D4037] transition-colors">
               <Search size={14} className="text-gray-500 group-focus-within:text-white"/>
               <input type="text" placeholder="Tìm đơn hàng, nhân viên..." className="bg-transparent border-none outline-none text-xs text-white w-full placeholder:text-gray-600 ml-2"/>
            </div>
        </div>
      </div>

      {/* 2. MENU PHẢI (Các nút chức năng) */}
      <div className="flex items-center gap-3 md:gap-2">
        {/* Nút Search cho Mobile (Chỉ hiện mobile) */}
        <div className="md:hidden">
            <NutIcon icon={<Search size={20}/>} onClick={() => {}} />
        </div>

        {/* Nút Tạo Đơn (Chỉ hiện Desktop) */}
        <button className="hidden md:flex items-center gap-1.5 bg-[#4E342E] hover:bg-[#5D4037] text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all border border-white/5 shadow-sm active:scale-95">
            <PlusCircle size={14} /> <span>Tạo mới</span>
        </button>

        <NutIcon icon={<MessageCircle size={20} className="md:w-4 md:h-4"/>} badge={5} onClick={() => {}} />
        <NutIcon icon={<Bell size={20} className="md:w-4 md:h-4"/>} badge={12} onClick={() => {}} />
        
        {/* Avatar User */}
        <div className="ml-1 w-10 h-10 md:w-8 md:h-8 rounded-full bg-[#3E2723] p-[2px] cursor-pointer hover:scale-105 transition-transform border border-white/10">
           <div className="w-full h-full rounded-full bg-black overflow-hidden">
               {currentUser?.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="User" className="w-full h-full object-cover"/>
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold bg-[#5D4037]">
                      {currentUser?.ho_ten?.[0] || 'U'}
                  </div>
               )}
           </div>
        </div>
      </div>

    </header>
  );
}