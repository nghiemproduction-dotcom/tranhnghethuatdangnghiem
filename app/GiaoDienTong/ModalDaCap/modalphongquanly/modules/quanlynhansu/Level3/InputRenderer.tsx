'use client';
import React from 'react';
import { 
    Hash, Type, Phone, Mail, Copy, 
    ChevronLeft, Check, X, Calendar, Globe, Plus 
} from 'lucide-react';
import { CotHienThi } from '../../../../../DashboardBuilder/KieuDuLieuModule';
import { useLevel3Context } from './Level3Context'; // 🟢 Lấy hàng từ kho

interface Props {
    col: CotHienThi; // Chỉ cần biết mình là cột nào
}

export default function InputRenderer({ col }: Props) {
    // 🟢 Rút dữ liệu từ Context
    const { 
        formData, setFormData, isEditing, canEditColumn, 
        dynamicOptions, onAddNewOption 
    } = useLevel3Context();

    const value = formData[col.key];
    
    // Logic cập nhật dữ liệu an toàn
    const handleChange = (val: any) => {
        setFormData((prev: any) => ({ ...prev, [col.key]: val }));
    };

    // Logic tính quyền sửa (Disabled)
    const isDisabled = !isEditing || col.readOnly || !canEditColumn(col);

    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
    };

    // 🟢 1. VIEW MODE
    if (isDisabled) {
        let displayValue = value;
        const isEmpty = value === null || value === undefined || value === '';

        if (col.kieuDuLieu === 'currency' && !isEmpty) {
            displayValue = new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';
        } else if (col.kieuDuLieu === 'date' && !isEmpty) {
            try { displayValue = new Date(value).toLocaleDateString('vi-VN'); } catch (e) {}
        } else if (col.kieuDuLieu === 'boolean') {
            return <div className="text-sm font-bold text-[#F5E6D3]">{value ? 'Có' : 'Không'}</div>;
        }

        return (
            <div className="flex items-center justify-between w-full min-h-[40px] px-4 py-2 bg-[#161210] rounded-md border border-[#8B5E3C]/10">
                <span className={`text-sm font-medium truncate ${isEmpty ? 'text-[#5D4037] italic' : 'text-[#F5E6D3]'}`}>
                    {isEmpty ? '---' : displayValue}
                </span>
                {!isEmpty && (
                    <button onClick={() => copyToClipboard(String(value))} className="text-[#5D4037] hover:text-[#C69C6D] transition-colors"><Copy size={14}/></button>
                )}
            </div>
        );
    }

    // 🟢 2. EDIT MODE
    const commonClass = `w-full bg-[#1a120f] border border-[#8B5E3C]/30 rounded-md px-4 py-2.5 text-sm text-[#F5E6D3] outline-none focus:border-[#C69C6D] focus:bg-[#0F0C0B] transition-all placeholder-[#5D4037] shadow-inner`;

    // A. DROPDOWN
    if (col.kieuDuLieu === 'select_dynamic') { 
        const opts = dynamicOptions[col.key] || []; 
        return ( 
            <div className="flex items-center gap-3 w-full">
                <div className="relative flex-1">
                    <select 
                        value={value || ''} 
                        onChange={e => handleChange(e.target.value)} 
                        className={`${commonClass} appearance-none cursor-pointer pr-10`}
                    >
                        <option value="" className="text-[#5D4037]">-- Chọn --</option>
                        {opts.map((opt, idx) => (
                            <option key={idx} value={opt} className="bg-[#1a120f] text-[#F5E6D3]">{opt}</option>
                        ))}
                    </select>
                    <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 rotate-[-90deg] text-[#8B5E3C] pointer-events-none" size={16}/>
                </div>
                
                <button 
                    type="button"
                    onClick={() => onAddNewOption(col.key)}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-[#8B5E3C]/50 text-[#8B5E3C] hover:text-[#1a120f] hover:bg-[#C69C6D] hover:border-[#C69C6D] transition-all shrink-0 shadow-lg group"
                    title="Thêm mới"
                >
                    <Plus size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform"/>
                </button>
            </div>
        ); 
    }

    // B. TIỀN TỆ
    if (col.kieuDuLieu === 'currency') {
        const displayVal = (value !== '' && value !== null && value !== undefined) ? new Intl.NumberFormat('vi-VN').format(value) : '';
        return (
            <div className="relative w-full">
                <input 
                    type="text" value={displayVal} 
                    onChange={e => { const raw = e.target.value.replace(/[^0-9]/g, ''); handleChange(raw ? Number(raw) : null); }}
                    className={`${commonClass} pr-12 font-mono text-right`} placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B5E3C] text-xs font-bold">VNĐ</span>
            </div>
        );
    }

    // C. CÁC KIỂU KHÁC
    const inputType = (col.kieuDuLieu === 'date' || col.kieuDuLieu.includes('timestamp')) ? 'date' : 
                      (['int4','int8','numeric','number'].includes(col.kieuDuLieu) ? 'number' : 'text');

    return (
        <div className="relative w-full flex items-center gap-2">
            <div className="relative flex-1">
                <input 
                    type={inputType} 
                    value={value !== undefined && value !== null ? value : ''} 
                    onChange={e => handleChange(e.target.value)} 
                    className={`${commonClass} ${inputType === 'date' ? 'pr-2' : ''}`}
                    placeholder=""
                />
                {inputType === 'date' && <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B5E3C] pointer-events-none"/>}
            </div>
        </div>
    );
}