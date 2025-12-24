'use client';
import React from 'react';
import { User, Clock, ArrowRight, DollarSign } from 'lucide-react';
import Tab_ThongTin from './Tab_ThongTin';
import { useLevel3Context } from './Level3Context'; // 🟢

interface Props {
    activeTab: string;
    virtualData: any;
}

export default function TabContent({ activeTab, virtualData }: Props) {
    const { formData } = useLevel3Context(); // 🟢 Cần formData cho tab Lịch sử

    if (activeTab === 'form') {
        // 🟢 Tab_ThongTin không cần prop nào nữa
        return <Tab_ThongTin />;
    }

    if (activeTab === 'luong_thuong') {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-[#161210] border border-[#8B5E3C]/20 rounded-xl border-dashed">
                <div className="p-4 bg-[#2a1e1b] rounded-full mb-4 text-[#C69C6D]"><DollarSign size={32}/></div>
                <p className="text-[#C69C6D] font-bold text-lg mb-2">QUẢN LÝ LƯƠNG & PHÚC LỢI</p>
                <p className="text-[#5D4037] text-sm max-w-md text-center">Đang xây dựng: Biểu đồ thu nhập và lịch sử lương.</p>
            </div>
        );
    }

    if (activeTab === 'lich_su') {
        const InfoItem = ({ icon: Icon, label, value, subValue }: any) => (
            <div className="flex items-start gap-4 p-4 bg-[#161210] border border-[#8B5E3C]/20 rounded-xl">
                <div className="p-3 bg-[#0a0807] rounded-full border border-[#8B5E3C]/30 text-[#C69C6D]"><Icon size={20}/></div>
                <div><p className="text-[10px] text-[#8B5E3C] font-bold uppercase tracking-widest mb-1">{label}</p><p className="text-sm font-bold text-[#F5E6D3]">{value || '---'}</p>{subValue && <p className="text-xs text-[#A1887F] mt-1 font-mono">{subValue}</p>}</div>
            </div>
        );
        const formatDate = (d: string) => d ? new Date(d).toLocaleString('vi-VN') : '---';
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem icon={User} label="Người Tạo" value={formData.nguoi_tao} subValue={formatDate(formData.created_at)} />
                <InfoItem icon={Clock} label="Cập Nhật Cuối" value={formData.nguoi_sua_cuoi} subValue={formatDate(formData.updated_at)} />
                <div className="md:col-span-2 p-6 bg-[#161210] border border-[#8B5E3C]/20 rounded-xl">
                    <p className="text-[#C69C6D] text-xs font-bold mb-2 uppercase">Lịch sử đăng nhập</p>
                    <pre className="text-[10px] text-[#5D4037] font-mono whitespace-pre-wrap bg-[#0a0807] p-4 rounded border border-[#8B5E3C]/10 h-32 overflow-y-auto custom-scroll">
                        {typeof formData.lich_su_dang_nhap === 'string' ? formData.lich_su_dang_nhap : JSON.stringify(formData.lich_su_dang_nhap, null, 2)}
                    </pre>
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-2">
            {virtualData[activeTab]?.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#161210] border border-[#8B5E3C]/10 rounded-lg hover:border-[#C69C6D]/50 transition-all cursor-pointer group">
                    <div className="flex flex-col"><span className="text-sm text-[#F5E6D3] font-bold group-hover:text-[#C69C6D] transition-colors">{item.ten_viec || item.ten || 'Chi tiết'}</span><span className="text-[10px] text-[#5D4037] font-mono mt-0.5">ID: {item.id}</span></div>
                    <ArrowRight size={16} className="text-[#5D4037] group-hover:text-[#C69C6D] transition-colors"/>
                </div>
            ))}
            {!virtualData[activeTab]?.length && <div className="text-center text-[#5D4037] text-xs py-10 border border-dashed border-[#8B5E3C]/20 rounded-lg">Chưa có dữ liệu liên kết.</div>}
        </div>
    );
}