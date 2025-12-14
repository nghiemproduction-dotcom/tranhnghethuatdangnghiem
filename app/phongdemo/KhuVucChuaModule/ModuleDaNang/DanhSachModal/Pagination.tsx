'use client';
import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

// 🟢 CHUYỂN THÀNH NAMED EXPORT
export function Pagination({ currentPage, totalPages, onPageChange }: Props) {
    if (totalPages <= 1) return null;

    return (
        <div className="p-3 border-t border-white/5 bg-[#121212] flex justify-center items-center gap-4 text-xs font-mono text-gray-500 shrink-0">
            <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} className="hover:text-white disabled:opacity-20 flex items-center gap-1 transition-colors">
                <ArrowLeft size={12}/> Trước
            </button>
            <span>Trang <span className="text-white font-bold">{currentPage}</span> / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} className="hover:text-white disabled:opacity-20 flex items-center gap-1 transition-colors">
                Sau <ArrowRight size={12}/>
            </button>
        </div>
    );
}