'use client';
import React, { useRef } from 'react';
import { User, GripVertical } from 'lucide-react';
import InputRenderer from './InputRenderer';
import { CotHienThi } from '../../../../../DashboardBuilder/KieuDuLieuModule';
import { useLevel3Context } from './Level3Context'; // 🟢

export default function Tab_ThongTin() {
    // 🟢 Lấy hết từ kho, không cần props nữa
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
        if (!isArranging && col.permRead && !col.permRead.includes('all') && !canEditColumn(col)) return null;
        if (!isArranging && ['hinh_anh', 'avatar'].includes(col.key)) return null;

        return (
            <div 
                key={col.key}
                draggable={isArranging}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`
                    group transition-all duration-200 flex items-center gap-4
                    ${isArranging ? 'cursor-move border border-dashed border-[#C69C6D]/50 bg-[#C69C6D]/5 p-2 rounded-lg' : 'py-1'}
                `}
            >
                <div className="w-[120px] shrink-0 text-right flex justify-end items-center gap-2">
                    {isArranging && <GripVertical size={14} className="text-[#C69C6D] cursor-grab"/>}
                    <label className="text-[11px] font-bold text-[#8B5E3C] uppercase leading-tight">
                        {col.label}
                        {!isArranging && isEditing && col.batBuoc && !col.readOnly && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                </div>
                
                <div className={`flex-1 ${isArranging ? 'pointer-events-none opacity-60' : ''}`}>
                    {/* 🟢 InputRenderer tự lo liệu, chỉ cần biết tên cột */}
                    <InputRenderer col={col} /> 
                </div>
            </div>
        );
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full px-2">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-16 gap-y-6">
                {config.danhSachCot.map((col: CotHienThi, index: number) => renderField(col, index))}
            </div>
        </div>
    );
}   