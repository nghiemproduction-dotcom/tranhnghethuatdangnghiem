'use client';

import React, { useEffect, useState } from 'react';
import DauThanhBen from './DauThanhBen';
import ChanThanhBen from './ChanThanhBen';
import CacNutBam from './CacNutBam';
import { supabase } from '@/app/ThuVien/ketNoiSupabase'; 

interface ThanhBenProps {
  isOpen: boolean;     
  onClose: () => void; 
  currentUser: any; // User từ Auth
}

export default function ThanhBen({ isOpen, onClose, currentUser }: ThanhBenProps) {
  // State lưu thông tin chi tiết nhân sự (Tên hiển thị, vị trí...)
  const [profile, setProfile] = useState<any>(null);

  // 🟢 TỰ ĐỘNG LẤY TÊN HIỂN THỊ KHI CÓ USER
  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser?.email) {
        const { data } = await supabase
          .from('nhan_su')
          .select('ten_hien_thi, vi_tri')
          .eq('email', currentUser.email)
          .single();
        
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, [currentUser]);

  // Gộp thông tin Auth và Database để truyền xuống dưới
  const finalUser = profile ? { ...currentUser, ...profile } : currentUser;

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-[200] w-64 bg-[#131314] border-r border-white/5 flex flex-col 
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:block shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* 1. ĐẦU (Logo) */}
      <DauThanhBen onClose={onClose} />

      {/* 2. THÂN (Menu Phân Cấp) */}
      {/* flex-1 và overflow-y-auto giúp menu tự cuộn nếu danh sách quá dài */}
      <CacNutBam onClose={onClose} />

      {/* 3. CHÂN (Hiển thị Tên thật) */}
      <ChanThanhBen currentUser={finalUser} />
    </aside>
  );
}