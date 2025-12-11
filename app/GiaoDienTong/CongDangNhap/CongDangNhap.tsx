'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../ThuVien/ketNoiSupabase'; 
import { X } from 'lucide-react';

// IMPORT 7 ANH EM SIÊU NHÂN (Đã bao gồm NutXacNhan mới)
import NenHieuUng from './NenHieuUng';
import TieuDe from './TieuDe';
import ONhapLieu from './ONhapLieu';
import ThongBao from './ThongBao';
import ChanForm from './ChanForm';
import NutXacNhan from './NutXacNhan';

export default function CongDangNhap({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const router = useRouter();
  
  // State
  const [user, setUser] = useState({ name: '', pass: '' });
  const [flags, setFlags] = useState({ showPass: false, remember: false, isReg: false, loading: false, anim: false });
  const [msg, setMsg] = useState({ err: '', success: '' });

  const isModal = typeof isOpen === 'boolean';
  
  // Effect
  useEffect(() => {
    if (isOpen) setTimeout(() => setFlags(p => ({...p, anim: true})), 50);
    else setFlags(p => ({...p, anim: false}));

    const saved = typeof window !== 'undefined' ? localStorage.getItem('saved_email') : '';
    if (saved) { setUser(p => ({...p, name: saved})); setFlags(p => ({...p, remember: true})); }
  }, [isOpen]);

  if (isModal && !isOpen) return null;

  // Logic Xử Lý
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlags(p => ({...p, loading: true})); setMsg({err: '', success: ''});

    // 1. Cửa sau
    if (!flags.isReg && user.name === 'admin' && user.pass === 'admin') {
        if (typeof window !== 'undefined') localStorage.setItem('LA_ADMIN_CUNG', 'true');
        setTimeout(() => { router.replace('/phongdemo'); setFlags(p => ({...p, loading: false})); }, 800);
        return;
    }

    // 2. Supabase
    try {
        const { error } = flags.isReg 
            ? await supabase.auth.signUp({ email: user.name.trim(), password: user.pass })
            : await supabase.auth.signInWithPassword({ email: user.name.trim(), password: user.pass });
            
        if (error) throw error;

        if (flags.isReg) {
            setMsg(p => ({...p, success: 'Đăng ký thành công! Kiểm tra email.'}));
            setTimeout(() => { setFlags(p => ({...p, isReg: false})); setMsg(p => ({...p, success: ''})); }, 3000);
        } else {
            if (flags.remember) localStorage.setItem('saved_email', user.name.trim());
            else localStorage.removeItem('saved_email');
            localStorage.removeItem('LA_ADMIN_CUNG');
            router.replace('/'); router.refresh();
        }
    } catch (err: any) { setMsg(p => ({...p, err: 'Thông tin không chính xác.'})); } 
    finally { setFlags(p => ({...p, loading: false})); }
  };

  const handleClose = () => { setFlags(p => ({...p, anim: false})); setTimeout(() => onClose && onClose(), 300); };

  // Render Gọn Gàng
  return (
    <div className={`${isModal ? 'fixed inset-0 z-[999]' : 'min-h-screen'} flex items-center justify-center font-sans text-[#E5E5E5] overflow-hidden`}>
      <NenHieuUng isModalMode={isModal} />

      <div className={`relative w-full h-full md:h-auto md:max-w-4xl p-8 md:p-20 flex flex-col justify-center items-center gap-12 transition-all duration-700 ease-out transform ${isModal ? (flags.anim ? 'scale-100 opacity-100' : 'scale-90 opacity-0') : 'scale-100'}`}>
        
        {isModal && <button onClick={handleClose} className="fixed top-8 right-8 text-gray-500 hover:text-white z-50"><X size={32} /></button>}

        <TieuDe isRegistering={flags.isReg} />

        <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col gap-10">
          <ONhapLieu id="inp_email" label="Định danh" value={user.name} onChange={v => setUser(p => ({...p, name: v}))} />
          
          <ONhapLieu id="inp_pass" label="Mật mã" value={user.pass} onChange={v => setUser(p => ({...p, pass: v}))} 
             showEye={true} isPasswordVisible={flags.showPass} onToggleEye={() => setFlags(p => ({...p, showPass: !p.showPass}))} />

          <ChanForm isRegistering={flags.isReg} rememberMe={flags.remember} 
             onToggleRemember={() => setFlags(p => ({...p, remember: !p.remember}))}
             onToggleMode={() => { setFlags(p => ({...p, isReg: !p.isReg})); setMsg({err: '', success: ''}); }} />

          <ThongBao errorMsg={msg.err} successMsg={msg.success} />
          
          <NutXacNhan isLoading={flags.loading} isRegistering={flags.isReg} />
        </form>

        <div className="absolute bottom-8 text-center opacity-20"><p className="text-[10px] tracking-[0.5em] uppercase">Art Space Management System</p></div>
      </div>
    </div>
  );
}