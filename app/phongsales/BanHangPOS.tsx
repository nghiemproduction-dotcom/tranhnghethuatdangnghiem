'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Trash2, User, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { getProductsForPOS, searchCustomer, createPOSOrder } from '@/app/actions/QuyenHanSales';

export default function BanHangPOS() {
    // State Sản phẩm
    const [products, setProducts] = useState<any[]>([]);
    const [searchProd, setSearchProd] = useState('');
    
    // State Giỏ hàng
    const [cart, setCart] = useState<any[]>([]);
    const [customer, setCustomer] = useState<any>(null);
    const [searchCust, setSearchCust] = useState('');
    const [foundCusts, setFoundCusts] = useState<any[]>([]);
    const [showCustSearch, setShowCustSearch] = useState(false);

    // State Thanh toán
    const [payment, setPayment] = useState({ paid: '', note: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Load sản phẩm ban đầu
    useEffect(() => {
        const load = async () => {
            const res = await getProductsForPOS('');
            if (res.success) setProducts(res.data || []);
        };
        load();
    }, []);

    // 2. Tìm sản phẩm realtime
    useEffect(() => {
        const timer = setTimeout(async () => {
            const res = await getProductsForPOS(searchProd);
            if (res.success) setProducts(res.data || []);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchProd]);

    // 3. Tìm khách hàng realtime
    useEffect(() => {
        if (!searchCust.trim()) { setFoundCusts([]); return; }
        const timer = setTimeout(async () => {
            const res = await searchCustomer(searchCust);
            if (res.success) setFoundCusts(res.data || []);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchCust]);

    // Cart Actions
    const addToCart = (prod: any) => {
        setCart(prev => {
            const exist = prev.find(i => i.id === prod.id);
            if (exist) return prev.map(i => i.id === prod.id ? { ...i, so_luong: i.so_luong + 1 } : i);
            return [...prev, { ...prod, so_luong: 1, don_gia: prod.gia_ban }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.id === id) {
                const newQty = Math.max(1, i.so_luong + delta);
                return { ...i, so_luong: newQty };
            }
            return i;
        }));
    };

    // Tính toán
    const total = cart.reduce((sum, item) => sum + (item.so_luong * item.don_gia), 0);

    // Submit Đơn
    const handleCheckout = async () => {
        if (cart.length === 0) return alert("Giỏ hàng trống!");
        if (!customer) return alert("Chưa chọn khách hàng!");
        
        if (!confirm(`Xác nhận thanh toán đơn hàng ${total.toLocaleString('vi-VN')} VNĐ?`)) return;

        setIsSubmitting(true);
        const paidAmount = payment.paid ? Number(payment.paid.replace(/\./g, '')) : total;

        const orderData = {
            khach_hang_id: customer.id,
            tong_tien: total,
            da_thanh_toan: paidAmount, // Mặc định thanh toán full nếu không nhập
            ghi_chu: payment.note,
            items: cart
        };

        const res = await createPOSOrder(orderData);
        setIsSubmitting(false);

        if (res.success) {
            alert(`✅ Đơn hàng ${res.ma_don} đã tạo thành công!`);
            setCart([]);
            setCustomer(null);
            setPayment({ paid: '', note: '' });
        } else {
            alert("Lỗi: " + res.error);
        }
    };

    return (
        <div className="w-full h-full flex flex-col md:flex-row bg-[#0a0a0a] text-white overflow-hidden">
            {/* LEFT: PRODUCTS LIST */}
            <div className="flex-1 flex flex-col border-r border-white/10">
                <div className="p-4 border-b border-white/10 bg-[#111]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
                        <input 
                            className="w-full bg-black border border-white/20 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-[#C69C6D] outline-none"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchProd}
                            onChange={e => setSearchProd(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 scrollbar-hide">
                    <style jsx>{` .scrollbar-hide::-webkit-scrollbar { display: none; } `}</style>
                    {products.map(p => (
                        <div key={p.id} onClick={() => addToCart(p)} className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:border-[#C69C6D] hover:-translate-y-1 transition-all group">
                            <div className="aspect-square bg-black relative">
                                <img src={p.hinh_anh} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10">
                                    Kho: {p.ton_kho}
                                </div>
                            </div>
                            <div className="p-3">
                                <h4 className="text-sm font-bold truncate mb-1">{p.ten_vat_tu}</h4>
                                <p className="text-[#C69C6D] font-mono font-bold text-xs">{Number(p.gia_ban).toLocaleString('vi-VN')}₫</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: CART & CHECKOUT */}
            <div className="w-full md:w-[400px] flex flex-col bg-[#0f0f0f] shadow-2xl z-20">
                {/* Customer Select */}
                <div className="p-4 border-b border-white/10">
                    {!customer ? (
                        <div className="relative">
                            <div className="flex items-center bg-black border border-white/20 rounded-xl p-2 focus-within:border-[#C69C6D]">
                                <User className="text-gray-500 ml-2" size={18}/>
                                <input 
                                    className="bg-transparent w-full p-2 outline-none text-sm"
                                    placeholder="Tìm khách hàng (Tên/SĐT)..."
                                    value={searchCust}
                                    onChange={e => { setSearchCust(e.target.value); setShowCustSearch(true); }}
                                    onFocus={() => setShowCustSearch(true)}
                                />
                            </div>
                            {showCustSearch && foundCusts.length > 0 && (
                                <div className="absolute top-full left-0 right-0 bg-[#1a1a1a] border border-white/20 mt-1 rounded-xl shadow-xl z-50 overflow-hidden">
                                    {foundCusts.map(c => (
                                        <div key={c.id} onClick={() => { setCustomer(c); setShowCustSearch(false); setSearchCust(''); }} className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0">
                                            <p className="font-bold text-sm text-white">{c.ho_ten}</p>
                                            <p className="text-xs text-[#C69C6D]">{c.so_dien_thoai}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-[#C69C6D]/10 border border-[#C69C6D]/30 p-3 rounded-xl">
                            <div>
                                <p className="font-bold text-[#C69C6D]">{customer.ho_ten}</p>
                                <p className="text-xs text-white/50">{customer.so_dien_thoai}</p>
                            </div>
                            <button onClick={() => setCustomer(null)} className="p-1 hover:bg-white/10 rounded"><Trash2 size={16} className="text-red-400"/></button>
                        </div>
                    )}
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-white/20">
                            <ShoppingCart size={48} className="mb-2"/>
                            <p className="text-xs font-bold uppercase">Giỏ hàng trống</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                <div className="w-12 h-12 bg-black rounded overflow-hidden shrink-0"><img src={item.hinh_anh} className="w-full h-full object-cover"/></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">{item.ten_vat_tu}</p>
                                    <p className="text-xs text-[#C69C6D]">{Number(item.don_gia).toLocaleString('vi-VN')}₫</p>
                                </div>
                                <div className="flex items-center gap-2 bg-black rounded-lg p-1">
                                    <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:text-[#C69C6D] w-6 h-6 flex items-center justify-center font-bold">-</button>
                                    <span className="text-sm font-bold w-4 text-center">{item.so_luong}</span>
                                    <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:text-[#C69C6D] w-6 h-6 flex items-center justify-center font-bold">+</button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-500"><Trash2 size={16}/></button>
                            </div>
                        ))
                    )}
                </div>

                {/* Payment Section */}
                <div className="p-4 bg-[#111] border-t border-white/10 space-y-3">
                    <div className="flex justify-between items-end text-white">
                        <span className="text-xs font-bold uppercase text-gray-500">Tổng tiền</span>
                        <span className="text-2xl font-black text-[#C69C6D]">{total.toLocaleString('vi-VN')}₫</span>
                    </div>
                    
                    <div className="space-y-2">
                         <input 
                            className="w-full bg-black border border-white/20 rounded-lg p-2 text-sm text-right font-mono"
                            placeholder="Tiền khách đưa (Mặc định full)"
                            value={payment.paid}
                            onChange={e => {
                                const val = e.target.value.replace(/\D/g, '');
                                setPayment({...payment, paid: Number(val).toLocaleString('vi-VN')});
                            }}
                        />
                        <input 
                            className="w-full bg-black border border-white/20 rounded-lg p-2 text-xs"
                            placeholder="Ghi chú đơn hàng..."
                            value={payment.note}
                            onChange={e => setPayment({...payment, note: e.target.value})}
                        />
                    </div>

                    <button 
                        onClick={handleCheckout}
                        disabled={isSubmitting || cart.length === 0}
                        className="w-full py-4 bg-[#C69C6D] hover:bg-white hover:text-black text-black font-black uppercase text-sm rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin"/> : <CheckCircle2/>}
                        THANH TOÁN & IN BILL
                    </button>
                </div>
            </div>
        </div>
    );
}