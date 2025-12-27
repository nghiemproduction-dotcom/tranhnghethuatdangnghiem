'use client';
import React from 'react';
import { ArrowRight, DollarSign } from 'lucide-react';
import Tab_ThongTin from './Tab_ThongTin';
import Tab_NhatKyHoatDong from './Tab_NhatKyHoatDong'; 
import { useLevel3Context } from './Level3Context'; 

interface Props {
    activeTab: string;
    virtualData: any;
}

export default function TabContent({ activeTab, virtualData }: Props) {
    const { formData } = useLevel3Context(); 

    // 1. Tab Form Thông Tin (Mặc định)
    if (activeTab === 'form') {
        return <Tab_ThongTin />;
    }

    // 2. Tab Nhật Ký Hoạt Động (Generic cho mọi module)
    if (activeTab === 'nhat_ky_hoat_dong') {
        return <Tab_NhatKyHoatDong nhanSuId={formData.id} loginHistory={formData.lich_su_dang_nhap} />;
    }

    // 3. Tab Dữ liệu liên kết (Virtual Columns - Related List)
    if (virtualData[activeTab]) {
        return (
            <div className="grid gap-2">
                {virtualData[activeTab]?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#161210] border border-[#8B5E3C]/10 rounded-lg hover:border-[#C69C6D]/50 transition-all cursor-pointer group">
                        <div className="flex flex-col">
                            {/* Cố gắng hiển thị tên hợp lý nhất */}
                            <span className="text-sm text-[#F5E6D3] font-bold group-hover:text-[#C69C6D] transition-colors">
                                {item.ten_viec || item.ten || item.tieu_de || item.name || `Bản ghi #${item.id}`}
                            </span>
                            <span className="text-[10px] text-[#5D4037] font-mono mt-0.5">ID: {item.id}</span>
                        </div>
                        <ArrowRight size={16} className="text-[#5D4037] group-hover:text-[#C69C6D] transition-colors"/>
                    </div>
                ))}
                {!virtualData[activeTab]?.length && <div className="text-center text-[#5D4037] text-xs py-10 border border-dashed border-[#8B5E3C]/20 rounded-lg">Chưa có dữ liệu liên kết.</div>}
            </div>
        );
    }

    // 4. Tab Custom (Ví dụ: Lương, Thống kê...) chưa có component riêng
    // Render placeholder để không lỗi
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-[#161210] border border-[#8B5E3C]/20 rounded-xl border-dashed">
            <div className="p-4 bg-[#2a1e1b] rounded-full mb-4 text-[#C69C6D]"><DollarSign size={32}/></div>
            <p className="text-[#C69C6D] font-bold text-lg mb-2">MODULE MỞ RỘNG</p>
            <p className="text-[#5D4037] text-sm max-w-md text-center">
                Tab <b>"{activeTab}"</b> đang được phát triển hoặc chưa có dữ liệu.
            </p>
        </div>
    );
}