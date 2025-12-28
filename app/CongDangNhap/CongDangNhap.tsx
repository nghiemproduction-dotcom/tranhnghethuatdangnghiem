'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/ThuVien/ketNoiSupabase'; 
import { X, Square, CheckSquare, Phone } from 'lucide-react'; 

import NenHieuUng from './NenHieuUng';
import TieuDe from './TieuDe';
import ONhapLieu from './ONhapLieu';
import NutXacNhan from './NutXacNhan';
// Đã bỏ import ChanForm vì chúng ta sẽ tự viết footer để bỏ dòng Power by

export default function CongDangNhap({ isOpen, onClose, isGateKeeper = false }: { isOpen?: boolean; onClose?: () => void; isGateKeeper?: boolean }) {
  const router = useRouter();
  
  const [user, setUser] = useState({ name: '', phone: '' });
  const [flags, setFlags] = useState({ loading: false, anim: false });
  const [isError, setIsError] = useState(false);
  
  const [wantFullScreen, setWantFullScreen] = useState(true);
  const [rememberMe, setRememberMe] = useState(true); 
  const [showPhone, setShowPhone] = useState(false); 

  const isModal = typeof isOpen === 'boolean';
  
  // --- HELPERS ---
  const normalizeString = (str: string) => {
      if (!str) return '';
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  };

  const normalizeRole = (str: string) => {
      if (!str) return 'khach';
      return normalizeString(str).replace(/[^a-z0-9]/g, "");       
  };

  const isVipCustomer = (phanLoai: string) => {
      const s = normalizeString(phanLoai);
      return s.includes('vip') || s.includes('trong tam');
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
     // Load saved credentials
    const savedCreds = localStorage.getItem('SAVED_CREDS');
    if (savedCreds) {
        try {
            const parsed = JSON.parse(savedCreds);
            if (parsed.email) setUser(prev => ({ ...prev, name: parsed.email }));
            if (parsed.phone) setUser(prev => ({ ...prev, phone: parsed.phone }));
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
    e.preventDefault();
    
    if (typeof window !== 'undefined') localStorage.setItem('GLOBAL_FULLSCREEN_PREF', wantFullScreen ? 'true' : 'false');
    if (wantFullScreen) triggerFullScreen();

    setFlags(p => ({...p, loading: true})); 
    setIsError(false);

    const email = user.name.trim();
    const phone = user.phone.trim();
    
    try {
        // 1. Auth check
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email, password: phone });
        if (authError) throw new Error("Thông tin đăng nhập không chính xác.");

        let finalUser = null;
        let finalRole = 'khach';
        let finalPosition = '';

        // 2. Check Nhan Su
        const { data: nhanVien } = await supabase.from('nhan_su').select('*').eq('email', email).single();

        if (nhanVien) {
            finalUser = nhanVien;
            finalPosition = nhanVien.vi_tri || 'Nhân Viên';
            finalRole = normalizeRole(finalPosition);
        } else {
            // 3. Check Khach Hang VIP
            const { data: khachHang } = await supabase.from('khach_hang').select('*').eq('email', email).single();
            if (khachHang) {
                if (isVipCustomer(khachHang.phan_loai)) {
                    finalUser = khachHang;
                    finalPosition = khachHang.phan_loai || 'Khách Hàng VIP';
                    finalRole = 'khach_vip'; 
                } else {
                    throw new Error("Tài khoản Khách hàng này không đủ quyền truy cập.");
                }
            }
        }

        if (!finalUser) throw new Error("Không tìm thấy hồ sơ Nhân sự hoặc Khách hàng VIP.");

        // 4. Save Logic
        if (rememberMe) localStorage.setItem('SAVED_CREDS', JSON.stringify({ email, phone }));
        else localStorage.removeItem('SAVED_CREDS');

        const userInfo = {
            id: finalUser.id,
            ho_ten: finalUser.ten_hien_thi || finalUser.ho_ten || email,
            email: email,
            vi_tri: finalPosition, 
            role: finalRole,  
            avatar_url: finalUser.hinh_anh
        };
        
        localStorage.removeItem('LA_ADMIN_CUNG');
        localStorage.setItem('USER_INFO', JSON.stringify(userInfo));
        localStorage.setItem('USER_ROLE', finalRole);

        // 5. Redirect (Hard Refresh)
        window.location.href = '/trangchu';

    } catch (err: any) { 
        console.error("Lỗi:", err.message);
        alert(`Đăng nhập thất bại: ${err.message}`); 
        setIsError(true); 
        setFlags(p => ({...p, loading: false})); 
    } 
  };

  const handleClose = () => { 
      if (isGateKeeper) { router.push('/'); return; }
      setFlags(p => ({...p, anim: false})); 
      setTimeout(() => onClose && onClose(), 300); 
  };
  
  return (
    // Req 5 & 6: Fixed, 100dvh (chống trượt), overflow-hidden
    <div className={`fixed inset-0 z-[9999] w-screen h-[100dvh] font-sans text-white overflow-hidden bg-black/90 backdrop-blur-sm flex items-center justify-center`}>
      
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
        <form onSubmit={handleSubmit} className="w-full px-6 flex flex-col items-center justify-center relative z-10">
            
            {/* Req 1: Tăng độ rộng container lên 500px và w-full */}
            <div className="w-full max-w-[500px] flex flex-col gap-5 md:gap-6">
                
                {/* Tiêu đề - Shake effect khi lỗi */}
                <div className={`flex justify-center mb-2 ${isError ? 'animate-shake' : ''}`}>
                    <TieuDe />
                </div>
                
                {/* Input Group */}
                <div className={`flex flex-col gap-4 ${isError ? 'animate-shake' : ''}`}>
                    <ONhapLieu 
                        id="inp_email" 
                        label="EMAIL" 
                        value={user.name} 
                        onChange={v => setUser(p => ({...p, name: v}))} 
                    />
                    
                    <ONhapLieu 
                        id="inp_phone" 
                        label="SỐ ĐIỆN THOẠI" 
                        value={user.phone} 
                        onChange={v => setUser(p => ({...p, phone: v}))} 
                        type="text" 
                        showEye={true}
                        isPasswordVisible={showPhone}
                        onToggleEye={() => setShowPhone(!showPhone)}
                    />
                    
                    {/* Options Checkbox */}
                    <div className="flex flex-row items-center justify-between px-1 mt-1">
                        {/* Ghi nhớ */}
                        <div className="flex items-center gap-2 cursor-pointer group select-none" onClick={() => setRememberMe(!rememberMe)}>
                            <div className={`transition-colors ${rememberMe ? 'text-[#C69C6D]' : 'text-gray-600 group-hover:text-gray-400'}`}>
                                {rememberMe ? <CheckSquare size={16} /> : <Square size={16} />}
                            </div>
                            <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${rememberMe ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'}`}>
                                Ghi nhớ
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
                </div>
            </div>

            {/* Req 4: Nút Login dời lên (giảm margin top) */}
            <div className="w-full max-w-[500px] mt-6 flex justify-center">
                <NutXacNhan isLoading={flags.loading} />
            </div>

            {/* Req 2 & 3: Footer mới - Bỏ "Power by" và thêm Link gọi điện */}
            <div className="mt-6 text-center">
                 <a 
                    href="tel:+84939941588" 
                    className="inline-flex items-center gap-2 text-xs md:text-sm text-white/40 hover:text-white transition-all duration-300 border-b border-transparent hover:border-white/50 pb-0.5 group"
                 >
                    <Phone size={12} className="group-hover:text-green-400 transition-colors" />
                    <span>Cần hỗ trợ đăng nhập?</span>
                 </a>
            </div>

        </form>

      </div>
      
      <style jsx global>{`
        @keyframes shake { 
            0%, 100% { transform: translateX(0); } 
            25% { transform: translateX(-5px); } 
            75% { transform: translateX(5px); } 
        } 
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}