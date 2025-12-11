'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { Clock, ShieldCheck } from 'lucide-react';

// Import các module chức năng
import BangChinh from '@/app/phongdemo/KhuVucChuaModule/BangChinh';
import NhapNoiDungChat from '@/app/GiaoDienTong/HopChatChung/NhapNoiDungChat';

export default function PhongQuanLy() {
  const [tenQuanLy, setTenQuanLy] = useState('Quản Lý');
  const [loiChao, setLoiChao] = useState('');

  // Logic lấy tên và tạo lời chào theo giờ
  useEffect(() => {
    const layThongTin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        // Lấy tên từ email (bỏ phần @gmail.com) hoặc query từ bảng nhan_su nếu cần
        const tenRutGon = user.email.split('@')[0];
        setTenQuanLy(tenRutGon.charAt(0).toUpperCase() + tenRutGon.slice(1));
      }
    };
    layThongTin();

    const gio = new Date().getHours();
    if (gio < 12) setLoiChao('Chào buổi sáng');
    else if (gio < 18) setLoiChao('Chào buổi chiều');
    else setLoiChao('Buổi tối an lành');
  }, []);

  return (
    <div className="relative min-h-screen bg-[#09090b] flex flex-col">
      
      {/* 1. HEADER DASHBOARD: Gọn gàng, chuyên nghiệp */}
      <div className="flex-none px-6 py-5 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        <div>
           <div className="flex items-center gap-2 text-yellow-500 mb-1">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-bold tracking-widest uppercase border border-yellow-900/30 bg-yellow-900/10 px-2 rounded-full">
                Administrator
              </span>
           </div>
           <h1 className="text-2xl font-light text-white">
             {loiChao}, <span className="font-serif italic text-gray-400">{tenQuanLy}</span>
           </h1>
        </div>

        {/* Đồng hồ hoặc Widget nhỏ bên phải */}
        <div className="hidden md:flex flex-col items-end text-right">
           <span className="text-xs text-gray-500 font-mono">XƯỞNG HẺM 2 SYSTEM</span>
           <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
              <Clock size={14} />
              <span>{new Date().toLocaleDateString('vi-VN')}</span>
           </div>
        </div>
      </div>

      {/* 2. KHÔNG GIAN LÀM VIỆC CHÍNH (Lưới Kéo Thả) */}
      <div className="flex-1 w-full h-full relative z-0">
          {/* Component BangChinh chứa logic kéo thả các module */}
          <BangChinh />
      </div>

      {/* 3. THANH CHAT (Fixed Bottom) 
          Đã được import vào để Quản lý có thể chỉ đạo từ xa
      */}
      <NhapNoiDungChat />

    </div>
  );
}