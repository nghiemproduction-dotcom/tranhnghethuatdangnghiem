'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Loader2, User, Phone, MapPin, MoreHorizontal, Trash2, CheckSquare, Square, XCircle, Tag } from 'lucide-react';
import { getNhanSuDataAction, deleteNhanSuAction, bulkUpdateNhanSuAction } from '@/app/actions/QuyenHanQuanLy';
import FormNhanSu from './FormNhanSu';
import NhanSuDetail from './NhanSuDetail';

// 🟢 HÀM HỖ TRỢ TÌM KIẾM THÔNG MINH (Chuẩn hóa Tiếng Việt)
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

// Danh sách vị trí nhân sự
const VI_TRI_OPTIONS = [
    { value: 'Quản lý', label: 'QUẢN LÝ', normalized: 'quanly' },
    { value: 'Sales', label: 'SALES', normalized: 'sales' },
    { value: 'Thợ sản xuất', label: 'THỢ SẢN XUẤT', normalized: 'thosanxuat' },
    { value: 'Part-time', label: 'PART-TIME', normalized: 'parttime' },
    { value: 'Cộng tác viên', label: 'CTV', normalized: 'congtacvien' },
];

interface NhanSu {
    id: string;
    ho_ten: string;
    vi_tri: string;
    vi_tri_normalized: string;
    so_dien_thoai: string;
    email: string;
    hinh_anh?: string;
    trang_thai?: string;
    luong_thang?: number;
    ngan_hang?: string;
    so_tai_khoan?: string;
}

interface Props {
    allowDelete?: boolean;
}

