'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function NutDatHang() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.push('/dathang')}
      className="group relative px-8 py-3 bg-[#C69C6D] hover:bg-[#B58B5D] text-black font-bold text-sm md:text-base uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(198,156,109,0.3)] hover:shadow-[0_0_30px_rgba(198,156,109,0.5)] transition-all duration-300 flex items-center gap-3 overflow-hidden transform hover:-translate-y-1 active:scale-95"
    >
      {/* Hiệu ứng quét sáng (Shimmer effect) */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
      
      <ShoppingBag size={18} className="shrink-0" />
      <span className="relative z-10">Khám Phá Tác Phẩm</span>
      <ArrowRight size={18} className="shrink-0 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}