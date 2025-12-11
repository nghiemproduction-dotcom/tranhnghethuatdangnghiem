'use client';
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNgonNgu } from '@/app/context/NgonNguContext';

interface Props {
  id: string;
  labelKey: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  showEye?: boolean;       
  isPasswordVisible?: boolean; 
  onToggleEye?: () => void;    
}

export default function ONhapLieu({ 
  id, labelKey, value, onChange, type = 'text', 
  showEye = false, isPasswordVisible = false, onToggleEye 
}: Props) {
  
  const { t } = useNgonNgu();
  const label = t(labelKey);

  const inputType = showEye ? (isPasswordVisible ? 'text' : 'password') : type;

  return (
    <div className="group relative">
      <input 
          id={id}
          type={inputType} 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          // 🟢 QUAN TRỌNG: text-base trên mobile (chống zoom), text-sm trên desktop (cho tinh tế)
          // Tăng py-3 để dễ bấm trên điện thoại
          className="peer w-full bg-transparent text-gray-200 text-base md:text-sm py-3 md:py-2 border-b border-gray-800 focus:border-yellow-600/50 outline-none transition-colors placeholder-transparent pr-8"
          placeholder={label}
          required
          autoComplete="off"
      />
      <label 
          htmlFor={id}
          className="absolute left-0 top-3 md:top-2 text-gray-600 text-xs uppercase tracking-widest transition-all 
                     peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-yellow-600
                     peer-[&:not(:placeholder-shown)]:-top-4 peer-[&:not(:placeholder-shown)]:text-[10px]"
      >
          {label}
      </label>
      
      {showEye && (
        <button 
            type="button"
            onClick={onToggleEye}
            // Chỉnh lại vị trí nút mắt cho khớp với padding mới
            className="absolute right-0 top-3 md:top-2 text-gray-600 hover:text-yellow-600 transition-colors"
        >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
}