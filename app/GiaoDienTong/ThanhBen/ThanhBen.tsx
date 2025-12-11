// FILE: ThanhBen/ThanhBen.tsx
'use client';

import React from 'react';
import DauThanhBen from './DauThanhBen';
import ChanThanhBen from './ChanThanhBen';
// 🟢 IMPORT MODULE NÚT BẤM VỪA TẠO
import CacNutBam from './CacNutBam';

interface ThanhBenProps {
  isOpen: boolean;     
  onClose: () => void; 
  currentUser: any;    
}

export default function ThanhBen({ isOpen, onClose, currentUser }: ThanhBenProps) {
  
  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-[200] w-64 bg-[#131314] border-r border-white/5 flex flex-col 
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:block
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* 1. ĐẦU (Logo) */}
      <DauThanhBen onClose={onClose} />

      {/* 2. THÂN (Các nút bấm - Được tách ra file riêng) */}
      <CacNutBam onClose={onClose} />

      {/* 3. CHÂN (User/Logout) */}
      <ChanThanhBen currentUser={currentUser} />
    </aside>
  );
}