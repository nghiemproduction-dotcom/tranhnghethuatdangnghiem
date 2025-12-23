'use client';

import React from 'react';
import { Edit, Trash2, Clock, Image as ImageIcon } from 'lucide-react';

interface Props {
    item: any;
    onEdit: () => void;
    onDelete: () => void;
}

export default function MSP_Card({ item, onEdit, onDelete }: Props) {
    return (
        <div className="group relative bg-[#1a120f] border border-[#8B5E3C]/20 rounded-xl overflow-hidden hover:border-[#C69C6D]/60 hover:shadow-[0_0_20px_rgba(198,156,109,0.1)] transition-all duration-300">
            {/* Hình ảnh */}
            <div className="aspect-[4/3] w-full bg-[#0f0b0a] relative overflow-hidden">
                {item.hinh_anh ? (
                    // 🟢 SỬA LẠI: alt lấy theo mo_ta
                    <img src={item.hinh_anh} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.mo_ta} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#5D4037]">
                        <ImageIcon size={32} strokeWidth={1}/>
                    </div>
                )}
                
                {/* Overlay Buttons */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button onClick={onEdit} className="p-2 bg-[#C69C6D] text-[#1a120f] rounded-full hover:bg-white hover:scale-110 transition-all" title="Sửa">
                        <Edit size={18}/>
                    </button>
                    <button onClick={onDelete} className="p-2 bg-red-900/80 text-red-200 rounded-full hover:bg-red-600 hover:text-white hover:scale-110 transition-all" title="Xóa">
                        <Trash2 size={18}/>
                    </button>
                </div>
            </div>

            {/* Thông tin */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-[#C69C6D] uppercase tracking-wider bg-[#C69C6D]/10 px-2 py-0.5 rounded">
                        {item.the_loai || 'Chưa phân loại'}
                    </span>
                </div>
                {/* 🟢 SỬA LẠI: Hiển thị mo_ta */}
                <h3 className="text-sm font-bold text-[#F5E6D3] truncate mb-2" title={item.mo_ta}>
                    {item.mo_ta}
                </h3>
                
                <div className="flex items-center justify-between pt-3 border-t border-[#8B5E3C]/10">
                    <div className="flex items-center gap-1 text-[10px] text-[#5D4037]">
                        <Clock size={12}/>
                        {/* 🟢 SỬA LẠI: Dùng thoi_diem_dang_mau */}
                        <span>{item.thoi_diem_dang_mau ? new Date(item.thoi_diem_dang_mau).toLocaleDateString('vi-VN') : '-'}</span>
                    </div>
                    {/* Check trang_thai nếu có */}
                    <div className={`w-2 h-2 rounded-full ${item.file_thiet_ke?.length > 0 ? 'bg-green-500 shadow-[0_0_5px_lime]' : 'bg-red-500'}`} title={item.file_thiet_ke?.length > 0 ? 'Đã có file' : 'Chưa có file'}></div>
                </div>
            </div>
        </div>
    );
}