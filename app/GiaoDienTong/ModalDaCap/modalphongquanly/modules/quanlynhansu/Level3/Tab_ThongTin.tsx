'use client';
import React, { useRef } from 'react';
import { GripVertical } from 'lucide-react'; 
import InputRenderer from './InputRenderer';
import { CotHienThi } from '../../../../../DashboardBuilder/KieuDuLieuModule';
import { useLevel3Context } from './Level3Context'; 

export default function Tab_ThongTin() {
    const { 
        config, isEditing, isArranging, canEditColumn, onUpdateColumnOrder 
    } = useLevel3Context();
    
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragItem.current = position;
        e.currentTarget.classList.add('opacity-50');
    };
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragOverItem.current = position;
    };
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('opacity-50');
        if (dragItem.current === null || dragOverItem.current === null) return;
        const listCopy = [...config.danhSachCot];
        const draggedItemContent = listCopy[dragItem.current];
        listCopy.splice(dragItem.current, 1);
        listCopy.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        if (onUpdateColumnOrder) onUpdateColumnOrder(listCopy);
    };

    const renderField = (col: CotHienThi, index: number) => {
        if (!isArranging) {
            // 1. LOGIC ẨN CỘT TỪ DB
            if (col.hienThiDetail === false) return null;

            // 🟢 2. LOGIC CỤ THỂ CHO TAB NÀY (Đã thêm ho_ten)
            if (['hinh_anh', 'avatar', 'logo', 'lich_su_dang_nhap', 'luong_theo_gio', 'lan_dang_nhap_ts', 'nguoi_tao_id', 'ten_nguoi_tao', 'ho_ten'].includes(col.key)) return null;
            
            // Check quyền
            if (col.permRead && !col.permRead.includes('all') && !canEditColumn(col)) return null;
        }

        return (
            <div 
                key={col.key}
                draggable={isArranging}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`
                    group transition-all duration-200 
                    flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4
                    ${isArranging ? 'cursor-move border border-dashed border-[#C69C6D]/50 bg-[#C69C6D]/5 p-2 rounded-lg' : 'py-2 md:py-2'}
                `}
            >
                {/* Label */}
                <div className="w-full md:w-[130px] shrink-0 flex items-center md:justify-end gap-2 mb-1 md:mb-0">
                    {isArranging && <GripVertical size={14} className="text-[#C69C6D] cursor-grab"/>}
                    <label className="text-[11px] font-bold text-[#8B5E3C] uppercase leading-tight md:text-right w-full">
                        {col.label}
                        {!isArranging && isEditing && col.batBuoc && !col.readOnly && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                </div>
                
                {/* Input Area */}
                <div className={`w-full flex-1 ${isArranging ? 'pointer-events-none opacity-60' : ''}`}>
                    <InputRenderer col={col} /> 
                </div>
            </div>
        );
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full px-2">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-12 gap-y-2">
                {config.danhSachCot.map((col: CotHienThi, index: number) => renderField(col, index))}
            </div>
        </div>
    );
}