'use client';
import React, { useEffect, useState } from 'react';
import { Copy, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import { getCTVProductsAction } from '@/app/actions/QuyenHanCTV';

export default function SanPhamCTV() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await getCTVProductsAction();
            // 🟢 FIX LỖI Ở ĐÂY: Thêm || []
            if (res.success) setProducts(res.data || []);
            setLoading(false);
        };
        load();
    }, []);

    const copyContent = (p: any) => {
        const text = `🌸 ${p.ten_vat_tu}\n💰 Giá: ${Number(p.gia_ban).toLocaleString('vi-VN')}đ\n📦 Hàng sẵn kho\n👉 Inbox để đặt hàng ngay!`;
        navigator.clipboard.writeText(text);
        alert("Đã copy nội dung! Dán vào Facebook/Zalo để đăng bài.");
    };

    if (loading) return <div className="flex justify-center mt-10"><Loader2 className="animate-spin text-[#C69C6D]"/></div>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {products.map(p => (
                <div key={p.id} className="bg-[#111] border border-white/10 rounded-xl overflow-hidden group hover:border-[#C69C6D]/50 transition-all">
                    <div className="aspect-square bg-black relative">
                        {p.hinh_anh ? <img src={p.hinh_anh} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon size={32}/></div>}
                        <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white font-bold border border-white/10">Tồn: {p.ton_kho}</div>
                    </div>
                    <div className="p-3">
                        <h3 className="text-white font-bold text-sm truncate mb-1">{p.ten_vat_tu}</h3>
                        <p className="text-[#C69C6D] font-mono font-bold text-xs mb-3">{Number(p.gia_ban).toLocaleString('vi-VN')}₫</p>
                        <button onClick={() => copyContent(p)} className="w-full py-2 bg-white/10 hover:bg-[#C69C6D] hover:text-black text-white text-[10px] font-bold uppercase rounded flex items-center justify-center gap-2 transition-colors active:scale-95">
                            <Copy size={12}/> Copy Bài Đăng
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}