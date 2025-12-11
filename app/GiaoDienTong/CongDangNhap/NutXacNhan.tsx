'use client';
import React from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { useNgonNgu } from '@/app/context/NgonNguContext';

interface Props {
  isLoading: boolean;
  isRegistering: boolean;
}

export default function NutXacNhan({ isLoading, isRegistering }: Props) {
  const { t } = useNgonNgu();
  const textHienThi = isLoading ? t('nutXuLy') : (isRegistering ? t('nutDk') : t('nutVao'));

  return (
    <button
      type="submit"
      disabled={isLoading}
      // 🟢 Mobile: py-5 (Cao hơn), Desktop: py-4
      className="group mt-4 w-full flex items-center justify-between px-6 py-5 md:py-4 bg-yellow-600/10 hover:bg-yellow-600 hover:text-black border border-yellow-600/30 hover:border-yellow-500 transition-all duration-300 disabled:opacity-50 active:scale-[0.98]"
    >
      <span className="text-xs md:text-sm font-bold tracking-[0.2em] uppercase transition-colors">
          {textHienThi}
      </span>
      {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />}
    </button>
  );
}