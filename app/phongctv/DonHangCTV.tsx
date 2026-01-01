'use client';
import React, { useState, useEffect } from 'react';
import { Send, User, MapPin, Phone, Search, Plus, Loader2 } from 'lucide-react';
import { getCTVProductsAction, createCTVOrderAction } from '@/app/actions/QuyenHanCTV';

export default function DonHangCTV() {
    const [products, setProducts] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [customer, setCustomer] = useState({ ho_ten: '', sdt: '', dia_chi: '' });
    const [searchProd, setSearchProd] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const load = async () => {
            const res = await getCTVProductsAction();
            // 🟢 FIX LỖI Ở ĐÂY: Thêm || []
            if (res.success) setProducts(res.data || []);
        };
        load();
    }, []);

    const addToCart = (p: any) => {
        setCart(prev => {
            const exist = prev.find(i => i.id === p.id);
            if(exist) return prev.map(i => i.id === p.id ? {...i, so_luong: i.so_luong + 1} : i);
            return [...prev, {...p, so_luong: 1}];
        });
    };

    const total = cart.reduce((sum, i) => sum + (i.so_luong * i.gia_ban), 0);

    const handleSubmit = async () => {
        if(cart.length === 0) return alert("Chưa chọn sản phẩm");
        if(!customer.ho_ten || !customer.sdt) return alert("Thiếu thông tin khách hàng");
        
        setSubmitting(true);
        const res = await createCTVOrderAction({
            khach_moi: customer,
            items: cart.map(i => ({ id: i.id, ten_vat_tu: i.ten_vat_tu, so_luong: i.so_luong, don_gia: i.gia_ban })),
            tong_tien: total,
            ghi_chu: "Đơn từ CTV App"
        });
        
        setSubmitting(false);
        if(res.success) {
            alert(`✅ Lên đơn thành công! Mã đơn: ${res.ma_don}`);
            setCart([]);
            setCustomer({ ho_ten: '', sdt: '', dia_chi: '' });
        } else {
            alert("Lỗi: " + res.error);
        }
    };

    const filteredProds = products.filter(p => p.ten_vat_tu.toLowerCase().includes(searchProd.toLowerCase()));

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full pb-20">
            {/* Cột trái: Chọn hàng */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16}/>
                    <input className="w-full bg-[#111] border border-white/10 rounded-lg pl-9 p-3 text-sm text-white outline-none focus:border-[#C69C6D]" placeholder="Tìm sản phẩm..." value={searchProd} onChange={e => setSearchProd(e.target.value)}/>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 max-h-[400px] md:max-h-full">
                    {filteredProds.map(p => (
                        <div key={p.id} onClick={() => addToCart(p)} className="flex items-center gap-3 p-2 bg-[#111] border border-white/5 rounded-lg cursor-pointer hover:border-[#C69C6D]/50 transition-all">
                            <img src={p.hinh_anh} className="w-12 h-12 rounded object-cover"/>
                            <div className="flex-1">
                                <p className="text-white text-xs font-bold">{p.ten_vat_tu}</p>
                                <p className="text-[#C69C6D] text-xs font-mono">{Number(p.gia_ban).toLocaleString('vi-VN')}₫</p>
                            </div>
                            <button className="bg-[#C69C6D]/20 text-[#C69C6D] p-1 rounded hover:bg-[#C69C6D] hover:text-black"><Plus size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cột phải: Form thông tin */}
            <div className="w-full md:w-[350px] bg-[#111] border border-white/10 rounded-2xl p-4 flex flex-col">
                <h3 className="text-[#C69C6D] font-black uppercase text-xs mb-4">THÔNG TIN KHÁCH HÀNG</h3>
                <div className="space-y-3 mb-4">
                    <div className="flex items-center bg-black border border-white/10 rounded px-3 py-2">
                        <User size={16} className="text-white/30 mr-2"/>
                        <input className="bg-transparent outline-none text-white text-sm w-full" placeholder="Họ tên khách" value={customer.ho_ten} onChange={e => setCustomer({...customer, ho_ten: e.target.value})}/>
                    </div>
                    <div className="flex items-center bg-black border border-white/10 rounded px-3 py-2">
                        <Phone size={16} className="text-white/30 mr-2"/>
                        <input className="bg-transparent outline-none text-white text-sm w-full" placeholder="Số điện thoại" value={customer.sdt} onChange={e => setCustomer({...customer, sdt: e.target.value})}/>
                    </div>
                    <div className="flex items-center bg-black border border-white/10 rounded px-3 py-2">
                        <MapPin size={16} className="text-white/30 mr-2"/>
                        <input className="bg-transparent outline-none text-white text-sm w-full" placeholder="Địa chỉ giao hàng" value={customer.dia_chi} onChange={e => setCustomer({...customer, dia_chi: e.target.value})}/>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto mb-4 border-t border-b border-white/5 py-2 space-y-2">
                    {cart.map((i, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-white">
                            <span>{i.ten_vat_tu} (x{i.so_luong})</span>
                            <span className="font-mono">{Number(i.gia_ban * i.so_luong).toLocaleString('vi-VN')}₫</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-end mb-4">
                    <span className="text-white/50 text-xs font-bold uppercase">Tổng tiền</span>
                    <span className="text-xl font-black text-[#C69C6D]">{total.toLocaleString('vi-VN')}₫</span>
                </div>

                <button onClick={handleSubmit} disabled={submitting} className="w-full py-3 bg-[#C69C6D] hover:bg-white text-black font-black uppercase text-xs rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                    {submitting ? <Loader2 className="animate-spin"/> : <Send size={16}/>} LÊN ĐƠN NGAY
                </button>
            </div>
        </div>
    );
}