'use client';

import React, { useState } from 'react';
import { LogOut, LogIn, Loader2, User } from 'lucide-react';
// Import supabase (Check lại đường dẫn cho đúng máy ông)
import { supabase } from '../../ThuVien/ketNoiSupabase'; 

interface Props {
  currentUser?: any; // Có dấu ? để không bị lỗi nếu lỡ không truyền
}

export default function ChanThanhBen({ currentUser }: Props) {
  const [dangTai, setDangTai] = useState(false);

  const xuLyDangXuat = async () => {
    try {
      setDangTai(true);
      
      // 1. GỌI SUPABASE (Cứ gọi để đảm bảo sạch session phía server nếu có)
      await supabase.auth.signOut();

      // 2. DỌN DẸP BỘ NHỚ TRÌNH DUYỆT (QUAN TRỌNG)
      if (typeof window !== 'undefined') {
          // 🟢 QUAN TRỌNG: Thu hồi thẻ bài Admin cứng
          localStorage.removeItem('LA_ADMIN_CUNG');
          
          // Xóa thông tin user tạm nếu có
          localStorage.removeItem('user_info');
          
          // Xóa các rác khác của Supabase
          Object.keys(localStorage).forEach((key) => {
              if (key.startsWith('sb-')) localStorage.removeItem(key);
          });
      }

      // 3. ĐÁ VỀ TRANG ĐĂNG NHẬP
      window.location.href = '/GiaoDienTong/CongDangNhap';
      
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      // Dù lỗi cũng force reload về trang đăng nhập để an toàn
      window.location.href = '/GiaoDienTong/CongDangNhap';
    }
  };

  const xuLyDangNhap = () => {
      window.location.href = '/GiaoDienTong/CongDangNhap';
  };

  return (
    <div className="flex-none mt-auto p-4 border-t border-white/5 bg-[#0E0E0F]">
       
       {/* HIỂN THỊ THÔNG TIN USER */}
       {currentUser && (
         <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {currentUser.ho_ten ? currentUser.ho_ten.charAt(0).toUpperCase() : <User size={18}/>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentUser.ho_ten || currentUser.email || 'Admin System'}
              </p>
              <p className="text-xs text-gray-500 truncate uppercase">
                {currentUser.vi_tri || 'Quản trị viên'}
              </p>
            </div>
         </div>
       )}

       {/* NÚT ĐĂNG XUẤT / ĐĂNG NHẬP */}
       {currentUser ? (
           <button
             onClick={xuLyDangXuat}
             disabled={dangTai}
             className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-medium disabled:opacity-50"
           >
             {dangTai ? <Loader2 size={16} className="animate-spin"/> : <LogOut size={16} />}
             <span>{dangTai ? 'Đang thoát...' : 'Đăng xuất'}</span>
           </button>
       ) : (
           <button
             onClick={xuLyDangNhap}
             className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-medium"
           >
             <LogIn size={16} />
             <span>Đăng nhập</span>
           </button>
       )}
    </div>
  );
}