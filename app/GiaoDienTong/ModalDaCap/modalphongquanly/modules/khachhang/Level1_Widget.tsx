'use client';
import React, { useState, useEffect } from 'react';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';
import { Users, Loader2, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';

// 🟢 Định nghĩa Props chuẩn, bắt buộc có onClick
interface Props {
    config: ModuleConfig;
    onClick: () => void;
}

export default function Level1_Widget({ config, onClick }: Props) {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCount = async () => {
            setLoading(true);
            // Đếm tổng số bản ghi trong bảng khach_hang
            const { count: total } = await supabase
                .from('khach_hang')
                .select('*', { count: 'exact', head: true });
            
            setCount(total || 0);
            setLoading(false);
        };
        fetchCount();
    }, []);

    return (
        <div 
            onClick={onClick}
            className="w-full h-full bg-[#161210] border border-[#8B5E3C]/20 rounded-2xl p-6 relative group cursor-pointer hover:border-[#C69C6D] transition-all overflow-hidden flex flex-col justify-between shadow-lg"
        >
            {/* Hiệu ứng nền */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#C69C6D]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>

            {/* Header: Icon & Nút mở rộng */}
            <div className="flex justify-between items-start z-10">
                <div className="p-3 bg-[#0a0807] rounded-xl border border-[#8B5E3C]/30 text-[#C69C6D] shadow-inner group-hover:scale-110 transition-transform duration-300">
                    <Users size={24} />
                </div>
                <div className="p-2 rounded-full hover:bg-white/5 transition-colors">
                    <ArrowUpRight size={20} className="text-[#5D4037] group-hover:text-[#C69C6D]" />
                </div>
            </div>

            {/* Content: Số liệu */}
            <div className="z-10 mt-4">
                <h3 className="text-[#5D4037] font-bold text-xs uppercase tracking-widest mb-1 group-hover:text-[#E8D4B9] transition-colors">
                    Tổng Khách Hàng
                </h3>
                {loading ? (
                    <Loader2 className="animate-spin text-[#C69C6D]" size={24} />
                ) : (
                    <div className="text-4xl font-black text-[#F5E6D3] tracking-tight group-hover:translate-x-1 transition-transform">
                        {count}
                    </div>
                )}
            </div>

            {/* Icon trang trí chìm */}
            <div className="absolute -bottom-6 -right-6 text-[#8B5E3C]/5 group-hover:text-[#8B5E3C]/10 transition-colors transform -rotate-12">
                <Users size={140} />
            </div>
        </div>
    );
}