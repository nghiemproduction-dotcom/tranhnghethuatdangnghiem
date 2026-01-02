'use client';
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';

interface FunctionItem {
    id: string;
    label: string;
    icon: React.ElementType;
}

interface Props {
    tenPhong: string;
    functions: FunctionItem[];
    activeFunction: string;
    onFunctionChange: (id: string) => void;
}

export default function ThanhPhongChucNang({ tenPhong, functions, activeFunction, onFunctionChange }: Props) {
    const tabsRef = useRef<HTMLDivElement>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const scrollTabs = (direction: 'left' | 'right') => {
        if (tabsRef.current) {
            const scrollAmount = 150;
            tabsRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const activeItem = functions.find(f => f.id === activeFunction);
    const ActiveIcon = activeItem?.icon;

    return (
        <div className="flex-none z-30 w-full h-[44px] bg-[#080808] border-b border-[#C69C6D]/30 shadow-[0_3px_10px_rgba(0,0,0,0.6)] flex items-center px-2 gap-1 md:px-3 md:gap-2">
            {/* TÊN PHÒNG - Thu nhỏ */}
            <div className="shrink-0 bg-[#C69C6D] text-black px-3 md:px-4 py-1 rounded-l-md rounded-r-xl transform skew-x-[-10deg] shadow-[0_0_10px_rgba(198,156,109,0.4)] border-r-2 border-white/20">
                <h1 className="text-[10px] md:text-xs font-black uppercase tracking-[0.15em] skew-x-[10deg] whitespace-nowrap">{tenPhong}</h1>
            </div>

            {/* NÚT XỔ DROPDOWN - Chọn nhanh */}
            <div className="relative">
                <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[#C69C6D] transition-all active:scale-95"
                >
                    {ActiveIcon && <ActiveIcon size={14} strokeWidth={2.5} />}
                    <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {showDropdown && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                        <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-[#C69C6D]/30 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 min-w-[180px] overflow-hidden">
                            {functions.map((func) => {
                                const Icon = func.icon;
                                const isActive = func.id === activeFunction;
                                return (
                                    <button 
                                        key={func.id}
                                        onClick={() => { onFunctionChange(func.id); setShowDropdown(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-all border-b border-white/5 last:border-0 ${isActive ? 'bg-[#C69C6D]/20 text-[#C69C6D]' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        <Icon size={16} strokeWidth={2} />
                                        <span className="flex-1 text-left">{func.label}</span>
                                        {isActive && <Check size={14} className="text-[#C69C6D]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* TABS SCROLL */}
            <div className="flex-1 flex items-center min-w-0 gap-1">
                <button onClick={() => scrollTabs('left')} className="p-0.5 text-[#C69C6D] hover:bg-white/10 rounded shrink-0 active:scale-95 transition-transform"><ChevronLeft size={16}/></button>
                <div ref={tabsRef} className="flex-1 overflow-x-auto scrollbar-hide flex items-center gap-1 mask-linear-fade">
                    <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } .mask-linear-fade { mask-image: linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%); } `}</style>
                    {functions.map((func) => {
                        const Icon = func.icon;
                        const isActive = func.id === activeFunction;
                        return (
                            <button 
                                key={func.id} 
                                onClick={() => onFunctionChange(func.id)} 
                                className={`flex items-center gap-1 text-[9px] md:text-[10px] font-bold uppercase px-2 md:px-3 py-1.5 rounded transition-all whitespace-nowrap border ${isActive ? 'bg-white/10 text-[#C69C6D] border-[#C69C6D] shadow-[0_0_10px_rgba(198,156,109,0.2)]' : 'bg-transparent text-gray-500 border-transparent hover:text-white hover:bg-white/10'}`}
                            >
                                <Icon size={12} strokeWidth={2.5} /> {func.label}
                            </button>
                        )
                    })}
                </div>
                <button onClick={() => scrollTabs('right')} className="p-0.5 text-[#C69C6D] hover:bg-white/10 rounded shrink-0 active:scale-95 transition-transform"><ChevronRight size={16}/></button>
            </div>
        </div>
    );
}
