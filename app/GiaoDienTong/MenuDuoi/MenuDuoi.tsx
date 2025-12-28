'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { LayoutTemplate } from 'lucide-react'; 

import ThanhMenuDuoi from './GiaoDien/ThanhMenuDuoi';
import NutMenu from './GiaoDien/NutMenu';
import NutPhongBan from './NutPhongBan/NutPhongBan';
import NutCaNhan from '@/app/GiaoDienTong/MenuDuoi/NutCaNhan/NutCaNhan'; // <--- Đã import nút mới
 

interface Props {
  currentUser?: any;
  onToggleContent?: (isOpen: boolean) => void;
}

export default function MenuDuoi({ currentUser: propUser, onToggleContent }: Props) {
  const pathname = usePathname();
  const [realUser, setRealUser] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Đồng bộ User từ props hoặc LocalStorage
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

  // Báo cho Page biết trạng thái mở/đóng Modal
  useEffect(() => {
      if (onToggleContent) {
          onToggleContent(activeModal !== null);
      }
  }, [activeModal, onToggleContent]);

  const handleToggle = useCallback((modalName: string) => {
      setActiveModal(prev => prev === modalName ? null : modalName);
  }, []);

  const handleCloseAll = useCallback(() => {
      setActiveModal(null);
  }, []);

  return (
    <ThanhMenuDuoi>
        
        {/* NÚT PHÒNG BAN */}
        <NutPhongBan 
            nguoiDung={realUser} 
            isOpen={activeModal === 'phongban'} 
            onToggle={() => handleToggle('phongban')} 
            onClose={handleCloseAll} 
        />

        {/* NÚT CÁ NHÂN (MỚI) */}
        <NutCaNhan 
            nguoiDung={realUser}
            isOpen={activeModal === 'canhan'}
            onToggle={() => handleToggle('canhan')}
            onClose={handleCloseAll}
        />
   
    </ThanhMenuDuoi>
  );
}