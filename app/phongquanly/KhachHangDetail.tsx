'use client';

import React from 'react';
import { X, User, Phone, Mail, MapPin, Edit3, ShoppingBag, Calendar, Trash2 } from 'lucide-react';

interface Props {
    data: any; 
    isOpen: boolean; 
    onClose: () => void; 
    onEdit: () => void;
    allowDelete?: boolean;
    onDelete?: (id: string) => void; // Update: Không cần Promise nữa vì chỉ mở dialog
}

export default function KhachHangDetail({ data, isOpen, onClose, onEdit, allowDelete = false, onDelete }: Props) {
    
    // Hàm này giờ chỉ đơn giản là kích hoạt sự kiện onDelete của cha
    const handleDeleteClick = () => {
        if (data && onDelete) {
            onDelete(data.id);
        }
    };

    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose}></div>
            
            <div className="relative w-full max-w-md mx-4 h-[85vh] bg-[#0a0a0a] border border-[#C69C6D]/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                
                {/* Header */}
                <div className="pt-6 pb-2 text-center shrink-0">
                    <h2 className="text-lg font-black text-[#C69C6D] uppercase tracking-[0.2em]">HỒ SƠ KHÁCH HÀNG</h2>
                    <p className="text-[10px] text-white/40 font-mono mt-1">ID: {data.id.split('-')[0]}</p>
                </div>

                {/* Body scrollable */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } `}</style>
                    <div className="flex flex-col items-center gap-5">
                        {/* Avatar */}
                        <div className="relative w-32 h-32 rounded-full border-4 border-[#C69C6D] p-1 bg-black shadow-[0_0_30px_rgba(198,156,109,0.3)]">
                            <div className="w-full h-full rounded-full overflow-hidden bg-[#1a1a1a] flex items-center justify-center">
                                {data.hinh_anh ? <img src={data.hinh_anh} className="w-full h-full object-cover" /> : <User size={48} className="text-[#C69C6D]/50" />}
                            </div>
                        </div>

                        {/* Name & Badge */}
                        <div className="text-center w-full">
                            <h3 className="text-2xl font-black text-white uppercase leading-none mb-2">{data.ho_ten}</h3>
                            <span className={`px-4 py-1 border rounded text-xs font-bold uppercase ${data.phan_loai_normalized === 'vip' ? 'bg-yellow-900/40 text-yellow-400 border-yellow-500' : 'bg-[#C69C6D]/20 text-[#C69C6D] border-[#C69C6D]/40'}`}>
                                {data.phan_loai || 'Khách Hàng'}
                            </span>
                        </div>

                        <div className="h-px w-full bg-white/10 my-1"></div>

                        {/* Info List */}
                        <div className="w-full space-y-3">
                            <InfoCard icon={Phone} label="SỐ ĐIỆN THOẠI" value={data.so_dien_thoai} action={() => window.open(`tel:${data.so_dien_thoai}`)} actionLabel="GỌI"/>
                            <InfoCard icon={Mail} label="EMAIL" value={data.email}/>
                            <InfoCard icon={MapPin} label="ĐỊA CHỈ" value={data.dia_chi}/>
                            {data.tao_luc && <InfoCard icon={Calendar} label="NGÀY THAM GIA" value={new Date(data.tao_luc).toLocaleDateString('vi-VN')}/>}
                            
                            <div className="p-3 rounded-xl bg-[#151515] border border-white/5 space-y-2 mt-2">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag size={14} className="text-[#C69C6D]" />
                                    <span className="text-[10px] font-black text-[#C69C6D] uppercase tracking-wider">LỊCH SỬ MUA HÀNG</span>
                                </div>
                                <p className="text-xs text-white/40 italic text-center py-2">Chưa có dữ liệu đơn hàng</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-white/5 bg-[#0f0f0f] flex gap-3 shrink-0">
                    <button onClick={onClose} className="flex-1 py-3 rounded-lg bg-white/5 text-gray-400 font-bold uppercase text-xs hover:text-white transition-colors">ĐÓNG</button>
                    <button onClick={onEdit} className="flex-[2] py-3 rounded-lg bg-[#C69C6D] text-black font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-white transition-colors"><Edit3 size={16}/> CHỈNH SỬA</button>
                    {allowDelete && (
                        <button onClick={handleDeleteClick} className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs flex items-center justify-center gap-2 transition-colors">
                            <Trash2 size={16}/> XÓA
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoCard({ icon: Icon, label, value, action, actionLabel }: any) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#151515] border border-white/5 w-full hover:border-[#C69C6D]/30 transition-colors">
            <div className="p-2 rounded-lg bg-black text-[#C69C6D]"><Icon size={16}/></div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-wider text-white/40 mb-0.5">{label}</p>
                <p className="text-sm font-bold text-gray-200 truncate">{value || '---'}</p>
            </div>
            {action && value && <button onClick={action} className="px-3 py-1.5 bg-white/10 hover:bg-[#C69C6D] text-white hover:text-black text-[9px] font-bold rounded uppercase transition-colors">{actionLabel}</button>}
        </div>
    );
}