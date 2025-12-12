'use client';

import React, { useState } from 'react';
import { LogOut, LogIn, Loader2, User, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase'; 

interface Props {
  currentUser?: any; 
}

export default function ChanThanhBen({ currentUser }: Props) {
  const [dangTai, setDangTai] = useState(false);

  const xuLyDangXuat = async () => {
    try {
      setDangTai(true);
      await supabase.auth.signOut();
      if (typeof window !== 'undefined') {
          localStorage.removeItem('LA_ADMIN_CUNG');
          localStorage.removeItem('USER_ROLE'); // Xóa luôn quyền
          localStorage.removeItem('user_info');
      }
      window.location.href = '/GiaoDienTong/CongDangNhap';
    } catch (error) {
      window.location.href = '/GiaoDienTong/CongDangNhap';
    }
  };

  const xuLyDangNhap = () => {
      window.location.href = '/GiaoDienTong/CongDangNhap';
  };

  // Helper: Lấy chữ cái đầu của tên
  const layChuCaiDau = (name: string) => {
      return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="flex-none p-4 border-t border-white/5 bg-[#0E0E0F]">
       
       {currentUser ? (
         <div className="group relative">
             {/* THẺ USER */}
             <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0 border border-white/10">
                  {layChuCaiDau(currentUser.ten_hien_thi || currentUser.ho_ten || currentUser.email)}
                </div>
                
                {/* Thông tin Text */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-sm font-semibold text-gray-200 truncate leading-tight">
                    {/* 🟢 Ưu tiên hiển thị: Tên hiển thị -> Họ tên -> Email */}
                    {currentUser.ten_hien_thi || currentUser.ho_ten || currentUser.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate uppercase font-bold tracking-wide mt-0.5">
                    {currentUser.vi_tri || 'Thành Viên'}
                  </p>
                </div>

                {/* Icon 3 chấm (Option) */}
                <MoreHorizontal size={16} className="text-gray-600 group-hover:text-gray-400" />
             </div>

             {/* MENU POPUP KHI HOVER (Đăng xuất) */}
             <div className="absolute bottom-full left-0 w-full pb-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                 <button
                    onClick={xuLyDangXuat}
                    disabled={dangTai}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1A1A1C] border border-white/10 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 transition-all shadow-xl"
                 >
                    {dangTai ? <Loader2 size={18} className="animate-spin"/> : <LogOut size={18} />}
                    <span className="text-sm font-medium">{dangTai ? 'Đang thoát...' : 'Đăng xuất'}</span>
                 </button>
             </div>
         </div>
       ) : (
           <button
             onClick={xuLyDangNhap}
             className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all text-sm font-bold shadow-lg shadow-blue-900/20"
           >
             <LogIn size={18} />
             <span>Đăng nhập ngay</span>
           </button>
       )}
    </div>
  );
}