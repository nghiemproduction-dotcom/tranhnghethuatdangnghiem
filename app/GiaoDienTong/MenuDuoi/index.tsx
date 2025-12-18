'use client';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Building2, Grid, Plus, LayoutTemplate, UserCircle } from 'lucide-react'; 
import NutMenu from './NutMenu';
import ModalPhongBan from './ModalPhongBan'; 
import ModalCaNhan from './ModalCaNhan'; 

interface Props {
  onAdd?: () => void;
  currentUser?: any; 
}

export default function MenuDuoi({ onAdd, currentUser: propUser }: Props) {
  const pathname = usePathname();
  
  // 🟢 SMART TOGGLE LOGIC: Chỉ dùng 1 biến state để quản lý modal
  const [activeModal, setActiveModal] = useState<'phongban' | 'canhan' | null>(null);

  // State lưu user thực tế
  const [realUser, setRealUser] = useState<any>(null);

  useEffect(() => {
    if (propUser) {
        setRealUser(propUser);
        return;
    }
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('USER_INFO');
        if (stored) {
            try {
                setRealUser(JSON.parse(stored));
            } catch (e) {
                console.error("Lỗi đọc user info:", e);
            }
        }
    }
  }, [propUser]);

  // Hàm xử lý bật/tắt thông minh
  const toggleModal = (modalName: 'phongban' | 'canhan') => {
      setActiveModal(prev => (prev === modalName ? null : modalName));
  };

  const handleClose = () => setActiveModal(null);

  // Class cho Icon Responsive
  const iconResponsiveClass = "w-[clamp(22px,6vw,32px)] h-[clamp(22px,6vw,32px)]";

  return (
    <>
      {/* 🟢 MENU CHÍNH 
          - fixed bottom-0: Luôn ghim đáy
          - w-full: Phủ kín chiều ngang
          - z-[990]: Cao hơn nội dung, thấp hơn Modal (999)
      */}
      <nav className="fixed bottom-0 left-0 right-0 z-[990] bg-[#110d0c] pb-safe h-[clamp(60px,15vw,80px)] shadow-[0_-5px_20px_rgba(0,0,0,0.8)] border-t border-[#3E2723]">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C69C6D]/50 to-transparent"></div>

        {/* 🟢 GRID 4 CỘT ĐỀU NHAU */}
        <div className="h-full w-full max-w-2xl mx-auto px-2 grid grid-cols-4 items-center">
          
          <NutMenu 
              onClick={() => toggleModal('phongban')}
              icon={<Building2 className={iconResponsiveClass} strokeWidth={2} />} 
              label="Phòng Ban" 
              active={activeModal === 'phongban'} 
          />
          
          <NutMenu 
              href="/phongdemo" 
              icon={<LayoutTemplate className={iconResponsiveClass} strokeWidth={2} />} 
              label="Demo" 
              active={pathname === '/phongdemo'} 
          />

          <NutMenu 
              href="/phongtrungbay" 
              icon={<Grid className={iconResponsiveClass} strokeWidth={2} />} 
              label="Gallery" 
              active={pathname === '/phongtrungbay'} 
          />
          
          <NutMenu 
              onClick={() => toggleModal('canhan')}
              icon={<UserCircle className={iconResponsiveClass} strokeWidth={2} />} 
              label="Cá nhân" 
              active={activeModal === 'canhan'} 
          />

        </div>
      </nav>

      {/* 🟢 CÁC MODAL */}
      <ModalPhongBan 
        isOpen={activeModal === 'phongban'} 
        onClose={handleClose}
        currentUser={realUser}
      />

      <ModalCaNhan 
        isOpen={activeModal === 'canhan'} 
        onClose={handleClose}
        currentUser={realUser}
      />
    </>
  );
}