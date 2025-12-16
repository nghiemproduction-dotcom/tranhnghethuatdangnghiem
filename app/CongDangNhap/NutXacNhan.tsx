'use client';
import React from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

interface Props {
  isLoading: boolean;
}

export default function NutXacNhan({ isLoading }: Props) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      // Layout dọc (Flex-col) để giống nút trang chủ
      className="group mt-8 flex flex-col items-center gap-3 opacity-90 hover:opacity-100 transition-all disabled:opacity-50 mx-auto"
    >
      {/* Vòng tròn bao quanh icon */}
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center 
                      bg-transparent border-2 border-white/30 text-white 
                      group-hover:bg-white group-hover:text-black group-hover:border-white 
                      group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]
                      transition-all duration-500 ease-out shadow-xl">
          
          {isLoading ? (
             <Loader2 className="animate-spin" size={28} />
          ) : (
             <ArrowRight size={28} className="group-hover:-rotate-45 transition-transform duration-500" strokeWidth={2} />
          )}
      </div>

      {/* Chữ LOGIN ở dưới */}
      <div className="flex flex-col items-center">
          <span className="text-lg font-bold tracking-[0.3em] text-white group-hover:text-yellow-400 transition-colors drop-shadow-md">
              {isLoading ? '...' : 'LOGIN'}
          </span>
      </div>
    </button>
  );
}