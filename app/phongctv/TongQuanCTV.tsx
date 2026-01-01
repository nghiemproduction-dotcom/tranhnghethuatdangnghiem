'use client';
import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Trophy, Loader2 } from 'lucide-react';
import { getCTVStatsAction } from '@/app/actions/QuyenHanCTV';

export default function TongQuanCTV() {
    const [stats, setStats] = useState({ total_orders: 0, total_revenue: 0, commission_earned: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await getCTVStatsAction();
            // 🟢 FIX LỖI Ở ĐÂY: Ép kiểu as any để TS không bắt lỗi
            if (res.success && res.data) setStats(res.data as any);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-[#C69C6D]"/></div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card Hoa Hồng */}
                <div className="bg-gradient-to-br from-green-900/40 to-black border border-green-500/30 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign size={80}/></div>
                    <p className="text-green-400 text-xs font-black uppercase tracking-widest mb-1">HOA HỒNG TẠM TÍNH</p>
                    <h2 className="text-3xl font-black text-white">{Number(stats.commission_earned).toLocaleString('vi-VN')} ₫</h2>
                    <p className="text-white/40 text-[10px] mt-2">*Được thanh toán vào ngày 5 hàng tháng</p>
                </div>

                {/* Card Đơn Hàng */}
                <div className="bg-[#111] border border-white/10 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <ShoppingBag className="text-[#C69C6D]" size={20}/>
                        <p className="text-white/60 text-xs font-bold uppercase">Tổng đơn hàng</p>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{stats.total_orders} <span className="text-sm font-normal text-gray-500">đơn</span></h2>
                </div>

                {/* Card Doanh Thu */}
                <div className="bg-[#111] border border-white/10 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="text-yellow-500" size={20}/>
                        <p className="text-white/60 text-xs font-bold uppercase">Tổng doanh số mang về</p>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{Number(stats.total_revenue).toLocaleString('vi-VN')} ₫</h2>
                </div>
            </div>

            {/* Bảng xếp hạng ảo (Gamification) */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
                <h3 className="text-[#C69C6D] text-sm font-bold uppercase mb-4 border-b border-white/10 pb-2">Hạng thành viên: BẠC</h3>
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div className="bg-[#C69C6D] h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="text-xs text-gray-400">Bạn cần thêm 5.000.000đ doanh số để lên hạng VÀNG (Hoa hồng +2%)</p>
            </div>
        </div>
    );
}