'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean; // Nếu true nút sẽ màu đỏ (Xóa)
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop mờ ảo */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={!isLoading ? onCancel : undefined}
      />

      {/* Dialog Content */}
      <div className="relative w-full max-w-sm bg-[#1a120f] border border-[#C69C6D]/40 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Glow effect phía trên */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C69C6D] to-transparent opacity-70"></div>

        <div className="p-6 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-black border border-[#C69C6D]/20 shadow-inner">
            {isDangerous ? (
              <AlertTriangle size={32} className="text-red-500 animate-pulse" />
            ) : (
              <CheckCircle2 size={32} className="text-[#C69C6D]" />
            )}
          </div>

          {/* Title & Message */}
          <h3 className="text-xl font-serif font-bold text-[#F5E6D3] mb-2 uppercase tracking-wide">
            {title}
          </h3>
          <p className="text-white/60 text-sm font-light leading-relaxed mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-xl text-black font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 text-xs flex items-center justify-center gap-2
                ${isDangerous 
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' 
                  : 'bg-[#C69C6D] hover:bg-[#B58B5D] shadow-[#C69C6D]/20'
                }
                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isLoading ? 'Đang xử lý...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}