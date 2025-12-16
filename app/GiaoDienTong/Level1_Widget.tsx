'use client';

import React, { useState, useEffect } from 'react';
import { ModuleConfig } from './KieuDuLieuModule';
import { LayoutGrid, Loader2 } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';

interface Props {
    config: ModuleConfig;
    onClick: () => void;
}

export default function Level1_Widget({ config, onClick }: Props) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!config.bangDuLieu) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                // Lấy 100 dòng để tính toán thống kê cho chính xác
                const { data: res } = await supabase.from(config.bangDuLieu).select('*').limit(100);
                if (res) setData(res);
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchData();
    }, [config.bangDuLieu]);

    // WRAPPER: Đảm bảo click ăn 100% diện tích
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <div className="w-full h-full cursor-pointer overflow-hidden" onClick={(e) => { e.stopPropagation(); onClick(); }}>
            {children}
        </div>
    );

    if (loading) return <Wrapper><div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-gray-600"/></div></Wrapper>;
    if (!data || data.length === 0) return <Wrapper><div className="w-full h-full flex items-center justify-center text-xs text-gray-700">No Data</div></Wrapper>;

    // XỬ LÝ DỮ LIỆU
    const labelKey = config.widgetData?.labelField || Object.keys(data[0])[1]; 
    const valueKey = config.widgetData?.valueField; 
    let chartData = [];

    if (valueKey) {
        chartData = data.slice(0, 10).map(item => ({
            label: String(item[labelKey] || 'N/A'),
            value: Number(item[valueKey]) || 0
        }));
    } else {
        const counts: Record<string, number> = {};
        data.forEach(item => { const label = String(item[labelKey] || 'N/A'); counts[label] = (counts[label] || 0) + 1; });
        chartData = Object.entries(counts).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 10);
    }

    // --- 1. STAT (SỐ LIỆU) - PHÓNG TO ---
    if (config.viewType === 'stat') {
        const total = valueKey ? data.reduce((sum, item) => sum + (Number(item[valueKey]) || 0), 0) : data.length;
        return (
            <Wrapper>
                <div className="w-full h-full flex flex-col items-center justify-center group bg-black hover:bg-[#050505] transition-colors p-2">
                    <div className="w-14 h-14 rounded-full bg-[#111] flex items-center justify-center text-blue-600 mb-2 border border-white/10 shadow-lg shadow-blue-900/10">
                        <LayoutGrid size={28}/>
                    </div>
                    {/* 🟢 SỐ CỰC TO */}
                    <h3 className="text-5xl font-black text-white tracking-tighter mb-1 leading-none">{total.toLocaleString()}</h3>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] opacity-80">
                        {valueKey ? 'Tổng giá trị' : 'Tổng số lượng'}
                    </p>
                </div>
            </Wrapper>
        );
    }

    // --- 2. LIST (DANH SÁCH) ---
    if (config.viewType === 'list') {
        const listData = data.slice(0, 6).map(item => ({ label: String(item[labelKey] || 'N/A'), value: valueKey ? (item[valueKey] || '') : '' }));
        return (
            <Wrapper>
                <div className="w-full h-full p-0 flex flex-col bg-black">
                    <div className="flex-1 overflow-hidden flex flex-col justify-center">
                        {listData.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between px-4 py-3 border-b border-white/5 text-sm hover:bg-[#111] transition-colors group last:border-0">
                                <span className="font-medium text-gray-300 group-hover:text-white truncate pr-2 text-[13px]">{item.label}</span>
                                {item.value && <span className="font-bold font-mono text-[11px] text-blue-400 bg-blue-900/10 px-2 py-0.5 rounded">{item.value}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </Wrapper>
        );
    }

    const chartType = config.widgetData?.chartType || 'Bar';
    const maxValue = Math.max(...chartData.map(d => d.value)) || 1;

    // --- 3A. BIỂU ĐỒ CỘT (TO HƠN) ---
    if (chartType === 'Bar') {
        return (
            <Wrapper>
                <div className="w-full h-full p-5 flex flex-col justify-end bg-black">
                    <div className="flex items-end gap-2 h-full pb-2 border-b border-white/10">
                        {chartData.map((item, idx) => (
                            <div key={idx} className="flex-1 flex flex-col justify-end group h-full relative" title={`${item.label}: ${item.value}`}>
                                <div className="w-full bg-[#222] hover:bg-blue-600 transition-all duration-300 rounded-t-sm relative group-hover:shadow-[0_0_15px_rgba(37,99,235,0.5)]" style={{ height: `${(item.value / maxValue) * 100}%` }}>
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-1 rounded">{item.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase truncate max-w-[60px]">{chartData[0]?.label}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase truncate max-w-[60px]">{chartData[chartData.length-1]?.label}</span>
                    </div>
                </div>
            </Wrapper>
        );
    }

    // --- 3B. BIỂU ĐỒ TRÒN (TO HƠN & THÔNG TIN Ở GIỮA) ---
    if (chartType === 'Pie') {
        const total = chartData.reduce((a, b) => a + b.value, 0) || 1;
        let currentDeg = 0;
        const colors = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a855f7', '#ec4899'];
        const gradient = chartData.map((item, i) => {
            const deg = (item.value / total) * 360;
            const str = `${colors[i % colors.length]} ${currentDeg}deg ${currentDeg + deg}deg`;
            currentDeg += deg;
            return str;
        }).join(', ');

        return (
            <Wrapper>
                <div className="w-full h-full flex flex-col items-center justify-center p-2 relative bg-black">
                    {/* Vòng tròn to hơn (w-40 h-40) */}
                    <div className="relative w-40 h-40 rounded-full shadow-2xl" style={{ background: `conic-gradient(${gradient})` }}>
                        {/* Lỗ giữa to hơn */}
                        <div className="absolute inset-[15%] bg-black rounded-full flex items-center justify-center flex-col shadow-inner">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">{valueKey ? 'TỔNG' : 'SL'}</span>
                            <span className="text-3xl font-black text-white tracking-tight">{total.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    {/* Legend nằm ngang bên dưới */}
                    <div className="flex gap-2 mt-4 justify-center flex-wrap px-2">
                        {chartData.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5 bg-[#111] px-2 py-1 rounded border border-white/5">
                                <div className="w-2 h-2 rounded-full" style={{ background: colors[i % colors.length] }}></div>
                                <span className="text-[10px] font-bold text-gray-400 truncate max-w-[60px]">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Wrapper>
        );
    }

    // --- 3C. BIỂU ĐỒ ĐƯỜNG (TO HƠN) ---
    if (chartType === 'Line') {
        const points = chartData.map((item, i) => {
            const x = (i / (chartData.length - 1 || 1)) * 100;
            const y = 100 - ((item.value / maxValue) * 100);
            return `${x},${y}`;
        }).join(' ');

        return (
            <Wrapper>
                <div className="w-full h-full p-6 flex flex-col bg-black">
                    <div className="flex-1 relative w-full">
                        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            <polyline fill="none" stroke="#3b82f6" strokeWidth="3" points={points} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>
                            <polygon fill="url(#grad)" points={`0,100 ${points} 100,100`} opacity="0.3"/>
                            <defs>
                                <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="transparent" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className="text-center text-xs text-gray-500 mt-4 font-bold uppercase tracking-widest">Xu hướng</div>
                </div>
            </Wrapper>
        );
    }

    return <Wrapper><div>Chart</div></Wrapper>;
}