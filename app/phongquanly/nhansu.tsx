'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Loader2, User, Phone, MoreHorizontal, Trash2, CheckSquare, Square, XCircle, Tag, ArrowUpDown, X, Trophy, Star, Medal, Zap } from 'lucide-react';
import { getNhanSuDataAction, deleteNhanSuAction, bulkUpdateNhanSuAction } from '@/app/actions/QuyenHanQuanLy';
import FormNhanSu from './FormNhanSu';
import NhanSuDetailInline from './NhanSuDetailInline';

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

const VI_TRI_OPTIONS = [
    { value: 'Quản lý', label: 'QUẢN LÝ', normalized: 'quanly' },
    { value: 'Sales', label: 'SALES', normalized: 'sales' },
    { value: 'Thợ sản xuất', label: 'THỢ SẢN XUẤT', normalized: 'thosanxuat' },
    { value: 'Part-time', label: 'PART-TIME', normalized: 'parttime' },
    { value: 'Cộng tác viên', label: 'CTV', normalized: 'congtacvien' },
];

const MOCK_BADGES: Record<string, string[]> = {};

interface NhanSu {
    id: string; ho_ten: string; vi_tri: string; vi_tri_normalized: string;
    so_dien_thoai: string; email: string; hinh_anh?: string; trang_thai?: string;
    luong_thang?: number; ngan_hang?: string; so_tai_khoan?: string;
}

interface Props { allowDelete?: boolean; }