export default function NhanSuManager({ allowDelete = false }: Props) {
    const [employees, setEmployees] = useState<NhanSu[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<NhanSu | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // 🟢 BULK ACTIONS STATE (chỉ dành cho admin - allowDelete=true)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);
    const [showBulkMenu, setShowBulkMenu] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Load tối đa 1000 bản ghi để xử lý tìm kiếm phía Client cho mượt
            const res = await getNhanSuDataAction(1, 1000, '', ''); 
            console.log('[NhanSu] Kết quả fetch:', res);
            if (res.success && res.data) {
                setEmployees(res.data as unknown as NhanSu[]);
            } else if (res.error) {
                console.error('[NhanSu] Lỗi từ server:', res.error);
            }
        } catch (error) {
            console.error("[NhanSu] Lỗi:", error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = useMemo(() => {
        const counts: Record<string, number> = { all: employees.length };
        employees.forEach(emp => {
            const role = emp.vi_tri_normalized || 'other';
            counts[role] = (counts[role] || 0) + 1;
        });
        const tabList = [
            { id: 'all', label: 'TẤT CẢ' },
            { id: 'quanly', label: 'QUẢN LÝ' },
            { id: 'sales', label: 'SALES' },
            { id: 'thosanxuat', label: 'THỢ' },
            { id: 'parttime', label: 'PART-TIME' },
            { id: 'congtacvien', label: 'CTV' },
        ];
        return tabList.map(tab => ({ ...tab, count: counts[tab.id] || 0 }));
    }, [employees]);

    // 🟢 LOGIC LỌC THÔNG MINH (Smart Filter)
    const filteredList = useMemo(() => {
        // Chuẩn hóa từ khóa tìm kiếm 1 lần để tối ưu
        const normalizedSearch = toNonAccentVietnamese(searchTerm);

        return employees.filter(emp => {
            // Chuẩn hóa tên và số điện thoại của nhân viên
            const normalizedName = toNonAccentVietnamese(emp.ho_ten);
            const phone = emp.so_dien_thoai || '';

            // So sánh: Tên chứa từ khóa HOẶC SĐT chứa từ khóa
            const matchSearch = normalizedName.includes(normalizedSearch) || phone.includes(normalizedSearch);
            
            // So sánh Tab
            const matchTab = activeTab === 'all' || emp.vi_tri_normalized === activeTab;
            
            return matchSearch && matchTab;
        });
    }, [employees, searchTerm, activeTab]);

    const handleAddNew = () => { setSelectedEmployee(null); setIsEditMode(false); setIsFormOpen(true); };
    const handleCardClick = (emp: NhanSu) => { 
        if (isBulkMode) {
            toggleSelect(emp.id);
        } else {
            setSelectedEmployee(emp); 
            setIsDetailOpen(true); 
        }
    };
    const handleSwitchToEdit = () => { setIsDetailOpen(false); setIsEditMode(true); setIsFormOpen(true); };
    const handleSaveSuccess = () => { fetchData(); setIsFormOpen(false); };

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
        const allIds = filteredList.map(e => e.id);
        setSelectedIds(new Set(allIds));
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
        setIsBulkMode(false);
        setShowBulkMenu(false);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Xóa ${selectedIds.size} nhân sự đã chọn?`)) return;
        
        setBulkLoading(true);
        let successCount = 0;
        for (const id of selectedIds) {
            const res = await deleteNhanSuAction(id);
            if (res.success) successCount++;
        }
        setBulkLoading(false);
        alert(`Đã xóa ${successCount}/${selectedIds.size} nhân sự`);
        clearSelection();
        fetchData();
    };

    const handleBulkUpdateRole = async (viTri: string, viTriNormalized: string) => {
        if (selectedIds.size === 0) return;
        
        setBulkLoading(true);
        const res = await bulkUpdateNhanSuAction(Array.from(selectedIds), { vi_tri: viTri, vi_tri_normalized: viTriNormalized });
        setBulkLoading(false);
        
        if (res.success) {
            alert(`Đã cập nhật ${selectedIds.size} nhân sự thành "${viTri}"`);
            clearSelection();
            fetchData();
        } else {
            alert('Lỗi: ' + res.error);
        }
        setShowBulkMenu(false);
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#050505] overflow-hidden relative">
            {/* TOOLBAR */}
            <div className="shrink-0 p-4 flex gap-3 items-center justify-between bg-[#0a0a0a] border-b border-white/5">
                <div className="relative group w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#C69C6D] transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Tìm tên, sđt..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-[#C69C6D] font-bold uppercase transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {/* 🟢 NÚT BULK MODE - CHỈ HIỆN CHO ADMIN */}
                    {allowDelete && (
                        <button 
                            onClick={() => { setIsBulkMode(!isBulkMode); if (isBulkMode) clearSelection(); }}
                            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all ${isBulkMode ? 'bg-[#C69C6D] text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                        >
                            <CheckSquare size={16} /> <span className="hidden sm:inline">CHỌN</span>
                        </button>
                    )}
                    <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-[#C69C6D] hover:bg-white text-black text-xs font-black rounded-lg transition-all shadow-[0_0_15px_rgba(198,156,109,0.3)] active:scale-95 uppercase tracking-wider">
                        <Plus size={16} strokeWidth={3} /> <span className="hidden sm:inline">Thêm Mới</span>
                    </button>
                </div>
            </div>

            {/* 🟢 BULK ACTION BAR - Hiện khi đang chọn */}
            {isBulkMode && selectedIds.size > 0 && (
                <div className="shrink-0 px-4 py-3 bg-[#C69C6D]/10 border-b border-[#C69C6D]/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-[#C69C6D] font-bold text-sm">Đã chọn: {selectedIds.size}</span>
                        <button onClick={selectAll} className="text-xs text-white/60 hover:text-white underline">Chọn tất cả ({filteredList.length})</button>
                        <button onClick={clearSelection} className="text-xs text-white/60 hover:text-red-400 flex items-center gap-1"><XCircle size={12}/> Hủy</button>
                    </div>
                    <div className="flex items-center gap-2 relative">
                        {/* Đổi vị trí */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowBulkMenu(!showBulkMenu)}
                                disabled={bulkLoading}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg disabled:opacity-50"
                            >
                                <Tag size={14}/> ĐỔI VỊ TRÍ
                            </button>
                            {showBulkMenu && (
                                <div className="absolute top-full mt-1 right-0 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 min-w-[160px] overflow-hidden">
                                    {VI_TRI_OPTIONS.map(opt => (
                                        <button 
                                            key={opt.value}
                                            onClick={() => handleBulkUpdateRole(opt.value, opt.normalized)}
                                            className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/10 font-bold uppercase border-b border-white/5 last:border-0"
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Xóa hàng loạt */}
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

            {/* TAB LIST */}
            <div className="shrink-0 px-4 pt-2 pb-0 flex gap-4 overflow-x-auto scrollbar-hide border-b border-white/5 bg-[#050505]">
                <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all flex items-center gap-2 ${activeTab === tab.id ? 'text-[#C69C6D] border-[#C69C6D]' : 'text-gray-500 border-transparent hover:text-white'}`}>
                        {tab.label} <span className={`px-1.5 py-0.5 rounded text-[9px] ${activeTab === tab.id ? 'bg-[#C69C6D] text-black' : 'bg-white/10 text-gray-400'}`}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* CARD GRID */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#050505] scrollbar-hide">
                {loading ? (
                    <div className="h-full flex items-center justify-center flex-col"><Loader2 className="animate-spin text-[#C69C6D] mb-4" size={32} /><p className="text-[#C69C6D]/50 text-xs uppercase tracking-[0.2em] animate-pulse">ĐANG TẢI...</p></div>
                ) : filteredList.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-white/20"><User size={48} className="mb-4 opacity-20" /><p className="text-xs uppercase tracking-widest font-bold">KHÔNG TÌM THẤY '{searchTerm}'</p></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                        {filteredList.map((emp, idx) => {
                            const isSelected = selectedIds.has(emp.id);
                            return (
                            <div key={emp.id} onClick={() => handleCardClick(emp)} className={`group relative bg-[#0f0f0f] border rounded-xl p-4 transition-all cursor-pointer overflow-hidden flex items-center gap-4 ${isSelected ? 'border-[#C69C6D] bg-[#C69C6D]/10' : 'border-white/5 hover:border-[#C69C6D]/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]'}`} style={{ animationDelay: `${idx * 0.05}s` }}>
                                {/* 🟢 CHECKBOX KHI BULK MODE */}
                                {isBulkMode && (
                                    <div className="shrink-0" onClick={(e) => { e.stopPropagation(); toggleSelect(emp.id); }}>
                                        {isSelected ? <CheckSquare size={20} className="text-[#C69C6D]"/> : <Square size={20} className="text-white/30"/>}
                                    </div>
                                )}
                                <div className="relative shrink-0 w-14 h-14 rounded-full border border-white/10 p-0.5 bg-black overflow-hidden group-hover:border-[#C69C6D] transition-colors">
                                    {emp.hinh_anh ? <img src={emp.hinh_anh} alt={emp.ho_ten} className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center text-white/20"><User size={20} /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold text-sm truncate uppercase tracking-wide group-hover:text-[#C69C6D] transition-colors">{emp.ho_ten}</h3>
                                    <p className="text-[10px] text-[#C69C6D] font-bold uppercase mb-1">{emp.vi_tri || '---'}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono"><Phone size={10} /><span className="truncate">{emp.so_dien_thoai || '---'}</span></div>
                                </div>
                                {!isBulkMode && <div className="text-white/10 group-hover:text-[#C69C6D] transition-colors"><MoreHorizontal size={16} /></div>}
                            </div>
                        )})}
                    </div>
                )}
            </div>

            <FormNhanSu isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} initialData={selectedEmployee} onSuccess={handleSaveSuccess} />
            <NhanSuDetail 
                isOpen={isDetailOpen} 
                data={selectedEmployee} 
                onClose={() => setIsDetailOpen(false)} 
                onEdit={handleSwitchToEdit}
                allowDelete={allowDelete}
                onDelete={async (id) => {
                    const res = await deleteNhanSuAction(id);
                    if (res.success) fetchData();
                    else alert(res.error);
                }}
            />
        </div>
    );
}