'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/ThuVien/ketNoiSupabase'; 
import { X, Maximize, Check } from 'lucide-react'; // Import icon cần thiết

import NenHieuUng from './NenHieuUng';
import TieuDe from './TieuDe';
import ONhapLieu from './ONhapLieu';
import NutXacNhan from './NutXacNhan';
import ChanForm from './ChanForm';

export default function CongDangNhap({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const router = useRouter();
  
  const [user, setUser] = useState({ name: '', pass: '' });
  const [flags, setFlags] = useState({ showPass: false, loading: false, anim: false });
  const [isError, setIsError] = useState(false);
  
  // State điều khiển màn hình Fullscreen
  const [showFullScreenPrompt, setShowFullScreenPrompt] = useState(false);
  const [targetPath, setTargetPath] = useState('/'); 

  const isModal = typeof isOpen === 'boolean';
  
  useEffect(() => {
    if (isOpen) setTimeout(() => setFlags(p => ({...p, anim: true})), 50);
    else setFlags(p => ({...p, anim: false}));
  }, [isOpen]);

  if (isModal && !isOpen) return null;

  // HÀM KÍCH HOẠT FULLSCREEN VÀ CHUYỂN TRANG
  const enterApp = () => {
      const elem = document.documentElement as any;
      if (elem.requestFullscreen) {
          elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
      }
      
      // Chuyển đến trang đích đã lưu
      router.replace(targetPath);
      if(onClose) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlags(p => ({...p, loading: true})); 
    setIsError(false);

    const email = user.name.trim();
    const pass = user.pass;
    let nextPath = '/';

    // 1. CỬA SAU ADMIN CỨNG
    if (email === 'admin' && pass === 'admin') {
        if (typeof window !== 'undefined') {
            localStorage.setItem('LA_ADMIN_CUNG', 'true');
            localStorage.setItem('USER_ROLE', 'admin');
        }
        
        // 🟢 QUAN TRỌNG: Đặt đích đến là phòng Demo
        nextPath = '/phongdemo'; 
        
        // Lưu đích đến và hiện bảng mời Fullscreen
        setTargetPath(nextPath);
        setFlags(p => ({...p, loading: false}));
        setShowFullScreenPrompt(true);
        return;
    }

    // 2. ĐĂNG NHẬP THẬT (USER DB)
    try {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (authError) throw authError;

        const { data: nhanVien, error: dbError } = await supabase
            .from('nhan_su')
            .select('vi_tri') 
            .eq('email', email)
            .single();

        if (dbError || !nhanVien) throw new Error("Không tìm thấy thông tin nhân sự");

        const viTri = (nhanVien.vi_tri || '').toLowerCase().trim();
        localStorage.removeItem('LA_ADMIN_CUNG');
        localStorage.setItem('USER_ROLE', viTri);

        switch (viTri) {
            case 'admin':
            case 'quanly':
            case 'manager': nextPath = '/phongquanly'; break;
            case 'sales': nextPath = '/phongsales'; break;
            case 'thosanxuat': nextPath = '/phongsanxuat'; break;
            default: nextPath = '/'; 
        }
        
        setTargetPath(nextPath);
        setShowFullScreenPrompt(true);

    } catch (err: any) { 
        console.error("Lỗi:", err.message);
        alert(`Đăng nhập thất bại: ${err.message}`); 
        setIsError(true); 
    } finally { 
        if (!showFullScreenPrompt) setFlags(p => ({...p, loading: false})); 
    }
  };

  const handleClose = () => { 
      setFlags(p => ({...p, anim: false})); 
      setTimeout(() => onClose && onClose(), 300); 
  };
  
  const handleRegister = () => alert("Vui lòng liên hệ Quản lý để cấp tài khoản.");
  const handleForgot = () => alert("Vui lòng liên hệ Quản lý để cấp lại mật khẩu.");

  return (
    <div className={`fixed inset-0 z-[9999] w-screen h-[100dvh] font-sans text-white overflow-hidden bg-black/90 backdrop-blur-sm`}>
      <div className="opacity-50"><NenHieuUng isModalMode={isModal} /></div>

      <div className={`relative w-full h-full transition-all duration-700 ease-out transform ${isModal ? (flags.anim ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-110') : 'opacity-100'}`}>
        
        {isModal && !showFullScreenPrompt && (
            <button onClick={handleClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 z-50 bg-black/20 rounded-full">
                <X size={32} strokeWidth={1.5} />
            </button>
        )}

        {/* MÀN HÌNH CHỜ FULLSCREEN */}
        {showFullScreenPrompt ? (
            <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center max-w-sm text-center">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-6 animate-bounce">
                        <Check size={48} strokeWidth={3} />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white uppercase tracking-widest mb-2">Đăng Nhập Thành Công</h2>
                    <p className="text-gray-400 text-sm mb-8">Hệ thống đã sẵn sàng.</p>

                    <button 
                        onClick={enterApp}
                        className="group relative px-8 py-4 bg-[#1A1A1A] border border-white/20 hover:border-blue-500/50 rounded-full transition-all duration-300 active:scale-95 shadow-2xl overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/20 to-blue-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"/>
                        <span className="relative z-10 flex items-center gap-3 text-white font-bold text-sm uppercase tracking-widest">
                            <Maximize size={18} /> Vào Ứng Dụng Ngay
                        </span>
                    </button>
                </div>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="w-full h-full flex flex-col justify-between items-center py-8 md:py-12">
                <div className="flex-none h-10 md:h-16" /> 

                <div className="flex-1 w-full max-w-[420px] flex flex-col justify-center px-8 gap-8 md:gap-10">
                    <div className={`${isError ? 'animate-shake' : ''}`}>
                        <TieuDe />
                    </div>

                    <div className={`flex flex-col gap-6 ${isError ? 'animate-shake' : ''}`}>
                        <ONhapLieu id="inp_email" label="EMAIL" value={user.name} onChange={v => setUser(p => ({...p, name: v}))} />
                        <ONhapLieu id="inp_pass" label="PASSWORD" value={user.pass} onChange={v => setUser(p => ({...p, pass: v}))} showEye={true} isPasswordVisible={flags.showPass} onToggleEye={() => setFlags(p => ({...p, showPass: !p.showPass}))} />
                        <ChanForm onRegisterClick={handleRegister} onForgotPasswordClick={handleForgot} />
                    </div>
                </div>

                <div className="flex-none w-full flex justify-center pb-4 md:pb-8">
                    <NutXacNhan isLoading={flags.loading} />
                </div>
            </form>
        )}

      </div>
      <style jsx global>{` @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } } .animate-shake { animation: shake 0.3s ease-in-out; } `}</style>
    </div>
  );
}