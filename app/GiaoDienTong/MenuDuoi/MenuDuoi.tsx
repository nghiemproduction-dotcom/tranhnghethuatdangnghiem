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
}

export default function MenuDuoi({ currentUser: propUser }: Props) {
  const pathname = usePathname();
  const [realUser, setRealUser] = useState<any>(null);

  // 🟢 STATE QUẢN LÝ TẬP TRUNG: Đang mở modal nào? ('phongban' | 'canhan' | null)
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

  // Hàm xử lý Toggle (Bật/Tắt)
  const handleToggle = (modalName: string) => {
      // Nếu đang mở chính nó -> Đóng lại (null)
      // Nếu đang mở cái khác -> Chuyển sang cái này
      setActiveModal(prev => prev === modalName ? null : modalName);
  };

  // Hàm đóng tất cả
  const handleCloseAll = () => setActiveModal(null);

  return (
    <>
      <ThanhMenuDuoi>
          
          {/* 1. NÚT PHÒNG BAN */}
          <NutPhongBan 
              nguoiDung={realUser} 
              isOpen={activeModal === 'phongban'} // Cha bảo mở thì mới được mở
              onToggle={() => handleToggle('phongban')} // Con xin phép mở/đóng
              onClose={handleCloseAll} // Lệnh đóng từ bên trong modal
          />

    

          {/* 4. NÚT CÁ NHÂN */}
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