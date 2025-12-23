'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { Loader2, BarChart3 } from 'lucide-react';

interface Props {
    onClick: () => void;
}

export default function MSP_Widget({ onClick }: Props) {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Lấy toàn bộ thể loại để đếm
                const { data, error } = await supabase.from('mau_san_pham').select('the_loai');
                
                if (data) {
                    // Logic đếm số lượng theo thể loại (Client-side grouping)
                    const countMap: Record<string, number> = {};
                    data.forEach(item => {
                        const type = item.the_loai || 'Chưa phân loại';
                        countMap[type] = (countMap[type] || 0) + 1;
                    });

                    // Chuyển về mảng để render
                    const statsArray = Object.entries(countMap).map(([name, value]) => ({ name, value }));
                    // Sắp xếp giảm dần
                    statsArray.sort((a, b) => b.value - a.value);
                    setStats(statsArray.slice(0, 5)); // Lấy top 5
                }
            } catch (error) {
                console.error("Lỗi widget:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Tính toán tỷ lệ phần trăm cho thanh biểu đồ
    const maxValue = Math.max(...stats.map(s => s.value), 1);

    return (
        <div onClick={onClick} className="w-full h-full bg-[#110d0c] p-4 flex flex-col cursor-pointer group">
            {/* Header Widget */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-2 text-[#C69C6D]">
                    <BarChart3 size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">Thống Kê Mẫu</span>
                </div>
                {loading && <Loader2 size={14} className="animate-spin text-gray-500"/>}
            </div>

            {/* Chart Area */}
            <div className="flex-1 overflow-y-auto custom-scroll space-y-3">
                {stats.length === 0 && !loading ? (
                    <div className="h-full flex items-center justify-center text-gray-600 text-xs italic">Chưa có dữ liệu</div>
                ) : (
                    stats.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[10px] text-gray-400 uppercase font-bold">
                                <span>{item.name}</span>
                                <span>{item.value}</span>
                            </div>
                            <div className="h-2 w-full bg-[#1a120f] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[#C69C6D] group-hover:bg-[#b08b5e] transition-all duration-500 rounded-full"
                                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {/* Footer Widget */}
            <div className="mt-4 pt-3 border-t border-[#8B5E3C]/20 text-center">
                <span className="text-[10px] text-gray-500 group-hover:text-[#C69C6D] transition-colors uppercase tracking-wider">
                    Nhấp để xem chi tiết
                </span>
            </div>
        </div>
    );
}