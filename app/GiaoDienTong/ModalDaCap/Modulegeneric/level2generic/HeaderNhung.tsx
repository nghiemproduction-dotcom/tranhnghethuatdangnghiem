import React from 'react';
import { Search, Plus, RefreshCw, Loader2 } from 'lucide-react';
import { SyncConfig } from './CauHinhDongBo';

interface Props {
    search: string;
    onSearchChange: (val: string) => void;
    onSearchEnter: () => void;
    canAdd: boolean;
    onAdd: () => void;
    syncConfig: SyncConfig;
    isSyncing: boolean;
    onSync: () => void;
}

export default function HeaderNhung({ search, onSearchChange, onSearchEnter, canAdd, onAdd, syncConfig, isSyncing, onSync }: Props) {
    return (
        <div className="shrink-0 bg-[#161210] border-b border-[#8B5E3C]/20 px-3 py-2 z-40 flex items-center gap-2">
            <div className="flex-1 relative">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#8B5E3C]"/>
                <input 
                    value={search} 
                    onChange={e => onSearchChange(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && onSearchEnter()}
                    placeholder="Tìm nhanh..." 
                    className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded px-2 pl-7 py-1 text-xs text-[#F5E6D3] focus:border-[#C69C6D] outline-none"
                />
            </div>
            
            {canAdd && syncConfig.visible && (
                <button 
                    onClick={onSync} disabled={isSyncing}
                    className="p-1.5 bg-[#1a120f] border border-blue-500/50 text-blue-400 rounded hover:bg-blue-500/10 shadow-lg transition-all"
                    title={syncConfig.tooltip}
                >
                    {isSyncing ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}
                </button>
            )}

            {canAdd && (
                <button onClick={onAdd} className="p-1.5 bg-[#C69C6D] text-[#1a120f] rounded hover:bg-[#b08b5e] shadow-lg">
                    <Plus size={14}/>
                </button>
            )}
        </div>
    );
}