'use client';
import React from 'react';
import { CheckSquare, Square } from 'lucide-react';

interface Props {
  isRegistering: boolean;
  rememberMe: boolean;
  onToggleRemember: () => void;
  onToggleMode: () => void;
}

export default function ChanForm({ isRegistering, rememberMe, onToggleRemember, onToggleMode }: Props) {
  return (
    <>
      {/* Ghi nhớ đăng nhập (Chỉ hiện khi Đăng nhập) */}
      {!isRegistering && (
         <div className="flex items-center gap-2 cursor-pointer group w-fit" onClick={onToggleRemember}>
             {rememberMe ? (
                 <CheckSquare size={14} className="text-yellow-600" />
             ) : (
                 <Square size={14} className="text-gray-700 group-hover:text-gray-500" />
             )}
             <span className={`text-[10px] tracking-wider uppercase transition-colors ${rememberMe ? 'text-gray-300' : 'text-gray-600 group-hover:text-gray-500'}`}>
                 Ghi nhớ
             </span>
         </div>
      )}

      {/* Footer chuyển đổi */}
      <div className="text-center pt-2">
         <button 
            type="button" 
            onClick={onToggleMode}
            className="text-[10px] tracking-[0.2em] uppercase text-gray-600 hover:text-yellow-600 transition-colors"
         >
            {isRegistering ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
         </button>
      </div>
    </>
  );
}