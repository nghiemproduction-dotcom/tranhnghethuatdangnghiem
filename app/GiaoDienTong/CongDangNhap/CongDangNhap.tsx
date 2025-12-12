'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../ThuVien/ketNoiSupabase'; 
import { X } from 'lucide-react';

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

  const isModal = typeof isOpen === 'boolean';
  
  useEffect(() => {
    if (isOpen) setTimeout(() => setFlags(p => ({...p, anim: true})), 50);
    else setFlags(p => ({...p, anim: false}));
  }, [isOpen]);

  if (isModal && !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlags(p => ({...p, loading: true})); setIsError(false);

    if (user.name === 'admin' && user.pass === 'admin') {
        if (typeof window !== 'undefined') localStorage.setItem('LA_ADMIN_CUNG', 'true');
        setTimeout(() => { router.replace('/phongdemo'); setFlags(p => ({...p, loading: false})); }, 800);
        return;
    }

    try {
        const { error } = await supabase.auth.signInWithPassword({ email: user.name.trim(), password: user.pass });
        if (error) throw error;
        localStorage.removeItem('LA_ADMIN_CUNG');
        router.replace('/'); router.refresh();
    } catch (err: any) { 
        setIsError(true); 
    } finally { 
        setFlags(p => ({...p, loading: false})); 
    }
  };

  const handleClose = () => { setFlags(p => ({...p, anim: false})); setTimeout(() => onClose && onClose(), 300); };
  
  const handleRegister = () => alert("Vui lòng liên hệ Admin để cấp tài khoản.");
  const handleForgot = () => alert("Vui lòng liên hệ Admin để cấp lại mật khẩu.");

  return (
    // KHUNG CHÍNH: Full màn hình, không cuộn
    <div className={`fixed inset-0 z-[9999] w-screen h-screen font-sans text-white overflow-hidden`}>
      
      <NenHieuUng isModalMode={isModal} />

      {/* HIỆU ỨNG XUẤT HIỆN */}
      <div className={`
          relative w-full h-full 
          transition-all duration-700 ease-out transform 
          ${isModal ? (flags.anim ? 'opacity-100 blur-0' : 'opacity-0 blur-xl scale-110') : 'opacity-100'}
      `}>
        
        {/* Nút đóng */}
        {isModal && (
            <button onClick={handleClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors p-4 z-50">
                <X size={40} strokeWidth={0.5} />
            </button>
        )}

        {/* FORM LÀM CONTAINER CHÍNH (Flex Column) */}
        <form onSubmit={handleSubmit} className="w-full h-full flex flex-col justify-between items-center">
            
            {/* PHẦN 1: KHOẢNG TRỐNG TRÊN (Để đẩy nội dung xuống) */}
            <div className="flex-none h-16 md:h-20" /> 

            {/* PHẦN 2: NỘI DUNG CHÍNH (Cân giữa phần không gian còn lại) */}
            {/* flex-1: Chiếm hết khoảng trống giữa -> Tự động căn giữa nội dung bên trong */}
            <div className="flex-1 w-full max-w-[400px] flex flex-col justify-center gap-6 px-6">
                
                {/* Tiêu đề & Logo */}
                <div className={isError ? 'animate-shake' : ''}>
                    <TieuDe />
                </div>

                {/* Các ô nhập liệu */}
                <div className={`flex flex-col gap-6 ${isError ? 'animate-shake' : ''}`}>
                    <ONhapLieu 
                        id="inp_email" label="EMAIL" 
                        value={user.name} onChange={v => setUser(p => ({...p, name: v}))} 
                    />
                    
                    <ONhapLieu 
                        id="inp_pass" label="PASSWORD" 
                        value={user.pass} onChange={v => setUser(p => ({...p, pass: v}))} 
                        showEye={true} isPasswordVisible={flags.showPass} onToggleEye={() => setFlags(p => ({...p, showPass: !p.showPass}))} 
                    />
                    
                    {/* Nút Đăng ký / Quên MK nằm ngay dưới ô nhập */}
                    <ChanForm onRegisterClick={handleRegister} onForgotPasswordClick={handleForgot} />
                </div>
            </div>

            {/* PHẦN 3: NÚT LOGIN (Nằm sát đáy) */}
            {/* pb-8: Cách đáy 1 chút */}
            <div className="flex-none w-full pb-8 md:pb-12 flex justify-center">
                 <NutXacNhan isLoading={flags.loading} />
            </div>

        </form>

      </div>

      <style jsx global>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}