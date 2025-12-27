'use client';
import React, { useMemo } from 'react';
import { PieChart, BarChart3, Circle, Activity } from 'lucide-react';

interface Props {
    data: any[];
    total: number;
    groupByField: string;
    loading: boolean;
    config: any;
}

const COLORS = ['#C69C6D', '#8B5E3C', '#5D4037', '#A1887F', '#3E2723', '#D7CCC8'];

export default function Widget_Chart({ data, total, groupByField, loading, config }: Props) {
    const chartType = config.widgetData?.chartType || 'Pie'; // Pie, Donut, Bar

    const stats = useMemo(() => {
        if (!data || data.length === 0) return [];
        const counts: Record<string, number> = {};
        data.forEach((item: any) => {
            const key = item[groupByField] || 'Khác';
            counts[key] = (counts[key] || 0) + 1;
        });
        return Object.entries(counts).map(([label, value], index) => ({
            label, value, color: COLORS[index % COLORS.length],
            percent: total > 0 ? (value / total) * 100 : 0
        })).sort((a, b) => b.value - a.value);
    }, [data, groupByField, total]);

    // 1. Logic vẽ Pie/Donut (Conic Gradient)
    const pieStyle = useMemo(() => {
        if (stats.length === 0) return { background: '#333' };
        let cumulative = 0;
        const gradient = stats.map(s => {
            const start = cumulative;
            cumulative += s.percent;
            return `${s.color} ${start}% ${cumulative}%`;
        }).join(', ');
        return { background: `conic-gradient(${gradient})` };
    }, [stats]);

    if (loading) return null;

    // 🟢 RENDER: BIỂU ĐỒ CỘT (BAR)
    if (chartType === 'Bar') {
        return (
            <div className="flex-1 flex flex-col justify-end gap-2 relative z-10 h-full w-full px-2 pb-2">
                 <div className="absolute top-0 right-0 text-right">
                    <p className="text-[10px] text-[#8B5E3C] font-bold uppercase">Tổng</p>
                    <p className="text-2xl font-black text-[#F5E6D3] leading-none">{total}</p>
                </div>
                <div className="flex items-end justify-around h-32 gap-2 mt-6 border-b border-[#8B5E3C]/20 pb-1">
                    {stats.slice(0, 5).map((s, i) => (
                        <div key={i} className="flex flex-col items-center justify-end h-full flex-1 group/bar">
                            <div className="w-full relative flex items-end justify-center rounded-t-sm transition-all duration-500 hover:opacity-80" 
                                 style={{ height: `${s.percent}%`, backgroundColor: s.color }}>
                                 <span className="absolute -top-4 text-[9px] font-bold text-[#F5E6D3] opacity-0 group-hover/bar:opacity-100 transition-opacity">{s.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Legend Bar */}
                <div className="flex justify-between px-1">
                     {stats.slice(0, 3).map((s, i) => (
                        <div key={i} className="text-[8px] text-[#8B5E3C] truncate max-w-[50px] text-center">{s.label}</div>
                     ))}
                </div>
            </div>
        );
    }

    // 🟢 RENDER: TRÒN (PIE) HOẶC VÀNH KHUYÊN (DONUT)
    return (
        <div className="flex-1 flex flex-col relative z-10 h-full">
            <div className="absolute top-0 right-0 text-right">
                <p className="text-[10px] text-[#8B5E3C] font-bold uppercase">Tổng</p>
                <p className="text-3xl font-black text-[#F5E6D3] leading-none">{total}</p>
            </div>

            <div className="flex-1 flex items-center justify-center relative mt-2">
                <div className="relative w-28 h-28 rounded-full shadow-2xl border-4 border-[#161210] group-hover:scale-105 transition-transform duration-500" style={pieStyle}>
                    {/* Nếu là Donut thì khoét lỗ to, Pie thì lỗ nhỏ hoặc không */}
                    <div className={`absolute inset-0 m-auto bg-[#161210] rounded-full flex items-center justify-center shadow-inner ${chartType === 'Donut' ? 'w-16 h-16' : 'w-0 h-0'}`}>
                        {chartType === 'Donut' && <Activity className="text-[#8B5E3C] opacity-50" size={20}/>}
                    </div>
                </div>
            </div>

            <div className="mt-auto w-full grid grid-cols-2 gap-x-2 gap-y-1 pt-2 border-t border-[#8B5E3C]/10">
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
}