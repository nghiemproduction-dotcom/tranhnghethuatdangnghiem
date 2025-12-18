'use client';
import React from 'react';
import { LayoutGrid, Plus, RefreshCw, X } from 'lucide-react';
import { ModuleConfig } from '../KieuDuLieuModule';

interface Props {
    config: ModuleConfig;
    total: number;
    canEdit: boolean;
    isSyncing: boolean;
    onSync: () => void;
    onAdd: () => void;
    onClose: () => void;
}

export default function Header({ config, total, canEdit, isSyncing, onSync, onAdd, onClose }: Props) {
    return (
        <div className="h-[clamp(60px,15vw,70px)] px-4 border-b border-[#8B5E3C]/20 flex items-center justify-between bg-gradient-to-r from-transparent via-[#8B5E3C]/10 to-transparent shrink-0">
            <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                    <LayoutGrid size={18} className="text-[#C69C6D]" />
                    <h2 className="text-[clamp(16px,5vw,20px)] font-bold text-[#C69C6D] uppercase tracking-wider truncate">
                        {config.tenModule}
                    </h2>
                </div>
                <p className="text-[10px] text-[#A1887F] font-mono truncate hidden sm:block ml-6 opacity-70">
                    SOURCE: {config.bangDuLieu} • TOTAL: {total}
                </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {config.bangDuLieu === 'nhan_su' && canEdit && (
                    <button 
                        onClick={onSync} 
                        disabled={isSyncing} 
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#1a4d2e] hover:bg-[#276f45] border border-[#276f45] text-green-100 rounded font-bold text-[10px] shadow-lg transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} /> 
                        <span className="hidden sm:inline">Sync Users</span>
                    </button>
                )}
                {canEdit && (
                    <button 
                        onClick={onAdd} 
                        className="flex items-center gap-2 px-4 py-2 bg-[#C69C6D] hover:bg-[#b08b5e] text-[#1a120f] rounded-full font-bold text-xs shadow-[0_0_15px_rgba(198,156,109,0.4)] transition-all active:scale-95"
                    >
                        <Plus size={16}/> 
                        <span className="hidden sm:inline">THÊM MỚI</span>
                    </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-[#8B5E3C] hover:text-[#C69C6D] transition-colors">
                    <X size={24}/>
                </button>
            </div>
        </div>
    );
}