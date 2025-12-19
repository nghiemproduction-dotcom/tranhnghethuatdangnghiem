'use client';
import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface Props {
    title: string;
    isAdmin: boolean;
}

export default function TopBar({ title, isAdmin }: Props) {
    return (
        <div className="fixed top-0 left-0 right-0 z-[900] h-16 pt-safe flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent"></div>
            
            <div className="relative w-full max-w-md mx-6 group pointer-events-auto transform hover:scale-[1.02] transition-transform duration-500 ease-out mt-1">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#8B5E3C] via-[#C69C6D] to-[#8B5E3C] blur-xl opacity-20 group-hover:opacity-40 transition duration-700 rounded-[20px]"></div>
                
                {/* Main Container */}
                <div className="relative h-full bg-gradient-to-br from-[#5D4037] via-[#8B5E3C] to-[#3E2723] p-[2px] rounded-[12px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.9)] border-t border-white/20 overflow-hidden">
                    <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.3)_0px,rgba(0,0,0,0.3)_1px,transparent_1px,transparent_3px)] mix-blend-overlay"></div>
                    <div className="relative h-full bg-[#1a120f] rounded-[10px] flex items-center justify-center py-2 px-8 shadow-[inset_0_3px_15px_rgba(0,0,0,1)] border-b border-white/5 overflow-hidden">
                        
                        {/* 4 Ốc vít trang trí */}
                        <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#F5E6D3] to-[#5D4037] shadow-inner border border-[#8B5E3C]/50"></div>
                        <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-bl from-[#F5E6D3] to-[#5D4037] shadow-inner border border-[#8B5E3C]/50"></div>
                        <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#F5E6D3] to-[#5D4037] shadow-inner border border-[#8B5E3C]/50"></div>
                        <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-tl from-[#F5E6D3] to-[#5D4037] shadow-inner border border-[#8B5E3C]/50"></div>
                        
                        <h1 className="relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-[#F5E6D3] via-[#C69C6D] to-[#8B5E3C] font-black tracking-[0.2em] text-sm sm:text-base md:text-lg uppercase text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] truncate">
                            {title}
                        </h1>
                        
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none mix-blend-overlay"></div>
                    </div>
                </div>
            </div>

            {isAdmin && (
                <div className="absolute right-2 top-2 pointer-events-auto bg-red-900/80 backdrop-blur-sm text-red-200 p-1 rounded-md border border-red-500/30 shadow-lg" title="Admin Mode">
                    <ShieldAlert size={12} />
                </div>
            )}
        </div>
    );
}