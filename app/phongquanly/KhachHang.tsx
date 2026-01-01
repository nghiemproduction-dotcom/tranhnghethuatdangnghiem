'use client';
import ConfirmDialog from '@/app/components/ConfirmDialog';
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Loader2, User, Phone, MoreHorizontal, Trash2, Star, Users, CheckSquare, Square, XCircle, Tag } from 'lucide-react';
import { getKhachHangDataAction, deleteKhachHangAction, bulkUpdateKhachHangAction } from '@/app/actions/QuyenHanQuanLy';
import FormKhachHang from './FormKhachHang';
import KhachHangDetail from './KhachHangDetail';

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

// Danh sách phân loại khách hàng
const PHAN_LOAI_OPTIONS = [
    { value: 'vip', label: 'VIP', normalized: 'vip' },
    { value: 'Mới', label: 'MỚI', normalized: 'moi' },
    { value: 'Đã mua hàng', label: 'ĐÃ MUA', normalized: 'damuahang' },
    { value: 'Đối tác', label: 'ĐỐI TÁC', normalized: 'doitac' },
    { value: 'KH Trọng tâm', label: 'TRỌNG TÂM', normalized: 'khtrongtam' },
];

interface KhachHang {
    id: string; ho_ten: string; phan_loai: string; phan_loai_normalized: string;
    so_dien_thoai: string; email: string; hinh_anh?: string; dia_chi?: string;
}

