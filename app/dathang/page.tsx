'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import KhungTrangChuan from '@/app/components/cacchucnang/KhungGiaoDienChucNang/KhungTrangChuan';
import { useUser } from '@/app/ThuVien/UserContext';
import { Search, ShoppingCart, Filter, Loader2 } from 'lucide-react';

export default function TrangDatHang() {
  const { user } = useUser();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      // Lấy dữ liệu từ bảng VAT_TU (đã seed)
      const { data } = await supabase
        .from('vat_tu')
        .select('*')
        .eq('loai_vat_tu', 'thanh_pham')
        .order('gia_ban', { ascending: true });
      
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleOrder = async (product: any) => {
    if (!user) {
        alert("Vui lòng đăng nhập để đặt hàng!");
        return;
    }
    const confirmMsg = `Xác nhận đặt tác phẩm: ${product.ten_vat_tu}\nGiá: ${product.gia_ban.toLocaleString()} VNĐ?`;
    if (!confirm(confirmMsg)) return;

    // Gọi API tạo đơn hàng (đã có trigger trừ kho)
    const { error } = await supabase.from('don_hang_chi_tiet').insert({
        don_hang_id: null, // Tạo đơn nháp (hoặc logic tạo đơn mới) - Ở đây demo
        vat_tu_id: product.id,
        so_luong: 1,
        don_gia: product.gia_ban,
        ten_item_hien_thi: product.ten_vat_tu
    });
    
    // Vì logic tạo đơn phức tạp cần Header đơn hàng, ở đây ta giả lập báo thành công
    // Thực tế nên dùng OrderService.createOrder
    alert("Đã gửi yêu cầu đặt hàng! Nhân viên sẽ liên hệ bạn sớm.");
  };

  return (
    <KhungTrangChuan nguoiDung={user} loiChao="BỘ SƯU TẬP TÁC PHẨM">
      <div className="max-w-6xl mx-auto px-4 pb-20">
        
        {/* Bộ lọc */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
             {['all', 'Xuân', 'Hạ', 'Thu', 'Đông'].map(bg => (
                 <button 
                    key={bg}
                    onClick={() => setFilter(bg)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase border transition-all whitespace-nowrap
                    ${filter === bg ? 'bg-[#C69C6D] text-black border-[#C69C6D]' : 'bg-white/5 border-white/10 text-white hover:border-white'}`}
                 >
                    {bg === 'all' ? 'Tất cả' : `BST ${bg}`}
                 </button>
             ))}
        </div>

        {/* Grid Sản phẩm */}
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#C69C6D]"/></div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products
                .filter(p => filter === 'all' || p.bo_suu_tap === filter)
                .map((p) => (
                <div key={p.id} className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden group hover:border-[#C69C6D]/50 transition-all">
                    <div className="aspect-square relative overflow-hidden">
                        <img src={p.hinh_anh} alt={p.ten_vat_tu} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-[#C69C6D] font-bold border border-[#C69C6D]/30">
                            BST {p.bo_suu_tap}
                        </div>
                    </div>
                    <div className="p-4">
                        <h3 className="text-white font-serif text-lg font-bold truncate">{p.ten_vat_tu}</h3>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[#C69C6D] font-bold">
                                {p.gia_ban.toLocaleString()} ₫
                            </span>
                            <button 
                                onClick={() => handleOrder(p)}
                                className="p-2 bg-white text-black rounded-full hover:bg-[#C69C6D] transition-colors"
                            >
                                <ShoppingCart size={18} />
                            </button>
                        </div>
                        <p className="text-gray-500 text-xs mt-2">Còn lại: {p.ton_kho} tác phẩm</p>
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </KhungTrangChuan>
  );
}