'use client';
import React from 'react';
import { X } from 'lucide-react';

interface Props {
    onClose: () => void;
}

export default function Footer({ onClose }: Props) {
    return (
        <div className="h-[60px] bg-[#0a0807] border-t border-[#8B5E3C]/30 flex items-center justify-center shrink-0 z-50">
             <button 
                onClick={onClose} 
                className="group flex items-center gap-2 px-8 py-2 rounded-full border border-[#8B5E3C]/30 hover:border-[#C69C6D] hover:bg-[#C69C6D]/10 transition-all duration-300 active:scale-95"
             >
                <X size={18} className="text-[#8B5E3C] group-hover:text-[#C69C6D] transition-colors" />
                <span className="text-xs font-bold text-[#8B5E3C] group-hover:text-[#F5E6D3] uppercase tracking-[0.2em] transition-colors">
                    Đóng Module
                </span>
             </button>
        </div>
    );
}