export default function KhachHangManager({ allowDelete = false }: { allowDelete?: boolean }) {
    const [customers, setCustomers] = useState<KhachHang[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    // 🟢 STATE CHO HỘP THOẠI XÁC NHẬN
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        id: string | null;
        title: string;
        message: string;
        action: (id: string) => Promise<void>;
    }>({
        isOpen: false,
        id: null,
        title: '',
        message: '',
        action: async () => {},
    });

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<KhachHang | null>(null);

    // 🟢 BULK ACTIONS STATE (chỉ dành cho admin - allowDelete=true)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [showBulkMenu, setShowBulkMenu] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getKhachHangDataAction(1, 1000, '', ''); 
            if (res.success && res.data) {
                setCustomers(res.data as any);
            } else if (res.error) {
                console.error('[KhachHang] Lỗi từ server:', res.error);
            }
        } catch (e) { console.error('[KhachHang] Lỗi:', e); } finally { setLoading(false); }
    };

    const tabs = useMemo(() => {
        const counts: Record<string, number> = { all: customers.length };
        customers.forEach(c => { const r = c.phan_loai_normalized || 'other'; counts[r] = (counts[r] || 0) + 1; });
        return [
            { id: 'all', label: 'TẤT CẢ' },
            { id: 'vip', label: 'VIP' },
            { id: 'moi', label: 'MỚI' },
            { id: 'damuahang', label: 'ĐÃ MUA' },
            { id: 'doitac', label: 'ĐỐI TÁC' },
            { id: 'khtrongtam', label: 'TRỌNG TÂM' },
        ].map(t => ({ ...t, count: counts[t.id] || 0 }));
    }, [customers]);

    const filteredList = useMemo(() => {
        const normSearch = toNonAccentVietnamese(searchTerm);
        return customers.filter(c => {
            const matchSearch = toNonAccentVietnamese(c.ho_ten).includes(normSearch) || (c.so_dien_thoai || '').includes(normSearch);
            const matchTab = activeTab === 'all' || c.phan_loai_normalized === activeTab;
            return matchSearch && matchTab;
        });
    }, [customers, searchTerm, activeTab]);

    const handleAddNew = () => { setSelectedCustomer(null); setIsFormOpen(true); };
    
    const handleCardClick = (c: KhachHang) => { 
        if (isBulkMode) {
            toggleSelect(c.id);
        } else {
            setSelectedCustomer(c); 
            setIsDetailOpen(true); 
        }
    };

    const openDeleteDialog = (e: any, id: string, name: string) => {
        if(e && e.stopPropagation) e.stopPropagation();
        setConfirmConfig({
            isOpen: true,
            id: id,
            title: 'Xóa Hồ Sơ?',
            message: `Bạn có chắc muốn xóa khách hàng "${name}" khỏi hệ thống? Dữ liệu không thể phục hồi.`,
            action: executeDelete 
        });
    };

    const executeDelete = async (id: string) => {
        const res = await deleteKhachHangAction(id);
        if (res.success) {
            fetchData(); 
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            setIsDetailOpen(false);
        } else {
            alert(res.error);
            setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        }
    };

    // 🟢 BULK ACTIONS FUNCTIONS
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const selectAll = () => {
        const allIds = filteredList.map(c => c.id);
        setSelectedIds(new Set(allIds));
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
        setIsBulkMode(false);
        setShowBulkMenu(false);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Xóa ${selectedIds.size} khách hàng đã chọn?`)) return;
        
        setBulkLoading(true);
        let successCount = 0;
        for (const id of selectedIds) {
            const res = await deleteKhachHangAction(id);
            if (res.success) successCount++;
        }
        setBulkLoading(false);
        alert(`Đã xóa ${successCount}/${selectedIds.size} khách hàng`);
        clearSelection();
        fetchData();
    };

    const handleBulkUpdateCategory = async (phanLoai: string, phanLoaiNormalized: string) => {
        if (selectedIds.size === 0) return;
        
        setBulkLoading(true);
        const res = await bulkUpdateKhachHangAction(Array.from(selectedIds), { phan_loai: phanLoai, phan_loai_normalized: phanLoaiNormalized });
        setBulkLoading(false);
        
        if (res.success) {
            alert(`Đã cập nhật ${selectedIds.size} khách hàng thành "${phanLoai}"`);
            clearSelection();
            fetchData();
        } else {
            alert('Lỗi: ' + res.error);
        }
        setShowBulkMenu(false);
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#050505] overflow-hidden">
            {/* Toolbar */}
            <div className="shrink-0 p-4 flex gap-3 justify-between bg-[#0a0a0a] border-b border-white/5">
                <div className="relative group w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input type="text" placeholder="Tìm tên, sđt..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-xs text-white outline-none focus:border-[#C69C6D] font-bold uppercase"/>
                </div>
                <div className="flex gap-2">
                    {allowDelete && (
                        <button 
                            onClick={() => { setIsBulkMode(!isBulkMode); if (isBulkMode) clearSelection(); }}
                            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all ${isBulkMode ? 'bg-[#C69C6D] text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                        >
                            <CheckSquare size={16} /> <span className="hidden sm:inline">CHỌN</span>
                        </button>
                    )}
                    <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-[#C69C6D] text-black text-xs font-black rounded-lg shadow-lg active:scale-95 uppercase">
                        <Plus size={16} strokeWidth={3} /> <span className="hidden sm:inline">Thêm Mới</span>
                    </button>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {isBulkMode && selectedIds.size > 0 && (
                <div className="shrink-0 px-4 py-3 bg-[#C69C6D]/10 border-b border-[#C69C6D]/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-[#C69C6D] font-bold text-sm">Đã chọn: {selectedIds.size}</span>
                        <button onClick={selectAll} className="text-xs text-white/60 hover:text-white underline">Chọn tất cả ({filteredList.length})</button>
                        <button onClick={clearSelection} className="text-xs text-white/60 hover:text-red-400 flex items-center gap-1"><XCircle size={12}/> Hủy</button>
                    </div>
                    <div className="flex items-center gap-2 relative">
                        <div className="relative">
                            <button 
                                onClick={() => setShowBulkMenu(!showBulkMenu)}
                                disabled={bulkLoading}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                            >
                                <Tag size={14}/> ĐỔI PHÂN LOẠI
                            </button>
                            {showBulkMenu && (
                                <div className="absolute top-full mt-1 right-0 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 min-w-[160px] overflow-hidden">
                                    {PHAN_LOAI_OPTIONS.map(opt => (
                                        <button 
                                            key={opt.value}
                                            onClick={() => handleBulkUpdateCategory(opt.value, opt.normalized)}
                                            className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/10 font-bold uppercase border-b border-white/5 last:border-0"
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={handleBulkDelete}
                            disabled={bulkLoading}
                            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                        >
                            {bulkLoading ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>} XÓA
                        </button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="shrink-0 px-4 pt-2 flex gap-4 overflow-x-auto scrollbar-hide border-b border-white/5">
                <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} className={`pb-3 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${activeTab === t.id ? 'text-[#C69C6D] border-[#C69C6D]' : 'text-gray-500 border-transparent hover:text-white'}`}>
                        {t.label} <span className={`px-1.5 py-0.5 rounded text-[9px] ${activeTab === t.id ? 'bg-[#C69C6D] text-black' : 'bg-white/10 text-gray-400'}`}>{t.count}</span>
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } `}</style>
                {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#C69C6D]"/></div> : 
                filteredList.length === 0 ? <div className="h-full flex items-center justify-center text-white/20 font-bold text-xs uppercase">Không tìm thấy dữ liệu</div> : 
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                    {filteredList.map((c, idx) => {
                        const isSelected = selectedIds.has(c.id);
                        return (
                        <div key={c.id} onClick={() => handleCardClick(c)} className={`group relative bg-[#0f0f0f] border rounded-xl p-4 transition-all cursor-pointer flex items-center gap-4 ${isSelected ? 'border-[#C69C6D] bg-[#C69C6D]/10' : 'border-white/5 hover:border-[#C69C6D]/50 hover:-translate-y-1'}`}>
                            {isBulkMode && (
                                <div className="shrink-0" onClick={(e) => { e.stopPropagation(); toggleSelect(c.id); }}>
                                    {isSelected ? <CheckSquare size={20} className="text-[#C69C6D]"/> : <Square size={20} className="text-white/30"/>}
                                </div>
                            )}
                            <div className="relative shrink-0 w-14 h-14 rounded-full border border-white/10 p-0.5 bg-black overflow-hidden group-hover:border-[#C69C6D]">
                                {c.hinh_anh ? <img src={c.hinh_anh} className="w-full h-full object-cover rounded-full"/> : <div className="w-full h-full flex items-center justify-center text-white/20"><User size={20}/></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-bold text-sm truncate uppercase group-hover:text-[#C69C6D] flex items-center gap-1">
                                    {c.ho_ten} {c.phan_loai_normalized === 'vip' && <Star size={10} className="text-yellow-500 fill-yellow-500"/>}
                                </h3>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold mb-1 inline-block ${c.phan_loai_normalized === 'vip' ? 'text-yellow-500 border-yellow-900/50 bg-yellow-900/20' : 'text-[#C69C6D] border-[#C69C6D]/30'}`}>{c.phan_loai}</span>
                                <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono"><Phone size={10}/><span>{c.so_dien_thoai}</span></div>
                            </div>
                            {!isBulkMode && <div className="text-white/10 group-hover:text-[#C69C6D]"><MoreHorizontal size={16}/></div>}
                        </div>
                    )})}
                </div>}
            </div>

            {/* 👇 CÁC MODAL - HIỂN THỊ CÓ ĐIỀU KIỆN ĐỂ TRÁNH LỖI HOOK */}
            {isFormOpen && (
                <FormKhachHang 
                    isOpen={isFormOpen} 
                    onClose={() => setIsFormOpen(false)} 
                    initialData={selectedCustomer} 
                    onSuccess={() => { fetchData(); setIsFormOpen(false); }} 
                />
            )}
            
            {isDetailOpen && selectedCustomer && (
                <KhachHangDetail 
                    isOpen={isDetailOpen} 
                    data={selectedCustomer} 
                    onClose={() => setIsDetailOpen(false)} 
                    onEdit={() => { setIsDetailOpen(false); setIsFormOpen(true); }} 
                    allowDelete={allowDelete}
                    onDelete={(id) => {
                        openDeleteDialog(null, id, selectedCustomer.ho_ten);
                    }}
                />
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog 
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={() => {
                    if (confirmConfig.id) confirmConfig.action(confirmConfig.id);
                }}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}