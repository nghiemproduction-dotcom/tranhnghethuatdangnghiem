'use client';
import React from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

interface Props {
  isLoading: boolean;
  isRegistering: boolean;
}

export default function NutXacNhan({ isLoading, isRegistering }: Props) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="group mt-6 w-full flex items-center justify-between px-8 py-6 bg-white/5 hover:bg-yellow-600 hover:text-black border border-white/10 hover:border-yellow-600 rounded-none transition-all duration-500 disabled:opacity-50"
    >
      <span className="text-sm md:text-base font-bold tracking-[0.3em] uppercase transition-colors">
          {isLoading ? 'Đang kết nối...' : (isRegistering ? 'Xác Nhận Đăng Ký' : 'Truy Cập Hệ Thống')}
      </span>
      {isLoading ? (
          <Loader2 className="animate-spin" size={24} />
      ) : (
          <ArrowRight className="group-hover:translate-x-2 transition-transform duration-300" size={24} />
      )}
    </button>
  );
}