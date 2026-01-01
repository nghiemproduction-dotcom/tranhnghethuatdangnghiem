'use client';
import React from 'react';
import { X, Edit3, Trash2, Wallet } from 'lucide-react';

export default function ThuChiDetail({ data, isOpen, onClose, onEdit, onDelete }: any) {
    if (!isOpen || !data) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="relative w-full max-w-md mx-4 bg-[#0a0a0a] border border-[#C69C6D]/30 rounded-2xl shadow-2xl">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-3 rounded-full ${data.loai_giao_dich === 'thu' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}><Wallet size={24}/></div>
                        <button onClick={onClose}><X className="text-gray-400 hover:text-white"/></button>
                    </div>
                    <h2 className={`text-3xl font-bold mb-1 ${data.loai_giao_dich === 'thu' ? 'text-green-500' : 'text-red-500'}`}>
                        {data.loai_giao_dich === 'thu' ? '+' : '-'}{Number(data.so_tien).toLocaleString('vi-VN')} ₫
                    </h2>
                    <p className="text-white/60 text-sm mb-6 uppercase tracking-wider font-bold">{data.loai_giao_dich === 'thu' ? 'THU TIỀN' : 'CHI PHÍ'}</p>
                    
                    <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                        <div><p className="text-[10px] text-gray-500 uppercase font-bold">NỘI DUNG</p><p className="text-white">{data.mo_ta}</p></div>
                        <div><p className="text-[10px] text-gray-500 uppercase font-bold">THỜI GIAN</p><p className="text-white">{new Date(data.tao_luc).toLocaleString('vi-VN')}</p></div>
                        <div><p className="text-[10px] text-gray-500 uppercase font-bold">NGƯỜI THỰC HIỆN</p><p className="text-[#C69C6D] font-bold">{data.nguoi_thuc_hien_ten || 'Hệ thống'}</p></div>
                        {data.hinh_anh_chung_tu && <div><p className="text-[10px] text-gray-500 uppercase font-bold mb-2">CHỨNG TỪ</p><img src={data.hinh_anh_chung_tu} className="w-full rounded border border-white/10"/></div>}
                    </div>
                </div>
                <div className="p-4 border-t border-white/5 flex gap-3">
                    <button onClick={onEdit} className="flex-[2] py-3 bg-[#C69C6D] text-black font-bold uppercase text-xs rounded-lg flex justify-center gap-2"><Edit3 size={16}/> Sửa</button>
                    <button onClick={() => { if(confirm('Xóa?')) onDelete(data.id) }} className="flex-1 py-3 bg-red-600 text-white font-bold uppercase text-xs rounded-lg flex justify-center"><Trash2 size={16}/></button>
                </div>
            </div>
        </div>
    );
}