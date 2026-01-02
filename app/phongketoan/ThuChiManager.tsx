'use client';

import { useState, useEffect, useMemo } from 'react';
import { getThuChiDataAction, deleteThuChiAction } from '@/app/actions/QuyenHanKeToan';
import FormThuChi from './FormThuChi';
import ThuChiDetail from './ThuChiDetail';

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

export default function ThuChiManager() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
    const [showSortMenu, setShowSortMenu] = useState(false);
    
    const [showDetail, setShowDetail] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getThuChiDataAction(1, 1000, '', '');
            if (res.success && res.data) setItems(res.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    // Tabs config
    const tabs = useMemo(() => {
        const counts: Record<string, number> = { all: items.length, thu: 0, chi: 0 };
        items.forEach(item => {
            if (item.loai_giao_dich === 'thu') counts.thu++;
            if (item.loai_giao_dich === 'chi') counts.chi++;
        });
        return [
            { id: 'all', label: 'Tất cả', count: counts.all },
            { id: 'thu', label: 'Thu', count: counts.thu },
            { id: 'chi', label: 'Chi', count: counts.chi },
        ];
    }, [items]);

    const filtered = useMemo(() => {
        const normalizedSearch = toNonAccentVietnamese(search);
        let result = items.filter(item => {
            const moTa = toNonAccentVietnamese(item.mo_ta || '');
            const matchSearch = moTa.includes(normalizedSearch);
            const matchTab = activeTab === 'all' || item.loai_giao_dich === activeTab;
            return matchSearch && matchTab;
        });
        // Sort
        return [...result].sort((a, b) => {
            if (sortBy === 'date') return new Date(b.tao_luc || 0).getTime() - new Date(a.tao_luc || 0).getTime();
            if (sortBy === 'amount') return Math.abs(b.so_tien || 0) - Math.abs(a.so_tien || 0);
            return 0;
        });
    }, [items, search, activeTab, sortBy]);

    const openDetail = (item: any) => { setSelectedItem(item); setShowDetail(true); };
    const closeDetail = () => { setShowDetail(false); setSelectedItem(null); };
    const openForm = (item: any = null) => { setSelectedItem(item); setShowForm(true); };
    const closeForm = () => { setShowForm(false); setSelectedItem(null); };

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
                                    { id: 'amount', label: 'Số tiền' },
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

                    {/* Add */}
                    <button onClick={() => openForm()} className="w-[28px] h-[28px] flex items-center justify-center rounded bg-[#C69C6D] text-black hover:bg-[#b8956a]">
                        <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content - full height còn lại */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {showDetail && selectedItem ? (
                    /* Detail - full width khi mở */
                    <div className="h-full overflow-y-auto">
                        <ThuChiDetail
                            isOpen={true}
                            data={selectedItem}
                            onClose={closeDetail}
                            onEdit={() => { closeDetail(); openForm(selectedItem); }}
                            onDelete={async (id: string) => {
                                const res = await deleteThuChiAction(id);
                                if (res.success) { fetchData(); closeDetail(); }
                                else alert(res.error);
                            }}
                        />
                    </div>
                ) : (
                    /* Cards grid - ẩn khi mở detail */
                    <div className="h-full overflow-y-auto p-3">
                        {filtered.length === 0 ? (
                            <div className="text-center text-white/40 py-8">Không có giao dịch nào</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {filtered.map(item => {
                                    const isThu = item.loai_giao_dich === 'thu';
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => openDetail(item)}
                                            className="bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-all flex items-center gap-3"
                                        >
                                            {/* Icon */}
                                            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isThu ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                                <svg className={`w-5 h-5 ${isThu ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {isThu ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                                    )}
                                                </svg>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[13px] font-medium text-white truncate">{item.mo_ta || 'Không có mô tả'}</div>
                                                <div className="text-[11px] text-white/50">{new Date(item.tao_luc).toLocaleDateString('vi-VN')}</div>
                                            </div>

                                            {/* Amount */}
                                            <div className={`shrink-0 text-[13px] font-bold ${isThu ? 'text-green-500' : 'text-red-500'}`}>
                                                {isThu ? '+' : '-'}{Number(item.so_tien).toLocaleString('vi-VN')}₫
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Form modal */}
            {showForm && (
                <FormThuChi
                    isOpen={showForm}
                    onClose={closeForm}
                    initialData={selectedItem}
                    onSuccess={() => { fetchData(); closeForm(); }}
                />
            )}
        </div>
    );
}
