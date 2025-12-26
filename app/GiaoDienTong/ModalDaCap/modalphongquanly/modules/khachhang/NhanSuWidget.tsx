'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { PieChart, Loader2, Users } from 'lucide-react';

interface Props {
    onClick: () => void;
}

export default function NhanSuWidget({ onClick }: Props) {
    const [stats, setStats] = useState<{label: string, value: number, color: string}[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#C69C6D', '#8B5E3C', '#5D4037', '#A1887F', '#3E2723', '#D7CCC8'];

    useEffect(() => {
        const fetchData = async () => {
            // Lấy cột vi_tri của tất cả nhân sự
            const { data, error } = await supabase.from('nhan_su').select('vi_tri');
            if (!error && data) {
                const counts: Record<string, number> = {};
                data.forEach(item => {
                    const pos = item.vi_tri || 'Chưa phân loại';
                    counts[pos] = (counts[pos] || 0) + 1;
                });

                const formatted = Object.entries(counts).map(([label, value], index) => ({
                    label,
                    value,
                    color: COLORS[index % COLORS.length]
                })).sort((a, b) => b.value - a.value); // Xếp từ cao xuống thấp

                setStats(formatted);
                setTotal(data.length);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // Tính toán vẽ Pie Chart SVG
    let cumulativePercent = 0;

    return (
        <div 
            onClick={onClick}
            className="w-full h-full bg-[#110d0c] border border-[#8B5E3C]/30 rounded-2xl p-5 cursor-pointer group hover:border-[#C69C6D] hover:shadow-[0_0_20px_rgba(198,156,109,0.15)] transition-all duration-300 flex flex-col relative overflow-hidden"
        >
            {/* Header Widget */}
            <div className="flex justify-between items-start mb-4 z-10">
                <div className="flex items-center gap-2 text-[#C69C6D]">
                    <Users size={18} />
                    <span className="text-sm font-bold uppercase tracking-wider">Nhân Sự</span>
                </div>
                <span className="text-2xl font-black text-[#F5E6D3]">{total}</span>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-[#8B5E3C]"><Loader2 className="animate-spin"/></div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                    {/* VẼ BIỂU ĐỒ TRÒN BẰNG SVG (CONIC GRADIENT) */}
                    <div className="relative w-32 h-32 rounded-full shadow-xl transition-transform duration-500 group-hover:scale-105"
                        style={{
                            background: `conic-gradient(${stats.map(s => {
                                const start = cumulativePercent;
                                const percent = (s.value / total) * 100;
                                cumulativePercent += percent;
                                return `${s.color} ${start}% ${cumulativePercent}%`;
                            }).join(', ')})`
                        }}
                    >
                        <div className="absolute inset-2 bg-[#110d0c] rounded-full flex items-center justify-center flex-col">
                            <PieChart size={24} className="text-[#8B5E3C] opacity-50"/>
                        </div>
                    </div>

                    {/* Chú thích (Legend) */}
                    <div className="mt-4 w-full grid grid-cols-2 gap-x-2 gap-y-1">
                        {stats.slice(0, 4).map((s, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[10px]">
                                <span className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></span>
                                <span className="text-[#A1887F] truncate flex-1">{s.label}</span>
                                <span className="text-[#F5E6D3] font-bold">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Background Decor */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#C69C6D] blur-[80px] opacity-10 rounded-full group-hover:opacity-20 transition-opacity"></div>
        </div>
    );
}