'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { LayoutTemplate, Grid } from 'lucide-react'; 

import ThanhMenuDuoi from './GiaoDien/ThanhMenuDuoi';
import NutMenu from './GiaoDien/NutMenu';
import NutPhongBan from './NutPhongBan/NutPhongBan';
import NutCaNhan from './NutCaNhan/NutCaNhan'; 

interface Props {
  currentUser?: any;
  // 🟢 THÊM PROP NÀY ĐỂ LIÊN LẠC VỚI TRANG CHỦ
  onToggleContent?: (isOpen: boolean) => void;
}

export default function MenuDuoi({ currentUser: propUser, onToggleContent }: Props) {
  const pathname = usePathname();
  const [realUser, setRealUser] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    if (propUser) { 
        setRealUser(propUser); 
    } else if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('USER_INFO');
        if (stored) { 
            try { setRealUser(JSON.parse(stored)); } catch (e) { console.error(e); } 
        }
    }
  }, [propUser]);

  // 🟢 HÀM TOGGLE ĐÃ CẬP NHẬT LOGIC BÁO HIỆU
  const handleToggle = (modalName: string) => {
      setActiveModal(prev => {
          const newState = prev === modalName ? null : modalName;
          
          // Báo cho Page biết: Có đang mở cái gì không?
          // Nếu newState != null => Đang mở => Page cần ẩn chữ
          if (onToggleContent) {
              onToggleContent(newState !== null);
          }
          
          return newState;
      });
  };

  const handleCloseAll = () => {
      setActiveModal(null);
      // Báo đóng -> Page hiện chữ lại
      if (onToggleContent) onToggleContent(false);
  };

  return (
    <>
      <ThanhMenuDuoi>
          
          {/* NÚT PHÒNG BAN */}
          <NutPhongBan 
              nguoiDung={realUser} 
              isOpen={activeModal === 'phongban'} 
              onToggle={() => handleToggle('phongban')} 
              onClose={handleCloseAll} 
          />

          {/* NÚT CÁ NHÂN */}
          <NutCaNhan 
              nguoiDung={realUser} 
              isOpen={activeModal === 'canhan'}
              onToggle={() => handleToggle('canhan')}
              onClose={handleCloseAll}
          />

      </ThanhMenuDuoi>
    </>
  );
}