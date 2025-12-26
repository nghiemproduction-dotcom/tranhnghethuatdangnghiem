'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
    Search, Table as IconTable, LayoutGrid, Kanban as IconKanban, 
    ChevronLeft, ChevronRight, Plus, RefreshCw, Filter, LayoutDashboard, X, ListFilter, ShieldCheck
} from 'lucide-react';
import { ModuleConfig } from '../../../../../DashboardBuilder/KieuDuLieuModule';

interface Props {
    config: ModuleConfig;
    total: number;
    page: number;
    itemsPerPage: number;
    search: string;
    setSearch: (v: string) => void;
    onEnter: () => void;
    viewMode: 'table' | 'card' | 'kanban';
    setViewMode: (v: 'table' | 'card' | 'kanban') => void;
    kanbanGroupBy: string;
    setKanbanGroupBy: (v: string) => void;
    groupByColumn: string;
    setGroupByColumn: (v: string) => void;
    onPageChange: (p: number) => void;
    canEdit: boolean;
    canConfig: boolean; // 🟢 Prop quyết định quyền Admin
    isSyncing: boolean;
    onSync: () => void;
    onAdd: () => void;
    onClose: () => void;
    onSettingPermission: () => void;
}

export default function ControlBar({ 
    config, total, page, itemsPerPage, 
    search, setSearch, onEnter, 
    viewMode, setViewMode, 
    kanbanGroupBy, setKanbanGroupBy, 
    groupByColumn, setGroupByColumn,
    onPageChange,
    canEdit, canConfig, isSyncing, onSync, onAdd, onClose, onSettingPermission
}: Props) {
    
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { if (isSearchOpen && inputRef.current) inputRef.current.focus(); }, [isSearchOpen]);
    const toggleSearch = () => { if (isSearchOpen && !search) setIsSearchOpen(false); else setIsSearchOpen(true); };
    const handleBlur = () => { if (!search) setIsSearchOpen(false); };

    const IconButton = ({ onClick, icon: Icon, active = false, title, disabled = false, className = '' }: any) => (
        <button onClick={onClick} disabled={disabled} title={title} className={`p-2 rounded-full transition-all duration-300 relative group shrink-0 ${active ? 'text-[#C69C6D] bg-[#C69C6D]/10 shadow-[0_0_15px_rgba(198,156,109,0.3)]' : 'text-[#8B5E3C] hover:text-[#F5E6D3] hover:bg-white/5'} ${disabled ? 'opacity-30 cursor-not-allowed' : ''} ${className}`}><Icon size={20} strokeWidth={1.5} /></button>
    );

    return (
        <div className="h-[60px] bg-[#110d0c]/95 backdrop-blur-md border-b border-[#8B5E3C]/20 flex items-center justify-between px-4 shrink-0 z-50 select-none shadow-lg gap-2">
            
            <div className="flex items-center gap-4 flex-1 min-w-0 mr-2">
                <div className={`flex items-center gap-2 text-[#C69C6D] shrink-0 transition-opacity duration-300 ${isSearchOpen ? 'hidden md:flex' : 'flex'}`}>
                    <LayoutDashboard size={20} strokeWidth={1.5}/>
                    <h2 className="text-sm font-bold uppercase tracking-widest truncate max-w-[150px]">{config.tenModule}</h2>
                </div>
                <div className={`relative flex items-center bg-[#0a0807] border rounded-full transition-all duration-500 ease-out ${isSearchOpen ? 'w-full max-w-[400px] border-[#C69C6D] pl-2' : 'w-9 h-9 border-transparent bg-transparent cursor-pointer hover:bg-white/5 justify-center'}`}>
                    <Search className={`text-[#8B5E3C] transition-colors cursor-pointer shrink-0 ${isSearchOpen ? 'text-[#C69C6D]' : 'hover:text-[#F5E6D3]'}`} size={18} onClick={() => { toggleSearch(); if(search) onEnter(); }}/>
                    <input ref={inputRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onEnter()} onBlur={handleBlur} className={`bg-transparent text-xs text-[#F5E6D3] outline-none placeholder-[#5D4037] ml-2 h-full transition-all duration-500 ${isSearchOpen ? 'w-full opacity-100 pr-3 py-1.5' : 'w-0 opacity-0 p-0 overflow-hidden'}`} placeholder="Nhập & Enter..."/>
                    {isSearchOpen && search && <X size={14} className="text-[#5D4037] hover:text-[#C69C6D] cursor-pointer mr-3 shrink-0" onClick={() => { setSearch(''); inputRef.current?.focus(); onEnter(); }}/>}
                </div>
            </div>

            <div className={`hidden sm:flex items-center gap-1 bg-[#0a0807] rounded-full border border-[#8B5E3C]/20 p-0.5 mx-2 shrink-0 transition-opacity duration-300 ${isSearchOpen ? 'opacity-50 hover:opacity-100' : 'opacity-100'}`}>
                <IconButton icon={IconTable} active={viewMode === 'table'} onClick={() => setViewMode('table')} title="List" />
                <IconButton icon={LayoutGrid} active={viewMode === 'card'} onClick={() => setViewMode('card')} title="Card" />
                <IconButton icon={IconKanban} active={viewMode === 'kanban'} onClick={() => setViewMode('kanban')} title="Kanban" />
                <div className="w-[1px] h-4 bg-[#8B5E3C]/20 mx-1"></div>
                <div className="relative group px-1 flex items-center gap-1 cursor-pointer">
                    <ListFilter size={14} className="text-[#8B5E3C]"/>
                    <select value={groupByColumn} onChange={(e) => setGroupByColumn(e.target.value)} className="bg-transparent text-[10px] text-[#C69C6D] font-bold outline-none cursor-pointer appearance-none py-1 hover:text-white transition-colors uppercase w-[80px] truncate" title="Phân loại Tab">
                        <option value="" className="bg-[#1a120f]">Tất cả</option>
                        {config.danhSachCot?.map(c => <option key={c.key} value={c.key} className="bg-[#1a120f]">{c.label}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-2 pl-2 md:pl-4 shrink-0">
                
                {/* 🟢 NÚT CẤU HÌNH (ADMIN ONLY) */}
                {canConfig && (
                    <button onClick={onSettingPermission} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1a120f] border border-[#8B5E3C]/30 text-[#8B5E3C] hover:text-[#C69C6D] hover:border-[#C69C6D] transition-all active:scale-95 shrink-0" title="Cấu hình hệ thống (Admin Only)">
                        <ShieldCheck size={18} strokeWidth={1.5} />
                    </button>
                )}

                {canEdit && <button onClick={onAdd} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#C69C6D] text-[#1a120f] hover:bg-[#F5E6D3] transition-all active:scale-95 shrink-0"><Plus size={20} strokeWidth={2.5} /></button>}
                
                {config.bangDuLieu === 'nhan_su' && canEdit && <IconButton icon={RefreshCw} onClick={onSync} disabled={isSyncing} active={isSyncing} title="Sync User" />}
                
                <div className="w-[1px] h-6 bg-[#8B5E3C]/20 mx-1 hidden sm:block"></div>
                <div className="hidden sm:flex items-center bg-[#0a0807] rounded-full border border-[#8B5E3C]/30 px-2 shrink-0 h-9">
                    <IconButton icon={ChevronLeft} disabled={page === 1} onClick={() => onPageChange(page - 1)} />
                    <span className="text-xl font-bold font-mono text-[#C69C6D] min-w-[30px] text-center select-none mx-1">{page}</span>
                    <IconButton icon={ChevronRight} disabled={page * itemsPerPage >= total} onClick={() => onPageChange(page + 1)} />
                </div>
                <div className="w-[1px] h-6 bg-[#8B5E3C]/20 mx-1"></div>
                <button onClick={onClose} className="p-2 rounded-full text-red-400/70 hover:text-red-400 hover:bg-red-900/20 transition-all shrink-0"><X size={24} strokeWidth={2} /></button>
            </div>
        </div>
    );
}