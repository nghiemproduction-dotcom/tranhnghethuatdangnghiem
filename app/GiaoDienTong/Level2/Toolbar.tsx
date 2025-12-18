'use client';
import React from 'react';
import { Search, Table as IconTable, LayoutGrid, Kanban as IconKanban, Filter } from 'lucide-react';
import { ModuleConfig } from '../KieuDuLieuModule';

interface Props {
    search: string;
    setSearch: (v: string) => void;
    onEnter: () => void;
    viewMode: 'table' | 'card' | 'kanban';
    setViewMode: (v: 'table' | 'card' | 'kanban') => void;
    kanbanGroupBy: string;
    setKanbanGroupBy: (v: string) => void;
    config: ModuleConfig;
}

export default function Toolbar({ search, setSearch, onEnter, viewMode, setViewMode, kanbanGroupBy, setKanbanGroupBy, config }: Props) {
    return (
        <div className="border-b border-[#8B5E3C]/20 bg-[#110d0c]/50 p-2 flex flex-wrap gap-2 items-center shrink-0 backdrop-blur-sm">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B5E3C]" size={14}/>
                <input 
                    type="text" 
                    placeholder="Tìm kiếm dữ liệu..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && onEnter()} 
                    className="w-full bg-[#1a120f] border border-[#8B5E3C]/30 rounded-full px-9 py-2 text-xs text-[#F5E6D3] focus:border-[#C69C6D] focus:ring-1 focus:ring-[#C69C6D] outline-none transition-all placeholder-[#5D4037]"
                />
            </div>

            {/* View Modes */}
            <div className="flex bg-[#1a120f] rounded-full border border-[#8B5E3C]/30 p-1 shrink-0">
                {[ 
                    { id: 'table', icon: IconTable, label: 'Bảng' }, 
                    { id: 'card', icon: LayoutGrid, label: 'Thẻ' }, 
                    { id: 'kanban', icon: IconKanban, label: 'Kanban' } 
                ].map((m) => (
                    <button 
                        key={m.id} 
                        onClick={() => setViewMode(m.id as any)} 
                        className={`p-2 rounded-full transition-all flex items-center gap-2 ${viewMode===m.id ? 'bg-[#C69C6D] text-[#1a120f] shadow-lg' : 'text-[#8B5E3C] hover:text-[#C69C6D] hover:bg-white/5'}`}
                        title={m.label}
                    >
                        <m.icon size={16}/>
                    </button>
                ))}
            </div>

            {/* Filter for Kanban */}
            {viewMode === 'kanban' && (
                <div className="flex items-center gap-2 bg-[#1a120f] border border-[#8B5E3C]/30 rounded-full px-3 py-1.5 shrink-0">
                    <Filter size={12} className="text-[#8B5E3C]"/>
                    <span className="text-[10px] text-[#A1887F] font-bold uppercase">Nhóm theo:</span>
                    <select 
                        value={kanbanGroupBy} 
                        onChange={(e) => setKanbanGroupBy(e.target.value)} 
                        className="bg-transparent text-xs text-[#C69C6D] font-bold outline-none cursor-pointer appearance-none pr-4 hover:text-white transition-colors"
                    >
                        {config.danhSachCot?.map(c => <option key={c.key} value={c.key} className="bg-[#1a120f] text-[#C69C6D]">{c.label}</option>)}
                    </select>
                </div>
            )}
        </div>
    );
}