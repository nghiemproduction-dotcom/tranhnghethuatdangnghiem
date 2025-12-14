'use client';
import React from 'react';

export default function NutIcon({ icon, badge, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="relative w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-[#3E2723] hover:bg-[#5D4037] text-white/90 hover:text-white transition-all shadow-sm border border-white/5 active:scale-95"
    >
      {/* Icon trên mobile to hơn một chút */}
      <div className="scale-110 md:scale-100">{icon}</div>
      
      {/* Badge thông báo */}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 md:w-4 md:h-4 bg-red-600 rounded-full text-[10px] md:text-[9px] flex items-center justify-center font-bold border-2 border-[#1A1A1A]">
          {badge}
        </span>
      )}
    </button>
  );
}