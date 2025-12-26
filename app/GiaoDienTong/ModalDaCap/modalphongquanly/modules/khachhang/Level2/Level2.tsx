'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import { ArrowLeft, Plus, Search, User, Phone, MapPin } from 'lucide-react';

// 🟢 QUAN TRỌNG: Import Level 3 từ chính folder hiện tại (quanlykhachhang)
import Level3_FormChiTiet from '@/app/GiaoDienTong/ModalDaCap/modalphongquanly/modules/khachhang/Level3/level3'; 

interface Props {
    config: ModuleConfig;
    onBack: () => void;
}

export default function Level2_DanhSach({ config, onBack }: Props) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isCreateMode, setIsCreateMode] = useState(false);

    // Hàm lấy danh sách khách hàng
    const fetchData = async () => {
        setLoading(true);
        const { data: res, error } = await supabase
            .from('khach_hang') // 🟢 Lấy từ bảng khách hàng
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error) setData(res || []);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    // 🟢 MỞ LEVEL 3 (FORM CHI TIẾT)
    if (selectedItem || isCreateMode) {
        return (
            <Level3_FormChiTiet
                isOpen={true}
                config={config} 
                initialData={selectedItem} 
                userRole="admin" 
                onClose={() => { setSelectedItem(null); setIsCreateMode(false); }}
                onSuccess={() => { fetchData(); setSelectedItem(null); setIsCreateMode(false); }}
            />
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0F0C0B] animate-in slide-in-from-right-10">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between p-4 border-b border-[#8B5E3C]/30 bg-[#0a0807]">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-[#8B5E3C]/20 rounded-full text-[#8B5E3C] transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-[#F5E6D3] font-bold text-lg uppercase tracking-wider">
                        Khách Hàng <span className="text-[#8B5E3C] text-sm ml-2">({data.length})</span>
                    </h2>
                </div>
                <button 
                    onClick={() => setIsCreateMode(true)}
                    className="flex items-center gap-2 bg-[#C69C6D] text-[#1a120f] px-4 py-2 rounded-lg font-bold hover:bg-[#E8D4B9] transition-all shadow-lg"
                >
                    <Plus size={18} /> <span className="hidden md:inline">Thêm Mới</span>
                </button>
            </div>

            {/* Danh sách thẻ */}
            <div className="flex-1 overflow-y-auto p-4 custom-scroll">
                {loading ? (
                    <div className="text-center py-10 text-[#8B5E3C]">Đang tải dữ liệu...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {data.map((item) => (
                            <div 
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className="group bg-[#161210] border border-[#8B5E3C]/20 rounded-xl p-4 cursor-pointer hover:border-[#C69C6D] hover:bg-[#1a120f] transition-all shadow-md relative overflow-hidden"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-[#0a0807] border border-[#8B5E3C]/30 flex items-center justify-center overflow-hidden shrink-0">
                                        {item.hinh_anh ? (
                                            <img src={item.hinh_anh} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} className="text-[#5D4037]" />
                                        )}
                                    </div>
                                    {/* Thông tin */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[#E8D4B9] font-bold text-sm truncate group-hover:text-[#C69C6D]">
                                            {item.ho_ten}
                                        </h3>
                                        <div className="flex flex-col gap-1 mt-1 text-[11px] text-[#5D4037]">
                                            {item.so_dien_thoai && (
                                                <span className="flex items-center gap-1"><Phone size={10}/> {item.so_dien_thoai}</span>
                                            )}
                                            {item.dia_chi && (
                                                <span className="flex items-center gap-1 truncate"><MapPin size={10}/> {item.dia_chi}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Label Loại Khách */}
                                {item.loai_khach_hang && (
                                    <div className="absolute top-2 right-2 bg-[#8B5E3C]/10 text-[#C69C6D] text-[9px] px-2 py-0.5 rounded border border-[#8B5E3C]/20">
                                        {item.loai_khach_hang}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}