'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { X, Search, Plus, Edit, Trash2, User, Loader2 } from 'lucide-react';
import NhanSuDetail from './NhanSuDetail';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function NhanSuModal({ isOpen, onClose }: Props) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null); // ID để mở Detail

    const fetchData = async () => {
        setLoading(true);
        let query = supabase.from('nhan_su').select('*').order('tao_luc', { ascending: false });
        
        if (search) {
            query = query.or(`ho_ten.ilike.%${search}%,vi_tri.ilike.%${search}%,so_dien_thoai.ilike.%${search}%`);
        }

        const { data: res } = await query;
        if (res) setData(res);
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) fetchData();
    }, [isOpen]);

    // Xử lý Search khi nhấn Enter
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') fetchData();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-6xl h-[90vh] bg-[#0a0807] border border-[#8B5E3C]/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
                
                {/* HEADER MODAL */}
                <div className="h-16 border-b border-[#8B5E3C]/20 bg-[#161210] flex items-center justify-between px-6 shrink-0">
                    <h2 className="text-lg font-bold text-[#F5E6D3] uppercase tracking-widest flex items-center gap-2">
                        <User className="text-[#C69C6D]"/> Quản Lý Nhân Sự
                    </h2>
                    <button onClick={onClose} className="p-2 text-[#8B5E3C] hover:text-white rounded-full hover:bg-white/10 transition-colors">
                        <X size={24}/>
                    </button>
                </div>

                {/* TOOLBAR */}
                <div className="p-4 bg-[#110d0c] border-b border-[#8B5E3C]/10 flex gap-3">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B5E3C]"/>
                        <input 
                            type="text" 
                            placeholder="Tìm theo tên, vị trí, sđt..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-[#0a0807] border border-[#8B5E3C]/30 rounded-lg pl-10 pr-4 py-2 text-sm text-[#F5E6D3] outline-none focus:border-[#C69C6D]"
                        />
                    </div>
                    <button onClick={() => fetchData()} className="px-4 py-2 bg-[#2a1e1b] text-[#8B5E3C] hover:text-[#F5E6D3] rounded-lg text-xs font-bold uppercase border border-[#8B5E3C]/20">
                        Tìm Kiếm
                    </button>
                    <button onClick={() => setSelectedId(-1)} className="px-4 py-2 bg-[#C69C6D] text-[#1a120f] hover:bg-[#b08b5e] rounded-lg text-xs font-bold uppercase flex items-center gap-2 shadow-lg">
                        <Plus size={16}/> Thêm Mới
                    </button>
                </div>

                {/* TABLE CONTENT */}
                <div className="flex-1 overflow-auto custom-scroll bg-[#0a0807] p-4">
                    {loading ? (
                        <div className="h-full flex items-center justify-center text-[#C69C6D]"><Loader2 className="animate-spin" size={32}/></div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.map((item) => (
                                <div 
                                    key={item.id} 
                                    onClick={() => setSelectedId(item.id)}
                                    className="bg-[#1a120f] border border-[#8B5E3C]/20 rounded-xl p-4 cursor-pointer hover:border-[#C69C6D] hover:bg-[#221a18] transition-all group flex flex-col gap-3 relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-[#0a0807] border border-[#8B5E3C]/30 overflow-hidden flex items-center justify-center shrink-0">
                                            {item.avatar || item.hinh_anh ? (
                                                <img src={item.avatar || item.hinh_anh} className="w-full h-full object-cover"/>
                                            ) : (
                                                <User size={24} className="text-[#5D4037]"/>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-[#F5E6D3] text-sm truncate group-hover:text-[#C69C6D] transition-colors">{item.ho_ten || 'Chưa đặt tên'}</h3>
                                            <p className="text-xs text-[#8B5E3C] truncate">{item.vi_tri || 'Chưa phân loại'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 text-[10px] text-[#5D4037] border-t border-[#8B5E3C]/10 pt-2 mt-auto">
                                        <span className="truncate flex-1">SĐT: {item.so_dien_thoai || '-'}</span>
                                        <span className="truncate text-right">ID: {item.id}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* DETAIL MODAL (Level 3) */}
            {selectedId !== null && (
                <NhanSuDetail 
                    id={selectedId} 
                    onClose={() => setSelectedId(null)} 
                    onSuccess={() => { setSelectedId(null); fetchData(); }} 
                />
            )}
        </div>
    );
}