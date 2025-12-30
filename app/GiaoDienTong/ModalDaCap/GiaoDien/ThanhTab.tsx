'use client';
import React, { useRef, useEffect } from 'react';

export interface TabItem {
    id: string;
    label: string;
    icon?: any;
    count?: number;
}

interface Props {
    danhSachTab: TabItem[];
    tabHienTai: string;
    onChuyenTab: (id: string) => void;
}

export default function ThanhTab({ danhSachTab, tabHienTai, onChuyenTab }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            const activeEl = containerRef.current.querySelector('[data-active="true"]');
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [tabHienTai]);

    return (
        <div className="w-full relative">
            <div ref={containerRef} className="flex items-center gap-4 px-6 overflow-x-auto no-scrollbar scroll-smooth">
                {danhSachTab.map((tab) => {
                    const isActive = tabHienTai === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChuyenTab(tab.id)}
                            data-active={isActive}
                            className={`
                                group relative flex items-center gap-2 px-1 py-3 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 border-b-2
                                ${isActive ? 'text-[#C69C6D] border-[#C69C6D]' : 'text-[#A1887F] border-transparent hover:text-[#C69C6D] hover:border-[#C69C6D]/30'}
                            `}
                        >
                            {Icon && <Icon size={14} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} strokeWidth={isActive ? 2.5 : 2} />}
                            <span>{tab.label}</span>
                                <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors ${isActive ? 'bg-[#C69C6D] text-[#1a120f]' : 'bg-[#2a1e1b] text-[#A1887F] group-hover:text-[#C69C6D]'}`}>{tab.count}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}