'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/ThuVien/ketNoiSupabase'; 
import { AuthService } from '@/app/CongDangNhap/AuthService';
import { getRedirectUrl } from '@/app/CongDangNhap/RoleRedirectService';
import { X, Square, CheckSquare, Lock, Eye, EyeOff, Loader2, ArrowRight, Mail, ArrowLeft, UserPlus, KeyRound } from 'lucide-react'; 
import { Z_INDEX } from '@/app/constants/zIndex';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const BASE_IMG_URL = `${SUPABASE_URL}/storage/v1/object/public/hinh-nen`;

// Hiệu ứng nền
const NenHieuUng = ({ isModalMode }: { isModalMode: boolean }) => {
    const bgMobile = `${BASE_IMG_URL}/login-mobile.jpg`;
    const bgTablet = `${BASE_IMG_URL}/login-tablet.jpg`;
    const bgDesktop = `${BASE_IMG_URL}/login-desktop.jpg`;

    return (
        <div className={`absolute inset-0 bg-[#050505] overflow-hidden ${isModalMode ? 'rounded-2xl' : ''}`}>
            <div
                className="absolute inset-0 bg-cover bg-center md:hidden transition-opacity duration-700"
                style={{ backgroundImage: `url('${bgMobile}')` }}
            />
            <div
                className="absolute inset-0 bg-cover bg-center hidden md:block lg:hidden transition-opacity duration-700"
                style={{ backgroundImage: `url('${bgTablet}')` }}
            />
            <div
                className="absolute inset-0 bg-cover bg-center hidden lg:block transition-opacity duration-700"
                style={{ backgroundImage: `url('${bgDesktop}')` }}
            />
            <div className={`absolute inset-0 bg-black/60 ${isModalMode ? 'bg-black/70' : ''}`} />
            <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[100px] mix-blend-overlay" />
        </div>
    );
};

