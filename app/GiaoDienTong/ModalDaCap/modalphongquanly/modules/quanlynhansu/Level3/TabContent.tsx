'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { CotHienThi, ModuleConfig } from '../../../../../DashboardBuilder/KieuDuLieuModule';
import { ArrowRight, Clock, User, Calendar } from 'lucide-react';
import InputRenderer from './InputRenderer';

interface Props {
    activeTab: string;
    config: ModuleConfig;
    formData: any;
    setFormData: (d: any) => void;
    virtualData: any;
    isEditing: boolean;
    canEditColumn: (col: CotHienThi) => boolean;
    dynamicOptions: Record<string, string[]>;
    onAddNewOption: (key: string) => void;
}

export default function TabContent({ activeTab, config, formData, setFormData, virtualData, isEditing, canEditColumn, dynamicOptions, onAddNewOption }: Props) {
    
    // 1. FORM CHÍNH
    if (activeTab === 'form') {
        const imgCol = config.danhSachCot.find(c => ['hinh_anh', 'avatar', 'image'].includes(c.key) || c.kieuDuLieu === 'image');
        const mainCols = config.danhSachCot.filter(c => c.key !== imgCol?.key);
        const midPoint = Math.ceil(mainCols.length / 2);
        const leftCols = mainCols.slice(0, midPoint);
        const rightCols = mainCols.slice(midPoint);

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">
                {[leftCols, rightCols].map((cols, idx) => (
                    <div key={idx} className="flex flex-col gap-6">
                        {cols.map(col => {
                            if (!canEditColumn(col)) return null; 
                            return (
                                <div key={col.key}>
                                    <label className="text-[10px] font-bold text-[#8B5E3C] uppercase mb-1.5 flex items-center gap-1">
                                        {col.label} {isEditing && col.batBuoc && <span className="text-red-500">*</span>}
                                    </label>
                                    <InputRenderer 
                                        col={col} 
                                        value={formData[col.key]} 
                                        onChange={(val) => setFormData({...formData, [col.key]: val})}
                                        disabled={!isEditing}
                                        dynamicOptions={dynamicOptions[col.key]}
                                        onAddNewOption={onAddNewOption}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    }

    // 2. TAB LỊCH SỬ & HỒ SƠ
    if (activeTab === 'lich_su') {
        const InfoItem = ({ icon: Icon, label, value, subValue }: any) => (
            <div className="flex items-start gap-4 p-4 bg-[#1a120f] border border-[#8B5E3C]/20 rounded-xl">
                <div className="p-3 bg-[#0a0807] rounded-full border border-[#8B5E3C]/30 text-[#C69C6D]">
                    <Icon size={20}/>
                </div>
                <div>
                    <p className="text-[10px] text-[#8B5E3C] font-bold uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-sm font-bold text-[#F5E6D3]">{value || 'Chưa có thông tin'}</p>
                    {subValue && <p className="text-xs text-[#A1887F] mt-1 font-mono">{subValue}</p>}
                </div>
            </div>
        );

        const formatDate = (d: string) => d ? new Date(d).toLocaleString('vi-VN') : '---';

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem 
                    icon={User} 
                    label="Người Tạo Hồ Sơ" 
                    value={formData.nguoi_tao} 
                    subValue={formatDate(formData.ngay_tao)} 
                />
                <InfoItem 
                    icon={Clock} 
                    label="Cập Nhật Lần Cuối" 
                    value={formData.nguoi_sua_cuoi} 
                    subValue={formatDate(formData.ngay_sua_cuoi)} 
                />
                {/* Có thể mở rộng thêm Log chi tiết ở đây nếu có bảng Audit Log riêng */}
                <div className="md:col-span-2 p-6 bg-[#1a120f] border border-[#8B5E3C]/20 rounded-xl text-center">
                    <p className="text-[#5D4037] text-xs italic">
                        Tính năng xem lịch sử chỉnh sửa chi tiết (Ai sửa trường nào) đang được phát triển.
                    </p>
                </div>
            </div>
        );
    }

    // 3. TAB DỮ LIỆU LIÊN KẾT
    return (
        <div className="grid gap-2">
            {virtualData[activeTab]?.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#1a120f] border border-[#8B5E3C]/10 rounded-lg hover:border-[#C69C6D]/50 transition-all cursor-pointer group">
                    <div className="flex flex-col"><span className="text-sm text-[#F5E6D3] font-bold group-hover:text-[#C69C6D] transition-colors">{item.ten_viec || item.ten || 'Chi tiết'}</span><span className="text-[10px] text-[#5D4037] font-mono mt-0.5">ID: {item.id}</span></div>
                    <ArrowRight size={16} className="text-[#5D4037] group-hover:text-[#C69C6D] transition-colors"/>
                </div>
            ))}
            {!virtualData[activeTab]?.length && <div className="text-center text-[#5D4037] text-xs py-10 border border-dashed border-[#8B5E3C]/20 rounded-lg">Chưa có dữ liệu.</div>}
        </div>
    );
}