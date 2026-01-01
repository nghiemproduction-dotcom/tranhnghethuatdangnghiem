'use client';
import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Package, Users, Activity, TrendingUp, Loader2 } from 'lucide-react';
import { getAdminDashboardStats, getRecentActivities } from '@/app/actions/QuyenHanBaoCao';

export default function DashboardTongQuan() {
    const [stats, setStats] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [resStats, resAct] = await Promise.all([
                    getAdminDashboardStats(),
                    getRecentActivities()
                ]);

                if (resStats.success) {
                    // 🟢 FIX LỖI: Ép kiểu as any để tránh lỗi TypeScript
                    setStats(resStats.data as any);
                }
                
                if (resAct.success) {
                    // 🟢 FIX LỖI: Ép kiểu as any[] và fallback mảng rỗng
                    setActivities((resAct.data || []) as any[]);
                }
            } catch (error) {
                console.error("Dashboard Load Error:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#C69C6D]" size={40}/></div>;

    return (
        <div className="p-6 h-full overflow-y-auto custom-scrollbar space-y-6">
            
            {/* 1. KEY METRICS (4 Thẻ bài quyền lực) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="DOANH THU THÁNG" 
                    value={stats?.revenueMonth || 0} 
                    icon={DollarSign} 
                    color="text-green-500" 
                    bgColor="bg-green-900/20" 
                    borderColor="border-green-500/30"
                    isMoney
                />
                <StatCard 
                    title="ĐƠN HÀNG HÔM NAY" 
                    value={stats?.ordersToday || 0} 
                    icon={ShoppingCart} 
                    color="text-[#C69C6D]" 
                    bgColor="bg-[#C69C6D]/10" 
                    borderColor="border-[#C69C6D]/30"
                />
                <StatCard 
                    title="GIÁ TRỊ TỒN KHO" 
                    value={stats?.inventoryValue || 0} 
                    icon={Package} 
                    color="text-blue-400" 
                    bgColor="bg-blue-900/20" 
                    borderColor="border-blue-500/30"
                    isMoney
                />
                <StatCard 
                    title="LƯƠNG PHẢI TRẢ" 
                    value={stats?.salaryPending || 0} 
                    icon={Users} 
                    color="text-red-400" 
                    bgColor="bg-red-900/20" 
                    borderColor="border-red-500/30"
                    isMoney
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 2. HOẠT ĐỘNG GẦN ĐÂY (Live Feed) */}
                <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-[#C69C6D] font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Activity size={18}/> Hoạt động gần đây
                    </h3>
                    <div className="space-y-4">
                        {activities.length === 0 ? (
                            <p className="text-white/30 text-sm italic text-center py-4">Chưa có hoạt động nào</p>
                        ) : (
                            activities.map((act, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-[#C69C6D]/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${act.type === 'don_hang' ? 'bg-blue-500/20 text-blue-400' : act.type === 'san_xuat' ? 'bg-[#C69C6D]/20 text-[#C69C6D]' : 'bg-green-500/20 text-green-400'}`}>
                                            {act.type === 'don_hang' ? <ShoppingCart size={16}/> : act.type === 'san_xuat' ? <Package size={16}/> : <TrendingUp size={16}/>}
                                        </div>
                                        <div>
                                            <p className="text-white text-xs font-bold">{act.content}</p>
                                            <p className="text-white/40 text-[10px] font-mono">{act.ref}</p>
                                        </div>
                                    </div>
                                    <span className="text-white/30 text-[10px]">{new Date(act.tao_luc).toLocaleTimeString('vi-VN')}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 3. LỐI TẮT QUẢN TRỊ (Quick Actions) */}
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Lối tắt</h3>
                    <div className="space-y-2">
                        <QuickBtn label="Cấu hình hệ thống" />
                        <QuickBtn label="Phân quyền nhân sự" />
                        <QuickBtn label="Xem báo cáo chi tiết" />
                        <QuickBtn label="Xuất dữ liệu Excel" />
                    </div>
                    
                    <div className="mt-8 p-4 bg-gradient-to-br from-[#C69C6D]/20 to-black rounded-xl border border-[#C69C6D]/30">
                        <p className="text-[#C69C6D] text-xs font-bold uppercase mb-1">Mục tiêu tháng</p>
                        <div className="w-full bg-black/50 h-2 rounded-full mb-1">
                            <div className="bg-[#C69C6D] h-2 rounded-full" style={{width: '65%'}}></div>
                        </div>
                        <p className="text-right text-white text-[10px]">Đạt 65%</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bgColor, borderColor, isMoney }: any) {
    return (
        <div className={`p-5 rounded-2xl border ${borderColor} ${bgColor} flex items-center justify-between`}>
            <div>
                <p className={`text-[10px] font-black uppercase tracking-wider mb-1 opacity-70 ${color}`}>{title}</p>
                <h2 className={`text-2xl font-black ${color}`}>
                    {isMoney ? Number(value).toLocaleString('vi-VN') + '₫' : value}
                </h2>
            </div>
            <div className={`p-3 rounded-xl bg-black/20 ${color}`}>
                <Icon size={24} />
            </div>
        </div>
    );
}

function QuickBtn({ label }: any) {
    return (
        <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#C69C6D]/50 rounded-xl text-left text-xs font-bold text-white/70 hover:text-white transition-all">
            {label}
        </button>
    );
}