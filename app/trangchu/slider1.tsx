'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus, Save, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/app/ThuVien/ketNoiSupabase';
import { compressImage } from '@/app/ThuVien/compressImage'; 

interface SlideData {
  id: number;
  tieu_de: string;
  mo_ta: string;
  hinh_anh: string;
}

export default function Slider1() {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // State cho form
  const [editForm, setEditForm] = useState<{ title: string; desc: string; file: File | null; previewUrl: string }>({
    title: '', desc: '', file: null, previewUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load dữ liệu lần đầu
  useEffect(() => {
    fetchSlides();
    checkAdmin();
  }, []);

  // Kiểm tra quyền từ LocalStorage
  const checkAdmin = () => {
    if (typeof window !== 'undefined') {
        const role = localStorage.getItem('USER_ROLE');
        // Nếu là admin hoặc quản lý thì hiện nút sửa
        if (role === 'admin' || role === 'quan_ly') setIsAdmin(true);
    }
  };

  // Hàm lấy dữ liệu từ Supabase
  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from('slider_data')
      .select('*')
      .eq('loai_slider', 'slider1')
      .order('tao_luc', { ascending: false });
    
    if (error) {
        console.error("Lỗi tải slider:", error);
    } else if (data && data.length > 0) {
        setSlides(data);
    } else {
        // Dữ liệu mẫu hiển thị khi chưa có DB
        setSlides([{
            id: 0, 
            tieu_de: "NGHỆ THUẬT TRANH GẠO", 
            mo_ta: "Chưa có dữ liệu, vui lòng thêm mới.", 
            hinh_anh: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000&auto=format&fit=crop"
        }]);
    }
  };

  // Logic chuyển slide
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () => setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  // Logic chọn file và nén ảnh
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      try {
        // Nén ảnh xuống còn tối đa 1920px chiều rộng
        const compressed = await compressImage(originalFile, 0.8, 1920); 
        setEditForm(prev => ({ ...prev, file: compressed, previewUrl: URL.createObjectURL(compressed) }));
      } catch (err) {
        console.error("Lỗi nén ảnh:", err);
        alert("Không thể xử lý ảnh này.");
      }
    }
  };

  // Logic Lưu Slide (Quan trọng)
  const handleSave = async () => {
    if (!editForm.file && !isEditing) return alert("Vui lòng chọn ảnh!");
    setIsLoading(true);

    try {
      let imageUrl = editForm.previewUrl;

      // 1. Upload ảnh nếu có file mới
      if (editForm.file) {
        const fileName = `slider1-${Date.now()}.jpg`;
        // Upload lên bucket 'slider'
        const { data, error: uploadError } = await supabase.storage.from('slider').upload(fileName, editForm.file);
        
        if (uploadError) {
             console.error("Lỗi Upload:", uploadError);
             throw new Error(`Lỗi Upload Storage: ${uploadError.message}. Bạn cần chạy lệnh SQL cấp quyền Storage.`);
        }
        
        const { data: publicUrl } = supabase.storage.from('slider').getPublicUrl(fileName);
        imageUrl = publicUrl.publicUrl;
      }

      // 2. Insert vào bảng slider_data
      const newSlide = {
        loai_slider: 'slider1',
        tieu_de: editForm.title,
        mo_ta: editForm.desc,
        hinh_anh: imageUrl
      };

      const { error: insertError } = await supabase.from('slider_data').insert([newSlide]);
      
      // Bắt lỗi Permission cụ thể để thông báo
      if (insertError) {
          console.error("Lỗi Insert:", insertError);
          if (insertError.code === '42501' || insertError.message.includes('permission denied')) {
              throw new Error("Lỗi Quyền (42501): Bạn CHƯA chạy lệnh SQL mở khóa bảng slider_data. Vui lòng copy lệnh SQL ở trên và chạy trong Supabase SQL Editor.");
          }
          throw insertError;
      }

      alert("Thêm mới thành công!");
      setIsEditing(false);
      setEditForm({ title: '', desc: '', file: null, previewUrl: '' });
      fetchSlides(); // Reload lại danh sách
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logic Xóa Slide
  const handleDelete = async (id: number) => {
      if(!confirm("Bạn chắc chắn muốn xóa slide này?")) return;
      const { error } = await supabase.from('slider_data').delete().eq('id', id);
      if (error) {
          alert("Lỗi xóa: " + error.message);
      } else {
          fetchSlides();
          if (currentIndex >= slides.length - 1) setCurrentIndex(0);
      }
  };

  return (
    <div className="relative w-full h-full group/slider flex flex-col items-center justify-center">
      
      {/* KHUNG GỖ CAO CẤP */}
      <div className="relative w-full h-full overflow-hidden rounded-lg shadow-2xl"
           style={{
               border: '12px solid #5D4037', 
               boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5)',
               backgroundImage: 'linear-gradient(45deg, #5D4037 25%, #4E342E 25%, #4E342E 50%, #5D4037 50%, #5D4037 75%, #4E342E 75%, #4E342E 100%)',
               backgroundSize: '20px 20px' 
           }}
      >
        {/* Viền vàng trang trí */}
        <div className="absolute inset-0 border-[2px] border-[#FFD700] opacity-50 pointer-events-none z-20 m-1"></div>

        {/* NỘI DUNG SLIDE */}
        <div className="relative w-full h-full bg-black">
            {slides.map((slide, index) => (
            <div
                key={slide.id || index}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
                <img src={slide.hinh_anh} alt={slide.tieu_de} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                
                {/* Text Content: Có Stroke & Shadow */}
                <div className="absolute bottom-16 left-8 right-8 text-center md:text-left">
                    <h2 
                        className="text-3xl md:text-5xl font-serif text-[#F5F5F5] mb-2 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]"
                        style={{ WebkitTextStroke: '1px rgba(0,0,0,0.5)' }}
                    >
                        {slide.tieu_de}
                    </h2>
                    <p 
                        className="text-[#E8D4B9] text-sm md:text-lg font-light drop-shadow-[0_2px_2px_rgba(0,0,0,1)]"
                    >
                        {slide.mo_ta}
                    </p>
                </div>

                {/* Nút Xóa (Admin Only) */}
                {isAdmin && slide.id !== 0 && (
                    <button onClick={() => handleDelete(slide.id)} className="absolute top-4 right-4 z-50 p-2 bg-red-600/80 text-white rounded hover:bg-red-500 shadow-lg border border-white/20">
                        <Trash2 size={16}/>
                    </button>
                )}
            </div>
            ))}
        </div>

        {/* NÚT ĐIỀU HƯỚNG */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/40 border border-[#C69C6D] text-[#C69C6D] hover:bg-[#C69C6D] hover:text-black transition-all rounded-full opacity-0 group-hover/slider:opacity-100 active:scale-95">
            <ChevronLeft size={24} />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/40 border border-[#C69C6D] text-[#C69C6D] hover:bg-[#C69C6D] hover:text-black transition-all rounded-full opacity-0 group-hover/slider:opacity-100 active:scale-95">
            <ChevronRight size={24} />
        </button>
      </div>

      {/* FORM ADMIN THÊM MỚI */}
      {isAdmin && (
        <div className="absolute top-4 left-4 z-50">
            {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-[#C69C6D] text-black px-4 py-2 rounded-md font-bold text-xs shadow-lg hover:bg-white transition-colors border-2 border-white/20 active:scale-95">
                    <Plus size={14}/> Thêm Slide Mới
                </button>
            ) : (
                <div className="bg-black/95 p-4 rounded-lg border border-[#C69C6D] w-[300px] shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-fade-in-up backdrop-blur-md">
                    <div className="flex justify-between items-center mb-3 text-[#C69C6D] border-b border-white/10 pb-2">
                        <span className="font-bold text-sm uppercase">Thêm Slide Mới</span>
                        <button onClick={() => setIsEditing(false)} className="hover:text-white"><X size={16}/></button>
                    </div>
                    
                    <div className="space-y-3">
                        {/* Input Title */}
                        <input 
                            type="text" placeholder="Tiêu đề chính..." 
                            className="w-full bg-white/10 border border-white/20 rounded p-2 text-white text-xs focus:border-[#C69C6D] outline-none placeholder-white/30"
                            value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
                        />
                         {/* Input Desc */}
                        <textarea 
                            placeholder="Mô tả ngắn..." 
                            className="w-full bg-white/10 border border-white/20 rounded p-2 text-white text-xs focus:border-[#C69C6D] outline-none h-16 resize-none placeholder-white/30"
                            value={editForm.desc} onChange={e => setEditForm({...editForm, desc: e.target.value})}
                        />
                        {/* Input File */}
                        <div className="relative w-full h-28 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#C69C6D] hover:bg-white/5 transition-colors overflow-hidden group/upload">
                            {editForm.previewUrl ? (
                                <img src={editForm.previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                            ) : <ImageIcon className="text-white/30 mb-1 group-hover/upload:text-[#C69C6D]"/>}
                            <span className="text-[10px] text-white/50 relative z-10 font-bold uppercase">{editForm.file ? "Đổi ảnh khác" : "Chọn ảnh (Tự nén)"}</span>
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                        </div>

                        <button 
                            onClick={handleSave} disabled={isLoading}
                            className="w-full bg-[#C69C6D] text-black font-bold py-2.5 rounded text-xs hover:bg-white transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? "Đang lưu..." : <><Save size={14}/> LƯU SLIDE</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
}