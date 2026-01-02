'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import DonHangDetail from './DonHangDetail';

const TRANG_THAI_OPTIONS = [
    { id: 'all', label: 'Tất cả', color: '' },
    { id: 'dang_xu_ly', label: 'Đang xử lý', color: 'bg-yellow-500/20 text-yellow-400' },
    { id: 'hoan_thanh', label: 'Hoàn thành', color: 'bg-green-500/20 text-green-400' },
    { id: 'huy', label: 'Hủy', color: 'bg-red-500/20 text-red-400' },
];

export default function DonHangManager() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
    const [showSortMenu, setShowSortMenu] = useState(false);

    const [showDetail, setShowDetail] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('don_hang')
            .select(`
                *,
                khach_hang:khach_hang_id(ho_ten, so_dien_thoai),
                sales:sales_phu_trach_id(ho_ten)
            `)
            .order('tao_luc', { ascending: false })
            .limit(100);

        if (data) setItems(data);
        setLoading(false);
    };

    const tabs = useMemo(() => {
        const counts: Record<string, number> = { all: items.length };
        items.forEach(item => {
            const status = item.trang_thai || 'dang_xu_ly';
            counts[status] = (counts[status] || 0) + 1;
        });
        return TRANG_THAI_OPTIONS.map(opt => ({
            ...opt,
            count: counts[opt.id] || 0
        }));
    }, [items]);

    const filtered = useMemo(() => {
        const searchLower = search.toLowerCase();
        let result = items.filter(item => {
            const matchSearch =
                (item.ma_don || '').toLowerCase().includes(searchLower) ||
                (item.khach_hang?.ho_ten || '').toLowerCase().includes(searchLower) ||
                (item.khach_hang?.so_dien_thoai || '').includes(searchLower);
            const matchTab = activeTab === 'all' || item.trang_thai === activeTab;
            return matchSearch && matchTab;
        });
        // Sort
        return [...result].sort((a, b) => {
            if (sortBy === 'date') return new Date(b.tao_luc || 0).getTime() - new Date(a.tao_luc || 0).getTime();
            if (sortBy === 'amount') return (b.tong_tien || 0) - (a.tong_tien || 0);
            return 0;
        });
    }, [items, search, activeTab, sortBy]);

    const openDetail = (item: any) => { setSelectedItem(item); setShowDetail(true); };
    const closeDetail = () => { setShowDetail(false); setSelectedItem(null); };

    const getStatusStyle = (status: string) => {
        return TRANG_THAI_OPTIONS.find(o => o.id === status)?.color || 'bg-gray-500/20 text-gray-400';
    };

    if (loading) {
        return <div className="flex-1 flex items-center justify-center text-white/50">Đang tải...</div>;
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Tab bar - cố định */}
            <div className="shrink-0 h-[40px] flex items-center border-b border-white/5 bg-[#0a0a0a]">
                {/* Tabs - cuộn được */}
                <div className="flex-1 flex items-center gap-1 px-2 overflow-x-auto min-w-0 scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`shrink-0 px-3 h-[28px] rounded text-[12px] font-medium transition-all ${
                                activeTab === tab.id
                                    ? 'bg-[#C69C6D] text-black'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                            }`}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>

                {/* Actions - cố định phải */}
                <div className="shrink-0 flex items-center gap-1 px-2 border-l border-white/5 bg-[#0a0a0a]">
                    {/* Search */}
                    {showSearch ? (
                        <div className="flex items-center gap-1 bg-white/5 rounded px-2 h-[28px]">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm..."
                                className="w-[120px] bg-transparent text-[12px] text-white outline-none"
                                autoFocus
                            />
                            <button onClick={() => { setShowSearch(false); setSearch(''); }} className="text-white/40 hover:text-white">
                                <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setShowSearch(true)} className="w-[28px] h-[28px] flex items-center justify-center rounded bg-white/5 text-white/60 hover:bg-white/10">
                            <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    )}

                    {/* Sort */}
                    <div className="relative">
                        <button onClick={() => setShowSortMenu(!showSortMenu)} className="w-[28px] h-[28px] flex items-center justify-center rounded bg-white/5 text-white/60 hover:bg-white/10">
                            <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                            </svg>
                        </button>
                        {showSortMenu && (
                            <div className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded shadow-2xl py-1 z-[100]">
                                {[
                                    { id: 'date', label: 'Mới nhất' },
                                    { id: 'amount', label: 'Tổng tiền' },
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => { setSortBy(opt.id as typeof sortBy); setShowSortMenu(false); }}
                                        className={`w-full px-3 py-1 text-left text-[12px] hover:bg-white/5 whitespace-nowrap ${sortBy === opt.id ? 'text-[#C69C6D]' : 'text-white/70'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Refresh */}
                    <button onClick={fetchData} className="w-[28px] h-[28px] flex items-center justify-center rounded bg-white/5 text-white/60 hover:bg-white/10">
                        <svg className={`w-[14px] h-[14px] ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content - full height còn lại */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {showDetail && selectedItem ? (
                    /* Detail - full width khi mở */
                    <div className="h-full overflow-y-auto">
                        <DonHangDetail
                            isOpen={true}
                            data={selectedItem}
                            onClose={closeDetail}
                        />
                    </div>
                ) : (
                    /* Cards list - ẩn khi mở detail */
                    <div className="h-full overflow-y-auto p-3">
                        {filtered.length === 0 ? (
                            <div className="text-center text-white/40 py-8">Không có đơn hàng nào</div>
                        ) : (
                            <div className="space-y-2">
                                {filtered.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => openDetail(item)}
                                        className="bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-all flex items-center gap-3"
                                    >
                                        {/* Icon */}
                                        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                            item.trang_thai === 'hoan_thanh' ? 'bg-green-500/20' :
                                            item.trang_thai === 'huy' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                                        }`}>
                                            <svg className={`w-5 h-5 ${
                                                item.trang_thai === 'hoan_thanh' ? 'text-green-500' :
                                                item.trang_thai === 'huy' ? 'text-red-500' : 'text-yellow-500'
                                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-bold text-[#C69C6D]">{item.ma_don}</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStatusStyle(item.trang_thai)}`}>
                                                    {TRANG_THAI_OPTIONS.find(o => o.id === item.trang_thai)?.label || 'Đang xử lý'}
                                                </span>
                                            </div>
                                            <div className="text-[12px] text-white truncate mt-0.5">{item.khach_hang?.ho_ten || 'Khách lẻ'}</div>
                                            <div className="text-[10px] text-white/40">{new Date(item.tao_luc).toLocaleDateString('vi-VN')}</div>
                                        </div>

                                        {/* Amount */}
                                        <div className="shrink-0 text-right">
                                            <div className="text-[14px] font-bold text-white">{Number(item.tong_tien).toLocaleString('vi-VN')}₫</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
