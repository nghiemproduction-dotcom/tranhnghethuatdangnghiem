"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Image as ImageIcon, Search, Star } from "lucide-react";
import CongDangNhap from "@/app/components/CongDangNhap/CongDangNhap";

// Dữ liệu mẫu (Static) - Giúp trang luôn chạy ngon, không sợ lỗi Database
const SAMPLE_ARTWORKS = [
  {
    id: 1,
    title: "Hồn Quê",
    desc: "Bức tranh gạo tái hiện cảnh làng quê Việt Nam yên bình.",
    price: "Liên hệ",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop" // Ảnh mẫu nghệ thuật
  },
  {
    id: 2,
    title: "Sen Việt",
    desc: "Vẻ đẹp thuần khiết của hoa sen qua từng hạt gạo rang.",
    price: "Liên hệ",
    image: "https://images.unsplash.com/photo-1515405295579-ba7f9f92f413?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Mã Đáo Thành Công",
    desc: "Tác phẩm phong thủy mang lại tài lộc và may mắn.",
    price: "Liên hệ",
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "Chân Dung Nghệ Thuật",
    desc: "Khắc họa thần thái qua kỹ thuật xếp gạo điêu luyện.",
    price: "Liên hệ",
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1000&auto=format&fit=crop"
  }
];

export default function PhongTrungBayPage() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // State để điều khiển tab mặc định là Login hay Register (nếu Modal của bạn hỗ trợ)
  // Nếu Modal chưa hỗ trợ prop này thì nó sẽ mặc định là Login
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleOpenLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleOpenRegister = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const handleViewDetail = () => {
    // Ép đăng nhập mới cho xem chi tiết (Chiêu marketing)
    if (confirm("Vui lòng đăng nhập để xem chi tiết và giá tác phẩm!")) {
        handleOpenLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#C69C6D] selection:text-black">
      
      {/* 🟢 MODAL ĐĂNG NHẬP/ĐĂNG KÝ */}
      <CongDangNhap 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        // initialMode={authMode} // Bỏ comment dòng này nếu bạn đã update Modal hỗ trợ prop này
      />

      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
           <div className="w-10 h-10 rounded-full bg-[#C69C6D] flex items-center justify-center text-black font-bold font-serif text-xl">
             T
           </div>
           <div>
             <h1 className="text-lg font-bold uppercase tracking-widest text-[#C69C6D]">Tommy Nghiem</h1>
             <p className="text-xs text-white/50 tracking-wider">Art Gallery</p>
           </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleOpenLogin}
            className="hidden md:flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            <LogIn size={16} /> Đăng nhập
          </button>
          
          <button 
            onClick={handleOpenRegister}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#C69C6D] text-black text-sm font-bold uppercase tracking-wide hover:bg-[#dcbea0] transition-transform active:scale-95"
          >
            <UserPlus size={16} /> <span className="hidden sm:inline">Đăng ký</span>
          </button>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative w-full h-[60vh] flex flex-col items-center justify-center pt-20 overflow-hidden">
        {/* Background Art */}
        <div className="absolute inset-0 z-0 opacity-40">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-3xl">
           <p className="text-[#C69C6D] text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-4 animate-fade-in-up">
              Chào mừng quý khách đến với
           </p>
           <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              Phòng Trưng Bày <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C69C6D] to-[#F2D3A0]">
                 Tinh Hoa Gạo Việt
              </span>
           </h2>
           <p className="text-white/60 text-sm md:text-lg font-light max-w-2xl mx-auto mb-8">
              Nơi lưu giữ những giá trị văn hóa qua từng hạt gạo. 
              Hãy đăng ký thành viên để sở hữu những tác phẩm độc bản.
           </p>

           <div className="flex items-center justify-center gap-4">
              <button onClick={handleOpenRegister} className="px-8 py-3 border border-[#C69C6D] text-[#C69C6D] rounded-sm uppercase tracking-widest text-xs hover:bg-[#C69C6D] hover:text-black transition-all">
                 Trở thành Hội Viên
              </button>
           </div>
        </div>
      </section>

      {/* --- GALLERY GRID --- */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pb-32">
        <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-4">
           <h3 className="text-2xl font-serif text-white flex items-center gap-3">
              <Star className="text-[#C69C6D]" fill="#C69C6D" size={20} />
              Tác Phẩm Tiêu Biểu
           </h3>
           <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C69C6D]"></span>
              <span className="w-2 h-2 rounded-full bg-white/20"></span>
              <span className="w-2 h-2 rounded-full bg-white/20"></span>
           </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           {SAMPLE_ARTWORKS.map((art) => (
             <div key={art.id} className="group relative bg-[#111] border border-white/5 rounded-lg overflow-hidden hover:border-[#C69C6D]/50 transition-all duration-300 hover:-translate-y-2">
                
                {/* Image */}
                <div className="w-full aspect-[3/4] overflow-hidden relative">
                   <img 
                     src={art.image} 
                     alt={art.title} 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                   
                   {/* Badge */}
                   <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <span className="text-xs font-bold text-[#C69C6D] uppercase">Trưng bày</span>
                   </div>
                </div>

                {/* Content */}
                <div className="p-5 relative">
                   <h4 className="text-xl font-serif font-bold text-white mb-2 group-hover:text-[#C69C6D] transition-colors">
                      {art.title}
                   </h4>
                   <p className="text-white/40 text-xs line-clamp-2 mb-4 font-sans">
                      {art.desc}
                   </p>
                   
                   <div className="flex items-center justify-between mt-auto">
                      <span className="text-white/60 text-sm italic">{art.price}</span>
                      <button 
                        onClick={handleViewDetail}
                        className="p-2 rounded-full bg-white/5 hover:bg-[#C69C6D] hover:text-black transition-colors"
                        title="Xem chi tiết"
                      >
                         <Search size={16} />
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* --- BOTTOM CTA --- */}
        <div className="mt-20 p-10 rounded-2xl bg-gradient-to-r from-[#1a1a1a] to-[#050505] border border-white/10 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-20 bg-[#C69C6D]/10 blur-[100px] rounded-full pointer-events-none"></div>
           
           <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4 relative z-10">
              Bạn muốn xem thêm 100+ tác phẩm khác?
           </h3>
           <p className="text-white/50 mb-8 max-w-xl mx-auto relative z-10">
              Đăng nhập ngay để truy cập kho tàng nghệ thuật tranh gạo, đặt hàng theo yêu cầu và nhận ưu đãi độc quyền.
           </p>
           <button 
              onClick={handleOpenLogin}
              className="relative z-10 px-8 py-3 bg-[#C69C6D] text-black font-bold uppercase tracking-wider rounded shadow-[0_0_20px_rgba(198,156,109,0.3)] hover:shadow-[0_0_40px_rgba(198,156,109,0.5)] transition-all"
           >
              Đăng Nhập Ngay
           </button>
        </div>
      </section>

    </div>
  );
}