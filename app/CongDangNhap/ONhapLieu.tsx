'use client';
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  showEye?: boolean;       
  isPasswordVisible?: boolean; 
  onToggleEye?: () => void;    
}

export default function ONhapLieu({ 
  id, label, value, onChange, type = 'text', 
  showEye = false, isPasswordVisible = false, onToggleEye 
}: Props) {
  
  const inputType = showEye ? (isPasswordVisible ? 'text' : 'password') : type;

  return (
    <div className="group relative w-full">
      {/* Label nằm hẳn ra ngoài và to rõ */}
      <label 
          htmlFor={id}
          className="block text-white/80 text-xs font-bold uppercase tracking-[0.2em] mb-2 drop-shadow-md ml-1"
      >
          {label}
      </label>

      <div className="relative">
          <input 
              id={id}
              type={inputType} 
              value={value}
              onChange={(e) => onChange(e.target.value)}
              // 🟢 GIAO DIỆN MỚI: Có nền, có viền, bo tròn, chữ đậm
              className="w-full bg-black/40 hover:bg-black/60 focus:bg-black/80 
                         text-white text-xl font-bold tracking-wider
                         border border-white/20 focus:border-yellow-500
                         rounded-xl px-5 py-4 
                         outline-none transition-all duration-300
                         placeholder-transparent shadow-lg"
              autoComplete="off"
          />
          
          {showEye && (
            <button 
                type="button"
                onClick={onToggleEye}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2"
            >
                {isPasswordVisible ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          )}
      </div>
    </div>
  );
}