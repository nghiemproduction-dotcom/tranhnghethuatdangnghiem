'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Thêm usePathname
import { PlayCircle, Star, ArrowRight } from 'lucide-react';

// Import các component hệ thống
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
    const pathname = usePathname(); // Lấy đường dẫn hiện tại
    const [nguoiDung, setNguoiDung] = useState<any>(null);
    const [loiChao, setLoiChao] = useState('Chào bạn');
    const [daKiemTraLogin, setDaKiemTraLogin] = useState(false);
    
    // 🟢 QUẢN LÝ TRẠNG THÁI HIỂN THỊ THÔNG MINH
    const [activeOverlays, setActiveOverlays] = useState<Set<string>>(new Set());
    const [bgVersion, setBgVersion] = useState(Date.now());

    const bgUrlMobile = `${BASE_IMG_URL}/trangchu-mobile.jpg?t=${bgVersion}`;
    const bgUrlTablet = `${BASE_IMG_URL}/trangchu-tablet.jpg?t=${bgVersion}`;
    const bgUrlDesktop = `${BASE_IMG_URL}/trangchu-desktop.jpg?t=${bgVersion}`;

    useEffect(() => {
        const storedUser = localStorage.getItem('USER_INFO');
        
        if (!storedUser) {
            // 🔴 SỬA LỖI VÒNG LẶP VÔ TẬN (Infinite Redirect Loop)
            // Nếu chưa đăng nhập và đang ở trang chủ, KHÔNG redirect về trang chủ nữa.
            // Thay vào đó, chuyển sang trang login hoặc hiển thị màn hình chờ.
            if (pathname !== '/dang-nhap' && pathname !== '/login') {
                 // Giả sử bạn có trang login, nếu không có thì comment dòng này lại và hiển thị UI yêu cầu đăng nhập bên dưới
                 // router.push('/dang-nhap'); 
                 console.warn("Người dùng chưa đăng nhập.");
            }
            // Đánh dấu đã kiểm tra xong để render giao diện (dù là giao diện khách)
            setDaKiemTraLogin(true);
        } else {
            try { setNguoiDung(JSON.parse(storedUser)); } catch (e) { console.error(e); }
            
            const h = new Date().getHours();
            if (h >= 5 && h < 11) setLoiChao('Chào buổi sáng');
            else if (h >= 11 && h < 14) setLoiChao('Chào buổi trưa');
            else if (h >= 14 && h < 18) setLoiChao('Chào buổi chiều');
            else setLoiChao('Chào buổi tối');
            
            setDaKiemTraLogin(true);
        }
    }, [router, pathname]);

    useEffect(() => {
        const handleVisibilityChange = (e: any) => {
            const { id, open } = e.detail;
            setActiveOverlays(prev => {
                const next = new Set(prev);
                if (open) next.add(id);
                else next.delete(id);
                return next;
            });
        };

        window.addEventListener('toggle-content-visibility', handleVisibilityChange);
        return () => window.removeEventListener('toggle-content-visibility', handleVisibilityChange);
    }, []);

    const handleMenuToggle = useCallback((isMenuOpen: boolean) => {
        setActiveOverlays(prev => {
            const next = new Set(prev);
            if (isMenuOpen) next.add('menu-duoi');
            else next.delete('menu-duoi');
            return next;
        });
    }, []);

    const handleUpdateBackground = useCallback(() => {
        setBgVersion(Date.now());
    }, []);

    const hienThiNoiDung = activeOverlays.size === 0;

    // Nếu chưa kiểm tra login xong, hiện màn hình đen để tránh giật
    if (!daKiemTraLogin) return <div className="fixed inset-0 bg-[#050505]" />;

    return (
        <div className="relative w-full min-h-screen bg-[#050505] text-[#F5F5F5] font-sans selection:bg-[#C69C6D] selection:text-black overflow-x-hidden">
            
            {/* LAYER 0: HÌNH NỀN */}
            <div className="fixed inset-0 w-full h-full z-0 pointer-events-none select-none bg-black">
                <img key={`m-${bgVersion}`} src={bgUrlMobile} alt="BG" className="absolute inset-0 w-full h-full object-cover md:hidden opacity-100 transition-opacity duration-1000" />
                <img key={`t-${bgVersion}`} src={bgUrlTablet} alt="BG" className="absolute inset-0 w-full h-full object-cover hidden md:block lg:hidden opacity-100 transition-opacity duration-1000" />
                <img key={`d-${bgVersion}`} src={bgUrlDesktop} alt="BG" className="absolute inset-0 w-full h-full object-cover hidden lg:block opacity-100 transition-opacity duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
            </div>

            {/* LAYER 1: NỘI DUNG CHÍNH */}
            <main 
                className={`relative z-[10] w-full flex flex-col items-center transition-all duration-500 ease-in-out ${hienThiNoiDung ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-10 blur-sm pointer-events-none'}`}
            >
                <section className="relative w-full h-[100dvh] bg-transparent pointer-events-none"></section>

                <div id="content-start" className="w-full bg-black/90 backdrop-blur-xl min-h-screen pt-20 pb-32 flex flex-col items-center gap-20 shadow-[0_-50px_100px_rgba(0,0,0,1)]">
                    
                    <div className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center gap-10">
                        <div className="w-full h-[60vh] md:h-[70vh] rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
                             <Slider1 />
                        </div>
                        <div className="animate-fade-in-up">
                            <NutDatHang />
                        </div>
                    </div>
                    
                    <div className="w-full max-w-5xl mx-auto px-6 text-center">
                        <div className="mb-10 space-y-3">
                            <h2 className="text-stroke-title text-3xl md:text-5xl font-serif italic text-transparent drop-shadow-lg">Tinh Hoa Nghệ Thuật</h2>
                            <p className="text-white/80 max-w-2xl mx-auto text-sm md:text-base font-light leading-relaxed drop-shadow-md">Hành trình biến những hạt gạo bình dị thành kiệt tác.</p>
                        </div>
                        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(198,156,109,0.15)] border border-[#C69C6D]/30 relative group bg-black">
                            <iframe className="w-full h-full object-cover" src="https://www.youtube.com/embed/jfKfPfyJRdk?si=9lJ_kH2g0b0b0b0b&rel=0&modestbranding=1" title="Video" frameBorder="0" allowFullScreen></iframe>
                        </div>
                    </div>

                    <div className="w-full max-w-6xl mx-auto px-4">
                        <div className="flex items-end justify-between px-2 border-b border-white/10 pb-4 mb-8">
                            <div><h3 className="text-[#C69C6D] text-sm font-bold tracking-[0.2em] uppercase mb-1 shadow-black drop-shadow-md">Bộ Sưu Tập</h3><h2 className="text-stroke-title text-3xl md:text-4xl font-serif text-transparent">Tác Phẩm Tiêu Biểu</h2></div>
                            <button className="hidden md:flex items-center gap-2 text-xs font-bold uppercase text-white/50 hover:text-[#C69C6D] transition-colors">Xem tất cả <ArrowRight size={14} /></button>
                        </div>
                        <Slider2 />
                    </div>

                    <div className="w-full max-w-6xl mx-auto px-4">
                         <div className="text-center mb-12"><h2 className="text-stroke-title text-3xl font-serif mt-2 text-transparent">Góc Nhìn & Sự Kiện</h2></div>
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

            {/* LAYER 2: GRADIENT BẢO VỆ MENU */}
            <div className="fixed top-0 left-0 right-0 h-28 bg-gradient-to-b from-black via-black/90 to-transparent z-[4900] pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black via-black/90 to-transparent z-[4900] pointer-events-none"></div>

            {/* LAYER 3: HỆ THỐNG MENU */}
            <MenuTren nguoiDung={nguoiDung} loiChao={loiChao} />
            
            

            <div className="fixed inset-0 z-[5000] pointer-events-none">
                <MenuDuoi currentUser={nguoiDung} onToggleContent={handleMenuToggle} />
            </div>

            {/* Admin Tools */}
            <div className="fixed bottom-24 left-6 z-[5001] flex flex-col gap-4">
                <BackgroundManager onUpdate={handleUpdateBackground} />
            </div>

            <style jsx global>{`
                /* Ẩn thanh cuộn */
                ::-webkit-scrollbar { display: none; }
                html, body { -ms-overflow-style: none; scrollbar-width: none; overflow-x: hidden; width: 100%; }
                .text-stroke-title { -webkit-text-stroke: 1px #F5F5F5; color: transparent; text-shadow: 0 0 15px rgba(198,156,109,0.3); }
                @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
            `}</style>
        </div>
    );
}