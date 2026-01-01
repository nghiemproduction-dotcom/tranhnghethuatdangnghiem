'use client';

import React, { useState } from 'react';
import { 
    X, User, Phone, Mail, MapPin, CreditCard, Edit3, 
    ShieldCheck, Clock, Percent, Banknote, Hash, Trash2, Loader2 
} from 'lucide-react';

interface NhanSuDetailProps {
    data: any;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    allowDelete?: boolean;
    onDelete?: (id: string) => Promise<void>;
}

export default function NhanSuDetail({ data, isOpen, onClose, onEdit, allowDelete = false, onDelete }: NhanSuDetailProps) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!data || !onDelete) return;
        if (!confirm(`Bạn có chắc muốn xóa nhân sự: ${data.ho_ten}?`)) return;
        setDeleting(true);
        await onDelete(data.id);
        setDeleting(false);
        onClose();
    };
    if (!isOpen || !data) return null;

    // Helper format tiền
    const formatMoney = (amount: any) => {
        if (!amount && amount !== 0) return '0 VNĐ';
        return Number(amount).toLocaleString('vi-VN') + ' VNĐ';
    };

    // Tính lương theo giờ hiển thị (nếu DB chưa có hoặc bằng 0)
    const luongTheoGio = data.luong_theo_gio > 0 
        ? data.luong_theo_gio 
        : (data.luong_thang ? Math.round((data.luong_thang / 24 / 8) / 1000) * 1000 : 0);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            {/* Click ra ngoài để đóng */}
            <div className="absolute inset-0" onClick={onClose}></div>

            {/* Modal Container: Đồng bộ 100% kích thước với FormNhanSu */}
            <div className="relative w-full max-w-md mx-4 h-[85vh] bg-[#0a0a0a] border border-[#C69C6D]/30 rounded-2xl shadow-[0_0_50px_rgba(198,156,109,0.15)] flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
                
                {/* HEADER: Tiêu đề nhỏ gọn */}
                <div className="pt-6 pb-2 px-6 text-center shrink-0">
                    <h2 className="text-lg font-black text-[#C69C6D] uppercase tracking-[0.2em] glow-text">
                        HỒ SƠ NHÂN SỰ
                    </h2>
                    <p className="text-[10px] text-white/40 font-mono mt-1 uppercase tracking-widest">
                        ID: {data.id.split('-')[0]}
                    </p>
                </div>

                {/* BODY: Cuộn nội dung - Sắp xếp đúng thứ tự Form */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>

                    <div className="flex flex-col items-center gap-5">
                        
                        {/* 1. HÌNH ẢNH (Trên cùng) */}
                        <div className="relative w-32 h-32 rounded-full border-4 border-[#C69C6D] p-1 bg-black shadow-[0_0_30px_rgba(198,156,109,0.3)] mb-2 clip-game-btn">
                            <div className="w-full h-full rounded-full overflow-hidden bg-[#1a1a1a] flex items-center justify-center">
                                {data.hinh_anh ? (
                                    <img src={data.hinh_anh} alt={data.ho_ten} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} className="text-[#C69C6D]/50" />
                                )}
                            </div>
                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-black rounded-full"></div>
                        </div>

                        {/* 2. HỌ TÊN */}
                        <div className="text-center w-full">
                            <h3 className="text-2xl font-black text-white uppercase tracking-wide leading-none mb-1">
                                {data.ho_ten}
                            </h3>
                        </div>

                        {/* 3. VỊ TRÍ */}
                        <div className="w-full">
                            <div className="flex items-center justify-center">
                                <span className="px-6 py-2 bg-[#C69C6D]/20 text-[#C69C6D] border border-[#C69C6D]/40 rounded-lg text-sm font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(198,156,109,0.2)]">
                                    {data.vi_tri || 'CHƯA CẬP NHẬT'}
                                </span>
                            </div>
                        </div>

                        <div className="h-px w-full bg-white/10 my-1"></div>

                        {/* DANH SÁCH CHI TIẾT (Khớp thứ tự Form) */}
                        <div className="w-full space-y-3">
                            
                            {/* 4. EMAIL */}
                            <InfoCard 
                                icon={Mail} 
                                label="EMAIL LIÊN HỆ" 
                                value={data.email} 
                            />

                            {/* 5. SỐ ĐIỆN THOẠI */}
                            <InfoCard 
                                icon={Phone} 
                                label="SỐ ĐIỆN THOẠI" 
                                value={data.so_dien_thoai} 
                                action={() => window.open(`tel:${data.so_dien_thoai}`)}
                                actionLabel="GỌI NGAY"
                            />

                            {/* 6. LƯƠNG CỨNG */}
                            <InfoCard 
                                icon={Banknote} 
                                label="LƯƠNG CỨNG (THÁNG)" 
                                value={formatMoney(data.luong_thang)} 
                                highlight
                            />

                            {/* 7 & 8. LƯƠNG GIỜ & THƯỞNG */}
                            <div className="grid grid-cols-2 gap-3">
                                <InfoCard 
                                    icon={Clock} 
                                    label="LƯƠNG THEO GIỜ" 
                                    value={formatMoney(luongTheoGio)} 
                                />
                                <InfoCard 
                                    icon={Percent} 
                                    label="THƯỞNG DOANH SỐ" 
                                    value={data.thuong_doanh_thu ? `${data.thuong_doanh_thu}%` : '0%'} 
                                />
                            </div>

                            {/* 9 & 10. NGÂN HÀNG & SỐ TÀI KHOẢN */}
                            <div className="p-3 rounded-xl bg-[#151515] border border-white/5 space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <ShieldCheck size={14} className="text-[#C69C6D]" />
                                    <span className="text-[10px] font-black text-[#C69C6D] uppercase tracking-wider">THÔNG TIN THANH TOÁN</span>
                                </div>
                                <div className="grid grid-cols-1 gap-2 pl-2 border-l-2 border-[#C69C6D]/30">
                                    <div>
                                        <p className="text-[9px] text-white/40 font-bold uppercase">NGÂN HÀNG</p>
                                        <p className="text-sm font-bold text-white">{data.ngan_hang || '---'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-white/40 font-bold uppercase">SỐ TÀI KHOẢN</p>
                                        <p className="text-sm font-bold text-white font-mono tracking-wide">{data.so_tai_khoan || '---'}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* FOOTER ACTIONS - Đồng bộ với FormNhanSu */}
                <div className="p-4 border-t border-white/5 bg-[#0f0f0f] flex gap-3 shrink-0">
                    <button 
                        onClick={onClose} 
                        className="flex-1 py-3 rounded-lg bg-white/5 text-gray-400 font-bold uppercase text-xs hover:bg-white/10 hover:text-white transition-all clip-game-btn"
                    >
                        ĐÓNG
                    </button>
                    <button 
                        onClick={onEdit} 
                        className="flex-[2] py-3 rounded-lg bg-[#C69C6D] hover:bg-white hover:text-black text-black font-black uppercase text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 clip-game-btn"
                    >
                        <Edit3 size={16} />
                        CHỈNH SỬA
                    </button>
                    {allowDelete && (
                        <button 
                            onClick={handleDelete} 
                            disabled={deleting}
                            className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                        >
                            {deleting ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16}/>} XÓA
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Component con: Dòng thông tin
function InfoCard({ icon: Icon, label, value, highlight = false, action, actionLabel }: any) {
    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all group w-full
            ${highlight 
                ? 'bg-[#C69C6D]/10 border-[#C69C6D]/40' 
                : 'bg-[#151515] border-white/5 hover:border-white/20'
            }
        `}>
            <div className={`p-2 rounded-lg shrink-0 ${highlight ? 'bg-[#C69C6D] text-black' : 'bg-black text-[#C69C6D]'}`}>
                <Icon size={16} />
            </div>
            
            <div className="flex-1 min-w-0 overflow-hidden">
                <p className={`text-[9px] font-black uppercase tracking-wider mb-0.5 ${highlight ? 'text-[#C69C6D]' : 'text-white/40'}`}>
                    {label}
                </p>
                <p className={`text-sm font-bold truncate ${highlight ? 'text-white' : 'text-gray-200'}`}>
                    {value || '---'}
                </p>
            </div>

            {action && value && (
                <button 
                    onClick={(e) => { e.stopPropagation(); action(); }}
                    className="px-3 py-1.5 bg-white/10 hover:bg-[#C69C6D] text-white hover:text-black text-[9px] font-bold rounded uppercase transition-colors shrink-0"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}