'use client';

import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, Phone, MessageCircle, Edit3, 
    User, MapPin, RefreshCw, Loader2, Plus 
} from 'lucide-react';
import { getNhanSuDataAction } from '@/app/actions/admindb';

// 🟢 IMPORT FORM NHẬP LIỆU MỚI
import FormNhanSu from './FormNhanSu';

interface NhanSu {
    id: string;
    ho_ten: string;
    vi_tri: string;
    so_dien_thoai: string;
    email: string;
    hinh_anh?: string;
    trang_thai?: string;
    vi_tri_normalized?: string;
}

const calculatePageSize = () => {
    if (typeof window === 'undefined') return 12;
    const w = window.innerWidth;
    if (w < 640) return 6; 
    if (w < 1024) return 9; 
    return 12;
};

export default function NhanSuManager() {
    const [employees, setEmployees] = useState<NhanSu[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRows, setTotalRows] = useState(0);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [positionFilter, setPositionFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    // 🟢 STATE ĐIỀU KHIỂN MODAL FORM MỚI
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingData, setEditingData] = useState<any>(null);

    useEffect(() => {
        setPageSize(calculatePageSize());
        const handleResize = () => setPageSize(calculatePageSize());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchData();
    }, [currentPage, pageSize, positionFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) setCurrentPage(1);
            else fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getNhanSuDataAction(currentPage, pageSize, searchTerm, positionFilter);
            if (res.success && res.data) {
                setEmployees(res.data as unknown as NhanSu[]);
                setTotalRows(res.total || 0);
            }
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handler mở form thêm mới
    const handleAddNew = () => {
        setEditingData(null); // Reset data
        setIsFormOpen(true);
    };

    // Handler mở form sửa
    const handleEdit = (emp: NhanSu) => {
        setEditingData(emp); // Set data cần sửa
        setIsFormOpen(true);
    };

    const handleSaveSuccess = () => {
        fetchData(); // Reload lại danh sách sau khi lưu
    };

    const handleCall = (phone: string) => {
        if (!phone) return alert("Chưa có số điện thoại");
        window.open(`tel:${phone}`, '_self');
    };

    const totalPages = Math.ceil(totalRows / pageSize);

    return (
        <div className="w-full h-full flex flex-col bg-[#121212] overflow-hidden">
            
            {/* HEADER */}
            <div className="p-4 border-b border-white/10 bg-[#1a1a1a] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="bg-[#C69C6D]/10 p-2 rounded-lg border border-[#C69C6D]/30">
                        <User className="text-[#C69C6D]" size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Danh Sách Nhân Sự</h2>
                        <p className="text-[10px] text-white/50 font-mono">Tổng: {totalRows}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto flex-1 justify-end">
                    
                    {/* 🟢 NÚT GỌI MODAL THÊM MỚI */}
                    <button 
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-3 py-2 bg-[#C69C6D] hover:bg-white text-black text-xs font-bold rounded-lg transition-all shadow-lg active:scale-95"
                    >
                        <Plus size={16} /> <span className="hidden sm:inline">Thêm Mới</span>
                    </button>

                    <div className="h-6 w-[1px] bg-white/10 mx-1"></div>

                    <select 
                        value={positionFilter}
                        onChange={(e) => setPositionFilter(e.target.value)}
                        className="bg-black/30 border border-white/10 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#C69C6D]"
                    >
                        <option value="all">Tất cả vị trí</option>
                        <option value="quanly">Quản Lý</option>
                        <option value="sales">Sales</option>
                        <option value="thosanxuat">Thợ</option>
                        <option value="parttime">Part-time</option>
                        <option value="congtacvien">CTV</option>
                    </select>

                    <div className="relative group w-full md:w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#C69C6D]" size={14} />
                        <input 
                            type="text" 
                            placeholder="Tìm tên, sđt..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#C69C6D]"
                        />
                    </div>

                    <button onClick={fetchData} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* GRID CARD */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#0a0a0a]">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-[#C69C6D]" size={32} />
                    </div>
                ) : employees.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-white/30">
                        <User size={48} className="opacity-20 mb-4" />
                        <p>Không tìm thấy dữ liệu</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                        {employees.map((emp) => (
                            <div key={emp.id} className="group relative bg-[#151515] border border-white/5 hover:border-[#C69C6D]/50 rounded-xl p-5 transition-all hover:bg-[#1a1a1a] shadow-lg flex flex-col items-center">
                                {/* Nút Edit gọi Modal mới */}
                                <button 
                                    onClick={() => handleEdit(emp)}
                                    className="absolute top-3 right-3 p-1.5 text-white/30 hover:text-[#C69C6D] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Edit3 size={14} />
                                </button>

                                <div className="w-16 h-16 rounded-full border-2 border-[#C69C6D]/30 p-0.5 mb-3 relative overflow-hidden">
                                    {emp.hinh_anh ? (
                                        // 🟢 FIX HIỂN THỊ ẢNH: Thêm key là URL để buộc re-render khi URL thay đổi
                                        <img 
                                            key={emp.hinh_anh} 
                                            src={emp.hinh_anh} 
                                            alt={emp.ho_ten} 
                                            className="w-full h-full rounded-full object-cover" 
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-white/30">
                                            <User size={24} />
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-white font-bold text-sm mb-1 text-center truncate w-full">{emp.ho_ten}</h3>
                                <div className="px-2 py-0.5 rounded bg-[#C69C6D]/10 text-[#C69C6D] text-[10px] font-bold uppercase mb-4">
                                    {emp.vi_tri || 'Chưa cập nhật'}
                                </div>

                                <div className="w-full space-y-1 mb-4 text-[11px] text-white/50">
                                    <div className="flex items-center gap-2">
                                        <Phone size={10} className="shrink-0" />
                                        <span className="truncate">{emp.so_dien_thoai || '---'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={10} className="shrink-0" />
                                        <span className="truncate">{emp.email || '---'}</span>
                                    </div>
                                </div>

                                <div className="w-full grid grid-cols-2 gap-2 mt-auto">
                                    <button onClick={() => handleCall(emp.so_dien_thoai)} className="flex items-center justify-center gap-1 py-1.5 rounded bg-green-500/10 hover:bg-green-500/20 text-green-500 text-[10px] font-bold border border-green-500/30">
                                        <Phone size={12} /> GỌI
                                    </button>
                                    <button className="flex items-center justify-center gap-1 py-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-[10px] font-bold border border-blue-500/30">
                                        <MessageCircle size={12} /> CHAT
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-white/10 bg-[#1a1a1a] flex justify-between items-center shrink-0 text-xs text-white/60">
                <span className="font-medium hidden sm:block">Trang {currentPage} / {totalPages || 1}</span>
                <div className="flex gap-2 mx-auto sm:mx-0">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded disabled:opacity-30">Trước</button>
                    <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded disabled:opacity-30">Sau</button>
                </div>
            </div>

            <FormNhanSu 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                initialData={editingData}
                onSuccess={handleSaveSuccess}
            />
        </div>
    );
}