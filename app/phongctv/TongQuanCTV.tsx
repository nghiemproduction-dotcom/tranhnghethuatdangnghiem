'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { DollarSign, ShoppingBag, Trophy, Loader2, Search, TrendingUp, Award, RefreshCw } from 'lucide-react';
import { getCTVStatsAction } from '@/app/actions/QuyenHanCTV';

export default function TongQuanCTV() {
    const [stats, setStats] = useState({ total_orders: 0, total_revenue: 0, commission_earned: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        const res = await getCTVStatsAction();
        if (res.success && res.data) setStats(res.data as any);
        setLoading(false);
    };

    // Tabs config
    const tabs = useMemo(() => [
        { id: 'overview', label: 'TỔNG QUAN', count: 3 },
        { id: 'ranking', label: 'XẾP HẠNG', count: 1 },
    ], []);

    return (
        <div className="w-full h-full flex flex-col bg-[#050505] overflow-hidden relative">
            {/* TAB LIST + SEARCH (gộp 1 thanh) */}
            <div className="shrink-0 px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-white/5 bg-[#0a0a0a]">
                <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
                {/* Tabs */}
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all flex items-center gap-1 ${activeTab === tab.id ? 'text-[#C69C6D] border-[#C69C6D]' : 'text-gray-500 border-transparent hover:text-white'}`}>
                        {tab.label} <span className={`px-1 py-0.5 rounded text-[8px] ${activeTab === tab.id ? 'bg-[#C69C6D] text-black' : 'bg-white/10 text-gray-400'}`}>{tab.count}</span>
                    </button>
                ))}
                
                {/* Spacer */}
                <div className="flex-1 min-w-4" />
                
                {/* Search + Refresh */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="relative group">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#C69C6D] transition-colors" size={14} />
                        <input 
                            type="text" 
                            placeholder="Tìm..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-28 md:w-36 bg-white/5 border border-white/10 rounded-lg pl-7 pr-2 py-1.5 text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#C69C6D] font-bold uppercase transition-all"
                        />
                    </div>
                    <button 
                        onClick={loadData} 
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg transition-all active:scale-95"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""}/> 
                    </button>
                </div>
            </div>

            {/* CARD GRID */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#050505] scrollbar-hide">
                {loading ? (
                    <div className="h-full flex items-center justify-center flex-col">
                        <Loader2 className="animate-spin text-[#C69C6D] mb-4" size={32} />
                        <p className="text-[#C69C6D]/50 text-xs uppercase tracking-[0.2em] animate-pulse">ĐANG TẢI...</p>
                    </div>
                ) : activeTab === 'overview' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                        {/* Card Hoa Hồng */}
                        <div className="group relative bg-[#0f0f0f] border border-white/5 rounded-xl p-5 transition-all hover:border-[#C69C6D]/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign size={80}/></div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full border border-green-500/30 bg-green-900/20 flex items-center justify-center group-hover:border-green-500 transition-colors">
                                    <DollarSign size={20} className="text-green-500"/>
                                </div>
                                <div>
                                    <p className="text-[10px] text-green-400 font-bold uppercase">HOA HỒNG TẠM TÍNH</p>
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-white group-hover:text-green-400 transition-colors">{Number(stats.commission_earned).toLocaleString('vi-VN')} ₫</h2>
                            <p className="text-white/30 text-[10px] mt-2">*Thanh toán vào ngày 5 hàng tháng</p>
                        </div>

                        {/* Card Đơn Hàng */}
                        <div className="group relative bg-[#0f0f0f] border border-white/5 rounded-xl p-5 transition-all hover:border-[#C69C6D]/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full border border-[#C69C6D]/30 bg-[#C69C6D]/10 flex items-center justify-center group-hover:border-[#C69C6D] transition-colors">
                                    <ShoppingBag size={20} className="text-[#C69C6D]"/>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#C69C6D] font-bold uppercase">TỔNG ĐƠN HÀNG</p>
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-white group-hover:text-[#C69C6D] transition-colors">{stats.total_orders} <span className="text-sm font-normal text-gray-500">đơn</span></h2>
                        </div>

                        {/* Card Doanh Thu */}
                        <div className="group relative bg-[#0f0f0f] border border-white/5 rounded-xl p-5 transition-all hover:border-[#C69C6D]/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full border border-yellow-500/30 bg-yellow-900/20 flex items-center justify-center group-hover:border-yellow-500 transition-colors">
                                    <Trophy size={20} className="text-yellow-500"/>
                                </div>
                                <div>
                                    <p className="text-[10px] text-yellow-500 font-bold uppercase">TỔNG DOANH SỐ</p>
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-white group-hover:text-yellow-400 transition-colors">{Number(stats.total_revenue).toLocaleString('vi-VN')} ₫</h2>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 pb-20">
                        {/* Bảng xếp hạng */}
                        <div className="group relative bg-[#0f0f0f] border border-white/5 rounded-xl p-5 transition-all hover:border-[#C69C6D]/50">
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                                <div className="w-12 h-12 rounded-full border border-[#C69C6D]/30 bg-[#C69C6D]/10 flex items-center justify-center">
                                    <Award size={20} className="text-[#C69C6D]"/>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm uppercase">Hạng thành viên: BẠC</h3>
                                    <p className="text-[10px] text-white/40">Cấp độ hiện tại của bạn</p>
                                </div>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-3 mb-3">
                                <div className="bg-gradient-to-r from-[#C69C6D] to-yellow-500 h-3 rounded-full transition-all" style={{ width: '45%' }}></div>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/40">Tiến độ: <b className="text-[#C69C6D]">45%</b></span>
                                <span className="text-white/40">Còn thiếu: <b className="text-white">5,000,000₫</b></span>
                            </div>
                            <p className="text-[10px] text-white/30 mt-3 italic">Đạt hạng VÀNG để được tăng +2% hoa hồng</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}