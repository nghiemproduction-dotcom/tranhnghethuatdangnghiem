'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlayCircle, Star, ArrowRight } from 'lucide-react';

// Import các component hệ thống
import NhacNen from '@/app/Music/NhacNen';
import HieuUngNen from '@/app/GiaoDienTong/HieuUngNen/HieuUngNen';
import LopPhuLanMau from '@/app/GiaoDienTong/HieuUngNen/LopPhuLanMau';
import MenuTren from '@/app/GiaoDienTong/MenuTren/MenuTren';
import MenuDuoi from '@/app/GiaoDienTong/MenuDuoi/MenuDuoi';

// Import component con
import Slider1 from './slider1';
import Slider2 from './slider2';
import NutDatHang from './NutDatHang';
import BackgroundManager from './BackgroundManager'; 

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BASE_IMG_URL = `${SUPABASE_URL}/storage/v1/object/public/hinh-nen`;

export default function TrangChuDashboard() {
    const router = useRouter();
    const [nguoiDung, setNguoiDung] = useState<any>(null);
    const [loiChao, setLoiChao] = useState('Chào bạn');
    const [daKiemTraLogin, setDaKiemTraLogin] = useState(false);
    
    // State quản lý hiển thị nội dung (cho Menu)
    const [hienThiNoiDung, setHienThiNoiDung] = useState(true);
    
    // State để reload ảnh nền - Sử dụng timestamp + random
    // Ban đầu dùng Date.now(), khi update sẽ thêm Math.random()
    const [bgVersion, setBgVersion] = useState<string>(Date.now().toString());

    // URL hình nền - Thêm tham số ngẫu nhiên để chống Cache trình duyệt tuyệt đối
    const bgUrlMobile = `${BASE_IMG_URL}/trangchu-mobile.jpg?t=${bgVersion}`;
    const bgUrlTablet = `${BASE_IMG_URL}/trangchu-tablet.jpg?t=${bgVersion}`;
    const bgUrlDesktop = `${BASE_IMG_URL}/trangchu-desktop.jpg?t=${bgVersion}`;

    useEffect(() => {
        const storedUser = localStorage.getItem('USER_INFO');
        if (!storedUser) {
            router.push('/');
        } else {
            try { setNguoiDung(JSON.parse(storedUser)); } catch (e) { console.error(e); router.push('/'); }
            
            const h = new Date().getHours();
            if (h >= 5 && h < 11) setLoiChao('Chào buổi sáng');
            else if (h >= 11 && h < 14) setLoiChao('Chào buổi trưa');
            else if (h >= 14 && h < 18) setLoiChao('Chào buổi chiều');
            else setLoiChao('Chào buổi tối');
            
            setDaKiemTraLogin(true);
        }
    }, [router]);

    const handleMenuToggle = (isMenuOpen: boolean) => {
        setHienThiNoiDung(!isMenuOpen);
    };

    // Hàm cập nhật hình nền được gọi từ BackgroundManager
    const handleUpdateBackground = () => {
        // Tạo một chuỗi ngẫu nhiên mới để gán vào URL
        const newVersion = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        setBgVersion(newVersion);
    };

    if (!daKiemTraLogin) return <div className="fixed inset-0 bg-[#050505]" />;

    return (
        <div className="relative w-full min-h-screen bg-[#050505] text-[#F5F5F5] font-sans selection:bg-[#C69C6D] selection:text-black overflow-x-hidden">
            
            {/* ================= LAYER 0: HÌNH NỀN (Z-0) ================= */}
            <div className="fixed inset-0 w-full h-full z-0 pointer-events-none select-none bg-black">
                {/* Key được gắn vào img để ép React hủy element cũ và tạo element mới.
                   Query param ?t=... trong src ép trình duyệt tải file mới từ server.
                */}
                
                {/* Mobile */}
                <img 
                    key={`mobile-${bgVersion}`}
                    src={bgUrlMobile} 
                    alt="Background Mobile" 
                    className="absolute inset-0 w-full h-full object-cover md:hidden opacity-100 transition-opacity duration-1000" 
                />
                {/* Tablet */}
                <img 
                    key={`tablet-${bgVersion}`}
                    src={bgUrlTablet} 
                    alt="Background Tablet" 
                    className="absolute inset-0 w-full h-full object-cover hidden md:block lg:hidden opacity-100 transition-opacity duration-1000" 
                />
                {/* Desktop */}
                <img 
                    key={`desktop-${bgVersion}`}
                    src={bgUrlDesktop} 
                    alt="Background Desktop" 
                    className="absolute inset-0 w-full h-full object-cover hidden lg:block opacity-100 transition-opacity duration-1000" 
                />

                {/* Gradient đáy */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                
                <HieuUngNen />
            </div>

            {/* ================= LAYER 1: NỘI DUNG CHÍNH (Z-10) ================= */}
            <main 
                className={`relative z-[10] w-full flex flex-col items-center transition-all duration-500 ease-in-out ${hienThiNoiDung ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-10 blur-sm pointer-events-none'}`}
            >
                {/* KHOẢNG TRỐNG (GAP) */}
                <section className="relative w-full h-[100dvh] bg-transparent pointer-events-none"></section>

                {/* NỘI DUNG DƯỚI - Nền đen mờ */}
                <div id="content-start" className="w-full bg-black/90 backdrop-blur-xl min-h-screen pt-20 pb-32 flex flex-col items-center gap-20 shadow-[0_-50px_100px_rgba(0,0,0,1)]">
                    
                    {/* Slider 1 & Nút Đặt Hàng */}
                    <div className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center gap-10">
                        <div className="w-full h-[60vh] md:h-[70vh] rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
                             <Slider1 />
                        </div>
                        <div className="animate-fade-in-up">
                            <NutDatHang />
                        </div>
                    </div>
                    
                    {/* Video */}
                    <div className="w-full max-w-5xl mx-auto px-6 text-center">
                        <div className="mb-10 space-y-3">
                            <h2 className="text-stroke-title text-3xl md:text-5xl font-serif italic text-transparent drop-shadow-lg">
                                Tinh Hoa Nghệ Thuật
                            </h2>
                            <p className="text-white/80 max-w-2xl mx-auto text-sm md:text-base font-light leading-relaxed drop-shadow-md">
                                Hành trình biến những hạt gạo bình dị thành kiệt tác.
                            </p>
                        </div>
                        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(198,156,109,0.15)] border border-[#C69C6D]/30 relative group bg-black">
                            <iframe 
                                className="w-full h-full object-cover"
                                src="https://www.youtube.com/embed/jfKfPfyJRdk?si=9lJ_kH2g0b0b0b0b&rel=0&modestbranding=1" 
                                title="Video" frameBorder="0" allowFullScreen
                            ></iframe>
                        </div>
                    </div>

                    {/* Slider 2 (Sản phẩm) */}
                    <div className="w-full max-w-6xl mx-auto px-4">
                        <div className="flex items-end justify-between px-2 border-b border-white/10 pb-4 mb-8">
                            <div>
                                <h3 className="text-[#C69C6D] text-sm font-bold tracking-[0.2em] uppercase mb-1 shadow-black drop-shadow-md">Bộ Sưu Tập</h3>
                                <h2 className="text-stroke-title text-3xl md:text-4xl font-serif text-transparent">Tác Phẩm Tiêu Biểu</h2>
                            </div>
                            <button className="hidden md:flex items-center gap-2 text-xs font-bold uppercase text-white/50 hover:text-[#C69C6D] transition-colors">
                                Xem tất cả <ArrowRight size={14} />
                            </button>
                        </div>
                        <Slider2 />
                    </div>

                    {/* Blog */}
                    <div className="w-full max-w-6xl mx-auto px-4">
                         <div className="text-center mb-12">
                            <h2 className="text-stroke-title text-3xl font-serif mt-2 text-transparent">Góc Nhìn & Sự Kiện</h2>
                         </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 rounded-xl bg-white/5 border border-white/10 hover:border-[#C69C6D]/50 transition-all hover:-translate-y-1">
                                <div className="flex items-center gap-2 mb-4 text-[#C69C6D] text-xs font-bold uppercase"><Star size={12}/> <span>Triển Lãm</span></div>
                                <h3 className="text-xl text-white font-serif mb-2">Hồn Gạo Việt 2025</h3>
                                <p className="text-gray-400 text-sm">Triển lãm nghệ thuật đương đại lớn nhất năm.</p>
                            </div>
                            <div className="p-8 rounded-xl bg-white/5 border border-white/10 hover:border-[#C69C6D]/50 transition-all hover:-translate-y-1">
                                <div className="flex items-center gap-2 mb-4 text-[#C69C6D] text-xs font-bold uppercase"><PlayCircle size={12}/> <span>Workshop</span></div>
                                <h3 className="text-xl text-white font-serif mb-2">Lớp Học Nghệ Nhân</h3>
                                <p className="text-gray-400 text-sm">Tự tay làm tranh gạo vào mỗi cuối tuần.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ================= LAYER 2: VÙNG TỐI BẢO VỆ MENU (FIXED Z-90) ================= */}
            <div className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-b from-black via-black/80 to-transparent z-[90] pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black via-black/80 to-transparent z-[90] pointer-events-none"></div>

            {/* Lớp phủ lan màu gốc */}
            <div className="fixed inset-0 z-[50] pointer-events-none mix-blend-soft-light opacity-50">
                <LopPhuLanMau />
            </div>

            {/* ================= LAYER 3: MENU & SYSTEM (Z-100) ================= */}
            <div className="fixed top-0 left-0 right-0 z-[100]">
                <MenuTren nguoiDung={nguoiDung} loiChao={loiChao} />
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 z-[100]">
                <MenuDuoi 
                    currentUser={nguoiDung} 
                    onToggleContent={handleMenuToggle} 
                />
            </div>

            {/* Admin & Nhạc */}
            <div className="fixed bottom-24 left-6 z-[100] flex flex-col gap-4">
                <BackgroundManager onUpdate={handleUpdateBackground} />
                <NhacNen />
            </div>

            <style jsx global>{`
                .text-stroke-title {
                    -webkit-text-stroke: 1px #F5F5F5;
                    color: transparent;
                    text-shadow: 0 0 15px rgba(198,156,109,0.3);
                }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: #000; }
                ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
                ::-webkit-scrollbar-thumb:hover { background: #C69C6D; }
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
            `}</style>
        </div>
    );
}