'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { PieChart, Loader2, Database, List, Hash, User } from 'lucide-react';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule';

interface Props {
    config: ModuleConfig;
    onClick: () => void;
}

export default function Level1_Widget_Generic({ config, onClick }: Props) {
    const [stats, setStats] = useState<{label: string, value: number, color: string}[]>([]);
    const [listData, setListData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#C69C6D', '#8B5E3C', '#5D4037', '#A1887F', '#3E2723', '#D7CCC8'];
    const VIEW_TYPE = config.viewType || 'chart'; // Mặc định là chart
    
    // Lấy cấu hình cột từ widgetData (do DashboardBuilder gửi xuống)
    const groupByField = config.widgetData?.groupBy || 'trang_thai';
    const titleField = config.widgetData?.titleField || 'ho_ten';
    const subField = config.widgetData?.subField || 'so_dien_thoai';

    useEffect(() => {
        const fetchData = async () => {
            if (!config.bangDuLieu) return;
            setLoading(true);

            try {
                // 1. Lấy tổng số lượng
                const { count } = await supabase.from(config.bangDuLieu).select('*', { count: 'exact', head: true });
                setTotal(count || 0);

                // 2. Xử lý theo từng loại hiển thị
                if (VIEW_TYPE === 'stat') {
                    // Chỉ cần count là đủ
                } 
                else if (VIEW_TYPE === 'list') {
                    // Lấy 4 bản ghi mới nhất
                    const { data } = await supabase
                        .from(config.bangDuLieu)
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(4);
                    setListData(data || []);
                }
                else {
                    // Mặc định: CHART -> Group theo cột được chọn
                    const { data } = await supabase.from(config.bangDuLieu).select(groupByField).limit(100);
                    
                    if (data && data.length > 0) {
                        const counts: Record<string, number> = {};
                        data.forEach((item: any) => {
                            const key = item[groupByField] || 'Khác';
                            counts[key] = (counts[key] || 0) + 1;
                        });

                        const formatted = Object.entries(counts).map(([label, value], index) => ({
                            label,
                            value,
                            color: COLORS[index % COLORS.length]
                        }));
                        setStats(formatted);
                    }
                }
            } catch (error) {
                console.error("Widget Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [config.bangDuLieu, VIEW_TYPE, groupByField]);

    // --- RENDER UI ---

    const renderContent = () => {
        if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-[#C69C6D]" size={24}/></div>;

        // 1. Dạng THỐNG KÊ SỐ (Stat)
        if (VIEW_TYPE === 'stat') {
            return (
                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                    <Hash size={40} className="text-[#8B5E3C] opacity-20 mb-2"/>
                    <span className="text-5xl font-black text-[#F5E6D3] tracking-tighter">{total}</span>
                    <span className="text-xs text-[#8B5E3C] uppercase tracking-widest mt-1">Bản ghi</span>
                </div>
            );
        }

        // 2. Dạng DANH SÁCH (List)
        if (VIEW_TYPE === 'list') {
            return (
                <div className="flex-1 flex flex-col gap-2 mt-3 overflow-hidden relative z-10">
                    {listData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded bg-[#0a0807]/40 border border-[#8B5E3C]/10 hover:border-[#C69C6D]/30 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-[#1a120f] border border-[#8B5E3C]/20 flex items-center justify-center shrink-0 text-[#C69C6D]">
                                {item.hinh_anh ? <img src={item.hinh_anh} className="w-full h-full object-cover rounded-full"/> : <User size={14}/>}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-[#E8D4B9] truncate">{item[titleField] || 'Chưa đặt tên'}</div>
                                <div className="text-[10px] text-[#5D4037] truncate">{item[subField] || '-'}</div>
                            </div>
                        </div>
                    ))}
                    {listData.length === 0 && <div className="text-center text-xs text-gray-600 mt-4">Chưa có dữ liệu</div>}
                </div>
            );
        }

        // 3. Dạng BIỂU ĐỒ (Chart) - Mặc định
        return (
            <div className="flex-1 flex flex-col relative z-10">
                 <div className="absolute top-0 right-0 text-right">
                    <p className="text-[10px] text-[#8B5E3C] font-bold uppercase">Tổng</p>
                    <p className="text-3xl font-black text-[#F5E6D3] leading-none">{total}</p>
                </div>
                <div className="flex-1 flex items-center justify-center relative mt-2">
                    <div 
                        className="w-28 h-28 rounded-full shadow-2xl relative border-4 border-[#161210] group-hover:scale-105 transition-transform duration-500"
                        style={{ 
                            background: stats.length > 0 
                            ? `conic-gradient(${stats.map((s, i, arr) => {
                                const totalVal = arr.reduce((a, b) => a + b.value, 0);
                                let start = 0;
                                for(let j=0; j<i; j++) start += arr[j].value;
                                const startPercent = (start / totalVal) * 100;
                                const endPercent = startPercent + (s.value / totalVal) * 100;
                                return `${s.color} ${startPercent}% ${endPercent}%`;
                            }).join(', ')})`
                            : '#333'
                        }}
                    >
                        <div className="absolute inset-2 bg-[#110d0c] rounded-full flex items-center justify-center flex-col shadow-inner">
                            <PieChart size={24} className="text-[#8B5E3C] opacity-50"/>
                        </div>
                    </div>
                </div>
                <div className="mt-auto w-full grid grid-cols-2 gap-x-2 gap-y-1 pt-2">
                    {stats.slice(0, 4).map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px]">
                            <span className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{backgroundColor: s.color}}></span>
                            <span className="text-[#A1887F] truncate flex-1">{s.label}</span>
                            <span className="text-[#F5E6D3] font-bold">{s.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div 
            onClick={onClick}
            className="w-full h-full bg-[#161210] border border-[#8B5E3C]/20 rounded-2xl p-5 relative group cursor-pointer hover:border-[#C69C6D] transition-all overflow-hidden flex flex-col shadow-lg"
        >
            {/* Header */}
            <div className="flex justify-between items-start z-10 mb-1">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#0a0807] rounded-lg border border-[#8B5E3C]/30 text-[#C69C6D] shadow-inner">
                        {VIEW_TYPE === 'list' ? <List size={18}/> : (VIEW_TYPE === 'stat' ? <Hash size={18}/> : <Database size={18}/>)}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[#5D4037] font-bold text-[10px] uppercase tracking-wider group-hover:text-[#E8D4B9] transition-colors max-w-[120px] truncate">
                            {config.tenModule}
                        </span>
                        {/* Hiển thị loại view nhỏ ở dưới */}
                        <span className="text-[8px] text-[#8B5E3C]/50 uppercase">{VIEW_TYPE === 'chart' ? `Group: ${groupByField}` : VIEW_TYPE}</span>
                    </div>
                </div>
            </div>

            {renderContent()}
            
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#C69C6D] blur-[60px] opacity-10 rounded-full group-hover:opacity-20 transition-opacity pointer-events-none"></div>
        </div>
    );
}