'use client';
import React from 'react';

interface Props {
  onRegisterClick: () => void; 
  onForgotPasswordClick: () => void; 
}

export default function ChanForm({ onRegisterClick, onForgotPasswordClick }: Props) {
  return (
    <div className="flex items-center justify-between w-full mt-2 px-1">
        <button 
            type="button" 
            onClick={onRegisterClick} 
            className="text-[10px] md:text-xs font-bold tracking-[0.1em] uppercase text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5"
        >
            ĐĂNG KÝ
        </button>

        <button 
            type="button" 
            onClick={onForgotPasswordClick} 
            className="text-[10px] md:text-xs font-bold tracking-[0.1em] uppercase text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5"
        >
            QUÊN MẬT KHẨU
        </button>
    </div>
  );
}