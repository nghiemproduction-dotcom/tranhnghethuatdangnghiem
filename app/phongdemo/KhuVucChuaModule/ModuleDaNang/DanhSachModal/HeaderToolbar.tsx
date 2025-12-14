'use client';
import React from 'react';
import { Search, Plus, X, Trash2, LayoutGrid, Table as TableIcon, Image as ImageIcon } from 'lucide-react';
import { CustomAction } from '../../KieuDuLieuModule';

interface Props {
    title: string;
    tableName: string;
    totalRecords: number;
    searchTerm: string;
    onSearchChange: (val: string) => void;
    selectedCount: number;
    permissions: { canCreate: boolean; canDelete: boolean; canEdit: boolean };
    headerActions: CustomAction[];
    onClose: () => void;
    onCreateNew: () => void;
    onBulkDelete: () => void;
    onCustomAction: (action: CustomAction) => void;
    // 🟢 Props mới cho việc chuyển đổi View
    currentViewMode: 'table' | 'gallery' | 'kanban';
    onViewModeChange: (mode: 'table' | 'gallery' | 'kanban') => void;
}

export function HeaderToolbar({ 
    title, tableName, totalRecords, searchTerm, onSearchChange, 
    selectedCount, permissions, headerActions, 
    onClose, onCreateNew, onBulkDelete, onCustomAction,
    currentViewMode, onViewModeChange 
}: Props) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-[#121212] shrink-0 border-b border-white/5 gap-4">
            <div className="flex items-center gap-4">
                <div>
                    <h3 className="text-white font-bold uppercase text-2xl tracking-tight">{title}</h3>
                    <p className="text-sm text-gray-500 font-mono mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        {tableName} • {totalRecords} records
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                
                {/* 🟢 BỘ CHUYỂN ĐỔI GIAO DIỆN (VIEW SWITCHER) */}
                <div className="flex items-center bg-[#1A1A1A] p-1 rounded-lg border border-white/10 mr-2">
                    <button 
                        onClick={() => onViewModeChange('table')}
                        className={`p-2 rounded-md transition-all ${currentViewMode === 'table' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        title="Dạng Bảng"
                    >
                        <TableIcon size={16}/>
                    </button>
                    <button 
                        onClick={() => onViewModeChange('gallery')}
                        className={`p-2 rounded-md transition-all ${currentViewMode === 'gallery' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        title="Dạng Ảnh"
                    >
                        <ImageIcon size={16}/>
                    </button>
                    <button 
                        onClick={() => onViewModeChange('kanban')}
                        className={`p-2 rounded-md transition-all ${currentViewMode === 'kanban' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        title="Dạng Kanban"
                    >
                        <LayoutGrid size={16}/>
                    </button>
                </div>

                {/* Thanh công cụ Hàng Loạt */}
                {selectedCount > 0 && permissions.canEdit && (
                    <div className="flex items-center gap-2 bg-blue-900/20 border border-blue-500/30 px-3 py-1.5 rounded-full animate-in slide-in-from-top-2 mr-2">
                        <span className="text-xs text-blue-300 font-bold mr-2">{selectedCount} selected</span>
                        {headerActions.map(act => (
                            <button key={act.id} onClick={() => onCustomAction(act)} className={`text-xs px-3 py-1 rounded-full font-bold transition-all shadow-lg bg-${act.color}-600 hover:bg-${act.color}-500 text-white`}>
                                {act.label}
                            </button>
                        ))}
                        {permissions.canDelete && (
                            <button onClick={onBulkDelete} className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-full font-bold transition-all shadow-lg ml-2 flex items-center gap-1">
                                <Trash2 size={10}/> XÓA
                            </button>
                        )}
                    </div>
                )}

                <div className="relative flex-1 md:w-48">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                    <input type="text" placeholder="Tìm kiếm..." className="w-full bg-[#1A1A1A] border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:border-blue-500 outline-none transition-all" value={searchTerm} onChange={e => onSearchChange(e.target.value)} />
                </div>
                
                {permissions.canCreate && (
                    <button onClick={onCreateNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-blue-500/30 whitespace-nowrap">
                        <Plus size={18}/> <span className="hidden sm:inline">Mới</span>
                    </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all"><X size={24}/></button>
            </div>
        </div>
    );
}