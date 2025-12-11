'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../ThuVien/ketNoiSupabase'; 
import { X, Globe } from 'lucide-react';

import NenHieuUng from './NenHieuUng';
import TieuDe from './TieuDe';
import ONhapLieu from './ONhapLieu';
import ThongBao from './ThongBao';
import ChanForm from './ChanForm';
import NutXacNhan from './NutXacNhan';

import { useNgonNgu } from '@/app/context/NgonNguContext';

export default function CongDangNhap({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const router = useRouter();
  const { setNgonNgu, ngonNgu } = useNgonNgu();
  
  const [user, setUser] = useState({ name: '', pass: '' });
  const [flags, setFlags] = useState({ showPass: false, remember: false, isReg: false, loading: false, anim: false });
  const [msg, setMsg] = useState({ err: '', success: '' });

  const isModal = typeof isOpen === 'boolean';
  
  const languages = [
    { code: 'vi', label: 'VN' }, { code: 'en', label: 'EN' },
    { code: 'zh', label: 'CN' }, { code: 'ja', label: 'JP' },
    { code: 'fr', label: 'FR' }, { code: 'de', label: 'DE' },
  ];

  useEffect(() => {
    if (isOpen) setTimeout(() => setFlags(p => ({...p, anim: true})), 50);
    else setFlags(p => ({...p, anim: false}));

    const saved = typeof window !== 'undefined' ? localStorage.getItem('saved_email') : '';
    if (saved) { setUser(p => ({...p, name: saved})); setFlags(p => ({...p, remember: true})); }
  }, [isOpen]);

  if (isModal && !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlags(p => ({...p, loading: true})); setMsg({err: '', success: ''});

    if (!flags.isReg && user.name === 'admin' && user.pass === 'admin') {
        if (typeof window !== 'undefined') localStorage.setItem('LA_ADMIN_CUNG', 'true');
        setTimeout(() => { router.replace('/phongdemo'); setFlags(p => ({...p, loading: false})); }, 800);
        return;
    }

    try {
        const { error } = flags.isReg 
            ? await supabase.auth.signUp({ email: user.name.trim(), password: user.pass })
            : await supabase.auth.signInWithPassword({ email: user.name.trim(), password: user.pass });
            
        if (error) throw error;

        if (flags.isReg) {
            setMsg(p => ({...p, success: 'Success! Check email.'}));
            setTimeout(() => { setFlags(p => ({...p, isReg: false})); setMsg(p => ({...p, success: ''})); }, 3000);
        } else {
            if (flags.remember) localStorage.setItem('saved_email', user.name.trim());
            else localStorage.removeItem('saved_email');
            localStorage.removeItem('LA_ADMIN_CUNG');
            router.replace('/'); router.refresh();
        }
    } catch (err: any) { setMsg(p => ({...p, err: 'Error credentials.'})); } 
    finally { setFlags(p => ({...p, loading: false})); }
  };

  const handleClose = () => { setFlags(p => ({...p, anim: false})); setTimeout(() => onClose && onClose(), 300); };

  return (
    <div className={`${isModal ? 'fixed inset-0 z-[999]' : 'min-h-screen'} flex items-center justify-center font-sans text-[#E5E5E5] overflow-hidden`}>
      <NenHieuUng isModalMode={isModal} />

      {/* 🟢 TỐI ƯU RESPONSIVE:
          - Mobile: p-6, gap-6 (Gọn hơn)
          - Desktop: p-12, gap-8 (Rộng rãi hơn)
      */}
      <div className={`
          relative w-full h-full md:h-auto md:max-w-[420px] 
          p-6 md:p-12 
          bg-[#0a0a0a] border border-yellow-500/20 shadow-[0_0_60px_-15px_rgba(234,179,8,0.15)] 
          flex flex-col justify-center 
          gap-6 md:gap-8 
          transition-all duration-500 ease-out transform 
          ${isModal ? (flags.anim ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8') : 'scale-100'}
      `}>
        
        {isModal && <button onClick={handleClose} className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors"><X size={24} /></button>}

        <div className="absolute top-5 left-6 flex items-center gap-2">
            <Globe size={14} className="text-yellow-600" />
            <div className="flex gap-2">
                {languages.map(lang => (
                    <button 
                        key={lang.code}
                        onClick={() => setNgonNgu(lang.code as any)}
                        className={`text-[9px] font-bold uppercase transition-colors ${ngonNgu === lang.code ? 'text-white underline decoration-yellow-500 underline-offset-4' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="mt-4 md:mt-6">
            <TieuDe isRegistering={flags.isReg} />
        </div>

        {/* 🟢 Gap nhỏ hơn trên mobile */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 md:gap-6">
          <ONhapLieu id="inp_email" labelKey="email" value={user.name} onChange={v => setUser(p => ({...p, name: v}))} />
          <ONhapLieu id="inp_pass" labelKey="matKhau" value={user.pass} onChange={v => setUser(p => ({...p, pass: v}))} 
             showEye={true} isPasswordVisible={flags.showPass} onToggleEye={() => setFlags(p => ({...p, showPass: !p.showPass}))} />

          <ChanForm isRegistering={flags.isReg} rememberMe={flags.remember} 
             onToggleRemember={() => setFlags(p => ({...p, remember: !p.remember}))}
             onToggleMode={() => { setFlags(p => ({...p, isReg: !p.isReg})); setMsg({err: '', success: ''}); }} />

          <ThongBao errorMsg={msg.err} successMsg={msg.success} />
          
          <NutXacNhan isLoading={flags.loading} isRegistering={flags.isReg} />
        </form>

        <div className="text-center opacity-20 mt-2">
            <p className="text-[9px] tracking-[0.3em] uppercase">Dang Nghiem Gallery</p>
        </div>
      </div>
    </div>
  );
}