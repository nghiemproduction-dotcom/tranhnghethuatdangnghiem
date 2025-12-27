'use client';
import React from 'react';
import { Hash, TrendingUp } from 'lucide-react';

interface Props {
    total: number;
    loading: boolean;
    label: string;
}

export default function Widget_Stat({ total, loading, label }: Props) {
    if (loading) return null;

    return (
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 h-full">
            <div className="absolute inset-0 bg-[#C69C6D]/5 rounded-full blur-3xl opacity-20 pointer-events-none"/>
            
            <Hash size={40} className="text-[#8B5E3C] opacity-20 mb-2 group-hover:text-[#C69C6D] group-hover:opacity-40 transition-all duration-500 transform group-hover:-translate-y-2"/>
            
            <span className="text-6xl font-black text-[#F5E6D3] tracking-tighter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                {total}
            </span>
            
            <div className="flex items-center gap-1 text-xs text-[#8B5E3C] uppercase tracking-widest mt-2 font-bold bg-[#0a0807]/50 px-3 py-1 rounded-full border border-[#8B5E3C]/20">
                <TrendingUp size={12}/> {label}
            </div>
        </div>
    );
}