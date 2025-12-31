'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PlayCircle, Star, ArrowRight, LogIn } from 'lucide-react';

// Import các component hệ thống
import MenuTren from '@/app/GiaoDienTong/MenuTren/MenuTren';
 

// Import component con
import Slider1 from './slider1';
import Slider2 from './slider2';
import NutDatHang from './NutDatHang';
import BackgroundManager from './BackgroundManager';
import { useUser } from '@/app/ThuVien/UserContext';
import { Z_INDEX } from '@/app/constants/zIndex';
import { isRouteAllowed, getRedirectUrl } from '@/app/CongDangNhap/RoleRedirectService';
import { useAppSettings } from '@/app/ThuVien/AppSettingsContext';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BASE_IMG_URL = `${SUPABASE_URL}/storage/v1/object/public/hinh-nen`;

export default function TrangChuDashboard() {
    const router = useRouter();
    const pathname = usePathname(); // Lấy đường dẫn hiện tại
    const searchParams = useSearchParams(); // Lấy query parameters
    const { user: contextUser, loading: contextLoading } = useUser();
    const { t, language } = useAppSettings(); // 🌐 Hook ngôn ngữ
    
    const [nguoiDung, setNguoiDung] = useState<any>(null);
    const [loiChao, setLoiChao] = useState('');
    const [daKiemTraLogin, setDaKiemTraLogin] = useState(false);
    const [currentTime, setCurrentTime] = useState<string>('');
    const [showGreeting, setShowGreeting] = useState(true);
    const [hasGreetingFinished, setHasGreetingFinished] = useState(false);
    const [showScrollHint, setShowScrollHint] = useState(false);
    const [scrollStartTime, setScrollStartTime] = useState<number | null>(null);
    
    // 🟢 QUẢN LÝ TRẠNG THÁI HIỂN THỊ THÔNG MINH
    const [activeOverlays, setActiveOverlays] = useState<Set<string>>(new Set());
    const [bgVersion, setBgVersion] = useState(Date.now());
    const [showHero, setShowHero] = useState(true);
    const [hasScrolled, setHasScrolled] = useState(false);
    const smoothScrollTo = useCallback((targetY: number, duration = 1200) => {
        const startY = typeof window !== 'undefined' ? window.scrollY : 0;
        const diff = targetY - startY;
        const start = typeof performance !== 'undefined' ? performance.now() : 0;

        const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

        const step = (now: number) => {
            const elapsed = now - start;
            const t = Math.min(1, elapsed / duration);
            const eased = easeInOutCubic(t);
            window.scrollTo(0, startY + diff * eased);
            if (t < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    }, []);

    const bgUrlMobile = `${BASE_IMG_URL}/trangchu-mobile.jpg?t=${bgVersion}`;
    const bgUrlTablet = `${BASE_IMG_URL}/trangchu-tablet.jpg?t=${bgVersion}`;
    const bgUrlDesktop = `${BASE_IMG_URL}/trangchu-desktop.jpg?t=${bgVersion}`;

    // ✅ Load user từ localStorage (đơn giản hóa, không cần permission check)
    useEffect(() => {
        // ✅ Check nếu có query param login=1 thì bỏ qua load user, force hiện UI để cổng đăng nhập xuất hiện
        const urlParams = new URLSearchParams(window.location.search);
        const shouldShowLogin = urlParams.get('login') === '1';
        
        if (shouldShowLogin) {
            console.log('🔑 Hiện cổng đăng nhập theo query param');
            setDaKiemTraLogin(true);
            setNguoiDung(null);
            window.history.replaceState({}, '', '/trangchu');
            return;
        }

        // ✅ TIMEOUT FALLBACK: Force show UI after 2s to prevent infinite black screen
        const timeoutId = setTimeout(() => {
            if (!daKiemTraLogin) {
                console.warn('⚠️ TrangChuDashboard: Context loading timeout - forcing UI load');
                setDaKiemTraLogin(true);
                
                const storedUser = localStorage.getItem('USER_INFO');
                if (storedUser) {
                    try {
                        setNguoiDung(JSON.parse(storedUser));
                    } catch (e) {
                        console.error('Error parsing stored user in timeout', e);
                    }
                } else {
                    // 🟢 Không có user → redirect về trang chủ để login
                    router.replace('/');
                    return;
                }
            }
        }, 2000);

        // ✅ Wait for context to finish loading
        if (contextLoading) return () => clearTimeout(timeoutId);
        
        try {
            // ✅ Load user từ context hoặc localStorage
            if (contextUser) {
                const viTriRaw = (contextUser as any)?.vi_tri;
                const viTriNormalized = (contextUser as any)?.vi_tri_normalized;
                const phanLoaiNormalized = (contextUser as any)?.phan_loai_normalized;
                const userType = contextUser.userType;
                const roleNormalized = userType === 'nhan_su' ? viTriNormalized : phanLoaiNormalized;

                // 🔴 CHẶN NHÂN SỰ VÀO TRANGCHU - Redirect về phòng của họ
                    if (userType === 'nhan_su') {
                    console.log('🔴 Nhân sự không được vào /trangchu - redirect về phòng làm việc');
                    getRedirectUrl(userType, roleNormalized).then((targetRoute: string) => {
                        router.replace(targetRoute);
                    });
                    return;
                }

                const userData = {
                    id: contextUser.id,
                    ho_ten: contextUser.ho_ten || 'Người dùng',
                    email: contextUser.email,
                    userType: contextUser.userType,
                    role: roleNormalized,
                    vi_tri: viTriRaw || viTriNormalized || phanLoaiNormalized,
                };

                setNguoiDung(userData);
            } else {
                // ✅ Fallback: localStorage hoặc visitor cookie
                const storedUser = localStorage.getItem('USER_INFO');
                const isVisitor = document.cookie.includes('VISITOR_MODE=1');
                
                if (storedUser) {
                    try {
                        const parsed = JSON.parse(storedUser);
                        
                        // 🔴 CHẶN NHÂN SỰ VÀO TRANGCHU (từ localStorage)
                        if (parsed.userType === 'nhan_su') {
                            console.log('🔴 Nhân sự không được vào /trangchu - redirect về phòng làm việc');
                            getRedirectUrl(parsed.userType, parsed.vi_tri_normalized || parsed.role).then((targetRoute: string) => {
                                router.replace(targetRoute);
                            });
                            return;
                        }
                        
                        setNguoiDung(parsed);
                    } catch (e) {
                        console.error('Error parsing stored user', e);
                        setNguoiDung(null);
                    }
                } else if (!isVisitor) {
                    // 🟢 Không có user và không phải visitor → redirect về trang login
                    router.replace('/');
                    return;
                }
            }
        } finally {
            clearTimeout(timeoutId);
            setDaKiemTraLogin(true);
        }
    }, [contextUser, contextLoading, router]);

    // Set greeting: time-based "Chào buổi ... <name>" and trigger animation (~5s)
    useEffect(() => {
        const name = nguoiDung?.ho_ten || t('home.guest');
        const h = new Date().getHours();
        let timeGreeting = t('home.goodEvening');
        if (h >= 5 && h < 11) timeGreeting = t('home.goodMorning');
        else if (h >= 11 && h < 14) timeGreeting = language === 'vi' ? 'Chào buổi trưa' : 'Good afternoon';
        else if (h >= 14 && h < 18) timeGreeting = t('home.goodAfternoon');

        setLoiChao(`${timeGreeting}, ${name}!`);

        // Reset animation states whenever user changes
        setShowGreeting(true);
        setHasGreetingFinished(false);
        setScrollStartTime(null);

        const hideTimer = setTimeout(() => {
            setShowGreeting(false);
            setShowScrollHint(true); // Show scroll hint after greeting disappears
        }, 5000); // show for ~5s

        const finishTimer = setTimeout(() => {
            setHasGreetingFinished(true);
            setShowScrollHint(false); // Hide scroll hint when auto-scroll begins
        }, 5700); // allow fade-out to finish

        return () => {
            clearTimeout(hideTimer);
            clearTimeout(finishTimer);
        };
    }, [nguoiDung, t, language]);

    // After greeting finishes, auto scroll up to content (slider 1 area) and hide hero
    useEffect(() => {
        if (!hasGreetingFinished) return;
        setShowHero(false);
        const target = document.getElementById('content-start');
        const top = target ? target.offsetTop : window.innerHeight;
        smoothScrollTo(top, 1400);
    }, [hasGreetingFinished, smoothScrollTo]);

    // Cập nhật đồng hồ thời gian
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            setCurrentTime(`${hours}:${minutes}:${seconds}`);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleVisibilityChange = (e: any) => {
            const { id, open } = e.detail;
            setActiveOverlays(prev => {
                const next = new Set(prev);
                if (open) next.add(id);
                else next.delete(id);
                return next;
            });
            // Ẩn hero khi modal mở
            if (open) setShowHero(false);
        };

        window.addEventListener('toggle-content-visibility', handleVisibilityChange);
        return () => window.removeEventListener('toggle-content-visibility', handleVisibilityChange);
    }, []);

    // 🟢 HANDLE QUERY PARAM: ?openModal=X (Auto-open modal for nhan_su on redirect)
    useEffect(() => {
        const openModal = searchParams.get('openModal');
        if (openModal) {
            // Dispatch event để mở modal
            window.dispatchEvent(new CustomEvent('openModal', { detail: { modalId: openModal } }));
            // Ẩn hero
            setShowHero(false);
        }
    }, [searchParams]);

    const handleMenuToggle = useCallback((isMenuOpen: boolean) => {
        setActiveOverlays(prev => {
            const next = new Set(prev);
            if (isMenuOpen) next.add('menu-duoi');
            else next.delete('menu-duoi');
            return next;
        });
        // Ẩn hero khi menu mở
        if (isMenuOpen) setShowHero(false);
    }, []);

    const handleUpdateBackground = useCallback(() => {
        setBgVersion(Date.now());
    }, []);

    const isVisitor = nguoiDung?.userType === 'guest' || nguoiDung?.role === 'visitor';

    const handleGoToLogin = useCallback(() => {
        // Xoá chế độ khách và chuyển ra trang login với query mở popup
        document.cookie = 'VISITOR_MODE=; Path=/; Max-Age=0; SameSite=Lax';
        localStorage.removeItem('USER_INFO');
        localStorage.removeItem('USER_ROLE');
        router.push('/?login=1');
    }, [router]);

    const handleScrollToHome = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setShowHero(true);
        setHasScrolled(false);
    }, []);

    const hienThiNoiDung = activeOverlays.size === 0;

    useEffect(() => {
        const handleCloseAllOverlays = () => {
            setActiveOverlays(new Set());
            setShowHero(true);
            setHasScrolled(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        window.addEventListener('closeAllOverlays', handleCloseAllOverlays);
        return () => window.removeEventListener('closeAllOverlays', handleCloseAllOverlays);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            // Chỉ xử lý scroll nếu không có overlay nào mở
            if (activeOverlays.size === 0) {
                // Track scroll start time and hide hint after 1s of scrolling
                if (window.scrollY > 50 && showScrollHint) {
                    if (scrollStartTime === null) {
                        setScrollStartTime(Date.now());
                    } else if (Date.now() - scrollStartTime >= 1000) {
                        setShowScrollHint(false);
                    }
                } else if (window.scrollY <= 50) {
                    setScrollStartTime(null);
                }
                
                if (window.scrollY > 100) {
                    setShowHero(false);
                    setHasScrolled(true);
                } else {
                    setShowHero(true);
                    setHasScrolled(false);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [activeOverlays.size]);

    // Lock body scroll khi có overlay mở
    useEffect(() => {
        if (activeOverlays.size > 0) {
            // Lưu vị trí scroll hiện tại
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else {
            // Khôi phục scroll
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }

        return () => {
            // Cleanup khi unmount
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflow = '';
        };
    }, [activeOverlays.size]);

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
                className={`relative z-[10] w-full flex flex-col items-center transition-all duration-500 ease-in-out ${
                    hienThiNoiDung 
                        ? 'opacity-100 translate-y-0 blur-0' 
                        : 'opacity-0 translate-y-10 blur-sm pointer-events-none !hidden'
                }`}
            >
                {/* HERO SECTION - Lời chào & Scroll Indicator */}
                <section className={`relative w-full h-[100dvh] bg-transparent pointer-events-none flex flex-col items-center justify-center transition-all duration-700 ${
                    showHero && hienThiNoiDung ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-20 pointer-events-none'
                }`}>
                    {/* Elegant backdrop với viền vàng */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
                        <div className="w-full max-w-4xl">
                            <div className="relative p-0 md:p-4 min-h-[60vh] flex items-center justify-center">
                                {/* Content wrapper */}
                                <div className="relative z-10 w-full flex flex-col items-center justify-center gap-6 text-center">
                                    {/* Main greeting with zoom-out animation */}
                                    {showGreeting && (
                                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#C69C6D] tracking-wide leading-tight greeting-zoom-out text-center">
                                            <span className="inline-block" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.95), 0 0 60px rgba(198,156,109,0.6), 0 8px 40px rgba(0,0,0,0.8)' }}>
                                                {loiChao}
                                            </span>
                                        </h1>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Scroll hint text - appears after greeting */}
                    {showScrollHint && (
                        <div className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none animate-fade-in-up">
                            <p className="text-[#C69C6D]/70 text-sm md:text-base font-light tracking-wide"
                               style={{ textShadow: '0 2px 15px rgba(0,0,0,0.9), 0 0 30px rgba(198,156,109,0.4)' }}>
                                Cuộn xuống để xem nội dung
                            </p>
                        </div>
                    )}
                </section>

                <div id="content-start" className="w-full bg-black/90 backdrop-blur-xl min-h-screen pt-20 pb-32 flex flex-col items-center gap-20 relative">
                    {/* Gradient mượt từ hero sang content - loại bỏ shadow cứng */}
                    <div className="absolute -top-32 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none"></div>
                    
                    <div className="w-full max-w-5xl mx-auto px-4 flex flex-col items-center gap-10 relative z-20">
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
                            <p className="text-white/80 max-w-2xl mx-auto text-sm md:text-base font-light font-sans leading-relaxed drop-shadow-md">Hành trình biến những hạt gạo bình dị thành kiệt tác tinh xảo, mỗi sợi gạo là một nét vẽ trong bức tranh cuộc sống.</p>
                        </div>
                        <div className="w-full aspect-video rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(198,156,109,0.15)] border border-[#C69C6D]/30 relative group bg-black">
                            <iframe className="w-full h-full object-cover" src="https://www.youtube.com/embed/jfKfPfyJRdk?si=9lJ_kH2g0b0b0b0b&rel=0&modestbranding=1" title="Video" frameBorder="0" allowFullScreen></iframe>
                        </div>
                    </div>

                    <div className="w-full max-w-6xl mx-auto px-4">
                        <div className="flex items-end justify-between px-2 border-b border-white/10 pb-4 mb-8">
                            <div><h3 className="text-[#C69C6D] text-sm font-bold font-sans tracking-[0.2em] uppercase mb-1 shadow-black drop-shadow-md">Bộ Sưu Tập</h3><h2 className="text-stroke-title text-3xl md:text-4xl font-serif text-transparent">Tác Phẩm Tiêu Biểu</h2></div>
                            <button className="hidden md:flex items-center gap-2 text-xs font-bold font-sans uppercase text-white/50 hover:text-[#C69C6D] transition-colors">Xem tất cả <ArrowRight size={14} /></button>
                        </div>
                        <Slider2 />
                    </div>

                    <div className="w-full max-w-6xl mx-auto px-4 relative z-20">
                         <div className="text-center mb-12"><h2 className="text-stroke-title text-3xl font-serif mt-2 text-transparent">Tri Thức & Hành Trình</h2></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 rounded-xl bg-white/5 border border-white/10 hover:border-[#C69C6D]/50 transition-all hover:-translate-y-1">
                                <div className="flex items-center gap-2 mb-4 text-[#C69C6D] text-xs font-bold font-sans uppercase"><Star size={12}/> <span>Triển Lãm</span></div>
                                <h3 className="text-xl text-white font-serif font-bold mb-2">Hồn Gạo Việt 2025</h3>
                                <p className="text-gray-400 text-sm font-sans">Triển lãm nghệ thuật đương đại - nơi những tác phẩm gạo kể câu chuyện về tâm hồn dân tộc và giá trị vĩnh hằng.</p>
                            </div>
                            <div className="p-8 rounded-xl bg-white/5 border border-white/10 hover:border-[#C69C6D]/50 transition-all hover:-translate-y-1">
                                <div className="flex items-center gap-2 mb-4 text-[#C69C6D] text-xs font-bold font-sans uppercase"><PlayCircle size={12}/> <span>Workshop</span></div>
                                <h3 className="text-xl text-white font-serif font-bold mb-2">Lớp Học Nghệ Nhân</h3>
                                <p className="text-gray-400 text-sm font-sans">Tự tay tạo nên cõi nghệ thuật - workshop mở cửa cho những ai muốn khám phá kỹ thuật và tâm huyết của một nghệ nhân thực thụ.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* LAYER 2: GRADIENT BẢO VỆ MENU */}
            <div className="fixed top-0 left-0 right-0 h-28 bg-gradient-to-b from-black to-transparent z-[4900] pointer-events-none"></div>
            <div className="fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black to-transparent z-[4900] pointer-events-none"></div>

            {/* LAYER 3: HỆ THỐNG MENU */}
            <MenuTren nguoiDung={nguoiDung} loiChao={loiChao} />
            
            

         

            {/* Admin Tools - Tránh gradient MenuDuoi */}
            <div className="fixed bottom-32 left-6 z-[5001] flex flex-col gap-4">
                <BackgroundManager onUpdate={handleUpdateBackground} />
            </div>

                        {isVisitor && (
                            <button
                                onClick={handleGoToLogin}
                                className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-[5002] flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-3 sm:py-3.5 rounded-full
                                    bg-gradient-to-r from-[#C69C6D] via-[#F2D3A0] to-[#C69C6D]
                                    text-black font-semibold text-sm sm:text-base tracking-wide
                                    shadow-[0_10px_30px_rgba(0,0,0,0.35)] border border-white/20
                                    backdrop-blur-md hover:scale-[1.02] active:scale-95 transition-transform duration-200"
                            >
                                <LogIn size={18} className="opacity-80" />
                                <span className="whitespace-nowrap">{t('auth.loginRegister')}</span>
                            </button>
                        )}

            <style jsx global>{`
                /* Ẩn thanh cuộn */
                ::-webkit-scrollbar { display: none; }
                html, body { -ms-overflow-style: none; scrollbar-width: none; overflow-x: hidden; width: 100%; }
                .text-stroke-title { -webkit-text-stroke: 1px #F5F5F5; color: transparent; text-shadow: 0 0 15px rgba(198,156,109,0.3); font-family: 'Playfair Display', Georgia, serif; }
                @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }

                /* Greeting zoom-out animation (~5s, shrink to center) */
                @keyframes greetingZoomOut {
                    0% { transform: scale(1.15); opacity: 1; }
                    40% { transform: scale(1.0); opacity: 0.9; }
                    70% { transform: scale(0.6); opacity: 0.5; }
                    100% { transform: scale(0.2); opacity: 0; }
                }
                .greeting-zoom-out {
                    animation: greetingZoomOut 5s ease-in forwards;
                }
            `}</style>
        </div>
    );
}