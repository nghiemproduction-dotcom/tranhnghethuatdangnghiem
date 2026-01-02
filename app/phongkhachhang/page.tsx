'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/app/ThuVien/UserContext';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { 
    Package, Clock, CheckCircle, Truck, User, LogOut,
    ShoppingBag, Search, Loader2, MoreHorizontal, Eye
} from 'lucide-react';
import KhungTrangChuan from '@/app/components/KhungTrangChuan';
import ThanhPhongChucNang from '@/app/components/ThanhPhongChucNang';

const KHACH_FUNCTIONS = [
    { id: 'donhang', label: 'ĐƠN HÀNG CỦA TÔI', icon: ShoppingBag },
];

// 🟢 HÀM HỖ TRỢ TÌM KIẾM THÔNG MINH
const toNonAccentVietnamese = (str: string) => {
    if (!str) return '';
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return str;
};

export default function PhongKhachHangPage() {
    const { user: contextUser, loading: contextLoading } = useUser();
    const [authLoading, setAuthLoading] = useState(true);
    const [activeFunction, setActiveFunction] = useState<string>('donhang');

    // Data states
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => { if (!contextLoading) setAuthLoading(false); }, [contextLoading]);

    useEffect(() => {
        if (!authLoading && contextUser) fetchOrders();
    }, [authLoading, contextUser]);

    const fetchOrders = async () => {
        if (!contextUser) return;
        setLoading(true);
        const { data } = await supabase
            .from('don_hang')
            .select(`*, don_hang_chi_tiet ( ten_item_hien_thi, so_luong, don_gia, thanh_tien )`)
            .eq('khach_hang_id', contextUser.id)
            .order('tao_luc', { ascending: false });
        if (data) setOrders(data);
        setLoading(false);
    };

    // Tabs config
    const tabs = useMemo(() => {
        const counts: Record<string, number> = { all: orders.length };
        orders.forEach(o => {
            const status = o.trang_thai || 'moi';
            counts[status] = (counts[status] || 0) + 1;
        });
        return [
            { id: 'all', label: 'TẤT CẢ', count: counts.all },
            { id: 'moi', label: 'MỚI ĐẶT', count: counts.moi || 0 },
            { id: 'dang_xu_ly', label: 'ĐANG XỬ LÝ', count: counts.dang_xu_ly || 0 },
            { id: 'hoan_thanh', label: 'HOÀN THÀNH', count: counts.hoan_thanh || 0 },
        ];
    }, [orders]);

    // Filter logic
    const filteredList = useMemo(() => {
        const normalizedSearch = toNonAccentVietnamese(searchTerm);
        return orders.filter(order => {
            const maDon = (order.ma_don || '').toLowerCase();
            const matchSearch = maDon.includes(normalizedSearch);
            const matchTab = activeTab === 'all' || order.trang_thai === activeTab;
            return matchSearch && matchTab;
        });
    }, [orders, searchTerm, activeTab]);

    if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-16 h-16 border-4 border-[#C69C6D] border-t-transparent rounded-full animate-spin"></div></div>;

    let displayUser = contextUser;
    if (!displayUser && typeof window !== 'undefined') {
        try { const stored = localStorage.getItem('USER_INFO'); displayUser = stored ? JSON.parse(stored) : null; } catch (e) { displayUser = null; }
    }

    const getStatusBadge = (status: string) => {
        const map: any = {
            'moi': { color: 'bg-blue-500/20 text-blue-500', label: 'MỚI ĐẶT' },
            'dang_xu_ly': { color: 'bg-yellow-500/20 text-yellow-500', label: 'ĐANG XỬ LÝ' },
            'dang_san_xuat': { color: 'bg-purple-500/20 text-purple-500', label: 'ĐANG VẼ' },
            'hoan_thanh': { color: 'bg-green-500/20 text-green-500', label: 'HOÀN THÀNH' },
            'huy': { color: 'bg-red-500/20 text-red-500', label: 'ĐÃ HỦY' },
        };
        const s = map[status] || map['moi'];
        return <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${s.color}`}>{s.label}</span>;
    };

    return (
        <KhungTrangChuan nguoiDung={displayUser} loiChao="KHU VỰC KHÁCH HÀNG" contentClassName="flex flex-col h-screen pt-[70px] pb-0 px-0 overflow-hidden bg-[#050505]">
            {/* Compact Header with ThanhPhongChucNang */}
            <ThanhPhongChucNang
                tenPhong="PHÒNG KHÁCH"
                functions={KHACH_FUNCTIONS}
                activeFunction={activeFunction}
                onFunctionChange={setActiveFunction}
            />

            {/* Content Area */}
            <div className="flex-1 w-full relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-[#050505]">
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none"></div>
                <div className="absolute inset-0 z-10">
                    <div className="w-full h-full flex flex-col relative">
                        {/* COMPACT TAB + SEARCH ROW */}
                        <div className="shrink-0 px-4 py-2 flex items-center justify-between gap-3 bg-[#0a0a0a] border-b border-white/10">
                            {/* Tabs on left */}
                            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                                {tabs.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 px-2 py-1.5 rounded ${activeTab === tab.id ? 'text-[#C69C6D] bg-[#C69C6D]/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                                        {tab.label} <span className={`px-1 py-0.5 rounded text-[9px] ${activeTab === tab.id ? 'bg-[#C69C6D] text-black' : 'bg-white/10 text-gray-400'}`}>{tab.count}</span>
                                    </button>
                                ))}
                            </div>
                            {/* Search on right */}
                            <div className="relative group w-48 shrink-0">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#C69C6D] transition-colors" size={14} />
                                <input 
                                    type="text" 
                                    placeholder="Tìm mã đơn..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-2 py-1.5 text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#C69C6D] font-bold uppercase transition-all"
                                />
                            </div>
                        </div>

                        {/* CARD GRID */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#050505] scrollbar-hide">
                            {loading ? (
                                <div className="h-full flex items-center justify-center flex-col">
                                    <Loader2 className="animate-spin text-[#C69C6D] mb-4" size={32} />
                                    <p className="text-[#C69C6D]/50 text-xs uppercase tracking-[0.2em] animate-pulse">ĐANG TẢI...</p>
                                </div>
                            ) : filteredList.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-white/20">
                                    <ShoppingBag size={48} className="mb-4 opacity-20" />
                                    <p className="text-xs uppercase tracking-widest font-bold">BẠN CHƯA CÓ ĐƠN HÀNG NÀO</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                                    {filteredList.map((order, idx) => (
                                        <div 
                                            key={order.id} 
                                            onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                                            className={`group relative bg-[#0f0f0f] border rounded-xl p-4 transition-all cursor-pointer overflow-hidden ${selectedOrder?.id === order.id ? 'border-[#C69C6D] bg-[#C69C6D]/5' : 'border-white/5 hover:border-[#C69C6D]/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]'}`}
                                        >
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`relative shrink-0 w-12 h-12 rounded-full border p-0.5 bg-black flex items-center justify-center ${order.trang_thai === 'hoan_thanh' ? 'border-green-500' : 'border-white/10 group-hover:border-[#C69C6D]'} transition-colors`}>
                                                        <ShoppingBag size={20} className={order.trang_thai === 'hoan_thanh' ? 'text-green-500' : 'text-white/40'}/>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-[#C69C6D] font-black text-sm mb-1">#{order.ma_don}</h3>
                                                        <p className="text-[10px] text-white/40">{new Date(order.tao_luc).toLocaleDateString('vi-VN')}</p>
                                                    </div>
                                                </div>
                                                {getStatusBadge(order.trang_thai)}
                                            </div>

                                            {/* Total */}
                                            <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/5">
                                                <span className="text-xs text-white/50">Tổng tiền</span>
                                                <span className="font-mono font-bold text-white">{Number(order.tong_tien).toLocaleString('vi-VN')}₫</span>
                                            </div>

                                            {/* Items Preview */}
                                            <div className="space-y-2">
                                                {(order.don_hang_chi_tiet || []).slice(0, 2).map((item: any, i: number) => (
                                                    <div key={i} className="flex justify-between text-xs">
                                                        <span className="text-white/70 truncate flex-1">{item.ten_item_hien_thi}</span>
                                                        <span className="text-white/40 ml-2">x{item.so_luong}</span>
                                                    </div>
                                                ))}
                                                {(order.don_hang_chi_tiet || []).length > 2 && (
                                                    <p className="text-[10px] text-[#C69C6D]">+{order.don_hang_chi_tiet.length - 2} sản phẩm khác</p>
                                                )}
                                            </div>

                                            {/* Expanded Detail */}
                                            {selectedOrder?.id === order.id && (
                                                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                                                    <h4 className="text-xs font-bold text-white/60 uppercase">Chi tiết đơn hàng</h4>
                                                    {(order.don_hang_chi_tiet || []).map((item: any, i: number) => (
                                                        <div key={i} className="flex justify-between items-center text-sm bg-black/30 p-2 rounded-lg">
                                                            <div>
                                                                <p className="text-white font-bold">{item.ten_item_hien_thi}</p>
                                                                <p className="text-[10px] text-white/40">x{item.so_luong} × {Number(item.don_gia).toLocaleString('vi-VN')}₫</p>
                                                            </div>
                                                            <span className="font-mono text-[#C69C6D]">{Number(item.thanh_tien).toLocaleString('vi-VN')}₫</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </KhungTrangChuan>
    );
}