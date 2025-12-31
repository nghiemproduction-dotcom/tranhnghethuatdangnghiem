'use client';

import React, { useState, useEffect } from 'react';
import { Star, Plus, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { compressImage } from '@/app/ThuVien/compressImage';

interface ProductData {
  id: number;
  tieu_de: string; // Tên tác phẩm
  gia_tien: string; // Giá
  hinh_anh: string;
}

export default function Slider2() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form
  const [editForm, setEditForm] = useState<{ name: string; price: string; file: File | null; previewUrl: string }>({
    name: '', price: '', file: null, previewUrl: ''
  });

  useEffect(() => {
    fetchProducts();
    const role = typeof window !== 'undefined' ? localStorage.getItem('USER_ROLE') : '';
    if (role === 'admin' || role === 'quan_ly') setIsAdmin(true);
  }, []);

  // Req 7: Tự động trượt
  useEffect(() => {
    if (products.length <= 1) return; // Không chạy nếu ít hơn 2 item
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev === products.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [products]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('slider_data')
      .select('*')
      .eq('loai_slider', 'slider2')
      .order('tao_luc', { ascending: false });
    
    if (data && data.length > 0) {
        // Map lại field cho khớp interface
        setProducts(data.map(d => ({ id: d.id, tieu_de: d.tieu_de, gia_tien: d.gia_tien, hinh_anh: d.hinh_anh })));
    } else {
        // Dữ liệu mẫu
        setProducts([
            { id: 1, tieu_de: "Tác phẩm: Sen Hồng", gia_tien: "12.000.000 VNĐ", hinh_anh: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop" },
            { id: 2, tieu_de: "Tác phẩm: Cửu Long", gia_tien: "45.000.000 VNĐ", hinh_anh: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=600&auto=format&fit=crop" }
        ]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        try {
          const compressed = await compressImage(e.target.files[0], 0.7, 800); // Nén mạnh hơn cho slider nhỏ
          setEditForm(prev => ({ ...prev, file: compressed, previewUrl: URL.createObjectURL(compressed) }));
        } catch(e) { alert("Xin lỗi, không thể nén ảnh. Vui lòng thử lại."); }
      }
  };

  const handleSave = async () => {
      if (!editForm.file) return alert("Xin vui lòng chọn ảnh cho tác phẩm");
      setIsLoading(true);
      try {
          const fileName = `slider2-${Date.now()}.jpg`;
          const { error: upErr } = await supabase.storage.from('slider').upload(fileName, editForm.file);
          if (upErr) throw upErr;
          
          const { data: publicUrl } = supabase.storage.from('slider').getPublicUrl(fileName);
          
          await supabase.from('slider_data').insert([{
              loai_slider: 'slider2',
              tieu_de: editForm.name,
              gia_tien: editForm.price,
              hinh_anh: publicUrl.publicUrl
          }]);
          
          alert("Tác phẩm đã được thêm vào bộ sưu tập thành công!");
          setIsEditing(false);
          setEditForm({ name: '', price: '', file: null, previewUrl: '' });
          fetchProducts();
      } catch (err: any) { alert("Xin lỗi, có lỗi xảy ra: " + err.message); } 
      finally { setIsLoading(false); }
  };

  const handleDelete = async (id: number) => {
      if(!confirm("Bạn có chắc chắn muốn xóa tác phẩm này khỏi bộ sưu tập?")) return;
      await supabase.from('slider_data').delete().eq('id', id);
      fetchProducts();
  };

  return (
    <div className="w-full bg-black/40 backdrop-blur-md border border-white/5 rounded-xl p-4 md:p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#C69C6D] text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <Star size={14} fill="currentColor" /> Tác phẩm tiêu biểu
        </h3>
        
        {isAdmin && (
            <button onClick={() => setIsEditing(true)} className="text-[10px] bg-[#C69C6D] text-black px-2 py-1 rounded font-bold hover:bg-white active:scale-95">
                <Plus size={10} className="inline mr-1"/> THÊM TÁC PHẨM
            </button>
        )}
      </div>

      {/* ADMIN POPUP */}
      {isEditing && (
          <div className="absolute top-0 left-0 w-full h-full z-50 bg-black/95 p-4 rounded-xl flex flex-col justify-center items-center">
              <div className="w-full max-w-xs space-y-3">
                  <h4 className="text-[#C69C6D] font-bold text-center mb-2">THÊM TÁC PHẨM MỚI</h4>
                  <input className="w-full bg-white/10 p-2 rounded text-white text-xs border border-white/20" placeholder="Tên tác phẩm" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  <input className="w-full bg-white/10 p-2 rounded text-white text-xs border border-white/20" placeholder="Giá tiền (VNĐ)" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} />
                  <input type="file" accept="image/*" onChange={handleFileChange} className="text-white text-xs" />
                  
                  <div className="flex gap-2 mt-2">
                      <button onClick={handleSave} disabled={isLoading} className="flex-1 bg-[#C69C6D] text-black py-2 rounded text-xs font-bold active:scale-95">{isLoading ? "Đang lưu..." : "LƯU TÁC PHẨM"}</button>
                      <button onClick={() => setIsEditing(false)} className="flex-1 bg-white/10 text-white py-2 rounded text-xs font-bold active:scale-95">HỦY</button>
                  </div>
              </div>
          </div>
      )}

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
                   src={item.hinh_anh} alt={item.tieu_de} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                
                {/* Req 4: Stroke & Shadow text */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/60 to-transparent">
                    <p className="text-white font-serif text-lg md:text-xl tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ WebkitTextStroke: '0.5px rgba(0,0,0,0.5)' }}>
                        {item.tieu_de}
                    </p>
                    <p className="text-[#C69C6D] text-sm font-bold mt-1 drop-shadow-md">{item.gia_tien}</p>
                </div>

                {/* Nút xóa (Admin) */}
                {isAdmin && (
                    <button onClick={() => handleDelete(item.id)} className="absolute top-2 right-2 bg-red-600/80 p-1.5 rounded text-white hover:bg-red-500 z-20 active:scale-95">
                        <Trash2 size={12}/>
                    </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}