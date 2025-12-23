'use client';
import React from 'react';
import { Upload, Edit, Eye, X, AlertTriangle } from 'lucide-react';
import AutoFixSQL from './AutoFixSQL';
import { ModuleConfig } from '../../../../../DashboardBuilder/KieuDuLieuModule';

interface Props {
    isCreateMode: boolean;
    isEditing: boolean;
    config: ModuleConfig;
    onClose: () => void;
    isAdmin: boolean;
    hasError: boolean; // Prop mới
}

export default function Header({ isCreateMode, isEditing, config, onClose, isAdmin, hasError }: Props) {
    return (
        <div className="h-16 border-b border-[#8B5E3C]/20 flex items-center justify-between px-6 bg-[#1a120f] shrink-0">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[#C69C6D]/10 rounded-lg">
                    {isCreateMode ? <Upload size={20} className="text-[#C69C6D]"/> : (isEditing ? <Edit size={20} className="text-[#C69C6D]"/> : <Eye size={20} className="text-[#C69C6D]"/>)}
                </div>
                <div>
                    <h2 className="text-lg font-bold text-[#F5E6D3] uppercase flex items-center gap-2">
                        {isCreateMode ? 'THÊM MỚI' : (isEditing ? 'ĐANG CHỈNH SỬA' : 'CHI TIẾT')}
                        {hasError && <AlertTriangle size={16} className="text-red-500"/>}
                    </h2>
                    <p className="text-[10px] text-[#8B5E3C] uppercase tracking-widest">{config.tenModule}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                {/* Chỉ hiện AutoFix khi Admin và có lỗi */}
                {isAdmin && hasError && <AutoFixSQL config={config} />}
                
                <div className="w-[1px] h-6 bg-[#8B5E3C]/20"></div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                    <X size={24}/>
                </button>
            </div>
        </div>
    );
}