'use client';
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { CotHienThi } from '../../../../../DashboardBuilder/KieuDuLieuModule';
import { useLevel3Context } from './Level3Context'; 

interface Props { col: CotHienThi; }

export default function InputRenderer({ col }: Props) {
    const { formData, setFormData, isEditing, canEditColumn, dynamicOptions, onAddNewOption } = useLevel3Context();
    const value = formData[col.key];
    
    const handleChange = (val: any) => { setFormData((prev: any) => ({ ...prev, [col.key]: val })); };
    const isDisabled = !isEditing || col.readOnly || !canEditColumn(col);

    // 🟢 CẬP NHẬT REQUIREMENT 7: Thêm 'text-center' để cân giữa nội dung
    const inputClass = `w-full bg-transparent border-b border-[#8B5E3C]/30 py-1.5 text-[#E8D4B9] text-sm focus:border-[#C69C6D] outline-none font-mono text-center ${isDisabled ? 'text-gray-500 border-transparent cursor-not-allowed' : ''}`;

    // 1. KIỂU LINK
    if (col.kieuDuLieu === 'link') {
        return (
            <div className="flex items-center gap-2 w-full">
                <input type="text" className={inputClass} placeholder={isEditing ? "Dán link..." : "---"} value={value || ''} readOnly={isDisabled} onChange={(e) => handleChange(e.target.value)} />
                {value && <button onClick={() => window.open(value, '_blank')} className="shrink-0 p-1.5 bg-[#161210] border border-[#8B5E3C]/30 rounded hover:bg-[#C69C6D] hover:text-[#0a0807]" title="Mở"><ExternalLink size={14} /></button>}
            </div>
        );
    }

    // 2. KIỂU PERCENT (%)
    if (col.kieuDuLieu === 'percent') {
        return (
            <div className="relative w-full">
                <input type="number" value={value ?? ''} onChange={e => handleChange(e.target.value)} className={`${inputClass} pr-6`} placeholder="0" readOnly={isDisabled} />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[#8B5E3C] text-xs font-bold">%</span>
            </div>
        );
    }

    // 🟢 3. KIỂU TIỀN TỆ (CURRENCY)
    // CẬP NHẬT REQUIREMENT 1: Xóa chữ "VNĐ" hiển thị cứng
    if (col.kieuDuLieu === 'currency') {
        const displayVal = (value !== null && value !== undefined) ? new Intl.NumberFormat('vi-VN').format(value) : '';
        return (
            <div className="relative w-full">
                <input type="text" value={displayVal} onChange={e => { if (isDisabled) return; const raw = e.target.value.replace(/[^0-9]/g, ''); handleChange(raw ? Number(raw) : null); }} readOnly={isDisabled} className={inputClass} placeholder="0" />
            </div>
        );
    }

    // 4. KIỂU CƠ BẢN
    const inputType = (col.kieuDuLieu === 'date' || col.kieuDuLieu.includes('timestamp')) ? 'date' : (['int4','int8','numeric','number'].includes(col.kieuDuLieu) ? 'number' : 'text');
    
    return (
        <div className="relative w-full group">
            <input type={inputType} value={value ?? ''} onChange={e => handleChange(e.target.value)} readOnly={isDisabled} className={inputClass} placeholder={isEditing ? "..." : ""} />
            
            {/* 🟢 CẬP NHẬT REQUIREMENT 6: Menu xổ ra có nền đen */}
            {col.kieuDuLieu === 'select_dynamic' && isEditing && (
                <select 
                    className="absolute inset-0 opacity-0 cursor-pointer hover:opacity-100 bg-[#161210] text-[#E8D4B9] border border-[#8B5E3C]/30" 
                    onChange={(e) => { if(e.target.value === 'ADD_NEW') onAddNewOption(col.key); else handleChange(e.target.value); }} 
                    value={value || ''}
                >
                    <option value="" className="bg-[#161210] text-gray-500">-- Chọn --</option>
                    {(dynamicOptions[col.key] || []).map(opt => (
                        <option key={opt} value={opt} className="bg-[#161210] text-[#E8D4B9] py-2">{opt}</option>
                    ))}
                    <option value="ADD_NEW" className="bg-[#161210] text-[#C69C6D] font-bold border-t border-[#8B5E3C]/30">+ Thêm mới...</option>
                </select>
            )}
        </div>
    );
}