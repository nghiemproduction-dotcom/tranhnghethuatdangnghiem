'use client';

import React, { useState, useEffect } from 'react';
import { ModuleConfig } from '@/app/GiaoDienTong/DashboardBuilder/KieuDuLieuModule'; 
import { LayoutGrid, Loader2 } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';

interface Props {
    config: ModuleConfig;
    onClick: () => void;
}

export default function Level1_Widget({ config, onClick }: Props) {
    const [data, setData] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!config.bangDuLieu) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Nếu là STAT -> Chỉ đếm số lượng (Siêu nhanh)
                if (config.viewType === 'stat') {
                    const { count } = await supabase.from(config.bangDuLieu).select('*', { count: 'exact', head: true });
                    setTotalCount(count || 0);
                } 
                // 2. Nếu là CHART/LIST -> Lấy dữ liệu mẫu (Giới hạn 100 để vẽ chart)
                else {
                    const { data: res } = await supabase.from(config.bangDuLieu).select('*').limit(100).order('tao_luc', { ascending: false });
                    if (res) setData(res);
                }
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchData();
    }, [config.bangDuLieu, config.viewType]);

    // WRAPPER: Đảm bảo click ăn 100% diện tích
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <div className="w-full h-full cursor-pointer overflow-hidden relative group bg-[#111] hover:bg-[#161616] transition-colors" onClick={(e) => { e.stopPropagation(); onClick(); }}>
            {children}
        </div>
    );

    if (loading) return <Wrapper><div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#8B5E3C]"/></div></Wrapper>;

    // --- 1. STAT WIDGET (SỐ LIỆU) ---
    if (config.viewType === 'stat') {
        return (
            <Wrapper>
                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                    <div className="w-12 h-12 rounded-full bg-[#1a120f] flex items-center justify-center text-[#C69C6D] mb-2 border border-[#8B5E3C]/20 shadow-[0_0_20px_rgba(198,156,109,0.1)]">
                        <LayoutGrid size={24}/>
                    </div>
                    <h3 className="text-4xl lg:text-5xl font-black text-[#F5E6D3] tracking-tighter mb-1 leading-none drop-shadow-md">
                        {totalCount.toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-[#8B5E3C] uppercase font-bold tracking-[0.2em] opacity-80">Tổng Số Lượng</p>
                </div>
            </Wrapper>
        );
    }

    // XỬ LÝ DỮ LIỆU CHART
    const labelKey = config.widgetData?.labelField || 'id'; 
    const valueKey = config.widgetData?.valueField; 
    let chartData = [];

    if (valueKey) {
        // Cộng tổng nếu có valueKey
        chartData = data.slice(0, 10).map(item => ({
            label: String(item[labelKey] || 'N/A'),
            value: Number(item[valueKey]) || 0
        }));
    } else {
        // Đếm tần suất nếu không có valueKey
        const counts: Record<string, number> = {};
        data.forEach(item => { const label = String(item[labelKey] || 'N/A'); counts[label] = (counts[label] || 0) + 1; });
        chartData = Object.entries(counts).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8);
    }

    // --- 2. LIST WIDGET ---
    if (config.viewType === 'list') {
        return (
            <Wrapper>
                <div className="w-full h-full flex flex-col bg-[#111]">
                    <div className="flex-1 overflow-hidden flex flex-col justify-center px-4">
                        {data.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-[#8B5E3C]/10 last:border-0 group-hover:border-[#8B5E3C]/20 text-xs">
                                <span className="font-medium text-[#A1887F] group-hover:text-[#F5E6D3] truncate pr-2">{String(item[labelKey] || 'N/A')}</span>
                                {valueKey && <span className="font-bold font-mono text-[#C69C6D]">{item[valueKey]}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </Wrapper>
        );
    }

    const chartType = config.widgetData?.chartType || 'Bar';
    const maxValue = Math.max(...chartData.map(d => d.value)) || 1;
    const colors = ['#C69C6D', '#8B5E3C', '#5D4037', '#A1887F', '#3E2723'];

    // --- 3. CHART WIDGETS ---
    return (
        <Wrapper>
            <div className="w-full h-full p-4 flex flex-col">
                
                {/* BAR CHART */}
                {chartType === 'Bar' && (
                    <div className="flex items-end gap-1 h-full pb-4 border-b border-[#8B5E3C]/20">
                        {chartData.map((item, idx) => (
                            <div key={idx} className="flex-1 flex flex-col justify-end group/bar h-full relative" title={`${item.label}: ${item.value}`}>
                                <div 
                                    className="w-full rounded-t-sm transition-all duration-500 relative hover:brightness-110" 
                                    style={{ height: `${(item.value / maxValue) * 100}%`, background: colors[idx % colors.length] }}
                                ></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* PIE CHART (CSS Conic) */}
                {chartType === 'Pie' && (
                    <div className="flex-1 flex items-center justify-center relative">
                        <div 
                            className="w-32 h-32 rounded-full shadow-xl relative"
                            style={{ 
                                background: `conic-gradient(${chartData.map((item, i, arr) => {
                                    const total = arr.reduce((a, b) => a + b.value, 0);
                                    const start = arr.slice(0, i).reduce((a, b) => a + b.value, 0) / total * 360;
                                    const end = start + (item.value / total) * 360;
                                    return `${colors[i % colors.length]} ${start}deg ${end}deg`;
                                }).join(', ')})` 
                            }}
                        >
                            <div className="absolute inset-4 bg-[#111] rounded-full flex items-center justify-center flex-col">
                                <span className="text-[10px] text-[#8B5E3C] font-bold">TOTAL</span>
                                <span className="text-xl font-bold text-[#F5E6D3]">{data.length}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-center text-[10px] text-[#5D4037] mt-2 font-bold uppercase tracking-widest truncate">
                    {config.tenModule}
                </div>
            </div>
        </Wrapper>
    );
}