'use client';
import React from 'react';
import { X, Edit3, Trash2, Package } from 'lucide-react';

export default function VatTuDetail({ data, isOpen, onClose, onEdit, onDelete }: any) {
    if (!isOpen || !data) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="relative w-full max-w-md mx-4 bg-[#0a0a0a] border border-[#C69C6D]/30 rounded-2xl shadow-2xl h-[85vh] flex flex-col overflow-hidden">
                <div className="pt-6 pb-2 text-center shrink-0"><h2 className="text-lg font-black text-[#C69C6D] uppercase tracking-[0.2em]">CHI TIẾT VẬT TƯ</h2></div>
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
                    <div className="flex flex-col items-center gap-5">
                        <div className="w-32 h-32 rounded-lg border-2 border-[#C69C6D] p-1 bg-black overflow-hidden">
                            {data.hinh_anh ? <img src={data.hinh_anh} className="w-full h-full object-cover rounded"/> : <div className="w-full h-full flex items-center justify-center text-white/20"><Package size={48}/></div>}
                        </div>
                        <div className="text-center w-full"><h3 className="text-xl font-black text-white uppercase">{data.ten_vat_tu}</h3><p className="text-[#C69C6D] font-mono mt-1">{data.ma_sku}</p></div>
                        <div className="w-full space-y-3">
                            <InfoRow label="Phân loại" value={data.loai_vat_tu === 'nguyen_lieu' ? 'Nguyên Liệu' : data.loai_vat_tu === 'thanh_pham' ? 'Thành Phẩm' : 'Dịch Vụ'}/>
                            <InfoRow label="Đơn vị" value={data.don_vi_tinh}/>
                            <InfoRow label="Tồn kho" value={data.ton_kho} highlight/>
                            <InfoRow label="Giá vốn" value={Number(data.gia_von).toLocaleString('vi-VN') + ' ₫'}/>
                            <InfoRow label="Giá bán" value={Number(data.gia_ban).toLocaleString('vi-VN') + ' ₫'}/>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-white/5 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-white/5 text-gray-400 font-bold uppercase text-xs rounded-lg">Đóng</button>
                    <button onClick={onEdit} className="flex-[2] py-3 bg-[#C69C6D] text-black font-bold uppercase text-xs rounded-lg flex justify-center gap-2"><Edit3 size={16}/> Sửa</button>
                    <button onClick={() => { if(confirm('Xóa?')) onDelete(data.id) }} className="flex-1 py-3 bg-red-600 text-white font-bold uppercase text-xs rounded-lg flex justify-center"><Trash2 size={16}/></button>
                </div>
            </div>
        </div>
    );
}
function InfoRow({ label, value, highlight }: any) {
    return <div className={`flex justify-between p-3 rounded-lg border ${highlight ? 'bg-[#C69C6D]/10 border-[#C69C6D]' : 'bg-white/5 border-white/10'}`}><span className="text-[10px] font-bold text-gray-400 uppercase">{label}</span><span className={`text-sm font-bold ${highlight ? 'text-[#C69C6D]' : 'text-white'}`}>{value}</span></div>
}