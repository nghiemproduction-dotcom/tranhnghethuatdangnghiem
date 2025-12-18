'use client';
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  
  // Các prop mới cho tính năng ẩn/hiện mật khẩu
  showEye?: boolean;       
  isPasswordVisible?: boolean; 
  onToggleEye?: () => void;    
}

export default function ONhapLieu({ 
  id, label, value, onChange, type = 'text', 
  showEye = false, isPasswordVisible = false, onToggleEye 
}: Props) {
  
  // Xác định loại input thực tế (nếu đang ẩn thì là password, hiện thì là text)
  const inputType = showEye ? (isPasswordVisible ? 'text' : 'password') : type;

  return (
    <div className="group relative w-full">
      {/* Label */}
      <label 
          htmlFor={id}
          className="block text-white/80 text-xs font-bold uppercase tracking-[0.2em] mb-2 drop-shadow-md ml-1"
      >
          {label}
      </label>

      <div className="relative w-full">
          <input 
              id={id}
              type={inputType} 
              value={value}
              onChange={(e) => onChange(e.target.value)}
              // 🟢 CSS MỚI: w-full để tự động giãn theo màn hình
              className="w-full bg-black/40 hover:bg-black/60 focus:bg-black/80 
                         text-white text-lg font-bold tracking-wider
                         border border-white/20 focus:border-[#C69C6D]
                         rounded-xl px-5 py-4 
                         outline-none transition-all duration-300
                         placeholder-transparent shadow-lg"
              autoComplete="off"
          />
          
          {/* Nút Con Mắt (Chỉ hiện khi showEye = true) */}
          {showEye && (
            <button 
                type="button"
                onClick={onToggleEye}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#C69C6D] transition-colors p-1"
                tabIndex={-1} // Không cho tab vào nút này
            >
                {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
      </div>
      
      {/* Hiệu ứng gạch chân khi focus (trang trí) */}
      <div className="absolute bottom-0 left-5 right-5 h-[1px] bg-[#C69C6D] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left"></div>
    </div>
  );
}