'use client';
import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { useNgonNgu } from '@/app/context/NgonNguContext';

interface Props {
  isRegistering: boolean;
  rememberMe: boolean;
  onToggleRemember: () => void;
  onToggleMode: () => void;
}

export default function ChanForm({ isRegistering, rememberMe, onToggleRemember, onToggleMode }: Props) {
  const { t } = useNgonNgu();

  return (
    <>
      {!isRegistering && (
         // 🟢 Tăng py-2 để dễ bấm trúng hơn
         <div className="flex items-center gap-2 cursor-pointer group w-fit py-2" onClick={onToggleRemember}>
             {rememberMe ? <CheckSquare size={16} className="text-yellow-500" /> : <Square size={16} className="text-gray-600 group-hover:text-gray-400" />}
             <span className={`text-[10px] md:text-xs tracking-wider uppercase transition-colors ${rememberMe ? 'text-gray-300' : 'text-gray-600 group-hover:text-gray-400'}`}>
                 {t('ghiNho')}
             </span>
         </div>
      )}
      <div className="text-center pt-2">
         {/* 🟢 Tăng vùng bấm (padding) cho nút chuyển đổi */}
         <button type="button" onClick={onToggleMode} className="p-2 text-[10px] md:text-xs tracking-[0.2em] uppercase text-gray-500 hover:text-yellow-500 transition-colors">
            {isRegistering ? t('daCoTk') : t('chuaCoTk')}
         </button>
      </div>
    </>
  );
}