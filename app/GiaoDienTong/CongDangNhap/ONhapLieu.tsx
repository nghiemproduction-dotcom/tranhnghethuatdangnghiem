'use client';
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  showEye?: boolean;       // Có hiện nút mắt không?
  isPasswordVisible?: boolean; // Mắt đang mở hay nhắm?
  onToggleEye?: () => void;    // Hàm xử lý bấm vào mắt
}

export default function ONhapLieu({ 
  id, label, value, onChange, type = 'text', 
  showEye = false, isPasswordVisible = false, onToggleEye 
}: Props) {
  
  // Xác định loại input thực tế (text hoặc password)
  const inputType = showEye ? (isPasswordVisible ? 'text' : 'password') : type;

  return (
    <div className="group relative">
      <input 
          id={id}
          type={inputType} 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="peer w-full bg-transparent text-gray-200 text-sm py-2 border-b border-gray-800 focus:border-yellow-600/50 outline-none transition-colors placeholder-transparent pr-8"
          placeholder={label}
          required
          autoComplete="off"
      />
      <label 
          htmlFor={id}
          className="absolute left-0 top-2 text-gray-600 text-xs uppercase tracking-widest transition-all 
                     peer-focus:-top-4 peer-focus:text-[10px] peer-focus:text-yellow-600
                     peer-[&:not(:placeholder-shown)]:-top-4 peer-[&:not(:placeholder-shown)]:text-[10px]"
      >
          {label}
      </label>
      
      {/* Nút con mắt (Chỉ hiện nếu showEye = true) */}
      {showEye && (
        <button 
            type="button"
            onClick={onToggleEye}
            className="absolute right-0 top-2 text-gray-600 hover:text-yellow-600 transition-colors"
        >
            {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
}