// Ô nhập liệu
const ONhapLieu = ({
    id,
    label,
    value,
    onChange,
    type = 'text',
    showEye = false,
    isPasswordVisible = false,
    onToggleEye,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (val: string) => void;
    type?: string;
    showEye?: boolean;
    isPasswordVisible?: boolean;
    onToggleEye?: () => void;
}) => {
    const inputType = showEye ? (isPasswordVisible ? 'text' : 'password') : type;

    return (
        <div className="group relative w-full">
            <label
                htmlFor={id}
                className="block text-white/80 text-xs font-bold uppercase tracking-[0.2em] mb-2 drop-shadow-md ml-1"
            >
                {label}
            </label>

            <div className="relative w-full">
                <input
                    id={id}
                    type={inputType}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-black/40 hover:bg-black/60 focus:bg-black/80 
                                                                 text-white text-lg font-bold tracking-wider
                                                                 border border-white/20 focus:border-[#C69C6D]
                                                                 rounded-xl px-5 py-4 
                                                                 outline-none transition-all duration-300
                                                                 placeholder-transparent shadow-lg"
                    autoComplete="off"
                />

                {showEye && (
                    <button
                        type="button"
                        onClick={onToggleEye}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#C69C6D] transition-colors p-1"
                        tabIndex={-1}
                    >
                        {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>

            <div className="absolute bottom-0 left-5 right-5 h-[1px] bg-[#C69C6D] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left"></div>
        </div>
    );
};

// Nút xác nhận
const NutXacNhan = ({ isLoading, mode = 'login' }: { isLoading: boolean; mode?: 'login' | 'register' | 'forgotPassword' }) => {
    const getButtonText = () => {
        switch (mode) {
            case 'register': return 'ĐĂNG KÝ';
            case 'forgotPassword': return 'GỬI EMAIL';
            default: return 'LOGIN';
        }
    };

    const getIcon = () => {
        switch (mode) {
            case 'register': return <UserPlus size={28} className="group-hover:scale-110 transition-transform duration-500" strokeWidth={2} />;
            case 'forgotPassword': return <Mail size={28} className="group-hover:scale-110 transition-transform duration-500" strokeWidth={2} />;
            default: return <ArrowRight size={28} className="group-hover:-rotate-45 transition-transform duration-500" strokeWidth={2} />;
        }
    };

    return (
        <button
            type="submit"
            disabled={isLoading}
            className="group mt-8 flex flex-col items-center gap-3 opacity-90 hover:opacity-100 transition-all disabled:opacity-50 mx-auto"
        >
            <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center 
                                                            bg-transparent border-2 border-white/30 text-white 
                                                            group-hover:bg-white group-hover:text-black group-hover:border-white 
                                                            group-hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]
                                                            transition-all duration-500 ease-out shadow-xl"
            >
                {isLoading ? (
                    <Loader2 className="animate-spin" size={28} />
                ) : (
                    getIcon()
                )}
            </div>

            <div className="flex flex-col items-center">
                <span className="text-lg font-bold tracking-[0.3em] text-white group-hover:text-yellow-400 transition-colors drop-shadow-md">
                    {isLoading ? '...' : getButtonText()}
                </span>
            </div>
        </button>
    );
};

// Tiêu đề placeholder
const TieuDe = () => null;

export default function CongDangNhap({ isOpen, onClose, isGateKeeper = false }: { isOpen?: boolean; onClose?: () => void; isGateKeeper?: boolean }) {
    console.log('🎨 CongDangNhap MOUNTED/RENDERED', { isOpen, isGateKeeper });
    
    const router = useRouter();
    
    // 📌 STATE: Mode - login | register | forgotPassword
    const [mode, setMode] = useState<'login' | 'register' | 'forgotPassword'>('login');
    
    const [user, setUser] = useState({ name: '', phone: '', confirmPassword: '', hoTen: '' });
    const [flags, setFlags] = useState({ loading: false, anim: false });
    const [isError, setIsError] = useState(false);
    
    const [wantFullScreen, setWantFullScreen] = useState(true);
    const [rememberMe, setRememberMe] = useState(true); 
    const [showPhone, setShowPhone] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    const isModal = typeof isOpen === 'boolean';
    
    // --- HELPERS ---
    const normalizeString = (str: string) => {
        if (!str) return '';
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    };

    const isVipCustomer = (phanLoai: string) => {
        // ✅ ALLOW: All khách_hang types (vip, doitac, moi, damuahang, khtrongtam, etc.)
        // ✅ The RoleRedirectService will handle route restrictions
        return !!phanLoai && phanLoai.trim().length > 0;
    };

    // --- EFFECTS ---
    useEffect(() => {
        // Animation entry
        if (isOpen) {
            const timer = setTimeout(() => setFlags(p => ({...p, anim: true})), 50);
            return () => clearTimeout(timer);
        } else {
            setFlags(p => ({...p, anim: false}));
        }
    }, [isOpen]);

    useEffect(() => {
        // ✅ FIX: Load saved email only (not password for security)
        const savedEmail = localStorage.getItem('SAVED_EMAIL');
        if (savedEmail) {
            try {
                const parsed = JSON.parse(savedEmail);
                if (parsed.email) setUser(prev => ({ ...prev, name: parsed.email }));
                setRememberMe(true);
            } catch (e) { setRememberMe(false); }
        }

        // Load fullscreen preference
        const savedPref = localStorage.getItem('GLOBAL_FULLSCREEN_PREF');
        if (savedPref !== null) setWantFullScreen(savedPref === 'true');
    }, []);

    if (isModal && !isOpen) return null;

    // --- HANDLERS ---
    const triggerFullScreen = () => {
        try {
            const elem = document.documentElement as any;
            if (elem.requestFullscreen) elem.requestFullscreen();
            else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
        } catch (err) { console.warn("Fullscreen error:", err); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        console.log('🚀 handleSubmit TRIGGERED');
        e.preventDefault();
        
        console.log('🔒 Form values:', { email: user.name, passwordLength: user.phone.length });
        
        if (typeof window !== 'undefined') localStorage.setItem('GLOBAL_FULLSCREEN_PREF', wantFullScreen ? 'true' : 'false');
        if (wantFullScreen) triggerFullScreen();

        setFlags(p => ({...p, loading: true})); 
        setIsError(false);

        const email = user.name.trim().toLowerCase();
        const phone = user.phone.trim();
        
        console.log('🔐 ATTEMPTING LOGIN:', { email, passwordLength: phone.length });
        
        try {
            // 1. Auth check
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
                email, 
                password: phone 
            });
            
            if (authError) {
                console.error('❌ AUTH FAILED:', authError);
                throw new Error(`Lỗi đăng nhập: ${authError.message}`);
            }

            console.log('✅ AUTH SUCCESS for email:', email);
            
            // ✅ CRITICAL: Verify session was saved before proceeding
            if (!authData.session) {
                throw new Error('Session không được tạo. Vui lòng thử lại.');
            }
            console.log('✅ SESSION CREATED:', authData.session.access_token.substring(0, 20) + '...');

            // 2. Load profile via RPC (tránh phụ thuộc session vừa set)
            const finalUser = await AuthService.getUserByEmailWithRpc(email);
            console.log('📋 LOADED USER:', finalUser);
            
            if (!finalUser) throw new Error("Không tìm thấy hồ sơ. Vui lòng liên hệ quản trị viên.");

            let finalRole = 'khach';
            let finalPosition = '';
            let finalRoleNormalized = '';

            if (finalUser.userType === 'nhan_su') {
                finalPosition = finalUser.vi_tri || 'Nhân Viên';
                // ✅ Ưu tiên vi_tri_normalized từ DB, nếu không có thì fallback 'parttime'
                finalRoleNormalized = (finalUser as any).vi_tri_normalized || 'parttime';
                finalRole = finalRoleNormalized;
                console.log('🔴 NHAN_SU:', { vi_tri: finalPosition, vi_tri_normalized: finalRoleNormalized });
            } else {
                const phanLoai = finalUser.phan_loai || '';
                console.log('🟢 KHACH_HANG:', { phan_loai: phanLoai });
                
                if (!isVipCustomer(phanLoai)) throw new Error("Tài khoản này không được phép truy cập. Vui lòng liên hệ quản lý.");
                finalPosition = phanLoai || 'Khách Hàng';
                // ✅ Ưu tiên phan_loai_normalized từ DB, nếu không có thì fallback 'moi'
                finalRoleNormalized = (finalUser as any).phan_loai_normalized || 'moi';
                finalRole = finalRoleNormalized;
                console.log('🟢 KHACH_HANG APPROVED:', { phan_loai_normalized: finalRoleNormalized });
            }

            // 4. Save Logic
            // ✅ SECURITY FIX: Never store password in localStorage
            if (rememberMe) localStorage.setItem('SAVED_EMAIL', JSON.stringify({ email }));
            else localStorage.removeItem('SAVED_EMAIL');

            const userInfo = {
                id: finalUser.id,
                ho_ten: (finalUser as any).ten_hien_thi || finalUser.ho_ten || email,
                email: email,
                vi_tri: finalPosition, 
                role: finalRole,
                role_normalized: finalRoleNormalized, // Lưu thêm cái này cho chắc
                userType: finalUser.userType,
                avatar_url: (finalUser as any).hinh_anh
                // ✅ NEVER include password, token, or sensitive data
            };
            
            localStorage.removeItem('LA_ADMIN_CUNG');
            localStorage.setItem('USER_INFO', JSON.stringify(userInfo));
            localStorage.setItem('USER_ROLE', finalRole);
            console.log('💾 SAVED TO LOCALSTORAGE:', { 
               USER_INFO: userInfo, 
               USER_ROLE: finalRole
            });
            
            // Nếu trước đó ở chế độ khách, xoá cookie visitor
            document.cookie = 'VISITOR_MODE=; Path=/; Max-Age=0; SameSite=Lax';

            // 5. Redirect - Close modal first if needed
            if (isModal && onClose) {
                onClose(); 
            }
            
            // ✅ Sử dụng normalized value từ database trực tiếp
            // Gọi service đã được fix fallback
            let redirectUrl = await getRedirectUrl(finalUser.userType, finalRoleNormalized);
            
            // 🛑 SAFETY CHECK: Chống loop vô tận
            // Nếu là nhân sự mà lại redirect về trang chủ (do lỗi DB) -> Force về phòng tương ứng
            if (finalUser.userType === 'nhan_su' && (redirectUrl === '/' || redirectUrl === '/trangchu')) {
                 console.warn("⚠️ Redirect Safety Triggered: Nhân sự bị đẩy về trang chủ -> Force redirect to dedicated room.");
                 if (finalRoleNormalized.includes('quanly')) redirectUrl = '/phongquanly';
                 else if (finalRoleNormalized.includes('admin')) redirectUrl = '/phongadmin';
                 else if (finalRoleNormalized.includes('sales')) redirectUrl = '/phongsales';
                 else redirectUrl = '/phongparttime'; // Fallback an toàn nhất
            }

            console.log('✅ LOGIN SUCCESS -> TARGET:', redirectUrl);
            
            // ✅ CRITICAL: Wait for Supabase to save session to localStorage
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Verify session is in localStorage
            const { data: { session: verifySession } } = await supabase.auth.getSession();
            if (!verifySession) {
                console.error('❌ SESSION NOT PERSISTED');
                throw new Error('Session không được lưu. Vui lòng thử lại.');
            }
            
            // Force hard refresh to redirect destination
            console.log('🔄 EXECUTING REDIRECT...');
            window.location.href = redirectUrl;

        } catch (err: any) { 
            const errorMsg = err?.message || 'Lỗi không xác định';
            console.error("❌ LOGIN ERROR:", err);
            setErrorMessage(errorMsg);
            setShowErrorDialog(true); 
            setIsError(true); 
            setFlags(p => ({...p, loading: false})); 
        } 
    };

    const handleClose = () => { 
        if (isGateKeeper) { router.push('/'); return; }
        setFlags(p => ({...p, anim: false})); 
        setTimeout(() => onClose && onClose(), 300); 
    };

    // 📌 HANDLER: Đăng ký tài khoản mới
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setFlags(p => ({...p, loading: true}));
        setIsError(false);

        const email = user.name.trim().toLowerCase();
        const password = user.phone.trim();
        const confirmPassword = user.confirmPassword.trim();
        const hoTen = user.hoTen.trim();

        // Validation
        if (!email || !email.includes('@')) {
            setErrorMessage('Email không hợp lệ');
            setShowErrorDialog(true);
            setIsError(true);
            setFlags(p => ({...p, loading: false}));
            return;
        }

        if (password.length < 6) {
            setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự');
            setShowErrorDialog(true);
            setIsError(true);
            setFlags(p => ({...p, loading: false}));
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Mật khẩu xác nhận không khớp');
            setShowErrorDialog(true);
            setIsError(true);
            setFlags(p => ({...p, loading: false}));
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { ho_ten: hoTen || email.split('@')[0] }
                }
            });

            if (error) throw error;

            // Success
            setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
            setShowSuccessDialog(true);
            
            // Clear form and switch to login
            setUser({ name: email, phone: '', confirmPassword: '', hoTen: '' });
            setTimeout(() => {
                setShowSuccessDialog(false);
                setMode('login');
            }, 3000);

        } catch (err: any) {
            console.error("Lỗi đăng ký:", err.message);
            setErrorMessage(err.message || 'Đăng ký thất bại');
            setShowErrorDialog(true);
            setIsError(true);
        } finally {
            setFlags(p => ({...p, loading: false}));
        }
    };

    // 📌 HANDLER: Quên mật khẩu
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setFlags(p => ({...p, loading: true}));
        setIsError(false);

        const email = user.name.trim().toLowerCase();

        if (!email || !email.includes('@')) {
            setErrorMessage('Vui lòng nhập email hợp lệ');
            setShowErrorDialog(true);
            setIsError(true);
            setFlags(p => ({...p, loading: false}));
            return;
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) throw error;

            // Success
            setSuccessMessage('Đã gửi link đặt lại mật khẩu! Vui lòng kiểm tra email của bạn.');
            setShowSuccessDialog(true);
            
            setTimeout(() => {
                setShowSuccessDialog(false);
                setMode('login');
            }, 3000);

        } catch (err: any) {
            console.error("Lỗi reset password:", err.message);
            setErrorMessage(err.message || 'Không thể gửi email');
            setShowErrorDialog(true);
            setIsError(true);
        } finally {
            setFlags(p => ({...p, loading: false}));
        }
    };

    // 📌 Lấy title theo mode
    const getModeTitle = () => {
        switch (mode) {
            case 'register': return 'ĐĂNG KÝ';
            case 'forgotPassword': return 'QUÊN MẬT KHẨU';
            default: return 'LOGIN';
        }
    };
    
    return (
        // Req 5 & 6: Fixed, 100dvh (chống trượt), overflow-hidden
        <div className={`fixed inset-0 w-screen h-[100dvh] font-sans text-white overflow-hidden bg-black/90 backdrop-blur-sm flex items-center justify-center`} style={{ zIndex: Z_INDEX.modal }}>
            
            {/* Background Effect */}
            <div className="absolute inset-0 opacity-50 pointer-events-none">
                <NenHieuUng isModalMode={isModal} />
            </div>

            {/* Main Container - Transition logic */}
            <div className={`relative w-full h-full max-w-screen-xl mx-auto flex flex-col items-center justify-center transition-all duration-700 ease-out transform 
                  ${isModal ? (flags.anim ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-110') : 'opacity-100'}
            `}>
                
                {/* Close Button */}
                {isModal && (
                    <button onClick={handleClose} className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white transition-colors p-2 z-50 bg-black/20 rounded-full active:scale-95">
                        <X size={24} className="md:w-8 md:h-8" strokeWidth={1.5} />
                    </button>
                )}

                {/* Form Container - Req 8: Cân giữa hoàn toàn */}
                <form onSubmit={mode === 'login' ? handleSubmit : mode === 'register' ? handleRegister : handleForgotPassword} className="w-full px-6 flex flex-col items-center justify-center relative z-10">
                    
                    {/* Req 1: Tăng độ rộng container lên 500px và w-full */}
                    <div className="w-full max-w-[500px] flex flex-col gap-5 md:gap-6">
                        
                        {/* Mode Title với Back button */}
                        <div className={`flex items-center justify-center mb-2 ${isError ? 'animate-shake' : ''}`}>
                            {mode !== 'login' && (
                                <button
                                    type="button"
                                    onClick={() => setMode('login')}
                                    className="absolute left-6 md:left-auto md:relative md:mr-4 text-white/50 hover:text-white transition-colors p-2"
                                >
                                    <ArrowLeft size={24} />
                                </button>
                            )}
                            <h1 className="text-2xl md:text-3xl font-bold tracking-[0.3em] text-white/80">
                                {getModeTitle()}
                            </h1>
                        </div>
                        
                        {/* Input Group - Dynamic based on mode */}
                        <div className={`flex flex-col gap-4 ${isError ? 'animate-shake' : ''}`}>
                            
                            {/* Họ tên - Chỉ hiển thị khi đăng ký */}
                            {mode === 'register' && (
                                <ONhapLieu 
                                    id="inp_hoten" 
                                    label="HỌ TÊN"
                                    value={user.hoTen} 
                                    onChange={v => setUser(p => ({...p, hoTen: v}))} 
                                />
                            )}
                            
                            {/* Email - Luôn hiển thị */}
                            <ONhapLieu 
                                id="inp_email" 
                                label="EMAIL" 
                                value={user.name} 
                                onChange={v => setUser(p => ({...p, name: v}))} 
                            />
                            
                            {/* Mật khẩu - Không hiển thị khi quên mật khẩu */}
                            {mode !== 'forgotPassword' && (
                                <ONhapLieu 
                                    id="inp_password" 
                                    label="MẬT KHẨU"
                                    value={user.phone} 
                                    onChange={v => setUser(p => ({...p, phone: v}))} 
                                    type={showPhone ? 'text' : 'password'} 
                                    showEye={true}
                                    isPasswordVisible={showPhone}
                                    onToggleEye={() => setShowPhone(!showPhone)}
                                />
                            )}
                            
                            {/* Xác nhận mật khẩu - Chỉ hiển thị khi đăng ký */}
                            {mode === 'register' && (
                                <ONhapLieu 
                                    id="inp_confirm_password" 
                                    label="XÁC NHẬN MẬT KHẨU"
                                    value={user.confirmPassword} 
                                    onChange={v => setUser(p => ({...p, confirmPassword: v}))} 
                                    type={showConfirmPassword ? 'text' : 'password'} 
                                    showEye={true}
                                    isPasswordVisible={showConfirmPassword}
                                    onToggleEye={() => setShowConfirmPassword(!showConfirmPassword)}
                                />
                            )}
                            
                            {/* Options Checkbox - Chỉ hiển thị khi đăng nhập */}
                            {mode === 'login' && (
                                <div className="flex flex-row items-center justify-between px-1 mt-1">
                                    {/* Ghi nhớ */}
                                    <div className="flex items-center gap-2 cursor-pointer group select-none" onClick={() => setRememberMe(!rememberMe)}>
                                        <div className={`transition-colors ${rememberMe ? 'text-[#C69C6D]' : 'text-gray-600 group-hover:text-gray-400'}`}>
                                            {rememberMe ? <CheckSquare size={16} /> : <Square size={16} />}
                                        </div>
                                        <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${rememberMe ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'}`}>
                                            GHI NHỚ ĐĂNG NHẬP
                                        </span>
                                    </div>

                                    {/* Fullscreen */}
                                    <div className="flex items-center gap-2 cursor-pointer group select-none" onClick={() => setWantFullScreen(!wantFullScreen)}>
                                        <div className={`transition-colors ${wantFullScreen ? 'text-yellow-500' : 'text-gray-600 group-hover:text-gray-400'}`}>
                                            {wantFullScreen ? <CheckSquare size={16} /> : <Square size={16} />}
                                        </div>
                                        <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${wantFullScreen ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'}`}>
                                            Toàn màn hình
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nút Submit */}
                    <div className="w-full max-w-[500px] mt-6 flex justify-center">
                        <NutXacNhan isLoading={flags.loading} mode={mode} />
                    </div>

                    {/* Footer Links */}
                    <div className="mt-6 flex flex-col items-center gap-3">
                        {mode === 'login' && (
                            <>
                                {/* Quên mật khẩu */}
                                <button
                                    type="button"
                                    onClick={() => setMode('forgotPassword')}
                                    className="inline-flex items-center gap-2 text-xs md:text-sm text-white/40 hover:text-[#C69C6D] transition-all duration-300"
                                >
                                    <KeyRound size={14} />
                                    <span>Quên mật khẩu?</span>
                                </button>
                                
                                {/* Đăng ký */}
                                <button
                                    type="button"
                                    onClick={() => setMode('register')}
                                    className="inline-flex items-center gap-2 text-xs md:text-sm text-white/40 hover:text-[#C69C6D] transition-all duration-300"
                                >
                                    <UserPlus size={14} />
                                    <span>Chưa có tài khoản? Đăng ký ngay</span>
                                </button>
                            </>
                        )}
                        
                        {mode === 'register' && (
                            <button
                                type="button"
                                onClick={() => setMode('login')}
                                className="inline-flex items-center gap-2 text-xs md:text-sm text-white/40 hover:text-[#C69C6D] transition-all duration-300"
                            >
                                <span>Đã có tài khoản? Đăng nhập</span>
                            </button>
                        )}
                        
                        {mode === 'forgotPassword' && (
                            <button
                                type="button"
                                onClick={() => setMode('login')}
                                className="inline-flex items-center gap-2 text-xs md:text-sm text-white/40 hover:text-[#C69C6D] transition-all duration-300"
                            >
                                <span>Quay lại đăng nhập</span>
                            </button>
                        )}
                        
                        {/* Link hỗ trợ */}
                        <a 
                            href="tel:+84939941588" 
                            className="inline-flex items-center gap-2 text-xs md:text-sm text-white/30 hover:text-white transition-all duration-300 border-b border-transparent hover:border-white/50 pb-0.5 group"
                        >
                            <Lock size={12} className="group-hover:text-green-400 transition-colors" />
                            <span>Cần hỗ trợ?</span>
                        </a>
                    </div>

                </form>

            </div>

            {/* Error Dialog - Hộp thoại thông báo lỗi trang trọng */}
            {showErrorDialog && (
                <div 
                    className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    style={{ zIndex: Z_INDEX.modal + 10 }}
                    onClick={() => setShowErrorDialog(false)}
                >
                    <div 
                        className="relative bg-gradient-to-b from-zinc-900 to-black border border-white/10 rounded-2xl p-8 max-w-sm w-[90%] shadow-2xl transform animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                                <Lock className="w-8 h-8 text-red-400" />
                            </div>
                        </div>

                        {/* Message */}
                        <h3 className="text-xl font-bold text-white text-center mb-2">
                            Đăng nhập thất bại
                        </h3>
                        <p className="text-white/60 text-sm text-center mb-6">
                            {errorMessage || 'Vui lòng kiểm tra lại thông tin'}
                        </p>

                        {/* Button */}
                        <button
                            onClick={() => setShowErrorDialog(false)}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 border border-white/10 hover:border-white/30"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            )}

            {/* Success Dialog - Hộp thoại thông báo thành công */}
            {showSuccessDialog && (
                <div 
                    className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    style={{ zIndex: Z_INDEX.modal + 10 }}
                    onClick={() => setShowSuccessDialog(false)}
                >
                    <div 
                        className="relative bg-gradient-to-b from-emerald-900/30 to-black border border-emerald-500/30 rounded-2xl p-8 max-w-sm w-[90%] shadow-2xl transform animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                <Lock className="w-8 h-8 text-green-400" />
                            </div>
                        </div>

                        {/* Message */}
                        <h3 className="text-xl font-bold text-white text-center mb-2">
                            Thành công!
                        </h3>
                        <p className="text-white/60 text-sm text-center mb-6">
                            {successMessage}
                        </p>

                        {/* Button */}
                        <button
                            onClick={() => setShowSuccessDialog(false)}
                            className="w-full py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-semibold rounded-xl transition-all duration-300 border border-green-500/30 hover:border-green-500/50"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
            
            <style jsx global>{`
                @keyframes shake { 
                    0%, 100% { transform: translateX(0); } 
                    25% { transform: translateX(-5px); } 
                    75% { transform: translateX(5px); } 
                } 
                .animate-shake { animation: shake 0.3s ease-in-out; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </div>
    );
}