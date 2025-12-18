'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/ThuVien/ketNoiSupabase'; 
import { X, Square, CheckSquare, Eye, EyeOff } from 'lucide-react'; 

import NenHieuUng from './NenHieuUng';
import TieuDe from './TieuDe';
import ONhapLieu from './ONhapLieu';
import NutXacNhan from './NutXacNhan';
import ChanForm from './ChanForm';

export default function CongDangNhap({ isOpen, onClose, isGateKeeper = false }: { isOpen?: boolean; onClose?: () => void; isGateKeeper?: boolean }) {
  const router = useRouter();
  
  const [user, setUser] = useState({ name: '', phone: '' });
  const [flags, setFlags] = useState({ loading: false, anim: false });
  const [isError, setIsError] = useState(false);
  
  const [wantFullScreen, setWantFullScreen] = useState(true);
  const [rememberMe, setRememberMe] = useState(true); 
  const [showPhone, setShowPhone] = useState(false); 

  const isModal = typeof isOpen === 'boolean';
  
  // 🟢 HÀM CHUẨN HÓA MẠNH MẼ: 
  // "Quản lý" -> "quanly"
  // "admin" -> "admin"
  // "thosanxuat" -> "thosanxuat"
  const normalizeRole = (str: string) => {
      if (!str) return 'khach';
      return str.normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu tiếng Việt
                .toLowerCase()                   // Chữ thường
                .replace(/[^a-z0-9]/g, "")       // Bỏ ký tự đặc biệt và khoảng trắng
                .trim();
  };

  useEffect(() => {
    if (isOpen) setTimeout(() => setFlags(p => ({...p, anim: true})), 50);
    else setFlags(p => ({...p, anim: false}));

    const savedCreds = localStorage.getItem('SAVED_CREDS');
    if (savedCreds) {
        try {
            const parsed = JSON.parse(savedCreds);
            if (parsed.email) setUser(prev => ({ ...prev, name: parsed.email }));
            if (parsed.phone) setUser(prev => ({ ...prev, phone: parsed.phone }));
            setRememberMe(true);
        } catch (e) {
            setRememberMe(false);
        }
    }

    const savedPref = localStorage.getItem('GLOBAL_FULLSCREEN_PREF');
    if (savedPref !== null) {
        setWantFullScreen(savedPref === 'true');
    }
  }, [isOpen]);

  if (isModal && !isOpen) return null;

  const triggerFullScreen = () => {
      try {
        const elem = document.documentElement as any;
        if (elem.requestFullscreen) elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
        else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
        else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
      } catch (err) {
        console.warn("Fullscreen error:", err);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (typeof window !== 'undefined') {
        localStorage.setItem('GLOBAL_FULLSCREEN_PREF', wantFullScreen ? 'true' : 'false');
    }

    if (wantFullScreen) {
        triggerFullScreen();
    }

    setFlags(p => ({...p, loading: true})); 
    setIsError(false);

    const email = user.name.trim();
    const phone = user.phone.trim();
    let nextPath = '/';

    try {
        // 1. Đăng nhập Supabase
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email, password: phone });
        if (authError) throw new Error("Thông tin đăng nhập không chính xác.");

        // 2. Lấy Role từ bảng NHAN_SU
        const { data: nhanVien, error: dbError } = await supabase
            .from('nhan_su')
            .select('*')
            .eq('email', email)
            .single();

        if (dbError || !nhanVien) throw new Error("Không tìm thấy hồ sơ nhân sự.");

        // 3. Lưu ghi nhớ
        if (rememberMe) {
            localStorage.setItem('SAVED_CREDS', JSON.stringify({ email, phone }));
        } else {
            localStorage.removeItem('SAVED_CREDS');
        }

        // 4. Chuẩn hóa Role
        const viTriGoc = nhanVien.vi_tri || ''; // VD: "Quản lý", "admin"
        const roleChuan = normalizeRole(viTriGoc); // VD: "quanly", "admin"

        const userInfo = {
            id: nhanVien.id,
            ho_ten: nhanVien.ten_hien_thi || nhanVien.ho_ten || email,
            email: email,
            vi_tri: viTriGoc, 
            role: roleChuan,  
            avatar_url: nhanVien.hinh_anh
        };
        
        localStorage.removeItem('LA_ADMIN_CUNG');
        localStorage.setItem('USER_INFO', JSON.stringify(userInfo));
        localStorage.setItem('USER_ROLE', roleChuan);

        // 🟢 5. ĐIỀU HƯỚNG CHÍNH XÁC (Dựa trên dữ liệu CSV thực tế)
        
        // ADMIN -> Phòng Admin
        if (roleChuan === 'admin' || roleChuan.includes('admin')) {
            nextPath = '/phongadmin';
        }
        // QUẢN LÝ ("Quản lý" -> "quanly") -> Phòng Quản Lý
        else if (roleChuan === 'quanly' || roleChuan.includes('quanly')) {
            nextPath = '/phongquanly';
        }
        // SALES ("sales" -> "sales") -> Phòng Sales
        else if (roleChuan === 'sales' || roleChuan.includes('sale') || roleChuan.includes('kinhdoanh')) {
            nextPath = '/phongsales';
        }
        // THỢ ("thosanxuat" -> "thosanxuat") -> Phòng Thợ
        else if (roleChuan === 'thosanxuat' || roleChuan.includes('tho') || roleChuan.includes('kythuat')) {
            nextPath = '/phongtho';
        }
        // PART-TIME (Nếu có) -> Phòng Parttime
        else if (roleChuan.includes('parttime') || roleChuan.includes('thoivu')) {
            nextPath = '/phongparttime';
        }
        // CTV ("congtacvien" -> "congtacvien") -> Phòng CTV
        else if (roleChuan === 'congtacvien' || roleChuan.includes('ctv')) {
            nextPath = '/phongctv';
        }
        else {
            nextPath = '/'; // Về trang chủ nếu role lạ
        }
        
        setTimeout(() => {
            router.replace(nextPath);
            if(onClose && !isGateKeeper) onClose();
        }, 150); 

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
  
  const handleSupport = () => alert("Vui lòng liên hệ Quản lý để được hỗ trợ.");

  return (
    <div className={`fixed inset-0 z-[9999] w-screen h-[100dvh] font-sans text-white overflow-hidden bg-black/90 backdrop-blur-sm`}>
      <div className="opacity-50"><NenHieuUng isModalMode={isModal} /></div>

      <div className={`relative w-full h-full transition-all duration-700 ease-out transform ${isModal ? (flags.anim ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-110') : 'opacity-100'}`}>
        
        {isModal && (
            <button onClick={handleClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 z-50 bg-black/20 rounded-full">
                <X size={32} strokeWidth={1.5} />
            </button>
        )}

        <form onSubmit={handleSubmit} className="w-full h-full flex flex-col justify-between items-center py-8 md:py-12">
            <div className="flex-none h-10 md:h-16" /> 
            <div className="flex-1 w-full max-w-[420px] flex flex-col justify-center px-8 gap-6 md:gap-8">
                <div className={`${isError ? 'animate-shake' : ''}`}><TieuDe /></div>
                
                <div className={`flex flex-col gap-5 ${isError ? 'animate-shake' : ''}`}>
                    <ONhapLieu id="inp_email" label="EMAIL" value={user.name} onChange={v => setUser(p => ({...p, name: v}))} />
                    
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
                    
                    <div className="flex flex-col gap-3 mt-1">
                        <div 
                            className="flex items-center gap-3 cursor-pointer group select-none"
                            onClick={() => setRememberMe(!rememberMe)}
                        >
                            <div className={`transition-colors ${rememberMe ? 'text-[#C69C6D]' : 'text-gray-600 group-hover:text-gray-400'}`}>
                                {rememberMe ? <CheckSquare size={18} /> : <Square size={18} />}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${rememberMe ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'}`}>
                                Ghi nhớ đăng nhập
                            </span>
                        </div>

                        <div 
                            className="flex items-center gap-3 cursor-pointer group select-none"
                            onClick={() => setWantFullScreen(!wantFullScreen)}
                        >
                            <div className={`transition-colors ${wantFullScreen ? 'text-yellow-500' : 'text-gray-600 group-hover:text-gray-400'}`}>
                                {wantFullScreen ? <CheckSquare size={18} /> : <Square size={18} />}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${wantFullScreen ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'}`}>
                                Tự động bật toàn màn hình
                            </span>
                        </div>
                    </div>

                    <ChanForm onSupportClick={handleSupport} />
                </div>
            </div>
            <div className="flex-none w-full flex justify-center pb-4 md:pb-8"><NutXacNhan isLoading={flags.loading} /></div>
        </form>

      </div>
      <style jsx global>{` @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } } .animate-shake { animation: shake 0.3s ease-in-out; } `}</style>
    </div>
  );
}