export default function NhanSuManager({ allowDelete = false }: Props) {
    const [employees, setEmployees] = useState<NhanSu[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [sortBy, setSortBy] = useState<'name' | 'vitri' | 'luong'>('name');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<NhanSu | null>(null);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [showBulkMenu, setShowBulkMenu] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getNhanSuDataAction(1, 1000, '', '');
            if (res.success && res.data) setEmployees(res.data as unknown as NhanSu[]);
        } catch (error) { console.error("[NhanSu] Lỗi:", error); }
        finally { setLoading(false); }
    };

    const tabs = useMemo(() => {
        const counts: Record<string, number> = { all: employees.length };
        employees.forEach(emp => { const role = emp.vi_tri_normalized || 'other'; counts[role] = (counts[role] || 0) + 1; });
        return [
            { id: 'all', label: 'TẤT CẢ', count: counts.all },
            { id: 'quanly', label: 'QUẢN LÝ', count: counts.quanly || 0 },
            { id: 'sales', label: 'SALES', count: counts.sales || 0 },
            { id: 'thosanxuat', label: 'THỢ', count: counts.thosanxuat || 0 },
            { id: 'parttime', label: 'PART-TIME', count: counts.parttime || 0 },
            { id: 'congtacvien', label: 'CTV', count: counts.congtacvien || 0 },
        ];
    }, [employees]);

    const filteredList = useMemo(() => {
        const normalizedSearch = toNonAccentVietnamese(searchTerm);
        let result = employees.filter(emp => {
            const normalizedName = toNonAccentVietnamese(emp.ho_ten);
            const phone = emp.so_dien_thoai || '';
            const matchSearch = normalizedName.includes(normalizedSearch) || phone.includes(normalizedSearch);
            const matchTab = activeTab === 'all' || emp.vi_tri_normalized === activeTab;
            return matchSearch && matchTab;
        });
        if (sortBy === 'name') result = [...result].sort((a, b) => a.ho_ten.localeCompare(b.ho_ten));
        else if (sortBy === 'vitri') result = [...result].sort((a, b) => (a.vi_tri || '').localeCompare(b.vi_tri || ''));
        else if (sortBy === 'luong') result = [...result].sort((a, b) => (b.luong_thang || 0) - (a.luong_thang || 0));
        return result;
    }, [employees, searchTerm, activeTab, sortBy]);

    const handleAddNew = () => { setSelectedEmployee(null); setIsFormOpen(true); };
    const handleCardClick = (emp: NhanSu) => { if (isBulkMode) toggleSelect(emp.id); else setSelectedEmployee(emp); };
    const handleSwitchToEdit = () => { setIsFormOpen(true); };
    const handleSaveSuccess = () => { fetchData(); setIsFormOpen(false); };
    const handleCloseDetail = () => { setSelectedEmployee(null); };

    const toggleSelect = (id: string) => { setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); };
    const selectAll = () => setSelectedIds(new Set(filteredList.map(e => e.id)));
    const clearSelection = () => { setSelectedIds(new Set()); setIsBulkMode(false); setShowBulkMenu(false); };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Xóa ${selectedIds.size} nhân sự?`)) return;
        setBulkLoading(true);
        let ok = 0;
        for (const id of selectedIds) { const r = await deleteNhanSuAction(id); if (r.success) ok++; }
        setBulkLoading(false);
        alert(`Đã xóa ${ok}/${selectedIds.size}`);
        clearSelection(); fetchData();
    };

    const handleBulkUpdateRole = async (viTri: string, viTriNormalized: string) => {
        if (selectedIds.size === 0) return;
        setBulkLoading(true);
        const r = await bulkUpdateNhanSuAction(Array.from(selectedIds), { vi_tri: viTri, vi_tri_normalized: viTriNormalized });
        setBulkLoading(false);
        if (r.success) { alert(`Cập nhật ${selectedIds.size} thành công`); clearSelection(); fetchData(); }
        else alert('Lỗi: ' + r.error);
        setShowBulkMenu(false);
    };

    // Nếu có detail đang mở -> ẩn cards, hiện detail full width
    const showDetail = !!selectedEmployee;

    return (
        <div className="w-full h-full flex flex-col bg-[#050505] overflow-hidden">
            {/* TAB BAR - Tabs cuộn, Actions cố định phải */}
            <div className="shrink-0 h-[40px] flex items-center border-b border-white/5 bg-[#0a0a0a]">
                {/* Tabs - cuộn được */}
                <div className="flex-1 flex items-center gap-1 px-2 overflow-x-auto min-w-0">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
                            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase whitespace-nowrap rounded transition-all shrink-0 ${activeTab === tab.id ? 'text-[#C69C6D] bg-[#C69C6D]/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                            {tab.label}
                            <span className={`px-1 py-0.5 rounded text-[8px] ${activeTab === tab.id ? 'bg-[#C69C6D] text-black' : 'bg-white/10 text-gray-400'}`}>{tab.count}</span>
                        </button>
                    ))}
                </div>
                
                {/* Actions - cố định phải */}
                <div className="shrink-0 flex items-center gap-1 px-2 border-l border-white/5 bg-[#0a0a0a]">
                    {/* Search - icon only, expand on click */}
                    <div className="relative flex items-center">
                        {showSearch ? (
                            <div className="flex items-center gap-1 animate-in slide-in-from-right-2">
                                <input autoFocus type="text" placeholder="Tìm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-28 bg-white/5 border border-white/10 rounded pl-2 pr-6 py-1 text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#C69C6D]" />
                                <button onClick={() => { setShowSearch(false); setSearchTerm(''); }} className="absolute right-1 p-0.5 text-white/40 hover:text-white"><X size={12}/></button>
                            </div>
                        ) : (
                            <button onClick={() => setShowSearch(true)} className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded transition-all"><Search size={14}/></button>
                        )}
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <button onClick={() => setShowSortMenu(!showSortMenu)} className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded transition-all"><ArrowUpDown size={14}/></button>
                        {showSortMenu && (
                            <div className="absolute top-full mt-1 right-0 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-[100] min-w-[90px] overflow-hidden">
                                <button onClick={() => { setSortBy('name'); setShowSortMenu(false); }} className={`w-full text-left px-3 py-1.5 text-[10px] font-bold ${sortBy === 'name' ? 'text-[#C69C6D] bg-[#C69C6D]/10' : 'text-white hover:bg-white/10'}`}>TÊN</button>
                                <button onClick={() => { setSortBy('vitri'); setShowSortMenu(false); }} className={`w-full text-left px-3 py-1.5 text-[10px] font-bold ${sortBy === 'vitri' ? 'text-[#C69C6D] bg-[#C69C6D]/10' : 'text-white hover:bg-white/10'}`}>VỊ TRÍ</button>
                                <button onClick={() => { setSortBy('luong'); setShowSortMenu(false); }} className={`w-full text-left px-3 py-1.5 text-[10px] font-bold ${sortBy === 'luong' ? 'text-[#C69C6D] bg-[#C69C6D]/10' : 'text-white hover:bg-white/10'}`}>LƯƠNG</button>
                            </div>
                        )}
                    </div>

                    {/* Bulk Mode */}
                    {allowDelete && (
                        <button onClick={() => { setIsBulkMode(!isBulkMode); if (isBulkMode) clearSelection(); }}
                            className={`p-1.5 rounded transition-all ${isBulkMode ? 'bg-[#C69C6D] text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                            <CheckSquare size={14}/>
                        </button>
                    )}

                    {/* Add */}
                    <button onClick={handleAddNew} className="p-1.5 bg-[#C69C6D] hover:bg-white text-black rounded transition-all active:scale-95"><Plus size={14} strokeWidth={3}/></button>
                </div>
            </div>

            {/* Bulk Bar */}
            {isBulkMode && selectedIds.size > 0 && (
                <div className="shrink-0 px-3 py-1.5 bg-[#C69C6D]/10 border-b border-[#C69C6D]/30 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[#C69C6D] font-bold text-[10px]">Đã chọn: {selectedIds.size}</span>
                        <button onClick={selectAll} className="text-[10px] text-white/60 hover:text-white underline">Tất cả ({filteredList.length})</button>
                        <button onClick={clearSelection} className="text-[10px] text-white/60 hover:text-red-400 flex items-center gap-1"><XCircle size={10}/> Hủy</button>
                    </div>
                    <div className="flex items-center gap-2 relative">
                        <div className="relative">
                            <button onClick={() => setShowBulkMenu(!showBulkMenu)} disabled={bulkLoading} className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded disabled:opacity-50"><Tag size={10}/> ĐỔI</button>
                            {showBulkMenu && (
                                <div className="absolute top-full mt-1 right-0 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-[100] min-w-[120px] overflow-hidden">
                                    {VI_TRI_OPTIONS.map(opt => (<button key={opt.value} onClick={() => handleBulkUpdateRole(opt.value, opt.normalized)} className="w-full text-left px-3 py-1.5 text-[10px] text-white hover:bg-white/10 font-bold uppercase border-b border-white/5 last:border-0">{opt.label}</button>))}
                                </div>
                            )}
                        </div>
                        <button onClick={handleBulkDelete} disabled={bulkLoading} className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded disabled:opacity-50">
                            {bulkLoading ? <Loader2 size={10} className="animate-spin"/> : <Trash2 size={10}/>} XÓA
                        </button>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT */}
            <div className="flex-1 overflow-hidden">
                {/* Cards - ẩn khi có detail */}
                {!showDetail && (
                    <div className="w-full h-full overflow-y-auto p-3">
                        {loading ? (
                            <div className="h-full flex items-center justify-center flex-col">
                                <Loader2 className="animate-spin text-[#C69C6D] mb-3" size={28}/>
                                <p className="text-[#C69C6D]/50 text-[10px] uppercase tracking-widest">ĐANG TẢI...</p>
                            </div>
                        ) : filteredList.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-white/20">
                                <User size={40} className="mb-3 opacity-20"/>
                                <p className="text-[10px] uppercase font-bold">Không tìm thấy</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                                {filteredList.map((emp) => {
                                    const isSelected = selectedIds.has(emp.id);
                                    const empBadges = MOCK_BADGES[emp.id] || ['first_sale'];
                                    return (
                                        <div key={emp.id} onClick={() => handleCardClick(emp)} 
                                            className={`group relative bg-[#0f0f0f] border rounded-xl p-3 transition-all cursor-pointer flex items-center gap-3 ${isSelected ? 'border-[#C69C6D] bg-[#C69C6D]/10' : 'border-white/5 hover:border-[#C69C6D]/50'}`}>
                                            {isBulkMode && (
                                                <div className="shrink-0" onClick={(e) => { e.stopPropagation(); toggleSelect(emp.id); }}>
                                                    {isSelected ? <CheckSquare size={16} className="text-[#C69C6D]"/> : <Square size={16} className="text-white/30"/>}
                                                </div>
                                            )}
                                            <div className="relative shrink-0 w-10 h-10 rounded-full border border-white/10 bg-black overflow-hidden">
                                                {emp.hinh_anh ? <img src={emp.hinh_anh} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-white/20"><User size={16}/></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-bold text-xs truncate uppercase">{emp.ho_ten}</h3>
                                                <p className="text-[9px] text-[#C69C6D] font-bold">{emp.vi_tri || '---'}</p>
                                                <div className="flex items-center gap-1 text-[9px] text-white/40 mt-0.5"><Phone size={9}/><span className="truncate">{emp.so_dien_thoai || '---'}</span></div>
                                            </div>
                                            {empBadges.length > 0 && (
                                                <div className="flex items-center gap-0.5 shrink-0">
                                                    {empBadges.slice(0, 2).map((badgeId, idx) => {
                                                        const icons: Record<string, any> = { first_sale: Star, speed_demon: Zap, sales_10: Medal, top_performer: Trophy };
                                                        const Icon = icons[badgeId] || Star;
                                                        return <Icon key={idx} size={11} className="text-yellow-400/70"/>;
                                                    })}
                                                    {empBadges.length > 2 && <span className="text-[8px] text-white/30">+{empBadges.length - 2}</span>}
                                                </div>
                                            )}
                                            {!isBulkMode && <MoreHorizontal size={14} className="text-white/10 group-hover:text-[#C69C6D] shrink-0"/>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Detail - full width khi mở */}
                {showDetail && (
                    <div className="w-full h-full overflow-hidden">
                        <NhanSuDetailInline
                            data={selectedEmployee}
                            onClose={handleCloseDetail}
                            onEdit={handleSwitchToEdit}
                            allowDelete={allowDelete}
                            onDelete={async (id) => {
                                const res = await deleteNhanSuAction(id);
                                if (res.success) { fetchData(); setSelectedEmployee(null); }
                                else alert(res.error);
                            }}
                        />
                    </div>
                )}
            </div>

            <FormNhanSu isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} initialData={selectedEmployee} onSuccess={handleSaveSuccess}/>
        </div>
    );
}
