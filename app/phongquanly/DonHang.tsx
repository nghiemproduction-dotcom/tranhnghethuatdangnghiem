'use client';

import React, { useState, useMemo } from 'react';
import { 
    Filter, Download, Search, MoreHorizontal, CheckCircle2, 
    Clock, AlertCircle 
} from 'lucide-react';

// 🟢 HÀM HỖ TRỢ TÌM KIẾM THÔNG MINH (Copy để dùng chung hoặc import)
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

// MOCK DATA
const MOCK_DATA = Array.from({ length: 15 }).map((_, i) => ({
    id: `DH-${2025001 + i}`,
    khachHang: i % 3 === 0 ? "Nguyễn Văn A (Khách VIP)" : "Trần Thị B",
    sanPham: i % 2 === 0 ? "Tranh Gạo Chân Dung Khổ Lớn Cao Cấp" : "Tranh Phong Cảnh",
    tongTien: (5000000 + i * 100000).toLocaleString('vi-VN') + " VNĐ",
    ngayTao: `0${(i % 9) + 1}/01/2025`,
    trangThai: i % 4 === 0 ? "completed" : i % 3 === 0 ? "pending" : "processing",
    ghiChu: i % 3 === 0 ? "Giao hàng giờ hành chính, gọi trước 30p" : "Không có"
}));

const ORDER_FILTERS = [
  { key: 'all', label: 'TẤT CẢ' },
  { key: 'pending', label: 'CHỜ DUYỆT' },
  { key: 'processing', label: 'ĐANG XỬ LÝ' },
  { key: 'approved', label: 'ĐÃ DUYỆT' },
  { key: 'completed', label: 'HOÀN THÀNH' },
  { key: 'report', label: 'BÁO CÁO' },
];

export default function DonHangManager() {
    const [activeOrderFilter, setActiveOrderFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // 🟢 LỌC DỮ LIỆU THÔNG MINH
    const filteredOrders = useMemo(() => {
        const normalizedSearch = toNonAccentVietnamese(searchTerm);

        return MOCK_DATA.filter(order => {
            // Lọc theo Tab
            const matchStatus = activeOrderFilter === 'all' || order.trangThai === activeOrderFilter;
            
            // Lọc theo Tìm kiếm (Mã đơn + Tên khách)
            const matchSearch = toNonAccentVietnamese(order.id).includes(normalizedSearch) ||
                                toNonAccentVietnamese(order.khachHang).includes(normalizedSearch);

            return matchStatus && matchSearch;
        });
    }, [searchTerm, activeOrderFilter]);

    const renderTrangThai = (status: string) => {
        let colorClass = "bg-gray-500/20 text-gray-400 border-gray-500/30";
        let label = "KHÁC";
        let Icon = Clock;

        if (status === 'completed') { colorClass = "bg-green-500/20 text-green-400 border-green-500/30"; Icon = CheckCircle2; label = "HOÀN THÀNH"; } 
        else if (status === 'pending') { colorClass = "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"; Icon = AlertCircle; label = "CHỜ DUYỆT"; } 
        else if (status === 'processing') { colorClass = "bg-blue-500/20 text-blue-400 border-blue-500/30"; Icon = Clock; label = "ĐANG XỬ LÝ"; }
        
        return (
            <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorClass} font-bold text-[10px] uppercase tracking-wide w-fit whitespace-nowrap`}>
                <Icon size={12} /> {label}
            </span>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#050505]">
            
            {/* FILTERS & SEARCH */}
            <div className="p-4 border-b border-[#C69C6D]/20 bg-gradient-to-r from-[#0a0a0a] via-[#111] to-[#0a0a0a] flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 shadow-[0_5px_15px_rgba(0,0,0,0.3)] z-20">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full md:w-auto pb-2 md:pb-0">
                    <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
                    {ORDER_FILTERS.map((tab) => (
                        <button 
                            key={tab.key} 
                            onClick={() => setActiveOrderFilter(tab.key)} 
                            className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all border whitespace-nowrap uppercase tracking-wider
                                ${activeOrderFilter === tab.key 
                                    ? 'bg-[#C69C6D] text-black border-[#C69C6D] shadow-lg' 
                                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative group flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#C69C6D] transition-colors" size={14} />
                        <input 
                            type="text" 
                            placeholder="Tìm mã đơn, khách..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full bg-black border border-[#C69C6D]/30 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#C69C6D] font-bold uppercase placeholder:text-white/20" 
                        />
                    </div>
                    <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white/80 transition-colors"><Filter size={16} /></button>
                    <button className="p-2 bg-[#C69C6D]/10 border border-[#C69C6D]/30 rounded-lg hover:bg-[#C69C6D]/20 text-[#C69C6D] transition-colors"><Download size={16} /></button>
                </div>
            </div>

            {/* TABLE */}
            <div className="flex-1 overflow-auto bg-[#050505] relative custom-scrollbar p-4">
                <div className="bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                    <table className="w-full border-collapse min-w-[1000px]">
                        <thead className="bg-[#151515] border-b border-white/10">
                            <tr>
                                {['MÃ ĐƠN', 'KHÁCH HÀNG', 'SẢN PHẨM', 'NGÀY TẠO', 'TỔNG TIỀN', 'TRẠNG THÁI', 'GHI CHÚ', 'HÀNH ĐỘNG'].map((header, idx) => (
                                    <th key={idx} className="px-4 py-3 text-left text-[10px] font-black text-[#C69C6D] uppercase tracking-wider whitespace-nowrap">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-white/30 text-xs uppercase tracking-widest">
                                        Không tìm thấy đơn hàng nào
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-4 py-3 text-xs font-mono text-white/80 whitespace-nowrap">{row.id}</td>
                                        <td className="px-4 py-3 text-xs font-bold text-white whitespace-nowrap">{row.khachHang}</td>
                                        <td className="px-4 py-3 text-xs text-white/70 whitespace-nowrap max-w-[200px] truncate" title={row.sanPham}>{row.sanPham}</td>
                                        <td className="px-4 py-3 text-xs text-white/60 whitespace-nowrap font-mono">{row.ngayTao}</td>
                                        <td className="px-4 py-3 text-xs font-bold text-[#C69C6D] whitespace-nowrap font-mono">{row.tongTien}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{renderTrangThai(row.trangThai)}</td>
                                        <td className="px-4 py-3 text-xs text-white/50 italic whitespace-nowrap max-w-[150px] truncate" title={row.ghiChu}>{row.ghiChu}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <button className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FOOTER */}
            <div className="p-3 border-t border-[#C69C6D]/20 bg-[#0a0a0a] flex justify-between items-center shrink-0 text-[10px] text-white/60 font-bold uppercase tracking-wider">
                <span>HIỂN THỊ {filteredOrders.length} ĐƠN HÀNG</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors">TRƯỚC</button>
                    <button className="px-3 py-1.5 bg-[#C69C6D] text-black rounded font-black">1</button>
                    <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors">SAU</button>
                </div>
            </div>
        </div>
    );
}