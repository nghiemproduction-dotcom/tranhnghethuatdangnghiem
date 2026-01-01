'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@/app/ThuVien/UserContext';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { Package, Clock, CheckCircle, Truck, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PhongKhach() {
    const { user, loading } = useUser();
    const [orders, setOrders] = useState<any[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push('/CongDangNhap');
        if (user) fetchOrders();
    }, [user, loading]);

    const fetchOrders = async () => {
        // 🟢 FIX LỖI Ở ĐÂY: Thêm dòng này để chặn nếu user null
        if (!user) return; 

        // Lấy đơn hàng của chính user đang đăng nhập
        const { data } = await supabase
            .from('don_hang')
            .select(`
                *,
                don_hang_chi_tiet ( ten_item_hien_thi, so_luong, don_gia, thanh_tien )
            `)
            .eq('khach_hang_id', user.id) // Giờ thì user chắc chắn có rồi
            .order('tao_luc', { ascending: false });
        
        if (data) setOrders(data);
        setPageLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (pageLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-[#C69C6D]">Đang tải phòng khách...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Profile */}
                <div className="flex justify-between items-end mb-10 pb-6 border-b border-white/10">
                    <div>
                        <p className="text-[#C69C6D] text-xs font-bold uppercase tracking-widest mb-1">KHU VỰC KHÁCH HÀNG</p>
                        <h1 className="text-3xl font-black">Xin chào, {user?.ho_ten || 'Quý Khách'}</h1>
                    </div>
                    <button onClick={handleLogout} className="text-white/50 hover:text-white flex items-center gap-2 text-sm">
                        <LogOut size={16}/> Đăng xuất
                    </button>
                </div>

                {/* Danh sách đơn hàng */}
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Package size={20}/> Đơn hàng của bạn ({orders.length})</h2>
                
                <div className="space-y-6">
                    {orders.length === 0 && <p className="text-white/30 italic">Bạn chưa mua đơn hàng nào.</p>}
                    
                    {orders.map(order => (
                        <div key={order.id} className="bg-[#111] border border-white/10 rounded-2xl p-6 hover:border-[#C69C6D]/30 transition-all">
                            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-mono text-[#C69C6D] font-bold text-lg">#{order.ma_don}</span>
                                        <BadgeStatus status={order.trang_thai} />
                                    </div>
                                    <p className="text-white/40 text-xs">{new Date(order.tao_luc).toLocaleString('vi-VN')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40 text-xs uppercase">Tổng tiền</p>
                                    <p className="text-xl font-black">{Number(order.tong_tien).toLocaleString('vi-VN')}₫</p>
                                </div>
                            </div>

                            {/* Chi tiết sản phẩm */}
                            <div className="bg-black/30 rounded-xl p-4 space-y-3">
                                {order.don_hang_chi_tiet.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <div>
                                            <p className="font-bold text-white">{item.ten_item_hien_thi}</p>
                                            <p className="text-white/40 text-xs">x{item.so_luong}</p>
                                        </div>
                                        <span className="font-mono text-white/70">{Number(item.thanh_tien).toLocaleString('vi-VN')}₫</span>
                                    </div>
                                ))}
                            </div>

                            {/* Timeline tiến độ (Giả lập) */}
                            <div className="mt-6 flex items-center justify-between relative">
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10"></div>
                                <Step active={true} icon={Clock} label="Đã đặt" />
                                <Step active={['dang_xu_ly', 'dang_san_xuat', 'hoan_thanh'].includes(order.trang_thai)} icon={Package} label="Xử lý" />
                                <Step active={['dang_san_xuat', 'hoan_thanh'].includes(order.trang_thai)} icon={User} label="Đang vẽ" />
                                <Step active={order.trang_thai === 'hoan_thanh'} icon={Truck} label="Giao hàng" />
                                <Step active={order.trang_thai === 'hoan_thanh'} icon={CheckCircle} label="Hoàn tất" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function BadgeStatus({ status }: { status: string }) {
    const map: any = {
        'moi': { color: 'bg-blue-500/20 text-blue-500', label: 'MỚI ĐẶT' },
        'dang_xu_ly': { color: 'bg-yellow-500/20 text-yellow-500', label: 'ĐANG XỬ LÝ' },
        'dang_san_xuat': { color: 'bg-purple-500/20 text-purple-500', label: 'ĐANG VẼ' },
        'hoan_thanh': { color: 'bg-green-500/20 text-green-500', label: 'HOÀN THÀNH' },
        'huy': { color: 'bg-red-500/20 text-red-500', label: 'ĐÃ HỦY' },
    };
    const s = map[status] || map['moi'];
    return <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${s.color}`}>{s.label}</span>;
}

function Step({ active, icon: Icon, label }: any) {
    return (
        <div className={`flex flex-col items-center gap-2 bg-[#0a0a0a] px-2 ${active ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${active ? 'border-[#C69C6D] bg-[#C69C6D] text-black' : 'border-white/20 bg-black text-white'}`}>
                <Icon size={14} />
            </div>
            <span className={`text-[10px] font-bold uppercase ${active ? 'text-[#C69C6D]' : 'text-white/30'}`}>{label}</span>
        </div>
    );
}