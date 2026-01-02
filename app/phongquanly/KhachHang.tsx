'use client';

import { useState, useEffect, useMemo } from 'react';
import { getKhachHangDataAction, deleteKhachHangAction, updateKhachHangAction } from '@/app/actions/QuyenHanQuanLy';
import KhachHangDetail from './KhachHangDetail';
import FormKhachHang from './FormKhachHang';
import ConfirmDialog from '../components/ConfirmDialog';

const PHAN_LOAI_OPTIONS = [
    { value: 'tiem_nang', label: 'Tiềm năng', color: 'bg-blue-500/20 text-blue-400' },
    { value: 'moi', label: 'Mới', color: 'bg-green-500/20 text-green-400' },
    { value: 'than_thiet', label: 'Thân thiết', color: 'bg-purple-500/20 text-purple-400' },
    { value: 'vip', label: 'VIP', color: 'bg-yellow-500/20 text-yellow-400' },
    { value: 'khong_hoat_dong', label: 'Không hoạt động', color: 'bg-gray-500/20 text-gray-400' },
];

interface Props {
    allowDelete?: boolean;
}

export default function KhachHangManager({ allowDelete = false }: Props) {
    const [khachHangs, setKhachHangs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'orders'>('name');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [bulkMode, setBulkMode] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    
    const [showDetail, setShowDetail] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedKhachHang, setSelectedKhachHang] = useState<any>(null);
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; ids: string[] }>({ show: false, ids: [] });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getKhachHangDataAction(1, 1000, '', '');
            if (res.success && res.data) setKhachHangs(res.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    // Tabs theo phân loại
    const tabs = useMemo(() => {
        const counts: Record<string, number> = { all: khachHangs.length };
        PHAN_LOAI_OPTIONS.forEach(opt => {
            counts[opt.value] = khachHangs.filter((k: any) => k.phan_loai === opt.value).length;
        });
        return [
            { id: 'all', label: 'Tất cả', count: counts.all },
            ...PHAN_LOAI_OPTIONS.map(opt => ({
                id: opt.value,
                label: opt.label,
                count: counts[opt.value] || 0
            }))
        ];
    }, [khachHangs]);

    // Lọc danh sách
    const filtered = useMemo(() => {
        let result = khachHangs;
        if (activeTab !== 'all') {
            result = result.filter((k: any) => k.phan_loai === activeTab);
        }
        if (search) {
            const s = search.toLowerCase();
            result = result.filter((k: any) =>
                k.ho_ten?.toLowerCase().includes(s) ||
                k.so_dien_thoai?.includes(s) ||
                k.email?.toLowerCase().includes(s)
            );
        }
        // Sort
        return [...result].sort((a: any, b: any) => {
            if (sortBy === 'name') return (a.ho_ten || '').localeCompare(b.ho_ten || '');
            if (sortBy === 'date') return new Date(b.tao_luc || 0).getTime() - new Date(a.tao_luc || 0).getTime();
            if (sortBy === 'orders') return (b.tong_don_hang || 0) - (a.tong_don_hang || 0);
            return 0;
        });
    }, [khachHangs, activeTab, search, sortBy]);

    // Bulk actions
    const toggleSelect = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };
    const selectAll = () => setSelected(filtered.map((k: any) => k.id));
    const clearSelection = () => setSelected([]);

    const handleBulkDelete = () => {
        if (selected.length === 0) return;
        setConfirmDelete({ show: true, ids: selected });
    };

    const handleBulkUpdateCategory = async (phanLoai: string) => {
        for (const id of selected) {
            await updateKhachHangAction(id, { phan_loai: phanLoai });
        }
        fetchData();
        setSelected([]);
        setShowCategoryMenu(false);
    };

    const confirmDeleteAction = async () => {
        for (const id of confirmDelete.ids) {
            await deleteKhachHangAction(id);
        }
        fetchData();
        setConfirmDelete({ show: false, ids: [] });
        setSelected([]);
    };

    // Mở detail
    const openDetail = (kh: any) => {
        setSelectedKhachHang(kh);
        setShowDetail(true);
    };

    // Mở form
    const openForm = (kh: any = null) => {
        setSelectedKhachHang(kh);
        setShowForm(true);
    };

    // Đóng detail
    const closeDetail = () => {
        setShowDetail(false);
        setSelectedKhachHang(null);
    };

    // Đóng form
    const closeForm = () => {
        setShowForm(false);
        setSelectedKhachHang(null);
    };

    const getPhanLoaiStyle = (phanLoai: string) => {
        return PHAN_LOAI_OPTIONS.find(o => o.value === phanLoai)?.color || 'bg-gray-500/20 text-gray-400';
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
                                    { id: 'name', label: 'Theo tên' },
                                    { id: 'date', label: 'Mới nhất' },
                                    { id: 'orders', label: 'Đơn hàng' },
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

                    {/* Bulk mode */}
                    <button
                        onClick={() => { setBulkMode(!bulkMode); setSelected([]); }}
                        className={`w-[28px] h-[28px] flex items-center justify-center rounded ${bulkMode ? 'bg-[#C69C6D] text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                    >
                        <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </button>

                    {/* Add */}
                    <button onClick={() => openForm(null)} className="w-[28px] h-[28px] flex items-center justify-center rounded bg-[#C69C6D] text-black hover:bg-[#b8956a]">
                        <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Bulk actions bar */}
            {bulkMode && selected.length > 0 && (
                <div className="shrink-0 h-[36px] flex items-center gap-2 px-3 bg-[#C69C6D]/10 border-b border-[#C69C6D]/20">
                    <span className="text-[12px] text-[#C69C6D]">Đã chọn {selected.length}</span>
                    <button onClick={selectAll} className="text-[11px] text-white/60 hover:text-white">Chọn tất cả</button>
                    <button onClick={clearSelection} className="text-[11px] text-white/60 hover:text-white">Bỏ chọn</button>
                    <div className="flex-1" />
                    {/* Category update */}
                    <div className="relative">
                        <button onClick={() => setShowCategoryMenu(!showCategoryMenu)} className="px-2 py-1 text-[11px] bg-white/10 rounded text-white/70 hover:bg-white/20">
                            Đổi phân loại
                        </button>
                        {showCategoryMenu && (
                            <div className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded shadow-2xl py-1 z-[100]">
                                {PHAN_LOAI_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleBulkUpdateCategory(opt.value)}
                                        className="w-full px-3 py-1 text-left text-[12px] text-white/70 hover:bg-white/5"
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {allowDelete && (
                        <button onClick={handleBulkDelete} className="px-2 py-1 text-[11px] bg-red-500/20 rounded text-red-400 hover:bg-red-500/30">
                            Xóa
                        </button>
                    )}
                </div>
            )}

            {/* Content - full height còn lại */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {showDetail && selectedKhachHang ? (
                    /* Detail - full width khi mở */
                    <div className="h-full overflow-y-auto">
                        <KhachHangDetail
                            data={selectedKhachHang}
                            isOpen={true}
                            onClose={closeDetail}
                            onEdit={() => { closeDetail(); openForm(selectedKhachHang); }}
                            allowDelete={allowDelete}
                            onDelete={(id: string) => {
                                setConfirmDelete({ show: true, ids: [id] });
                            }}
                        />
                    </div>
                ) : (
                    /* Cards grid - ẩn khi mở detail */
                    <div className="h-full overflow-y-auto p-3">
                        {filtered.length === 0 ? (
                            <div className="text-center text-white/40 py-8">Không có khách hàng nào</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                                {filtered.map((kh: any) => (
                                    <div
                                        key={kh.id}
                                        onClick={() => bulkMode ? toggleSelect(kh.id) : openDetail(kh)}
                                        className={`relative bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-all ${
                                            bulkMode && selected.includes(kh.id) ? 'ring-2 ring-[#C69C6D]' : ''
                                        }`}
                                    >
                                        {/* Checkbox khi bulk mode */}
                                        {bulkMode && (
                                            <div className={`absolute top-2 right-2 w-4 h-4 rounded border ${
                                                selected.includes(kh.id) ? 'bg-[#C69C6D] border-[#C69C6D]' : 'border-white/30'
                                            } flex items-center justify-center`}>
                                                {selected.includes(kh.id) && (
                                                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        )}

                                        {/* VIP badge */}
                                        {kh.phan_loai === 'vip' && (
                                            <div className="absolute top-2 left-2">
                                                <span className="text-yellow-400 text-[10px]">⭐ VIP</span>
                                            </div>
                                        )}

                                        {/* Avatar */}
                                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#C69C6D] to-[#8B6914] flex items-center justify-center text-white font-bold text-lg">
                                            {kh.ho_ten?.charAt(0) || '?'}
                                        </div>

                                        {/* Info */}
                                        <div className="text-center">
                                            <div className="text-[13px] font-medium text-white truncate">{kh.ho_ten || 'Chưa có tên'}</div>
                                            <div className="text-[11px] text-white/50 truncate">{kh.so_dien_thoai || 'Chưa có SĐT'}</div>
                                            <div className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] ${getPhanLoaiStyle(kh.phan_loai || '')}`}>
                                                {PHAN_LOAI_OPTIONS.find(o => o.value === kh.phan_loai)?.label || 'Chưa phân loại'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Form modal */}
            {showForm && (
                <FormKhachHang
                    isOpen={showForm}
                    onClose={closeForm}
                    initialData={selectedKhachHang}
                    onSuccess={() => { fetchData(); closeForm(); }}
                />
            )}

            {/* Confirm delete dialog */}
            <ConfirmDialog
                isOpen={confirmDelete.show}
                title="Xác nhận xóa"
                message={`Bạn có chắc muốn xóa ${confirmDelete.ids.length} khách hàng?`}
                onConfirm={confirmDeleteAction}
                onCancel={() => setConfirmDelete({ show: false, ids: [] })}
            />
        </div>
    );
}
