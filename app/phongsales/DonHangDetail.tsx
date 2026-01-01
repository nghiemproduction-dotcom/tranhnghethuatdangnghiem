'use client';
import React, { useEffect, useState } from 'react';
import { X, Printer, ShoppingBag, User, MapPin, Phone, Calendar } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';

export default function DonHangDetail({ data, isOpen, onClose }: any) {
    const [details, setDetails] = useState<any[]>([]);

    useEffect(() => {
        const fetchDetails = async () => {
            const { data: items } = await supabase
                .from('don_hang_chi_tiet')
                .select('*')
                .eq('don_hang_id', data.id);
            if (items) setDetails(items);
        };
        fetchDetails();
    }, [data]);

    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="relative w-full max-w-md mx-4 bg-[#0a0a0a] border border-[#C69C6D]/30 rounded-2xl shadow-2xl h-[85vh] flex flex-col overflow-hidden">
                
                {/* HEADER */}
                <div className="pt-6 pb-4 px-6 border-b border-white/10 bg-[#111] flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-lg font-black text-[#C69C6D] uppercase tracking-widest">{data.ma_don}</h2>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${data.trang_thai === 'hoan_thanh' ? 'bg-green-900/30 text-green-500' : 'bg-yellow-900/30 text-yellow-500'}`}>
                            {data.trang_thai === 'hoan_thanh' ? 'ĐÃ HOÀN THÀNH' : 'ĐANG XỬ LÝ'}
                        </span>
                    </div>
                    <button onClick={onClose}><X className="text-white/50 hover:text-white"/></button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>

                    {/* Khách hàng */}
                    <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-[#C69C6D] text-xs font-bold uppercase mb-1"><User size={14}/> Khách hàng</div>
                        <p className="text-white font-bold text-sm">{data.khach_hang?.ho_ten || 'Khách vãng lai'}</p>
                        <p className="text-white/60 text-xs flex items-center gap-2"><Phone size={12}/> {data.khach_hang?.so_dien_thoai || '---'}</p>
                        <p className="text-white/60 text-xs flex items-center gap-2"><Calendar size={12}/> {new Date(data.tao_luc).toLocaleString('vi-VN')}</p>
                    </div>

                    {/* Danh sách hàng */}
                    <h3 className="text-xs font-bold text-white/40 uppercase mb-3 flex items-center gap-2"><ShoppingBag size={12}/> Sản phẩm mua</h3>
                    <div className="space-y-3 mb-6">
                        {details.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-[#0f0f0f] border border-white/5 rounded-lg">
                                <div>
                                    <p className="text-white text-sm font-medium line-clamp-1">{item.ten_item_hien_thi}</p>
                                    <p className="text-[#C69C6D] text-xs">x{item.so_luong}</p>
                                </div>
                                <p className="text-white font-mono text-sm">{Number(item.thanh_tien || (item.so_luong * item.don_gia)).toLocaleString('vi-VN')}₫</p>
                            </div>
                        ))}
                    </div>

                    {/* Tổng kết */}
                    <div className="border-t border-dashed border-white/20 pt-4 space-y-2">
                        <div className="flex justify-between text-white/60 text-xs">
                            <span>Tạm tính</span>
                            <span>{Number(data.tong_tien).toLocaleString('vi-VN')}₫</span>
                        </div>
                        <div className="flex justify-between text-[#C69C6D] text-lg font-black">
                            <span>TỔNG CỘNG</span>
                            <span>{Number(data.tong_tien).toLocaleString('vi-VN')}₫</span>
                        </div>
                        <div className="flex justify-between text-green-500 text-xs font-bold">
                            <span>Đã thanh toán</span>
                            <span>{Number(data.da_thanh_toan).toLocaleString('vi-VN')}₫</span>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-white/5 bg-[#0f0f0f] flex gap-3 shrink-0">
                    <button className="flex-1 py-3 rounded-lg bg-[#C69C6D] text-black font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-white transition-colors">
                        <Printer size={16}/> IN HÓA ĐƠN
                    </button>
                </div>
            </div>
        </div>
    );
}