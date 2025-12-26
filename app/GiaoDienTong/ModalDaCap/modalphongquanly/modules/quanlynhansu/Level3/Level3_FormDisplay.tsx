'use client';
import React from 'react';
import { CotHienThi } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import { Calendar, AlignLeft, Type, CheckCircle } from 'lucide-react';

interface Props {
    columns: CotHienThi[];
    formData: any;
    isEditing: boolean;
    isArranging: boolean;
    onChange: (key: string, value: any) => void;
    onColumnConfigChange: (newCols: CotHienThi[]) => void;
}

export default function Level3_FormDisplay({ columns, formData, isEditing, onChange }: Props) {
    
    // Hàm render ô nhập liệu tùy theo kiểu dữ liệu (Text, Number, Select...)
    const renderInput = (col: CotHienThi) => {
        const val = formData[col.key] || '';

        // 1. CHẾ ĐỘ XEM (View Mode)
        if (!isEditing) {
            return (
                <div className="text-[#F5E6D3] font-medium text-sm break-words bg-[#1a120f]/50 p-2 rounded border border-transparent">
                    {val ? String(val) : <span className="text-gray-600 italic">Chưa cập nhật</span>}
                </div>
            );
        }

        // 2. CHẾ ĐỘ SỬA (Edit Mode)
        switch (col.kieuDuLieu) {
            case 'select':
                // Nếu cột là Select, bạn cần danh sách options. 
                // Ở đây mình demo options cứng hoặc lấy từ config nếu có.
                // Trong thực tế bạn có thể truyền options từ props.
                return (
                    <select 
                        className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded p-2 text-[#C69C6D] focus:border-[#C69C6D] outline-none"
                        value={val}
                        onChange={(e) => onChange(col.key, e.target.value)}
                    >
                        <option value="">-- Chọn --</option>
                        <option value="Đang hoạt động">Đang hoạt động</option>
                        <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                        <option value="VIP">VIP</option>
                        <option value="Tiềm năng">Tiềm năng</option>
                        <option value="Mới">Mới</option>
                    </select>
                );

            case 'date':
            case 'datetime':
                return (
                    <div className="relative">
                        <input 
                            type="date" 
                            className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded p-2 pl-9 text-[#C69C6D] focus:border-[#C69C6D] outline-none [color-scheme:dark]"
                            value={val ? String(val).split('T')[0] : ''}
                            onChange={(e) => onChange(col.key, e.target.value)}
                        />
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B5E3C] pointer-events-none"/>
                    </div>
                );

            case 'number':
                return (
                    <input 
                        type="number" 
                        className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded p-2 text-[#C69C6D] focus:border-[#C69C6D] outline-none"
                        value={val}
                        onChange={(e) => onChange(col.key, e.target.value)}
                    />
                );

            case 'textarea':
                return (
                    <textarea 
                        rows={3}
                        className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded p-2 text-[#C69C6D] focus:border-[#C69C6D] outline-none"
                        value={val}
                        onChange={(e) => onChange(col.key, e.target.value)}
                    />
                );

            default: // Mặc định là Text
                return (
                    <div className="relative">
                        <input 
                            type="text" 
                            className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded p-2 pl-9 text-[#C69C6D] focus:border-[#C69C6D] outline-none"
                            value={val}
                            onChange={(e) => onChange(col.key, e.target.value)}
                            placeholder={`Nhập ${col.label.toLowerCase()}...`}
                        />
                        <Type size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B5E3C] pointer-events-none"/>
                    </div>
                );
        }
    };

    // Lọc bỏ các cột hệ thống không cần hiển thị
    const displayCols = columns.filter(c => 
        !['id', 'created_at', 'updated_at', 'nguoi_tao_id', 'total_khach', 'khach_hang', 'sale_id'].includes(c.key) &&
        (c.hienThiDetail !== false) // Chỉ hiện cột được phép hiện ở detail
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayCols.map((col) => (
                <div key={col.key} className={`flex flex-col gap-1 ${col.kieuDuLieu === 'textarea' ? 'md:col-span-2' : ''}`}>
                    <label className="text-[#8B5E3C] text-xs font-bold uppercase flex items-center gap-1">
                        {col.batBuoc && <span className="text-red-500">*</span>}
                        {col.label || col.key}
                    </label>
                    
                    {renderInput(col)}
                </div>
            ))}
        </div>
    );
}