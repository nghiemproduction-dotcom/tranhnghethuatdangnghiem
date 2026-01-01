'use client';

import React, { useState, useEffect } from 'react';
import { Star, Plus, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { useRouter } from 'next/navigation';

interface ProductData {
  id: string; // Đổi sang string vì UUID
  ten_vat_tu: string;
  gia_ban: number;
  hinh_anh: string;
  bo_suu_tap: string;
}

export default function Slider2() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  // Tự động trượt
  useEffect(() => {
    if (products.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev === products.length - 1 ? 0 : prev + 1));
    }, 4000); // 4 giây trượt 1 lần
    return () => clearInterval(timer);
  }, [products]);

  const fetchProducts = async () => {
    setLoading(true);
    // 👇 LẤY DỮ LIỆU TỪ BẢNG VAT_TU (Dữ liệu thật)
    const { data, error } = await supabase
      .from('vat_tu')
      .select('id, ten_vat_tu, gia_ban, hinh_anh, bo_suu_tap')
      .eq('loai_vat_tu', 'thanh_pham') // Chỉ lấy thành phẩm
      .not('hinh_anh', 'is', null)     // Chỉ lấy cái nào có ảnh
      .limit(10); // Lấy 10 cái tiêu biểu

    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleBuy = (id: string) => {
    router.push(`/dathang?product=${id}`);
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-[#C69C6D]"/></div>;
  if (products.length === 0) return null;

  return (
    <div className="w-full bg-black/40 backdrop-blur-md border border-white/5 rounded-xl p-4 md:p-6 relative group/container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#C69C6D] text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <Star size={14} fill="currentColor" /> Tác phẩm tiêu biểu ({products.length})
        </h3>
      </div>

      {/* VIEWPORT */}
      <div className="overflow-hidden w-full rounded-lg relative">
        <div 
          className="flex transition-transform duration-700 ease-in-out will-change-transform"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {products.map((item) => (
            <div key={item.id} className="w-full flex-shrink-0 px-2 relative group">
              <div className="relative overflow-hidden rounded-lg aspect-video md:aspect-[21/9] border border-white/10">
                <img 
                   src={item.hinh_anh} alt={item.ten_vat_tu} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                
                {/* Text Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <div className="flex justify-between items-end">
                    <div>
                        <span className="text-[10px] bg-[#C69C6D] text-black px-2 py-0.5 rounded font-bold uppercase mb-1 inline-block">
                            BST {item.bo_suu_tap || 'Mới'}
                        </span>
                        <h2 className="text-xl md:text-3xl font-serif text-[#F5F5F5] drop-shadow-md truncate max-w-[200px] md:max-w-md">
                            {item.ten_vat_tu}
                        </h2>
                        <p className="text-[#C69C6D] text-sm md:text-lg font-bold mt-1">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.gia_ban)}
                        </p>
                    </div>
                    <button 
                        onClick={() => handleBuy(item.id)}
                        className="bg-white text-black p-3 rounded-full hover:bg-[#C69C6D] transition-colors shadow-lg active:scale-95"
                    >
                        <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nút điều hướng ảo (Click trái/phải để chuyển) */}
        <div className="absolute inset-y-0 left-0 w-1/4 cursor-w-resize z-10" onClick={() => setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1))}></div>
        <div className="absolute inset-y-0 right-0 w-1/4 cursor-e-resize z-10" onClick={() => setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1))}></div>
      </div>
    </div>
  );
}