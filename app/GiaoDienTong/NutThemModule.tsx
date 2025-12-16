'use client';
import React from 'react';
import { Plus } from 'lucide-react';

export default function NutThemModule({ onClick }: { onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="
        group w-full h-full min-h-[200px]
        flex flex-col items-center justify-center 
        bg-[#121212] hover:bg-[#1A1A1A]
        border-r border-b border-white/5
        transition-all duration-200
      "
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-blue-600 group-hover:scale-110 transition-all">
        <Plus size={20} className="text-gray-500 group-hover:text-white transition-colors" />
      </div>
      <span className="mt-2 text-[10px] font-bold text-gray-600 group-hover:text-blue-400 uppercase tracking-wider">
        Thêm Module
      </span>
    </button>
  );
}